'use client';

import { useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, AlertCircle } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Task } from '@/lib/types';
import { SortableTaskCard } from './sortable-task-card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BoardColumnProps {
    id: string;
    title: string;
    status: string;
    color: string;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
    onAddTask?: (title: string) => void;
    wipLimit?: number;
    selectedTaskIds?: string[];
    onToggleSelection?: (taskId: string, event?: React.MouseEvent) => void;
    onToggleOne?: (taskId: string) => void;
    selectionMode?: boolean;
    onSelectAll?: (taskIds: string[]) => void;
    onDeselectAll?: (taskIds: string[]) => void;
}

export function BoardColumn({
    id,
    title,
    color,
    tasks,
    onTaskClick,
    onAddTask,
    wipLimit = 20,
    selectedTaskIds = [],
    onToggleSelection,
    onToggleOne,
    selectionMode,
    onSelectAll,
    onDeselectAll
}: BoardColumnProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const parentRef = useRef<HTMLDivElement>(null);

    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { status: id },
    });

    const isOverWipLimit = tasks.length > wipLimit;

    const rowVirtualizer = useVirtualizer({
        count: tasks.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 246, // Ultra-compact height (230px card + 16px bottom padding)
        overscan: 5,
    });

    const handleAddCard = () => {
        if (newTaskTitle.trim()) {
            onAddTask?.(newTaskTitle);
            setIsAdding(false);
            setNewTaskTitle('');
        }
    };

    const columnTaskIds = tasks.map(t => t.id);
    const allSelected = columnTaskIds.length > 0 && columnTaskIds.every(id => selectedTaskIds.includes(id));
    const someSelected = columnTaskIds.some(id => selectedTaskIds.includes(id)) && !allSelected;

    const handleToggleAll = () => {
        if (allSelected) {
            onDeselectAll?.(columnTaskIds);
        } else {
            onSelectAll?.(columnTaskIds);
        }
    };

    return (
        <div className="flex flex-col min-w-[320px] max-w-[320px] h-[calc(100vh-220px)] shrink-0 group">
            {/* Unified Column Container */}
            <div
                className={cn(
                    "flex-1 flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-300",
                    "bg-gradient-to-b from-card/60 via-card/40 to-muted/20 backdrop-blur-md",
                    isOver ? "border-primary/50 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]" : "border-white/10",
                    isOverWipLimit && "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                )}
            >
                {/* Column Header */}
                <div
                    className={cn(
                        "relative flex items-center justify-between px-4 py-3 border-b border-white/5",
                        isOverWipLimit && "bg-red-500/5"
                    )}
                    style={{
                        background: isOverWipLimit
                            ? undefined
                            : `linear-gradient(90deg, ${color}10, transparent)`,
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <motion.div
                                animate={isOverWipLimit ? {
                                    scale: [1, 1.2, 1],
                                    backgroundColor: ['#ef4444', '#f87171', '#ef4444']
                                } : {
                                    boxShadow: isOver
                                        ? `0 0 20px 4px ${color}`
                                        : `0 0 10px 2px ${color}60`
                                }}
                                transition={isOverWipLimit ? { repeat: Infinity, duration: 1.5 } : undefined}
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: isOverWipLimit ? undefined : color }}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {selectionMode && (
                                <div
                                    onClick={(e) => { e.stopPropagation(); handleToggleAll(); }}
                                    className={cn(
                                        "h-4 w-4 rounded border transition-all cursor-pointer flex items-center justify-center",
                                        allSelected ? "bg-primary border-primary" : someSelected ? "bg-primary/50 border-primary" : "border-muted-foreground/30 hover:border-primary/50"
                                    )}
                                >
                                    {allSelected && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
                                    {someSelected && <div className="h-0.5 w-2 bg-white rounded-full opacity-70" />}
                                </div>
                            )}
                            <h3 className={cn(
                                "font-semibold text-sm tracking-tight",
                                isOverWipLimit ? "text-red-400" : "text-foreground/90"
                            )}>
                                {title}
                                {wipLimit < 20 && (
                                    <span className="ml-2 text-[10px] font-normal text-muted-foreground/60">
                                        Limit: {wipLimit}
                                    </span>
                                )}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isOverWipLimit && (
                            <motion.div
                                animate={{ x: [-2, 2, -2] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </motion.div>
                        )}
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums",
                            isOverWipLimit
                                ? "bg-red-500 text-white border border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                : "bg-white/5 text-muted-foreground/60 border border-white/10"
                        )}>
                            {tasks.length}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsAdding(true)}
                            className="h-8 w-8 opacity-40 hover:opacity-100 transition-all hover:bg-white/10"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
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
                    <AnimatePresence>
                        {isOver && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: `radial-gradient(circle at center, ${color}08, transparent)`
                                }}
                            />
                        )}
                    </AnimatePresence>

                    <div
                        ref={parentRef}
                        className="flex-1 overflow-y-auto px-1.5 py-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent hover:scrollbar-thumb-white/10 transition-colors"
                    >
                        <AnimatePresence>
                            {isAdding && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="px-1.5 pb-4"
                                >
                                    <div className="space-y-3 p-3 rounded-xl border border-white/10 bg-card/60 backdrop-blur-sm">
                                        <Input
                                            autoFocus
                                            placeholder="Task title..."
                                            value={newTaskTitle}
                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAddCard();
                                                if (e.key === 'Escape') setIsAdding(false);
                                            }}
                                            className="h-8 text-sm bg-background/50 border-white/5"
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" onClick={handleAddCard} className="h-8 px-4 text-xs">Add</Button>
                                            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="h-8 px-3 text-xs">Cancel</Button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const task = tasks[virtualRow.index];
                                    return (
                                        <div
                                            key={task.id}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                                padding: '0 6px 16px 6px',
                                            }}
                                        >
                                            <SortableTaskCard
                                                task={task}
                                                onClick={onTaskClick}
                                                isSelected={selectedTaskIds.includes(task.id)}
                                                onToggleSelection={onToggleSelection}
                                                onToggleOne={onToggleOne}
                                                selectionMode={selectionMode}
                                            />
                                        </div>
                                    );
                                })}
                            </SortableContext>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
