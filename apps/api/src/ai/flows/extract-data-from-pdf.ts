/**
 * @fileOverview This file defines a Genkit flow to extract ALL data (store and
products) from a multi-page PDF receipt.
 *
 * It includes:
 * - `extractDataFromPdf`: An async function that takes a receipt PDF and return
s the extracted information.
 * - `ExtractDataFromPdfInput`: The input type for the `extractDataFromPdf` func
tion.
 * - `ExtractDataFromPdfOutput`: The output type for the `extractDataFromPdf` fu
nction.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractDataFromPdfInputSchema = z.object({
    pdfDataUri: z
        .string()
        .describe(
            "A PDF of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'.",
        ),
});
export type ExtractDataFromPdfInput = z.infer<typeof ExtractDataFromPdfInputSchema>;

const ExtractDataFromPdfOutputSchema = z.object({
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
        .describe('An array of ALL products extracted from the receipt.'),
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
export type ExtractDataFromPdfOutput = z.infer<typeof ExtractDataFromPdfOutputSchema>;

export async function extractDataFromPdf(input: ExtractDataFromPdfInput): Promise<ExtractDataFromPdfOutput> {
    return await extractDataFromPdfFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractDataFromPdfPrompt',
    input: { schema: ExtractDataFromPdfInputSchema },
    output: { schema: ExtractDataFromPdfOutputSchema },
    prompt: `You are an expert data extractor specializing in extracting data from Brazilian Nota Fiscal de Consumidor Eletrônica (NFC-e) receipts.

  You will use the information from the provided PDF to extract the store name, purchase date, and a list of all products. It is critical that you extract ALL products listed on the receipt, which may span multiple pages.

  **Data Extraction Rules:**
  - **Store Name**: Look for the emitter's name, usually at the top of the first page. (e.g., "SDB COMERCIO DE ALIMENTOS LTDA")
  - **CNPJ**: Look for the emitter's CNPJ. (e.g., "09.477.652/0090-61")
  - **Address**: Look for the emitter's full address. If possible, infer the latitude and longitude. (e.g., "SC401 RF JOSE CARLOS DAUX, 9580, STO ANTONIO DE LISBOA, FLORIANOPOLIS, SC")
  - **Date**: Find the emission date. It is often labeled "Emissão" and might be on a line with other information. For example, in a line like "Número: 9911 Série: 114 Emissão: 29/06/2025 19:50:29" or "Emissão: 03/08/2025 13:01:23", extract "29/06/2025" or "03/08/2025". Format it as YYYY-MM-DD.
  - **Discount**: Look for a line item labeled 'Descontos R$', often near the end of the receipt, and extract the numeric value.
  - **Access Key (Chave de Acesso)**: Find the long numeric string labeled "Chave de Acesso" or "Chave de acesso", which is often at the end of the document. It may have spaces between the numbers (e.g., "4225 0882 9561 6000 4241 6516 9000 0636 3717 0701 9462").
  - **Store type**: Try to identify based on the store name if it is a supermarket, convenience store, marketplace, pharmacy or other retail type.

  **Product Extraction Rules:**
  - The products are in a table that may span multiple pages. For each product, extract all fields.
  - **Item Unification**: If a product with the same barcode appears multiple times on the receipt, you must unify them into a single item. Sum the quantities ("Qtde.") and the total prices ("Vl. Total"). Use the name and unit price from the first occurrence.
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

  Now, analyze the following receipt PDF and extract the information into the specified JSON format.
  Receipt PDF: {{media url=pdfDataUri}}
  `,
});

const extractDataFromPdfFlow = ai.defineFlow(
    {
        name: 'extractDataFromPdfFlow',
        inputSchema: ExtractDataFromPdfInputSchema,
        outputSchema: ExtractDataFromPdfOutputSchema,
    },
    async (input: ExtractDataFromPdfInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
