import { tool } from "ai";
import { z } from "zod";
import { createClient, type SupportedModel } from "@superagent-ai/safety-agent";
import type { RedactConfig, RedactResponse } from "./types";

/**
 * Creates a redact tool powered by Superagent Safety Agent for use with Vercel AI SDK
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
 * import { redact } from "@superagent-ai/ai-sdk";
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
  const {
    apiKey = process.env.SUPERAGENT_API_KEY,
    entities,
    model: configModel,
    rewrite,
  } = config;

  // Create the safety agent client
  const client = createClient({ apiKey });

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
      model: z
        .string()
        .optional()
        .describe(
          'Model to use for redaction. Format: "provider/model" (e.g., "openai/gpt-4o-mini"). Required if not set in config.'
        ),
      rewrite: z
        .boolean()
        .optional()
        .describe(
          "When true, rewrites text contextually instead of using placeholders. Default: false"
        ),
    }),
    execute: async ({
      text,
      entities: inputEntities,
      model: inputModel,
      rewrite: inputRewrite,
    }) => {
      // Use input entities, fall back to config entities
      const entitiesToUse = inputEntities || entities;

      // Use input model, fall back to config model
      const modelToUse = inputModel || configModel;

      if (!modelToUse) {
        throw new Error(
          "Model is required for redaction. Provide it in the tool call or in the config."
        );
      }

      // Use input rewrite, fall back to config rewrite
      const rewriteToUse = inputRewrite ?? rewrite;

      try {
        const result = await client.redact({
          input: text,
          model: modelToUse as SupportedModel,
          entities: entitiesToUse,
          rewrite: rewriteToUse,
        });

        // Return the response in the expected format
        const response: RedactResponse = {
          redacted: result.redacted,
          findings: result.findings,
          usage: result.usage,
        };

        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(
            `Failed to redact with Safety Agent: ${error.message}`
          );
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
