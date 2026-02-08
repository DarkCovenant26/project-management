'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BoardColumn } from '@/lib/types';
import { updateBoardSettings } from '@/services/projects';
import { cn } from '@/lib/utils';

interface BoardSettingsDialogProps {
    projectId: string | number;
    columns: BoardColumn[];
    onColumnsChange?: (columns: BoardColumn[]) => void;
}

export function BoardSettingsDialog({ projectId, columns: initialColumns, onColumnsChange }: BoardSettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [columns, setColumns] = useState<BoardColumn[]>(initialColumns);
    const queryClient = useQueryClient();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { mutate: saveSettings, isPending } = useMutation({
        mutationFn: () => updateBoardSettings(projectId, columns),
        onSuccess: () => {
            toast.success('Board settings saved!');
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            onColumnsChange?.(columns);
            setOpen(false);
        },
        onError: () => {
            toast.error('Failed to save settings');
        }
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setColumns((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const updateColumn = (id: string, updates: Partial<BoardColumn>) => {
        setColumns(cols => cols.map(col => col.id === id ? { ...col, ...updates } : col));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    Customize Board
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Board Settings</DialogTitle>
                    <DialogDescription>
                        Customize your board columns. Drag to reorder, rename, or hide columns.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={columns.map(c => c.id)} strategy={verticalListSortingStrategy}>
                            {columns.map((column) => (
                                <SortableColumnItem
                                    key={column.id}
                                    column={column}
                                    onUpdate={(updates) => updateColumn(column.id, updates)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => saveSettings()} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface SortableColumnItemProps {
    column: BoardColumn;
    onUpdate: (updates: Partial<BoardColumn>) => void;
}

function SortableColumnItem({ column, onUpdate }: SortableColumnItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 p-3 rounded-lg border bg-card",
                isDragging && "opacity-50 shadow-lg",
                !column.visible && "opacity-60"
            )}
        >
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
            </button>

            <Input
                value={column.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="flex-1 h-8 bg-transparent border-none shadow-none focus-visible:ring-0 px-0 font-medium"
            />

            <div className="flex items-center gap-2">
                <Label htmlFor={`wip-${column.id}`} className="sr-only">WIP Limit</Label>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/30 border border-white/5">
                    <span className="text-[10px] font-bold text-muted-foreground/60">WIP</span>
                    <input
                        id={`wip-${column.id}`}
                        type="number"
                        min="1"
                        max="99"
                        value={column.wipLimit || ''}
                        onChange={(e) => onUpdate({ wipLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-8 h-4 bg-transparent border-none text-[10px] font-mono font-bold focus:ring-0 p-0 text-center"
                        placeholder="∞"
                    />
                </div>
                <Label htmlFor={`visible-${column.id}`} className="sr-only">Visible</Label>
                <button
                    onClick={() => onUpdate({ visible: !column.visible })}
                    className={cn(
                        "p-1.5 rounded-md transition-colors",
                        column.visible ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
                    )}
                >
                    {column.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}
