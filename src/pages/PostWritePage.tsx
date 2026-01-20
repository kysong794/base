import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../api/posts';
import { getCategories } from '../api/categories';
import { Loader2, PenTool, Save, X } from 'lucide-react';

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
        <div className="max-w-4xl mx-auto p-8 glass rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white tracking-tight drop-shadow-md">
                <PenTool className="text-cyan" /> 새 글 작성
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">카테고리</label>
                    <select
                        value={categoryId || ''}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="w-full px-4 py-3 input-cyber rounded-lg"
                        required
                    >
                        <option value="" disabled className="text-gray-500">카테고리 선택</option>
                        {categories?.map((category) => (
                            <option key={category.id} value={category.id} className="bg-void text-white">
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="title" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        제목
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 input-cyber rounded-lg text-lg font-bold"
                        placeholder="제목을 입력하세요"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="content" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                        내용
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-80 px-4 py-3 input-cyber rounded-lg bg-void/50 resize-none font-mono text-sm leading-relaxed"
                        placeholder="내용을 입력하세요"
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn-cyber px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold"
                    >
                        <X size={18} /> 취소
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="btn-cyber-primary px-8 py-3 rounded-lg flex items-center gap-2 text-sm font-bold tracking-widest shadow-lg"
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        등록
                    </button>
                </div>
            </form>
        </div>
    );
}
