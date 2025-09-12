import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShield } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute("/admin/security")({
    component: AdminSecurityPage,
});

function AdminSecurityPage() {
    const { t } = useLingui();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faShield} className="w-6 h-6" />
                        {t`Security`}
                    </CardTitle>
                    <CardDescription>{t`Manage security settings and protocols.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`Security configuration will be here.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
