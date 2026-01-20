import { Link, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { LogOut, User, Activity } from 'lucide-react';

export default function Layout() {
    const { logout, user } = useAuthStore();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars



    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-300 relative overflow-x-hidden selection:bg-gn/30 selection:text-gn-light">
            {/* Background Grid */}
            <div className="fixed inset-0 pointer-events-none z-[-1] bg-[linear-gradient(rgba(17,24,24,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,24,0.9)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>

            <nav className="sticky top-0 z-50 border-b border-gn/30 bg-surface/80 backdrop-blur-md">
                {/* HUD Top Bar Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gn/50 to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <Activity className="text-gn animate-pulse" size={24} />
                                <div className="absolute -inset-1 bg-gn/20 rounded-full blur group-hover:bg-gn/40 transition-all"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xl tracking-widest text-white group-hover:text-gn transition-colors">
                                    CELESTIAL<span className="text-gn">//</span>BEING
                                </span>
                                <span className="text-[10px] text-gn-dim tracking-[0.2em] uppercase">Mobile Suit Operation System</span>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-4 px-4 py-1 border-r border-gn/20">
                                        <span className="text-[12px] text-gn-dim font-mono">
                                            PILOT: <span className="text-white font-bold text-sm tracking-wider">{user.nickname}</span>
                                        </span>
                                        <span className="text-[12px] text-gn-dim font-mono">
                                            STATUS: <span className="text-solar font-bold tracking-wider">ONLINE</span>
                                        </span>
                                    </div>
                                    <Link to="/mypage" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gn transition-colors relative group">
                                        <User size={16} />
                                        <span>PROFILE</span>
                                        <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gn transition-all group-hover:w-full"></div>
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-solar transition-colors group"
                                    >
                                        <LogOut size={16} />
                                        <span>ABORT</span>
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="btn-cyber px-6 py-2 rounded text-xs font-bold flex items-center gap-2">
                                    <Activity size={14} />
                                    INITIALIZE
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Outlet />
            </main>
        </div>
    );
}
