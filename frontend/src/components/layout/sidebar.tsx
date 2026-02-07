'use client';

import { useQuery } from '@tanstack/react-query';
import { Folder, LogOut, LayoutDashboard, ListTodo } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { getProjects } from '@/services/projects';
import { getCurrentUser } from '@/services/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

import { ProjectCard } from '@/components/projects/project-card';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
    });

    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects,
    });

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        document.cookie = 'access=; path=/; max-age=0; SameSite=Lax';
        router.push('/login');
    };

    const mainNav = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Tasks', href: '/tasks', icon: ListTodo },
    ];

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-6 flex items-center pl-2.5">
                    <span className="self-center whitespace-nowrap text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                        TaskMaster
                    </span>
                </div>

                <nav className="mb-4 space-y-1">
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="mr-3 h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="mb-4 flex-1 overflow-y-auto">
                    <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span>Projects</span>
                        <CreateProjectDialog />
                    </div>
                    <ul className="space-y-1 px-1">
                        {isLoading ? (
                            <li className="px-3 py-2 text-sm text-muted-foreground">Loading...</li>
                        ) : projects?.results.map((project) => (
                            <li key={project.id}>
                                <ProjectCard project={project} />
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto space-y-2 pt-4 border-t border-sidebar-border">
                    {user && (
                        <div className="flex items-center gap-3 px-2 mb-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://avatar.vercel.sh/${user.username}`} />
                                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate text-sm font-medium">{user.username}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center px-2">
                        <ModeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
