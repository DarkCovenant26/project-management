'use client';

import { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Subtask } from '@/lib/types';
import { createSubtask, updateSubtask, deleteSubtask, reorderSubtasks } from '@/services/subtasks';
import { SubtaskItem } from './subtask-item';
import { AddSubtaskInput } from './add-subtask-input';
import { SubtaskProgress } from './subtask-progress';
import { Button } from '@/components/ui/button';

interface SubtaskListProps {
    taskId: string | number;
    subtasks: Subtask[];
    onSubtasksChange?: (subtasks: Subtask[]) => void;
}

export function SubtaskList({ taskId, subtasks: initialSubtasks, onSubtasksChange }: SubtaskListProps) {
    const [subtasks, setSubtasks] = useState(initialSubtasks);
    const [isExpanded, setIsExpanded] = useState(true);
    const queryClient = useQueryClient();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const { mutate: addSubtask } = useMutation({
        mutationFn: (title: string) => createSubtask(taskId, { title, order: subtasks.length }),
        onSuccess: (newSubtask) => {
            const updated = [...subtasks, newSubtask];
            setSubtasks(updated);
            onSubtasksChange?.(updated);
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
        },
        onError: () => toast.error('Failed to add subtask'),
    });

    const { mutate: toggleSubtask } = useMutation({
        mutationFn: (id: string) => {
            const subtask = subtasks.find(s => s.id === id);
            return updateSubtask(taskId, id, { isCompleted: !subtask?.isCompleted });
        },
        onMutate: (id: string) => {
            const updated = subtasks.map(s =>
                s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
            );
            setSubtasks(updated);
            onSubtasksChange?.(updated);
        },
        onError: () => toast.error('Failed to update subtask'),
    });

    const { mutate: updateTitle } = useMutation({
        mutationFn: ({ id, title }: { id: string; title: string }) =>
            updateSubtask(taskId, id, { title }),
        onMutate: ({ id, title }) => {
            const updated = subtasks.map(s =>
                s.id === id ? { ...s, title } : s
            );
            setSubtasks(updated);
            onSubtasksChange?.(updated);
        },
        onError: () => toast.error('Failed to update subtask'),
    });

    const { mutate: removeSubtask } = useMutation({
        mutationFn: (id: string) => deleteSubtask(taskId, id),
        onMutate: (id: string) => {
            const updated = subtasks.filter(s => s.id !== id);
            setSubtasks(updated);
            onSubtasksChange?.(updated);
        },
        onError: () => toast.error('Failed to delete subtask'),
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = subtasks.findIndex(s => s.id === active.id);
        const newIndex = subtasks.findIndex(s => s.id === over.id);

        const reordered = arrayMove(subtasks, oldIndex, newIndex);
        setSubtasks(reordered);
        onSubtasksChange?.(reordered);

        // Map existing subtask IDs which are strings
        reorderSubtasks(taskId, reordered.map(s => s.id));
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </Button>
                <span className="text-sm font-medium">Subtasks</span>
                <div className="flex-1">
                    <SubtaskProgress subtasks={subtasks} />
                </div>
            </div>

            {isExpanded && (
                <div className="space-y-1 pl-4">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={subtasks.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {subtasks.map(subtask => (
                                <SubtaskItem
                                    key={subtask.id}
                                    subtask={subtask}
                                    onToggle={toggleSubtask}
                                    onUpdate={(id, title) => updateTitle({ id, title })}
                                    onDelete={removeSubtask}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <AddSubtaskInput onAdd={addSubtask} />
                </div>
            )}
        </div>
    );
}
