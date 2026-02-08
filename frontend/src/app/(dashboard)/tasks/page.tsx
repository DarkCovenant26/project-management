'use client';

import { TasksContainer } from '@/components/tasks/tasks-container';
import { ListTodo } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

export default function TasksPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="My Tasks"
                description="Global Command Center"
                icon={ListTodo}
            />

            {/* Main Content Area */}
            <TasksContainer />
        </div>
    );
}
