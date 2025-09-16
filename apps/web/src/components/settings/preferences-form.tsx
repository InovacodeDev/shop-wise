import { Switch } from "@/components/md3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { FormSubmitButton } from "@/components/ui/md3-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/hooks/useI18n';
import { trackEvent } from "@/services/analytics-service";
import { apiService } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../ui/separator";

const preferencesSchema = z.object({
    theme: z.enum(["system", "light", "dark"]),
    notifications: z.boolean(),
});

type PreferencesData = z.infer<typeof preferencesSchema>;

export function PreferencesForm() {
    const { user, profile, reloadUser } = useAuth();
    const { toast } = useToast();
    const { t } = useI18n();

    const form = useForm<PreferencesData>({
        resolver: zodResolver(preferencesSchema),
        defaultValues: {
            theme: "system",
            notifications: true,
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (profile?.settings) {
            form.reset({
                theme: profile.settings.theme ?? "system",
                notifications: profile.settings.notifications ?? true,
            });
        }
    }, [profile, form]);

    async function onSubmit(values: PreferencesData) {
        if (!user) {
            toast({
                variant: "destructive",
                title: t('error1'),
                description: t('youNeedToBeLoggedInToSavePreferences'),
            });
            return;
        }
        try {
            await apiService.updateUser(user._id, { settings: values });

            await reloadUser();
            form.reset(values);
            toast({
                title: t('Success'),
                description: t('yourPreferencesHaveBeenSaved'),
            });
            trackEvent("preferences_updated", values);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t('errorSaving'),
                description: t('errorSavingPreferences'),
            });
        }
    }

    const { isDirty, isValid, isSubmitting } = form.formState;

    return (
        <Card variant="elevated">
            <CardHeader>
                <CardTitle>{t('preferences')}</CardTitle>
                <CardDescription>{t('customizeAppLookAndBehavior')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-body-large font-medium mb-4 text-on-surface">{t('appearance')}</h4>
                            <div className="space-y-2">
                                <label className="text-body-small font-medium text-on-surface-variant">
                                    {t('theme')}
                                </label>
                                <Select
                                    value={form.watch("theme")}
                                    onValueChange={(value) => form.setValue("theme", value as "system" | "light" | "dark", { shouldDirty: true })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('selectTheme')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">{t('light')}</SelectItem>
                                        <SelectItem value="dark">{t('dark')}</SelectItem>
                                        <SelectItem value="system">{t('system')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-body-large font-medium mb-4 text-on-surface">{t('notifications')}</h4>
                            <div className="flex items-center justify-between p-4 rounded-lg border border-outline bg-surface-variant/30">
                                <div className="space-y-1">
                                    <label className="text-body-medium font-medium text-on-surface">
                                        {t('enablePushNotifications')}
                                    </label>
                                    <p className="text-body-small text-on-surface-variant">
                                        {t('receiveUpdatesAndSuggestions')}
                                    </p>
                                </div>
                                <Switch
                                    checked={form.watch("notifications")}
                                    onCheckedChange={(checked) => form.setValue("notifications", checked, { shouldDirty: true })}
                                />
                            </div>
                        </div>
                    </div>

                    <FormSubmitButton disabled={!isDirty || !isValid || isSubmitting}>
                        {isSubmitting ? t('saving'): t('savePreferences')}
                    </FormSubmitButton>
                </form>
            </CardContent>
        </Card>
    );
}
