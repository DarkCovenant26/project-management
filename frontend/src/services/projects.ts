import api from '@/lib/api';
import { Project } from '@/lib/types';

export const getProjects = async (): Promise<{ results: Project[] }> => {
    const response = await api.get('/projects/');
    // Handle both array and paginated response for safety
    if (Array.isArray(response.data)) {
        return { results: response.data };
    }
    return response.data;
};

export const getProject = async (id: number | string): Promise<Project> => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects/', data);
    return response.data;
};

export const updateProject = async (id: number | string, data: Partial<Project>): Promise<Project> => {
    const response = await api.patch(`/projects/${id}/`, data);
    return response.data;
};

export const deleteProject = async (id: number | string): Promise<void> => {
    await api.delete(`/projects/${id}/`);
};
