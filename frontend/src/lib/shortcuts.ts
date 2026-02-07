export interface Shortcut {
    key: string;
    description: string;
    category: 'Navigation' | 'Actions' | 'General';
}

export const SHORTCUTS: Shortcut[] = [
    // General
    { key: 'ctrl+k, ⌘+k', description: 'Open command palette', category: 'General' },
    { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
    { key: 'Escape', description: 'Close modal/dialog', category: 'General' },

    // Navigation
    { key: 'g then d', description: 'Go to Dashboard', category: 'Navigation' },
    { key: 'g then t', description: 'Go to Tasks', category: 'Navigation' },
    { key: 'g then b', description: 'Go to Board', category: 'Navigation' },

    // Actions
    { key: 'ctrl+n, ⌘+n', description: 'New task', category: 'Actions' },
    { key: 'ctrl+shift+n, ⌘+shift+n', description: 'New project', category: 'Actions' },
    { key: '1', description: 'Switch to List view', category: 'Actions' },
    { key: '2', description: 'Switch to Board view', category: 'Actions' },
];

export const SHORTCUT_CATEGORIES = ['Navigation', 'Actions', 'General'] as const;
