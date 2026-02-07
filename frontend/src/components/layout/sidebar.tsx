'use client';

import { useQuery } from '@tanstack/react-query';
import { Folder, LogOut, LayoutDashboard, ListTodo, Plus, Inbox, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { getProjects } from '@/services/projects';
import { getCurrentUser } from '@/services/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

import { ProjectCard } from '@/components/projects/project-card';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';
import { QuickCaptureSidebarBadge } from '@/components/quick-capture/quick-capture-sidebar-badge';

interface SidebarProps {
    isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
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
        { name: 'Board', href: '/board', icon: LayoutDashboard },
        { name: 'My Tasks', href: '/tasks', icon: ListTodo },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 64 : 256 }}
            className="fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar overflow-hidden"
        >
            <div className="flex h-full flex-col px-3 py-4 relative">
                <div className="mb-4 flex items-center h-8">
                    <AnimatePresence mode="wait">
                        {!isCollapsed ? (
                            <motion.span
                                key="full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="self-center whitespace-nowrap text-lg font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent origin-left pr-6"
                            >
                                TaskMaster
                            </motion.span>
                        ) : (
                            <motion.div
                                key="collapsed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full flex justify-center pr-2"
                            >
                                <LayoutDashboard className="h-5 w-5 text-primary" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="mb-4 space-y-1">
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-10",
                                pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                                isCollapsed ? "justify-center px-0" : ""
                            )}
                        >
                            <item.icon className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    ))}

                    <Link
                        href="/inbox"
                        className={cn(
                            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-10",
                            pathname === '/inbox' ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground",
                            isCollapsed ? "justify-center px-0" : ""
                        )}
                    >
                        <Inbox className={cn("h-4 w-4", isCollapsed ? "" : "mr-3")} />
                        {!isCollapsed && (
                            <>
                                <span>Inbox</span>
                                <QuickCaptureSidebarBadge />
                            </>
                        )}
                    </Link>
                </nav>

                <div className="mb-4 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
                    {!isCollapsed ? (
                        <div className="mb-1.5 px-3 flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                Projects
                            </span>
                            <CreateProjectDialog />
                        </div>
                    ) : (
                        <div className="mb-2 flex justify-center">
                            <CreateProjectDialog hideText />
                        </div>
                    )}
                    <ul className="space-y-0.5 px-1">
                        {isLoading ? (
                            <li className="px-3 py-2 text-xs text-muted-foreground flex justify-center italic">Loading...</li>
                        ) : projects?.results.length === 0 ? (
                            <li className="px-3 py-1 text-[11px] text-muted-foreground italic">No projects</li>
                        ) : projects?.results.map((project) => (
                            <li key={project.id}>
                                <ProjectCard project={project} isCollapsed={isCollapsed} />
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-auto space-y-2 pt-4 border-t border-sidebar-border">
                    {user && (
                        <div className={cn("flex items-center gap-3 px-2 mb-2", isCollapsed ? "justify-center" : "")}>
                            <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={`https://avatar.vercel.sh/${user.username}`} />
                                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <div className="flex flex-col overflow-hidden">
                                    <span className="truncate text-sm font-medium">{user.username}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className={cn("flex items-center px-2", isCollapsed ? "flex-col gap-2" : "justify-between")}>
                        <div className="flex items-center gap-1">
                            <ModeToggle />
                            <Link
                                href="/settings"
                                className={cn(
                                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8",
                                    pathname === '/settings' ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Settings className="h-4 w-4" />
                            </Link>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                                isCollapsed ? "h-8 w-8 p-0" : ""
                            )}
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.aside>
    );
}
