import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute("/admin/settings")({
    component: AdminSettingsPage,
});

function AdminSettingsPage() {
    const { t } = useLingui();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faCog} className="w-6 h-6" />
                        {t`Global Settings`}
                    </CardTitle>
                    <CardDescription>{t`Configure application-wide settings.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`Global configuration options will be available here.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
