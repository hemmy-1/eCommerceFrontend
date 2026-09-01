import axios from 'axios';
import { getAccessToken, clearTokens } from '../storage/secureStore';

// Remove the trailing slash here
const BASE_URL = 'https://ecommerce-wj3z.onrender.com';

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