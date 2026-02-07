import api from '@/lib/api';
import { Activity } from '@/lib/types';

export const getTaskActivities = async (taskId: number | string, page?: number): Promise<{ results: Activity[], next?: string | null }> => {
    const response = await api.get(`/tasks/${taskId}/activities/`, { params: { page } });
    if (Array.isArray(response.data)) {
        return { results: response.data, next: null };
    }
    return response.data;
};

export const getProjectActivities = async (projectId: number | string, page?: number): Promise<{ results: Activity[], next?: string | null }> => {
    const response = await api.get(`/projects/${projectId}/activities/`, { params: { page } });
    if (Array.isArray(response.data)) {
        return { results: response.data, next: null };
    }
    return response.data;
};


export const getUserActivities = async (page?: number): Promise<{ results: Activity[], next?: string | null }> => {
    const response = await api.get('/activity/', { params: { page } });
    if (Array.isArray(response.data)) {
        return { results: response.data, next: null };
    }
    return response.data;
};
