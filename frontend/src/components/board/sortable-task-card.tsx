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
    AlertOctagon,
    MoreHorizontal
} from 'lucide-react';
import { format, isPast, isToday, addDays, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SortableTaskCardProps {
    task: Task;
    isDragging?: boolean;
    onClick?: (task: Task) => void;
    isSelected?: boolean;
    onToggleSelection?: (taskId: string, event?: React.MouseEvent) => void;
    onToggleOne?: (taskId: string) => void;
    selectionMode?: boolean;
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

export function SortableTaskCard({ task, isDragging, onClick, isSelected, onToggleSelection, onToggleOne, selectionMode }: SortableTaskCardProps) {
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

    const handleCardClick = (e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelection?.(task.id, e);
        } else {
            onClick?.(task);
        }
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleCardClick}
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
                'bg-gradient-to-br from-card/80 via-card/50 to-muted/30 backdrop-blur-xl',
                'border border-white/10 hover:border-primary/30',
                'shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.2)]',
                (isDragging || isSorting) ? 'opacity-0' : 'opacity-100',
                isSelected && 'ring-2 ring-primary/50 border-primary/50 bg-primary/10 shadow-primary/20',
                'h-[230px] min-h-[230px] flex flex-col overflow-hidden' // Optimized for 1080p density
            )}
        >
            {/* Priority Vertical Bar */}
            <div
                className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-80", priority.text.replace('text-', 'bg-'))}
                style={{ boxShadow: `2px 0 10px ${priority.text.split('-')[1]}40` }}
            />
            {/* Selection Checkbox (Visible on hover or when selected) */}
            <div
                className={cn(
                    "absolute top-2 left-2 z-20 h-4 w-4 rounded border transition-all duration-200",
                    isSelected || selectionMode
                        ? "bg-primary border-primary flex items-center justify-center opacity-100"
                        : "bg-background/20 border-white/20 opacity-0 group-hover:opacity-100 hover:border-primary/50"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    // Checkboxes should always behave like a multi-select toggle
                    // If no modifier is pressed, we'll forge a Ctrl key event to useMultiSelect 
                    // or just pass the event and let useMultiSelect handle it (but it clears if no ctrl)
                    // Actually, let's just use the event. If the user clicks the checkbox specifically,
                    // maybe they expect it to behaves like a toggle regardless.
                    onToggleOne?.(task.id);
                }}
            >
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white animate-in zoom-in-50 duration-200" />}
            </div>

            {/* Hover Glow Effect */}
            <div className={cn(
                "absolute -inset-px rounded-xl bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-300",
                isSelected ? "opacity-30" : "group-hover:opacity-100"
            )} />

            {/* Blocked Indicator */}
            {
                task.blocked_by && task.blocked_by.length > 0 && (
                    <div className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow-sm ring-2 ring-background">
                        !
                    </div>
                )
            }

            <div className="relative p-3.5 flex flex-col h-full space-y-2.5">
                {/* 1. Header: Category/TaskType & Options */}
                <div className="flex items-center justify-between">
                    <div className={cn(
                        "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-colors",
                        task.isCompleted
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-primary/10 text-primary border-primary/20"
                    )}>
                        {task.task_type || 'Task'}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-50 hover:opacity-100 hover:bg-white/5">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                </div>

                {/* 2. Title & Description */}
                <div className="space-y-1 min-h-0">
                    <h4 className={cn(
                        "text-[13px] font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary-foreground line-clamp-1",
                        task.isCompleted && "line-through text-muted-foreground/50"
                    )}>
                        {task.title}
                    </h4>
                    {task.description && (
                        <p className="text-[10.5px] text-muted-foreground/50 line-clamp-2 leading-relaxed font-medium">
                            {task.description}
                        </p>
                    )}
                </div>

                {/* 3. Assignees Section (Inspired by Image 1) */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Assignees :</span>
                        <div className="flex items-center -space-x-2">
                            {task.assignees && task.assignees.length > 0 ? (
                                task.assignees.slice(0, 3).map((assignee, i) => (
                                    <div
                                        key={assignee.id}
                                        className={cn(
                                            "h-7 w-7 rounded-full flex items-center justify-center border-2 border-card",
                                            "bg-gradient-to-br from-violet-500/80 to-purple-600/80 backdrop-blur-sm",
                                            "text-[9px] font-bold text-white uppercase",
                                            "shadow-sm ring-1 ring-white/10"
                                        )}
                                        title={assignee.username || assignee.email}
                                        style={{ zIndex: 10 - i }}
                                    >
                                        {(assignee.first_name?.[0] || assignee.username?.[0] || 'U').toUpperCase()}
                                    </div>
                                ))
                            ) : (
                                <div className="h-7 w-7 rounded-full flex items-center justify-center border-2 border-dashed border-white/10 text-muted-foreground bg-white/5">
                                    <span className="text-[10px]">+</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Progress Section - Ultra Slim */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-muted-foreground/40 tracking-tight">
                        <span className="flex items-center gap-1 uppercase tracking-widest">
                            <ListChecks className="h-3 w-3 text-primary/50" />
                            Progress
                        </span>
                        <span className="tabular-nums font-mono text-[10px]">
                            {task.subtasks?.filter(st => st.isCompleted).length || 0}<span className="mx-0.5 opacity-20">/</span>{task.subtasks?.length || 0}
                        </span>
                    </div>
                    <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{
                                width: `${((task.subtasks?.filter(st => st.isCompleted).length || 0) / (task.subtasks?.length || 1)) * 100}%`
                            }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                task.isCompleted ? "bg-green-500" : "bg-gradient-to-r from-primary/80 to-primary"
                            )}
                        />
                    </div>
                </div>

                {/* 5. Footer Metadata (Inspired by both) */}
                <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {task.dueDate && (
                            <div className={cn(
                                "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                                isOverdue ? "text-red-400 bg-red-500/10" : "text-muted-foreground/70 bg-white/5"
                            )}>
                                <Clock className="h-3.5 w-3.5" />
                                <span>{format(new Date(task.dueDate), 'dd MMM yyyy')}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground/30">
                            <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span className="text-[9px] font-bold">4</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Paperclip className="h-3 w-3" />
                                <span className="text-[9px] font-bold">2</span>
                            </div>
                        </div>
                    </div>

                    <div className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold shadow-lg border transition-transform hover:scale-105",
                        priority.bg, priority.border, priority.text
                    )}>
                        {task.priority}
                    </div>
                </div>
            </div>
        </motion.div >
    );
}

