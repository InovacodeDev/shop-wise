import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { faShield } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/admin/security")({
    component: AdminSecurityPage,
});

function AdminSecurityPage() {
    const { t } = useI18n();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faShield} className="w-6 h-6" />
                        {t('security')}
                    </CardTitle>
                    <CardDescription>{t('manageSecuritySettings')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('securityConfigurationWill')}</p>
                </CardContent>
            </Card>
        </div>
    );
}
