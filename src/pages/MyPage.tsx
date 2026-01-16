import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../api/members';
import { useAuthStore } from '../store/useAuthStore';
import { User, Lock, Key } from 'lucide-react';

export default function MyPage() {
    const { user } = useAuthStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            setMessage({ text: '비밀번호가 성공적으로 변경되었습니다.', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        },
        onError: (error: any) => {
            if (error.response?.data?.error === 'Incorrect current password') {
                setMessage({ text: '현재 비밀번호가 일치하지 않습니다.', type: 'error' });
            } else {
                setMessage({ text: '비밀번호 변경에 실패했습니다. 다시 시도해주세요.', type: 'error' });
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ text: '새 비밀번호가 일치하지 않습니다.', type: 'error' });
            return;
        }

        if (newPassword.length < 4) {
            setMessage({ text: '새 비밀번호는 최소 4자 이상이어야 합니다.', type: 'error' });
            return;
        }

        changePasswordMutation.mutate({
            currentPassword,
            newPassword
        });
    };

    if (!user) {
        return <div className="text-center p-10">로그인이 필요합니다.</div>;
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <User /> 마이 페이지
            </h1>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">내 이메일</p>
                <p className="text-lg font-medium text-gray-900">{user.email}</p>
                <p className="text-gray-600 text-sm mt-3 mb-1">닉네임</p>
                <p className="text-lg font-medium text-gray-900">{user.nickname || 'Unknown'}</p>
                <p className="text-gray-600 text-sm mt-3 mb-1">권한</p>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                </span>
            </div>

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                <Lock size={20} /> 비밀번호 변경
            </h2>

            {message && (
                <div className={`p-3 mb-4 rounded text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="현재 비밀번호를 입력요"
                            required
                        />
                        <Key className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="변경할 비밀번호를 입력하세요"
                            required
                        />
                        <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호 확인</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="비밀번호를 다시 입력하세요"
                            required
                        />
                        <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
                    >
                        {changePasswordMutation.isPending ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </div>
            </form>
        </div>
    );
}
