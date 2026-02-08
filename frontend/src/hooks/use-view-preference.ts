'use client';

import { useState } from 'react';

type ViewPreference = 'list' | 'board' | 'spreadsheet' | 'timeline' | 'calendar';

const STORAGE_KEY = 'task-view-preference';

export function useViewPreference() {
    const [view, setView] = useState<ViewPreference>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY) as ViewPreference | null;
            if (stored && (stored === 'list' || stored === 'board' || stored === 'spreadsheet' || stored === 'timeline' || stored === 'calendar')) {
                return stored;
            }
        }
        return 'list';
    });
    const [isLoaded] = useState(true); // Since we load synchronously from localStorage, it's loaded immediately

    const setViewPreference = (newView: ViewPreference) => {
        setView(newView);
        localStorage.setItem(STORAGE_KEY, newView);
    };

    return { view, setView: setViewPreference, isLoaded };
}
