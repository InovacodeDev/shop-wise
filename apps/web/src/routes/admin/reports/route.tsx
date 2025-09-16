import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/admin/reports")({
    component: AdminReportsPage,
});

function AdminReportsPage() {
    const { t } = useI18n();

    return (
        <div className="container mx-auto py-8">
            <Card variant="outlined">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">
                        {t('Usage Reports') }
                    </CardTitle>
                    <CardDescription>{t('Generate and view system usage reports.') }</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('Reporting tools will be available here.') }</p>
                </CardContent>
            </Card>
        </div>
    );
}
