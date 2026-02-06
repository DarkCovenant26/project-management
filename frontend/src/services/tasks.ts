import api from '@/lib/api';
import { Task } from '@/lib/types';

export const getTasks = async (projectId?: string): Promise<Task[]> => {
    const params = projectId ? { projectId } : {};
    const response = await api.get('/tasks/', { params });
    return response.data;
};

export const getTask = async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
};

export const createTask = async (data: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks/', data);
    return response.data;
};

export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/`, data);
    return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}/`);
};
