import api from '@/lib/api';
import { Project } from '@/lib/types';

export const getProjects = async (): Promise<Project[]> => {
    const response = await api.get('/projects/');
    return response.data;
};

export const getProject = async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects/', data);
    return response.data;
};
