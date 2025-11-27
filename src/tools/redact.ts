import { tool } from "ai";
import { z } from "zod";
import type { RedactConfig, RedactResponse } from "./types";

/**
 * Creates a redact tool powered by Superagent for use with Vercel AI SDK
 *
 * Analyzes text and redacts sensitive information such as SSNs, emails,
 * phone numbers, and other PII/PHI.
 *
 * @param config - Configuration options for the Redact API
 * @returns A tool that can be used with AI SDK's generateText, streamText, etc.
 *
 * @example
 * ```ts
 * import { generateText } from "ai";
 * import { redact } from "@superagent/ai-sdk";
 * import { openai } from "@ai-sdk/openai";
 *
 * // Just set SUPERAGENT_API_KEY in .env, then:
 * const { text } = await generateText({
 *   model: openai('gpt-4o-mini'),
 *   prompt: 'Redact PII from this text: My email is john@example.com',
 *   tools: {
 *     redact: redact(),
 *   },
 * });
 * ```
 */
export function redact(config: RedactConfig = {}) {
  const { apiKey = process.env.SUPERAGENT_API_KEY, entities } = config;

  return tool({
    description:
      "Remove sensitive information (PII/PHI) from text. Redacts SSNs, emails, phone numbers, addresses, and other personally identifiable information. Use this to sanitize user data before processing or storage.",
    inputSchema: z.object({
      text: z
        .string()
        .min(1)
        .describe("The text content to be analyzed and redacted"),
      entities: z
        .array(z.string())
        .optional()
        .describe(
          "Optional array of custom entity types to redact. If not provided, defaults to standard PII entities (SSNs, emails, phone numbers, etc.)"
        ),
    }),
    execute: async ({ text, entities: inputEntities }) => {
      if (!apiKey) {
        throw new Error(
          "SUPERAGENT_API_KEY is required. Set it in environment variables or pass it in config."
        );
      }

      // Build request body
      const requestBody: { text: string; entities?: string[] } = { text };

      // Use input entities, fall back to config entities
      const entitiesToUse = inputEntities || entities;
      if (entitiesToUse && entitiesToUse.length > 0) {
        requestBody.entities = entitiesToUse;
      }

      try {
        const response = await fetch("https://app.superagent.sh/api/redact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Redact API error: ${response.status} - ${errorText}`
          );
        }

        const data = (await response.json()) as RedactResponse;
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to redact with Superagent: ${error.message}`);
        }
        throw error;
      }
    },
  });
}

// Export types for users
export type {
  RedactConfig,
  RedactResponse,
  RedactChoice,
  RedactUsage,
} from "./types";
