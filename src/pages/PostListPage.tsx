import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPosts } from '../api/posts';
import { useAuthStore } from '../store/useAuthStore';
import { Edit2, Loader2 } from 'lucide-react';

export default function PostListPage() {
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['posts'],
        queryFn: getPosts,
    });
    const { token } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500">게시글을 불러오는데 실패했습니다.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">게시글 목록</h1>
                {token && (
                    <Link
                        to="/posts/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Edit2 size={16} />
                        글쓰기
                    </Link>
                )}
            </div>

            <div className="grid gap-4">
                {posts?.map((post) => (
                    <Link
                        key={post.id}
                        to={`/posts/${post.id}`}
                        className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-100"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h2>
                        <div className="text-sm text-gray-500 flex justify-between">
                            <span>작성자: {post.author}</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                    </Link>
                ))}
                {posts?.length === 0 && (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-lg">
                        아직 작성된 게시글이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
