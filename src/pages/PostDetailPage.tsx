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
        <div className="max-w-4xl mx-auto glass rounded-none relative overflow-hidden transition-all border-t-4 border-t-gn shadow-[0_0_30px_rgba(94,252,141,0.1)]">
            {/* HUD Decor */}
            <div className="absolute top-4 right-4 text-gn/30 flex gap-1">
                <div className="w-16 h-1 bg-gn/30"></div>
                <div className="w-4 h-1 bg-gn/30"></div>
            </div>

            <div className="p-8 md:p-10 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-gn text-xs font-mono tracking-[0.2em] mb-2 block">MISSION DATA // {post.id.toString().padStart(4, '0')}</span>
                        <h1 className="text-4xl font-bold text-white leading-tight drop-shadow-md uppercase">{post.title}</h1>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 items-center text-sm text-gray-400 mb-10 pb-6 border-b border-gn/20 bg-gn/5 -mx-10 px-10 py-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gn-dim font-bold tracking-widest">OPERATOR</span>
                        <div className="flex items-center gap-2 text-white font-mono">
                            <span className="w-2 h-2 bg-gn rounded-full animate-pulse"></span>
                            {post.author}
                        </div>
                    </div>
                    <div className="w-px h-8 bg-gn/20"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gn-dim font-bold tracking-widest">TIMESTAMP</span>
                        <span className="text-white font-mono">{new Date(post.createdAt).toISOString().replace('T', ' ').substring(0, 16)}</span>
                    </div>

                    {user && (
                        <div className="ml-auto flex gap-3">
                            <Link
                                to={`/posts/${post.id}/edit`}
                                className="flex items-center gap-1 text-gn hover:bg-gn/10 px-3 py-1 rounded border border-gn/30 transition-colors group"
                            >
                                <Edit2 size={14} className="group-hover:rotate-45 transition-transform" />
                                <span className="text-xs font-bold tracking-wider">MODIFY</span>
                            </Link>
                            <button
                                onClick={() => {
                                    if (confirm('WARNING: DELETE DATA PERMANENTLY?')) {
                                        deleteMutation.mutate(post.id);
                                    }
                                }}
                                className="flex items-center gap-1 text-solar hover:bg-solar/10 px-3 py-1 rounded border border-solar/30 transition-colors"
                            >
                                <Trash2 size={14} />
                                <span className="text-xs font-bold tracking-wider">PURGE</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="prose max-w-none text-gray-300 whitespace-pre-wrap leading-loose text-lg font-light tracking-wide min-h-[200px]">
                    {post.content}
                </div>

                <div className="mt-12 pt-8 border-t border-gn/20 flex justify-between items-center">
                    <Link to="/" className="text-gn hover:text-white transition-colors text-sm font-bold tracking-widest flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> RETURN TO LIST
                    </Link>
                    <span className="text-xs text-gn-dim tracking-widest uppercase">END OF DATA //</span>
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
            alert('Failed to transmit comment.');
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
            alert('Update failed.');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', postId] });
        },
        onError: () => {
            alert('Delete failed.');
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

    if (isLoading) return <div className="mt-8 text-center text-cyan-dim animate-pulse">LOADING COMMENTS...</div>;

    return (
        <div className="mt-16 bg-surface/30 p-8 rounded-xl border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                COMMENTS <span className="bg-cyan text-void text-xs font-bold px-2 py-0.5 rounded-sm">{comments?.length || 0}</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-4 mb-10">
                {comments?.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 italic">No transmission data received.</p>
                ) : (
                    comments?.map(comment => (
                        <div key={comment.id} className="bg-void/50 p-5 rounded border border-white/5 hover:border-cyan/30 transition-colors">
                            {editingId === comment.id ? (
                                <form onSubmit={handleUpdate} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="flex-1 input-cyber px-4 py-2 rounded text-sm"
                                        autoFocus
                                    />
                                    <button
                                        type="submit"
                                        disabled={updateMutation.isPending || !editContent.trim()}
                                        className="btn-cyber px-4 py-2 rounded text-xs"
                                    >
                                        SAVE
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        className="text-gray-500 hover:text-white px-3 py-2 text-xs"
                                    >
                                        CANCEL
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-300 text-sm">{comment.author}</span>
                                            <span className="text-xs text-gray-600 font-mono">{new Date(comment.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex gap-2 opacity-60 hover:opacity-100 transition-opacity">
                                            {currentUserEmail === comment.memberEmail && (
                                                <button
                                                    onClick={() => handleEditClick(comment)}
                                                    className="text-gray-500 hover:text-cyan p-1"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            )}
                                            {(currentUserEmail === comment.memberEmail || user?.role === 'ADMIN') && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this comment?')) {
                                                            deleteMutation.mutate(comment.id);
                                                        }
                                                    }}
                                                    className="text-gray-500 hover:text-red-500 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Comment Form */}
            {currentUserEmail ? (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your comment..."
                        className="flex-1 input-cyber px-5 py-3 rounded-lg focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={createMutation.isPending || !content.trim()}
                        className="btn-cyber-primary px-6 py-3 rounded-lg text-sm tracking-wider"
                    >
                        SEND
                    </button>
                </form>
            ) : (
                <div className="text-center p-6 border border-dashed border-gray-700 rounded-lg text-gray-500 text-sm">
                    <Link to="/login" className="text-cyan hover:underline font-bold">LOGIN</Link> REQUIRED TO TRANSMIT
                </div>
            )}
        </div>
    );
}
