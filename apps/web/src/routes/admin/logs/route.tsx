import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileLines } from "@fortawesome/free-regular-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute("/admin/logs")({
    component: AdminLogsPage,
});

function AdminLogsPage() {
    const { t } = useLingui();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faFileLines} className="w-6 h-6" />
                        {t`System Logs`}
                    </CardTitle>
                    <CardDescription>{t`View system and application logs.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`The logs viewer will be here.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
