import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { LogOut, User } from 'lucide-react';

export default function Layout() {
    const { token, logout, user } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-blue-600">
                                baseBoard
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {token ? (
                                <>
                                    <span className="text-gray-700 flex items-center gap-2">
                                        <User size={18} />
                                        <Link to="/mypage" className="hover:text-blue-600 hover:underline">
                                            {user?.email}
                                        </Link>
                                    </span>
                                    {user?.role === 'ADMIN' && (
                                        <Link to="/admin" className="text-gray-500 hover:text-blue-600 font-medium">
                                            관리자
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                    >
                                        <LogOut size={18} />
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-500 hover:text-gray-900">
                                        로그인
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                    >
                                        회원가입
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
