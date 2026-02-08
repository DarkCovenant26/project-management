'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, X, RefreshCw } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BaseWidgetProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    onRemove?: () => void;
    onRefresh?: () => void;
    className?: string;
    icon?: React.ElementType;
}

export function BaseWidget({
    title,
    description,
    children,
    onRemove,
    onRefresh,
    className,
    icon: Icon
}: BaseWidgetProps) {
    return (
        <Card className={cn("overflow-hidden group h-full flex flex-col", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2.5 px-4 bg-muted/30">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <div>
                        <CardTitle className="text-xs font-bold uppercase tracking-tight">{title}</CardTitle>
                        {description && <CardDescription className="text-[10px] leading-tight">{description}</CardDescription>}
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="More options"
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {onRefresh && (
                            <DropdownMenuItem onClick={onRefresh}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </DropdownMenuItem>
                        )}
                        {onRemove && (
                            <DropdownMenuItem onClick={onRemove} className="text-destructive focus:text-destructive">
                                <X className="mr-2 h-4 w-4" />
                                Remove
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1 p-4 pt-2">
                {children}
            </CardContent>
        </Card>
    );
}
