/**
 * @fileOverview This file defines a Genkit flow to extract and process data from NFCe web pages.
 *
 * It includes:
 * - `extractDataFromNfceWeb`: An async function that takes web-scraped NFCe data and enhances it using AI.
 * - `ExtractDataFromNfceWebInput`: The input type for the `extractDataFromNfceWeb` function.
 * - `ExtractDataFromNfceWebOutput`: The output type for the `extractDataFromNfceWeb` function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractDataFromNfceWebInputSchema = z.object({
    rawNfceData: z
        .object({
            products: z.array(
                z.object({
                    barcode: z.string(),
                    name: z.string(),
                    quantity: z.number(),
                    volume: z.string(),
                    unitPrice: z.number(),
                    price: z.number(),
                    brand: z.string().optional(),
                    category: z.string(),
                    subcategory: z.string().optional(),
                }),
            ),
            storeName: z.string(),
            date: z.string(),
            cnpj: z.string(),
            address: z.string(),
            accessKey: z.string(),
            type: z.string(),
            nfceNumber: z.string(),
            series: z.string(),
            emissionDateTime: z.string(),
            authorizationProtocol: z.string(),
            totalAmount: z.number(),
            paymentMethod: z.string().optional(),
            amountPaid: z.number().optional(),
        })
        .describe('Raw NFCe data extracted from web scraping'),
});
export type ExtractDataFromNfceWebInput = z.infer<typeof ExtractDataFromNfceWebInputSchema>;

const ExtractDataFromNfceWebOutputSchema = z.object({
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
        .describe('An array of ALL products extracted and enhanced from the NFCe web page.'),
    storeName: z.string().describe('The name of the store.'),
    date: z.string().describe('The date of the purchase (dd/mm/yyyy).'),
    cnpj: z.string().describe("The store's CNPJ (Cadastro Nacional da Pessoa Jurídica)."),
    address: z.string().describe('The full address of the store.'),
    accessKey: z.string().describe("The receipt's access key (Chave de Acesso)."),
    latitude: z.number().optional().describe("The latitude of the store's location."),
    longitude: z.number().optional().describe("The longitude of the store's location."),
    discount: z.number().optional().describe('The total discount amount for the purchase (Descontos R$).'),
    type: z
        .string()
        .describe('The type of store, e.g., supermarket, convenience store, marketplace, pharmacy, etc.')
        .default('supermarket'),
});
export type ExtractDataFromNfceWebOutput = z.infer<typeof ExtractDataFromNfceWebOutputSchema>;

export async function extractDataFromNfceWeb(
    input: ExtractDataFromNfceWebInput,
): Promise<ExtractDataFromNfceWebOutput> {
    return await extractDataFromNfceWebFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractDataFromNfceWebPrompt',
    input: { schema: ExtractDataFromNfceWebInputSchema },
    output: { schema: ExtractDataFromNfceWebOutputSchema },
    prompt: `You are an expert data enhancer specializing in improving and validating Brazilian Nota Fiscal de Consumidor Eletrônica (NFC-e) data extracted from web pages.

  You will receive raw NFCe data that has been extracted from a web page, and your task is to enhance, validate, and improve the data quality.

  **Data Enhancement Rules:**
  - **Store Name**: Validate and clean the store name.
  - **CNPJ**: Ensure CNPJ format is correct and valid.
  - **Address**: Clean and standardize the address format. If possible, try to infer latitude and longitude for common store chains.
  - **Date**: Ensure the date is properly formatted as YYYY-MM-DD.
  - **Store type**: Validate and improve the store type classification based on the store name and products.

  **Product Enhancement Rules:**
  - **Brand**: Improve brand inference from product names. Look for well-known brands in Brazilian market.
  - **Category/Subcategory**: Review and improve the product categorization to be more accurate and specific using the categories below.
  - **Name**: Clean and standardize product names.
  - **Price validation**: Ensure unit price × quantity = total price (with reasonable tolerance for rounding).

  **Categories List for better classification:**
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

  **Geographic Enhancement:**
  If you recognize the store chain or location, try to provide latitude and longitude coordinates for the address.

  Now, enhance the following raw NFCe data and return the improved, validated information:
  Raw NFCe Data: {{rawNfceData}}
  `,
});

const extractDataFromNfceWebFlow = ai.defineFlow(
    {
        name: 'extractDataFromNfceWebFlow',
        inputSchema: ExtractDataFromNfceWebInputSchema,
        outputSchema: ExtractDataFromNfceWebOutputSchema,
    },
    async (input: ExtractDataFromNfceWebInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
