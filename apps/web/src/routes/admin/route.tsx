import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/admin")({
    component: AdminPage,
});

function AdminPage() {
    const { t } = useI18n();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">
                        {t('Admin Dashboard') }
                    </CardTitle>
                    <CardDescription>{t('System overview and management.') }</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('Welcome to the admin dashboard. Here you can manage users, view reports, and configure the system.') }</p>
                </CardContent>
            </Card>
        </div>
    );
}
