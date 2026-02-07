'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Tag } from '@/lib/types';
import { getTags } from '@/services/tags';
import { TagBadge } from './tag-badge';
import { cn } from '@/lib/utils';

interface TagPickerProps {
    value: Tag[];
    onChange: (tags: Tag[]) => void;
    projectId?: number;
}

export function TagPicker({ value, onChange, projectId }: TagPickerProps) {
    const [open, setOpen] = useState(false);

    const { data: tagsData } = useQuery({
        queryKey: ['tags', projectId],
        queryFn: () => getTags(projectId),
    });

    const tags = tagsData?.results || [];

    const toggleTag = (tag: Tag) => {
        const isSelected = value.some(t => t.id === tag.id);
        if (isSelected) {
            onChange(value.filter(t => t.id !== tag.id));
        } else {
            onChange([...value, tag]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-10"
                >
                    {value.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {value.slice(0, 3).map(tag => (
                                <TagBadge
                                    key={tag.id}
                                    tag={tag}
                                    onRemove={() => toggleTag(tag)}
                                />
                            ))}
                            {value.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                    +{value.length - 3} more
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">Select tags...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-2" align="start">
                {tags.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                        No tags found. Create one in settings.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {tags.map(tag => {
                            const isSelected = value.some(t => t.id === tag.id);
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={cn(
                                        'w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                                        'hover:bg-muted',
                                        isSelected && 'bg-primary/10'
                                    )}
                                    onClick={() => toggleTag(tag)}
                                >
                                    <div
                                        className="h-3 w-3 rounded-full shrink-0"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="flex-1 text-left truncate">{tag.name}</span>
                                    {isSelected && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
