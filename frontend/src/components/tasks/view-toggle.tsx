'use client';

import { List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
    view: 'list' | 'board';
    onViewChange: (view: 'list' | 'board') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-8 px-3 gap-2',
                    view === 'list' && 'bg-background shadow-sm'
                )}
                onClick={() => onViewChange('list')}
            >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-8 px-3 gap-2',
                    view === 'board' && 'bg-background shadow-sm'
                )}
                onClick={() => onViewChange('board')}
            >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Board</span>
            </Button>
        </div>
    );
}
