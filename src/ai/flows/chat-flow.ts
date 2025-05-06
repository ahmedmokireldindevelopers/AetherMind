'use server';
/**
 * @fileOverview A Genkit flow for handling chat messages with an AI assistant.
 *
 * - sendMessageToAI - A function that processes a user message and returns an AI response.
 * - ChatMessageInput - The input type for the sendMessageToAI function.
 * - ChatMessageOutput - The return type for the sendMessageToAI function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import Handlebars from 'handlebars'; // Import Handlebars

// Register Handlebars helper for equality check *early*
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});


// Define the structure for a single message in history
const HistoryMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

// Define agent types
const AgentTypeSchema = z.enum(['general', 'database']).default('general');
export type AgentType = z.infer<typeof AgentTypeSchema>;

// Define the input schema for the chat message
const ChatMessageInputSchema = z.object({
  message: z.string().describe('The user\'s message to the AI assistant.'),
  history: z.array(HistoryMessageSchema).optional().describe('Previous messages in the conversation history.'),
  agentType: AgentTypeSchema.optional().describe('The type of AI agent persona to use (e.g., general, database expert).'),
  fileDataUri: z.string().optional().describe(
    "Optional file data attached by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;

// Define the output schema for the AI response
const ChatMessageOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user\'s message.'),
});
export type ChatMessageOutput = z.infer<typeof ChatMessageOutputSchema>;

// Exported function to be called by the frontend
export async function sendMessageToAI(input: ChatMessageInput): Promise<ChatMessageOutput> {
  return chatFlow(input);
}

// Internal schema used by the prompt, including preprocessed flags
const ProcessedChatMessageInputSchema = z.object({
    message: z.string(),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        isUser: z.boolean().optional(), // Flag for user role
        isAssistant: z.boolean().optional(), // Flag for assistant role
    })).optional(),
    agentType: AgentTypeSchema, // Pass agent type to prompt
    fileDataUri: z.string().optional(), // Pass file URI to prompt
});

// Define the Genkit prompt using the processed schema
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ProcessedChatMessageInputSchema }, // Use the processed schema
  output: { schema: ChatMessageOutputSchema },
  prompt: `{{#if (eq agentType 'database')}}
You are AetherMind, an AI assistant specializing in databases within a data and model management platform. Your goal is to assist users with tasks related to database connectors, query optimization, schema understanding, and data management. Be concise and technically accurate.
{{else}}
You are AetherMind, a helpful AI assistant integrated within a data and model management platform. Your goal is to assist users with their tasks related to data connectors, model management, synchronization, data cleaning, and understanding the platform. Be concise and helpful.
{{/if}}

{{#if history}}Conversation History:
{{#each history}}
{{#if isUser}}User: {{content}}{{/if}}
{{#if isAssistant}}Assistant: {{content}}{{/if}}
{{/each}}
{{/if}}

Current User Message:
{{{message}}}
{{#if fileDataUri}}
Attached File: {{media url=fileDataUri}}
(Analyze the attached file if relevant to the user's message.)
{{/if}}

Assistant Response:
`,
});

// Define the Genkit flow
const chatFlow = ai.defineFlow<
  typeof ChatMessageInputSchema,
  typeof ChatMessageOutputSchema
>(
  {
    name: 'chatFlow',
    inputSchema: ChatMessageInputSchema,
    outputSchema: ChatMessageOutputSchema,
  },
  async (input) => {
    // Preprocess history to add boolean flags for Handlebars compatibility
    const processedHistory = input.history?.map(msg => ({
        ...msg,
        isUser: msg.role === 'user',
        isAssistant: msg.role === 'assistant',
    }));

    // Prepare input for the prompt using the processed history and other fields
    const promptInput: z.infer<typeof ProcessedChatMessageInputSchema> = {
        message: input.message,
        history: processedHistory,
        agentType: input.agentType || 'general', // Default to general if not provided
        fileDataUri: input.fileDataUri,
    };

    // Call the prompt with the processed input
    const { output } = await chatPrompt(promptInput);

    if (!output) {
        throw new Error("AI did not return a valid response.");
    }

    return output;
  }
);

// Removed Handlebars registration from here as it was moved to the top
