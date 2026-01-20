import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/auth';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup({ email, password, nickname });
            alert('회원가입 성공! 로그인해주세요.');
            navigate('/login');
        } catch {
            setError('회원가입 실패: 이미 존재하는 이메일일 수 있습니다.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md p-8 glass rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10">
                <h2 className="text-3xl font-bold text-center mb-8 text-white tracking-widest drop-shadow-[0_0_10px_rgba(102,252,241,0.5)]">
                    BASE<span className="text-cyan">//</span>BOARD
                </h2>

                <h3 className="text-xl font-bold text-center mb-6 text-gray-300">신규 회원 등록</h3>

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
                            placeholder="이메일 주소를 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-cyan-dim mb-2 uppercase tracking-wider">닉네임</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full px-4 py-3 input-cyber rounded-lg"
                            placeholder="닉네임을 입력하세요"
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
                        회원가입
                    </button>

                    <div className="text-center pt-2">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-cyan transition-colors">
                            이미 계정이 있으신가요? <span className="underline decoration-cyan/30">로그인</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
