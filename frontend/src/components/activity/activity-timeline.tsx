'use client';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { Activity } from '@/lib/types';
import { getTaskActivities, getProjectActivities, getUserActivities } from '@/services/activity';
import { ActivityItem, getDateGroup } from './activity-item';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityTimelineProps {
    taskId?: string | number;
    projectId?: string | number;
}

export function ActivityTimeline({ taskId, projectId }: ActivityTimelineProps) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: taskId
            ? ['activities', 'task', taskId]
            : projectId
                ? ['activities', 'project', projectId]
                : ['activities', 'user'],
        queryFn: async ({ pageParam = 1 }: { pageParam?: number }) => {
            if (taskId) {
                return getTaskActivities(taskId, pageParam);
            }
            if (projectId) {
                return getProjectActivities(projectId, pageParam);
            }
            return getUserActivities(pageParam);
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.next) {
                const url = new URL(lastPage.next);
                const page = url.searchParams.get('page');
                return page ? parseInt(page) : undefined;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    const activities = useMemo(() => {
        return data?.pages.flatMap(page => page.results) || [];
    }, [data]);

    // Group activities by date
    const groupedActivities = useMemo(() => {
        const groups: { [key: string]: Activity[] } = {};

        activities.forEach(activity => {
            const group = getDateGroup(new Date(activity.createdAt));
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(activity);
        });

        return groups;
    }, [activities]);

    const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'];

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                No activity yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {groupOrder.map(groupName => {
                const groupActivities = groupedActivities[groupName];
                if (!groupActivities || groupActivities.length === 0) return null;

                return (
                    <div key={groupName}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {groupName}
                        </h4>
                        <div>
                            {groupActivities.map(activity => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))}
                        </div>
                    </div>
                );
            })}

            {hasNextPage && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </Button>
            )}
        </div>
    );
}
