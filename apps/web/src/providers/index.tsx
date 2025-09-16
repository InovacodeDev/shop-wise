import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

function PageViewTracker(): React.ReactNode {
    return null;
}

function AppTheme({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { profile } = useAuth();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const theme = profile?.settings?.theme;
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');

            if (theme === 'system') {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                root.classList.add(systemTheme);
                return;
            }

            if (theme) {
                root.classList.add(theme);
            }
        }
    }, [profile]);

    return <>{children}</>;
}

export default function Providers({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <PageViewTracker />
            <AppTheme>
                {children}
            </AppTheme>
            <Toaster />
        </AuthProvider>
    );
}
