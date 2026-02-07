import api from '@/lib/api';
import { Subtask } from '@/lib/types';

export const getSubtasks = async (taskId: number | string): Promise<{ results: Subtask[] }> => {
    const response = await api.get(`/tasks/${taskId}/subtasks/`);
    if (Array.isArray(response.data)) {
        return { results: response.data };
    }
    return response.data;
};

export const createSubtask = async (taskId: number | string, data: Partial<Subtask>): Promise<Subtask> => {
    const response = await api.post(`/tasks/${taskId}/subtasks/`, data);
    return response.data;
};

export const updateSubtask = async (taskId: number | string, subtaskId: number | string, data: Partial<Subtask>): Promise<Subtask> => {
    const response = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/`, data);
    return response.data;
};

export const deleteSubtask = async (taskId: number | string, subtaskId: number | string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}/`);
};

export const reorderSubtasks = async (taskId: number | string, order: number[]): Promise<void> => {
    await api.post(`/tasks/${taskId}/subtasks/reorder/`, { order });
};
