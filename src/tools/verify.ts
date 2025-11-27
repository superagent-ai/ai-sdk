import { tool } from "ai";
import { z } from "zod";
import type { VerifyConfig, VerifyResponse } from "./types";

/**
 * Creates a verify tool powered by Superagent for use with Vercel AI SDK
 *
 * Fact-checks text by verifying claims against provided source materials.
 *
 * @param config - Configuration options for the Verify API
 * @returns A tool that can be used with AI SDK's generateText, streamText, etc.
 *
 * @example
 * ```ts
 * import { generateText } from "ai";
 * import { verify } from "@superagent/ai-sdk";
 * import { openai } from "@ai-sdk/openai";
 *
 * // Just set SUPERAGENT_API_KEY in .env, then:
 * const { text } = await generateText({
 *   model: openai('gpt-4o-mini'),
 *   prompt: 'Verify the claims in this text against the provided sources',
 *   tools: {
 *     verify: verify(),
 *   },
 * });
 * ```
 */
export function verify(config: VerifyConfig = {}) {
  const { apiKey = process.env.SUPERAGENT_API_KEY } = config;

  return tool({
    description:
      "Fact-check text by verifying claims against provided source materials. Use this to validate statements, check accuracy of information, and identify unsupported claims.",
    inputSchema: z.object({
      text: z.string().min(1).describe("The text containing claims to verify"),
      sources: z
        .array(
          z.object({
            name: z.string().describe("Name/title of the source"),
            content: z.string().describe("The content of the source material"),
            url: z
              .string()
              .url()
              .optional()
              .describe("Optional URL reference for the source"),
          })
        )
        .min(1)
        .describe("Array of source materials to verify claims against"),
    }),
    execute: async ({ text, sources }) => {
      if (!apiKey) {
        throw new Error(
          "SUPERAGENT_API_KEY is required. Set it in environment variables or pass it in config."
        );
      }

      const requestBody = { text, sources };

      try {
        const response = await fetch("https://app.superagent.sh/api/verify", {
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
            `Verify API error: ${response.status} - ${errorText}`
          );
        }

        const data = (await response.json()) as VerifyResponse;
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to verify with Superagent: ${error.message}`);
        }
        throw error;
      }
    },
  });
}

// Export types for users
export type {
  VerifyConfig,
  VerifyResponse,
  VerifyChoice,
  VerifyUsage,
  VerifySource,
  VerifyClaim,
  VerifyMessageContent,
  ClaimSourceRef,
} from "./types";
