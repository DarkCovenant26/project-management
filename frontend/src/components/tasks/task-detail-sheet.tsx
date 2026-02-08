'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTask } from '@/services/tasks';
import { addTaskTag, removeTaskTag } from '@/services/tags';
import { X, Calendar, User, Tag as TagIcon, ListChecks, Activity as ActivityIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/lib/types';
import { SubtaskList } from '@/components/subtasks/subtask-list';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { TagPicker } from '@/components/ui/tag-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskDetailSheetProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

const priorityColors: Record<string, string> = {
    Critical: 'bg-red-600/20 text-red-600 border-red-600/30',
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const statusLabels: Record<string, string> = {
    backlog: 'Backlog',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
};

export function TaskDetailSheet({ task: initialTask, open, onClose }: TaskDetailSheetProps) {
    const queryClient = useQueryClient();

    const { data: task, isLoading, isFetching } = useQuery({
        queryKey: ['task', initialTask?.id],
        queryFn: () => getTask(initialTask!.id),
        enabled: !!initialTask?.id,
        initialData: initialTask,
    });

    const { mutate: addTag } = useMutation({
        mutationFn: (tagId: number | string) => addTaskTag(task!.id, tagId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', task?.id] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Update lists too
            toast.success('Tag added');
        },
        onError: () => toast.error('Failed to add tag'),
    });

    const { mutate: removeTag } = useMutation({
        mutationFn: (tagId: number | string) => removeTaskTag(task!.id, tagId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['task', task?.id] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Tag removed');
        },
        onError: () => toast.error('Failed to remove tag'),
    });

    if (!open || !task) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold">Task Details</h2>
                    {(isLoading || isFetching) && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Title and status */}
                <div>
                    <h3 className={cn(
                        'text-lg font-semibold',
                        task.isCompleted && 'line-through text-muted-foreground'
                    )}>
                        {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={priorityColors[task.priority]}>
                            {task.priority}
                        </Badge>
                        <Badge variant="secondary">
                            {statusLabels[task.status] || task.status}
                        </Badge>
                    </div>
                </div>

                {/* Description */}
                {task.description && (
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                        <p className="text-sm text-balance">{task.description}</p>
                    </div>
                )}

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-4">
                    {task.dueDate && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(task.dueDate), 'PPP')}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>Owner #{task.owner}</span>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <TagIcon className="h-4 w-4" />
                        Tags
                    </h4>
                    <TagPicker
                        selectedTags={task.tags || []}
                        onAddTag={(tagId) => addTag(tagId)}
                        onRemoveTag={(tagId) => removeTag(tagId)}
                        projectId={task.projectId}
                    />
                </div>

                {/* Tabs for Subtasks and Activity */}
                <Tabs defaultValue="subtasks" className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger value="subtasks" className="flex-1 gap-2">
                            <ListChecks className="h-4 w-4" />
                            Subtasks
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="flex-1 gap-2">
                            <ActivityIcon className="h-4 w-4" />
                            Activity
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="subtasks" className="mt-4">
                        <SubtaskList
                            taskId={task.id}
                            subtasks={task.subtasks || []}
                        />
                    </TabsContent>
                    <TabsContent value="activity" className="mt-4">
                        <ActivityTimeline taskId={task.id} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
