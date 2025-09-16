import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/admin/users")({
    component: AdminUsersPage,
});

function AdminUsersPage() {
    const { t } = useI18n();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                                        <CardTitle className="text-lg font-bold">
                        {t('Manage Users') }
                    </CardTitle>
                    <CardDescription>{t('View and manage all registered users.') }</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t('The user management interface will be here.') }</p>
                </CardContent>
            </Card>
        </div>
    );
}
