/**
 * @fileOverview A flow that generates comprehensive shopping lists based on purchase history and family preferences.
 *
 * - generateShoppingList - A function that creates intelligent shopping lists based on historical data, family size, and dietary preferences.
 * - GenerateShoppingListInput - The input type for the generateShoppingList function.
 * - GenerateShoppingListOutput - The return type for the generateShoppingList function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateShoppingListInputSchema = z.object({
    purchaseHistory: z
        .string()
        .describe(
            'A detailed string containing the purchase history of the user, including item names, quantities, dates, frequencies, and categories of purchase.',
        ),
    familySize: z.number().describe("The number of people in the user's family, including adults and children."),
    preferences: z
        .string()
        .optional()
        .describe(
            'Optional dietary preferences, restrictions, or special requirements (e.g., vegetarian, gluten-free, organic, etc.).',
        ),
    listName: z
        .string()
        .optional()
        .describe('Optional name for the shopping list. If not provided, AI will generate an appropriate name.'),
    currentPeriod: z
        .string()
        .optional()
        .describe('Current period of the month (beginning, middle, end) to generate contextual shopping lists.'),
    periodAnalysis: z
        .string()
        .optional()
        .describe('Analysis of historical purchase patterns for similar periods in previous months.'),
    favoriteStores: z
        .array(z.string())
        .optional()
        .describe('List of favorite store names to prioritize for suggestions and price optimization.'),
});
export type GenerateShoppingListInput = z.infer<typeof GenerateShoppingListInputSchema>;

const ShoppingListItemSchema = z.object({
    name: z.string().describe('The name of the item to be purchased'),
    quantity: z.number().describe('The suggested quantity of the item'),
    category: z.string().describe('The category of the item (e.g., Fruits, Vegetables, Dairy, Meat, etc.)'),
    priority: z.enum(['high', 'medium', 'low']).describe('Priority level based on purchase frequency and essentiality'),
    reason: z.string().describe('Brief explanation why this item is suggested'),
    suggestedStore: z
        .string()
        .optional()
        .describe('Recommended store to buy this item based on price history and preferences'),
    estimatedPrice: z.number().optional().describe('Estimated price for the item based on historical data'),
});

const GenerateShoppingListOutputSchema = z.object({
    listName: z.string().describe('Generated name for the shopping list'),
    items: z.array(ShoppingListItemSchema).describe('Array of suggested shopping list items'),
    totalEstimatedItems: z.number().describe('Total number of unique items in the list'),
    categories: z.array(z.string()).describe('List of all categories represented in the shopping list'),
});
export type GenerateShoppingListOutput = z.infer<typeof GenerateShoppingListOutputSchema>;
export type ShoppingListItem = z.infer<typeof ShoppingListItemSchema>;

export async function generateShoppingList(input: GenerateShoppingListInput): Promise<GenerateShoppingListOutput> {
    return await generateShoppingListFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateShoppingListPrompt',
    input: { schema: GenerateShoppingListInputSchema },
    output: { schema: GenerateShoppingListOutputSchema },
    prompt: `You are an intelligent shopping list generator that creates comprehensive, personalized shopping lists based on family purchase patterns, preferences, and timing context.

**Analysis Context:**
Purchase History: {{purchaseHistory}}
Family Size: {{familySize}} people
Dietary Preferences: {{preferences}}
Custom List Name: {{listName}}
Current Period: {{currentPeriod}}
Period Analysis: {{periodAnalysis}}
Favorite Stores: {{favoriteStores}}

**Instructions:**

1. **Historical & Period Analysis**: Analyze the purchase history to identify:
   - Frequently bought items and their typical quantities for this time period
   - Purchase frequency patterns (beginning/middle/end of month trends)
   - Seasonal trends and preferences specific to the current period
   - Brand preferences and typical product categories
   - Items commonly purchased during this period in previous months

2. **Family-Sized Portions**: Scale quantities appropriately for {{familySize}} people:
   - Consider consumption rates based on family size
   - Adjust quantities for perishables vs. non-perishables
   - Account for bulk buying opportunities for larger families
   - Consider period-specific needs (bulk purchases at month start, essentials at month end)

3. **Smart Suggestions**: Include items that are:
   - Due for replenishment based on historical frequency for this period
   - Complementary to frequently purchased items during similar periods
   - Essential household staples that may be running low
   - Period-appropriate items (monthly stock-ups, weekly essentials)

4. **Store & Price Optimization**: When suggesting items:
   - Prioritize favorite stores for better shopping experience
   - Include estimated prices based on historical data from preferred stores
   - Suggest stores known for competitive prices for specific categories

5. **Categorization**: Organize items into logical shopping categories:
   - Fresh Produce (Fruits, Vegetables)
   - Dairy & Refrigerated
   - Meat & Seafood
   - Pantry Staples (Grains, Canned goods, Spices)
   - Frozen Foods
   - Beverages
   - Household & Cleaning
   - Personal Care
   - Snacks & Treats

5. **Priority System**:
   - **HIGH**: Essential items, running low, or purchased very frequently
   - **MEDIUM**: Regular items due for restocking
   - **LOW**: Nice-to-have items or occasional purchases

6. **Dietary Considerations**: If preferences are specified, ensure all suggestions align with:
   - Dietary restrictions (vegetarian, vegan, gluten-free, etc.)
   - Health preferences (organic, low-sodium, sugar-free)
   - Cultural or religious dietary requirements

7. **List Naming**: Generate an appropriate list name or use the provided custom name. Names should be:
   - Descriptive and practical (e.g., "Weekly Groceries - March 2025")
   - Context-aware (e.g., "Family Essentials", "Monthly Stock-up")

**Output Requirements:**
- Focus on practical, purchasable items
- Provide realistic quantities based on family consumption
- Include brief reasoning for each suggestion
- Ensure variety and nutritional balance
- Limit to 25-40 items to keep the list manageable

Generate a comprehensive shopping list that helps the family maintain their usual consumption patterns while discovering complementary items they might need.`,
});

const generateShoppingListFlow = ai.defineFlow(
    {
        name: 'generateShoppingListFlow',
        inputSchema: GenerateShoppingListInputSchema,
        outputSchema: GenerateShoppingListOutputSchema,
    },
    async (input: GenerateShoppingListInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
