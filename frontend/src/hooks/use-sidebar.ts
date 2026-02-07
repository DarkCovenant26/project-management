'use client';

import { useState, useEffect } from 'react';

export function useSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved !== null) {
            setIsCollapsed(saved === 'true');
        }
    }, []);

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
