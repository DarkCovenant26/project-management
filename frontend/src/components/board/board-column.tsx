'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/lib/types';
import { SortableTaskCard } from './sortable-task-card';
import { cn } from '@/lib/utils';

interface BoardColumnProps {
    id: TaskStatus;
    title: string;
    color: string;
    tasks: Task[];
}

export function BoardColumn({ id, title, color, tasks }: BoardColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { status: id },
    });

    return (
        <div className="flex flex-col min-w-[280px] max-w-[320px] shrink-0">
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-3 px-1">
                <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color }}
                />
                <h3 className="font-semibold text-sm">{title}</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {tasks.length}
                </span>
            </div>

            {/* Column Content */}
            <div
                ref={setNodeRef}
                className={cn(
                    'flex-1 rounded-lg border border-dashed p-2 transition-colors min-h-[200px]',
                    isOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
                )}
            >
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {tasks.length === 0 ? (
                            <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                                Drop tasks here
                            </div>
                        ) : (
                            tasks.map(task => (
                                <SortableTaskCard key={task.id} task={task} />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
