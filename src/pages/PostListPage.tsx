import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, deletePost, bulkUpdatePostCategory, togglePin } from '../api/posts';
import { getCategories } from '../api/categories';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { format } from 'date-fns';
import { Trash2, Edit2, Shield, FolderInput, Pin, PinOff } from 'lucide-react';
import useDraggableScroll from '../hooks/useDraggableScroll';

export default function PostListPage() {
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

    // ... inside return ...
    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">게시글 목록</h1>
                <div className="flex gap-2 items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 mr-4">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="검색어 입력..."
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                            검색
                        </button>
                    </form>

                    {isAdmin() && (
                        <Link to="/admin" className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 flex items-center gap-2">
                            <Shield size={18} />
                            관리자 페이지
                        </Link>
                    )}
                    <Link to="/posts/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        글쓰기
                    </Link>
                </div>
            </div>

            {/* Category Tabs */}
            <div
                className={`flex border-b border-gray-200 mb-6 overflow-x-auto ${scrollEvents.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                ref={scrollRef}
                {...scrollEvents}
            >
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${!categoryId
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setSearchParams({ page: '0' })}
                >
                    전체
                </button>
                {categories?.map((category) => (
                    <button
                        key={category.id}
                        className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${categoryId === category.id
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setSearchParams({ page: '0', categoryId: String(category.id) })}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* Admin Bulk Actions */}
            {isAdmin() && (
                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={postsData && postsData.content.length > 0 && selectedPosts.length === postsData.content.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 font-medium">전체 선택 ({selectedPosts.length})</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isMoveMode ? (
                            <>
                                <select
                                    value={targetCategoryId}
                                    onChange={(e) => setTargetCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">카테고리 선택</option>
                                    {categories?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleBulkMove}
                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                    확인
                                </button>
                                <button
                                    onClick={() => { setIsMoveMode(false); setTargetCategoryId(''); }}
                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                                >
                                    취소
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsMoveMode(true)}
                                disabled={selectedPosts.length === 0}
                                className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                <FolderInput size={16} />
                                선택 이동
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {postsData?.content.map((post) => (
                    <div key={post.id} className={`border p-4 rounded-lg hover:shadow-md transition-shadow flex items-start gap-4 ${post.pinned ? 'bg-blue-50 border-blue-200' : ''}`}>
                        {isAdmin() && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedPosts.includes(post.id)}
                                    onChange={() => handleSelectPost(post.id)}
                                    className="mt-1.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <button
                                    onClick={(e) => handlePinToggle(e, post.id)}
                                    className={`p-1 rounded-full hover:bg-gray-200 ${post.pinned ? 'text-blue-600' : 'text-gray-400'}`}
                                    title={post.pinned ? "고정 해제" : "상단 고정"}
                                >
                                    {post.pinned ? <Pin size={18} fill="currentColor" /> : <PinOff size={18} />}
                                </button>
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                {post.pinned && <Pin size={18} className="text-blue-600 shrink-0" fill="currentColor" />}
                                {post.category && (
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                                        {post.category}
                                    </span>
                                )}
                                <Link to={`/posts/${post.id}`} className="text-xl font-semibold hover:text-blue-600">
                                    {post.title}
                                </Link>
                            </div>
                            <p className="text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>{post.author} | {format(new Date(post.createdAt), 'yyyy-MM-dd')}</span>
                                <div className="flex gap-2">
                                    {(user?.email === post.memberEmail || isAdmin()) && (
                                        <>
                                            <Link to={`/posts/${post.id}/edit`} className="text-blue-500 hover:text-blue-700 p-1">
                                                <Edit2 size={18} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('정말 삭제하시겠습니까?')) {
                                                        deleteMutation.mutate(post.id);
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination UI */}
            <div className="flex justify-center mt-8 gap-2">
                <button
                    onClick={() => setSearchParams({ page: String(Math.max(0, page - 1)), categoryId: categoryId ? String(categoryId) : '' })}
                    disabled={page === 0}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    이전
                </button>
                <span className="px-4 py-2">
                    {page + 1} / {postsData?.totalPages || 1}
                </span>
                <button
                    onClick={() => setSearchParams({ page: String(Math.min((postsData?.totalPages || 1) - 1, page + 1)), categoryId: categoryId ? String(categoryId) : '' })}
                    disabled={page >= (postsData?.totalPages || 1) - 1}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    다음
                </button>
            </div>
        </div>
    );
}
