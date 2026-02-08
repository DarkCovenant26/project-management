'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar, User, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getDateStatus, getDateStatusColor } from '@/lib/utils/date';
import { TagBadge } from '@/components/tags/tag-badge';
import { SubtaskProgress } from '@/components/subtasks/subtask-progress';

interface SelectableTaskCardProps {
    task: Task;
    isSelected: boolean;
    onSelect: (id: string, event: React.MouseEvent) => void;
    onToggleComplete?: (task: Task) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (task: Task) => void;
}

const priorityColors = {
    High: 'bg-red-500/10 text-red-500 border-red-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Low: 'bg-green-500/10 text-green-500 border-green-500/20',
};

export function SelectableTaskCard({
    task,
    isSelected,
    onSelect,
    onToggleComplete,
    onEdit,
    onDelete,
}: SelectableTaskCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    const dateStatus = task.dueDate ? getDateStatus(task.dueDate) : null;
    const dateColor = dateStatus ? getDateStatusColor(dateStatus) : '';

    return (
        <div
            className={cn(
                'group relative rounded-lg border bg-card p-4 transition-all',
                'hover:shadow-md hover:border-primary/30',
                isSelected && 'ring-2 ring-primary border-primary bg-primary/5'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => onSelect(task.id, e)}
        >
            <div className="flex items-start gap-3">
                {/* Selection checkbox */}
                <div
                    className={cn(
                        'shrink-0 transition-opacity',
                        isHovered || isSelected ? 'opacity-100' : 'opacity-0'
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onSelect(task.id, {} as React.MouseEvent)}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
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

                    {/* Subtask progress */}
                    {task.subtasks && task.subtasks.length > 0 && (
                        <SubtaskProgress subtasks={task.subtasks} />
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                            {task.dueDate && (
                                <div className={cn('flex items-center gap-1', dateColor)}>
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                            </div>
                        </div>

                        {/* Hover actions */}
                        <div className={cn(
                            'flex items-center gap-1 transition-opacity',
                            isHovered ? 'opacity-100' : 'opacity-0'
                        )}>
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(task);
                                    }}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(task);
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 5).map(tag => (
                                <TagBadge key={tag.id} tag={tag} />
                            ))}
                            {task.tags.length > 5 && (
                                <span className="text-xs text-muted-foreground">
                                    +{task.tags.length - 5}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
