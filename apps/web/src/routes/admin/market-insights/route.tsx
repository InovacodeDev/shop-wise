import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBasket } from "@fortawesome/free-solid-svg-icons";
import { useLingui } from '@lingui/react/macro';


export const Route = createFileRoute("/admin/market-insights")({
    component: AdminMarketInsightsPage,
});

function AdminMarketInsightsPage() {
    const { t } = useLingui();
    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <FontAwesomeIcon icon={faShoppingBasket} className="w-6 h-6" />
                        {t`Market Insights`}
                    </CardTitle>
                    <CardDescription>{t`Analyze market trends based on aggregated user data.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>{t`Market analysis tools will be available here.`}</p>
                </CardContent>
            </Card>
        </div>
    );
}
