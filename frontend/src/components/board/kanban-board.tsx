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
    pointerWithin,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

import { Task, TaskStatus, BoardColumn as BoardColumnType, Project } from '@/lib/types';
import { updateTask, createTask, updateTaskStatus } from '@/services/tasks';
import { BoardColumn } from './board-column';
import { DragOverlayCard } from './drag-overlay-card';
import { TaskDetailSheet } from '@/components/tasks/task-detail-sheet';
import { BoardHeader } from './board-header';
import { ViewToggle, ViewPreference } from '@/components/tasks/view-toggle';
import { BoardSettingsDialog } from './board-settings-dialog';

interface KanbanBoardProps {
    tasks: Task[];
    project?: Project;
    projectId?: string | number;
    columns?: BoardColumnType[];
    onColumnsChange?: (columns: BoardColumnType[]) => void;
    view?: ViewPreference;
    onViewChange?: (view: ViewPreference) => void;
}

const DEFAULT_COLUMNS: BoardColumnType[] = [
    { id: 'backlog', title: 'Backlog', status: 'backlog', visible: false },
    { id: 'todo', title: 'To Do', status: 'todo', visible: true },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress', visible: true },
    { id: 'review', title: 'Review', status: 'review', visible: true },
    { id: 'done', title: 'Done', status: 'done', visible: true },
];

const COLUMN_COLORS: Record<string, string> = {
    backlog: 'var(--muted-foreground)',
    todo: 'var(--primary)',
    in_progress: 'var(--primary)',
    review: 'hsl(var(--warning))',
    done: 'hsl(var(--success, 142 76% 36%))',
};

export function KanbanBoard({ tasks, project, projectId, columns: propColumns, onColumnsChange, view = 'board', onViewChange }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [localColumns, setLocalColumns] = useState<BoardColumnType[]>(propColumns || DEFAULT_COLUMNS);
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const queryClient = useQueryClient();

    // Use prop columns if available, otherwise local state
    const columns = propColumns || localColumns;
    const visibleColumns = columns.filter(col => col.visible);

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
        mutationFn: ({ taskId, status }: { taskId: string | number; status: TaskStatus }) =>
            updateTask(taskId, { status }),
        onMutate: async ({ taskId, status }) => {
            const actualProjectId = projectId || project?.id;
            await queryClient.cancelQueries({ queryKey: ['tasks', actualProjectId] });
            const previousData = queryClient.getQueryData(['tasks', actualProjectId]);

            queryClient.setQueryData(['tasks', actualProjectId], (old: any) => {
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
            const actualProjectId = projectId || project?.id;
            queryClient.setQueryData(['tasks', actualProjectId], context?.previousData);
            toast.error('Failed to update task status');
        },
        onSuccess: () => {
            // Success toast removed as requested
        },
        onSettled: () => {
            const actualProjectId = projectId || project?.id;
            queryClient.invalidateQueries({ queryKey: ['tasks', actualProjectId] });
        },
    });

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
            return matchesSearch && matchesPriority;
        });
    }, [tasks, searchQuery, priorityFilter]);

    const tasksByStatus = useMemo(() => {
        const grouped: Record<string, Task[]> = {};

        // Initialize all statuses present in columns
        columns.forEach(col => {
            grouped[col.status] = grouped[col.status] || [];
        });

        filteredTasks.forEach(task => {
            const status = task.status || 'backlog';
            if (grouped[status]) {
                grouped[status].push(task);
            } else {
                // Fallback to first visible column's status
                const fallbackStatus = visibleColumns[0]?.status || 'in_progress';
                grouped[fallbackStatus] = grouped[fallbackStatus] || [];
                grouped[fallbackStatus].push(task);
            }
        });

        return grouped;
    }, [filteredTasks, columns, visibleColumns]);

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

        const taskId = active.id as string;
        const overId = over.id;

        // Check if dropped on a column (by column id or status)
        const column = columns.find(col => col.id === overId || col.status === overId);
        const newStatus = column?.status as TaskStatus;

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

        const activeId = active.id as string;
        const overId = over.id;

        const overColumn = columns.find(col => col.id === overId || col.status === overId);
        if (overColumn) return;

        const overTask = tasks.find(t => t.id === overId);
        if (overTask) {
            const activeTaskData = tasks.find(t => t.id === activeId);
            if (activeTaskData && activeTaskData.status !== overTask.status) {
                updateStatus({ taskId: activeId, status: overTask.status });
            }
        }
    };

    const { mutate: addTask } = useMutation({
        mutationFn: ({ title, status }: { title: string; status: TaskStatus }) =>
            createTask({
                title,
                status,
                projectId: (projectId || project?.id)?.toString()
            }),
        onSuccess: () => {
            const actualProjectId = projectId || project?.id;
            queryClient.invalidateQueries({ queryKey: ['tasks', actualProjectId] });
            toast.success('Task created');
        },
        onError: () => {
            toast.error('Failed to create task');
        },
    });

    const handleColumnsChange = (newColumns: BoardColumnType[]) => {
        setLocalColumns(newColumns);
        onColumnsChange?.(newColumns);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar Row: Filter bar left, View toggles + Settings right */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <BoardHeader
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        columns={columns}
                        onColumnsChange={handleColumnsChange}
                        filterPriority={priorityFilter}
                        onPriorityFilterChange={setPriorityFilter}
                    />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {onViewChange && <ViewToggle view={view} onViewChange={onViewChange} />}
                    {project && (
                        <BoardSettingsDialog
                            projectId={project.id}
                            columns={columns}
                            onColumnsChange={handleColumnsChange}
                        />
                    )}
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
            >
                <div className="flex gap-6 overflow-x-auto pb-6 px-1 no-scrollbar">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {visibleColumns.map((column, index) => (
                            <motion.div
                                key={column.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.25, delay: index * 0.05 }}
                            >
                                <BoardColumn
                                    id={column.id}
                                    title={column.title}
                                    color={COLUMN_COLORS[column.status] || 'hsl(220 14% 50%)'}
                                    tasks={tasksByStatus[column.status] || []}
                                    onTaskClick={setSelectedTask}
                                    onAddTask={(title) => addTask({ title, status: column.status as TaskStatus })}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeTask ? (
                        <div className="shadow-2xl">
                            <DragOverlayCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>

                {selectedTask && (
                    <TaskDetailSheet
                        task={selectedTask}
                        open={!!selectedTask}
                        onClose={() => setSelectedTask(null)}
                    />
                )}
            </DndContext>
        </div>
    );
}
