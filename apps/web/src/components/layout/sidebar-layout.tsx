import { SidebarProvider, Sidebar, useSidebar } from "@/components/ui/sidebar";
import { MainNav } from "@/components/layout/main-nav";
import { Header } from "@/components/layout/header";
import { useRequireAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

function SidebarLayoutContent({ children }: { children: ReactNode }) {
    const { state } = useSidebar();

    return (
        <>
            <Header />
            <Sidebar
                className={cn(
                    "fixed left-0 top-16 h-[calc(100vh-4rem)]",
                    "bg-surface-container"
                )}
            >
                <MainNav />
            </Sidebar>
            <main
                className={cn(
                    "flex-1 bg-surface-container-lowest transition-[margin-left] duration-300 ease-in-out",
                    "pt-16 h-screen overflow-hidden pr-2 pb-2",
                    state === "expanded"
                        ? "ml-0 md:ml-[var(--sidebar-width)]"
                        : "ml-0 md:ml-[var(--sidebar-width-icon)]"
                )}
            >
                <div
                    className="h-full w-full bg-surface rounded-lg p-6 overflow-y-auto scrollbar-hide"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {children}
                </div>
            </main>
        </>
    );
}

export function SideBarLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useRequireAuth();

    if (loading || !user) {
        return (
            <div className="flex flex-col h-screen">
                <header className="flex h-16 items-center justify-between border-b px-6 bg-card">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </header>
                <div className="flex flex-1">
                    <aside className="w-56 border-r p-6 bg-card">
                        <Skeleton className="h-8 w-full mb-4" />
                        <Skeleton className="h-8 w-full mb-4" />
                        <Skeleton className="h-8 w-full mb-4" />
                    </aside>
                    <main className="flex-1 p-6 bg-background">
                        <Skeleton className="h-full w-full" />
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-surface-container-lowest overflow-hidden">
            <SidebarProvider>
                <SidebarLayoutContent>
                    {children}
                </SidebarLayoutContent>
            </SidebarProvider>
        </div>
    );
}
