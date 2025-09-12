import { useState } from 'react';
import { QrScannerComponent } from '@/components/qr-scanner';
import { ManualUrlInput } from '@/components/manual-url-input';
import { Button } from '@/components/md3/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/md3/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/md3/tabs';
import { Badge } from '@/components/md3/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/loading';
import { PdfImportComponent } from './pdf-import-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faQrcode,
    faKeyboard,
    faStore,
    faReceipt,
    faCheck,
    faExclamationTriangle,
    faArrowLeft,
    faShoppingCart,
    faBarcode,
    faHashtag,
    faTags,
    faSpinner,
    faBox,
    faCopyright,
    faPencil,
    faTrash,
    faPlusCircle,
    faTimesCircle,
    faSave,
    faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { apiService } from '@/services/api';
import { useAuth } from '@/hooks/use-auth';
import type { NfceAnalysisState, QrScanResult, NfceData, EnhancedNfceData } from '@/types/webcrawler';
import { useLingui } from '@lingui/react/macro';
import { useToast } from '@/hooks/use-toast';
import { getCurrencyFromLocale } from '@/lib/localeCurrency';
import type { ExtractProductDataOutput, Product } from '@/types/ai-flows';
import { useRouter } from '@tanstack/react-router';

interface NfceScannerComponentProps {
    onSave: (purchaseData: ExtractProductDataOutput, products: Product[], entryMethod?: 'import' | 'nfce') => Promise<void>;
}

