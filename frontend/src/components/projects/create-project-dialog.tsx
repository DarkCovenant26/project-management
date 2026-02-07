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
import { ProjectForm } from './project-form';
import { createProject } from '@/services/projects';
import { ProjectFormValues } from '@/lib/validations/project';

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project created successfully');
            setOpen(false);
        },
        onError: () => {
            toast.error('Failed to create project');
        }
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                </DialogHeader>
                <ProjectForm
                    onSubmit={mutate}
                    isSubmitting={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
