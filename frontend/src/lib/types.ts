export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    owner: number;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    isCompleted: boolean;
    priority: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    projectId?: number;
    owner: number;
    createdAt: string;
    updatedAt: string;
}
