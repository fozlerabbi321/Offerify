import { create } from 'zustand';
import storage from '../lib/storage';

export interface User {
    id: string;
    email: string;
    role: 'customer' | 'vendor' | 'admin' | 'guest' | string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    checkLogin: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    login: (user, token) => {
        storage.set('token', token);
        storage.set('user', JSON.stringify(user));
        set({ user, isAuthenticated: true });
    },
    logout: () => {
        storage.delete('token');
        storage.delete('user');
        set({ user: null, isAuthenticated: false });
    },
    checkLogin: () => {
        const token = storage.getString('token');
        const userString = storage.getString('user');
        if (token && userString) {
            try {
                const user = JSON.parse(userString);
                set({ user, isAuthenticated: true });
            } catch (e) {
                // Invalid user data, clear storage
                storage.delete('token');
                storage.delete('user');
                set({ user: null, isAuthenticated: false });
            }
        }
    },
}));
