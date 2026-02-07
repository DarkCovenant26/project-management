import api from '@/lib/api';
import { Tag } from '@/lib/types';

export const getTags = async (projectId?: number | string): Promise<{ results: Tag[] }> => {
    const response = await api.get('/tags/', { params: { projectId } });
    if (Array.isArray(response.data)) {
        return { results: response.data };
    }
    return response.data;
};

export const getTag = async (id: number | string): Promise<Tag> => {
    const response = await api.get(`/tags/${id}/`);
    return response.data;
};

export const createTag = async (data: Partial<Tag>): Promise<Tag> => {
    const response = await api.post('/tags/', data);
    return response.data;
};

export const updateTag = async (id: number | string, data: Partial<Tag>): Promise<Tag> => {
    const response = await api.patch(`/tags/${id}/`, data);
    return response.data;
};

export const deleteTag = async (id: number | string): Promise<void> => {
    await api.delete(`/tags/${id}/`);
};
