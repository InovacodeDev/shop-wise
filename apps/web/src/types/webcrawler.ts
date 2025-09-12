/**
 * TypeScript types for Webcrawler and NFCe functionality
 */

// ===============================
// NFCe Product Types
// ===============================

export interface NfceProduct {
    barcode: string;
    name: string;
    quantity: number;
    volume: string;
    unitPrice: number;
    price: number;
    brand?: string;
    category: string;
    subcategory?: string;
}

// ===============================
// NFCe Data Types
// ===============================

export interface NfceData {
    products: NfceProduct[];
    storeName: string;
    date: string;
    cnpj: string;
    address: string;
    accessKey: string;
    latitude?: number;
    longitude?: number;
    discount?: number;
    type: string;
    nfceNumber: string;
    series: string;
    emissionDateTime: string;
    authorizationProtocol: string;
    totalAmount: number;
    paymentMethod?: string;
    amountPaid?: number;
}

// ===============================
// Enhanced NFCe Data Types (with AI processing)
// ===============================

export interface EnhancedNfceData {
    success: boolean;
    data?: {
        purchase: {
            products: Array<{
                barcode: string;
                name: string;
                quantity: number;
                price: number;
                unitPrice: number;
                volume: string;
                category?: string;
                subcategory?: string;
                brand?: string;
            }>;
            storeId?: string;
            storeName: string;
            date: string;
            totalAmount: number;
            familyId?: string;
        };
        store?: {
            name: string;
            cnpj: string;
            address: string;
            type: string;
        };
        categories?: Array<{
            name: string;
            familyId?: string;
        }>;
        families?: Array<{
            name: string;
        }>;
    };
    error?: string;
}

// ===============================
// API Request/Response Types
// ===============================

export interface CrawlNfceRequest {
    url: string;
}

export interface CrawlNfceResponse extends NfceData {}

export interface CrawlAndEnhanceNfceResponse extends EnhancedNfceData {}

// ===============================
// QR Scanner Types
// ===============================

export interface QrScanResult {
    data: string;
    cornerPoints?: Array<{ x: number; y: number }>;
}

export interface QrScannerProps {
    onScan: (result: QrScanResult) => void;
    onError?: (error: Error) => void;
    className?: string;
    preferredCamera?: 'user' | 'environment';
    scanDelay?: number;
}

// ===============================
// Manual URL Input Types
// ===============================

export interface ManualUrlInputProps {
    onSubmit: (url: string) => void;
    isLoading?: boolean;
    className?: string;
}

// ===============================
// NFCe Analysis Types
// ===============================

export interface NfceAnalysisState {
    step: 'scan' | 'loading' | 'results' | 'error';
    url?: string;
    data?: NfceData;
    enhancedData?: EnhancedNfceData;
    error?: string;
    isEnhanced?: boolean;
}

export interface NfceAnalysisActions {
    resetScan: () => void;
    setUrl: (url: string) => void;
    setLoading: () => void;
    setResults: (data: NfceData, enhancedData?: EnhancedNfceData) => void;
    setError: (error: string) => void;
}
