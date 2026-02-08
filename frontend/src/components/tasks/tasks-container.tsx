'use client';

import { useState, useMemo } from 'react';
import { useInfiniteTasks } from '@/hooks/use-tasks';
import { useViewPreference } from '@/hooks/use-view-preference';
import { useMultiSelect } from '@/hooks/use-multi-select';
import { KanbanBoard } from '@/components/board/kanban-board';
import { ViewToggle } from './view-toggle';
import { BulkActionBar } from './bulk-action-bar';
import { TaskDetailSheet } from './task-detail-sheet';
import { Input } from '@/components/ui/input';
import { Search, Loader2, CalendarRange } from 'lucide-react';
import { Task, Project } from '@/lib/types';
import { SelectableTaskCard } from './selectable-task-card';
import { Button } from '@/components/ui/button';
import { SpreadsheetView } from '../projects/spreadsheet-view';
import { TimelineView } from './timeline-view';
import { CalendarView } from './calendar-view';
import { KanbanSkeleton } from '@/components/board/kanban-skeleton';

interface TasksContainerProps {
    projectId?: string;
    project?: Project;
}

export function TasksContainer({ projectId, project }: TasksContainerProps) {
    const { view, setView, isLoaded: isViewLoaded } = useViewPreference();
    const [search, setSearch] = useState('');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteTasks(projectId);

    const allTasks = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page?.results || []) as Task[];
    }, [data]);

    const filteredTasks = useMemo(() => {
        if (!search.trim()) return allTasks;
        const query = search.toLowerCase();
        return allTasks.filter(
            (t) =>
                t.title.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query)
        );
    }, [allTasks, search]);

    const {
        selectedIds,
        selectedCount,
        isSelected,
        toggleSelection,
        toggleOne,
        selectMany,
        deselectMany,
        clearSelection,
    } = useMultiSelect(filteredTasks);

    if (!isViewLoaded || isLoading) {
        if (view === 'board') {
            return <KanbanSkeleton />;
        }
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const renderView = () => {
        switch (view) {
            case 'board':
                return (
                    <KanbanBoard
                        tasks={filteredTasks}
                        projectId={projectId}
                        project={project}
                        view={view}
                        onViewChange={setView}
                        selectedTaskIds={Array.from(selectedIds)}
                        onToggleSelection={toggleSelection}
                        onToggleOne={(id) => toggleOne(id)}
                        onSelectMany={(ids) => selectMany(ids)}
                        onDeselectMany={(ids) => deselectMany(ids)}
                    />
                );
            case 'spreadsheet':
                return <SpreadsheetView tasks={filteredTasks} onTaskUpdate={(task) => setSelectedTask(task)} />;
            case 'calendar':
                return <CalendarView tasks={filteredTasks} onTaskClick={(task) => setSelectedTask(task)} />;
            case 'timeline':
                return <TimelineView tasks={filteredTasks} projectId={projectId} />;
            case 'list':
            default:
                return (
                    <div className="space-y-4">
                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-12 border border-dashed rounded-lg">
                                <p className="text-muted-foreground italic">No tasks found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {filteredTasks.map((task) => (
                                    <div key={task.id} onClick={() => setSelectedTask(task)} className="cursor-pointer">
                                        <SelectableTaskCard
                                            task={task}
                                            isSelected={isSelected(task.id)}
                                            onSelect={(id, e) => {
                                                e.stopPropagation();
                                                toggleSelection(id, e);
                                            }}
                                            onToggleOne={(id) => toggleOne(id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {hasNextPage && (
                            <div className="flex justify-center pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? 'Loading...' : 'Load More'}
                                </Button>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {view !== 'board' && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-1 px-1 bg-muted/20 rounded-xl border border-border/40 backdrop-blur-sm">
                    <div className="relative flex-1 max-w-sm ml-1">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            className="pl-9 h-8 text-xs border-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary/20"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="mr-1">
                        <ViewToggle view={view} onViewChange={setView} />
                    </div>
                </div>
            )}

            {renderView()}

            <BulkActionBar
                selectedCount={selectedCount}
                selectedIds={selectedIds}
                onClear={clearSelection}
            />

            <TaskDetailSheet
                task={selectedTask as Task}
                open={!!selectedTask}
                onClose={() => setSelectedTask(null)}
            />
        </div>
    );
}
