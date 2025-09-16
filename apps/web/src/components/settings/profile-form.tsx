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
        displayName: z.string().min(2, { message: t('Name must be at least 2 characters')  }),
        email: z.string().email({ message: t('Invalid email')  }),
    });

    const passwordSchema = z.object({
        currentPassword: z.string().min(6, { message: t('Current password is required')  }),
        newPassword: z.string().min(6, { message: t('New password must be at least 6 characters')  }),
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
                title: t('Success') ,
                description: t('Your profile has been updated') ,
            });
            trackEvent("profile_updated");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t('Error updating profile') ,
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
                    <CardTitle>{t('Profile information') }</CardTitle>
                    <CardDescription>{t('Update your personal details') }</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <FormInput
                                name="displayName"
                                label={t('Display name') }
                                required
                            />

                            <FormInput
                                name="email"
                                label={t('Email') }
                                type="email"
                                disabled
                                description={t('Your email address cannot be changed') }
                            />

                            <FormSubmitButton
                                disabled={!isProfileDirty || !isProfileValid}
                                loading={isProfileSubmitting}
                                loadingText={t('Saving') }
                            >
                                {t('Save changes') }
                            </FormSubmitButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('Change password') }</CardTitle>
                    <CardDescription>{t('Choose a new strong password') }</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                            <FormPasswordInput
                                name="currentPassword"
                                label={t('Current password') }
                                required
                            />

                            <FormPasswordInput
                                name="newPassword"
                                label={t('New password') }
                                required
                            />

                            <FormSubmitButton
                                disabled={!isPasswordDirty || !isPasswordValid}
                                loading={isPasswordSubmitting}
                                loadingText={t('Updating') }
                            >
                                {t('Change password') }
                            </FormSubmitButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
