'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { getProjectMembers } from '@/services/projects';

interface UserMultiSelectProps {
    projectId: string | number;
    value: number[];
    onChange: (value: number[]) => void;
    placeholder?: string;
}

export function UserMultiSelect({ projectId, value = [], onChange, placeholder = "Select assignees..." }: UserMultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const { data: members, isLoading } = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: () => getProjectMembers(projectId),
        enabled: !!projectId,
    });

    // Map members to simple options: { label: username/email, value: userId }
    const options = React.useMemo(() => {
        if (!members) return [];
        return members.map(m => ({
            label: m.username || m.email,
            value: m.userId
        }));
    }, [members]);

    const handleSelect = (userId: number) => {
        if (value.includes(userId)) {
            onChange(value.filter((id) => id !== userId));
        } else {
            onChange([...value, userId]);
        }
    };

    const handleRemove = (userId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter((id) => id !== userId));
    };

    const selectedLabels = value.map(id => options.find(o => o.value === id)?.label).filter(Boolean);

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
                        {value.length === 0 && <span className="text-muted-foreground font-normal">{placeholder}</span>}
                        {value.map((userId) => {
                            const label = options.find((o) => o.value === userId)?.label;
                            if (!label) return null;
                            return (
                                <Badge variant="secondary" key={userId} className="mr-1 mb-1">
                                    {label}
                                    <X
                                        className="ml-1 h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer"
                                        onClick={(e) => handleRemove(userId, e)}
                                    />
                                </Badge>
                            );
                        })}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search members..." />
                    <CommandList>
                        <CommandEmpty>No members found.</CommandEmpty>
                        <CommandGroup>
                            {isLoading && <CommandItem disabled>Loading...</CommandItem>}
                            {options.map((option) => (
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
