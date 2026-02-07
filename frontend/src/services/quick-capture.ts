import api from '@/lib/api';
import { Task } from '@/lib/types';

export interface QuickNote {
    id: number;
    content: string;
    isArchived: boolean;
    convertedTask?: Task;
    createdAt: string;
}

export const getQuickNotes = async (archived?: boolean): Promise<{ results: QuickNote[], count: number }> => {
    const params = archived !== undefined ? { archived } : {};
    const response = await api.get('/quick-capture/', { params });
    return response.data;
};

export const createQuickNote = async (content: string): Promise<QuickNote> => {
    const response = await api.post('/quick-capture/', { content });
    return response.data;
};

export interface ConvertNoteParams {
    title: string;
    description?: string;
    priority?: string;
    projectId?: number;
    dueDate?: Date;
}

export const convertToTask = async (noteId: number, params: ConvertNoteParams): Promise<{ convertedTask: Task, isArchived: boolean }> => {
    const response = await api.post(`/quick-capture/${noteId}/convert_to_task/`, params);
    return response.data;
};

export const updateQuickNote = async (id: number, data: Partial<QuickNote>): Promise<QuickNote> => {
    const response = await api.patch(`/quick-capture/${id}/`, data);
    return response.data;
};

export const deleteQuickNote = async (id: number): Promise<void> => {
    await api.delete(`/quick-capture/${id}/`);
};
