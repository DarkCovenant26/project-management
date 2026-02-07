'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TAG_COLORS = [
    'hsl(0 84% 60%)',    // Red
    'hsl(25 95% 53%)',   // Orange
    'hsl(45 93% 47%)',   // Yellow
    'hsl(142 76% 36%)',  // Green
    'hsl(173 80% 40%)',  // Teal
    'hsl(199 89% 48%)',  // Cyan
    'hsl(217 91% 60%)',  // Blue
    'hsl(263 70% 50%)',  // Purple
    'hsl(330 81% 60%)',  // Pink
    'hsl(220 14% 50%)',  // Gray
];

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {TAG_COLORS.map((color) => (
                <button
                    key={color}
                    type="button"
                    className={cn(
                        'h-8 w-8 rounded-full transition-all hover:scale-110 flex items-center justify-center',
                        value === color && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => onChange(color)}
                >
                    {value === color && (
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                    )}
                </button>
            ))}
        </div>
    );
}
