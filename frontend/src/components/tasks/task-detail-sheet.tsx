'use client';

import { useState } from 'react';
import { X, Calendar, User, Tag as TagIcon, ListChecks, Activity as ActivityIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/lib/types';
import { SubtaskList } from '@/components/subtasks/subtask-list';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { TagBadge } from '@/components/tags/tag-badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskDetailSheetProps {
    task: Task;
    open: boolean;
    onClose: () => void;
}

const priorityColors = {
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const statusLabels = {
    backlog: 'Backlog',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
};

export function TaskDetailSheet({ task, open, onClose }: TaskDetailSheetProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-background shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="font-semibold">Task Details</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-57px)] p-4 space-y-6">
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
                        <p className="text-sm">{task.description}</p>
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
                {task.tags && task.tags.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                            <TagIcon className="h-4 w-4" />
                            Tags
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {task.tags.map(tag => (
                                <TagBadge key={tag.id} tag={tag} />
                            ))}
                        </div>
                    </div>
                )}

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
