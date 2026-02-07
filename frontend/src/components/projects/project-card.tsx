'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreVertical, Pencil, Trash2, Folder } from 'lucide-react';
import { Project } from '@/lib/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EditProjectDialog } from './edit-project-dialog';
import { DeleteProjectDialog } from './delete-project-dialog';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const pathname = usePathname();
    const isActive = pathname === `/projects/${project.id}`;

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    return (
        <>
            <div className={`group relative flex items-center rounded-md text-sm font-medium transition-colors ${isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-inset ring-sidebar-ring'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}>
                <Link
                    href={`/projects/${project.id}`}
                    className="flex flex-1 items-center p-2 truncate"
                >
                    <Folder className={`mr-3 h-4 w-4 shrink-0 ${isActive ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                        }`} />
                    <span className="truncate">{project.title}</span>
                </Link>

                <div className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                            </DropdownMenuItem>
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
            </div>

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
