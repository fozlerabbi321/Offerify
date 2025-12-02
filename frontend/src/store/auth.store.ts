import { create } from 'zustand';
import storage from '../lib/storage';

export interface User {
    id: string;
    email: string;
    role: 'GUEST' | 'CUSTOMER' | 'VENDOR' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: (user, token) => {
        storage.set('token', token);
        set({ user, isAuthenticated: true });
    },
    logout: () => {
        storage.delete('token');
        set({ user: null, isAuthenticated: false });
    },
}));
