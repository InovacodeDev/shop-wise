import { Button, LoadingButton } from "@/components/md3/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Input } from "@/components/md3/input";
import { Form, FormField, FormMessage, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAsyncOperation } from "@/hooks/use-async-operation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/services/analytics-service";
import { apiService } from "@/services/api";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useI18n } from '@/hooks/useI18n';
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface ResetPasswordFormProps {
    token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const { t } = useI18n();
    const { toast } = useToast();
    const router = useRouter();
    const { reloadUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [tokenValid, setTokenValid] = useState<boolean | null>(null);
    const resetOperation = useAsyncOperation();

    // Validar o token quando o componente for montado
    useEffect(() => {
        const validateToken = async () => {
            try {
                const result = await apiService.validateResetToken(token);
                setTokenValid(result.valid);
                if (result.valid && result.email) {
                    setUserEmail(result.email);
                }
            } catch (error) {
                setTokenValid(false);
                console.error("Error validating token:", error);
            }
        };
        
        validateToken();
    }, [token]);

    const formSchema = z.object({
        password: z.string().min(8, { message: t('passwordMustBeAtLeast8Characters')}),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('passwordsDoNotMatch'),
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await resetOperation.execute(async () => {
            // Reset password
            await apiService.resetPassword(token, values.password);
            
            toast({
                title: t('passwordResetSuccessful'),
                description: t('passwordChangedLoggingIn'),
            });

            // Attempt auto-login if we have the user's email
                if (userEmail) {
                try {
                    await apiService.login(userEmail, values.password);
                    trackEvent("login", { method: "password_reset" });

                    // Ensure auth context/profile is loaded before redirecting
                    try {
                        await reloadUser();
                    } catch (e) {
                        console.warn('reloadUser after password reset failed:', e);
                    }

                    // Redirect to home after successful login
                    router.navigate({ to: "/home" });
                } catch (loginError) {
                    console.error("Auto-login failed:", loginError);
                    // If auto-login fails, redirect to login page with success message
                    router.navigate({ 
                        to: "/login",
                        search: { resetSuccess: "true" }
                    });
                }
            } else {
                // If we don't have email, redirect to login page with success message
                router.navigate({ 
                    to: "/login",
                    search: { resetSuccess: "true" }
                });
            }
        });
    }

    const { isValid } = form.formState;

    // Loading state while validating token
    if (tokenValid === null) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{t('validatingResetLink')}</CardTitle>
                    <CardDescription>{t('pleaseWaitValidatingLink')}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </CardContent>
            </Card>
        );
    }

    // Invalid token state
    if (tokenValid === false) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{t('invalidResetLink')}</CardTitle>
                    <CardDescription>{t('resetLinkInvalidOrExpired')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            {t('pleaseRequestNewResetLink')}
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="w-full space-y-2">
                        <Link to="/forgot-password">
                            <Button variant="filled" className="w-full">
                                {t('requestNewResetLink')}
                            </Button>
                        </Link>
                        <p className="text-sm text-muted-foreground w-full text-center">
                            {t('rememberedYourPassword')}{" "}
                            <Link to="/login">
                                <Button variant="link" className="px-0 h-auto">
                                    {t('login')}
                                </Button>
                            </Link>
                        </p>
                    </div>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">{t('resetYourPassword')}</CardTitle>
                <CardDescription>{t('enterNewPasswordBelow')}</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('newPassword')}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input 
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field} 
                                            />
                                            <Button
                                                type="button"
                                                variant="text"
                                                size="sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={showPassword ? faEyeSlash : faEye} 
                                                    className="h-4 w-4" 
                                                />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('confirmNewPassword')}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input 
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field} 
                                            />
                                            <Button
                                                type="button"
                                                variant="text"
                                                size="sm"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={showConfirmPassword ? faEyeSlash : faEye} 
                                                    className="h-4 w-4" 
                                                />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <LoadingButton 
                            type="submit" 
                            className="w-full" 
                            disabled={!isValid}
                            loading={resetOperation.isLoading}
                        >
                            {t('resetPassword')}
                        </LoadingButton>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-muted-foreground w-full text-center">
                                                        {t('rememberedYourPassword')}{" "}
                            <Link to="/login" className="text-primary-500">
                                <Button variant="link" className="px-0 h-auto">
                                    {t('login')}
                                </Button>
                            </Link>" "
                            <Link to="/login">
                                <Button variant="link" className="px-0 h-auto">
                                    {t('login')}
                                </Button>
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}