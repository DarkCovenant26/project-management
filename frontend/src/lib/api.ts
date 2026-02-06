import axios from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data && config.headers['Content-Type'] === 'application/json') {
            // deep: true handles nested objects
            config.data = snakecaseKeys(config.data, { deep: true });
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => {
        if (response.data && response.headers['content-type']?.includes('application/json')) {
            response.data = camelcaseKeys(response.data, { deep: true });
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login/')) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh');
                const response = await axios.post('http://localhost:8000/api/auth/refresh/', {
                    refresh: refreshToken,
                });
                const { access } = response.data;
                localStorage.setItem('access', access);
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                originalRequest.headers['Authorization'] = `Bearer ${access}`;
                return api(originalRequest);
            } catch (_err) {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
