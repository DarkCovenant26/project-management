import api from '@/lib/api';
import { Task } from '@/lib/types';

export const getTasks = async (params?: { projectId?: number | string; page?: number }): Promise<{ results: Task[], count?: number, next?: string | null, previous?: string | null }> => {
    const response = await api.get('/tasks/', { params });
    // Handle both array and paginated response for safety
    if (Array.isArray(response.data)) {
        return { results: response.data, count: response.data.length, next: null, previous: null };
    }
    return response.data;
};

export const getTask = async (id: number | string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}/`);
    return response.data;
};

export const createTask = async (data: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks/', data);
    return response.data;
};

export const updateTask = async (id: number | string, data: Partial<Task>): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/`, data);
    return response.data;
};

export const deleteTask = async (id: number | string): Promise<void> => {
    await api.delete(`/tasks/${id}/`);
};

export const updateTaskStatus = async (id: number | string, status: string): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/`, { status });
    return response.data;
};

export const bulkAction = async (ids: (number | string)[], action: string, data?: Record<string, unknown>): Promise<void> => {
    await api.post('/tasks/bulk/', { ids, action, ...data });
};
