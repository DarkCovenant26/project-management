'use client';

import { useQuery } from '@tanstack/react-query';
import { Folder, LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { getProjects } from '@/services/projects';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
    });

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        router.push('/login');
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-6 flex items-center pl-2.5">
                    <span className="self-center whitespace-nowrap text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                        TaskMaster
                    </span>
                </div>

                <div className="mb-4">
                    <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Projects
                    </div>
                    <ul className="space-y-1">
                        {isLoading ? (
                            <li className="px-3 py-2 text-sm text-muted-foreground">Loading...</li>
                        ) : projects?.map((project) => (
                            <li key={project.id}>
                                <Link
                                    href={`/projects/${project.id}`}
                                    className={`group flex items-center rounded-md p-2 text-sm font-medium ${pathname === `/projects/${project.id}`
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-inset ring-sidebar-ring'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                        }`}
                                >
                                    <Folder className={`mr-3 h-4 w-4 ${pathname === `/projects/${project.id}` ? 'text-sidebar-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'
                                        }`} />
                                    {project.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto space-y-2">
                    <div className="flex justify-between items-center px-2">
                        <ModeToggle />
                    </div>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Project
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </aside>
    );
}
