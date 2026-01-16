import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/posts';
import { getCategories } from '../api/categories';
import { Loader2 } from 'lucide-react';

export default function PostWritePage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState<number | undefined>();

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const mutation = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            navigate('/');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ title, content, categoryId });
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">새 글 작성</h1>
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
                        placeholder="제목을 입력하세요"
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
                        placeholder="내용을 입력하세요"
                        required
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {mutation.isPending && <Loader2 className="animate-spin" size={18} />}
                        등록
                    </button>
                </div>
            </form>
        </div>
    );
}
