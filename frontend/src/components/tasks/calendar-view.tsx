'use client';

import React, { useMemo, useState } from 'react';
import { Task } from '@/lib/types';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Target, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/auth';

interface CalendarViewProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export const CalendarView = React.memo(({ tasks, onTaskClick }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [focusMode, setFocusMode] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
    });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const filteredTasks = useMemo(() => {
        if (!focusMode) return tasks;
        // Focus Mode filters: Urgent or High Priority or My Tasks (simplified)
        return tasks.filter(t =>
            t.priority === 'High' ||
            (t.dueDate && isSameDay(new Date(t.dueDate), new Date())) ||
            !t.isCompleted
        );
    }, [tasks, focusMode]);

    const getTasksForDay = (day: Date) => {
        return filteredTasks.filter(task => {
            const date = task.dueDate || task.startDate;
            return date && isSameDay(new Date(date), day);
        });
    };

    return (
        <div className="flex flex-col h-full bg-card rounded-xl border border-sidebar-border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold tracking-tight">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold" onClick={() => setCurrentDate(new Date())}>
                            Today
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant={focusMode ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "h-8 gap-2 transition-all duration-300",
                            focusMode ? "bg-primary shadow-lg ring-2 ring-primary/20 scale-105" : ""
                        )}
                        onClick={() => setFocusMode(!focusMode)}
                    >
                        <Target className={cn("h-4 w-4", focusMode && "animate-pulse")} />
                        <span className="text-xs font-bold">{focusMode ? "Focus Mode ON" : "Personal Focus"}</span>
                    </Button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b bg-muted/10">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto custom-scrollbar min-h-0">
                {calendarDays.map((day, idx) => {
                    const dayTasks = getTasksForDay(day);
                    const isOutsideMonth = !isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "min-h-[120px] p-2 border-r border-b border-sidebar-border/30 flex flex-col gap-1 transition-colors hover:bg-muted/5",
                                isOutsideMonth ? "bg-muted/5 text-muted-foreground/30" : "bg-card",
                                isToday(day) ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : "",
                                (idx + 1) % 7 === 0 ? "border-r-0" : ""
                            )}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className={cn(
                                    "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all",
                                    isToday(day) ? "bg-primary text-primary-foreground scale-110 shadow-md" : ""
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-tighter">
                                        {dayTasks.length} Tasks
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1 overflow-y-auto no-scrollbar max-h-[100px]">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => onTaskClick?.(task)}
                                        className={cn(
                                            "group relative p-1.5 rounded-md text-[10px] font-semibold truncate cursor-pointer transition-all hover:translate-x-0.5",
                                            task.isCompleted ? "opacity-40 grayscale" : "",
                                            task.priority === 'High' ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                                                task.priority === 'Medium' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                                                    "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-1">
                                            {task.priority === 'High' && <Zap className="h-2 w-2 shrink-0 animate-pulse text-red-500" />}
                                            <span className="truncate">{task.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

CalendarView.displayName = 'CalendarView';
