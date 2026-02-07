'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface WidgetGridProps {
    children: React.ReactNode;
    className?: string;
}

export function WidgetGrid({ children, className }: WidgetGridProps) {
    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 md:gap-5",
            className
        )}>
            {children}
        </div>
    );
}
