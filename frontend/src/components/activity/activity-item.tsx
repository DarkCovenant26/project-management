'use client';

import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { PlusCircle, Pencil, CheckCircle, Trash, Circle, ListTodo, UserPlus, Tag, ArrowUpRight, MessageSquare } from 'lucide-react';

import { Activity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ActivityItemProps {
    activity: Activity;
}

const activityIcons: Record<string, React.ReactNode> = {
    created: <PlusCircle className="h-4 w-4 text-green-500" />,
    updated: <Pencil className="h-4 w-4 text-blue-500" />,
    completed: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    deleted: <Trash className="h-4 w-4 text-red-500" />,
    status_changed: <ListTodo className="h-4 w-4 text-orange-500" />,
    assigned: <UserPlus className="h-4 w-4 text-purple-500" />,
    tagged: <Tag className="h-4 w-4 text-yellow-500" />,
    untagged: <Tag className="h-4 w-4 text-gray-500" />,
    rearranged: <ArrowUpRight className="h-4 w-4 text-indigo-500" />,
    interacted: <MessageSquare className="h-4 w-4 text-pink-500" />,
};

const activityLabels: Record<string, string> = {
    created: 'Created',
    updated: 'Updated',
    completed: 'Completed',
    deleted: 'Deleted',
    status_changed: 'Changed status',
    assigned: 'Assigned to',
    tagged: 'Added tag',
    untagged: 'Removed tag',
    rearranged: 'Reordered',
    interacted: 'Interacted with',
};

export function ActivityItem({ activity }: ActivityItemProps) {
    const icon = activityIcons[activity.action] || <Circle className="h-4 w-4" />;
    const label = activityLabels[activity.action] || activity.action;
    const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });

    return (
        <div className="relative flex gap-3 pb-4">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />

            {/* Icon */}
            <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background border">
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>
                {activity.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {activity.description}
                    </p>
                )}
            </div>
        </div>
    );
}

export function getDateGroup(date: Date): string {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return 'This Week';
    return 'Older';
}
