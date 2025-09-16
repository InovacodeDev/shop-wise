/**
 * @fileOverview This file defines a Genkit flow to extract product data from a receipt photo.
 *
 * It includes:
 * - `extractFromReceiptPhoto`: An async function that takes a receipt photo data URI and returns the extracted product information.
 * - `ExtractFromReceiptPhotoInput`: The input type for the `extractFromReceiptPhoto` function, defining the receipt photo data URI.
 * - `ExtractFromReceiptPhotoOutput`: The output type for the `extractFromReceiptPhoto` function, defining the extracted product information.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractFromReceiptPhotoInputSchema = z.object({
    receiptImage: z.string().describe(
        "A receipt photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:image/<format>;base64,<encoded_data>'. Supported formats: jpeg, jpg, png, webp.",
        /* e.g., data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAH
ElEQVQI12P4//8/w+bOnUAAAAA//LuF9sRi9gAAAABJRU5ErkJggg== */
    ),
});
export type ExtractFromReceiptPhotoInput = z.infer<typeof ExtractFromReceiptPhotoInputSchema>;

const ExtractFromReceiptPhotoOutputSchema = z.object({
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
    purchaseType: z
        .enum(['iFood', '99', 'store', 'marketplace', 'online_store'])
        .optional()
        .describe(
            "The purchase context/type. Use 'iFood' for iFood app orders, '99' for 99Food or 99 app orders, 'store' for in-person store purchases, 'marketplace' for marketplace aggregators, and 'online_store' for direct e-commerce stores.",
        ),
    type: z
        .string()
        .describe('The type of store, e.g., supermarket, convenience store, marketplace, pharmacy, etc.')
        .default('supermarket'),
    warnings: z
        .array(z.string())
        .optional()
        .describe('Validation warnings about photo quality, completeness, or readability issues.'),
});
export type ExtractFromReceiptPhotoOutput = z.infer<typeof ExtractFromReceiptPhotoOutputSchema>;

export async function extractFromReceiptPhoto(
    input: ExtractFromReceiptPhotoInput,
): Promise<ExtractFromReceiptPhotoOutput> {
    return await extractFromReceiptPhotoFlow(input);
}

const prompt = ai.definePrompt({
    name: 'extractFromReceiptPhotoPrompt',
    input: { schema: ExtractFromReceiptPhotoInputSchema },
    output: { schema: ExtractFromReceiptPhotoOutputSchema },
    prompt: `You are an expert data extractor specializing in extracting data from Brazilian Nota Fiscal de Consumidor Eletrônica (NFC-e) receipt photos and images.

  You will analyze the receipt photo/image to extract comprehensive NFCe information including store details, purchase data, and all products. It is critical that you extract ALL products and NFCe metadata.

  **Data Extraction Rules:**
  - **Store Name**: Look for the emitter's name, usually at the top. (e.g., "SDB COMERCIO DE ALIMENTOS LTDA")
  - **CNPJ**: Look for the emitter's CNPJ. (e.g., "09.477.652/0090-61")
  - **Address**: Look for the emitter's full address. If possible, infer the latitude and longitude. (e.g., "SC401 RF JOSE CARLOS DAUX, 9580, STO ANTONIO DE LISBOA, FLORIANOPOLIS, SC")
  - **Date**: Find the emission date. Format it as YYYY-MM-DD.
  - **NFCe Number**: Extract the NFCe number (e.g., "9911")
  - **Series**: Extract the series number (e.g., "114")
  - **Emission Date/Time**: Extract the full emission date and time (e.g., "29/06/2025 19:50:29")
  - **Authorization Protocol**: Look for "Protocolo de Autorização" or similar field
  - **Total Amount**: Extract the total purchase amount
  - If the receipt is from iFood or contains iFood-specific fields, compute the total as follows:
    - Prefer the field labeled 'Pagamento via iFood' when present.
    - Otherwise compute: ('Valor total do pedido' + 'Taxa de serviço' + 'Taxa de entrega') - ('Desconto da loja' + 'Incentivos iFood').
    - Normalize values with Brazilian decimal separators (e.g., "+R$ 14,90" -> 14.90). Return this computed value in 'totalAmount'.
  - **Payment Method**: Look for payment method information (Cartão, Dinheiro, PIX, etc.)
  - **Amount Paid**: Extract the amount paid if different from total
  - **Store Type**: Determine store type (supermarket, convenience store, marketplace, pharmacy, etc.)
  - **Discount**: Look for a line item labeled 'Descontos R$' and extract the numeric value.
  - **Access Key (Chave de Acesso)**: Find the long numeric string labeled "Chave de Acesso" or "Chave de acesso". It may have spaces between the numbers (e.g., "4225 0882 9561 6000 4241 6516 9000 0636 3717 0701 9462").

  **Purchase Type Inference:**
  - Set 'purchaseType' according to the context detected on the receipt:
    - 'iFood' if the receipt references iFood (e.g., 'iFood', 'Pagamento via iFood', iFood branding, delivery app context).
    - '99' for 99Food/99 app.
    - 'online_store' for direct e-commerce merchants.
    - 'marketplace' for marketplace aggregators (e.g., marketplaces distinct from delivery apps).
    - Otherwise default to 'store' for in-person store purchases.

  **Product Extraction Rules:**
  - The products are in a table or list format. For each product, extract all fields.
  - **Item Unification**: If a product with the same barcode appears multiple times on the receipt, you must unify them into a single item. Sum the quantities ("Qtde.") and the total prices ("Vl. Total"). Use the name and unit price from the first occurrence.
  - **Price**: Use "Vl. Unit." for the 'unitPrice' field. Use "Vl. Total" for the 'price' field. This is critical for correct financial analysis.
  - **Brand**: Infer the product's brand from its name. If no brand is evident, leave it empty.
  - **Category/Subcategory**: Classify each product into a category and subcategory from the comprehensive list below. Be as specific as possible.

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

  **iFood purchases:**
  - If the receipt references iFood (e.g., "iFood", "Pagamento via iFood", iFood branding, delivery app context), set:
    - the 'purchaseType' to 'iFood';
    - the 'storeType' to 'marketplace';
    - the 'storeName' to 'iFood';
    - the 'cnpj' to '14.380.200/0001-21' (iFood's CNPJ).
    - the 'address' to 'Avenida dos Autonomistas, 1496 - Vila Yara, Osasco - SP, 06020-902'

  **Photo Quality Validation:**
  Add validation warnings to the "warnings" array if you detect any of the following issues:
  - "Photo is blurry or text is not clearly readable" - if the image quality makes text difficult to read
  - "Receipt appears to be cut off or incomplete" - if parts of the receipt are not visible
  - "Poor lighting makes some text unreadable" - if lighting issues affect readability
  - "Multiple receipts detected in image" - if more than one receipt is visible
  - "Image does not appear to be a valid NFCe receipt" - if this doesn't look like a Brazilian fiscal receipt
  - "Some product information may be missing due to image quality" - if you can't extract complete product data
  
  If the photo quality is acceptable and all information is clearly visible, leave the warnings array empty or omit it.

  Now, analyze the following receipt photo and extract the information into the specified JSON format.
  Receipt Photo: {{media url=receiptImage}}
  `,
});

const extractFromReceiptPhotoFlow = ai.defineFlow(
    {
        name: 'extractFromReceiptPhotoFlow',
        inputSchema: ExtractFromReceiptPhotoInputSchema,
        outputSchema: ExtractFromReceiptPhotoOutputSchema,
    },
    async (input: ExtractFromReceiptPhotoInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
