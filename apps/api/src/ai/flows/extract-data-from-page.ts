/**
 * @fileOverview This file defines a Genkit flow to extract product data from a
single page of a PDF receipt.
 *
 * It includes:
 * - `extractDataFromPage`: An async function that takes a receipt page and retu
rns the extracted product information.
 * - `ExtractDataFromPageInput`: The input type for the `extractDataFromPage` fu
nction.
 * - `ExtractDataFromPageOutput`: The output type for the `extractDataFromPage`
function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractDataFromPageInputSchema = z.object({
    pageDataUri: z
        .string()
        .describe(
            "A single page of a PDF receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'.",
        ),
});
export type ExtractDataFromPageInput = z.infer<typeof ExtractDataFromPageInputSchema>;

const ExtractDataFromPageOutputSchema = z.object({
    products: z
        .array(
            z.object({
                barcode: z.string().describe("The product's barcode (Código)."),
                name: z.string().describe('The name of the product (Descrição).'),
                quantity: z.number().describe('The quantity of the product (Qtde.).'),
                volume: z.string().describe('The unit of measurement for the product (UN). Ex: UN, KG, L'),
                unitPrice: z.number().describe('The unit price of the product (Vl. Unit.).'),
                price: z.number().describe('The total price of the product (Vl. Total).'),
                brand: z.string().optional().describe('The brand of the product, inferred from its name.'),
                category: z.string().describe('The category of the product.'),
                subcategory: z.string().optional().describe('The subcategory of the product.'),
            }),
        )
        .describe('An array of ALL products extracted from this single page of the receipt.'),
});
export type ExtractDataFromPageOutput = z.infer<typeof ExtractDataFromPageOutputSchema>;

export async function extractDataFromPage(input: ExtractDataFromPageInput): Promise<ExtractDataFromPageOutput> {
    return await extractDataFromPageFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractDataFromPagePrompt',
    input: { schema: ExtractDataFromPageInputSchema },
    output: { schema: ExtractDataFromPageOutputSchema },
    prompt: `You are an expert data extractor specializing in extracting product data from a single page of a Brazilian Nota Fiscal de Consumidor Eletrônica (NFC-e) receipt.

  Access the provided PDF page and extract a list of all products. It is critical that you extract ALL products listed on this page. Do not extract store or general purchase information, only the product lines.

  **Product Extraction Rules:**
  - The products are in a table. For each product, extract all fields.
  - **Item Unification**: If a product with the same barcode appears multiple times on the receipt page, you must unify them into a single item. Sum the quantities ("Qtde.") and the total prices ("Vl. Total"). Use the name and unit price from the first occurrence.
  - **Price**: Use "Vl. Unit." for the 'unitPrice' field. Use "Vl. Total" for the 'price' field. This is critical for correct financial analysis.
  - **Brand**: Infer the product's brand from its name. If no brand is evident, leave it empty.
  - **Category/Subcategory**: Classify each product into a category and subcategory from the list below. Be as specific as possible. If a product doesn't fit, use your best judgment.

  **Categories List:**
  - **Hortifrúti e Ovos**: Frutas, Legumes, Verduras e Folhas, Temperos Frescos, Ovos.
  - **Açougue e Peixaria**: Carnes Bovinas, Aves, Carnes Suínas, Peixes e Frutos do Mar.
  - **Padaria e Confeitaria**: Pães, Bolos e Tortas, Salgados, Frios e Embutidos Fatiados, Torradas e Croutons.
  - **Laticínios e Frios**: Leites, Queijos, Iogurtes, Manteiga e Margarina, Requeijão e Cream Cheese, Nata e Creme de Leite Fresco.
  - **Mercearia (Alimentos Secos)**: Grãos e Cereais, Massas, Farináceos, Açúcar e Adoçantes, Óleos, Azeites e Vinagres, Enlatados e Conservas, Molhos e Temperos, Sopas e Cremes.
  - **Matinais e Doces**: Café, Chás e Achocolatados em Pó, Cereais Matinais e Granola, Biscoitos e Bolachas, Geleias e Cremes, Doces e Sobremesas.
  - **Congelados**: Pratos Prontos, Salgados Congelados, Legumes Congelados, Polpas de Frutas, Sorvetes e Açaí.
  - **Bebidas**: Água, Sucos, Refrigerantes, Chás Prontos e Isotônicos, Bebidas Alcoólicas.
  - **Limpeza**: Roupas, Cozinha, Banheiro e Geral, Acessórios.
  - **Higiene Pessoal**: Higiene Bucal, Cabelo, Corpo, Cuidados com o Rosto, Higiene Íntima e Absorventes, Papel Higiênico e Lenços de Papel, Barbearia.
  - **Bebês e Crianças**: Fraldas e Lenços Umedecidos, Alimentação Infantil, Higiene Infantil.
  - **Pet Shop**: Alimentação, Higiene.
  - **Utilidades e Bazar**: Cozinha, Geral, Churrasco.
  - **Farmácia**: Medicamentos e Saúde, Primeiros Socorros.

  Now, analyze the following receipt page PDF and extract the product information into the specified JSON format.
  Receipt Page PDF: {{media url=pageDataUri}}
  `,
});

const extractDataFromPageFlow = ai.defineFlow(
    {
        name: 'extractDataFromPageFlow',
        inputSchema: ExtractDataFromPageInputSchema,
        outputSchema: ExtractDataFromPageOutputSchema,
    },
    async (input: ExtractDataFromPageInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
