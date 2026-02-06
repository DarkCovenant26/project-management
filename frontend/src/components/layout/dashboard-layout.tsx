'use client';

import { Sidebar } from './sidebar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pl-64 transition-all">
                <div className="container mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
