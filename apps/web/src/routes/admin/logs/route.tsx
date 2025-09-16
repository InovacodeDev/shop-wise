import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { faFileLines } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/admin/logs")({
    component: AdminLogsPage,
});

function AdminLogsPage() {
    const { t } = useI18n();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileLines} className="w-6 h-6" />
                        {t('systemLogs')}
                    </CardTitle>
                    <CardDescription>{t('viewSystemAnd')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('logsViewerWill')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
