import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar } from "@fortawesome/free-regular-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute("/admin/reports")({
    component: AdminReportsPage,
});

function AdminReportsPage() {
    const { t } = useLingui();

    return (
        <div className="container mx-auto py-8">
            <Card variant="outlined">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faChartBar} className="w-6 h-6" />
                        {t`Usage Reports`}
                    </CardTitle>
                    <CardDescription>{t`Generate and view system usage reports.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`Reporting tools will be available here.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
