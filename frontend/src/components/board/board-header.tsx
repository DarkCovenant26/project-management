'use client';

import { Search, SlidersHorizontal, X, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BoardColumn as BoardColumnType, ProjectMember } from '@/lib/types';
import { getProjectMembers } from '@/services/projects';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface BoardHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    projectId: string | number;
    columns: BoardColumnType[];
    onColumnsChange: (columns: BoardColumnType[]) => void;
    filterPriority: string | null;
    onPriorityFilterChange: (priority: string | null) => void;
    selectedAssignees: number[];
    onAssigneeToggle: (userId: number) => void;
}

const priorityColors: Record<string, string> = {
    High: 'from-red-500 to-rose-600',
    Medium: 'from-amber-500 to-orange-600',
    Low: 'from-blue-500 to-indigo-600',
};

const AVATAR_COLORS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-orange-500 to-amber-600',
];

export function BoardHeader({
    searchQuery,
    onSearchChange,
    projectId,
    columns,
    onColumnsChange,
    filterPriority,
    onPriorityFilterChange,
    selectedAssignees,
    onAssigneeToggle
}: BoardHeaderProps) {
    const { data: members, isLoading } = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: () => getProjectMembers(projectId),
        enabled: !!projectId,
    });

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 py-2">
            {/* Search and Filters Group */}
            <div className="flex flex-1 items-center gap-3">
                {/* Left: Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                    <Input
                        type="search"
                        placeholder="Search tasks..."
                        className={cn(
                            "pl-10 h-10 bg-background/60 border-white/10",
                            "focus:bg-background focus:border-primary/50",
                            "placeholder:text-muted-foreground/40",
                            "transition-all duration-200"
                        )}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Filters right of search */}
                <div className="flex items-center gap-2">
                    {/* Avatar Filters */}
                    <TooltipProvider>
                        <div className="flex items-center">
                            <div className="flex -space-x-2 mr-2">
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : (
                                    members?.slice(0, 5).map((member, index) => {
                                        const isSelected = selectedAssignees.includes(member.userId);
                                        return (
                                            <Tooltip key={member.id}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => onAssigneeToggle(member.userId)}
                                                        className={cn(
                                                            "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                                                            "bg-gradient-to-br ring-2 ring-background shadow-sm",
                                                            "hover:ring-primary/50 hover:scale-110 transition-all duration-200",
                                                            AVATAR_COLORS[index % AVATAR_COLORS.length],
                                                            isSelected ? "ring-primary ring-offset-2 ring-offset-background z-10 scale-110 shadow-md" : "opacity-80 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                                                        )}
                                                    >
                                                        {(member.username?.[0] || member.email?.[0] || '?').toUpperCase()}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    <p className="text-xs">{member.username || member.email}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })
                                )}
                                {members && members.length > 5 && (
                                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                        +{members.length - 5}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TooltipProvider>

                    <div className="h-6 w-px bg-border/30 mx-1" />

                    {/* Priority Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant={filterPriority ? "secondary" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-9 gap-2 px-3 font-medium",
                                    filterPriority && "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/15"
                                )}
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {filterPriority ? `${filterPriority}` : 'Filter'}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                                Priority
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onPriorityFilterChange(null)}>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-muted" />
                                    All
                                </div>
                            </DropdownMenuItem>
                            {(['Critical', 'High', 'Medium', 'Low'] as const).map(priority => (
                                <DropdownMenuItem key={priority} onClick={() => onPriorityFilterChange(priority)}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("h-2 w-2 rounded-full bg-gradient-to-r", priorityColors[priority] || 'from-slate-400 to-slate-500')} />
                                        {priority}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Clear Filters (only show when active) */}
                    {(searchQuery || filterPriority || selectedAssignees.length > 0) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                onSearchChange('');
                                onPriorityFilterChange(null);
                                if (selectedAssignees.length > 0) {
                                    selectedAssignees.forEach(id => onAssigneeToggle(id));
                                }
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}


