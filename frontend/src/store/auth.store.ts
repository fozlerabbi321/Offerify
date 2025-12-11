import { create } from 'zustand';
import storage from '../lib/storage';
import api from '../lib/api';

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
    checkLogin: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
    checkLogin: async () => {
        const token = storage.getString('token');
        const userString = storage.getString('user');
        if (token && userString) {
            try {
                const user = JSON.parse(userString);
                set({ user, isAuthenticated: true });
                // Refresh user data from backend to get latest role
                await get().refreshUser();
            } catch (e) {
                // Invalid user data, clear storage
                storage.delete('token');
                storage.delete('user');
                set({ user: null, isAuthenticated: false });
            }
        }
    },
    refreshUser: async () => {
        try {
            const response = await api.get('/auth/profile');
            const freshUser = response.data.data || response.data;
            if (freshUser && freshUser.id) {
                storage.set('user', JSON.stringify(freshUser));
                set({ user: freshUser, isAuthenticated: true });
            }
        } catch (error) {
            console.log('Failed to refresh user data:', error);
            // Don't logout on refresh failure, just keep existing data
        }
    },
}));
