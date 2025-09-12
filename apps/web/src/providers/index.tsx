import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect, useState, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { messages as ptMessages } from "../locales/pt/messages";
import { messages as enMessages } from "../locales/en/messages";

i18n.load({
    en: enMessages,
    pt: ptMessages,
});
// Activate an initial locale based on the browser language (prefer pt) or default to English.
const getInitialLocale = () => {
    if (typeof window !== "undefined") {
        const nav = (navigator && (navigator.language || (navigator as any).userLanguage)) || "en";
        if (typeof nav === "string" && nav.toLowerCase().startsWith("pt")) return "pt";
    }
    return "en";
};

i18n.activate(getInitialLocale());

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
        <I18nProvider i18n={i18n}>
            <AuthProvider>
                <PageViewTracker />
                <AppTheme>
                    {children}
                </AppTheme>
                <Toaster />
            </AuthProvider>
        </I18nProvider>
    )
}
