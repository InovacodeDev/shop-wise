import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import {
    Form,
    FormInput,
    FormPasswordInput,
    FormSubmitButton
} from "@/components/ui/md3-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/hooks/useI18n';
import { trackEvent } from "@/services/analytics-service";
import { apiService } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function ProfileForm() {
    const { user, reloadUser } = useAuth();
    const { toast } = useToast();
    const { t } = useI18n();

    const profileSchema = z.object({
        displayName: z.string().min(2, { message: t('nameMustBeAtLeast2Characters')}),
        email: z.string().email({ message: t('invalidEmail')}),
    });

    const passwordSchema = z.object({
        currentPassword: z.string().min(6, { message: t('currentPasswordIsRequired')}),
        newPassword: z.string().min(6, { message: t('newPasswordMustBeAtLeast6Characters')}),
    });

    useEffect(() => {
        if (user) {
            // user from useAuth may have a minimal type; cast to any for optional fields
            const u = user as any;
            profileForm.reset({
                displayName: u.displayName ?? "",
                email: u.email ?? "",
            });
        }
    }, [user]);

    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: "",
            email: "",
        },
        mode: "onChange",
    });

    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
        },
        mode: "onChange",
    });

    async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
        if (!user) return;
        try {
            await apiService.updateUser(user._id, {
                displayName: values.displayName,
                email: values.email,
            });

            await reloadUser();
            profileForm.reset(values); // Resets the dirty state
            toast({
                title: t('Success'),
                description: t('yourProfileHasBeenUpdated'),
            });
            trackEvent("profile_updated");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t('errorUpdatingProfile'),
                description: error.message,
            });
        }
    }

    function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
        console.log("Password change requested:", values);
        // Password change would be handled by backend API
        passwordForm.reset(); // Resets the form after submission
    }

    const {
        isDirty: isProfileDirty,
        isValid: isProfileValid,
        isSubmitting: isProfileSubmitting,
    } = profileForm.formState;
    const {
        isDirty: isPasswordDirty,
        isValid: isPasswordValid,
        isSubmitting: isPasswordSubmitting,
    } = passwordForm.formState;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>{t('profileInformation')}</CardTitle>
                    <CardDescription>{t('updateYourPersonalDetails')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <FormInput
                                name="displayName"
                                label={t('displayName')}
                                required
                            />

                            <FormInput
                                name="email"
                                label={t('email')}
                                type="email"
                                disabled
                                description={t('yourEmailAddressCannotBeChanged')}
                            />

                            <FormSubmitButton
                                disabled={!isProfileDirty || !isProfileValid}
                                loading={isProfileSubmitting}
                                loadingText={t('Saving')}
                            >
                                {t('saveChanges')}
                            </FormSubmitButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('changePassword')}</CardTitle>
                    <CardDescription>{t('chooseANewStrongPassword')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                            <FormPasswordInput
                                name="currentPassword"
                                label={t('currentPassword')}
                                required
                            />

                            <FormPasswordInput
                                name="newPassword"
                                label={t('newPassword')}
                                required
                            />

                            <FormSubmitButton
                                disabled={!isPasswordDirty || !isPasswordValid}
                                loading={isPasswordSubmitting}
                                loadingText={t('Updating')}
                            >
                                {t('changePassword')}
                            </FormSubmitButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
