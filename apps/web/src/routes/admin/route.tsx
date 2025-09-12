import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute("/admin")({
    component: AdminPage,
});

function AdminPage() {
    const { t } = useLingui();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faShieldHalved} className="w-6 h-6" />
                        {t`Admin Dashboard`}
                    </CardTitle>
                    <CardDescription>{t`System overview.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`Welcome to the admin dashboard. Here you can manage users, view reports, and configure the system.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
