'use client';

import { useEffect, useState } from 'react';

type ViewPreference = 'list' | 'board';

const STORAGE_KEY = 'task-view-preference';

export function useViewPreference() {
    const [view, setView] = useState<ViewPreference>('list');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ViewPreference | null;
        if (stored && (stored === 'list' || stored === 'board')) {
            setView(stored);
        }
        setIsLoaded(true);
    }, []);

    const setViewPreference = (newView: ViewPreference) => {
        setView(newView);
        localStorage.setItem(STORAGE_KEY, newView);
    };

    return { view, setView: setViewPreference, isLoaded };
}
