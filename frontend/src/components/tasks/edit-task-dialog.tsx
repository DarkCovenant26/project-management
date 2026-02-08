'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { TaskForm } from '@/components/task-form';
import { updateTask } from '@/services/tasks';
import { Task } from '@/lib/types';
import { TaskFormValues } from '@/lib/validations/task';

interface EditTaskDialogProps {
    task: Task;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: TaskFormValues) => {
            const payload = {
                ...data,
                startDate: data.startDate?.toISOString(),
                dueDate: data.dueDate?.toISOString(),
                actualCompletionDate: data.actualCompletionDate?.toISOString(),
                tag_ids: data.tagIds,
                assignee_ids: data.assigneeIds,
                blocked_by_ids: data.blockedByIds,
            };
            return updateTask(task.id, payload as unknown as Partial<Task>);
        },
        onMutate: async (newData) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['tasks', task.projectId] });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData(['tasks', task.projectId]);

            // Optimistically update to the new value
            queryClient.setQueryData(['tasks', task.projectId], (old: any) => {
                if (!old || !old.results) return old;
                return {
                    ...old,
                    results: old.results.map((t: Task) =>
                        t.id === task.id ? { ...t, ...newData, dueDate: newData.dueDate?.toISOString() } : t
                    ),
                };
            });

            return { previousTasks };
        },
        onError: (err, newData, context) => {
            queryClient.setQueryData(['tasks', task.projectId], context?.previousTasks);
            toast.error('Failed to update task');
        },
        onSuccess: () => {
            toast.success('Task updated successfully');
            onOpenChange(false);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', task.projectId] });
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <TaskForm
                    projectId={task.projectId || 0}
                    initialData={task}
                    onSubmit={mutate}
                    isSubmitting={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
