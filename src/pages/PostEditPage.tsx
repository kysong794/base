import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPost, updatePost } from '../api/posts';
import { Loader2 } from 'lucide-react';

export default function PostEditPage() {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: post, isLoading, error } = useQuery({
        queryKey: ['posts', id],
        queryFn: () => getPost(Number(id)),
        enabled: !!id,
    });

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
        }
    }, [post]);

    const updateMutation = useMutation({
        mutationFn: (data: { title: string; content: string }) =>
            updatePost(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['posts', id] });
            navigate(`/posts/${id}`);
        },
        onError: () => {
            alert('게시글 수정에 실패했습니다.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        updateMutation.mutate({ title, content });
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error || !post) return <div className="text-center p-10">게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold mb-6">게시글 수정</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-64 resize-none"
                        required
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {updateMutation.isPending ? '수정 중...' : '수정완료'}
                    </button>
                </div>
            </form>
        </div>
    );
}
