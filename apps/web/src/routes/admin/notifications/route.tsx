import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/admin/notifications")({
    component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
    const { t } = useI18n();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                                        <CardTitle className="text-lg font-bold">
                        {t('Manage Notifications')}
                    </CardTitle>
                    <CardDescription>{t('Manage system notifications and alerts.')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('Notifications coming soon.')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
