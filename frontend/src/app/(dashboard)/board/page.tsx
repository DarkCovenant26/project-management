'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjects, getProject } from '@/services/projects';
import { TasksContainer } from '@/components/tasks/tasks-container';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function BoardPage() {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

    const { data: projectsData } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
    });

    const { data: selectedProject } = useQuery({
        queryKey: ['project', selectedProjectId],
        queryFn: () => getProject(selectedProjectId),
        enabled: selectedProjectId !== 'all',
    });

    const projects = projectsData?.results || [];

    return (
        <div className="relative min-h-[calc(100vh-80px)]">
            {/* Premium Mesh Gradient Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="space-y-6">
                {/* Page Header - Consistent with Dashboard */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Project Workspace</h1>
                        <p className="text-xs text-muted-foreground">Track progress and manage your workflows.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5 pl-3 border-l border-border/50">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                Project
                            </span>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className={cn(
                                    "w-[200px] h-9 text-sm font-medium",
                                    "bg-card/60 border-white/10 backdrop-blur-sm",
                                    "hover:bg-card hover:border-white/20 transition-all"
                                )}>
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {projects.map(project => (
                                        <SelectItem key={project.id} value={String(project.id)}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <TasksContainer
                    projectId={selectedProjectId === 'all' ? undefined : Number(selectedProjectId)}
                    project={selectedProject}
                />
            </div>
        </div>
    );
}

