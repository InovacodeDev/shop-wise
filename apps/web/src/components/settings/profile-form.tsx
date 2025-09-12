import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/md3/button";
import {
    Form,
    FormInput,
    FormPasswordInput,
    FormSubmitButton
} from "@/components/ui/md3-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/services/analytics-service";
import { useLingui } from '@lingui/react/macro';
import { apiService } from "@/services/api";

export function ProfileForm() {
    const { user, reloadUser } = useAuth();
    const { toast } = useToast();
    const { t } = useLingui();

    const profileSchema = z.object({
        displayName: z.string().min(2, { message: t`O nome deve ter pelo menos 2 caracteres.` }),
        email: z.string().email({ message: t`Email inválido.` }),
    });

    const passwordSchema = z.object({
        currentPassword: z.string().min(6, { message: t`Senha atual é obrigatória.` }),
        newPassword: z.string().min(6, { message: t`A nova senha deve ter pelo menos 6 caracteres.` }),
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
                title: t`Success!`,
                description: t`Your profile has been updated.`,
            });
            trackEvent("profile_updated");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t`Error updating profile.`,
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
                    <CardTitle>{t`Profile Information`}</CardTitle>
                    <CardDescription>{t`Update your personal details.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                            <FormInput
                                name="displayName"
                                label={t`Display Name`}
                                required
                            />

                            <FormInput
                                name="email"
                                label={t`Email`}
                                type="email"
                                disabled
                                description={t`Your email address cannot be changed.`}
                            />

                            <FormSubmitButton
                                disabled={!isProfileDirty || !isProfileValid}
                                loading={isProfileSubmitting}
                                loadingText={t`Saving...`}
                            >
                                {t`Save Changes`}
                            </FormSubmitButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t`Change Password`}</CardTitle>
                    <CardDescription>{t`Choose a new strong password.`}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                            <FormPasswordInput
                                name="currentPassword"
                                label={t`Current Password`}
                                required
                            />

                            <FormPasswordInput
                                name="newPassword"
                                label={t`New Password`}
                                required
                            />

                            <FormSubmitButton
                                disabled={!isPasswordDirty || !isPasswordValid}
                                loading={isPasswordSubmitting}
                                loadingText={t`Updating...`}
                            >
                                {t`Change Password`}
                            </FormSubmitButton>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
