'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import {
    format,
    addDays,
    startOfToday,
    differenceInDays,
    addHours,
    differenceInHours,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { updateTask } from '@/services/tasks';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TimelineViewProps {
    tasks: Task[];
    projectId?: string | number;
}

const DAY_WIDTH = 100;
const TIMELINE_DAYS = 28;

export const TimelineView = React.memo(({ tasks, projectId }: TimelineViewProps) => {
    const queryClient = useQueryClient();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<{
        taskId: string | number;
        initialX: number;
        startX: number;
        width: number;
    } | null>(null);

    const startDate = useMemo(() => startOfToday(), []);
    const days = useMemo(() =>
        Array.from({ length: TIMELINE_DAYS }).map((_, i) => addDays(startDate, i)),
        [startDate]);

    const { mutate: performUpdate } = useMutation({
        mutationFn: ({ id, data }: { id: string | number, data: Partial<Task> }) => updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            toast.success('Task rescheduled');
        },
        onError: () => toast.error('Failed to reschedule task'),
    });

    const getTaskStyle = (task: Task) => {
        if (!task.startDate && !task.dueDate) return null;

        const taskStart = task.startDate ? new Date(task.startDate) : (task.dueDate ? addDays(new Date(task.dueDate), -1) : startDate);
        const taskEnd = task.dueDate ? new Date(task.dueDate) : addDays(taskStart, 1);

        const startDiff = differenceInHours(taskStart, startDate) / 24;
        const duration = Math.max(0.5, differenceInHours(taskEnd, taskStart) / 24);

        return {
            left: startDiff * DAY_WIDTH,
            width: duration * DAY_WIDTH,
        };
    };

    const handleMouseDown = (e: React.MouseEvent, task: Task) => {
        const style = getTaskStyle(task);
        if (!style) return;

        setDragging({
            taskId: task.id,
            initialX: style.left,
            startX: e.clientX,
            width: style.width,
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragging) return;

            const deltaX = e.clientX - dragging.startX;
            const newX = dragging.initialX + deltaX;

            const element = document.getElementById(`ghost-${dragging.taskId}`);
            if (element) {
                element.style.left = `${newX}px`;
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (!dragging) return;

            const deltaX = e.clientX - dragging.startX;
            const finalX = dragging.initialX + deltaX;

            // Snap to nearest half day
            const daysShift = Math.round((finalX / DAY_WIDTH) * 2) / 2;
            const newStart = addHours(startDate, daysShift * 24);

            const task = tasks.find(t => t.id === dragging.taskId);
            if (task) {
                const durationHours = dragging.width / DAY_WIDTH * 24;
                const newEnd = addHours(newStart, durationHours);

                performUpdate({
                    id: task.id,
                    data: {
                        startDate: newStart.toISOString(),
                        dueDate: newEnd.toISOString(),
                    }
                });
            }

            setDragging(null);
        };

        if (dragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging, startDate, performUpdate, tasks]);

    return (
        <div className="relative border rounded-lg overflow-hidden bg-card shadow-sm h-[600px] flex flex-col">
            <div className="flex border-b bg-muted/30 sticky top-0 z-10 shrink-0">
                <div className="w-48 shrink-0 border-r bg-muted/50 p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Tasks
                </div>
                <div className="flex-1 overflow-x-auto custom-scrollbar no-scrollbar" ref={scrollContainerRef}>
                    <div className="flex" style={{ width: TIMELINE_DAYS * DAY_WIDTH }}>
                        {days.map((day) => (
                            <div
                                key={day.toISOString()}
                                className={cn(
                                    "shrink-0 border-r flex flex-col items-center justify-center py-3",
                                    differenceInDays(day, startOfToday()) === 0 ? "bg-primary/5" : ""
                                )}
                                style={{ width: DAY_WIDTH }}
                            >
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/50">
                                    {format(day, 'EEE')}
                                </span>
                                <span className={cn(
                                    "text-sm font-medium",
                                    differenceInDays(day, startOfToday()) === 0 ? "text-primary font-bold underline underline-offset-4" : ""
                                )}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
                <div className="flex min-h-full">
                    <div className="w-48 shrink-0 border-r bg-card sticky left-0 z-5 pt-2">
                        {tasks.map(task => (
                            <div key={task.id} className="h-14 px-4 flex items-center border-b border-sidebar-border/30">
                                <span className="text-xs font-semibold truncate whitespace-nowrap" title={task.title}>
                                    {task.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="relative" style={{ width: TIMELINE_DAYS * DAY_WIDTH }}>
                        <div className="absolute inset-0 flex pointer-events-none">
                            {days.map(day => (
                                <div key={day.toISOString()} className="h-full border-r border-sidebar-border/20" style={{ width: DAY_WIDTH }} />
                            ))}
                        </div>

                        <div className="pt-2">
                            {tasks.map(task => {
                                const style = getTaskStyle(task);
                                if (!style) return <div key={task.id} className="h-14" />;

                                const isDragging = dragging?.taskId === task.id;

                                return (
                                    <div key={task.id} className="h-14 flex items-center relative group">
                                        <div
                                            onMouseDown={(e) => handleMouseDown(e, task)}
                                            id={isDragging ? `ghost-${task.id}` : undefined}
                                            className={cn(
                                                "absolute h-8 rounded-lg flex items-center px-3 cursor-move transition-shadow select-none",
                                                task.status === 'done' ? "bg-green-500/10 border border-green-500/40 text-green-700 dark:text-green-400" :
                                                    task.priority === 'High' ? "bg-red-500/10 border border-red-500/40 text-red-700 dark:text-red-400" :
                                                        "bg-primary/10 border border-primary/40 text-primary-foreground",
                                                "hover:shadow-lg hover:ring-2 hover:ring-primary/20",
                                                isDragging && "z-50 opacity-80 shadow-2xl ring-4 ring-primary/30"
                                            )}
                                            style={{
                                                left: `${style.left}px`,
                                                width: `${style.width}px`,
                                            }}
                                        >
                                            <span className="text-[10px] font-bold truncate">
                                                {format(new Date(task.startDate || startDate), 'h:mm a')}
                                            </span>
                                            <div className="absolute -bottom-1 left-3 right-3 h-1.5 bg-current/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-current/40 w-[60%]" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

TimelineView.displayName = 'TimelineView';
