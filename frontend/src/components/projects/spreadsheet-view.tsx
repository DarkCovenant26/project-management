'use client';

import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { Task } from '@/lib/types';
import { format, differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface SpreadsheetViewProps {
    tasks: Task[];
    onTaskUpdate?: (task: Task) => void;
}

const columnHelper = createColumnHelper<Task>();

export const SpreadsheetView = React.memo(({ tasks, onTaskUpdate }: SpreadsheetViewProps) => {
    const columns = useMemo(() => [
        columnHelper.accessor('isCompleted', {
            header: '',
            cell: info => (
                <div className="flex justify-center p-1">
                    <Checkbox checked={info.getValue()} />
                </div>
            ),
            size: 40,
        }),
        columnHelper.accessor('title', {
            header: 'Task Name',
            cell: info => <span className="font-medium truncate block py-1">{info.getValue()}</span>,
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => (
                <div className="flex items-center gap-1.5 py-1">
                    <div className={cn(
                        "h-2 w-2 rounded-full",
                        info.getValue() === 'done' ? "bg-green-500" :
                            info.getValue() === 'in_progress' ? "bg-blue-500" :
                                "bg-slate-300"
                    )} />
                    <span className="text-[11px] capitalize">{info.getValue().replace('_', ' ')}</span>
                </div>
            ),
        }),
        columnHelper.accessor('priority', {
            header: 'Priority',
            cell: info => {
                const priority = info.getValue();
                return (
                    <Badge variant="outline" className={cn(
                        "text-[10px] px-1.5 py-0 h-4 font-bold border-0",
                        priority === 'High' ? "bg-red-500/10 text-red-500" :
                            priority === 'Medium' ? "bg-amber-500/10 text-amber-500" :
                                "bg-blue-500/10 text-blue-500"
                    )}>
                        {priority}
                    </Badge>
                );
            },
        }),
        columnHelper.accessor('dueDate', {
            header: 'Due Date',
            cell: info => {
                const date = info.getValue();
                if (!date) return <span className="text-muted-foreground/30 text-xs">-</span>;

                const dueDate = new Date(date);
                const hoursLeft = differenceInHours(dueDate, new Date());
                const isUrgent = hoursLeft > 0 && hoursLeft <= 48;

                return (
                    <span className={cn(
                        "text-xs py-1",
                        isUrgent ? "text-amber-500 font-bold" : "text-muted-foreground"
                    )}>
                        {format(dueDate, 'MMM d, p')}
                    </span>
                );
            },
        }),
    ], []);

    const table = useReactTable({
        data: tasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border border-sidebar-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-muted/30 border-b border-sidebar-border">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"
                                        style={{ width: header.getSize() }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-sidebar-border">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-muted/20 transition-colors group">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-3 py-1.5 h-10 align-middle">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {tasks.length === 0 && (
                <div className="py-20 text-center text-muted-foreground italic text-sm">
                    No tasks found in this view.
                </div>
            )}
        </div>
    );
});

SpreadsheetView.displayName = 'SpreadsheetView';
