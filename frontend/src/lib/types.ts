export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Project {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    owner: number;
}

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';

export interface Tag {
    id: number;
    name: string;
    color: string;
    projectId?: number;
}

export interface Subtask {
    id: number;
    title: string;
    isCompleted: boolean;
    order: number;
    taskId: number;
}

export interface Activity {
    id: number;
    action: 'created' | 'updated' | 'completed' | 'deleted';
    description: string;
    userId: number;
    user?: User;
    taskId?: number;
    projectId?: number;
    createdAt: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    isCompleted: boolean;
    status: TaskStatus;
    priority: 'Low' | 'Medium' | 'High';
    dueDate?: string;
    projectId?: number;
    owner: number;
    tags?: Tag[];
    subtasks?: Subtask[];
    createdAt: string;
    updatedAt: string;
}
