/**
 * @fileOverview This file defines a Genkit flow to extract product data from a
scanned receipt QR code.
 *
 * It includes:
 * - `extractProductData`: An async function that takes a receipt QR code data U
RI and returns the extracted product information.
 * - `ExtractProductDataInput`: The input type for the `extractProductData` func
tion, defining the receipt QR code data URI.
 * - `ExtractProductDataOutput`: The output type for the `extractProductData` fu
nction, defining the extracted product information.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractProductDataInputSchema = z.object({
    receiptImage: z.string().describe(
        "A receipt QR code, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.",
        /* e.g., data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAH
ElEQVQI12P4//8/w+bOnUAAAAA//LuF9sRi9gAAAABJRU5ErkJggg== */
    ),
});
export type ExtractProductDataInput = z.infer<typeof ExtractProductDataInputSchema>;

const ExtractProductDataOutputSchema = z.object({
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
});
export type ExtractProductDataOutput = z.infer<typeof ExtractProductDataOutputSchema>;

export async function extractProductData(input: ExtractProductDataInput): Promise<ExtractProductDataOutput> {
    return await extractProductDataFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractProductDataPrompt',
    input: { schema: ExtractProductDataInputSchema },
    output: { schema: ExtractProductDataOutputSchema },
    prompt: `You are an expert data extractor specializing in extracting data from Brazilian Nota Fiscal de Consumidor Eletrônica (NFC-e) receipts.

  You will use the information from the receipt's QR code to extract the store name, purchase date, and a list of all products. It is critical that you extract ALL products listed on the receipt.

  **Data Extraction Rules:**
  - **Store Name**: Look for the emitter's name, usually at the top. (e.g., "SDB COMERCIO DE ALIMENTOS LTDA")
  - **CNPJ**: Look for the emitter's CNPJ. (e.g., "09.477.652/0090-61")
  - **Address**: Look for the emitter's full address. If possible, infer the latitude and longitude. (e.g., "SC401 RF JOSE CARLOS DAUX, 9580, STO ANTONIO DE LISBOA, FLORIANOPOLIS, SC")
  - **Date**: Find the emission date. It is often labeled "Emissão" and might be on a line with other information. For example, in a line like "Número: 9911 Série: 114 Emissão: 29/06/2025 19:50:29" or "Emissão: 03/08/2025 13:01:23", extract "29/06/2025" or "03/08/2025". Format it as YYYY-MM-DD.
  - **Discount**: Look for a line item labeled 'Descontos R$' and extract the numeric value.
  - **Access Key (Chave de Acesso)**: Find the long numeric string labeled "Chave de Acesso" or "Chave de acesso". It may have spaces between the numbers (e.g., "4225 0882 9561 6000 4241 6516 9000 0636 3717 0701 9462"). The QR Code URL itself usually contains this key.

  **Product Extraction Rules:**
  - The products are in a table. For each product, extract all fields.
  - **Item Unification**: If a product with the same barcode appears multiple times on the receipt, you must unify them into a single item. Sum the quantities ("Qtde.") and the total prices ("Vl. Total"). Use the name and unit price from the first occurrence.
  - **Price**: Use "Vl. Unit." for the 'unitPrice' field. Use "Vl. Total" for the 'price' field. This is critical for correct financial analysis.
  - **Brand**: Infer the product's brand from its name. If no brand is evident, leave it empty.
  - **Category/Subcategory**: Classify each product into a category and subcategory from the list below. Be as specific as possible. If a product doesn't fit, use your best judgment.

  **Categories List:**
  - **Hortifrúti e Ovos**:
    - **Frutas**: Maçã, Banana, Laranja, Mamão, Uva, Morango, Pera, etc.
    - **Legumes**: Batata, Tomate, Cenoura, Cebola, Alho, Abobrinha, Pimentão.
    - **Verduras e Folhas**: Alface, Couve, Rúcula, Espinafre, Repolho.
    - **Temperos Frescos**: Salsinha, Cebolinha, Coentro, Manjericão, Hortelã.
    - **Ovos**: Branco, Vermelho, de Codorna.
  - **Açougue e Peixaria**:
    - **Carnes Bovinas**: Bife, Carne Moída, Acém, Picanha, Costela.
    - **Aves**: Frango (inteiro, filé, coxa, sobrecoxa), Peru.
    - **Carnes Suínas**: Lombo, Bisteca, Linguiça, Bacon.
    - **Peixes e Frutos do Mar**: Salmão, Tilápia, Sardinha, Camarão.
  - **Padaria e Confeitaria**:
    - **Pães**: Pão Francês, Pão de Forma, Pão Integral, Bisnaguinha.
    - **Bolos e Tortas**: Bolos prontos, fatias de torta.
    - **Salgados**: Pão de Queijo, Coxinha, Esfiha, Joelhinho.
    - **Frios e Embutidos Fatiados**: Queijo Mussarela, Presunto, Peito de Peru, Salame.
    - **Torradas e Croutons**.
  - **Laticínios e Frios**:
    - **Leites**: Integral, Desnatado, Semidesnatado, Leites Vegetais (aveia, amêndoa).
    - **Queijos**: Minas, Prato, Parmesão, Gorgonzola, Cottage.
    - **Iogurtes**: Natural, Grego, com Frutas, Bebidas Lácteas.
    - **Manteiga e Margarina**.
    - **Requeijão e Cream Cheese**.
    - **Nata e Creme de Leite Fresco**.
  - **Mercearia**:
    - **Grãos e Cereais**: Arroz, Feijão, Lentilha, Grão-de-bico, Quinoa.
    - **Massas**: Macarrão (espaguete, penne), Lasanha, Nhoque.
    - **Farináceos**: Farinha de Trigo, Farinha de Rosca, Farofa, Amido de Milho.
    - **Açúcar e Adoçantes**.
    - **Óleos, Azeites e Vinagres**.
    - **Enlatados e Conservas**: Milho, Ervilha, Seleta de Legumes, Palmito, Azeitona, Atum, Sardinha.
    - **Molhos e Temperos**: Molho de Tomate, Ketchup, Maionese, Mostarda, Sal, Pimenta, Temperos secos (orégano, louro), Caldos.
    - **Sopas e Cremes**.
  - **Matinais e Doces**:
    - **Café, Chás e Achocolatados em Pó**.
    - **Cereais Matinais e Granola**.
    - **Biscoitos e Bolachas**: Salgados, Doces, Recheados, Wafers.
    - **Geleias e Cremes**: Geleia de frutas, Creme de avelã.
    - **Doces e Sobremesas**: Leite Condensado, Creme de Leite, Gelatina, Chocolate (em barra, em pó), Balas, Mel.
  - **Congelados**:
    - **Pratos Prontos**: Lasanha, Pizza, Escondidinho.
    - **Salgados Congelados**: Pão de Queijo, Nuggets, Hambúrguer.
    - **Legumes Congelados**: Brócolis, Couve-flor, Ervilha.
    - **Polpas de Frutas**.
    - **Sorvetes e Açaí**.
  - **Bebidas**:
    - **Água**: Mineral com e sem gás.
    - **Sucos**: Naturais, de Caixa, Concentrados, em Pó.
    - **Refrigerantes**.
    - **Chás Prontos e Isotônicos**.
    - **Bebidas Alcoólicas**: Cerveja, Vinho, Destilados (cachaça, vodka, gin).
  - **Limpeza**:
    - **Roupas**: Sabão (em pó/líquido), Amaciante, Alvejante.
    - **Cozinha**: Detergente, Esponja de Aço, Desengordurante, Limpa-vidros.
    - **Banheiro e Geral**: Desinfetante, Água Sanitária, Limpador Multiuso.
    - **Acessórios**: Saco de Lixo, Papel Toalha, Panos, Luvas, Vassoura, Rodo.
  - **Higiene Pessoal**:
    - **Higiene Bucal**: Creme Dental, Escova de Dentes, Fio Dental, Antisséptico Bucal.
    - **Cabelo**: Shampoo, Condicionador, Creme de Tratamento.
    - **Corpo**: Sabonete (em barra/líquido), Desodorante, Hidratante Corporal.
    - **Cuidados com o Rosto**: Sabonete facial, Protetor Solar.
    - **Higiene Íntima e Absorventes**.
    - **Papel Higiênico e Lenços de Papel**.
    - **Barbearia**: Lâminas, Creme de barbear.
  - **Bebês e Crianças**:
    - **Fraldas e Lenços Umedecidos**.
    - **Alimentação Infantil**: Papinhas, Leite em Pó, Composto Lácteo.
    - **Higiene Infantil**: Shampoo, Sabonete, Pomada para assaduras.
  - **Pet Shop**:
    - **Alimentação**: Ração, Sachês, Petiscos.
    - **Higiene**: Areia Sanitária, Tapetes Higiênicos, Shampoo.
  - **Utilidades e Bazar**:
    - **Cozinha**: Papel Alumínio, Filme Plástico, Potes.
    - **Geral**: Pilhas, Lâmpadas, Velas, Fósforos.
    - **Churrasco**: Carvão, Acendedor, Sal Grosso.
  - **Farmácia**:
    - **Medicamentos e Saúde**.
    - **Primeiros Socorros**.
    - **Higiene e Beleza Pessoal**.
    - **Aparelhos e Acessórios de Saúde**.

  **Example of a product line:**
  "SALSICHA AURORA 500G (Código: 7891164005412) | Qtde.:1 UN | Vl. Unit.: 8,99 | Vl. Total: 8,99"
  **Should be extracted as:**
  {
    barcode: "7891164005412",
    name: "SALSICHA AURORA 500G",
    quantity: 1,
    volume: "UN",
    unitPrice: 8.99,
    price: 8.99,
    brand: "Aurora",
    category: "Açougue e Peixaria",
    subcategory: "Carnes Suínas"
  }

  Now, analyze the following receipt data and extract the information into the specified JSON format.
  Use the following as the primary source of information about the receipt.
  Receipt QR Code: {{media url=receiptImage}}
  `,
});

const extractProductDataFlow = ai.defineFlow(
    {
        name: 'extractProductDataFlow',
        inputSchema: ExtractProductDataInputSchema,
        outputSchema: ExtractProductDataOutputSchema,
    },
    async (input: ExtractProductDataInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
