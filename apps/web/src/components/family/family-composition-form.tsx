import { Button } from "@/components/md3/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { Input } from "@/components/md3/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from '@/hooks/useI18n';
import { apiService } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";


const familyCompositionSchema = z.object({
    adults: z.coerce.number().min(1, { message: "At least one adult is required." }),
    children: z.coerce.number().min(0),
    pets: z.coerce.number().min(0),
});

type FamilyCompositionData = z.infer<typeof familyCompositionSchema>;

export function FamilyCompositionForm() {
    const { profile, reloadUser } = useAuth();
    const { toast } = useToast();
    const { t } = useI18n();

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
                title: t('error1'),
                description: t('youNeedToBeLoggedInToSavePreferences'),
            });
            return;
        }
        try {
            await apiService.updateFamily(profile.familyId, { familyComposition: values });

            await reloadUser();
            form.reset(values);
            toast({
                title: t('Success'),
                description: t('yourPreferencesHaveBeenSaved'),
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: t('error8'),
                description: t('unexpectedErrorSavingPreferences'),
            });
        }
    }

    const { isDirty, isValid, isSubmitting } = form.formState;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('familyComposition')}</CardTitle>
                <CardDescription>{t('helpAiWithFamilyInfo')}</CardDescription>
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
                                        <FormLabel>{t('adults')}</FormLabel>
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
                                        <FormLabel>{t('children')}</FormLabel>
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
                                        <FormLabel>{t('pets')}</FormLabel>
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
                            {isSubmitting ? t('saving'): t('savePreferences')}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
