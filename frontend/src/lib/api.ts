import axios from 'axios';
import storage from './storage';

const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
    const token = storage.getString('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log('API Response for:', response.config.url, response.data);
        // Unwrap the standard response format { data, meta, message }
        if (response.data && response.data.data !== undefined) {
            console.log('Unwrapping response data');
            response.data = response.data.data;
        }
        return response;
    },
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api;
