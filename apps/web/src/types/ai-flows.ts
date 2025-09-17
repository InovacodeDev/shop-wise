// Re-export AI flow types from canonical API types
export type {
    AnalyzeConsumptionDataInput,
    AnalyzeConsumptionDataOutput,
    ExtractDataFromPageInput,
    ExtractDataFromPageOutput,
    ExtractDataFromPdfInput,
    ExtractDataFromPdfOutput,
    ExtractFromReceiptPhotoInput,
    ExtractFromReceiptPhotoOutput,
    ExtractProductDataInput,
    ExtractProductDataOutput,
    Product,
    SuggestMissingItemsInput,
    SuggestMissingItemsOutput,
} from '@/types/api';

// API Response wrapper for convenience
interface APIResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export type ExtractProductAPIResponse = APIResponse<import('@/types/api').ExtractProductDataOutput>;
export type ExtractFromReceiptPhotoAPIResponse = APIResponse<import('@/types/api').ExtractFromReceiptPhotoOutput>;
export type ExtractPdfAPIResponse = APIResponse<import('@/types/api').ExtractDataFromPdfOutput>;
export type ExtractPageAPIResponse = APIResponse<import('@/types/api').ExtractDataFromPageOutput>;
export type AnalyzeConsumptionAPIResponse = APIResponse<import('@/types/api').AnalyzeConsumptionDataOutput>;
export type SuggestItemsAPIResponse = APIResponse<import('@/types/api').SuggestMissingItemsOutput>;
