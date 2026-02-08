'use client';

import { useState } from 'react';

export function useSidebar() {
    // Load state from localStorage on mount (lazy initialization)
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sidebar-collapsed');
            if (saved !== null) {
                return saved === 'true';
            }
        }
        return false;
    });

    const toggle = () => {
        setIsCollapsed((prev) => {
            const newState = !prev;
            localStorage.setItem('sidebar-collapsed', String(newState));
            return newState;
        });
    };

    const setCollapsed = (value: boolean) => {
        setIsCollapsed(value);
        localStorage.setItem('sidebar-collapsed', String(value));
    };

    return {
        isCollapsed,
        toggle,
        setCollapsed,
    };
}
