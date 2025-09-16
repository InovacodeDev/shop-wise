import { Button, LoadingButton } from "@/components/md3/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Input } from "@/components/md3/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAsyncOperation } from "@/hooks/use-async-operation";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../ui/separator";

import { useI18n } from '@/hooks/useI18n';
import { trackEvent } from "@/services/analytics-service";
import { Link, useRouter } from "@tanstack/react-router";

export function SignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useI18n();
    const [showPassword, setShowPassword] = useState(false);
    
    // Add async operation for signup
    const signupOperation = useAsyncOperation();

    const formSchema = z.object({
        name: z.string().min(2, { message: t('pleaseEnterAtLeastTwoCharacters')}),
        email: z.string().email({ message: t('pleaseEnterValidEmail')}),
        password: z.string().min(6, { message: t('passwordMustHaveAtLeast6Characters')}),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        mode: "onChange",
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await signupOperation.execute(async () => {
            const resp = await apiService.signUp({ email: values.email, password: values.password, displayName: values.name });
            // If backend did not return auth tokens on signup, perform sign-in to auto-login
            if (!resp?.token) {
                try {
                    await apiService.signIn({ email: values.email, password: values.password });
                } catch (e) {
                    // ignore sign-in failure here; user can still login manually
                }
            }
            trackEvent("sign_up", { method: "email" });
            router.navigate({ to: "/home" });
        });
    }

    const { isValid, isSubmitting } = form.formState;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">{t('createYourAccount')}</CardTitle>
                <CardDescription>{t('joinThousandsOfFamilies')}</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('name')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('yourName')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('email')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('seuEmailCom')} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('password')}</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <FontAwesomeIcon
                                                        icon={faEyeSlash}
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <FontAwesomeIcon
                                                        icon={faEye}
                                                        className="h-4 w-4"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                <span className="sr-only">
                                                    {showPassword ? t('hidePassword'): t('showPassword')}
                                                </span>
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <LoadingButton 
                            type="submit" 
                            className="w-full" 
                            disabled={!isValid || signupOperation.isLoading}
                            loading={signupOperation.isLoading}
                            loadingText={t('creatingAccount')}
                        >
                            {t('createAccount')}
                        </LoadingButton>
                        <div className="relative">
                            <Separator />
                            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                                {t('or')}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-muted-foreground">
                            {t('alreadyHaveAnAccount')}{" "}
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
