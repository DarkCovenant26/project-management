'use client';

import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function ActivityPage() {
    return (
        <div className="container max-w-4xl py-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Activity Feed</h1>
                <p className="text-muted-foreground mt-1">
                    Track all updates across your projects and tasks.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <CardDescription>
                        A chronological log of all actions performed in your workspaces.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ActivityTimeline />
                </CardContent>
            </Card>
        </div>
    );
}
