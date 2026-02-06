'use client';

import { useQuery } from '@tanstack/react-query';
import { use, useState, useMemo } from 'react';
import { getProject } from '@/services/projects';
import { getTasks, updateTask } from '@/services/tasks';
import { TaskForm } from '@/components/task-form';
import { TaskControls } from '@/components/task-controls';
import { TaskCard } from '@/components/task-card';

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const projectId = resolvedParams.id;
    const projectIdNum = parseInt(projectId);

    // State for controls
    const [search, setSearch] = useState('');
    const [priority, setPriority] = useState('all');
    const [status, setStatus] = useState('all');

    const { data: project, isLoading: isLoadingProject } = useQuery({
        queryKey: ['projects', projectId],
        queryFn: () => getProject(projectId),
    });

    const { data: tasks, isLoading: isLoadingTasks, refetch } = useQuery({
        queryKey: ['tasks', projectIdNum],
        queryFn: () => getTasks(projectId),
        enabled: !!projectId,
    });

    // Client-side filtering logic
    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter((task) => {
            const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                task.description?.toLowerCase().includes(search.toLowerCase());
            const matchesPriority = priority === 'all' || task.priority === priority;
            const matchesStatus = status === 'all' ||
                (status === 'completed' && task.isCompleted) ||
                (status === 'active' && !task.isCompleted);

            return matchesSearch && matchesPriority && matchesStatus;
        });
    }, [tasks, search, priority, status]);

    const handleToggle = async (taskId: number, currentStatus: boolean) => {
        try {
            await updateTask(String(taskId), { isCompleted: !currentStatus });
            refetch();
        } catch (error) {
            console.error('Failed to update task status', error);
        }
    };

    if (isLoadingProject) return <div className="p-8 text-center text-muted-foreground">Loading project details...</div>;

    return (
        <div className="flex h-full flex-col bg-background text-foreground">
            <div className="flex items-center justify-between border-b border-border p-6 bg-card/50 backdrop-blur-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
                    <p className="text-muted-foreground">{project?.description}</p>
                </div>
                <TaskForm projectId={projectIdNum} />
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                <TaskControls
                    search={search} setSearch={setSearch}
                    priority={priority} setPriority={setPriority}
                    status={status} setStatus={setStatus}
                />

                {isLoadingTasks ? (
                    <div className="text-center py-10 text-muted-foreground">Loading tasks...</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                        <p>No tasks found.</p>
                        {search || priority !== 'all' || status !== 'all' ? (
                            <p className="text-sm">Try adjusting your filters.</p>
                        ) : (
                            <p className="text-sm">Create one to get started.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {filteredTasks.map((task) => (
                            <TaskCard key={task.id} task={task} onToggle={handleToggle} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
