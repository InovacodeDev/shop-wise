import { useRouter, useSearch, createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/md3/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faGem, faStore, faHistory } from "@fortawesome/free-solid-svg-icons";

import { PlanForm } from "@/components/family/plan-form";
import { FamilyCompositionForm } from "@/components/family/family-composition-form";
import { MarketsForm } from "@/components/family/markets-form";
import { HistoryTab } from "@/components/family/history-tab";
import { useLingui } from '@lingui/react/macro';
import { SideBarLayout } from '@/components/layout/sidebar-layout';

export const Route = createFileRoute("/family")({
    component: FamilyPage,
    validateSearch: (search: Record<string, unknown>): { tab: string } => {
        return {
            tab: (search.tab as string) || "composition",
        };
    },
});

function FamilyPage() {
    const { t } = useLingui();
    const router = useRouter();
    const { tab } = useSearch({ from: Route.id });
    const [activeTab, setActiveTab] = useState(tab);

    useEffect(() => {
        setActiveTab(tab);
    }, [tab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.navigate({ to: "/family", search: { tab: value } });
    };

    return (
        <SideBarLayout>
            <div className="container mx-auto pt-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{t`Family Settings`}</CardTitle>
                    <CardDescription>{t`Manage your family composition, preferred stores, and your plan.`}</CardDescription>
                </CardHeader>
                <div className="p-6 pt-0">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList
                            className="w-full flex [&>div]:w-full [&>div]:flex"
                            type="fixed"
                            alignment="fill"
                        >
                            <TabsTrigger value="composition" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faUsers} className="mr-2 h-4 w-4" /> {t`Composition`}
                            </TabsTrigger>
                            <TabsTrigger value="markets" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faStore} className="mr-2 h-4 w-4" /> {t`Markets`}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faHistory} className="mr-2 h-4 w-4" /> {t`Purchase History`}
                            </TabsTrigger>
                            <TabsTrigger value="plan" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faGem} className="mr-2 h-4 w-4" /> {t`Plan`}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="composition" className="mt-6">
                            <FamilyCompositionForm />
                        </TabsContent>
                        <TabsContent value="markets" className="mt-6">
                            <MarketsForm />
                        </TabsContent>
                        <TabsContent value="history" className="mt-6">
                            <HistoryTab />
                        </TabsContent>
                        <TabsContent value="plan" className="mt-6">
                            <PlanForm />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </SideBarLayout>
    );
}
