import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicroscope } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute('/admin/audit')({
    component: AdminAuditPage,
})

function AdminAuditPage() {
    const { t } = useLingui();

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faMicroscope} className="w-6 h-6" />
                        {t`Audit & Testing`}
                    </CardTitle>
                    <CardDescription>{t`Run audits and tests on the system.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`Audit and testing tools will be available here.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
