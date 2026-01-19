import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, deletePost } from '../api/posts';
import { getComments, createComment, deleteComment, updateComment } from '../api/comments';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2, Edit2, Trash2 } from 'lucide-react';

export default function PostDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const { data: post, isLoading, error } = useQuery({
        queryKey: ['posts', id],
        queryFn: () => getPost(Number(id)),
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            navigate('/');
        },
        onError: () => {
            alert('게시글 삭제에 실패했습니다.');
        }
    });

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error || !post) return <div className="text-center p-10">게시글을 찾을 수 없습니다.</div>;


    // Note: Backend returns nickname in 'author' field, but user store has 'email'. 
    // To strictly check ownership, we might need a better logic or check email from backend.
    // For now, let's allow delete if we can confirm ownership or update backend to return owner email.
    // Actually, backend check is strict. Frontend check is for UI visibility.
    // Let's assume validation happens on backend. For UI, we'll need consistent user info. 
    // Let's create a Helper or just show buttons and let backend reject if not owner (simplest for now).

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-8 pb-4 border-b">
                    <div className="flex gap-4">
                        <span className="font-medium text-gray-700">{post.author}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* Simple check: if logged in, show delete. Real check on click error */}
                    {user && (
                        <div className="flex gap-2">
                            <Link
                                to={`/posts/${post.id}/edit`}
                                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 px-3 py-1 rounded border border-transparent hover:bg-blue-50 transition"
                            >
                                <Edit2 size={16} />
                                수정
                            </Link>
                            <button
                                onClick={() => {
                                    if (confirm('정말 삭제하시겠습니까?')) {
                                        deleteMutation.mutate(post.id);
                                    }
                                }}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition"
                            >
                                <Trash2 size={16} />
                                삭제
                            </button>
                        </div>
                    )}
                </div>
                <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                </div>
                <div className="mt-10 pt-6 border-t">
                    <Link to="/" className="text-blue-600 hover:underline">
                        &larr; 목록으로 돌아가기
                    </Link>
                </div>

                {/* Comment Section */}
                <CommentSection postId={Number(id)} currentUserEmail={user?.email} />
            </div>
        </div>
    );
}

function CommentSection({ postId, currentUserEmail }: { postId: number, currentUserEmail?: string }) {
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const { user } = useAuthStore();

    const { data: comments, isLoading } = useQuery({
        queryKey: ['comments', postId],
        queryFn: () => getComments(postId),
        enabled: !!postId,
    });

    const createMutation = useMutation({
        mutationFn: (content: string) => createComment(postId, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            setContent('');
        },
        onError: () => {
            alert('댓글 작성에 실패했습니다.');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, content }: { id: number, content: string }) => updateComment(id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
            setEditingId(null);
            setEditContent('');
        },
        onError: () => {
            alert('댓글 수정에 실패했습니다.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        },
        onError: () => {
            alert('댓글 삭제에 실패했습니다.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        createMutation.mutate(content);
    };

    const handleEditClick = (comment: any) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId && editContent.trim()) {
            updateMutation.mutate({ id: editingId, content: editContent });
        }
    };

    if (isLoading) return <div className="mt-8 text-center text-gray-500">댓글을 불러오는 중...</div>;

    return (
        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                댓글 <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{comments?.length || 0}</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-4 mb-8">
                {comments?.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4">첫 번째 댓글을 남겨보세요!</p>
                ) : (
                    comments?.map(comment => (
                        <div key={comment.id} className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                            {editingId === comment.id ? (
                                <form onSubmit={handleUpdate} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="flex-1 px-3 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={updateMutation.isPending || !editContent.trim()}
                                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        저장
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-300"
                                    >
                                        취소
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900">{comment.author}</span>
                                            <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {currentUserEmail === comment.memberEmail && (
                                                <button
                                                    onClick={() => handleEditClick(comment)}
                                                    className="text-gray-400 hover:text-blue-500 p-1"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            )}
                                            {(currentUserEmail === comment.memberEmail || user?.role === 'ADMIN') && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('댓글을 삭제하시겠습니까?')) {
                                                            deleteMutation.mutate(comment.id);
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            {currentUserEmail ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={createMutation.isPending || !content.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        등록
                    </button>
                </form>
            ) : (
                <div className="text-center p-4 border border-dashed border-gray-300 rounded text-gray-500 text-sm">
                    댓글을 작성하려면 <Link to="/login" className="text-blue-600 hover:underline">로그인</Link>이 필요합니다.
                </div>
            )}
        </div>
    );
}
