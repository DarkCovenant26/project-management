'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Users, LayoutGrid, Info, Loader2, UserPlus, Trash2, Shield } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Project, ProjectMember } from '@/lib/types';
import { getProjectMembers, addProjectMember, updateProjectMember, removeProjectMember } from '@/services/projects';

interface ProjectSettingsDialogProps {
    project: Project;
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const roleLabels: Record<string, { label: string; color: string }> = {
    owner: { label: 'Owner', color: 'bg-amber-500/10 text-amber-500' },
    admin: { label: 'Admin', color: 'bg-blue-500/10 text-blue-500' },
    member: { label: 'Member', color: 'bg-green-500/10 text-green-500' },
    viewer: { label: 'Viewer', color: 'bg-gray-500/10 text-gray-500' },
};

export function ProjectSettingsDialog({ project, children, open: controlledOpen, onOpenChange }: ProjectSettingsDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    const [activeTab, setActiveTab] = useState('members');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
    const queryClient = useQueryClient();

    const { data: members, isLoading: loadingMembers } = useQuery({
        queryKey: ['project-members', project.id],
        queryFn: () => getProjectMembers(project.id),
        enabled: open,
    });

    const { mutate: addMember, isPending: isAdding } = useMutation({
        mutationFn: (data: { email: string; role: string }) =>
            addProjectMember(project.id, data.email, data.role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-members', project.id] });
            setInviteEmail('');
            toast.success('Member added successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to add member');
        },
    });

    const { mutate: updateMember } = useMutation({
        mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
            updateProjectMember(project.id, memberId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-members', project.id] });
            toast.success('Role updated');
        },
        onError: () => toast.error('Failed to update role'),
    });

    const { mutate: removeMember } = useMutation({
        mutationFn: (memberId: string) => removeProjectMember(project.id, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-members', project.id] });
            toast.success('Member removed');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to remove member');
        },
    });

    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        addMember({ email: inviteEmail, role: inviteRole });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Project Settings: {project.title}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="members" className="gap-2">
                            <Users className="h-4 w-4" />
                            Members
                        </TabsTrigger>
                        <TabsTrigger value="board" className="gap-2">
                            <LayoutGrid className="h-4 w-4" />
                            Board
                        </TabsTrigger>
                        <TabsTrigger value="general" className="gap-2">
                            <Info className="h-4 w-4" />
                            General
                        </TabsTrigger>
                    </TabsList>

                    {/* Members Tab */}
                    <TabsContent value="members" className="space-y-4 mt-4">
                        {/* Invite Form */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter email address"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="flex-1"
                            />
                            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                                <SelectTrigger className="w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleInvite} disabled={isAdding || !inviteEmail.trim()}>
                                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                            </Button>
                        </div>

                        {/* Members List */}
                        <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                            {loadingMembers ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : members?.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    No members yet. Add your first team member above.
                                </div>
                            ) : (
                                members?.map((member: ProjectMember) => (
                                    <div key={member.id} className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://avatar.vercel.sh/${member.username}`} />
                                                <AvatarFallback>{member.username[0]?.toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">{member.username}</p>
                                                <p className="text-xs text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {member.role === 'owner' ? (
                                                <Badge className={roleLabels.owner.color}>
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Owner
                                                </Badge>
                                            ) : (
                                                <>
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(role) => updateMember({ memberId: member.id, role })}
                                                    >
                                                        <SelectTrigger className="w-24 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            <SelectItem value="member">Member</SelectItem>
                                                            <SelectItem value="viewer">Viewer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                        onClick={() => removeMember(member.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Board Tab */}
                    <TabsContent value="board" className="mt-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Configure your Kanban board columns. Changes apply to all project members.
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                            Board configuration is managed via the gear icon on the Board page.
                        </p>
                    </TabsContent>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Project Name</Label>
                            <Input defaultValue={project.title} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input defaultValue={project.description || ''} />
                        </div>
                        <div className="pt-4 border-t">
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Project
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
