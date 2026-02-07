'use client';

import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { getProject } from '@/services/projects';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { TasksContainer } from '@/components/tasks/tasks-container';
import { ErrorBoundary } from '@/components/error-boundary';
import { Loader2 } from 'lucide-react';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const projectId = resolvedParams.id;
    const projectIdNum = parseInt(projectId);

    const { data: project, isLoading: isLoadingProject } = useQuery({
        queryKey: ['projects', projectId],
        queryFn: () => getProject(projectId),
    });

    if (isLoadingProject) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="flex h-full flex-col bg-background text-foreground">
                {/* Project Header */}
                <div className="flex items-center justify-between border-b border-border p-6 bg-card/50 backdrop-blur-sm">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
                        <p className="text-muted-foreground">{project?.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreateTaskDialog projectId={projectIdNum} />
                    </div>
                </div>

                {/* Tasks Container (Handles view switching, filtering, and tasks) */}
                <div className="flex-1 overflow-auto p-6">
                    <TasksContainer projectId={projectIdNum} />
                </div>
            </div>
        </ErrorBoundary>
    );
}
