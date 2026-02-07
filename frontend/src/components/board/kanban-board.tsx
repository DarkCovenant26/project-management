'use client';

import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Task, TaskStatus } from '@/lib/types';
import { updateTaskStatus } from '@/services/tasks';
import { BoardColumn } from './board-column';
import { DragOverlayCard } from './drag-overlay-card';

interface KanbanBoardProps {
    tasks: Task[];
    projectId?: number;
}

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'backlog', title: 'Backlog', color: 'hsl(220 14% 50%)' },
    { id: 'in_progress', title: 'In Progress', color: 'hsl(210 100% 50%)' },
    { id: 'review', title: 'Review', color: 'hsl(45 100% 50%)' },
    { id: 'done', title: 'Done', color: 'hsl(142 76% 36%)' },
];

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const queryClient = useQueryClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { mutate: updateStatus } = useMutation({
        mutationFn: ({ taskId, status }: { taskId: number; status: TaskStatus }) =>
            updateTaskStatus(taskId, status),
        onMutate: async ({ taskId, status }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
            const previousData = queryClient.getQueryData(['tasks', projectId]);

            queryClient.setQueryData(['tasks', projectId], (old: any) => {
                if (!old?.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        results: page.results.map((t: Task) =>
                            t.id === taskId ? { ...t, status } : t
                        ),
                    })),
                };
            });

            return { previousData };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['tasks', projectId], context?.previousData);
            toast.error('Failed to update task status');
        },
        onSuccess: () => {
            toast.success('Task moved');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        },
    });

    const tasksByStatus = useMemo(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            backlog: [],
            in_progress: [],
            review: [],
            done: [],
        };

        tasks.forEach(task => {
            const status = task.status || 'backlog';
            if (grouped[status]) {
                grouped[status].push(task);
            } else {
                grouped.backlog.push(task);
            }
        });

        return grouped;
    }, [tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = active.id as number;
        const overId = over.id;

        // Check if dropped on a column
        const newStatus = COLUMNS.find(col => col.id === overId)?.id;

        if (newStatus) {
            const task = tasks.find(t => t.id === taskId);
            if (task && task.status !== newStatus) {
                updateStatus({ taskId, status: newStatus });
            }
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id;

        // Find which column the task is being dragged over
        const overColumn = COLUMNS.find(col => col.id === overId);
        if (overColumn) {
            // Will be handled in dragEnd
            return;
        }

        // If over another task, find its column
        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
            const activeTask = tasks.find(t => t.id === activeId);
            if (activeTask && activeTask.status !== overTask.status) {
                // Optimistically move to new column
                updateStatus({ taskId: activeId, status: overTask.status });
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 px-1">
                {COLUMNS.map(column => (
                    <BoardColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        color={column.color}
                        tasks={tasksByStatus[column.id]}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <DragOverlayCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
