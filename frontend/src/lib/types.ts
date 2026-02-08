export interface User {
    id: number; // User ID is still AutoField (int) in standard Django Auth unless custom user model changed it
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
    wipLimit?: number;
}

export interface Project {
    id: string; // UUID
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    owner: number; // User ID is int
    boardSettings?: { columns: BoardColumn[] };
    boardColumns?: BoardColumn[];
    members?: ProjectMember[];
    memberCount?: number;
}

export interface ProjectMember {
    id: string; // UUID
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
    id: string; // UUID
    name: string;
    color: string;
    projectId?: string; // UUID
}

export interface Subtask {
    id: string; // UUID
    title: string;
    isCompleted: boolean;
    order: number;
    taskId: string; // UUID
}

export interface Activity {
    id: string; // UUID
    action: 'created' | 'updated' | 'completed' | 'deleted' | 'status_changed' | 'assigned' | 'tagged' | 'untagged' | 'rearranged' | 'interacted';
    description: string;
    userId: number;
    user?: User;
    taskId?: string; // UUID
    projectId?: string; // UUID
    createdAt: string;
}

export interface Task {
    id: string; // UUID
    title: string;
    description?: string;
    isCompleted: boolean;
    status: TaskStatus;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    task_type: 'Feature' | 'Bug' | 'Chore' | 'Improvement' | 'Story';

    startDate?: string;
    dueDate?: string;
    actualCompletionDate?: string;

    // Agile Metrics
    storyPoints?: number;
    timeEstimate?: number; // hours
    timeSpent?: number; // hours

    projectId?: string; // UUID
    owner: number;
    assignees?: User[];

    // Dependencies
    blocked_by?: Task[];
    blocked_by_ids?: string[];

    tags?: Tag[];
    subtasks?: Subtask[];
    createdAt: string;
    updatedAt: string;
}
