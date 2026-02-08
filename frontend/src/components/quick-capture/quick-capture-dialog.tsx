'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createQuickNote } from '@/services/quick-capture';
import { useHotkeys } from 'react-hotkeys-hook';

export function QuickCaptureDialog() {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState('');
    const queryClient = useQueryClient();

    // Toggle with Cmd+K
    useHotkeys('meta+k, ctrl+k', (e) => {
        e.preventDefault();
        setOpen(prev => !prev);
    }, { enableOnFormTags: true }); // Allow triggering even inside inputs if really needed, but maybe confusing. Removed for safety.

    // Actually, usually we don't want it inside input unless we handle it properly, but 'enableOnFormTags: true' allows escaping from input.
    // Let's stick to standard behavior: only when not typing, or specifically configured.
    // However, the standard behavior for command palette is usually global.


    const { mutate: addNote, isPending } = useMutation({
        mutationFn: createQuickNote,
        onSuccess: () => {
            toast.success('Brain dump captured!');
            setContent('');
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
        },
        onError: () => {
            toast.error('Failed to save note');
        }
    });

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!content.trim()) return;
        addNote(content);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Brain Dump
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="What's on your mind? Press Enter to save."
                        className="min-h-[150px] text-lg resize-none focus-visible:ring-0 border-none shadow-none bg-muted/30 p-4"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Markdown supported</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button size="sm" onClick={() => handleSubmit()} disabled={!content.trim() || isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Capture
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
