/**
 * TypeScript types for AI flows based on Zod schemas from backend
 * These types mirror the schemas defined in backend/src/ai/flows/
 */

// ===============================
// Extract Product Data Flow Types
// ===============================

export interface ExtractProductDataInput {
  receiptImage: string; // Data URI with MIME type and Base64 encoding
}

export interface Product {
  barcode: string;
  name: string;
  quantity: number;
  volume: string; // Unit of measurement (UN, KG, L, etc.)
  unitPrice: number;
  price: number; // Total price
  brand?: string;
  category: string;
  subcategory?: string;
}

export interface ExtractProductDataOutput {
  products: Product[];
  storeName: string;
  date: string; // Format: dd/mm/yyyy
  cnpj: string;
  address: string;
  accessKey: string;
  latitude?: number;
  longitude?: number;
  discount?: number;
}

// ===============================
// Extract Data From PDF Flow Types
// ===============================

export interface ExtractDataFromPdfInput {
  pdfDataUri: string; // Data URI for PDF with Base64 encoding
}

export interface ExtractDataFromPdfOutput {
  products: Product[];
  storeName: string;
  date: string; // Format: dd/mm/yyyy
  cnpj: string;
  address: string;
  accessKey: string;
  latitude?: number;
  longitude?: number;
  discount?: number;
}

// ===============================
// Extract Data From Page Flow Types
// ===============================

export interface ExtractDataFromPageInput {
  pageDataUri: string; // Data URI for single PDF page with Base64 encoding
}

export interface ExtractDataFromPageOutput {
  products: Product[];
}

// ===============================
// Analyze Consumption Data Flow Types
// ===============================

export interface AnalyzeConsumptionDataInput {
  consumptionData: string; // JSON string of monthly consumption data
  language?: string; // Language code (e.g., 'en', 'pt-BR')
}

export interface AnalyzeConsumptionDataOutput {
  analysis: string; // Detailed textual analysis in Markdown format
}

// ===============================
// Suggest Missing Items Flow Types
// ===============================

export interface SuggestMissingItemsInput {
  purchaseHistory: string; // String containing purchase history
  familySize: number; // Number of family members (adults + children)
}

export interface SuggestMissingItemsOutput {
  suggestedItems: string[]; // Array of suggested item names
}

// ===============================
// Union Types for API Responses
// ===============================

export type AIFlowInput = 
  | ExtractProductDataInput
  | ExtractDataFromPdfInput
  | ExtractDataFromPageInput
  | AnalyzeConsumptionDataInput
  | SuggestMissingItemsInput;

export type AIFlowOutput = 
  | ExtractProductDataOutput
  | ExtractDataFromPdfOutput
  | ExtractDataFromPageOutput
  | AnalyzeConsumptionDataOutput
  | SuggestMissingItemsOutput;

// ===============================
// Helper Types
// ===============================

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ExtractProductAPIResponse = APIResponse<ExtractProductDataOutput>;
export type ExtractPdfAPIResponse = APIResponse<ExtractDataFromPdfOutput>;
export type ExtractPageAPIResponse = APIResponse<ExtractDataFromPageOutput>;
export type AnalyzeConsumptionAPIResponse = APIResponse<AnalyzeConsumptionDataOutput>;
export type SuggestItemsAPIResponse = APIResponse<SuggestMissingItemsOutput>;
