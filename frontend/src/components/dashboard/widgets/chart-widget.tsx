'use client';

import React from 'react';
import { BaseWidget } from './base-widget';
import { cn } from '@/lib/utils';

interface ChartDataItem {
    label: string;
    value: number;
    color?: string;
}

interface ChartWidgetProps {
    title: string;
    description?: string;
    data: ChartDataItem[];
    total?: number;
    loading?: boolean;
    icon: React.ElementType;
    onRemove?: () => void;
    onRefresh?: () => void;
}

export function ChartWidget({
    title,
    description,
    data,
    total,
    loading,
    icon,
    onRemove,
    onRefresh
}: ChartWidgetProps) {
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const totalVal = total || data.reduce((acc, d) => acc + d.value, 0);

    return (
        <BaseWidget
            title={title}
            description={description}
            icon={icon}
            onRemove={onRemove}
            onRefresh={onRefresh}
        >
            <div className="space-y-4 pt-2">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="space-y-1">
                                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                                <div className="h-2 w-full bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
                    data.map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">{item.label}</span>
                                <span>{item.value} ({Math.round((item.value / (totalVal || 1)) * 100)}%)</span>
                            </div>
                            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-500 rounded-full", item.color || "bg-primary")}
                                    style={{ width: `${(item.value / maxVal) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </BaseWidget>
    );
}
