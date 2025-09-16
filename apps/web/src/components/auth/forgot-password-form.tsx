import { Button, LoadingButton } from "@/components/md3/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Input } from "@/components/md3/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAsyncOperation } from "@/hooks/use-async-operation";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/hooks/useI18n';
import { apiService } from "@/services/api";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function ForgotPasswordForm() {
    const { t } = useI18n();
    const { toast } = useToast();
    const [emailSent, setEmailSent] = useState(false);
    const resetOperation = useAsyncOperation();

    const formSchema = z.object({
        email: z.string().email({ message: t('Please enter a valid email')  }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
        mode: "onChange",
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        await resetOperation.execute(async () => {
            await apiService.requestPasswordReset(values.email);
            setEmailSent(true);
            toast({
                title: t('Reset link sent') ,
                description: t('We\'ve sent a password reset link to your email address') ,
            });
        });
    }

    const { isDirty, isValid } = form.formState;

    if (emailSent) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{t('Check your email') }</CardTitle>
                    <CardDescription>{t('We\'ve sent a password reset link to your email address please check your inbox and follow the instructions') }</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            {t('Didn\'t receive the email? Check your spam folder or try again') }
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="w-full space-y-2">
                        <Button 
                            variant="outlined" 
                            className="w-full" 
                            onClick={() => setEmailSent(false)}
                        >
                            {t('Try different email') }
                        </Button>
                        <p className="text-sm text-muted-foreground w-full text-center">
                            {t('Remembered your password') }{" "}
                            <Link to="/login">
                                <Button variant="link" className="px-0 h-auto">
                                    {t('Login') }
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
                <CardTitle className="text-2xl font-headline">{t('Forgot your password') }</CardTitle>
                <CardDescription>{t('No problem enter your email and we\'ll send you a link to reset it') }</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('Email') }</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('seu@email.com') } {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <LoadingButton 
                            type="submit" 
                            className="w-full" 
                            disabled={!isDirty || !isValid}
                            loading={resetOperation.isLoading}
                        >
                            {t('Send reset link') }
                        </LoadingButton>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-muted-foreground w-full text-center">
                            {t('Remembered your password') }{" "}
                            <Link to="/login">
                                <Button variant="link" className="px-0 h-auto">
                                    {t('Login') }
                                </Button>
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
