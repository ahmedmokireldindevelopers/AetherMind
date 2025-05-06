'use server';
/**
 * @fileOverview An AI agent that recommends the most performant AI model for given data.
 *
 * - recommendModel - A function that recommends the most performant AI model.
 * - RecommendModelInput - The input type for the recommendModel function.
 * - RecommendModelOutput - The return type for the recommendModel function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RecommendModelInputSchema = z.object({
  dataDescription: z.string().describe('A description of the data to be used with the AI model.'),
  performanceRequirements: z.string().describe('The performance requirements for the AI model.'),
});
export type RecommendModelInput = z.infer<typeof RecommendModelInputSchema>;

const RecommendModelOutputSchema = z.object({
  recommendedModel: z.string().describe('The name of the recommended AI model.'),
  reasoning: z.string().describe('The reasoning behind the model recommendation.'),
});
export type RecommendModelOutput = z.infer<typeof RecommendModelOutputSchema>;

export async function recommendModel(input: RecommendModelInput): Promise<RecommendModelOutput> {
  return recommendModelFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendModelPrompt',
  input: {
    schema: z.object({
      dataDescription: z.string().describe('A description of the data to be used with the AI model.'),
      performanceRequirements: z.string().describe('The performance requirements for the AI model.'),
    }),
  },
  output: {
    schema: z.object({
      recommendedModel: z.string().describe('The name of the recommended AI model.'),
      reasoning: z.string().describe('The reasoning behind the model recommendation.'),
    }),
  },
  prompt: `You are an AI model recommendation expert. Given the following data description and performance requirements, recommend the most performant AI model.

Data Description: {{{dataDescription}}}
Performance Requirements: {{{performanceRequirements}}}

Consider models like PyTorch, TensorFlow, and JAX. Explain your reasoning for the recommendation.
`,
});

const recommendModelFlow = ai.defineFlow<
  typeof RecommendModelInputSchema,
  typeof RecommendModelOutputSchema
>({
  name: 'recommendModelFlow',
  inputSchema: RecommendModelInputSchema,
  outputSchema: RecommendModelOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
