import { apiService } from "@/services/api";
import type { PurchaseData, ItemData } from "@/components/purchases/manual-purchase-form";
import { savePurchase as savePurchaseService } from "@/services/purchaseApiService";
import type { 
    ExtractProductDataInput,
    ExtractProductDataOutput,
    ExtractDataFromPdfInput,
    ExtractDataFromPdfOutput,
    Product
} from "@/types/ai-flows";

export async function extractProductData(input: ExtractProductDataInput) {
    try {
        const result = await apiService.extractProductData(input);
        return result;
    } catch (error: any) {
        console.error("Error in extractProductData action:", error);
        return { error: error.message || "Failed to extract data from QR code." };
    }
}

export async function extractDataFromPdf(
    input: ExtractDataFromPdfInput
): Promise<ExtractDataFromPdfOutput & { error?: string }> {
    try {
        const result = await apiService.extractDataFromPdf(input);
        return result;
    } catch (error: any) {
        console.error("Error in extractDataFromPdf action:", error);
        return {
            accessKey: '',
            address: '',
            cnpj: '',
            date: '',
            products: [],
            storeName: '',
            error: error.message || "Failed to import data from PDF.",
        };
    }
}

export async function savePurchase(
    purchaseData: ExtractProductDataOutput | PurchaseData,
    products: Product[],
    familyId: string,
    userId: string,
    entryMethod: "import" | "manual" | "nfce"
): Promise<{ success: boolean; error?: string; purchaseId?: string }> {
    try {
        const result = await savePurchaseService(familyId, userId, purchaseData, products, entryMethod);
        return result;
    } catch (error: any) {
        console.error("Error in savePurchase action:", error);
        return { success: false, error: error.message || "Failed to save purchase." };
    }
}
