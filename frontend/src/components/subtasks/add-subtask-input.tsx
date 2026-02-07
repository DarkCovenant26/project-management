'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddSubtaskInputProps {
    onAdd: (title: string) => void;
}

export function AddSubtaskInput({ onAdd }: AddSubtaskInputProps) {
    const [title, setTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onAdd(title.trim());
        setTitle('');
    };

    const handleBlur = () => {
        if (!title.trim()) {
            setIsAdding(false);
        }
    };

    if (!isAdding) {
        return (
            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setIsAdding(true)}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add a subtask...
            </Button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-2">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleBlur}
                placeholder="Enter subtask title..."
                className="h-8 text-sm"
                autoFocus
            />
            <Button type="submit" size="sm" className="shrink-0">
                Add
            </Button>
        </form>
    );
}
