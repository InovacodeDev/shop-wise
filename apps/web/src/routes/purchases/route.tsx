import { createFileRoute } from '@tanstack/react-router'
import { NfceScannerComponent } from "@/components/purchases/nfce-scanner-component";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/md3/card";

import { useAuth } from '@/hooks/use-auth';
import { savePurchase } from "./actions";
import type { PurchaseData } from "@/components/purchases/manual-purchase-form";
import type { ExtractProductDataOutput, Product } from "@/types/ai-flows";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/services/analytics-service";
import { useLingui } from '@lingui/react/macro';
import { SideBarLayout } from '@/components/layout/sidebar-layout';

export const Route = createFileRoute('/purchases')({
    component: ScanPage,
})

function ScanPage() {
    const { t } = useLingui();
    const { user, profile } = useAuth();
    const { toast } = useToast();

    const handleSavePurchase = async (purchaseData: ExtractProductDataOutput | PurchaseData, products: Product[], entryMethod: 'import' | 'manual' | 'nfce' = 'nfce') => {
        if (!user || !profile || !profile.familyId) {
            toast({
                variant: 'destructive',
                title: t`Error`,
                description: t`You need to be logged in to perform this action.`,
            });
            return;
        }

        const result = await savePurchase(purchaseData, products, profile.familyId, user._id, entryMethod);

        if (result.error) {
            toast({
                variant: 'destructive',
                title: t`Save Error`,
                description: result.error,
            });
        } else {
            toast({
                title: t`Success!`,
                description: t`Purchase saved successfully!`,
            });
            trackEvent('purchase_saved', {
                method: entryMethod,
                itemCount: products.length,
                totalAmount: products.reduce((acc, item) => acc + item.price, 0)
            });
        }
    };

    return (
        <SideBarLayout>
            <div className="container mx-auto pt-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">{t`Add New Purchase`}</CardTitle>
                    <CardDescription>
                        {t`Import from scan NFCe QR code, enter NFCe URL, or add manually.`}
                    </CardDescription>
                </CardHeader>
                <div className="p-6 pt-0">
                    <NfceScannerComponent onSave={(data, prods, method) => handleSavePurchase(data, prods, method || 'nfce')} />
                </div>
            </div>
        </SideBarLayout>
    );
}
