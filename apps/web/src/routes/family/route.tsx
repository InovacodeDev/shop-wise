import { CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/md3/tabs";
import { faGem, faHistory, faStore, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { FamilyCompositionForm } from "@/components/family/family-composition-form";
import { HistoryTab } from "@/components/family/history-tab";
import { MarketsForm } from "@/components/family/markets-form";
import { PlanForm } from "@/components/family/plan-form";
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import { useI18n } from '@/hooks/useI18n';

export const Route = createFileRoute("/family")({
    component: FamilyPage,
    validateSearch: (search: Record<string, unknown>): { tab: string } => {
        return {
            tab: (search.tab as string) || "composition",
        };
    },
});

function FamilyPage() {
    const { t } = useI18n();
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
                    <CardTitle className="text-2xl font-headline">{t('familySettings')}</CardTitle>
                    <CardDescription>{t('manageYourFamily')}</CardDescription>
                </CardHeader>
                <div className="p-6 pt-0">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList
                            className="w-full flex [&>div]:w-full [&>div]:flex"
                            type="fixed"
                            alignment="fill"
                        >
                            <TabsTrigger value="composition" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faUsers} className="mr-2 h-4 w-4" /> {t('composition')}
                            </TabsTrigger>
                            <TabsTrigger value="markets" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faStore} className="mr-2 h-4 w-4" /> {t('markets')}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faHistory} className="mr-2 h-4 w-4" /> {t('purchaseHistory')}
                            </TabsTrigger>
                            <TabsTrigger value="plan" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faGem} className="mr-2 h-4 w-4" /> {t('plan')}
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
