import { useState } from 'react';
import { ManualUrlInput } from '@/components/manual-url-input';
import { Button } from '@/components/md3/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/md3/card';
import { Badge } from '@/components/md3/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading } from '@/components/ui/loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStore,
    faReceipt,
    faCheck,
    faExclamationTriangle,
    faArrowLeft,
    faShoppingCart,
    faBarcode,
    faHashtag,
    faTags,
    faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { apiService } from '@/services/api';
import type { NfceAnalysisState, NfceData, EnhancedNfceData } from '@/types/webcrawler';
import { useLingui } from '@lingui/react/macro';
import { useToast } from '@/hooks/use-toast';
import { getCurrencyFromLocale } from '@/lib/localeCurrency';
import type { ExtractProductDataOutput, Product } from '@/types/ai-flows';

interface NfceUrlComponentProps {
    onSave: (purchaseData: ExtractProductDataOutput, products: Product[]) => Promise<void>;
}

export function NfceUrlComponent({ onSave }: NfceUrlComponentProps) {
    const { t, i18n } = useLingui();
    const { toast } = useToast();
    const [analysisState, setAnalysisState] = useState<NfceAnalysisState>({
        step: 'scan'
    });

    const formatCurrency = (amount: number) =>
        i18n.number(amount, { style: 'currency', currency: getCurrencyFromLocale(i18n.locale) });

    const handleManualUrl = (url: string) => {
        processUrl(url);
    };

    const processUrl = async (url: string) => {
        setAnalysisState(prev => ({ ...prev, step: 'loading', url }));

        try {
            // First, get raw NFCe data
            const rawData = await apiService.crawlNfce({ url });

            // Then, get enhanced data with AI processing
            const enhancedData = await apiService.crawlAndEnhanceNfce({ url });

            setAnalysisState(prev => ({
                ...prev,
                step: 'results',
                data: rawData,
                enhancedData,
                isEnhanced: enhancedData.success
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

        await onSave(purchaseData, products);
        resetScan();
    };

    const renderScanStep = () => (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">{t`NFCe via URL`}</h3>
                <p className="text-sm text-muted-foreground">
                    {t`Paste the NFCe URL to automatically extract the data.`}
                </p>
            </div>
            <ManualUrlInput onSubmit={handleManualUrl} />
        </div>
    );

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

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">{t`NFCe Analysis Result`}</h3>
                        <p className="text-sm text-muted-foreground">{t`Data extracted from fiscal receipt`}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={resetScan} variant="outlined">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                            {t`New Analysis`}
                        </Button>
                        <Button onClick={handleSaveData}>
                            {t`Save Purchase`}
                        </Button>
                    </div>
                </div>

                {analysisState.isEnhanced && (
                    <Alert className="border-green-200 bg-green-50">
                        <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            <span className="font-medium">{t`NFCe processed with AI:`}</span> {t`Data was automatically enriched.`}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Store Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-blue-600" />
                                {t`Store`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <h4 className="font-semibold">{data.storeName}</h4>
                                <p className="text-sm text-muted-foreground">CNPJ: {data.cnpj}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Purchase Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FontAwesomeIcon icon={faReceipt} className="w-4 h-4 text-green-600" />
                                {t`Purchase`}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">{t`Date`}</p>
                                    <p className="font-medium">{data.date}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">{t`Total`}</p>
                                    <p className="font-semibold text-green-600">
                                        {formatCurrency(data.totalAmount)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Products Table - Compact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4 text-purple-600" />
                            {t`Products`} ({data.products.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead>{t`Product`}</TableHead>
                                        <TableHead className="text-center w-20">{t`Qty`}</TableHead>
                                        <TableHead className="text-right w-24">{t`Total`}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.products.map((product, index) => (
                                        <TableRow key={index} className="hover:bg-muted/30">
                                            <TableCell className="py-2">
                                                <div className="space-y-1">
                                                    <h5 className="font-medium leading-none text-sm">{product.name}</h5>
                                                    {product.category && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {product.category}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-medium">{product.quantity}</span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-semibold">
                                                    {formatCurrency(product.price)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Summary */}
                        <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">{t`Total:`}</span>
                                <span className="text-lg font-bold text-green-600">
                                    {formatCurrency(data.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {analysisState.step === 'scan' && renderScanStep()}
            {analysisState.step === 'loading' && renderLoadingStep()}
            {analysisState.step === 'error' && renderErrorStep()}
            {analysisState.step === 'results' && renderResultsStep()}
        </div>
    );
}
