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
        email: z.string().email({ message: t('pleaseEnterValidEmail')}),
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
                title: t('resetLinkSent'),
                description: t('passwordResetEmailSent'),
            });
        });
    }

    const { isDirty, isValid } = form.formState;

    if (emailSent) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{t('checkYourEmail')}</CardTitle>
                    <CardDescription>{t('passwordResetEmailInstructions')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            {t('emailNotReceivedHelp')}
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
                            {t('tryDifferentEmail')}
                        </Button>
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
                <CardTitle className="text-2xl font-headline">{t('forgotYourPassword')}</CardTitle>
                <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
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
                        <LoadingButton 
                            type="submit" 
                            className="w-full" 
                            disabled={!isDirty || !isValid}
                            loading={resetOperation.isLoading}
                        >
                            {t('sendResetLink')}
                        </LoadingButton>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-muted-foreground w-full text-center">
                            {t('rememberedYourPassword')}{" "}
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
