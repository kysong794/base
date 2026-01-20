import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { login } from '../api/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const setToken = useAuthStore((state) => state.setToken);
    const setUser = useAuthStore((state) => state.setUser);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = await login({ email, password });
            setToken(data.accessToken);

            // Decode JWT to get user info
            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
            const role = payload.auth.includes('ADMIN') ? 'ADMIN' : 'USER';

            setUser({
                email,
                nickname: email.split('@')[0], // Placeholder nickname from email
                role
            });
            navigate('/');
        } catch {
            setError('로그인 실패: 이메일 또는 비밀번호를 확인해주세요.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md p-8 glass rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10">
                <h2 className="text-3xl font-bold text-center mb-8 text-white tracking-widest drop-shadow-[0_0_10px_rgba(102,252,241,0.5)]">
                    BASE<span className="text-cyan">//</span>BOARD
                </h2>

                <h3 className="text-xl font-bold text-center mb-6 text-gray-300">시스템 접속</h3>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-4 rounded mb-6 font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-cyan-dim mb-2 uppercase tracking-wider">이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 input-cyber rounded-lg"
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-cyan-dim mb-2 uppercase tracking-wider">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 input-cyber rounded-lg"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn-cyber-primary w-full py-3 rounded-lg font-bold tracking-widest shadow-lg text-sm"
                    >
                        로그인
                    </button>

                    <div className="text-center pt-2">
                        <Link to="/signup" className="text-sm text-gray-500 hover:text-cyan transition-colors">
                            계정이 없으신가요? <span className="underline decoration-cyan/30">회원가입</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
