import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/admin/settings")({
    component: AdminSettingsPage,
});

function AdminSettingsPage() {
    const { t } = useI18n();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-bold">
                        {t('Global Settings') }
                    </CardTitle>
                    <CardDescription>{t('Configure application-wide settings.') }</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('Global configuration options will be available here.') }</p>
                </CardContent>
            </Card>
        </div>
    );
}
