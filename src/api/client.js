import axios from 'axios';
import { getAccessToken, clearTokens } from '../storage/secureStore';

// Update with your local IP or backend URL (do not use localhost on physical devices)
const BASE_URL = 'https://e-commerce-hemmy1.vercel.app/';

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            await clearTokens();
        }
        return Promise.reject(error);
    }
);

export default client;