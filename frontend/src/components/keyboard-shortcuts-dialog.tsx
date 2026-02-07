'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SHORTCUTS, SHORTCUT_CATEGORIES } from '@/lib/shortcuts';

interface KeyboardShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Keyboard Shortcuts</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    {SHORTCUT_CATEGORIES.map(category => (
                        <div key={category}>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                {category}
                            </h4>
                            <div className="space-y-2">
                                {SHORTCUTS.filter(s => s.category === category).map(shortcut => (
                                    <div
                                        key={shortcut.key}
                                        className="flex items-center justify-between py-1.5"
                                    >
                                        <span className="text-sm">{shortcut.description}</span>
                                        <div className="flex gap-1">
                                            {shortcut.key.split(', ').map((key, i) => (
                                                <kbd
                                                    key={i}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-mono bg-muted rounded border"
                                                >
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
