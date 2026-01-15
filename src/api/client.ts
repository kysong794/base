import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const client = axios.create({
    baseURL: '/api', // Nginx proxy will handle this
});

client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
