'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getTasks } from '@/services/tasks';

export function useInfiniteTasks(projectId?: number | string) {
    return useInfiniteQuery({
        queryKey: ['tasks', projectId],
        queryFn: ({ pageParam = 1 }) => getTasks({ projectId, page: pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage?.next) return undefined;
            try {
                // Extracts the page number from the 'next' URL (standard for DRF)
                const url = new URL(lastPage.next);
                const page = url.searchParams.get('page');
                return page ? parseInt(page) : undefined;
            } catch (e) {
                console.error('Failed to parse next page URL:', e);
                return undefined;
            }
        },
        enabled: true,
    });
}
