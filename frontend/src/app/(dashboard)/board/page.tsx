'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTasks } from '@/services/tasks';
import { getProjects } from '@/services/projects';
import { KanbanBoard } from '@/components/board/kanban-board';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, LayoutGrid } from 'lucide-react';

export default function BoardPage() {
    const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

    const { data: projectsData } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
    });

    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['tasks', selectedProjectId === 'all' ? undefined : Number(selectedProjectId)],
        queryFn: () => getTasks({ projectId: selectedProjectId === 'all' ? undefined : Number(selectedProjectId) }),
    });

    const projects = projectsData?.results || [];
    const tasks = tasksData?.results || [];

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <LayoutGrid className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Kanban Board</h1>
                    </div>

                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            {projects.map(project => (
                                <SelectItem key={project.id} value={String(project.id)}>
                                    {project.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Board */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        projectId={selectedProjectId === 'all' ? undefined : Number(selectedProjectId)}
                    />
                )}
            </div>
        </div>
    );
}
