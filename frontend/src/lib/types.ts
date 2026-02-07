export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    dashboardPreferences?: {
        widget_order?: string[];
        [key: string]: any;
    };
    notificationPreferences?: {
        email?: boolean;
        reminders?: boolean;
        projectUpdates?: boolean;
        [key: string]: any;
    };
    appPreferences?: {
        compactMode?: boolean;
        defaultView?: string;
        [key: string]: any;
    };
}


export interface BoardColumn {
    id: string;
    title: string;
    status: string;
    visible: boolean;
}

export interface Project {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    owner: number;
    boardSettings?: { columns: BoardColumn[] };
    boardColumns?: BoardColumn[];
    members?: ProjectMember[];
    memberCount?: number;
}

export interface ProjectMember {
    id: string;
    userId: number;
    username: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    invitedAt: string;
    invitedById?: number;
    accepted: boolean;
}

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

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
    startDate?: string;
    dueDate?: string;
    projectId?: number;
    owner: number;
    tags?: Tag[];
    subtasks?: Subtask[];
    createdAt: string;
    updatedAt: string;
}
