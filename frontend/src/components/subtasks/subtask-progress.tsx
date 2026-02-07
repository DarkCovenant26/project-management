'use client';

import { Subtask } from '@/lib/types';

interface SubtaskProgressProps {
    subtasks: Subtask[];
    size?: 'sm' | 'md';
}

export function SubtaskProgress({ subtasks, size = 'sm' }: SubtaskProgressProps) {
    if (subtasks.length === 0) return null;

    const completed = subtasks.filter(s => s.isCompleted).length;
    const total = subtasks.length;
    const percentage = Math.round((completed / total) * 100);

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2',
    };

    return (
        <div className="flex items-center gap-2">
            <div className={`flex-1 rounded-full bg-muted overflow-hidden ${sizeClasses[size]}`}>
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
                {completed}/{total}
            </span>
        </div>
    );
}
