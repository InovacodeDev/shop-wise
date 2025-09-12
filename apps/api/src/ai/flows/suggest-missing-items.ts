/**
 * @fileOverview A flow that suggests missing items based on purchase history an
d family size.
 *
 * - suggestMissingItems - A function that suggests items to add to the shopping
 list based on history and family size.
 * - SuggestMissingItemsInput - The input type for the suggestMissingItems funct
ion.
 * - SuggestMissingItemsOutput - The return type for the suggestMissingItems fun
ction.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestMissingItemsInputSchema = z.object({
    purchaseHistory: z
        .string()
        .describe(
            'A string containing the purchase history of the user, including item names, quantities, and dates of purchase.',
        ),
    familySize: z.number().describe('The number of people in the user’s family, including adults and children.'),
});
export type SuggestMissingItemsInput = z.infer<typeof SuggestMissingItemsInputSchema>;

const SuggestMissingItemsOutputSchema = z.object({
    suggestedItems: z.array(z.string()).describe('An array of suggested items to add to the shopping list.'),
});
export type SuggestMissingItemsOutput = z.infer<typeof SuggestMissingItemsOutputSchema>;

export async function suggestMissingItems(input: SuggestMissingItemsInput): Promise<SuggestMissingItemsOutput> {
    return await suggestMissingItemsFlow(input);
}

const prompt = ai.definePrompt({
    name: 'suggestMissingItemsPrompt',
    input: { schema: SuggestMissingItemsInputSchema },
    output: { schema: SuggestMissingItemsOutputSchema },
    prompt: `You are a shopping list assistant. Given the following purchase history and family size, suggest items that the user might need to add to their shopping list.

Purchase History: {{{purchaseHistory}}}
Family Size: {{{familySize}}}

Suggest items to add to the shopping list, considering the purchase history and family size. Only suggest items that are likely to be needed based on the purchase history and family size. Do not suggest items that are already in the purchase history unless the quantity seems insufficient for the family size.

Format your output as a JSON array of strings.`,
});

const suggestMissingItemsFlow = ai.defineFlow(
    {
        name: 'suggestMissingItemsFlow',
        inputSchema: SuggestMissingItemsInputSchema,
        outputSchema: SuggestMissingItemsOutputSchema,
    },
    async (input: SuggestMissingItemsInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
