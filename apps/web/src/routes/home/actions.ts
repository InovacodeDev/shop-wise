
import { apiService } from "@/services/api";
import type { 
    AnalyzeConsumptionDataInput,
    AnalyzeConsumptionDataOutput 
} from "@/types/ai-flows";

export async function analyzeConsumptionData(input: AnalyzeConsumptionDataInput): Promise<AnalyzeConsumptionDataOutput & { error?: string }> {
    try {
        const result = await apiService.analyzeConsumptionData(input);
        return result;
    } catch (error: any) {
        console.error("Error in analyzeConsumptionData action:", error);
        return { analysis: '', error: error.message || "Failed to get analysis from AI." };
    }
}
