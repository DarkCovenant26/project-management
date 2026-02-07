'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/task-form';
import { createTask } from '@/services/tasks';
import { Task } from '@/lib/types';
import { TaskFormValues } from '@/lib/validations/task';

interface CreateTaskDialogProps {
    projectId: number;
}

export function CreateTaskDialog({ projectId }: CreateTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: TaskFormValues) => createTask({
            ...data,
            dueDate: data.dueDate?.toISOString(),
        } as Partial<Task>),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            toast.success('Task created successfully');
            setOpen(false);
        },
        onError: () => {
            toast.error('Failed to create task');
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                </DialogHeader>
                <TaskForm
                    projectId={projectId}
                    onSubmit={mutate}
                    isSubmitting={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
