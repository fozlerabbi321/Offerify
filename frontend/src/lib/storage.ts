import { Platform } from 'react-native';

export interface StorageAdapter {
    getString: (key: string) => string | undefined;
    set: (key: string, value: string) => void;
    delete: (key: string) => void;
}

class WebStorage implements StorageAdapter {
    getString(key: string) {
        if (typeof localStorage === 'undefined') return undefined;
        return localStorage.getItem(key) || undefined;
    }
    set(key: string, value: string) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
        }
    }
    delete(key: string) {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(key);
        }
    }
}

class InMemoryStorage implements StorageAdapter {
    private storage = new Map<string, string>();

    getString(key: string) {
        return this.storage.get(key);
    }
    set(key: string, value: string) {
        this.storage.set(key, value);
    }
    delete(key: string) {
        this.storage.delete(key);
    }
}

let storage: StorageAdapter;

if (Platform.OS === 'web') {
    storage = new WebStorage();
} else {
    try {
        const { MMKV } = require('react-native-mmkv');
        const mmkv = new MMKV();
        storage = {
            getString: (key) => mmkv.getString(key),
            set: (key, value) => mmkv.set(key, value),
            delete: (key) => mmkv.delete(key),
        };
    } catch (e) {
        console.warn('MMKV failed to initialize (likely running in Expo Go). Falling back to in-memory storage. Persistence will not work.');
        storage = new InMemoryStorage();
    }
}

export default storage;
