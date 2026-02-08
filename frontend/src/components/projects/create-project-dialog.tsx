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

import { cn } from '@/lib/utils';

interface CreateProjectDialogProps {
    hideText?: boolean;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function CreateProjectDialog({ hideText, className, variant = "ghost" }: CreateProjectDialogProps) {
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
                <Button
                    variant={variant}
                    className={cn(
                        "text-muted-foreground hover:text-sidebar-foreground",
                        hideText ? "h-8 w-8 p-0 flex justify-center" : "w-full justify-start",
                        className
                    )}
                    title={hideText ? "Add Project" : undefined}
                >
                    <Plus className={cn("h-4 w-4", !hideText && "mr-2")} />
                    {!hideText && "Add Project"}
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
