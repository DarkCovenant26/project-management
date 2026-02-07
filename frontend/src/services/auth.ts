import api from '@/lib/api';

export interface User {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get('/auth/users/me/');
    return response.data;
};
