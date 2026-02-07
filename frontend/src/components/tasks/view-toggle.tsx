'use client';

import { List, LayoutGrid, Table, CalendarRange, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewPreference = 'list' | 'board' | 'spreadsheet' | 'timeline' | 'calendar';

interface ViewToggleProps {
    view: ViewPreference;
    onViewChange: (view: ViewPreference) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1 shadow-xs">
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-7 px-2.5 gap-2 text-xs',
                    view === 'list' && 'bg-background shadow-xs text-foreground ring-1 ring-border'
                )}
                onClick={() => onViewChange('list')}
            >
                <List className="h-3.5 w-3.5" />
                <span className="hidden md:inline">List</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-7 px-2.5 gap-2 text-xs',
                    view === 'board' && 'bg-background shadow-xs text-foreground ring-1 ring-border'
                )}
                onClick={() => onViewChange('board')}
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Board</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-7 px-2.5 gap-2 text-xs',
                    view === 'spreadsheet' && 'bg-background shadow-xs text-foreground ring-1 ring-border'
                )}
                onClick={() => onViewChange('spreadsheet')}
            >
                <Table className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Table</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-7 px-2.5 gap-2 text-xs',
                    view === 'timeline' && 'bg-background shadow-xs text-foreground ring-1 ring-border'
                )}
                onClick={() => onViewChange('timeline')}
            >
                <CalendarRange className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Timeline</span>
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-7 px-2.5 gap-2 text-xs',
                    view === 'calendar' && 'bg-background shadow-xs text-foreground ring-1 ring-border'
                )}
                onClick={() => onViewChange('calendar')}
            >
                <Calendar className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Calendar</span>
            </Button>
        </div>
    );
}
