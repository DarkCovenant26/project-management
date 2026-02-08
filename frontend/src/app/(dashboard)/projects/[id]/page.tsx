'use client';

import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { getProject } from '@/services/projects';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { TasksContainer } from '@/components/tasks/tasks-container';
import { ErrorBoundary } from '@/components/error-boundary';
import { Loader2, Folder } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const projectId = resolvedParams.id;

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
                <PageHeader
                    title={project?.title || 'Project'}
                    description={project?.description || 'Project Workspace'}
                    icon={Folder}
                >
                    <CreateTaskDialog projectId={projectId} />
                </PageHeader>

                {/* Tasks Container (Handles view switching, filtering, and tasks) */}
                <TasksContainer projectId={projectId} />
            </div>
        </ErrorBoundary>
    );
}
