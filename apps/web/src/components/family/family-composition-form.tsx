import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/md3/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/md3/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLingui } from '@lingui/react/macro';
import { apiService } from "@/services/api";


const familyCompositionSchema = z.object({
    adults: z.coerce.number().min(1, { message: "At least one adult is required." }),
    children: z.coerce.number().min(0),
    pets: z.coerce.number().min(0),
});

type FamilyCompositionData = z.infer<typeof familyCompositionSchema>;

export function FamilyCompositionForm() {
    const { profile, reloadUser } = useAuth();
    const { toast } = useToast();
    const { t } = useLingui();

    const form = useForm<FamilyCompositionData>({
        resolver: zodResolver(familyCompositionSchema),
        defaultValues: {
            adults: 2,
            children: 1,
            pets: 0,
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (profile?.family) {
            form.reset({
                adults: profile.family.adults ?? 2,
                children: profile.family.children ?? 1,
                pets: profile.family.pets ?? 0,
            });
        }
    }, [profile, form]);

    async function onSubmit(values: FamilyCompositionData) {
        if (!profile?.familyId) {
            toast({
                variant: "destructive",
                title: t`Error`,
                description: t`You need to be logged in to save preferences.`,
            });
            return;
        }
        try {
            await apiService.updateFamily(profile.familyId, { familyComposition: values });

            await reloadUser();
            form.reset(values);
            toast({
                title: t`Success!`,
                description: t`Your preferences have been saved.`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t`Save Error`,
                description: t`An unexpected error occurred while saving your preferences. Please try again later.`,
            });
        }
    }

    const { isDirty, isValid, isSubmitting } = form.formState;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t`Family Composition`}</CardTitle>
                <CardDescription>{t`Help our AI provide better suggestions by telling us about your family.`}</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="adults"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t`Adults`}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="children"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t`Children`}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="pets"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t`Pets`}</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={!isDirty || !isValid || isSubmitting}>
                            {isSubmitting ? t`Saving...` : t`Save Preferences`}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
