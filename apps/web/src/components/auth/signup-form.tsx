import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/md3/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/md3/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Separator } from "../ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { apiService } from "@/services/api";

import { trackEvent } from "@/services/analytics-service";
import { Link, useRouter } from "@tanstack/react-router";
import { useLingui } from '@lingui/react/macro';

export function SignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLingui();
    const [showPassword, setShowPassword] = useState(false);

    const formSchema = z.object({
        name: z.string().min(2, { message: t`Please enter at least two caracters.` }),
        email: z.string().email({ message: t`Please enter a valid email.` }),
        password: z.string().min(6, { message: t`Password must have at least 6 characters.` }),
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
        try {
            const resp = await apiService.signUp({ email: values.email, password: values.password, displayName: values.name });
            if (resp?.token) {
                apiService.setBackendAuthToken(resp.token);
                if ((resp as any).refresh) apiService.setBackendRefreshToken((resp as any).refresh);
            }
            trackEvent("sign_up", { method: "email" });
            router.navigate({ to: "/home" });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t`Error Creating Account`,
                description: error.message,
            });
        }
    }

    const { isValid, isSubmitting } = form.formState;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">{t`Create Your Account`}</CardTitle>
                <CardDescription>{t`Join thousands of families who are transforming their financial lives.`}</CardDescription>
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
                                        <FormLabel>{t`Name`}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t`Your Name`} {...field} />
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
                                        <FormLabel>{t`Email`}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t`seu@email.com`} {...field} />
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
                                        <FormLabel>{t`Password`}</FormLabel>
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
                                                    {showPassword ? t`Hide password` : t`Show password`}
                                                </span>
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
                            {t`Create Account`}
                        </Button>
                        <div className="relative">
                            <Separator />
                            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
                                {t`OR`}
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-muted-foreground">
                            {t`Already have an account?`}{" "}
                            <Link to="/login">
                                <Button variant="link" className="px-0 h-auto">
                                    {t`Login`}
                                </Button>
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
