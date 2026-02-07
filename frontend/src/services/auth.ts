import api from '@/lib/api';
import { User } from '@/lib/types';

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get('/users/me/');
    return response.data;
};

export const updateUserProfile = async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/users/me/', data);
    return response.data;
};

