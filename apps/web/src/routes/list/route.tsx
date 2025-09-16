import { SideBarLayout } from '@/components/layout/sidebar-layout';
import { ShoppingListComponent } from "@/components/list/shopping-list-component-new";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useI18n } from '@/hooks/useI18n';
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/list")({
    component: ListPage,
});

function ListPage() {
    const { t } = useI18n();

    return (
        <SideBarLayout>
            <div className="container mx-auto pt-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{t('Shopping List')}</CardTitle>
                    <CardDescription>{t('Manage your active shopping list, add, remove and check items.')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ShoppingListComponent />
                </CardContent>
            </div>
        </SideBarLayout>
    );
}
