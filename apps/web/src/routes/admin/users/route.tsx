import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute("/admin/users")({
    component: AdminUsersPage,
});

function AdminUsersPage() {
    const { t } = useLingui();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="w-6 h-6" />
                        {t`Manage Users`}
                    </CardTitle>
                    <CardDescription>{t`View and manage all registered users.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`The user management interface will be here.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
