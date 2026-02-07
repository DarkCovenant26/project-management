'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Folder,
    ListTodo,
    CheckCircle2,
    BarChart3,
    Target
} from 'lucide-react';

import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { getProjects } from '@/services/projects';
import { getDashboardStats } from '@/services/tasks';
import { Button } from '@/components/ui/button';
import { KPIWidget } from '@/components/dashboard/widgets/kpi-widget';
import { ChartWidget } from '@/components/dashboard/widgets/chart-widget';
import { ActivityWidget } from '@/components/dashboard/widgets/activity-widget';
import { WidgetGrid } from '@/components/dashboard/widget-grid';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { SortableWidget } from '@/components/dashboard/sortable-widget';
import { cn } from '@/lib/utils';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { toast } from 'sonner';

import { getCurrentUser } from '@/services/auth';

const DEFAULT_WIDGETS = ['kpi-total', 'kpi-pending', 'kpi-done', 'chart-priority', 'chart-status', 'activity'];

const WIDGET_SPANS: Record<string, string> = {
    'activity': "lg:col-span-2 xl:col-span-2 2xl:col-span-3",
};

export default function DashboardPage() {
    const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
    const [activeId, setActiveId] = useState<string | null>(null);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
    });

    useEffect(() => {
        if (user?.dashboardPreferences?.widget_order) {
            setWidgets(user.dashboardPreferences.widget_order);
        }
    }, [user]);

    const { data: projectsData, isLoading: loadingProjects } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
    });

    const { data: statsData, isLoading: loadingStats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: getDashboardStats,
    });

    const { data: distData, isLoading: loadingDist } = useQuery({
        queryKey: ['task-distribution'],
        queryFn: () => api.get('/tasks/analytics/distribution/').then(res => res.data),
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const removeWidget = (id: string) => {
        const newOrder = widgets.filter(w => w !== id);
        setWidgets(newOrder);
        persistOrder(newOrder);
    };

    const persistOrder = (newOrder: string[]) => {
        // Map to coordinates/metadata as requested
        const preferences = {
            ...user?.dashboardPreferences,
            widget_order: newOrder,
            widgets_metadata: newOrder.reduce((acc, id, index) => {
                acc[id] = {
                    x: index % 4, // simplistic x mapping 
                    y: Math.floor(index / 4),
                    w: id === 'activity' ? 3 : 1,
                    h: 1
                };
                return acc;
            }, {} as any)
        };

        api.patch('/users/me/', { dashboard_preferences: preferences })
            .catch(() => toast.error('Failed to save layout'));

        // GRC Audit Trail - Standardized payload
        api.post('/activity/log_event/', {
            action: 'rearranged',
            target_type: 'dashboard',
            target_id: 'user_layout',
            target_title: 'User Dashboard Layout',
            description: `Layout updated: ${newOrder.join(', ')}`,
            delta: { new_order: newOrder }
        }).catch(() => { });
    };

    const handleDragStart = (event: DragStartEvent) => {
        const id = event.active.id as string;
        setActiveId(id);

        // GRC Audit Trail for interaction start
        api.post('/activity/log_event/', {
            action: 'interacted',
            target_type: 'widget',
            target_id: id,
            target_title: id,
            description: `Started dragging widget: ${id}`
        }).catch(() => { });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            setWidgets((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                persistOrder(newOrder);
                return newOrder;
            });
        }
    };

    const renderWidget = (id: string, isOverlay = false) => {
        const common = { onRemove: isOverlay ? undefined : () => removeWidget(id) };

        const widgetMap: Record<string, React.ReactNode> = {
            'kpi-total': (
                <KPIWidget
                    title="Projects"
                    value={projectsData?.count || 0}
                    subValue="Active workspaces"
                    icon={Folder}
                    loading={loadingProjects}
                    {...common}
                />
            ),
            'kpi-pending': (
                <KPIWidget
                    title="Pending"
                    value={statsData?.pending_tasks || 0}
                    subValue="Tasks to do"
                    icon={ListTodo}
                    loading={loadingStats}
                    {...common}
                />
            ),
            'kpi-done': (
                <KPIWidget
                    title="Done"
                    value={statsData?.completed_tasks || 0}
                    subValue="Across projects"
                    icon={CheckCircle2}
                    loading={loadingStats}
                    {...common}
                />
            ),
            'chart-priority': (
                <ChartWidget
                    title="Priority"
                    description="Task urgency"
                    icon={Target}
                    data={distData?.priority.map((p: any) => ({
                        label: p.priority,
                        value: p.count,
                        color: p.priority === 'High' ? 'bg-red-500' : p.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                    })) || []}
                    loading={loadingDist}
                    {...common}
                />
            ),
            'chart-status': (
                <ChartWidget
                    title="Status"
                    description="Tasks pipeline"
                    icon={BarChart3}
                    data={distData?.status.map((s: any) => ({
                        label: s.status,
                        value: s.count,
                        color: s.status === 'done' ? 'bg-green-500' : s.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-400'
                    })) || []}
                    loading={loadingDist}
                    {...common}
                />
            ),
            'activity': <ActivityWidget {...common} />,
        };

        return widgetMap[id] || null;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
                    <p className="text-xs text-muted-foreground">Manage your insights and project performance.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => {
                        setWidgets(DEFAULT_WIDGETS);
                        persistOrder(DEFAULT_WIDGETS);
                    }}>
                        Reset Layout
                    </Button>
                    <CreateProjectDialog hideText={false} />
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={widgets} strategy={rectSortingStrategy}>
                    <WidgetGrid>
                        {widgets.map(id => (
                            <SortableWidget
                                key={id}
                                id={id}
                                className={WIDGET_SPANS[id] || ""}
                                isGhost={activeId === id}
                            >
                                {renderWidget(id)}
                            </SortableWidget>
                        ))}
                    </WidgetGrid>
                </SortableContext>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: { opacity: '0.4' },
                        },
                    }),
                }}>
                    {activeId ? (
                        <div className={cn("h-full w-full", WIDGET_SPANS[activeId] || "")}>
                            {renderWidget(activeId, true)}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
