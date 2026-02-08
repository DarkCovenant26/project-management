'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuickNotes, convertToTask, updateQuickNote, deleteQuickNote } from '@/services/quick-capture';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Archive, CheckCircle2, Clock, Trash2, Calendar, Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PageHeader } from '@/components/layout/page-header';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProjects } from '@/services/projects';

export function InboxView() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['quick-notes'],
        queryFn: () => getQuickNotes(false),
    });

    const notes = data?.results || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="bg-muted p-4 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">All caught up!</h2>
                <p className="text-muted-foreground max-w-sm">
                    Your brain dump is empty. Use <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">⌘</span>K</kbd> to capture new ideas quickly.
                </p>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl py-6 space-y-8">
            <PageHeader
                title="Inbox"
                description="Triage your quick notes into actionable tasks"
                icon={Inbox}
            >
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {notes.length} Active Notes
                </Badge>
            </PageHeader>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                ))}
            </div>
        </div>
    );
}

function NoteCard({ note }: { note: any }) {
    const [isConvertOpen, setIsConvertOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(note.content);
    const queryClient = useQueryClient();

    const { mutate: deleteNote } = useMutation({
        mutationFn: deleteQuickNote,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
            toast.success('Note deleted');
        },
        onError: () => toast.error('Failed to delete note'),
    });

    const { mutate: updateNote } = useMutation({
        mutationFn: (data: { content?: string; is_archived?: boolean }) => updateQuickNote(note.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
            setIsEditing(false);
            toast.success('Note updated');
        },
        onError: () => toast.error('Failed to update note'),
    });

    const handleSave = () => {
        if (content.trim() !== note.content) {
            updateNote({ content });
        } else {
            setIsEditing(false);
        }
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateNote({ is_archived: true })}
                            title="Archive"
                        >
                            <Archive className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => deleteNote(note.id)}
                            title="Delete"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 text-sm whitespace-pre-wrap leading-relaxed p-4 pt-0">
                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            className="w-full min-h-[100px] p-2 rounded-md border text-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSave}>Save</Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => setIsEditing(true)}
                        className="cursor-text min-h-[60px]"
                        title="Click to edit"
                    >
                        {note.content}
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-2 border-t bg-muted/20 flex gap-2 justify-end">
                <ConvertTaskDialog note={note} open={isConvertOpen} onOpenChange={setIsConvertOpen} />
            </CardFooter>
        </Card>
    );
}

function ConvertTaskDialog({ note, open, onOpenChange }: { note: any, open: boolean, onOpenChange: (open: boolean) => void }) {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState(note.content.split('\n')[0].substring(0, 50));
    const [priority, setPriority] = useState('Medium');
    const [projectId, setProjectId] = useState<string>('');

    // Fetch projects for selection
    const { data: projectsData } = useQuery({
        queryKey: ['projects-list'],
        queryFn: getProjects,
        enabled: open
    });

    const { mutate: convert, isPending } = useMutation({
        mutationFn: (data: any) => convertToTask(note.id, data),
        onSuccess: () => {
            toast.success('Task created successfully');
            onOpenChange(false);
            queryClient.invalidateQueries({ queryKey: ['quick-notes'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh tasks too
        },
        onError: () => {
            toast.error('Failed to convert note');
        }
    });

    const handleConvert = () => {
        convert({
            title,
            priority,
            projectId: projectId ? parseInt(projectId) : undefined,
            description: note.content // Use full content as description
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" variant="default" className="gap-2">
                    Convert <ArrowRight className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Convert to Task</DialogTitle>
                    <DialogDescription>
                        Turn this note into an actionable task.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger id="priority">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project">Project</Label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger id="project">
                                    <SelectValue placeholder="Inbox" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No Project (Inbox)</SelectItem>
                                    {projectsData?.results.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConvert} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Task
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
