import api from '@/lib/api';
import { Task } from '@/lib/types';

export const getTasks = async (params?: { projectId?: number | string; page?: number }): Promise<{ results: Task[], count: number, next: string | null, previous: string | null }> => {
    try {
        const response = await api.get('/tasks/', { params });
        const data = response?.data;

        if (!data) {
            return { results: [], count: 0, next: null, previous: null };
        }

        // Handle both array and paginated response for safety
        if (Array.isArray(data)) {
            return { results: data, count: data.length, next: null, previous: null };
        }

        return {
            results: Array.isArray(data.results) ? data.results : [],
            count: typeof data.count === 'number' ? data.count : 0,
            next: data.next || null,
            previous: data.previous || null,
        };
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        return { results: [], count: 0, next: null, previous: null };
    }
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

export interface DashboardStats {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue_tasks: number;
    tasks_by_priority: Record<string, number>;
    tasks_by_status: Record<string, number>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get('/tasks/dashboard/stats/');
    return response.data;
};
