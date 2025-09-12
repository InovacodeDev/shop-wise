import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

export const ai = genkit({
    plugins: [googleAI() as unknown as any],
    model: 'googleai/gemini-2.5-flash',
});
