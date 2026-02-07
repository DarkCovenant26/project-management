'use client';

import { useState, useCallback } from 'react';

export function useMultiSelect<T extends { id: number | string }>(items: T[]) {
    const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
    const [lastSelectedId, setLastSelectedId] = useState<number | string | null>(null);

    const isSelected = useCallback(
        (id: number | string) => selectedIds.has(id),
        [selectedIds]
    );

    const toggleSelection = useCallback(
        (id: number | string, event?: React.MouseEvent) => {
            const newSelection = new Set(selectedIds);

            if (event?.shiftKey && lastSelectedId !== null) {
                // Range selection
                const itemIds = items.map(i => i.id);
                const startIndex = itemIds.indexOf(lastSelectedId);
                const endIndex = itemIds.indexOf(id);

                if (startIndex !== -1 && endIndex !== -1) {
                    const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
                    for (let i = min; i <= max; i++) {
                        newSelection.add(itemIds[i]);
                    }
                }
            } else if (event?.ctrlKey || event?.metaKey) {
                // Toggle single
                if (newSelection.has(id)) {
                    newSelection.delete(id);
                } else {
                    newSelection.add(id);
                }
            } else {
                // Single select
                newSelection.clear();
                newSelection.add(id);
            }

            setSelectedIds(newSelection);
            setLastSelectedId(id);
        },
        [selectedIds, lastSelectedId, items]
    );

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(items.map(i => i.id)));
    }, [items]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        setLastSelectedId(null);
    }, []);

    const getSelectedItems = useCallback(() => {
        return items.filter(i => selectedIds.has(i.id));
    }, [items, selectedIds]);

    return {
        selectedIds,
        selectedCount: selectedIds.size,
        isSelected,
        toggleSelection,
        selectAll,
        clearSelection,
        getSelectedItems,
    };
}
