import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ShortcutsProvider } from "@/components/providers/shortcuts-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ShortcutsProvider>
            <DashboardLayout>
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </DashboardLayout>
        </ShortcutsProvider>
    );
}
