import { useRouter, useSearch, createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/md3/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Button } from "@/components/md3/button";
import { DeleteConfirmationDialog } from "@/components/settings/delete-confirmation-dialog";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faTrash, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import { faGears } from "@fortawesome/free-solid-svg-icons/faGears";
import { useLingui } from '@lingui/react/macro';
import { SideBarLayout } from '@/components/layout/sidebar-layout';
import { useAuth } from "@/hooks/use-auth";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export const Route = createFileRoute("/settings")({
    component: SettingsPage,
    validateSearch: (search: Record<string, unknown>): { tab: string } => {
        return {
            tab: (search.tab as string) || "profile",
        };
    },
});

function SettingsPage() {
    const { t } = useLingui();
    const router = useRouter();
    const { tab } = useSearch({ from: Route.id });
    const [activeTab, setActiveTab] = useState(tab);
    const { profile } = useAuth();

    useEffect(() => {
        setActiveTab(tab);
    }, [tab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.navigate({ to: "/settings", search: { tab: value } });
    };

    const handleDeleteData = async () => {
        if (!profile?._id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "User not authenticated",
            });
            return;
        }

        try {
            const result = await apiService.deleteAllUserData(profile._id);
            
            toast({
                title: "Success",
                description: result.message + (result.transferredFamilyTo ? 
                    ` Family ownership has been transferred.` : ''),
            });

            // Refresh the page or redirect to force data reload
            window.location.reload();
        } catch (error) {
            console.error("Error deleting user data:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete user data. Please try again.",
            });
        }
    };

    const handleDeleteAccount = async () => {
        if (!profile?._id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "User not authenticated",
            });
            return;
        }

        try {
            const result = await apiService.deleteUserAccountAndData(profile._id);
            
            toast({
                title: "Account Deleted",
                description: result.message + (result.transferredFamilyTo ? 
                    ` Family ownership has been transferred.` : ''),
            });

            // Clear local storage and redirect to home
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
        } catch (error) {
            console.error("Error deleting user account:", error);
            toast({
                variant: "destructive",
                title: "Error", 
                description: "Failed to delete user account. Please try again.",
            });
        }
    };

    return (
        <SideBarLayout>
            <div className="container mx-auto pt-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{t`Settings`}</CardTitle>
                    <CardDescription>{t`Manage your account, preferences and privacy settings.`}</CardDescription>
                </CardHeader>
                <div className="p-6 pt-0">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList
                            className="w-full flex [&>div]:w-full [&>div]:flex"
                            type="fixed"
                            alignment="fill"
                        >
                            <TabsTrigger value="profile" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" /> {t`Profile`}
                            </TabsTrigger>
                            <TabsTrigger value="preferences" className="flex-1 min-w-0">
                                <FontAwesomeIcon icon={faGears} className="mr-2 h-4 w-4" /> {t`Preferences`}
                            </TabsTrigger>
                            <TabsTrigger value="privacy">
                                <FontAwesomeIcon icon={faShieldHalved} className="mr-2 h-4 w-4" /> {t`Privacy and Security`}
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="profile" className="mt-6">
                            <ProfileForm />
                        </TabsContent>
                        <TabsContent value="preferences" className="mt-6">
                            <PreferencesForm />
                        </TabsContent>
                        <TabsContent value="privacy" className="mt-6 space-y-8">
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTrash} className="w-5 h-5 text-destructive" /> {" "}
                                        {t`Delete All My Data`}
                                    </CardTitle>
                                    <CardDescription>{t`Permanently delete all your purchase history and related data.`}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {t`This action is irreversible. All your shopping lists, history and insights will be permanently deleted. This cannot be undone.`}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <DeleteConfirmationDialog
                                        onConfirm={handleDeleteData}
                                        title={t`Are you absolutely sure?`}
                                        description={t`This will permanently delete all your data.`}
                                        confirmButtonText={t`Yes, delete my data`}
                                        triggerButton={
                                            <Button variant="destructive">
                                                <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" /> {" "}
                                                {t`Delete All Data`}
                                            </Button>
                                        }
                                    />
                                </CardFooter>
                            </Card>
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUserXmark} className="w-5 h-5 text-destructive" /> {" "}
                                        {t`Delete My Account`}
                                    </CardTitle>
                                    <CardDescription>{t`Permanently delete your ShopWise account.`}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{t`This action is irreversible. Your account, profile and all associated data will be permanently deleted. This cannot be undone.`}</p>
                                </CardContent>
                                <CardFooter>
                                    <DeleteConfirmationDialog
                                        onConfirm={handleDeleteAccount}
                                        title={t`Are you absolutely sure?`}
                                        description={t`This will permanently delete your account.`}
                                        confirmButtonText={t`Yes, delete my account`}
                                        triggerButton={
                                            <Button variant="destructive">
                                                <FontAwesomeIcon icon={faUserXmark} className="mr-2 h-4 w-4" /> {" "}
                                                {t`Delete Account`}
                                            </Button>
                                        }
                                    />
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </SideBarLayout>
    );
}
