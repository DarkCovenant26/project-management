'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function KanbanSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-full max-w-xs" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col min-w-[280px] max-w-[320px] shrink-0 gap-4">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <div className="space-y-3 p-2 border-2 border-dashed border-muted rounded-xl bg-muted/30">
                            {[1, 2, 3].map((j) => (
                                <Skeleton key={j} className="h-32 w-full rounded-lg" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
