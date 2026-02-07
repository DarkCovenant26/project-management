import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ShortcutsProvider } from "@/components/providers/shortcuts-provider";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ShortcutsProvider>
            <DashboardLayout>
                {children}
            </DashboardLayout>
        </ShortcutsProvider>
    );
}
