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
                title: t('Error') ,
                description: t('You need to be logged in to save preferences') ,
            });
            return;
        }
        try {
            await apiService.updateUser(user._id, { settings: values });

            await reloadUser();
            form.reset(values);
            toast({
                title: t('Success') ,
                description: t('Your preferences have been saved') ,
            });
            trackEvent("preferences_updated", values);
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t('Error saving') ,
                description: t('An error occurred while saving your preferences. Please try again') ,
            });
        }
    }

    const { isDirty, isValid, isSubmitting } = form.formState;

    return (
        <Card variant="elevated">
            <CardHeader>
                <CardTitle>{t('Preferences') }</CardTitle>
                <CardDescription>{t('Customize the look and behavior of the app') }</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-body-large font-medium mb-4 text-on-surface">{t('Appearance') }</h4>
                            <div className="space-y-2">
                                <label className="text-body-small font-medium text-on-surface-variant">
                                    {t('Theme') }
                                </label>
                                <Select
                                    value={form.watch("theme")}
                                    onValueChange={(value) => form.setValue("theme", value as "system" | "light" | "dark", { shouldDirty: true })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('Select a theme') } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">{t('Light') }</SelectItem>
                                        <SelectItem value="dark">{t('Dark') }</SelectItem>
                                        <SelectItem value="system">{t('System') }</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-body-large font-medium mb-4 text-on-surface">{t('Notifications') }</h4>
                            <div className="flex items-center justify-between p-4 rounded-lg border border-outline bg-surface-variant/30">
                                <div className="space-y-1">
                                    <label className="text-body-medium font-medium text-on-surface">
                                        {t('Enable push notifications') }
                                    </label>
                                    <p className="text-body-small text-on-surface-variant">
                                        {t('Receive updates and suggestions') }
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
                        {isSubmitting ? t('Saving')  : t('Save preferences') }
                    </FormSubmitButton>
                </form>
            </CardContent>
        </Card>
    );
}
