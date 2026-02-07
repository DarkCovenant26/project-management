'use client';

import { Sidebar } from './sidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { QuickCaptureDialog } from '@/components/quick-capture/quick-capture-dialog';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isCollapsed, toggle } = useSidebar();

    return (
        <div className="flex h-screen bg-background text-foreground relative">
            <Sidebar isCollapsed={isCollapsed} />

            {/* Sidebar Toggle Button - Clean & Sharp */}
            <Button
                variant="outline"
                size="icon"
                className={cn(
                    "fixed top-8 z-[60] h-5 w-5 rounded-full border bg-background shadow-xs hover:bg-accent transition-all duration-300 flex items-center justify-center",
                    isCollapsed ? "left-[54px]" : "left-[246px]"
                )}
                onClick={toggle}
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>

            <main className={cn(
                "flex-1 overflow-y-auto transition-all duration-300",
                isCollapsed ? "pl-16" : "pl-64"
            )}>
                <div className="w-full min-h-full p-4 md:p-6 lg:p-6 mt-2">
                    {children}
                </div>
            </main>
            <QuickCaptureDialog />
        </div>
    );
}
