
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMembers, updateMemberRole } from '../api/members';
import { getCategories, createCategory, deleteCategory, reorderCategories, migrateCategoryPosts } from '../api/categories';
import { getStats } from '../api/statistics';
import { getMyTasks, createTask, deleteTask, moveTask } from '../api/tasks';
import type { TaskStatus } from '../api/tasks';
import useDraggableScroll from '../hooks/useDraggableScroll';
import { useAuthStore } from '../store/useAuthStore';
import { User, Shield, Loader2, GripVertical, Trash2, Plus, ArrowRight, LayoutDashboard, Users, Kanban, FolderTree } from 'lucide-react';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

type Tab = 'dashboard' | 'categories' | 'users' | 'kanban';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    // Draggable Scroll
    const { ref: userTableRef, ...userTableEvents } = useDraggableScroll<HTMLDivElement>();

    // Category State
    const [newCategory, setNewCategory] = useState('');
    const [migrationFrom, setMigrationFrom] = useState<number | ''>('');
    const [migrationTo, setMigrationTo] = useState<number | ''>('');

    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    // Queries
    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const { data: members, isLoading: isMembersLoading } = useQuery({
        queryKey: ['members'],
        queryFn: getMembers,
        enabled: activeTab === 'users',
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: getStats,
        enabled: activeTab === 'dashboard',
    });

    // Category Mutations
    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setNewCategory('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: (error: any) => {
            if (error.response?.status === 409) {
                alert('게시글이 있는 카테고리는 삭제할 수 없습니다. \n아래 "카테고리 게시글 이동" 기능을 사용하여 게시글을 이동시킨 후 삭제해주세요.');
            } else {
                alert('삭제 중 오류가 발생했습니다.');
            }
        }
    });

    const migrateMutation = useMutation({
        mutationFn: migrateCategoryPosts,
        onSuccess: () => {
            alert('게시글 이동이 완료되었습니다.');
            setMigrationFrom('');
            setMigrationTo('');
        },
        onError: () => {
            alert('게시글 이동 중 오류가 발생했습니다.');
        }
    });

    const reorderMutation = useMutation({
        mutationFn: reorderCategories,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: () => {
            alert('순서 변경 중 오류가 발생했습니다.');
        }
    });

    // Member Mutation
    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }: { id: number, role: 'USER' | 'ADMIN' }) => updateMemberRole(id, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
            alert('권한이 변경되었습니다.');
        },
        onError: () => {
            alert('권한 변경 중 오류가 발생했습니다.');
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            createMutation.mutate({ name: newCategory });
        }
    };

    const handleMigrate = () => {
        if (migrationFrom === '' || migrationTo === '') return;
        if (migrationFrom === migrationTo) {
            alert('이동할 카테고리는 현재 카테고리와 달라야 합니다.');
            return;
        }
        if (window.confirm('정말로 게시글을 이동하시겠습니까?')) {
            migrateMutation.mutate({
                fromId: Number(migrationFrom),
                targetId: Number(migrationTo)
            });
        }
    };

    const handleRoleChange = (memberId: number, currentRole: 'USER' | 'ADMIN') => {
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        if (window.confirm(`해당 사용자의 권한을 ${newRole}로 변경하시겠습니까 ? `)) {
            updateRoleMutation.mutate({ id: memberId, role: newRole });
        }
    };


    // Dashboard Layout State
    const defaultWidgets = ['stat-post', 'stat-member', 'chart-post', 'chart-member'];
    const [dashboardLayout, setDashboardLayout] = useState<string[]>(() => {
        const saved = localStorage.getItem('dashboard-layout');
        return saved ? JSON.parse(saved) : defaultWidgets;
    });

    const handleDashboardDragEnd = (result: any) => {
        if (!result.destination) return;
        const items = Array.from(dashboardLayout);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setDashboardLayout(items);
        localStorage.setItem('dashboard-layout', JSON.stringify(items));
    };

    const renderWidget = (widgetId: string) => {
        switch (widgetId) {
            case 'stat-post':
                return (
                    <div className="bg-cyan/5 p-6 rounded-lg border border-cyan/20 h-full">
                        <h3 className="text-cyan-dim text-sm font-bold mb-2 tracking-wider">TOTAL POSTS</h3>
                        <p className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(102,252,241,0.5)]">{stats?.totalPosts.toLocaleString()}</p>
                    </div>
                );
            case 'stat-member':
                return (
                    <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-500/30 h-full">
                        <h3 className="text-purple-300 text-sm font-bold mb-2 tracking-wider">TOTAL MEMBERS</h3>
                        <p className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">{stats?.totalMembers.toLocaleString()}</p>
                    </div>
                );
            case 'chart-post':
                return (
                    <div className="glass p-4 rounded-lg border border-white/5 shadow-sm h-full">
                        <h3 className="text-sm font-bold mb-6 text-center text-gray-300">DAILY POSTS (30 DAYS)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.dailyPostCounts}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} stroke="#444" />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#666' }} stroke="#444" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#333', color: '#fff' }}
                                        itemStyle={{ color: '#66FCF1' }}
                                    />
                                    <Bar dataKey="count" name="Posts" fill="#66FCF1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            case 'chart-member':
                return (
                    <div className="glass p-4 rounded-lg border border-white/5 shadow-sm h-full">
                        <h3 className="text-sm font-bold mb-6 text-center text-gray-300">DAILY JOINS (30 DAYS)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats?.dailyMemberCounts}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} stroke="#444" />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#666' }} stroke="#444" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0B0C10', borderColor: '#333', color: '#fff' }}
                                        itemStyle={{ color: '#a855f7' }}
                                    />
                                    <Line type="monotone" dataKey="count" name="Members" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getWidgetClass = (_widgetId: string) => {
        return "h-full";
    };

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(categories || []);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Optimistic update
        queryClient.setQueryData(['categories'], items);

        // API call
        reorderMutation.mutate(items.map(c => c.id));
    };

    // ... inside return ...

    if (isCategoriesLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-cyan" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 glass rounded-xl border border-white/5">
            <h1 className="text-3xl font-bold mb-8 text-white tracking-tight drop-shadow-md">SYSTEM ADMIN // DASHBOARD</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-5 py-2 font-bold text-sm flex items-center gap-2 rounded-t-lg transition-all ${activeTab === 'dashboard'
                        ? 'bg-cyan/10 text-cyan border-b-2 border-cyan'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                        } `}
                >
                    <LayoutDashboard size={18} />
                    DASHBOARD
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-5 py-2 font-bold text-sm flex items-center gap-2 rounded-t-lg transition-all ${activeTab === 'categories'
                        ? 'bg-cyan/10 text-cyan border-b-2 border-cyan'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                        } `}
                >
                    <FolderTree size={18} />
                    CATEGORIES
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-5 py-2 font-bold text-sm flex items-center gap-2 rounded-t-lg transition-all ${activeTab === 'users'
                        ? 'bg-cyan/10 text-cyan border-b-2 border-cyan'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                        } `}
                >
                    <Users size={18} />
                    USERS
                </button>
                <button
                    onClick={() => setActiveTab('kanban')}
                    className={`px-5 py-2 font-bold text-sm flex items-center gap-2 rounded-t-lg transition-all ${activeTab === 'kanban'
                        ? 'bg-cyan/10 text-cyan border-b-2 border-cyan'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                        } `}
                >
                    <Kanban size={18} />
                    KANBAN
                </button>
            </div>

            {/* Content */}
            {activeTab === 'dashboard' ? (
                <div>
                    {isStatsLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-cyan" size={32} />
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs text-cyan-dim mb-4 p-2 rounded border border-cyan-dim/20 bg-cyan-dim/5 inline-flex items-center gap-2">
                                <GripVertical className="inline align-middle" size={14} />
                                DRAG TO REORDER WIDGETS
                            </p>
                            <DragDropContext onDragEnd={handleDashboardDragEnd}>
                                <Droppable droppableId="dashboard" direction="horizontal">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            {dashboardLayout.map((widgetId, index) => (
                                                <Draggable key={widgetId} draggableId={widgetId} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={getWidgetClass(widgetId)}
                                                        >
                                                            <div className="h-full relative group">
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="absolute top-2 right-2 text-gray-500 hover:text-cyan z-10 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <GripVertical size={20} />
                                                                </div>
                                                                {renderWidget(widgetId)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    )}
                </div>
            ) : activeTab === 'categories' ? (
                <div className="space-y-8">
                    {/* 카테고리 추가 */}
                    <div className="glass p-6 rounded-lg">
                        <h2 className="text-lg font-bold text-white mb-4">ADD CATEGORY</h2>
                        <form onSubmit={handleCreate} className="flex gap-2">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="CATEGORY NAME"
                                className="flex-1 input-cyber px-4 py-2 rounded text-sm"
                            />
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="btn-cyber px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
                            >
                                <Plus size={18} />
                                ADD
                            </button>
                        </form>
                    </div>

                    {/* 카테고리 게시글 이동 */}
                    <div className="p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                        <h2 className="text-lg font-bold text-yellow-500 mb-3">MIGRATE POSTS</h2>
                        <p className="text-sm text-yellow-200/70 mb-5">
                            Before deleting a category, migrate all contained posts to another category.
                        </p>
                        <div className="flex items-center gap-3">
                            <select
                                value={migrationFrom}
                                onChange={(e) => setMigrationFrom(e.target.value === '' ? '' : Number(e.target.value))}
                                className="flex-1 input-cyber px-3 py-2 rounded text-sm bg-void"
                            >
                                <option value="">SOURCE CATEGORY</option>
                                {categories?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <ArrowRight className="text-gray-500" />

                            <select
                                value={migrationTo}
                                onChange={(e) => setMigrationTo(e.target.value === '' ? '' : Number(e.target.value))}
                                className="flex-1 input-cyber px-3 py-2 rounded text-sm bg-void"
                            >
                                <option value="">TARGET CATEGORY</option>
                                {categories?.map((c) => (
                                    <option key={c.id} value={c.id} disabled={c.id === migrationFrom}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleMigrate}
                                disabled={migrateMutation.isPending || migrationFrom === '' || migrationTo === ''}
                                className="px-4 py-2 rounded text-sm font-bold bg-yellow-600/20 text-yellow-500 border border-yellow-500/50 hover:bg-yellow-600/30 transition shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                            >
                                MIGRATE
                            </button>
                        </div>
                    </div>

                    {/* 카테고리 목록 (Drag & Drop) */}
                    <div>
                        <h2 className="text-lg font-bold text-white mb-4">CATEGORY LIST</h2>
                        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <GripVertical size={14} />
                            DRAG TO REORDER
                        </p>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="categories">
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-2"
                                    >
                                        {categories?.map((category, index) => (
                                            <Draggable key={category.id} draggableId={String(category.id)} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className="flex justify-between items-center p-3 glass rounded border border-white/5 group hover:border-cyan/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div {...provided.dragHandleProps} className="text-gray-600 hover:text-cyan cursor-grab active:cursor-grabbing">
                                                                <GripVertical size={20} />
                                                            </div>
                                                            <span className="font-bold text-gray-300 group-hover:text-white transition-colors">{category.name}</span>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Delete category "${category.name}"?`)) {
                                                                    deleteMutation.mutate(category.id);
                                                                }
                                                            }}
                                                            className="text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </div>
            ) : activeTab === 'kanban' ? (
                <KanbanBoard />
            ) : (
                // Users Management Tab
                <div>
                    {isMembersLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-cyan" size={32} />
                        </div>
                    ) : (
                        <div
                            className={`overflow-x-auto rounded-lg border border-white/10 ${userTableEvents.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            ref={userTableRef}
                            {...userTableEvents}
                        >
                            <table className="min-w-full divide-y divide-white/10">
                                <thead className="bg-surface">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">EMAIL</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">NICKNAME</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ROLE</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">JOINED</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-void/30 divide-y divide-white/5">
                                    {members?.map((member) => (
                                        <tr key={member.id} className="hover:bg-cyan/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{member.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-300">{member.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{member.nickname}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded border ${member.role === 'ADMIN' ? 'border-cyan text-cyan bg-cyan/10' : 'border-gray-600 text-gray-400 bg-gray-800'
                                                    } `}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {format(new Date(member.createdAt), 'yyyy-MM-dd')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleRoleChange(member.id, member.role)}
                                                    disabled={member.email === currentUser?.email}
                                                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-bold transition-all ${member.role === 'ADMIN'
                                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                        : 'bg-cyan/20 text-cyan border border-cyan/50 hover:bg-cyan/30'
                                                        } disabled:opacity-30 disabled:cursor-not-allowed`}
                                                >
                                                    {member.role === 'ADMIN' ? (
                                                        <>
                                                            <User size={14} /> DEMOTE
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield size={14} /> PROMOTE
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ... renderWidget function update needed as well for Chart colors ...
// ... KanbanBoard styling update ...


// Kanban Board Component

const KanbanBoard = () => {
    const queryClient = useQueryClient();
    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: getMyTasks
    });

    const createMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    const moveMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: { status: TaskStatus; displayOrder: number } }) =>
            moveTask(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    // Optimistic Update for DnD
    const onDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const taskId = Number(draggableId);
        const newStatus = destination.droppableId as TaskStatus;

        moveMutation.mutate({
            id: taskId,
            data: {
                status: newStatus,
                displayOrder: destination.index + 1
            }
        });
    };

    const [newItemContent, setNewItemContent] = useState('');
    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemContent.trim()) return;
        createMutation.mutate({ content: newItemContent, status: 'TODO' });
        setNewItemContent('');
    };

    if (isLoading) return <div className="p-8 text-center text-cyan"><Loader2 className="animate-spin inline" /></div>;

    const columns: { id: TaskStatus; title: string; bg: string; borderColor: string }[] = [
        { id: 'TODO', title: 'TO DO', bg: 'bg-white/5', borderColor: 'border-white/10' },
        { id: 'IN_PROGRESS', title: 'IN PROGRESS', bg: 'bg-cyan/5', borderColor: 'border-cyan/30' },
        { id: 'DONE', title: 'DONE', bg: 'bg-green-900/10', borderColor: 'border-green-500/30' },
    ];

    const getTasksByStatus = (status: TaskStatus) => {
        return tasks?.filter(t => t.status === status).sort((a, b) => a.displayOrder - b.displayOrder) || [];
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleCreate} className="flex gap-2">
                <input
                    type="text"
                    value={newItemContent}
                    onChange={(e) => setNewItemContent(e.target.value)}
                    placeholder="NEW TASK..."
                    className="flex-1 input-cyber px-4 py-2 rounded text-sm"
                />
                <button type="submit" disabled={createMutation.isPending} className="btn-cyber px-4 py-2 rounded text-sm font-bold">
                    ADD TASK
                </button>
            </form>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map(col => (
                        <div key={col.id} className={`p-4 rounded-lg ${col.bg} border ${col.borderColor} min-h-[300px]`}>
                            <h3 className="font-bold mb-4 text-gray-300 flex justify-between items-center tracking-wider text-sm">
                                {col.title}
                                <span className="bg-void px-2 py-0.5 rounded text-xs text-gray-400 border border-white/10 font-mono">
                                    {getTasksByStatus(col.id).length}
                                </span>
                            </h3>
                            <Droppable droppableId={col.id}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="space-y-3 min-h-[200px]"
                                    >
                                        {getTasksByStatus(col.id).map((task, index) => (
                                            <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-surface p-4 rounded border border-white/5 shadow-lg group relative transition-all ${snapshot.isDragging ? 'border-cyan shadow-[0_0_15px_rgba(102,252,241,0.3)] z-50' : 'hover:border-white/20'}`}
                                                    >
                                                        <p className="text-gray-300 pr-6 text-sm">{task.content}</p>
                                                        <button
                                                            onClick={() => deleteMutation.mutate(task.id)}
                                                            className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};
