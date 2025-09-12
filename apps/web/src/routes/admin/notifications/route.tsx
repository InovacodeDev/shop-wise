import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-regular-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute("/admin/notifications")({
    component: AdminNotificationsPage,
});

function AdminNotificationsPage() {
    const { t } = useLingui();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faMessage} className="w-6 h-6" />
                        {t`Manage Notifications`}
                    </CardTitle>
                    <CardDescription>{t`Send and manage global notifications.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`Notification management tools will be available here.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
