'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, CheckCircle, Trash2, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { bulkAction } from '@/services/tasks';
import { TaskStatus } from '@/lib/types';

interface BulkActionBarProps {
    selectedCount: number;
    selectedIds: Set<string | number>;
    onClear: () => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
];

export function BulkActionBar({ selectedCount, selectedIds, onClear }: BulkActionBarProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const queryClient = useQueryClient();

    const { mutate: performBulkAction, isPending } = useMutation({
        mutationFn: ({ action, data }: { action: string; data?: Record<string, unknown> }) =>
            bulkAction([...selectedIds], action, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            onClear();

            const actionLabels: Record<string, string> = {
                complete: 'marked as complete',
                delete: 'deleted',
                set_status: 'status updated',
            };
            toast.success(`${selectedCount} tasks ${actionLabels[variables.action] || 'updated'}`);
        },
        onError: () => {
            toast.error('Failed to perform bulk action');
        },
    });

    if (selectedCount === 0) return null;

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg border bg-background/95 backdrop-blur-sm px-4 py-3 shadow-lg">
                <span className="text-sm font-medium">
                    {selectedCount} selected
                </span>

                <div className="h-4 w-px bg-border mx-2" />

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => performBulkAction({ action: 'complete' })}
                    disabled={isPending}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" disabled={isPending}>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Set Status
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {STATUS_OPTIONS.map(option => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => performBulkAction({ action: 'set_status', data: { status: option.value } })}
                            >
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isPending}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </Button>

                <div className="h-4 w-px bg-border mx-2" />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onClear}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedCount} tasks?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. All selected tasks will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                performBulkAction({ action: 'delete' });
                                setShowDeleteConfirm(false);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
