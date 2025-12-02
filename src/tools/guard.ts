import { tool } from "ai";
import { z } from "zod";
import type { GuardConfig, GuardResponse } from "./types";

/**
 * Creates a guard tool powered by Superagent for use with Vercel AI SDK
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
 * import { guard } from "@superagent/ai-sdk";
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
  const { apiKey = process.env.SUPERAGENT_API_KEY, systemPrompt } = config;

  return tool({
    description:
      "Analyze user input for security threats such as prompt injection, system prompt extraction, or data exfiltration attempts. Use this to classify and detect malicious intent in user-provided text, PDF files, or URLs.",
    inputSchema: z.object({
      text: z
        .string()
        .optional()
        .describe(
          "The user input text to analyze for security threats. Provide either text, file, or url."
        ),
      file: z
        .string()
        .optional()
        .describe(
          "Base64-encoded PDF file to analyze (format: data:application/pdf;base64,...). Provide either text, file, or url."
        ),
      url: z
        .string()
        .url()
        .optional()
        .describe(
          "URL to a PDF file to download and analyze for security threats. Provide either text, file, or url."
        ),
      systemPrompt: z
        .string()
        .optional()
        .describe(
          "Optional system prompt to customize the classification logic and steer the guard behavior."
        ),
    }),
    execute: async ({ text, file, url, systemPrompt: runtimeSystemPrompt }) => {
      if (!apiKey) {
        throw new Error(
          "SUPERAGENT_API_KEY is required. Set it in environment variables or pass it in config."
        );
      }

      // Validate that at least one input is provided
      if (!text && !file && !url) {
        throw new Error("At least one of text, file, or url must be provided.");
      }

      // Build request body
      const requestBody: Record<string, string> = {};

      if (text) {
        requestBody.text = text;
      }

      if (file) {
        requestBody.file = file;
      }

      if (url) {
        requestBody.url = url;
      }

      // Runtime systemPrompt takes precedence over config
      const effectiveSystemPrompt = runtimeSystemPrompt ?? systemPrompt;
      if (effectiveSystemPrompt) {
        requestBody.system_prompt = effectiveSystemPrompt;
      }

      try {
        const response = await fetch("https://app.superagent.sh/api/guard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Guard API error: ${response.status} - ${errorText}`);
        }

        const data = (await response.json()) as GuardResponse;
        return data;
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
