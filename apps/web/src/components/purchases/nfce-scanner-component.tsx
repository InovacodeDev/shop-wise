import { ManualUrlInput } from '@/components/manual-url-input';
import { Badge } from '@/components/md3/badge';
import { Button } from '@/components/md3/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/md3/tabs';
import { QrScannerComponent } from '@/components/qr-scanner';
import { Loading } from '@/components/ui/loading';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/useI18n';
import { analyticsConfig } from '@/lib/analytics';
import { getCurrencyFromLocale } from '@/lib/localeCurrency';
import { apiService } from '@/services/api';
import type { ExtractFromReceiptPhotoOutput, ExtractProductDataOutput, Product } from '@/types/ai-flows';
import type { EnhancedNfceData, NfceAnalysisState, QrScanResult } from '@/types/webcrawler';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import {
    faArrowLeft,
    faBox,
    faCamera,
    faCopyright,
    faExclamationTriangle,
    faHashtag,
    faKeyboard,
    faPencil,
    faPlusCircle,
    faQrcode,
    faSave,
    faStore,
    faTags,
    faTimesCircle,
    faTrash,
    faUpload
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from '@tanstack/react-router';
import { useRef, useState } from 'react';

interface NfceScannerComponentProps {
    onSave: (purchaseData: ExtractProductDataOutput, products: Product[], entryMethod?: 'import' | 'nfce' | 'manual') => Promise<void>;
}

export function NfceScannerComponent({ onSave }: NfceScannerComponentProps) {    const { t, locale } = useI18n();
const { toast } = useToast();
    const { profile } = useAuth();
    const [analysisState, setAnalysisState] = useState<NfceAnalysisState>({
        step: 'scan'
    });
    
    // Photo capture states
    const [photoAnalysisResult, setPhotoAnalysisResult] = useState<ExtractFromReceiptPhotoOutput | null>(null);
    const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [capturedPhotos, setCapturedPhotos] = useState<Array<{ id: string; dataUri: string; result?: ExtractFromReceiptPhotoOutput }>>([]);
    const [showPhotoTips, setShowPhotoTips] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat(locale, { style: "currency", currency: getCurrencyFromLocale(locale) }).format(amount);

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
            const errorMessage = error instanceof Error ? error.message : t('errorProcessing') ;

            setAnalysisState(prev => ({
                ...prev,
                step: 'error',
                error: errorMessage
            }));

            toast({
                variant: 'destructive',
                title: t('errorProcessing'),
                description: errorMessage,
            });
        }
    };

    // Photo capture functions
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            toast({
                variant: 'destructive',
                title: t('error1'),
                description: t('onlyImageFilesAllowed'),
            });
            return;
        }

        // Check supported formats
        const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!supportedFormats.includes(file.type)) {
            toast({
                variant: 'destructive',
                title: t('error1'),
                description: t('supportedFormats'),
            });
            return;
        }

        // Check file size (max 10MB)
        const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSizeInBytes) {
            toast({
                variant: 'destructive',
                title: t('error1'),
                description: t('fileTooLarge'),
            });
            return;
        }

        await processPhotoFile(file);
    };

    const processPhotoFile = async (file: File) => {
        setIsProcessingPhoto(true);
        setPhotoAnalysisResult(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const imageDataUri = reader.result as string;
                const photoId = Date.now().toString();
                
                // Add photo to captured photos array
                setCapturedPhotos(prev => [...prev, { id: photoId, dataUri: imageDataUri }]);
                setPhotoPreview(imageDataUri);

                try {
                    const result = await apiService.extractFromReceiptPhoto({ receiptImage: imageDataUri });
                    
                    // Update the specific photo with its result
                    setCapturedPhotos(prev => prev.map(photo => 
                        photo.id === photoId ? { ...photo, result } : photo
                    ));
                    
                    setPhotoAnalysisResult(result);

                    // Check for validation warnings
                    if (result.warnings && result.warnings.length > 0) {
                        toast({
                            variant: 'default',
                            title: t('photoProcessedWithWarnings'),
                            description: result.warnings.join(', '),
                        });
                    } else {
                        toast({
                            title: t('photoProcessedSuccessfully'),
                            description: t('receiptDataExtractedFromPhoto'),
                        });
                    }
                } catch (error: any) {
                    console.error("Failed to extract data from photo:", error);
                    
                    // Remove failed photo from array
                    setCapturedPhotos(prev => prev.filter(photo => photo.id !== photoId));
                    
                    toast({
                        variant: 'destructive',
                        title: t('errorProcessingPhoto'),
                        description: error.message || t('couldNotExtractDataFromPhoto'),
                    });
                }

                setIsProcessingPhoto(false);
            };
        } catch (error: any) {
            console.error("Failed to read photo:", error);
            toast({
                variant: 'destructive',
                title: t('errorReadingPhoto'),
                description: error.message,
            });
            setIsProcessingPhoto(false);
        }
    };

    const handleAddMorePhotos = () => {
        // Allow adding more photos for long receipts
        fileInputRef.current?.click();
    };

    const handleRemovePhoto = (photoId: string) => {
        setCapturedPhotos(prev => prev.filter(photo => photo.id !== photoId));
        
        // If we removed the currently displayed result, show the most recent one
        if (capturedPhotos.length > 1) {
            const remainingPhotos = capturedPhotos.filter(photo => photo.id !== photoId);
            const latestPhoto = remainingPhotos[remainingPhotos.length - 1];
            if (latestPhoto?.result) {
                setPhotoAnalysisResult(latestPhoto.result);
                setPhotoPreview(latestPhoto.dataUri);
            }
        } else {
            setPhotoAnalysisResult(null);
            setPhotoPreview(null);
        }
    };

    const handleSavePhotoData = async () => {
        if (!photoAnalysisResult) return;

        const products: Product[] = photoAnalysisResult.products.map(product => ({
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

        await onSave(photoAnalysisResult, products, 'import');
        resetPhotoScan();

        // Track photo save event
        analyticsConfig.trackPurchase('import', {
            store_name: photoAnalysisResult.storeName,
            product_count: photoAnalysisResult.products.length,
            total_amount: photoAnalysisResult.totalAmount || photoAnalysisResult.products.reduce((sum, p) => sum + p.price, 0),
            method: 'photo_upload'
        });
    };

    const resetPhotoScan = () => {
        setPhotoAnalysisResult(null);
        setPhotoPreview(null);
        setIsProcessingPhoto(false);
        setCapturedPhotos([]);
        setShowPhotoTips(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    const triggerCameraCapture = () => cameraInputRef.current?.click();

    const resetScan = () => {
        setAnalysisState({ step: 'scan' });
        resetPhotoScan();
        analyticsConfig.trackUserAction('nfce_scan_reset');
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

        // Track NFCe save event
        analyticsConfig.trackPurchase('nfce', {
            store_name: data.storeName,
            product_count: data.products.length,
            total_amount: data.products.reduce((sum, p) => sum + p.price, 0),
            method: 'scanner'
        });
    };



    const renderLoadingStep = () => (
        <Loading
            text={t('analyzingNfce')}
            description={t('extractingInformationFromReceipt')}
            layout="vertical"
            size="lg"
        />
    );

    const renderErrorStep = () => (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <FontAwesomeIcon icon={faExclamationTriangle} className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-semibold text-red-600">{t('errorProcessing')}</h3>
            <p className="text-muted-foreground text-center max-w-md">
                {analysisState.error || t('couldNotProcessNfce')}
            </p>
            <Button onClick={resetScan} variant="outlined">
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 mr-2" />
                {t('tryAgain')}
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
                            <span className="font-medium text-gray-600">{t('store')}</span>
                            <span className="ml-2 font-semibold">{data.storeName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-primary" />
                        <div>
                            <span className="font-medium text-gray-600">{t('date')}</span>
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
                                    {t('product')}
                                </TableHead>
                                <TableHead className="text-center font-semibold">
                                    <FontAwesomeIcon icon={faCopyright} className="w-4 h-4 mr-2" />
                                    {t('brand')}
                                </TableHead>
                                <TableHead className="text-center font-semibold">
                                    <FontAwesomeIcon icon={faTags} className="w-4 h-4 mr-2" />
                                    {t('category')}
                                </TableHead>
                                <TableHead className="w-[100px] text-center font-semibold">
                                    <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 mr-2" />
                                    {t('quantity')}
                                </TableHead>
                                <TableHead className="w-[140px] text-center font-semibold">
                                    {t('unitPrice')}<br />
                                    <span className="text-xs text-muted-foreground">(R$)</span>
                                </TableHead>
                                <TableHead className="w-[140px] text-center font-semibold">
                                    {t('totalPrice')}<br />
                                    <span className="text-xs text-muted-foreground">(R$)</span>
                                </TableHead>
                                <TableHead className="w-[100px] text-center font-semibold">
                                    {t('actions')}
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
                            {t('addItemManually')}
                        </Button>
                    </div>

                    {/* Total */}
                    <div className="p-4 bg-gray-50 border-t">
                        <div className="flex justify-end">
                            <div className="text-right">
                                <span className="text-xl font-bold">
                                    {t('total')}: {new Intl.NumberFormat(locale, { style: 'currency', currency: getCurrencyFromLocale(locale) }).format(
                                        data.totalAmount || data.products.reduce((sum, p) => sum + p.price, 0)
                                    )}
                                </span>
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
                                <div className="font-medium">{t('enhancedParsingPremium')}</div>
                                <div className="text-muted-foreground">{t('upgradeForAiEnrichedData')}</div>
                            </div>
                        </div>
                    )}
                    <Button variant="destructive" onClick={resetScan} className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                        {t('cancelAndStartNewImport')}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSaveData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                            <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                            {t('confirmAndSavePurchase')}
                        </Button>
                        {!isPremium && (
                            <Button variant="outlined" onClick={() => router.navigate({ to: '/family', search: { tab: 'plan' } })}>
                                {t('upgradeToPremium')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderPhotoResults = () => {
        if (!photoAnalysisResult) return null;

        const data = photoAnalysisResult;
        const isPremium = profile?.plan === 'premium';
        const router = useRouter();
        
        return (
            <div className="space-y-6">
                {/* Header with Store and Date */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faStore} className="w-5 h-5 text-primary" />
                        <div>
                            <span className="font-medium text-gray-600">{t('store')}</span>
                            <span className="ml-2 font-semibold">{data.storeName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-primary" />
                        <div>
                            <span className="font-medium text-gray-600">{t('date')}</span>
                            <span className="ml-2 font-semibold">{new Date(data.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Photo Preview */}
                {photoPreview && (
                    <div className="p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-2">{t('uploadedPhoto')}</h4>
                        <img src={photoPreview} alt="Receipt" className="max-w-full h-auto max-h-64 rounded-lg" />
                    </div>
                )}

                {/* Products Table */}
                <div className="rounded-lg border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="w-auto text-left font-semibold">
                                    <FontAwesomeIcon icon={faBox} className="w-4 h-4 mr-2" />
                                    {t('product')}
                                </TableHead>
                                <TableHead className="text-center font-semibold">
                                    <FontAwesomeIcon icon={faCopyright} className="w-4 h-4 mr-2" />
                                    {t('brand')}
                                </TableHead>
                                <TableHead className="text-center font-semibold">
                                    <FontAwesomeIcon icon={faTags} className="w-4 h-4 mr-2" />
                                    {t('category')}
                                </TableHead>
                                <TableHead className="w-[100px] text-center font-semibold">
                                    <FontAwesomeIcon icon={faHashtag} className="w-4 h-4 mr-2" />
                                    {t('quantity')}
                                </TableHead>
                                <TableHead className="w-[140px] text-center font-semibold">
                                    {t('unitPrice')}<br />
                                    <span className="text-xs text-muted-foreground">(R$)</span>
                                </TableHead>
                                <TableHead className="w-[140px] text-center font-semibold">
                                    {t('totalPrice')}<br />
                                    <span className="text-xs text-muted-foreground">(R$)</span>
                                </TableHead>
                                <TableHead className="w-[100px] text-center font-semibold">
                                    {t('actions')}
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
                            {t('addItemManually')}
                        </Button>
                    </div>

                    {/* Total */}
                    <div className="p-4 bg-gray-50 border-t">
                        <div className="flex justify-end">
                            <div className="text-right">
                                <span className="text-xl font-bold">
                                    {t('Total: {{currency}}', {
                                        currency: Intl.NumberFormat(locale, {
                                            style: "currency",
                                            currency: getCurrencyFromLocale(locale)
                                        }).format(data.totalAmount || data.products.reduce((sum, p) => sum + p.price, 0)),
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between gap-4">
                    <Button variant="destructive" onClick={resetPhotoScan} className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4" />
                        {t('cancelAndStartNewImport')}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleSavePhotoData} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                            <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                            {t('confirmAndSavePurchase')}
                        </Button>
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
                    {t('urlManual')}
                </TabsTrigger>
                <TabsTrigger value="qr-code" className='flex-1 min-w-0'>
                    <FontAwesomeIcon icon={faQrcode} className="mr-2 h-4 w-4" />
                    {t('qrCode')}
                </TabsTrigger>
                <TabsTrigger value="photo-capture" className='flex-1 min-w-0'>
                    <FontAwesomeIcon icon={faCamera} className="mr-2 h-4 w-4" />
                    {t`Photo`}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="qr-code" className="mt-6">
                {analysisState.step === 'scan' ? (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">{t('scannerQrCode')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('positionNfceQr')}
                            </p>
                        </div>
                        <QrScannerComponent
                            onScan={handleQrScan}
                            onError={(error) => {
                                console.error('QR Scanner error:', error);
                                toast({
                                    variant: 'destructive',
                                    title: t('error9'),
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
                            <h3 className="text-lg font-semibold">{t('insertUrlManually')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('pasteNfceUrl')}
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
            <TabsContent value="photo-capture" className="mt-6">
                {!photoAnalysisResult && !isProcessingPhoto ? (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">{t`Receipt Photo`}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t`Take a photo or upload an image of your receipt to extract purchase data`}
                            </p>
                        </div>
                        
                        {/* Photo capture options */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                                <Button
                                    onClick={triggerCameraCapture}
                                    className="w-full"
                                    size="lg"
                                    variant="filled"
                                >
                                    <FontAwesomeIcon icon={faCamera} className="mr-2 h-5 w-5" />
                                    {t`Take Photo`}
                                </Button>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    capture="environment"
                                    ref={cameraInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <Button
                                    onClick={triggerFileSelect}
                                    className="w-full"
                                    size="lg"
                                    variant="outlined"
                                >
                                    <FontAwesomeIcon icon={faUpload} className="mr-2 h-5 w-5" />
                                    {t`Upload Photo`}
                                </Button>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-blue-900">{t('takePhotoTips')}</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPhotoTips(!showPhotoTips)}
                                >
                                    <FontAwesomeIcon 
                                        icon={showPhotoTips ? faTimesCircle : faExclamationTriangle} 
                                        className="h-4 w-4" 
                                    />
                                </Button>
                            </div>
                            {showPhotoTips && (
                                <div className="space-y-3">
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• {t('takePhotoTip1')}</li>
                                        <li>• {t('takePhotoTip2')}</li>
                                        <li>• {t('takePhotoTip3')}</li>
                                        <li>• {t('onlyTakePhotoOfReceipt')}</li>
                                        <li>• {t('supportedFormats')}</li>
                                        <li>• {t('worksWithIfoodAndNfceReceipts')}</li>
                                    </ul>
                                    
                                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                                        <h5 className="font-medium text-yellow-900 text-sm mb-1">
                                            {t('importantReminder')}
                                        </h5>
                                        <p className="text-xs text-yellow-800">
                                            {t('ensureReceiptWellLit')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Multiple photos support */}
                        {capturedPhotos.length > 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">
                                        {t('capturedPhotos')} ({capturedPhotos.length})
                                    </h4>
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={handleAddMorePhotos}
                                    >
                                        <FontAwesomeIcon icon={faPlusCircle} className="mr-1 h-3 w-3" />
                                        {t('addMorePhotos')}
                                    </Button>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {capturedPhotos.map((photo, index) => (
                                        <div key={photo.id} className="relative">
                                            <img
                                                src={photo.dataUri}
                                                alt={`Receipt photo ${index + 1}`}
                                                className="w-full h-20 object-cover rounded border cursor-pointer"
                                                onClick={() => {
                                                    setPhotoPreview(photo.dataUri);
                                                    if (photo.result) {
                                                        setPhotoAnalysisResult(photo.result);
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-0 right-0 h-6 w-6 p-0 bg-red-500 text-white rounded-full"
                                                onClick={() => handleRemovePhoto(photo.id)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                                            </Button>
                                            {photo.result && (
                                                <Badge 
                                                    variant="default" 
                                                    className="absolute bottom-0 left-0 text-xs bg-green-500 text-white"
                                                >
                                                    ✓ {t('processed')}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : isProcessingPhoto ? (
                    <Loading
                        text={t('processingPhoto')}
                        description={t('extractingFromImage')}
                        layout="vertical"
                        size="lg"
                    />
                ) : photoAnalysisResult ? (
                    renderPhotoResults()
                ) : null}
            </TabsContent>
        </Tabs>
    );
}
