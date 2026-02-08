'use client';

import React from 'react';
import { BaseWidget } from './base-widget';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface KPIWidgetProps {
    title: string;
    value: string | number;
    subValue?: string;
    description?: string;
    icon: React.ElementType;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    loading?: boolean;
    onRemove?: () => void;
    onRefresh?: () => void;
}

export function KPIWidget({
    title,
    value,
    subValue,
    description,
    icon: Icon,
    trend,
    loading,
    onRemove,
    onRefresh
}: KPIWidgetProps) {
    return (
        <BaseWidget
            title={title}
            description={description}
            icon={Icon}
            onRemove={onRemove}
            onRefresh={onRefresh}
        >
            <div className="flex flex-col justify-center h-full space-y-1">
                {loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ) : (
                    <>
                        <div className="text-3xl font-bold tracking-tight">{value}</div>
                        <div className="flex items-center gap-2">
                            {subValue && <span className="text-sm text-muted-foreground font-medium">{subValue}</span>}
                            {trend && (
                                <span className={cn(
                                    "text-xs font-bold px-1.5 py-0.5 rounded-full",
                                    trend.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {trend.isPositive ? '+' : '-'}{trend.value}%
                                </span>
                            )}
                        </div>
                    </>
                )}
            </div>
        </BaseWidget>
    );
}
