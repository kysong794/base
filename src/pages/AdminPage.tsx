
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
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
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
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 h-full">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">총 게시글 수</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats?.totalPosts.toLocaleString()}</p>
                    </div>
                );
            case 'stat-member':
                return (
                    <div className="bg-green-50 p-6 rounded-lg border border-green-100 h-full">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">총 회원 수</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats?.totalMembers.toLocaleString()}</p>
                    </div>
                );
            case 'chart-post':
                return (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full">
                        <h3 className="text-lg font-semibold mb-4 text-center">일별 게시글 작성 추이 (최근 30일)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.dailyPostCounts}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" name="게시글 수" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            case 'chart-member':
                return (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full">
                        <h3 className="text-lg font-semibold mb-4 text-center">일별 신규 가입자 추이 (최근 30일)</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats?.dailyMemberCounts}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" name="가입자 수" stroke="#10b981" strokeWidth={2} />
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

    if (isCategoriesLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6">관리자 대시보드</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'dashboard'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        } `}
                >
                    <LayoutDashboard size={18} />
                    대시보드
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'categories'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        } `}
                >
                    <FolderTree size={18} />
                    카테고리 관리
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'users'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        } `}
                >
                    <Users size={18} />
                    회원 관리
                </button>
                <button
                    onClick={() => setActiveTab('kanban')}
                    className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'kanban'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        } `}
                >
                    <Kanban size={18} />
                    칸반 보드
                </button>
            </div>




            {/* Content */}
            {activeTab === 'dashboard' ? (
                <div>
                    {isStatsLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                                <GripVertical className="inline align-middle mr-1" size={16} />
                                위젯을 드래그하여 순서를 변경할 수 있습니다. (설정은 브라우저에 저장됩니다)
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
                                                                    className="absolute top-2 right-2 text-gray-300 hover:text-gray-500 z-10 p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <div>
                        <h2 className="text-lg font-semibold mb-3">새 카테고리 추가</h2>
                        <form onSubmit={handleCreate} className="flex gap-2">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="새 카테고리 이름"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Plus size={18} />
                                추가
                            </button>
                        </form>
                    </div>

                    {/* 카테고리 게시글 이동 */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <h2 className="text-lg font-semibold mb-3 text-yellow-800">카테고리 게시글 이동</h2>
                        <p className="text-sm text-yellow-700 mb-4">
                            카테고리를 삭제하기 전, 해당 카테고리의 모든 게시글을 다른 카테고리로 이동시킬 수 있습니다.
                        </p>
                        <div className="flex items-center gap-2">
                            <select
                                value={migrationFrom}
                                onChange={(e) => setMigrationFrom(e.target.value === '' ? '' : Number(e.target.value))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="">이동 전 카테고리</option>
                                {categories?.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>

                            <ArrowRight className="text-gray-400" />

                            <select
                                value={migrationTo}
                                onChange={(e) => setMigrationTo(e.target.value === '' ? '' : Number(e.target.value))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="">이동 후 카테고리</option>
                                {categories?.map((c) => (
                                    <option key={c.id} value={c.id} disabled={c.id === migrationFrom}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleMigrate}
                                disabled={migrateMutation.isPending || migrationFrom === '' || migrationTo === ''}
                                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 whitespace-nowrap"
                            >
                                게시글 이동
                            </button>
                        </div>
                    </div>

                    {/* 카테고리 목록 (Drag & Drop) */}
                    <div>
                        <h2 className="text-lg font-semibold mb-3">카테고리 목록</h2>
                        <p className="text-sm text-gray-500 mb-3">
                            <GripVertical className="inline align-middle mr-1" size={16} />
                            아이콘을 잡고 드래그하여 순서를 변경할 수 있습니다.
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
                                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100 group hover:border-blue-300 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                                                                <GripVertical size={20} />
                                                            </div>
                                                            <span className="font-medium text-gray-700">{category.name}</span>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`${category.name} 카테고리를 삭제하시겠습니까 ? `)) {
                                                                    deleteMutation.mutate(category.id);
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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
                            <Loader2 className="animate-spin text-blue-600" size={32} />
                        </div>
                    ) : (
                        <div
                            className={`overflow-x-auto ${userTableEvents.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                            ref={userTableRef}
                            {...userTableEvents}
                        >
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">닉네임</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {members?.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.nickname}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                    } `}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(member.createdAt), 'yyyy-MM-dd')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleRoleChange(member.id, member.role)}
                                                    disabled={member.email === currentUser?.email}
                                                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs text-white ${member.role === 'ADMIN'
                                                        ? 'bg-gray-500 hover:bg-gray-600'
                                                        : 'bg-blue-600 hover:bg-blue-700'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {member.role === 'ADMIN' ? (
                                                        <>
                                                            <User size={14} /> 강등
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield size={14} /> 승격
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
        // In a real app, calculate exact new displayOrder based on surrounding items.
        // For simplicity, we just assign a high number or we need list access to re-index.
        // Let's implement simple optimistic rendering later, for now just API call.

        moveMutation.mutate({
            id: taskId,
            data: {
                status: newStatus,
                displayOrder: destination.index + 1 // Simply using index + 1
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

    if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline text-blue-600" /></div>;

    const columns: { id: TaskStatus; title: string; bg: string }[] = [
        { id: 'TODO', title: '할 일', bg: 'bg-gray-100' },
        { id: 'IN_PROGRESS', title: '진행 중', bg: 'bg-blue-50' },
        { id: 'DONE', title: '완료', bg: 'bg-green-50' },
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
                    placeholder="새로운 할 일을 입력하세요"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" disabled={createMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    추가
                </button>
            </form>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map(col => (
                        <div key={col.id} className={`p-4 rounded-lg ${col.bg} min-h-[300px]`}>
                            <h3 className="font-semibold mb-3 text-gray-700 flex justify-between">
                                {col.title}
                                <span className="bg-white px-2 py-0.5 rounded text-sm text-gray-500 border border-gray-200">
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
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative"
                                                    >
                                                        <p className="text-gray-800 pr-6">{task.content}</p>
                                                        <button
                                                            onClick={() => deleteMutation.mutate(task.id)}
                                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={16} />
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
