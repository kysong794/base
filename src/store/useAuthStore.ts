import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/auth';

interface AuthState {
    token: string | null;
    user: User | null;
    setToken: (token: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
            logout: () => set({ token: null, user: null }),
            isAdmin: () => get().user?.role === 'ADMIN',
        }),
        {
            name: 'auth-storage',
        }
    )
);
