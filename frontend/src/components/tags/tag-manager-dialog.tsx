'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag } from '@/lib/types';
import { getTags, createTag, updateTag, deleteTag } from '@/services/tags';
import { ColorPicker, TAG_COLORS } from './color-picker';
import { TagBadge } from './tag-badge';

interface TagManagerDialogProps {
    projectId?: string | number;
    trigger?: React.ReactNode;
}

export function TagManagerDialog({ projectId, trigger }: TagManagerDialogProps) {
    const [open, setOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [form, setForm] = useState({ name: '', color: TAG_COLORS[0] });

    const queryClient = useQueryClient();

    const { data: tagsData } = useQuery({
        queryKey: ['tags', projectId],
        queryFn: () => getTags(projectId),
        enabled: open,
    });

    const tags = tagsData?.results || [];

    const { mutate: create, isPending: isCreating } = useMutation({
        mutationFn: (data: { name: string; color: string; projectId?: string | number }) =>
            createTag({ ...data, projectId: data.projectId?.toString() }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
            toast.success('Tag created');
            setForm({ name: '', color: TAG_COLORS[0] });
        },
        onError: () => toast.error('Failed to create tag'),
    });

    const { mutate: update, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: Partial<Tag> }) => updateTag(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
            toast.success('Tag updated');
            setEditingTag(null);
            setForm({ name: '', color: TAG_COLORS[0] });
        },
        onError: () => toast.error('Failed to update tag'),
    });

    const { mutate: remove } = useMutation({
        mutationFn: (id: number | string) => deleteTag(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags', projectId] });
            toast.success('Tag deleted');
        },
        onError: () => toast.error('Failed to delete tag'),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;

        if (editingTag) {
            update({ id: editingTag.id, data: form });
        } else {
            create({ ...form, projectId });
        }
    };

    const handleEdit = (tag: Tag) => {
        setEditingTag(tag);
        setForm({ name: tag.name, color: tag.color });
    };

    const handleCancelEdit = () => {
        setEditingTag(null);
        setForm({ name: '', color: TAG_COLORS[0] });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Tags
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Manage Tags</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Tag list */}
                    <div className="space-y-2">
                        <Label>Existing Tags</Label>
                        {tags.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No tags yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <div key={tag.id} className="group relative">
                                        <TagBadge tag={tag} />
                                        <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-0.5">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(tag)}
                                                className="rounded-full bg-muted p-1 hover:bg-primary/20"
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(tag.id)}
                                                className="rounded-full bg-muted p-1 hover:bg-destructive/20"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Create/Edit form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{editingTag ? 'Edit Tag' : 'Create New Tag'}</Label>
                            <Input
                                placeholder="Tag name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Color</Label>
                            <ColorPicker
                                value={form.color}
                                onChange={(color) => setForm({ ...form, color })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={isCreating || isUpdating}>
                                {editingTag ? 'Update' : 'Create'}
                            </Button>
                            {editingTag && (
                                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
