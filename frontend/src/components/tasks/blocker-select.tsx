'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/services/projects'; // Actually we need tasks for a project
import api from '@/lib/api';

interface BlockerSelectProps {
    projectId: string | number;
    currentTaskId?: string; // To exclude self from blockers
    value: string[]; // UUIDs
    onChange: (value: string[]) => void;
}

export function BlockerSelect({ projectId, currentTaskId, value = [], onChange }: BlockerSelectProps) {
    const [open, setOpen] = React.useState(false);

    // Fetch tasks for this project to list as potential blockers
    const { data: tasks, isLoading } = useQuery({
        queryKey: ['project-tasks', projectId],
        queryFn: async () => {
            // Use existing tasks list endpoint but filter by project? 
            // Better to use dedicated endpoint or filter existing tasks list.
            // For now, let's assume we can fetch tasks for the project.
            const res = await api.get(`/projects/${projectId}/tasks/`);
            return res.data;
        },
        enabled: !!projectId,
    });

    const options = React.useMemo(() => {
        if (!tasks) return [];
        return tasks
            .filter((t: any) => t.id !== currentTaskId) // Cannot block self
            .map((t: any) => ({
                label: t.title,
                value: t.id
            }));
    }, [tasks, currentTaskId]);

    const handleSelect = (id: string) => {
        if (value.includes(id)) {
            onChange(value.filter((v) => v !== id));
        } else {
            onChange([...value, id]);
        }
    };

    const handleRemove = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== id));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-[10px] py-2 px-3 hover:bg-background"
                >
                    <div className="flex flex-wrap gap-1">
                        {value.length === 0 && <span className="text-muted-foreground font-normal">Select dependencies...</span>}
                        {value.map((id) => {
                            const label = options.find((o: any) => o.value === id)?.label;
                            if (!label) return null;
                            return (
                                <Badge variant="destructive" key={id} className="mr-1 mb-1">
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    {label}
                                    <X
                                        className="ml-1 h-3 w-3 text-destructive-foreground hover:text-white cursor-pointer"
                                        onClick={(e) => handleRemove(id, e)}
                                    />
                                </Badge>
                            );
                        })}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search tasks..." />
                    <CommandList>
                        <CommandEmpty>No tasks found.</CommandEmpty>
                        <CommandGroup>
                            {isLoading && <CommandItem disabled>Loading...</CommandItem>}
                            {options.map((option: any) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.includes(option.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
