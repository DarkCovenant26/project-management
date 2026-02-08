'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';

interface UseKeyboardShortcutsProps {
    onOpenCommandPalette: () => void;
    onOpenShortcutsHelp: () => void;
    onNewTask?: () => void;
    onNewProject?: () => void;
    onViewChange?: (view: 'list' | 'board') => void;
}

export function useKeyboardShortcuts({
    onOpenCommandPalette,
    onOpenShortcutsHelp,
    onNewTask,
    onNewProject,
    onViewChange,
}: UseKeyboardShortcutsProps) {
    const router = useRouter();

    // Command palette
    useHotkeys('ctrl+shift+p, meta+shift+p', (e) => {
        e.preventDefault();
        onOpenCommandPalette();
    }, { enableOnFormTags: false });

    // Shortcuts help
    useHotkeys('shift+/', (e) => {
        e.preventDefault();
        onOpenShortcutsHelp();
    }, { enableOnFormTags: false });

    // New task
    useHotkeys('ctrl+n, meta+n', (e) => {
        e.preventDefault();
        onNewTask?.();
    }, { enableOnFormTags: false });

    // New project
    useHotkeys('ctrl+shift+n, meta+shift+n', (e) => {
        e.preventDefault();
        onNewProject?.();
    }, { enableOnFormTags: false });

    // Navigation: g then d/t/b
    useHotkeys('g', () => {
        // Set up listener for next key
        const handleNextKey = (e: KeyboardEvent) => {
            document.removeEventListener('keydown', handleNextKey);

            switch (e.key.toLowerCase()) {
                case 'd':
                    router.push('/dashboard');
                    break;
                case 't':
                    router.push('/tasks');
                    break;
                case 'b':
                    router.push('/board');
                    break;
            }
        };

        document.addEventListener('keydown', handleNextKey);

        // Clean up after 1 second if no key pressed
        setTimeout(() => {
            document.removeEventListener('keydown', handleNextKey);
        }, 1000);
    }, { enableOnFormTags: false });

    // View switching
    useHotkeys('1', () => onViewChange?.('list'), { enableOnFormTags: false });
    useHotkeys('2', () => onViewChange?.('board'), { enableOnFormTags: false });
}
