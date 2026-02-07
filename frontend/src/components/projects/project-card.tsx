'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreVertical, Pencil, Trash2, Folder, Settings } from 'lucide-react';
import { Project } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditProjectDialog } from './edit-project-dialog';
import { DeleteProjectDialog } from './delete-project-dialog';
import { ProjectSettingsDialog } from './project-settings-dialog';

interface ProjectCardProps {
    project: Project;
    isCollapsed?: boolean;
}

export function ProjectCard({ project, isCollapsed }: ProjectCardProps) {
    const pathname = usePathname();
    const isActive = pathname === `/projects/${project.id}`;

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

    return (
        <>
            <div className={cn(
                "group relative flex items-center rounded-md text-sm font-medium transition-colors",
                isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-inset ring-sidebar-ring'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isCollapsed ? "justify-center" : ""
            )}>
                <Link
                    href={`/projects/${project.id}`}
                    className={cn("flex items-center p-2 truncate", isCollapsed ? "justify-center px-0" : "flex-1")}
                >
                    <Folder className={cn(
                        "h-4 w-4 shrink-0",
                        !isCollapsed && "mr-3",
                        isActive ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                    )} />
                    {!isCollapsed && <span className="truncate">{project.title}</span>}
                </Link>

                {!isCollapsed && (
                    <div className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
                                    <Settings className="mr-2 h-3.5 w-3.5" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                    <Pencil className="mr-2 h-3.5 w-3.5" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            <ProjectSettingsDialog project={project} open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen} />
            <EditProjectDialog
                project={project}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
            />
            <DeleteProjectDialog
                project={project}
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </>
    );
}

