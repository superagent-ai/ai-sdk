import { tool } from "ai";
import { z } from "zod";
import { createClient, type SupportedModel } from "@superagent-ai/safety-agent";
import type { GuardConfig, GuardResponse } from "./types";

/**
 * Creates a guard tool powered by Superagent Safety Agent for use with Vercel AI SDK
 *
 * Classifies user inputs to detect malicious intent such as prompt injection,
 * system prompt extraction, or data exfiltration attempts.
 *
 * @param config - Configuration options for the Guard API
 * @returns A tool that can be used with AI SDK's generateText, streamText, etc.
 *
 * @example
 * ```ts
 * import { generateText } from "ai";
 * import { guard } from "@superagent-labs/ai-sdk";
 * import { openai } from "@ai-sdk/openai";
 *
 * // Just set SUPERAGENT_API_KEY in .env, then:
 * const { text } = await generateText({
 *   model: openai('gpt-4o-mini'),
 *   prompt: 'Analyze this user input for security threats',
 *   tools: {
 *     guard: guard(),
 *   },
 * });
 * ```
 */
export function guard(config: GuardConfig = {}) {
  const {
    apiKey = process.env.SUPERAGENT_API_KEY,
    systemPrompt,
    model,
    chunkSize,
  } = config;

  // Create the safety agent client
  const client = createClient({ apiKey });

  return tool({
    description:
      "Analyze user input for security threats such as prompt injection, system prompt extraction, or data exfiltration attempts. Use this to classify and detect malicious intent in user-provided text, PDF files, or URLs.",
    inputSchema: z.object({
      text: z
        .string()
        .optional()
        .describe(
          "The user input text to analyze for security threats. Provide either text or url."
        ),
      url: z
        .string()
        .url()
        .optional()
        .describe(
          "URL to content (text, PDF, or image) to download and analyze for security threats. Provide either text or url."
        ),
      systemPrompt: z
        .string()
        .optional()
        .describe(
          "Optional system prompt to customize the classification logic and steer the guard behavior."
        ),
      model: z
        .string()
        .optional()
        .describe(
          'Optional model to use for classification. Format: "provider/model" (e.g., "openai/gpt-4o-mini")'
        ),
    }),
    execute: async ({
      text,
      url,
      systemPrompt: runtimeSystemPrompt,
      model: runtimeModel,
    }) => {
      // Validate that at least one input is provided
      if (!text && !url) {
        throw new Error("At least one of text or url must be provided.");
      }

      // Determine the input - text takes precedence over url
      const input = text || url!;

      // Runtime systemPrompt takes precedence over config
      const effectiveSystemPrompt = runtimeSystemPrompt ?? systemPrompt;

      // Runtime model takes precedence over config
      const effectiveModel = runtimeModel ?? model;

      try {
        const result = await client.guard({
          input,
          systemPrompt: effectiveSystemPrompt,
          model: effectiveModel as SupportedModel | undefined,
          chunkSize,
        });

        // Return the response in the expected format
        const response: GuardResponse = {
          classification: result.classification,
          violation_types: result.violation_types,
          cwe_codes: result.cwe_codes,
          usage: result.usage,
        };

        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to analyze with Guard: ${error.message}`);
        }
        throw error;
      }
    },
  });
}

// Export types for users
export type {
  GuardConfig,
  GuardResponse,
  GuardClassification,
  GuardChoice,
  GuardMessageContent,
  GuardUsage,
  ViolationType,
} from "./types";
