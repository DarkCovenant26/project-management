'use client';

import { useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Plus, MoreHorizontal, AlertCircle, Sparkles } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Task } from '@/lib/types';
import { SortableTaskCard } from './sortable-task-card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BoardColumnProps {
    id: string;
    title: string;
    color: string;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onAddTask?: (title: string) => void;
    wipLimit?: number;
}

export function BoardColumn({ id, title, color, tasks, onTaskClick, onAddTask, wipLimit = 20 }: BoardColumnProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const parentRef = useRef<HTMLDivElement>(null);

    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { status: id },
    });

    const virtualizer = useVirtualizer({
        count: tasks.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 140,
        overscan: 5,
    });

    const handleAddCard = () => {
        if (newTaskTitle.trim()) {
            onAddTask?.(newTaskTitle);
            setIsAdding(false);
            setNewTaskTitle('');
        }
    };

    const isOverWipLimit = tasks.length > wipLimit;

    return (
        <div className="flex flex-col min-w-[320px] max-w-[320px] h-[calc(100vh-280px)] shrink-0 group">
            {/* Unified Column Container */}
            <div
                className={cn(
                    "flex-1 flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300",
                    "bg-gradient-to-b from-card/60 via-card/40 to-muted/20 backdrop-blur-md",
                    isOver ? "border-primary/50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]" : "border-white/10"
                )}
            >
                {/* Column Header - Connected */}
                <div
                    className="relative flex items-center justify-between px-4 py-3 border-b border-white/5"
                    style={{
                        background: `linear-gradient(90deg, ${color}10, transparent)`,
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <motion.div
                                animate={{
                                    boxShadow: isOver
                                        ? `0 0 20px 4px ${color}`
                                        : `0 0 10px 2px ${color}60`
                                }}
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                        </div>
                        <h3 className="font-semibold text-sm tracking-tight text-foreground/90">
                            {title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        {isOverWipLimit && (
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <AlertCircle className="h-4 w-4 text-red-400" />
                            </motion.div>
                        )}
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                            isOverWipLimit
                                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                : "bg-white/5 text-muted-foreground/60 border border-white/10"
                        )}>
                            {tasks.length}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10"
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Column Content Area */}
                <div
                    ref={setNodeRef}
                    className="flex-1 relative flex flex-col overflow-hidden"
                >
                    {/* Glow backdrop when hovering */}
                    <AnimatePresence>
                        {isOver && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle at center, ${color}10 0%, transparent 70%)`
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {/* Scrollable Task Area */}
                    <div
                        ref={parentRef}
                        className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-accent/30 scrollbar-track-transparent"
                    >
                        <SortableContext
                            items={tasks.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {tasks.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6"
                                >
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        className="relative"
                                    >
                                        <div
                                            className="absolute inset-0 rounded-full blur-xl opacity-30"
                                            style={{ background: color }}
                                        />
                                        <div className="relative p-4 rounded-full bg-gradient-to-br from-muted/80 to-card border border-white/10 backdrop-blur-sm shadow-xl">
                                            <Inbox className="h-6 w-6 text-muted-foreground/60" />
                                        </div>
                                    </motion.div>
                                    <div className="text-center space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground/80">No Tasks</p>
                                        <p className="text-[10px] text-muted-foreground/40 max-w-[120px]">This column is Currently empty</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div
                                    style={{
                                        height: `${virtualizer.getTotalSize()}px`,
                                        width: '100%',
                                        position: 'relative',
                                    }}
                                >
                                    <AnimatePresence mode="popLayout">
                                        {virtualizer.getVirtualItems().map((virtualItem) => {
                                            const task = tasks[virtualItem.index];
                                            return (
                                                <motion.div
                                                    key={task.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: `${virtualItem.size}px`,
                                                        transform: `translateY(${virtualItem.start}px)`,
                                                    }}
                                                    className="px-0.5"
                                                >
                                                    <SortableTaskCard
                                                        task={task}
                                                        onClick={onTaskClick}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </SortableContext>
                    </div>
                </div>
            </div>
        </div>
    );
}
