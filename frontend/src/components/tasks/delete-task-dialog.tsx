'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteTask } from '@/services/tasks';
import { Task } from '@/lib/types';

interface DeleteTaskDialogProps {
    task: Task;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteTaskDialog({ task, open, onOpenChange }: DeleteTaskDialogProps) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: () => deleteTask(task.id),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['tasks', task.projectId] });
            const previousTasks = queryClient.getQueryData(['tasks', task.projectId]);

            queryClient.setQueryData(['tasks', task.projectId], (old: any) => {
                if (!old || !old.results) return old;
                return {
                    ...old,
                    results: old.results.filter((t: Task) => t.id !== task.id),
                };
            });

            return { previousTasks };
        },
        onError: (err, newData, context) => {
            queryClient.setQueryData(['tasks', task.projectId], context?.previousTasks);
            toast.error('Failed to delete task');
        },
        onSuccess: () => {
            toast.success('Task deleted successfully');
            onOpenChange(false);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', task.projectId] });
        },
    });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the task "<strong>{task.title}</strong>".
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            mutate();
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={isPending}
                    >
                        {isPending ? 'Deleting...' : 'Delete Task'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
