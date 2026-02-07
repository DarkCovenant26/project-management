'use client';

import React from 'react';
import { BaseWidget } from './base-widget';
import { ActivityTimeline } from '@/components/activity/activity-timeline';
import { History } from 'lucide-react';

interface ActivityWidgetProps {
    onRemove?: () => void;
    onRefresh?: () => void;
}

export function ActivityWidget({ onRemove, onRefresh }: ActivityWidgetProps) {
    return (
        <BaseWidget
            title="Recent Activity"
            description="Latest updates from your projects"
            icon={History}
            onRemove={onRemove}
            onRefresh={onRefresh}
            className="col-span-1 lg:col-span-1"
        >
            <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <ActivityTimeline />
            </div>
        </BaseWidget>
    );
}
