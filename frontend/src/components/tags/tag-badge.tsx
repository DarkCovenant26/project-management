'use client';

import { X } from 'lucide-react';
import { Tag } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
    tag: Tag;
    onRemove?: () => void;
    onClick?: () => void;
    className?: string;
}

export function TagBadge({ tag, onRemove, onClick, className }: TagBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                onClick && 'cursor-pointer hover:opacity-80',
                className
            )}
            style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
                borderColor: `${tag.color}40`,
            }}
            onClick={onClick}
        >
            <span className="truncate max-w-[100px]" title={tag.name}>
                {tag.name}
            </span>
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </span>
    );
}
