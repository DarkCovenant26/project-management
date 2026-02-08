'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Task } from '@/lib/types';
import {
    ListChecks,
    ChevronUp,
    ChevronDown,
    Equal,
    Clock,
    Paperclip,
    MessageSquare,
    AlertOctagon
} from 'lucide-react';
import { format, isPast, isToday, addDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

interface SortableTaskCardProps {
    task: Task;
    isDragging?: boolean;
    onClick?: (task: Task) => void;
}

const priorityConfig: Record<string, any> = {
    Critical: {
        icon: <AlertOctagon className="h-3.5 w-3.5" />,
        bg: 'bg-gradient-to-br from-red-600/20 to-pink-600/10',
        border: 'border-red-600/30',
        text: 'text-red-500',
        glow: 'shadow-red-600/20 ring-1 ring-red-500/20'
    },
    High: {
        icon: <ChevronUp className="h-3.5 w-3.5" />,
        bg: 'bg-gradient-to-br from-orange-500/20 to-red-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/20'
    },
    Medium: {
        icon: <Equal className="h-3.5 w-3.5" />,
        bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/20'
    },
    Low: {
        icon: <ChevronDown className="h-3.5 w-3.5" />,
        bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-600/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/20'
    },
};

export function SortableTaskCard({ task, isDragging, onClick }: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSorting,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) : false;
    const isDueSoon = task.dueDate && !isOverdue ? isBefore(new Date(task.dueDate), addDays(new Date(), 3)) : false;

    const priority = priorityConfig[task.priority] || priorityConfig['Medium'];

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick?.(task)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.(task);
                }
            }}
            tabIndex={0}
            role="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'group relative rounded-xl cursor-pointer transition-all duration-300 select-none focus:outline-none focus:ring-2 focus:ring-primary/50',
                'bg-gradient-to-br from-card via-card to-card/90',
                'border border-white/10 hover:border-white/20',
                'shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10',
                (isDragging || isSorting) ? 'opacity-0' : 'opacity-100',
            )}
        >
            {/* Hover Glow Effect */}
            <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Blocked Indicator */}
            {task.blocked_by && task.blocked_by.length > 0 && (
                <div className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm ring-2 ring-background">
                    !
                </div>
            )}

            <div className="relative p-3.5 space-y-3">
                {/* Header: Tags & Story Points */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {task.tags && task.tags.slice(0, 3).map(tag => (
                            <div
                                key={tag.id}
                                className="h-1.5 w-6 rounded-full shadow-sm"
                                style={{
                                    backgroundColor: tag.color,
                                    boxShadow: `0 0 6px ${tag.color}40`
                                }}
                                title={tag.name}
                            />
                        ))}
                    </div>
                    {task.storyPoints !== undefined && task.storyPoints > 0 && (
                        <div className="flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-md bg-muted/50 border border-white/5 text-[10px] font-mono font-medium text-muted-foreground">
                            {task.storyPoints}
                        </div>
                    )}
                </div>

                {/* Title & Priority */}
                <div className="flex items-start justify-between gap-3">
                    <h4 className={cn(
                        'text-sm font-semibold leading-snug tracking-tight text-foreground',
                        task.isCompleted && 'line-through text-muted-foreground/70'
                    )}>
                        {task.title}
                    </h4>
                    <div className={cn(
                        "flex items-center justify-center h-6 w-6 rounded-lg border shrink-0 shadow-sm",
                        priority.bg, priority.border, priority.text, priority.glow
                    )}>
                        {priority.icon}
                    </div>
                </div>

                {/* Description */}
                {task.description && (
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {/* Subtask Progress */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                            <span className="flex items-center gap-1.5">
                                <ListChecks className="h-3.5 w-3.5" />
                                Progress
                            </span>
                            <span className="tabular-nums">
                                {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${(task.subtasks.filter(st => st.isCompleted).length / task.subtasks.length) * 100}%`
                                }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                            />
                        </div>
                    </div>
                )}

                {/* Footer Meta */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2.5">
                        {/* Due Date */}
                        {task.dueDate && (
                            <div className={cn(
                                "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md",
                                isOverdue
                                    ? "bg-red-500/15 text-red-400 border border-red-500/20"
                                    : isDueSoon
                                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                        : "bg-muted/50 text-muted-foreground border border-white/5"
                            )}>
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                            </div>
                        )}
                    </div>

                    {/* Assignees Avatars */}
                    <div className="flex items-center -space-x-2">
                        {task.assignees && task.assignees.length > 0 ? (
                            task.assignees.slice(0, 3).map((assignee, i) => (
                                <div
                                    key={assignee.id}
                                    className={cn(
                                        "h-6 w-6 rounded-full flex items-center justify-center border-2 border-background",
                                        "bg-gradient-to-br from-violet-500 to-purple-600",
                                        "text-[9px] font-bold text-white uppercase",
                                        "shadow-sm"
                                    )}
                                    title={assignee.username || assignee.email}
                                    style={{ zIndex: 3 - i }}
                                >
                                    {(assignee.first_name?.[0] || assignee.username?.[0] || 'U').toUpperCase()}
                                </div>
                            ))
                        ) : (
                            task.owner && (
                                <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center border-2 border-background",
                                    "bg-gradient-to-br from-gray-500 to-slate-600",
                                    "text-[9px] font-bold text-white uppercase",
                                    "shadow-sm"
                                )} title="Owner">
                                    {(String(task.owner)[0] || 'U').toUpperCase()}
                                </div>
                            )
                        )}
                        {task.assignees && task.assignees.length > 3 && (
                            <div className="h-6 w-6 rounded-full flex items-center justify-center border-2 border-background bg-muted text-[8px] font-bold text-muted-foreground z-0">
                                +{task.assignees.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

