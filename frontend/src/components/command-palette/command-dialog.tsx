'use client';

import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
    Home,
    List,
    LayoutGrid,
    Plus,
    Folder,
    Settings,
    Search,
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';

interface CommandDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onNewTask?: () => void;
    onNewProject?: () => void;
}

export function CommandDialog({ open, onOpenChange, onNewTask, onNewProject }: CommandDialogProps) {
    const router = useRouter();

    const runCommand = (command: () => void) => {
        onOpenChange(false);
        command();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 overflow-hidden max-w-[500px]">
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </Command.Empty>

                        <Command.Group heading="Navigation">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/dashboard'))}
                                className="flex items-center gap-2 cursor-pointer rounded-sm hover:bg-accent"
                            >
                                <Home className="h-4 w-4" />
                                <span>Go to Dashboard</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">G D</kbd>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/tasks'))}
                                className="flex items-center gap-2 cursor-pointer rounded-sm hover:bg-accent"
                            >
                                <List className="h-4 w-4" />
                                <span>Go to Tasks</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">G T</kbd>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/board'))}
                                className="flex items-center gap-2 cursor-pointer rounded-sm hover:bg-accent"
                            >
                                <LayoutGrid className="h-4 w-4" />
                                <span>Go to Board</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">G B</kbd>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Actions">
                            <Command.Item
                                onSelect={() => runCommand(() => onNewTask?.())}
                                className="flex items-center gap-2 cursor-pointer rounded-sm hover:bg-accent"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Create New Task</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">⌘N</kbd>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => onNewProject?.())}
                                className="flex items-center gap-2 cursor-pointer rounded-sm hover:bg-accent"
                            >
                                <Folder className="h-4 w-4" />
                                <span>Create New Project</span>
                                <kbd className="ml-auto text-xs text-muted-foreground">⌘⇧N</kbd>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
