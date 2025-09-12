import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useLingui } from '@lingui/react/macro';

import { Button } from "@/components/md3/button";
import {
    Form,
    FormInput,
    FormPasswordInput,
    FormSubmitButton,
    FormCard
} from "@/components/ui/md3-form";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiService } from "@/services/api";
import { trackEvent } from "@/services/analytics-service";

export function LoginForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLingui();
    const { user, loading, reloadUser } = useAuth();

    const formSchema = z.object({
        email: z.string().email({ message: t`Please enter a valid email.` }),
        password: z.string().min(6, { message: t`Please enter a password with at least 6 characters.` }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onChange",
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await apiService.login(values.email, values.password);
            trackEvent("login", { method: "email" });
            router.navigate({ to: "/home" });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t`Login Error`,
                description: error.message,
            });
        }
    }

    useEffect(() => {
        if (!loading && user) {
            router.navigate({ to: "/home" });
        }
    }, [user, loading, reloadUser, router]);

    const { isValid, isSubmitting } = form.formState;

    return (
        <FormCard
            title={t`Welcome Back!`}
            description={t`Enter your credentials to access your account.`}
            variant="elevated"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput
                        name="email"
                        label={t`Email`}
                        placeholder={t`seu@email.com`}
                        type="email"
                        required
                    />

                    <div className="space-y-2">
                        <FormPasswordInput
                            name="password"
                            label={t`Password`}
                            placeholder="••••••••"
                            required
                        />
                        <div className="flex justify-end">
                            <Link to="/forgot-password">
                                <Button variant="text" size="sm" className="p-0 h-auto text-body-small">
                                    {t`Forgot password?`}
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <FormSubmitButton
                        disabled={!isValid}
                        loading={isSubmitting}
                        loadingText={t`Signing in...`}
                        className="mt-6"
                    >
                        {t`Login`}
                    </FormSubmitButton>

                    <div className="relative">
                        <Separator />
                        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-3 text-body-small text-on-surface-variant">
                            {t`or`}
                        </p>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-body-small text-on-surface-variant">
                            {t`Don't have an account?`}{" "}
                            <Link to="/signup">
                                <Button variant="text" size="sm" className="p-0 h-auto text-primary">
                                    {t`Create Account`}
                                </Button>
                            </Link>
                        </p>
                    </div>
                </form>
            </Form>
        </FormCard>
    );
}
