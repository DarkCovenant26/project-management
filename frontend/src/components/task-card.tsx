'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { Task } from '@/lib/types';

import { getDateStatus, getDateStatusColor } from '@/lib/utils/date';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TagBadge } from '@/components/tags/tag-badge';
import { SubtaskProgress } from '@/components/subtasks/subtask-progress';
import { SubtaskList } from '@/components/subtasks/subtask-list';
import { cn } from '@/lib/utils';

interface TaskCardProps {
    task: Task;
    onToggle: (id: string, currentStatus: boolean) => void;
    onEdit?: (task: Task) => void;
    onDelete?: (id: string) => void;
}

export function TaskCard({ task, onToggle, onEdit, onDelete }: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
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
                    <h3 className={`font-medium ${task.isCompleted ? 'text-muted-foreground line-through' : 'text-card-foreground'} flex items-center gap-2`}>
                        {task.blocked_by && task.blocked_by.length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10 text-destructive text-[10px] font-bold" title="Blocked by dependencies">
                                !
                            </span>
                        )}
                        {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        {task.storyPoints !== undefined && task.storyPoints > 0 && (
                            <Badge variant="outline" className="font-mono font-normal text-muted-foreground border-border bg-muted/50">
                                {task.storyPoints} pts
                            </Badge>
                        )}
                        <Badge variant={
                            task.priority === 'Critical' ? 'destructive' :
                                task.priority === 'High' ? 'destructive' :
                                    task.priority === 'Medium' ? 'default' : 'secondary'
                        } className={`
                            ${task.priority === 'Critical' ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-900 dark:text-red-100' :
                                task.priority === 'High' ? 'bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400' :
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
                    <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                            <SubtaskProgress subtasks={task.subtasks} />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                            >
                                {isExpanded ? (
                                    <>Collapse <ChevronDown className="ml-1 h-3 w-3" /></>
                                ) : (
                                    <>Expand <ChevronRight className="ml-1 h-3 w-3" /></>
                                )}
                            </Button>
                        </div>

                        {isExpanded && (
                            <div className="pt-2 border-t border-dashed">
                                <SubtaskList taskId={task.id} subtasks={task.subtasks} />
                            </div>
                        )}
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

                        {/* Assignees List */}
                        <div className="flex items-center -space-x-2">
                            {task.assignees && task.assignees.length > 0 ? (
                                task.assignees.slice(0, 3).map((assignee, i) => (
                                    <Avatar key={assignee.id} className="h-6 w-6 border-2 border-background ring-1 ring-border" style={{ zIndex: 3 - i }}>
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                            {(assignee.first_name?.[0] || assignee.username?.[0] || 'U').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                ))
                            ) : (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <User className="h-3 w-3" />
                                    <span>Owner</span>
                                </div>
                            )}
                            {task.assignees && task.assignees.length > 3 && (
                                <div className="h-6 w-6 rounded-full flex items-center justify-center border-2 border-background bg-muted text-[8px] font-bold text-muted-foreground z-0 ring-1 ring-border">
                                    +{task.assignees.length - 3}
                                </div>
                            )}
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
