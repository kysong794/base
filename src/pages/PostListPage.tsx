import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, deletePost, bulkUpdatePostCategory, togglePin } from '../api/posts';
import { getCategories } from '../api/categories';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { format } from 'date-fns';
import { Trash2, Edit2, Shield, FolderInput, Pin, PinOff, Crosshair, Target, Disc } from 'lucide-react';
import useDraggableScroll from '../hooks/useDraggableScroll';

export default function PostListPage() {
    // ... state ...
    // (Keeping existing state logic)
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Number(searchParams.get('page')) || 0;
    const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;

    const { user, isAdmin } = useAuthStore();
    const queryClient = useQueryClient();

    // Draggable Scroll
    const { ref: scrollRef, ...scrollEvents } = useDraggableScroll<HTMLDivElement>();

    // Selection State
    const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
    const [isMoveMode, setIsMoveMode] = useState(false);
    const [targetCategoryId, setTargetCategoryId] = useState<number | ''>('');

    // Search State
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');

    const { data: postsData } = useQuery({
        queryKey: ['posts', page, categoryId, searchQuery],
        queryFn: () => getPosts(page, 10, categoryId, searchQuery),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery(keyword);
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            if (keyword) {
                newParams.set('keyword', keyword);
            } else {
                newParams.delete('keyword');
            }
            newParams.set('page', '0'); // Reset page on search
            return newParams;
        });
    };

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });

    // Bulk Update Mutation
    const bulkUpdateMutation = useMutation({
        mutationFn: bulkUpdatePostCategory,
        onSuccess: () => {
            alert('게시글 이동이 완료되었습니다.');
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            setSelectedPosts([]);
            setIsMoveMode(false);
            setTargetCategoryId('');
        },
        onError: () => {
            alert('게시글 이동 중 오류가 발생했습니다.');
        }
    });

    // Mutation for Pin toggle
    const togglePinMutation = useMutation({
        mutationFn: togglePin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: () => {
            alert('고정 상태 변경 중 오류가 발생했습니다.');
        }
    });

    // Reset selection when page or category changes
    useEffect(() => {
        setSelectedPosts([]);
    }, [page, categoryId]);

    const handleSelectPost = (postId: number) => {
        setSelectedPosts(prev =>
            prev.includes(postId)
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );
    };

    const handleSelectAll = () => {
        if (!postsData) return;
        if (selectedPosts.length === postsData.content.length) {
            setSelectedPosts([]);
        } else {
            setSelectedPosts(postsData.content.map(post => post.id));
        }
    };

    const handleBulkMove = () => {
        if (selectedPosts.length === 0) {
            alert('선택된 게시글이 없습니다.');
            return;
        }
        if (targetCategoryId === '') {
            alert('이동할 카테고리를 선택해주세요.');
            return;
        }
        if (window.confirm(`선택한 ${selectedPosts.length}개의 게시글을 이동하시겠습니까 ? `)) {
            bulkUpdateMutation.mutate({
                postIds: selectedPosts,
                categoryId: Number(targetCategoryId)
            });
        }
    };

    const handlePinToggle = (e: React.MouseEvent, postId: number) => {
        e.stopPropagation(); // Prevent row click navigation if it were present
        if (window.confirm('게시글 고정 상태를 변경하시겠습니까?')) {
            togglePinMutation.mutate(postId);
        }
    };

    return (
        <div className="max-w-5xl mx-auto min-h-screen p-4 md:p-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b-2 border-gn/30 pb-6 gap-4 relative">
                {/* Decorative Corner */}
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gn"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gn"></div>

                <div className="flex items-center gap-4">
                    <Target className="text-gn animate-spin-slow" size={40} strokeWidth={1} />
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-[0.2em] mb-1 drop-shadow-md uppercase flex items-center gap-2">
                            MISSION LIST
                        </h1>
                        <p className="text-gn-dim text-xs tracking-widest font-mono">
                            TACTICAL DATA LINK // ESTABLISHED
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 relative">
                        {/* Search Input Decoration */}
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Crosshair size={14} className="text-gn-dim" />
                        </div>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="SEARCH TARGET..."
                            className="input-cyber pl-10 px-3 py-2 rounded text-sm w-48 md:w-60 bg-surface/50 border-gn/30 focus:border-gn"
                        />
                        <button type="submit" className="btn-cyber px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                            <Disc size={16} className="animate-spin" />
                            SCAN
                        </button>
                    </form>

                    {isAdmin() && (
                        <Link to="/admin" className="btn-cyber px-4 py-2 rounded text-sm font-bold flex items-center gap-2 border-solar text-solar hover:bg-solar/10">
                            <Shield size={16} />
                            ADMIN
                        </Link>
                    )}
                    <Link to="/posts/new" className="btn-cyber-primary px-6 py-2 rounded text-sm font-bold shadow-[0_0_10px_rgba(94,252,141,0.3)] clip-path-slant">
                        NEW ENTRY
                    </Link>
                </div>
            </div>

            {/* Category Tabs */}
            <div
                className={`flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide ${scrollEvents.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                ref={scrollRef}
                {...scrollEvents}
            >
                <button
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap shrink-0 ${!categoryId
                        ? 'bg-cyan text-void border-cyan shadow-[0_0_10px_rgba(102,252,241,0.4)]'
                        : 'bg-surface text-gray-400 hover:text-white border-white/10 hover:border-cyan/50'
                        }`}
                    onClick={() => setSearchParams({ page: '0' })}
                >
                    전체
                </button>
                {categories?.map((category) => (
                    <button
                        key={category.id}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap shrink-0 ${Number(categoryId) === category.id
                            ? 'bg-cyan text-void border-cyan shadow-[0_0_10px_rgba(102,252,241,0.4)]'
                            : 'bg-surface text-gray-400 hover:text-white border-white/10 hover:border-cyan/50'
                            }`}
                        onClick={() => setSearchParams({ page: '0', categoryId: String(category.id) })}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Admin Bulk Actions */}
            {isAdmin() && (
                <div className="mb-6 bg-surface/30 p-4 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={postsData && postsData.content.length > 0 && selectedPosts.length === postsData.content.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 rounded border-gray-500 bg-void text-cyan focus:ring-cyan"
                            />
                            <span className="text-xs text-gray-400 font-bold">전체 선택 ({selectedPosts.length})</span>
                        </label>
                    </div>

                    <div className="flex items-center gap-2">
                        {isMoveMode ? (
                            <>
                                <select
                                    value={targetCategoryId}
                                    onChange={(e) => setTargetCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="px-3 py-1.5 bg-void border border-cyan/30 rounded text-sm text-white focus:outline-none focus:border-cyan"
                                >
                                    <option value="">카테고리 선택</option>
                                    {categories?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleBulkMove}
                                    className="btn-cyber px-4 py-1.5 rounded text-xs font-bold"
                                >
                                    확인
                                </button>
                                <button
                                    onClick={() => { setIsMoveMode(false); setTargetCategoryId(''); }}
                                    className="px-4 py-1.5 text-gray-400 hover:text-white text-xs font-bold"
                                >
                                    취소
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsMoveMode(true)}
                                disabled={selectedPosts.length === 0}
                                className="flex items-center gap-2 btn-cyber px-4 py-1.5 rounded text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <FolderInput size={14} />
                                선택 이동
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {postsData?.content.map((post) => (
                    <div
                        key={post.id}
                        className={`glass p-6 rounded-none relative overflow-hidden transition-all duration-300 group
                            border-l-4 border-r-4 ${post.pinned
                                ? 'border-l-solar border-r-solar bg-solar/5 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                                : 'border-l-gn/50 border-r-gn/50 border-y border-y-gn/10 hover:border-gn hover:bg-gn/5'
                            }`}
                    >
                        {/* Corner Brackets */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gn opacity-50 group-hover:opacity-100"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gn opacity-50 group-hover:opacity-100"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gn opacity-50 group-hover:opacity-100"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gn opacity-50 group-hover:opacity-100"></div>
                        {/* Pinned Indicator Background Effect */}
                        {post.pinned && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                        )}

                        <div className="flex items-start gap-4 relative z-10">
                            {isAdmin() && (
                                <div className="flex flex-col gap-2 mt-1">
                                    <input
                                        type="checkbox"
                                        checked={selectedPosts.includes(post.id)}
                                        onChange={() => handleSelectPost(post.id)}
                                        className="w-4 h-4 rounded border-gray-600 bg-void text-cyan focus:ring-cyan"
                                    />
                                    <button
                                        onClick={(e) => handlePinToggle(e, post.id)}
                                        className={`p-1.5 rounded hover:bg-white/5 transition-colors ${post.pinned ? 'text-cyan drop-shadow-[0_0_5px_rgba(102,252,241,0.8)]' : 'text-gray-600 hover:text-cyan-dim'}`}
                                        title={post.pinned ? "고정 해제" : "상단 고정"}
                                    >
                                        {post.pinned ? <Pin size={16} fill="currentColor" /> : <PinOff size={16} />}
                                    </button>
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    {post.pinned && (
                                        <span className="bg-cyan/20 text-cyan text-[10px] font-bold px-2 py-0.5 rounded border border-cyan/30 flex items-center gap-1 shadow-[0_0_10px_rgba(102,252,241,0.2)]">
                                            <Pin size={10} fill="currentColor" /> 공지
                                        </span>
                                    )}
                                    {post.category && (
                                        <span className="bg-white/5 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                                            {post.category}
                                        </span>
                                    )}
                                    <span className="text-gray-500 text-xs font-mono ml-auto">
                                        {format(new Date(post.createdAt), 'yyyy-MM-dd HH:mm')}
                                    </span>
                                </div>

                                <Link to={`/posts/${post.id}`} className="block group-hover:translate-x-1 transition-transform duration-300">
                                    <h3 className={`text-xl font-bold mb-2 transition-colors ${post.pinned ? 'text-cyan text-2xl' : 'text-white group-hover:text-cyan'}`}>
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed font-light">
                                        {post.content}
                                    </p>
                                </Link>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                    <span className="text-gray-500 text-xs font-bold">
                                        작성자: {post.author}
                                    </span>

                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {(user?.email === post.memberEmail || isAdmin()) && (
                                            <>
                                                <Link to={`/posts/${post.id}/edit`} className="text-gray-500 hover:text-cyan transition-colors">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('정말 삭제하시겠습니까?')) {
                                                            deleteMutation.mutate(post.id);
                                                        }
                                                    }}
                                                    className="text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination UI */}
            <div className="flex justify-center mt-10 gap-2">
                <button
                    onClick={() => setSearchParams({ page: String(Math.max(0, page - 1)), categoryId: categoryId ? String(categoryId) : '' })}
                    disabled={page === 0}
                    className="px-4 py-2 bg-surface border border-white/10 rounded text-cyan text-xs font-bold disabled:opacity-30 hover:bg-white/5"
                >
                    이전
                </button>
                <div className="px-4 py-2 text-white font-mono text-sm">
                    {page + 1} <span className="text-gray-600">/</span> {postsData?.totalPages || 1}
                </div>
                <button
                    onClick={() => setSearchParams({ page: String(Math.min((postsData?.totalPages || 1) - 1, page + 1)), categoryId: categoryId ? String(categoryId) : '' })}
                    disabled={page >= (postsData?.totalPages || 1) - 1}
                    className="px-4 py-2 bg-surface border border-white/10 rounded text-cyan text-xs font-bold disabled:opacity-30 hover:bg-white/5"
                >
                    다음
                </button>
            </div>
        </div>
    );
}
