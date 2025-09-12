import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/md3/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/md3/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";

import { Link } from "@tanstack/react-router";
import { useLingui } from '@lingui/react/macro';

export function ForgotPasswordForm() {
    const { t } = useLingui();

    const formSchema = z.object({
        email: z.string().email({ message: t`Please enter a valid email.` }),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
        mode: "onChange",
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        // Here you would handle the password reset logic
    }

    const { isDirty, isValid, isSubmitting } = form.formState;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline">{t`Forgot Your Password?`}</CardTitle>
                <CardDescription>{t`No problem. Enter your email and we'll send you a link to reset it.`}</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
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
                        <Button type="submit" className="w-full" disabled={!isDirty || !isValid || isSubmitting}>
                            {t`Send Reset Link`}
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <p className="text-sm text-muted-foreground w-full text-center">
                            {t`Remembered your password?`}{" "}
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
