'use client';

import { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DragOverlayCardProps {
    task: Task;
}

const priorityColors: Record<string, string> = {
    Critical: 'bg-red-600/20 text-red-600 border-red-600/30',
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

export function DragOverlayCard({ task }: DragOverlayCardProps) {
    return (
        <div className="rounded-lg border bg-card p-3 shadow-xl ring-2 ring-primary/30">
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
            </div>
        </div>
    );
}
