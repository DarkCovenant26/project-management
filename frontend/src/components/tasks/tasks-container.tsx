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
import { Search, Loader2 } from 'lucide-react';
import { Task } from '@/lib/types';

interface TasksContainerProps {
    projectId?: number;
}

export function TasksContainer({ projectId }: TasksContainerProps) {
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
        return data?.pages.flatMap((page) => page.results) || [];
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
        clearSelection,
    } = useMultiSelect(filteredTasks);

    if (!isViewLoaded || isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <ViewToggle view={view} onViewChange={setView} />
            </div>

            {view === 'list' ? (
                <div className="space-y-4">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12 border border-dashed rounded-lg">
                            <p className="text-muted-foreground">No tasks found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredTasks.map((task) => (
                                <div key={task.id} onClick={() => setSelectedTask(task)} className="cursor-pointer">
                                    {/* Using SelectableTaskCard for list view integration */}
                                    <SelectableTaskCard
                                        task={task}
                                        isSelected={isSelected(task.id)}
                                        onSelect={(id, e) => {
                                            e.stopPropagation();
                                            toggleSelection(id, e);
                                        }}
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
            ) : (
                <KanbanBoard tasks={filteredTasks} projectId={projectId} />
            )}

            <BulkActionBar
                selectedCount={selectedCount}
                selectedIds={selectedIds}
                onClear={clearSelection}
                projectId={projectId}
            />

            <TaskDetailSheet
                task={selectedTask as Task}
                open={!!selectedTask}
                onClose={() => setSelectedTask(null)}
            />
        </div>
    );
}

// I need to import SelectableTaskCard but it's in the same directory usually.
// Wait, I should make sure imports are correct.
import { SelectableTaskCard } from './selectable-task-card';
import { Button } from '@/components/ui/button';
