'use client';

import { useQuery } from '@tanstack/react-query';
import { getQuickNotes } from '@/services/quick-capture';
import { Badge } from '@/components/ui/badge';
import { Inbox } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function QuickCaptureSidebarBadge() {
    const { data } = useQuery({
        queryKey: ['quick-notes'],
        queryFn: () => getQuickNotes(false), // Fetch active notes
        // Refetch every minute to keep badge fresh
        refetchInterval: 60000
    });

    const count = data?.count || 0;

    return (
        <>
            {count > 0 && (
                <Badge variant="secondary" className="ml-auto px-1.5 py-0.5 text-[10px] h-5 min-w-5 flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                </Badge>
            )}
        </>
    );
}
