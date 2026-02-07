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
            <div className="space-y-6">
                {/* Project Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{project?.title}</h1>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold opacity-70">
                            {project?.description || 'Project Workspace'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CreateTaskDialog projectId={projectIdNum} />
                    </div>
                </div>

                {/* Tasks Container (Handles view switching, filtering, and tasks) */}
                <TasksContainer projectId={projectIdNum} />
            </div>
        </ErrorBoundary>
    );
}
