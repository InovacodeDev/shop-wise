/**
 * @fileOverview This file defines a Genkit flow to analyze monthly consumption
data and generate insights.
 *
 * It includes:
 * - `analyzeConsumptionData`: An async function that takes consumption data and
 returns a textual analysis.
 * - `AnalyzeConsumptionDataInput`: The input type for the `analyzeConsumptionDa
ta` function.
 * - `AnalyzeConsumptionDataOutput`: The output type for the `analyzeConsumption
Data` function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeConsumptionDataInputSchema = z.object({
    consumptionData: z
        .string()
        .describe(
            'A JSON string representing an array of monthly consumption data. Each object should have a "month" and keys for each spending category.',
        ),
    language: z.string().optional().describe("The language for the analysis output, e.g., 'en', 'pt-BR'."),
});
export type AnalyzeConsumptionDataInput = z.infer<typeof AnalyzeConsumptionDataInputSchema>;

const AnalyzeConsumptionDataOutputSchema = z.object({
    analysis: z
        .string()
        .describe(
            'A detailed, yet concise, textual analysis of the consumption data, explaining monthly variations and trends.',
        ),
});
export type AnalyzeConsumptionDataOutput = z.infer<typeof AnalyzeConsumptionDataOutputSchema>;

export async function analyzeConsumptionData(
    input: AnalyzeConsumptionDataInput,
): Promise<AnalyzeConsumptionDataOutput> {
    return await analyzeConsumptionDataFlow(input);
}

const prompt = ai.definePrompt({
    name: 'analyzeConsumptionDataPrompt',
    input: { schema: AnalyzeConsumptionDataInputSchema },
    output: { schema: AnalyzeConsumptionDataOutputSchema },
    prompt: `Você é um analista financeiro especialista em finanças pessoais e compras de supermercado. Sua tarefa é analisar os dados de consumo mensal de uma família e gerar um texto de análise claro, conciso e bem formatado.

Use **Markdown** para formatar sua resposta.

**Instruções de Análise:**
1.  **Resumo Geral**: Comece com um resumo geral identificando o mês de **maior** e **menor** gasto total.
2.  **Análise Mensal Detalhada**: Para cada mês com uma variação notável, destaque as categorias que mais contribuíram para aumentos ou reduções. Use listas para clareza.
3.  **Tendências**: Aponte tendências de consumo, como um aumento ou diminuição constante em uma categoria específica ao longo dos meses.
4.  **Conclusão e Insights**: Termine com uma conclusão geral ou um insight prático para a família.

**Formato de Saída (Exemplo):**
\`\`\`markdown
## Resumo do Período
Seu maior gasto foi em **Dezembro**, totalizando **R$ 1.250,00**, impulsionado principalmente por 'Mercearia' e 'Bebidas'. O menor gasto ocorreu em **Agosto**, com **R$ 850,00**.

## Análise Mensal
*   **Setembro**: Houve um aumento de **15%** em relação a Agosto, principalmente devido a um gasto extra de R$ 150,00 na categoria 'Açougue e Peixaria'.
*   **Outubro**: Seus gastos com 'Limpeza' aumentaram **30%**, enquanto as outras categorias permaneceram estáveis.
*   **Novembro**: Notamos uma tendência de queda nos gastos com 'Hortifrúti', que diminuíram R$ 50,00 em relação à média dos últimos meses.

## Conclusão e Insights
Observamos uma tendência de **aumento gradual** nos seus gastos gerais nos últimos 4 meses. Fique de olho na categoria **'Bebidas'**, que tem aumentado consistentemente.
\`\`\`

**Dados de Consumo para Análise:**
{{{consumptionData}}}

Gere a análise em **{{{language}}}**. Se o idioma não for fornecido, use Português do Brasil.
`,
});

const analyzeConsumptionDataFlow = ai.defineFlow(
    {
        name: 'analyzeConsumptionDataFlow',
        inputSchema: AnalyzeConsumptionDataInputSchema,
        outputSchema: AnalyzeConsumptionDataOutputSchema,
    },
    async (input: AnalyzeConsumptionDataInput) => {
        const { output } = await prompt(input);
        return output!;
    },
);