export function NfceScannerComponent({ onSave }: NfceScannerComponentProps) {
    const { t, i18n } = useLingui();
    const { toast } = useToast();
    const { profile } = useAuth();
    const [analysisState, setAnalysisState] = useState<NfceAnalysisState>({
        step: 'scan'
    });

    const formatCurrency = (amount: number) =>
        i18n.number(amount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) });

    const handleQrScan = (result: QrScanResult) => {
        processUrl(result.data);
    };

    const handleManualUrl = (url: string) => {
        processUrl(url);
    };

    const processUrl = async (url: string) => {
        setAnalysisState(prev => ({ ...prev, step: 'loading', url }));

        try {
            // First, get raw NFCe data (available to all plans)
            const rawData = await apiService.crawlNfce({ url });

            // Only perform AI-enhanced parsing for premium plans
            let enhancedData: EnhancedNfceData | undefined = undefined;
            let isEnhanced = false;

            if (profile?.plan === 'premium') {
                try {
                    enhancedData = await apiService.crawlAndEnhanceNfce({ url });
                    isEnhanced = Boolean(enhancedData?.success);
                } catch (e) {
                    // If enhancement fails, don't block the raw result
                    console.warn('AI enhancement failed:', e);
                    enhancedData = undefined;
                    isEnhanced = false;
                }
            }

            setAnalysisState(prev => ({
                ...prev,
                step: 'results',
                data: rawData,
                enhancedData,
                isEnhanced
            }));
        } catch (error) {
            console.error('Error processing NFCe:', error);
            const errorMessage = error instanceof Error ? error.message : t`Error processing NFCe`;

            setAnalysisState(prev => ({
                ...prev,
                step: 'error',
                error: errorMessage
            }));

            toast({
                variant: 'destructive',
                title: t`Error processing NFCe`,
                description: errorMessage,
            });
        }
    };

    const resetScan = () => {
        setAnalysisState({ step: 'scan' });
    };

    const handleSaveData = async () => {
        if (!analysisState.data) return;

        const { data } = analysisState;

        // Convert NFCe data to the format expected by the save function
        const purchaseData: ExtractProductDataOutput = {
            storeName: data.storeName,
            date: data.date,
            accessKey: data.accessKey || '',
            address: data.address,
            cnpj: data.cnpj,
            products: data.products.map(product => ({
                name: product.name,
                quantity: product.quantity,
                price: product.price,
                barcode: product.barcode,
                volume: product.volume,
                unitPrice: product.unitPrice,
                brand: product.brand,
                category: product.category,
                subcategory: product.subcategory,
            }))
        };

        const products: Product[] = data.products.map(product => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
            barcode: product.barcode,
            volume: product.volume,
            unitPrice: product.unitPrice,
            brand: product.brand,
            category: product.category,
            subcategory: product.subcategory,
        }));

        await onSave(purchaseData, products, 'nfce');
        resetScan();
    };



    const renderLoadingStep = () => (
        <Loading
            text={t`Analyzing NFCe...`}
            description={t`We are extracting information from your fiscal receipt. This may take a few seconds.`}
            layout="vertical"
            size="lg"
        />
    );

    const renderErrorStep = () => (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-semibold text-red-600">{t`Error processing NFCe`}</h3>
            <p className="text-muted-foreground text-center max-w-md">
                {analysisState.error || t`Could not process the NFCe. Please check if the URL is correct and try again.`}
            </p>
            <Button onClick={resetScan} variant="outlined">
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                {t`Try Again`}
            </Button>
        </div>
    );

    const renderResultsStep = () => {
        if (!analysisState.data) return null;

        const { data } = analysisState;
        const isPremium = profile?.plan === 'premium';
        const router = useRouter();

        return (
            <div className="space-y-6">
                {/* Header with Store and Date */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faStore} className="w-5 h-5 text-primary" />
                        <div>
                            <span className="font-medium text-gray-600">{t`Store:`}</span>
                            <span className="ml-2 font-semibold">{data.storeName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-primary" />
                        <div>
                            <span className="font-medium text-gray-600">{t`Date:`}</span>
                            <span className="ml-2 font-semibold">{new Date(data.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="w-auto text-left font-semibold">
                                    <FontAwesomeIcon icon={faBox} className="w-4 h-4 mr-2" />
                                    {t`Product`}
                                </TableHead>
                                <TableHead className="text-center font-semibold">
                                    <FontAwesomeIcon icon={faCopyright} className="w-4 h-4 mr-2" />
                                    {t`Brand`}
                                </TableHead>
                                <TableHead className="text-center font-semibold">
                                    <FontAwesomeIcon icon={faTags} className="w-4 h-4 mr-2" />
                                    {t`Category`}
                                </TableHead>
                                <TableHead className="w-[100px] text-center font-semibold">
                                    <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 mr-2" />
                                    {t`Quantity`}
                                </TableHead>
                                <TableHead className="w-[140px] text-center font-semibold">
                                    {t`Unit Price`}<br />
                                    <span className="text-xs text-muted-foreground">(R$)</span>
                                </TableHead>
                                <TableHead className="w-[140px] text-center font-semibold">
                                    {t`Total Price`}<br />
                                    <span className="text-xs text-muted-foreground">(R$)</span>
                                </TableHead>
                                <TableHead className="w-[100px] text-center font-semibold">
                                    {t`Actions`}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.products.map((product, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                    <TableCell className="py-3">
                                        <div className="font-medium">{product.name}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-medium">{product.brand || 'Natural'}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="space-y-1 space-x-1">
                                            {product.category && (
                                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                                    {product.category}
                                                </Badge>
                                            )}
                                            {product.subcategory && (
                                                <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-300">
                                                    {product.subcategory}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="font-medium">{product.quantity}</span>
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {(product.unitPrice || product.price / product.quantity).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center font-medium">
                                        {product.price.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <FontAwesomeIcon icon={faPencil} className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-800">
                                                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Add Item Manually Button */}
                    <div className="p-4 border-t">
                        <Button variant="outlined" className="w-fit">
                            <FontAwesomeIcon icon={faPlusCircle} className="w-4 h-4 mr-2" />
                            {t`Add Item Manually`}
                        </Button>
                    </div>

                    {/* Total */}
                    <div className="p-4 bg-gray-50 border-t">
                        <div className="flex justify-end">
                            <div className="text-right">
                                <span className="text-xl font-bold">{t`Total: ${formatCurrency(data.totalAmount)}`}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-4">
                    {!isPremium && (
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-yellow-700" />
                            </div>
                            <div className="text-sm">
                                <div className="font-medium">{t`Enhanced parsing available in Premium`}</div>
                                <div className="text-muted-foreground">{t`Upgrade to Premium to get AI-enriched product names, categories, and automatic corrections.`}</div>
                            </div>
                        </div>
                    )}
                    <Button variant="destructive" onClick={resetScan} className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                        {t`Cancel and Start New Import`}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSaveData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                            <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                            {t`Confirm and Save Purchase`}
                        </Button>
                        {!isPremium && (
                            <Button variant="outlined" onClick={() => router.navigate({ to: '/family', search: { tab: 'plan' } })}>
                                {t`Upgrade to Premium`}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Tabs defaultValue="url-manual" className="w-full">
            <TabsList
                className="w-full flex [&>div]:w-full [&>div]:flex"
                type="fixed"
                alignment="fill"
            >
                <TabsTrigger value="url-manual" className='flex-1 min-w-0'>
                    <FontAwesomeIcon icon={faKeyboard} className="mr-2 h-4 w-4" />
                    {t`URL Manual`}
                </TabsTrigger>
                <TabsTrigger value="qr-code" className='flex-1 min-w-0'>
                    <FontAwesomeIcon icon={faQrcode} className="mr-2 h-4 w-4" />
                    {t`QR Code`}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="qr-code" className="mt-6">
                {analysisState.step === 'scan' ? (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">{t`Scanner QR Code`}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t`Position the NFCe QR code in front of the camera`}
                            </p>
                        </div>
                        <QrScannerComponent
                            onScan={handleQrScan}
                            onError={(error) => {
                                console.error('QR Scanner error:', error);
                                toast({
                                    variant: 'destructive',
                                    title: t`Scanner error`,
                                    description: error.message,
                                });
                            }}
                            preferredCamera="environment"
                        />
                    </div>
                ) : analysisState.step === 'loading' ? (
                    renderLoadingStep()
                ) : analysisState.step === 'error' ? (
                    renderErrorStep()
                ) : analysisState.step === 'results' ? (
                    renderResultsStep()
                ) : null}
            </TabsContent>
            <TabsContent value="url-manual" className="mt-6">
                {analysisState.step === 'scan' ? (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">{t`Inserir URL Manualmente`}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t`Paste the NFCe URL obtained through a QR code reader`}
                            </p>
                        </div>
                        <ManualUrlInput onSubmit={handleManualUrl} />
                    </div>
                ) : analysisState.step === 'loading' ? (
                    renderLoadingStep()
                ) : analysisState.step === 'error' ? (
                    renderErrorStep()
                ) : analysisState.step === 'results' ? (
                    renderResultsStep()
                ) : null}
            </TabsContent>
        </Tabs>
    );
}
