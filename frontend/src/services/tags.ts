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

// Task-Tag Linking
export const getTaskTags = async (taskId: number | string): Promise<{ results: Tag[] }> => {
    const response = await api.get(`/tasks/${taskId}/tags/`);
    // The backend returns a list of TaskTag objects which contain the tag details
    // We might need to map them if the structure is nested, but let's assume flat for now or adjust based on backend response
    // Actually backend TaskTagSerializer returns { id, task, tag: TagSerializer }
    // So we need to map the response to get the tags
    if (Array.isArray(response.data)) {
        return { results: response.data.map((item: any) => item.tag) };
    }
    return { results: [] };
};

export const addTaskTag = async (taskId: number | string, tagId: number | string): Promise<void> => {
    await api.post(`/tasks/${taskId}/tags/`, { tag_id: tagId });
};

export const removeTaskTag = async (taskId: number | string, tagId: number | string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/tags/${tagId}/`);
};
