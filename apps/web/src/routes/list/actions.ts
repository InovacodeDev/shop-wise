import { apiService } from "@/services/api";

// Types maintained for compatibility
type SuggestMissingItemsInput = {
    purchaseHistory: string;
    familySize: number;
};

export async function suggestMissingItems(input: SuggestMissingItemsInput): Promise<{ suggestedItems: string[], error?: string }> {
    try {
        const result = await apiService.suggestMissingItems(input);
        return result;
    } catch (error: any) {
        console.error("Error in suggestMissingItems action:", error);
        return { suggestedItems: [], error: error.message || "Failed to get suggestions from AI." };
    }
}
