import api from '@/lib/api';
import { Project, ProjectMember } from '@/lib/types';

export const getProjects = async (): Promise<{ results: Project[], count: number, next: string | null, previous: string | null }> => {
    const response = await api.get('/projects/');
    const mapProject = (p: any): Project => ({
        ...p,
        title: p.name || p.title || 'Untitled Project',
    });

    if (Array.isArray(response.data)) {
        return {
            results: response.data.map(mapProject),
            count: response.data.length,
            next: null,
            previous: null
        };
    }
    return {
        ...response.data,
        results: response.data.results.map(mapProject)
    };
};

export const getProject = async (id: number | string): Promise<Project> => {
    const response = await api.get(`/projects/${id}/`);
    return {
        ...response.data,
        title: response.data.name || response.data.title || 'Untitled Project',
    };
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

export interface BoardColumn {
    id: string;
    title: string;
    status: string;
    visible: boolean;
}

export const updateBoardSettings = async (projectId: number | string, columns: BoardColumn[]): Promise<Project> => {
    const response = await api.patch(`/projects/${projectId}/`, {
        boardSettings: { columns }
    });
    return response.data;
};

// Member management API
export const getProjectMembers = async (projectId: number | string): Promise<ProjectMember[]> => {
    const response = await api.get(`/projects/${projectId}/members/`);
    return response.data;
};

export const addProjectMember = async (projectId: number | string, email: string, role: string): Promise<ProjectMember> => {
    const response = await api.post(`/projects/${projectId}/members/`, { email, role });
    return response.data;
};

export const updateProjectMember = async (projectId: number | string, memberId: string, role: string): Promise<ProjectMember> => {
    const response = await api.patch(`/projects/${projectId}/members/${memberId}/`, { role });
    return response.data;
};

export const removeProjectMember = async (projectId: number | string, memberId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}/members/${memberId}/`);
};
