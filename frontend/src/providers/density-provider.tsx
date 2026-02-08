'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/auth';
import { useEffect } from 'react';

export function DensityProvider({ children }: { children: React.ReactNode }) {
    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
        retry: false, // Don't retry if not logged in
    });

    useEffect(() => {
        if (user?.appPreferences?.compactMode) {
            document.body.classList.add('density-high');
        } else {
            document.body.classList.remove('density-high');
        }
    }, [user?.appPreferences?.compactMode]);

    return <>{children}</>;
}
