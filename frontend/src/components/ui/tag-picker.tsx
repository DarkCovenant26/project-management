'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Tag } from '@/lib/types';
import { getTags, createTag } from '@/services/tags';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface TagPickerProps {
    selectedTags: Tag[];
    onAddTag: (tagId: number | string) => void;
    onRemoveTag: (tagId: number | string) => void;
    projectId?: string | number;
}

const TAG_COLORS = [
    { name: 'Red', value: 'bg-red-500/10 text-red-500 hover:bg-red-500/20' },
    { name: 'Orange', value: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' },
    { name: 'Amber', value: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' },
    { name: 'Green', value: 'bg-green-500/10 text-green-500 hover:bg-green-500/20' },
    { name: 'Blue', value: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20' },
    { name: 'Indigo', value: 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20' },
    { name: 'Purple', value: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20' },
    { name: 'Pink', value: 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20' },
];

export function TagPicker({ selectedTags = [], onAddTag, onRemoveTag, projectId }: TagPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[4].value); // Default Blue
    const [isCreating, setIsCreating] = useState(false);

    const queryClient = useQueryClient();

    const { data: tagsData, isLoading } = useQuery({
        queryKey: ['tags', projectId],
        queryFn: () => getTags(projectId),
    });

    const tags = useMemo(() => tagsData?.results || [], [tagsData]);

    const { mutate: createNewTag, isPending: isCreatingTag } = useMutation({
        mutationFn: (data: { name: string; color: string; projectId?: string | number }) =>
            createTag({ ...data, projectId: data.projectId ? String(data.projectId) : undefined }),
        onSuccess: (newTag) => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
            onAddTag(newTag.id);
            setNewTagName('');
            setIsCreating(false);
            toast.success('Tag created');
        },
        onError: () => toast.error('Failed to create tag'),
    });

    const filteredTags = useMemo(() => {
        return tags.filter(tag => !selectedTags.some(selected => selected.id === tag.id));
    }, [tags, selectedTags]);

    const handleCreateTag = () => {
        if (!newTagName.trim()) return;
        createNewTag({
            name: newTagName,
            color: selectedColor,
            projectId: projectId,
        });
    };

    return (
        <div className="flex flex-wrap gap-2 items-center">
            {selectedTags.map((tag) => (
                <Badge
                    key={tag.id}
                    variant="secondary"
                    className={cn("gap-1 pr-1", tag.color || "bg-secondary text-secondary-foreground")}
                >
                    {tag.name}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTag(tag.id);
                        }}
                        className="rounded-full p-0.5 hover:bg-background/20"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}

            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-6 rounded-full px-2 text-xs border-dashed gap-1">
                        <Plus className="h-3 w-3" />
                        Add Tag
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[240px]" align="start">
                    {isCreating ? (
                        <div className="p-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold">Create New Tag</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => setIsCreating(false)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>

                            <Input
                                placeholder="Tag name"
                                className="h-8 text-sm"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                autoFocus
                            />

                            <div className="grid grid-cols-4 gap-2">
                                {TAG_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        className={cn(
                                            "h-6 w-full rounded-md border transition-all",
                                            color.value,
                                            selectedColor === color.value ? "ring-2 ring-primary ring-offset-1" : "hover:opacity-80"
                                        )}
                                        onClick={() => setSelectedColor(color.value)}
                                        title={color.name}
                                    />
                                ))}
                            </div>

                            <Button
                                size="sm"
                                className="w-full"
                                onClick={handleCreateTag}
                                disabled={!newTagName.trim() || isCreatingTag}
                            >
                                {isCreatingTag ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                                Create Tag
                            </Button>
                        </div>
                    ) : (
                        <Command>
                            <CommandInput placeholder="Search tags..." autoFocus />
                            <CommandList>
                                <CommandEmpty className="p-2">
                                    <p className="text-xs text-muted-foreground mb-2">No tag found.</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-7 text-xs"
                                        onClick={() => {
                                            setNewTagName('');
                                            setIsCreating(true);
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Create new tag
                                    </Button>
                                </CommandEmpty>
                                <CommandGroup heading="Available Tags">
                                    {isLoading ? (
                                        <div className="flex justify-center p-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        filteredTags.map((tag) => (
                                            <CommandItem
                                                key={tag.id}
                                                onSelect={() => {
                                                    onAddTag(tag.id);
                                                    setIsOpen(false);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <div className={cn("h-2 w-2 rounded-full mr-2", tag.color?.split(' ')[0].replace('/10', '/50') || "bg-gray-400")} />
                                                <span>{tag.name}</span>
                                            </CommandItem>
                                        ))
                                    )}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => {
                                            setNewTagName('');
                                            setIsCreating(true);
                                        }}
                                        className="cursor-pointer font-medium text-primary"
                                    >
                                        <Plus className="h-3 w-3 mr-2 bg-primary/20 p-0.5 rounded-full" />
                                        Create new tag
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
