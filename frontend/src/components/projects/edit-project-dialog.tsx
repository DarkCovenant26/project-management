'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ProjectForm } from '@/components/projects/project-form';
import { updateProject } from '@/services/projects';
import { Project } from '@/lib/types';
import { ProjectFormValues } from '@/lib/validations/project';

interface EditProjectDialogProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({ project, open, onOpenChange }: EditProjectDialogProps) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: ProjectFormValues) => updateProject(project.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['projects', String(project.id)] });
            toast.success('Project updated successfully');
            onOpenChange(false);
        },
        onError: () => {
            toast.error('Failed to update project');
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                </DialogHeader>
                <ProjectForm
                    initialData={project}
                    onSubmit={mutate}
                    isSubmitting={isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
