import { LoadingButton } from "@/components/md3/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/md3/tabs";
import { DeleteConfirmationDialog } from "@/components/settings/delete-confirmation-dialog";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { ProfileForm } from "@/components/settings/profile-form";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faShieldHalved, faTrash, faUserXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createFileRoute, useSearch } from "@tanstack/react-router";

import { SideBarLayout } from '@/components/layout/sidebar-layout';
import { useAsyncOperation } from "@/hooks/use-async-operation";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { useI18n } from '@/hooks/useI18n';
import { apiService } from "@/services/api";
import { faGears } from "@fortawesome/free-solid-svg-icons/faGears";

export const Route = createFileRoute("/settings")({
    component: SettingsPage,
    validateSearch: (search: Record<string, unknown>): { tab: string } => {
        return {
            tab: (search.tab as string) || "profile",
        };
    },
});

function SettingsPage() {
    const { t } = useI18n();
    const { tab } = useSearch({
        from: "/settings",
    });
    const { profile } = useAuth();

    // Use async operations for delete operations
    const deleteDataOperation = useAsyncOperation();
    const deleteAccountOperation = useAsyncOperation();

    const handleDeleteData = async () => {
        if (!profile?._id) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "User not authenticated",
            });
            return;
        }

        await deleteDataOperation.execute(async () => {
            const result = await apiService.deleteAllUserData(profile._id);
            
            toast({
                title: "Success",
                description: result.message + (result.transferredFamilyTo ? 
                    ` Family ownership has been transferred.` : ''),
            });

            // Refresh the page or redirect to force data reload
            window.location.reload();
        });
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

        await deleteAccountOperation.execute(async () => {
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
        });
    };

    return (
        <SideBarLayout>
            <div className="container max-w-4xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">{t('settings')}</h1>
                    <p className="text-muted-foreground mt-2">{t('manageAccountSettings')}</p>
                </div>

                <div>
                    <Tabs defaultValue={tab || "profile"} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="profile">
                                <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
                                {t('profile')}
                            </TabsTrigger>
                            <TabsTrigger value="preferences">
                                <FontAwesomeIcon icon={faGears} className="mr-2 h-4 w-4" />
                                {t('preferences')}
                            </TabsTrigger>
                            <TabsTrigger value="security">
                                <FontAwesomeIcon icon={faShieldHalved} className="mr-2 h-4 w-4" />
                                {t('security')}
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                            <ProfileForm />
                        </TabsContent>

                        <TabsContent value="preferences" className="space-y-6">
                            <PreferencesForm />
                        </TabsContent>

                        <TabsContent value="security" className="space-y-6">
                            {/* Delete All Data */}
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faTrash} className="w-5 h-5 text-destructive" />
                                        {t('deleteAllData')}
                                    </CardTitle>
                                    <CardDescription>{t('deleteShoppingDataKeepAccount')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {t('irreversibleActionWarning')}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <DeleteConfirmationDialog
                                        onConfirm={handleDeleteData}
                                        title={t('areYouAbsolutely')}
                                        description={t('permanentlyDeleteAllData')}
                                        confirmButtonText={t('yesDeleteMy1')}
                                        triggerButton={
                                            <LoadingButton 
                                                variant="destructive" 
                                                loading={deleteDataOperation.isLoading}
                                                disabled={deleteDataOperation.isLoading}
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                                                {t('deleteAllData')}
                                            </LoadingButton>
                                        }
                                    />
                                </CardFooter>
                            </Card>

                            {/* Delete Account */}
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faUserXmark} className="w-5 h-5 text-destructive" />
                                        {t('deleteMyAccount')}
                                    </CardTitle>
                                    <CardDescription>{t('permanentlyDeleteShopWiseAccount')}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {t('irreversibleAccountDeletion')}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <DeleteConfirmationDialog
                                        onConfirm={handleDeleteAccount}
                                        title={t('areYouAbsolutely')}
                                        description={t('permanentlyDeleteAccount')}
                                        confirmButtonText={t('yesDeleteMy')}
                                        triggerButton={
                                            <LoadingButton 
                                                variant="destructive" 
                                                loading={deleteAccountOperation.isLoading}
                                                disabled={deleteAccountOperation.isLoading}
                                            >
                                                <FontAwesomeIcon icon={faUserXmark} className="mr-2 h-4 w-4" />
                                                {t('deleteAccount')}
                                            </LoadingButton>
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