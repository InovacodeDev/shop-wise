import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/admin/audit')({
    component: AdminAuditPage,
})

function AdminAuditPage() {
    const { t } = useI18n();

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                                        <CardTitle className="text-lg font-bold">
                        {t('Audit Testing') }
                    </CardTitle>
                    <CardDescription>{t('Run audits and tests on the system.') }</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('Audit and testing tools will be available here.') }</p>
                </CardContent>
            </Card>
        </div>
    );
}
