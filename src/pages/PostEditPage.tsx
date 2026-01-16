import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPost, updatePost } from '../api/posts';
import { getCategories } from '../api/categories';
import { Loader2 } from 'lucide-react';

export default function PostEditPage() {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | undefined>();

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: post, isLoading: isPostLoading, error } = useQuery({
        queryKey: ['posts', id],
        queryFn: () => getPost(Number(id)),
        enabled: !!id,
    });

    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    useEffect(() => {
        if (post) {
            setTitle(post.title);
            setContent(post.content);
            // Matching category name to ID would be ideal, but for now we might need to rely on name 
            // or update Post response to include categoryId.
            // Simplified: If categories loaded, try to find matching ID by name
            if (categories && post.category) {
                const matchedCategory = categories.find(c => c.name === post.category);
                if (matchedCategory) {
                    setCategoryId(matchedCategory.id);
                }
            }
        }
    }, [post, categories]);

    const updateMutation = useMutation({
        mutationFn: (data: { title: string; content: string; categoryId?: number }) =>
            updatePost(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['posts', id] });
            navigate(`/posts/${id}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({ title, content, categoryId });
    };

    if (isPostLoading || isCategoriesLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (error || !post) return <div className="text-center p-10">게시글을 찾을 수 없습니다.</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">게시글 수정</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                        value={categoryId || ''}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="" disabled>카테고리 선택</option>
                        {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        제목
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        내용
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        required
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {updateMutation.isPending && <Loader2 className="animate-spin" size={18} />}
                        수정완료
                    </button>
                </div>
            </form>
        </div>
    );
}
