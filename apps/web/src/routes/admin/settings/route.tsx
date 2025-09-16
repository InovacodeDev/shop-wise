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
                        {t('globalSettings')}
                    </CardTitle>
                    <CardDescription>{t('configureApplicationWide')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('globalConfigurationOptions')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
