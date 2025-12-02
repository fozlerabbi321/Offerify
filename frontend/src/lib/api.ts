import axios from 'axios';
import storage from './storage';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Use 10.0.2.2 for Android Emulator
});

api.interceptors.request.use((config) => {
    const token = storage.getString('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
