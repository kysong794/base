import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { deletePost, getPost } from '../api/posts';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2, Trash2, Edit2 } from 'lucide-react';

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
            </div>
        </div>
    );
}
