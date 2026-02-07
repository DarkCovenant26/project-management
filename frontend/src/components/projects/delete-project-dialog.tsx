'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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
import { deleteProject } from '@/services/projects';
import { Project } from '@/lib/types';

interface DeleteProjectDialogProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteProjectDialog({ project, open, onOpenChange }: DeleteProjectDialogProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutate, isPending } = useMutation({
        mutationFn: () => deleteProject(project.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project and all associated tasks deleted');
            onOpenChange(false);
            router.push('/dashboard'); // Or wherever appropriate
        },
        onError: () => {
            toast.error('Failed to delete project');
        }
    });

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        Delete Project?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete "<strong>{project.title}</strong>" and
                        <span className="text-destructive font-semibold"> all tasks associated with it</span>.
                        This action is irreversible.
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
                        {isPending ? 'Deleting...' : 'Delete Project & Tasks'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
