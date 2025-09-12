import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/md3/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/md3/card";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faGem, faRocket, faLock } from "@fortawesome/free-solid-svg-icons";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/md3/tabs";
import { Badge } from "@/components/md3/badge";
import { differenceInDays } from "date-fns";
import { PaymentButtons } from "./payment-buttons";
import { trackEvent } from "@/services/analytics-service";
import { useLingui } from '@lingui/react/macro';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getCurrencyFromLocale } from '@/lib/localeCurrency';

const planSchema = z.object({
    plan: z.enum(["free", "premium"]).default("free"),
});

type PlanFormData = z.infer<typeof planSchema>;
export type BillingCycle = "monthly" | "annually";

export function PlanForm() {
    const { profile, reloadUser } = useAuth();
    const { toast } = useToast();
    const { t, i18n } = useLingui();
    const [isSaving, setIsSaving] = useState(false);
    const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
    const [showDowngradeModal, setShowDowngradeModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Pricing constants
    const MONTHLY_PRICE = 19.99;
    const ANNUAL_PRICE = 199.99;

    const formatCurrency = (amount: number) =>
        i18n.number(amount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) });

    // Explicit feature lists with AI gating notes
    const planFeatures = {
        free: [
            t`Create and manage shopping lists`,
            t`Manual expense tracking`,
            t`Basic spending insights`,
            t`Sync across devices`,
            t`NFCe reading (raw data extraction only)`,
        ],
        premium: [
            t`Automatic receipt scanning (PDF / image import)`,
            t`AI-enhanced NFCe parsing and product enrichment`,
            t`Advanced AI-driven insights and consumption analysis`,
            t`Price comparison across stores`,
            t`Personalized budgeting recommendations`,
            t`Exportable reports and CSV`,
            t`Priority support and higher usage limits`,
        ],
    };

    const form = useForm<PlanFormData>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            plan: "free",
        },
    });

    useEffect(() => {
        if (profile?.plan) {
            const currentPlan = profile.plan as "free" | "premium";
            form.reset({ plan: currentPlan });

            if (currentPlan === "premium" && profile.planExpirationDate) {
                const expirationDate = profile.planExpirationDate;
                const daysRemaining = differenceInDays(expirationDate, new Date());
                if (daysRemaining > 31) {
                    setBillingCycle("annually");
                } else {
                    setBillingCycle("monthly");
                }
            }
        }
    }, [profile, form]);

    const onSubmit = async (values: PlanFormData) => {
        console.log("Upgrade plan", values, "Cycle:", billingCycle);
        // This is where you would typically handle the upgrade logic
        // with a payment provider after a successful payment from PaymentButtons.
        setIsSaving(true);
        await new Promise((res) => setTimeout(res, 1500));
        setIsSaving(false);
        toast({
            title: t`Success!`,
            description: t`Plan updated successfully!`,
        });
        trackEvent("plan_changed", {
            newPlan: values.plan,
            billingCycle: billingCycle,
        });
    };

    const handlePaymentSuccess = () => {
        // Here you would call your backend to update the user's plan
        // and then call onSubmit to reflect the change visually.
        onSubmit({ plan: "premium" });
    };

    const handlePlanSelection = (planType: "free" | "premium") => {
        if (planType === "free" && currentPlanIsPremium) {
            // Show downgrade modal for premium users
            setShowDowngradeModal(true);
        } else if (planType === "premium" && !currentPlanIsPremium) {
            // Show payment modal for free users upgrading to premium
            setShowPaymentModal(true);
        } else {
            // Direct selection for same plan
            form.setValue("plan", planType);
        }
    };

    const handleConfirmDowngrade = () => {
        form.setValue("plan", "free");
        setShowDowngradeModal(false);
        // Here you would call your backend to schedule the downgrade
        toast({
            title: t`Plan downgrade scheduled`,
            description: t`Your plan will change to Free at the end of your billing period.`,
        });
    };

    const selectedPlan = form.watch("plan");
    const currentPlanIsPremium = profile?.plan === "premium";
    const showPaymentButtons = selectedPlan === "premium" && !currentPlanIsPremium;

    // Calculate expiration date for display
    const getExpirationInfo = () => {
        if (profile?.planExpirationDate) {
            const expirationDate = new Date(profile.planExpirationDate);
            return {
                date: expirationDate,
                daysRemaining: Math.max(0, differenceInDays(expirationDate, new Date()))
            };
        }
        return null;
    };

    const expirationInfo = getExpirationInfo();

    return (
        <div>
            <CardHeader>
                <CardTitle>{t`Manage your Plan`}</CardTitle>
                <CardDescription>{t`Choose the plan that best fits your needs.`}</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form className="space-y-8">
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="plan"
                            render={({ field }) => (
                                <div className="flex justify-center">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl w-full">
                                        {/* Free Card */}
                                        <div className="max-w-md mx-auto w-full">
                                            <div
                                                role="button"
                                                onClick={() => handlePlanSelection('free')}
                                                className={cn(
                                                    "cursor-pointer h-full",
                                                    selectedPlan === 'free' && 'ring-2 ring-primary rounded-xl'
                                                )}
                                            >
                                                <Card className="h-full rounded-xl border-2 hover:shadow-md transition-all duration-200">
                                                    <CardHeader className="text-center pb-4">
                                                        <div className="flex justify-center mb-3">
                                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                                <FontAwesomeIcon icon={faCheckCircle} className="w-6 h-6 text-gray-600" />
                                                            </div>
                                                        </div>
                                                        <CardTitle className="text-2xl font-bold">{t`Free`}</CardTitle>
                                                        <CardDescription className="text-sm text-muted-foreground">{t`Meet basic needs`}</CardDescription>
                                                        <div className="pt-2">
                                                            <div className="text-3xl font-bold">{formatCurrency(0)}</div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="px-6 pb-6">
                                                        <div className="space-y-3 text-sm">
                                                            {planFeatures.free.map((feature) => (
                                                                <div key={feature} className="flex items-start gap-3">
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-gray-700">{feature}</span>
                                                                </div>
                                                            ))}
                                                            <div className="flex items-start gap-3 text-muted-foreground">
                                                                <FontAwesomeIcon icon={faLock} className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                <span>{t`AI features locked`}</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>

                                        {/* Premium Card */}
                                        <div className="max-w-md mx-auto w-full">
                                            <div
                                                role="button"
                                                onClick={() => handlePlanSelection('premium')}
                                                className={cn(
                                                    "cursor-pointer h-full",
                                                    selectedPlan === 'premium' && 'ring-2 ring-primary rounded-xl'
                                                )}
                                            >
                                                <Card className="h-full rounded-xl border-2 hover:shadow-md transition-all duration-200 relative overflow-hidden">
                                                    {/* Popular badge */}
                                                    <div className="absolute top-4 right-4">
                                                        <Badge variant="default" className="bg-blue-600 text-white text-xs px-2 py-1">
                                                            POPULAR
                                                        </Badge>
                                                    </div>

                                                    <CardHeader className="text-center pb-4">
                                                        <div className="flex justify-center mb-3">
                                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <FontAwesomeIcon icon={faGem} className="w-6 h-6 text-blue-600" />
                                                            </div>
                                                        </div>
                                                        <CardTitle className="text-2xl font-bold">{t`Pro`}</CardTitle>
                                                        <CardDescription className="text-sm text-muted-foreground">
                                                            {t`Research, code, and organize`}
                                                        </CardDescription>

                                                        {/* Billing cycle selection - small and compact */}
                                                        <div className="pt-2">
                                                            <div className="inline-flex bg-gray-100 rounded-lg p-1 text-xs">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setBillingCycle('monthly');
                                                                    }}
                                                                    className={cn(
                                                                        "px-3 py-1 rounded-md font-medium transition-all",
                                                                        billingCycle === 'monthly'
                                                                            ? "bg-white text-gray-900 shadow-sm"
                                                                            : "text-gray-600 hover:text-gray-900"
                                                                    )}
                                                                >
                                                                    {t`Monthly`}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setBillingCycle('annually');
                                                                    }}
                                                                    className={cn(
                                                                        "px-3 py-1 rounded-md font-medium transition-all relative",
                                                                        billingCycle === 'annually'
                                                                            ? "bg-white text-gray-900 shadow-sm"
                                                                            : "text-gray-600 hover:text-gray-900"
                                                                    )}
                                                                >
                                                                    {t`Yearly`}
                                                                    <span className="ml-1 text-xs text-blue-600 font-bold">
                                                                        Save 17%
                                                                    </span>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="pt-2">
                                                            <div className="text-3xl font-bold">
                                                                {formatCurrency(billingCycle === 'monthly' ? MONTHLY_PRICE : ANNUAL_PRICE / 12)}
                                                                <span className="text-sm font-normal text-muted-foreground">
                                                                    /{billingCycle === 'monthly' ? t`month` : t`month billed annually`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="px-6 pb-6">
                                                        <div className="text-sm font-medium mb-3">{t`Everything in Free and:`}</div>
                                                        <div className="space-y-3 text-sm">
                                                            {planFeatures.premium.slice(0, 6).map((feature) => (
                                                                <div key={feature} className="flex items-start gap-3">
                                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-gray-700">{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        />
                    </CardContent>
                </form>
            </Form>

            {/* Payment Modal */}
            <AlertDialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t`Upgrade to Pro Plan`}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t`Complete your upgrade to access all premium features.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4">
                        {/* Billing cycle selection in modal */}
                        <div className="text-center">
                            <div className="inline-flex bg-gray-100 rounded-lg p-1 text-sm mb-4">
                                <button
                                    type="button"
                                    onClick={() => setBillingCycle('monthly')}
                                    className={cn(
                                        "px-4 py-2 rounded-md font-medium transition-all",
                                        billingCycle === 'monthly'
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    {t`Monthly`} - {formatCurrency(MONTHLY_PRICE)}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillingCycle('annually')}
                                    className={cn(
                                        "px-4 py-2 rounded-md font-medium transition-all relative",
                                        billingCycle === 'annually'
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                    )}
                                >
                                    {t`Yearly`} - {formatCurrency(ANNUAL_PRICE)}
                                    <div className="text-xs text-blue-600 font-bold">Save 17%</div>
                                </button>
                            </div>
                        </div>

                        {/* Payment form placeholder */}
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="text-center text-gray-600">
                                <FontAwesomeIcon icon={faGem} className="w-8 h-8 mb-2" />
                                <p className="text-sm mb-2">{t`Payment processing will be integrated here`}</p>
                                <p className="text-xs text-gray-500">
                                    {t`Total:`} {formatCurrency(billingCycle === 'monthly' ? MONTHLY_PRICE : ANNUAL_PRICE)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>{t`Cancel`}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                // Simulate payment success
                                setShowPaymentModal(false);
                                handlePaymentSuccess();
                            }}
                        >
                            {t`Complete Upgrade`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Downgrade Confirmation Modal */}
            <AlertDialog open={showDowngradeModal} onOpenChange={setShowDowngradeModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t`Downgrade to Free Plan?`}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {expirationInfo ? (
                                <>
                                    {t`Your Pro plan will remain active until`} {' '}
                                    <strong>{expirationInfo.date.toLocaleDateString()}</strong> {' '}
                                    ({expirationInfo.daysRemaining} {t`days remaining`}).
                                    <br /><br />
                                    {t`After that, you'll lose access to:`}
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>{t`AI-enhanced NFCe parsing`}</li>
                                        <li>{t`Advanced consumption analysis`}</li>
                                        <li>{t`Automatic receipt scanning`}</li>
                                        <li>{t`Premium features and support`}</li>
                                    </ul>
                                </>
                            ) : (
                                <>
                                    {t`You're about to downgrade to the Free plan. You'll lose access to premium features immediately.`}
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t`Keep Pro Plan`}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDowngrade}>
                            {t`Confirm Downgrade`}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
