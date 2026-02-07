'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableWidgetProps {
    id: string;
    children: React.ReactNode;
    className?: string;
    isGhost?: boolean;
}

export function SortableWidget({ id, children, className, isGhost }: SortableWidgetProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isGhost ? 0.2 : isDragging ? 0.3 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(mounted ? attributes : {})}
            {...(mounted ? listeners : {})}
            className={cn(
                "cursor-grab active:cursor-grabbing h-full transition-shadow duration-200",
                isDragging && "shadow-xl ring-2 ring-primary/20 rounded-lg",
                className
            )}
        >
            {children}
        </div>
    );
}
