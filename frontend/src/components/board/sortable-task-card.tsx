'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SortableTaskCardProps {
    task: Task;
    isDragging?: boolean;
}

const priorityColors = {
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

export function SortableTaskCard({ task, isDragging }: SortableTaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSorting,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                'rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all',
                'hover:border-primary/50 hover:shadow-md',
                (isDragging || isSorting) && 'opacity-50 shadow-lg ring-2 ring-primary/20',
            )}
        >
            <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                        'text-sm font-medium leading-tight',
                        task.isCompleted && 'line-through text-muted-foreground'
                    )}>
                        {task.title}
                    </h4>
                    <Badge variant="outline" className={cn('text-xs shrink-0', priorityColors[task.priority])}>
                        {task.priority}
                    </Badge>
                </div>

                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {task.dueDate && (
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                    </div>
                </div>

                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map(tag => (
                            <span
                                key={tag.id}
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs"
                                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                            >
                                {tag.name}
                            </span>
                        ))}
                        {task.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{task.tags.length - 3}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
