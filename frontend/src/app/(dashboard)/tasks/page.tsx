'use client';

import { TasksContainer } from '@/components/tasks/tasks-container';
import { ListTodo } from 'lucide-react';

export default function TasksPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <ListTodo className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold opacity-70">Global Command Center</p>
                </div>
            </div>

            {/* Main Content Area */}
            <TasksContainer />
        </div>
    );
}
