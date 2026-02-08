'use client';

import { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Subtask } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SubtaskItemProps {
    subtask: Subtask;
    onToggle: (id: string) => void;
    onUpdate: (id: string, title: string) => void;
    onDelete: (id: string) => void;
}

export function SubtaskItem({ subtask, onToggle, onUpdate, onDelete }: SubtaskItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(subtask.title);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: subtask.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (title.trim() && title !== subtask.title) {
            onUpdate(subtask.id, title);
        } else {
            setTitle(subtask.title);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setTitle(subtask.title);
            setIsEditing(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors',
                'hover:bg-muted/50',
                isDragging && 'opacity-50 shadow-lg'
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            <Checkbox
                checked={subtask.isCompleted}
                onCheckedChange={() => onToggle(subtask.id)}
                className="shrink-0"
            />

            {isEditing ? (
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="h-7 text-sm"
                    autoFocus
                />
            ) : (
                <span
                    className={cn(
                        'flex-1 text-sm cursor-text',
                        subtask.isCompleted && 'line-through text-muted-foreground'
                    )}
                    onClick={() => setIsEditing(true)}
                >
                    {subtask.title}
                </span>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => onDelete(subtask.id)}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
