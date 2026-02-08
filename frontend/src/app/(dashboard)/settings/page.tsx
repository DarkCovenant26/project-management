'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, User, Bell, Palette, Keyboard, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { getCurrentUser, updateUserProfile } from '@/services/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ModeToggle } from '@/components/mode-toggle';
import { PageHeader } from '@/components/layout/page-header';

export default function SettingsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('account');

    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: getCurrentUser,
    });

    const { mutate: updateProfile, isPending: isSaving } = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success('Settings saved');
        },
        onError: () => toast.error('Failed to save settings'),
    });

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Settings"
                description="Manage your preferences"
                icon={Settings}
            />

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                    <TabsTrigger value="account" className="gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notifications</span>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Appearance</span>
                    </TabsTrigger>
                    <TabsTrigger value="shortcuts" className="gap-2">
                        <Keyboard className="h-4 w-4" />
                        <span className="hidden sm:inline">Shortcuts</span>
                    </TabsTrigger>
                </TabsList>

                {/* Account Tab */}
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Settings</CardTitle>
                            <CardDescription>Manage your profile information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        defaultValue={user?.username}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue={user?.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue={user?.first_name || ''} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue={user?.last_name || ''} />
                                </div>
                            </div>
                            <Button disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Configure how you receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive email updates about your tasks
                                    </p>
                                </div>
                                <Switch defaultChecked={user?.notificationPreferences?.email !== false} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Task Reminders</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Get reminded before task due dates
                                    </p>
                                </div>
                                <Switch defaultChecked={user?.notificationPreferences?.reminders !== false} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Project Updates</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Notify when team members update projects
                                    </p>
                                </div>
                                <Switch defaultChecked={user?.notificationPreferences?.projectUpdates !== false} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize how Scope looks</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Theme</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Switch between light and dark mode
                                    </p>
                                </div>
                                <ModeToggle />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Compact Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Reduce spacing for denser information display
                                    </p>
                                </div>
                                <Switch
                                    checked={user?.appPreferences?.compactMode === true}
                                    onCheckedChange={(checked) => {
                                        updateProfile({
                                            appPreferences: {
                                                ...user?.appPreferences,
                                                compactMode: checked
                                            }
                                        });
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Shortcuts Tab */}
                <TabsContent value="shortcuts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Keyboard Shortcuts</CardTitle>
                            <CardDescription>Quick actions reference</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3">
                                {[
                                    { keys: ['⌘', 'Shift', 'P'], action: 'Open Command Palette' },
                                    { keys: ['Shift', '?'], action: 'Show Shortcuts Help' },
                                    { keys: ['⌘', 'N'], action: 'New Task' },
                                    { keys: ['⌘', 'Shift', 'N'], action: 'New Project' },
                                    { keys: ['G', 'D'], action: 'Go to Dashboard' },
                                    { keys: ['G', 'T'], action: 'Go to Tasks' },
                                    { keys: ['G', 'B'], action: 'Go to Board' },
                                    { keys: ['1'], action: 'Switch to List View' },
                                    { keys: ['2'], action: 'Switch to Board View' },
                                ].map((shortcut, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-border/50">
                                        <span className="text-sm font-medium">{shortcut.action}</span>
                                        <div className="flex gap-1">
                                            {shortcut.keys.map((key, j) => (
                                                <kbd
                                                    key={j}
                                                    className="px-2 py-1 text-[10px] font-bold bg-muted rounded border border-input shadow-xs min-w-[24px] flex justify-center"
                                                >
                                                    {key}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
