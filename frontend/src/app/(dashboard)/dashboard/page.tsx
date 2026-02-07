'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Folder,
    ListTodo,
    CheckCircle2,
    Plus
} from 'lucide-react';

import api from '@/lib/api';
import { getTasks } from '@/services/tasks';
import { getProjects } from '@/services/projects';
import { Project, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DashboardPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState({
        totalProjects: 0,
        pendingTasks: 0,
        completedTasks: 0
    });
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '' });

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [projectsData, tasksData] = await Promise.all([
                getProjects(),
                getTasks()
            ]);

            const fetchedProjects = projectsData.results;
            const fetchedTasks = tasksData.results;
            setProjects(fetchedProjects);

            // Calculate stats
            const pending = fetchedTasks.filter((t: Task) => !t.isCompleted).length;
            const completed = fetchedTasks.filter((t: Task) => t.isCompleted).length;

            setStats({
                totalProjects: fetchedProjects.length,
                pendingTasks: pending,
                completedTasks: completed
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/projects/', { name: newProject.title, description: newProject.description });
            setOpen(false);
            setNewProject({ title: '', description: '' });
            fetchAllData();
        } catch (error) {
            console.error('Failed to create project', error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-6 py-8">

                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <Folder className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '-' : stats.totalProjects}</div>
                            <p className="text-xs text-muted-foreground">Active workspaces</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                            <ListTodo className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '-' : stats.pendingTasks}</div>
                            <p className="text-xs text-muted-foreground">Across all projects</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? '-' : stats.completedTasks}</div>
                            <p className="text-xs text-muted-foreground">Successfully finished</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Your Projects</h2>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="shadow-lg shadow-primary/20">
                                <Plus className="mr-2 h-4 w-4" /> New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Project</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        placeholder="Project Name"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Description</Label>
                                    <Input
                                        id="desc"
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        placeholder="Short description..."
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Create</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-40 rounded-xl bg-muted/50 animate-pulse" />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground mb-4">No projects found.</p>
                        <Button variant="outline" onClick={() => setOpen(true)}>
                            Create your first project
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <Card key={project.id} className="hover:border-primary/50 transition-all hover:shadow-lg group cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                                <CardHeader>
                                    <CardTitle className="group-hover:text-primary transition-colors">{project.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">{project.description || "No description"}</CardDescription>
                                </CardHeader>
                                <CardFooter className="text-xs text-muted-foreground">
                                    Created {new Date(project.createdAt).toLocaleDateString()}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
