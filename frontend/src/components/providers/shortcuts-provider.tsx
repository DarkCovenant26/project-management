'use client';

import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { CommandDialog } from '@/components/command-palette/command-dialog';
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog';
import { useState } from 'react';

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
    const [commandOpen, setCommandOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    useKeyboardShortcuts({
        onOpenCommandPalette: () => setCommandOpen(true),
        onOpenShortcutsHelp: () => setHelpOpen(true),
    });

    return (
        <>
            {children}
            <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} />
            <KeyboardShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />
        </>
    );
}
