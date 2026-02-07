'use client';

import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { Task } from '@/lib/types';

import { getDateStatus, getDateStatusColor } from '@/lib/utils/date';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagBadge } from '@/components/tags/tag-badge';
import { SubtaskProgress } from '@/components/subtasks/subtask-progress';
import { cn } from '@/lib/utils';

interface TaskCardProps {
    task: Task;
    onToggle: (id: number, currentStatus: boolean) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (id: number) => void;
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
    const dateStatus = getDateStatus(task.dueDate);
    const dateColorClass = getDateStatusColor(dateStatus);

    return (
        <div className="group relative flex items-start gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
            <Checkbox
                checked={task.isCompleted}
                onCheckedChange={() => onToggle(task.id, task.isCompleted)}
                className="mt-1 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />

            <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${task.isCompleted ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                        {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <Badge variant={
                            task.priority === 'High' ? 'destructive' :
                                task.priority === 'Medium' ? 'default' : 'secondary'
                        } className={`
                            ${task.priority === 'High' ? 'bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400' :
                                task.priority === 'Medium' ? 'bg-orange-100 text-orange-700 hover:bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-400' :
                                    'bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400'}
                             border-transparent shadow-none
                        `}>
                            {task.priority}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                    {task.tags?.map((tag) => (
                        <TagBadge key={tag.id} tag={tag} />
                    ))}
                </div>

                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {task.description}
                </p>

                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-2">
                        <SubtaskProgress subtasks={task.subtasks} />
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                        {task.dueDate && (
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${dateColorClass}`}>
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                                {dateStatus === 'overdue' && <span className="ml-1 font-bold">!</span>}
                            </div>
                        )}
                        {!task.dueDate && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{task.createdAt ? format(new Date(task.createdAt), 'MMM d') : 'No date'}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>Owner</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(task);
                                }}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(task.id);
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">U</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </div>
    );
}
