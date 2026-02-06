'use client';

import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { Task } from '@/lib/types';

interface TaskCardProps {
    task: Task;
    onToggle: (id: number, currentStatus: boolean) => void;
}

export function TaskCard({ task, onToggle }: TaskCardProps) {
    return (
        <div className="group flex items-start gap-4 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
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

                <p className="line-clamp-2 text-sm text-muted-foreground">
                    {task.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {task.dueDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                            </div>
                        )}
                        {!task.dueDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{task.createdAt ? format(new Date(task.createdAt), 'MMM d') : 'No date'}</span>
                            </div>
                        )}
                    </div>

                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px]">U</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </div>
    );
}
