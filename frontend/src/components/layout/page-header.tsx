'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    icon: Icon,
    children,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6", className)}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm border border-primary/20 transition-all hover:bg-primary/15 group">
                        <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground transition-all">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold opacity-70 mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    );
}
