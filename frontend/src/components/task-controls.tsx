'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TaskControlsProps {
    search: string;
    setSearch: (value: string) => void;
    priority: string;
    setPriority: (value: string) => void;
    status: string;
    setStatus: (value: string) => void;
}

export function TaskControls({
    search,
    setSearch,
    priority,
    setPriority,
    status,
    setStatus,
}: TaskControlsProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center py-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search tasks..."
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
