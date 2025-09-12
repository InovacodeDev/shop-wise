/**
 * @fileOverview This file defines a Genkit flow to extract NFCe data directly from HTML content.
 *
 * It includes:
 * - `extractNfceFromHtml`: An async function that takes raw HTML and extracts structured NFCe data using AI.
 * - `ExtractNfceFromHtmlInput`: The input type for the `extractNfceFromHtml` function.
 * - `ExtractNfceFromHtmlOutput`: The output type for the `extractNfceFromHtml` function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractNfceFromHtmlInputSchema = z.object({
    htmlContent: z.string().describe('The raw HTML content from the NFCe web page'),
    url: z.string().describe('The URL of the NFCe page for context'),
});
export type ExtractNfceFromHtmlInput = z.infer<typeof ExtractNfceFromHtmlInputSchema>;

const ExtractNfceFromHtmlOutputSchema = z.object({
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
        .describe('An array of ALL products extracted from the NFCe HTML.'),
    storeName: z.string().describe('The name of the store.'),
    date: z.string().describe('The date of the purchase (YYYY-MM-DD format).'),
    cnpj: z.string().describe("The store's CNPJ (Cadastro Nacional da Pessoa Jurídica)."),
    address: z.string().describe('The full address of the store.'),
    accessKey: z.string().describe("The receipt's access key (Chave de Acesso)."),
    nfceNumber: z.string().describe('The NFCe number.'),
    series: z.string().describe('The series number.'),
    emissionDateTime: z.string().describe('The emission date and time.'),
    authorizationProtocol: z.string().describe('The authorization protocol.'),
    totalAmount: z.number().describe('The total amount of the purchase.'),
    paymentMethod: z.string().optional().describe('The payment method used.'),
    amountPaid: z.number().optional().describe('The amount paid.'),
    latitude: z.number().optional().describe("The latitude of the store's location."),
    longitude: z.number().optional().describe("The longitude of the store's location."),
    discount: z.number().optional().describe('The total discount amount for the purchase (Descontos R$).'),
    type: z
        .string()
        .describe('The type of store, e.g., supermarket, convenience store, marketplace, pharmacy, etc.')
        .default('supermarket'),
});
export type ExtractNfceFromHtmlOutput = z.infer<typeof ExtractNfceFromHtmlOutputSchema>;

export async function extractNfceFromHtml(input: ExtractNfceFromHtmlInput): Promise<ExtractNfceFromHtmlOutput> {
    return await extractNfceFromHtmlFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractNfceFromHtmlPrompt',
    input: { schema: ExtractNfceFromHtmlInputSchema },
    output: { schema: ExtractNfceFromHtmlOutputSchema },
    prompt: `You are an expert data extractor specializing in Brazilian Nota Fiscal de Consumidor Eletrônica (NFC-e) web pages.

You will receive raw HTML content from an NFCe page, and your task is to extract all relevant information into a structured format.

**Extraction Guidelines:**

**Store Information:**
- Extract the store name, CNPJ, and full address
- Determine the store type based on products and store name
- If you recognize the store chain, try to provide latitude/longitude coordinates

**NFCe Details:**
- Extract NFCe number, series, emission date/time, authorization protocol, and access key
- Extract total amount, payment method, and amount paid
- Look for any discount information

**Products:**
- Extract ALL products from the receipt
- For each product, extract: code/barcode, name, quantity, unit, unit price, total price
- Infer the brand from the product name when possible
- Categorize products using the category system below

**Date Formatting:**
- Convert all dates to YYYY-MM-DD format

**Categories for Product Classification:**
- **Hortifrúti e Ovos**: Frutas, Legumes, Verduras e Folhas, Temperos Frescos, Ovos
- **Açougue e Peixaria**: Carnes Bovinas, Aves, Carnes Suínas, Peixes e Frutos do Mar
- **Padaria e Confeitaria**: Pães, Bolos e Tortas, Salgados, Frios e Embutidos Fatiados
- **Laticínios e Frios**: Leites, Queijos, Iogurtes, Manteiga e Margarina, Requeijão
- **Mercearia (Alimentos Secos)**: Grãos, Massas, Farináceos, Açúcar, Óleos, Azeites, Enlatados, Molhos
- **Matinais e Doces**: Café, Chás, Cereais, Biscoitos, Geleias, Doces
- **Congelados**: Pratos Prontos, Salgados Congelados, Legumes Congelados, Sorvetes
- **Bebidas**: Água, Sucos, Refrigerantes, Chás Prontos, Bebidas Alcoólicas
- **Limpeza**: Produtos de limpeza para roupas, cozinha, banheiro
- **Higiene Pessoal**: Produtos de higiene bucal, cabelo, corpo, rosto
- **Bebês e Crianças**: Fraldas, alimentação infantil, higiene infantil
- **Pet Shop**: Alimentação e higiene para animais
- **Utilidades e Bazar**: Utensílios de cozinha e casa
- **Farmácia**: Medicamentos, produtos de saúde

**Brand Recognition:**
Look for well-known Brazilian brands in product names and extract them accurately.

**Input Data:**
URL: {{url}}
HTML Content: {{htmlContent}}

Please extract all the information from this NFCe HTML and return it in the structured format.`,
});

const extractNfceFromHtmlFlow = ai.defineFlow(
    {
        name: 'extractNfceFromHtmlFlow',
        inputSchema: ExtractNfceFromHtmlInputSchema,
        outputSchema: ExtractNfceFromHtmlOutputSchema,
    },
    async (input: ExtractNfceFromHtmlInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
