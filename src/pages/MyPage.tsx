import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '../api/members';
import { useAuthStore } from '../store/useAuthStore';
import { User, Lock, Key, Shield } from 'lucide-react';

export default function MyPage() {
    const { user } = useAuthStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            setMessage({ text: 'PASSWORD UPDATED SUCCESSFULLY.', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        },
        onError: (error: any) => {
            if (error.response?.data?.error === 'Incorrect current password') {
                setMessage({ text: 'INCORRECT CURRENT PASSWORD.', type: 'error' });
            } else {
                setMessage({ text: 'FAILED TO UPDATE PASSWORD.', type: 'error' });
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'NEW PASSWORDS DO NOT MATCH.', type: 'error' });
            return;
        }

        if (newPassword.length < 4) {
            setMessage({ text: 'PASSWORD MUST BE AT LEAST 4 CHARACTERS.', type: 'error' });
            return;
        }

        changePasswordMutation.mutate({
            currentPassword,
            newPassword
        });
    };

    if (!user) {
        return <div className="text-center p-10 text-cyan">ACCESS DENIED // LOG IN REQUIRED</div>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10 p-8 glass rounded-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white tracking-tight drop-shadow-md">
                <User className="text-cyan" /> 마이 페이지
            </h1>

            <div className="mb-10 p-6 bg-surface/50 rounded-lg border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan/10 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-cyan/20"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-cyan-dim text-xs font-bold mb-1 tracking-wider uppercase">이메일</p>
                        <p className="text-lg font-bold text-white font-mono">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-cyan-dim text-xs font-bold mb-1 tracking-wider uppercase">닉네임</p>
                        <p className="text-lg font-bold text-white font-mono">{user.nickname || 'Unknown'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-cyan-dim text-xs font-bold mb-2 tracking-wider uppercase">권한</p>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded border text-sm font-bold ${user.role === 'ADMIN'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-cyan/10 text-cyan border-cyan/30'}`}>
                            {user.role === 'ADMIN' ? <Shield size={14} /> : <User size={14} />}
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-300">
                <Lock size={20} className="text-cyan" /> 보안 설정
            </h2>

            {message && (
                <div className={`p-4 mb-6 rounded border text-sm font-bold flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">현재 비밀번호</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 input-cyber rounded-lg"
                            placeholder="현재 비밀번호를 입력해 주세요"
                            required
                        />
                        <Key className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">새 비밀번호</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 input-cyber rounded-lg"
                            placeholder="새 비밀번호를 입력해 주세요"
                            required
                        />
                        <Lock className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">새 비밀번호 확인</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 input-cyber rounded-lg"
                            placeholder="비밀번호를 다시 입력해 주세요"
                            required
                        />
                        <Lock className="absolute left-3 top-3.5 text-gray-500" size={16} />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="btn-cyber-primary w-full py-3 rounded-lg text-sm tracking-widest shadow-lg"
                    >
                        {changePasswordMutation.isPending ? '처리 중...' : '비밀번호 변경'}
                    </button>
                </div>
            </form>
        </div>
    );
}
