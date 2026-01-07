// src/tools/guard.ts
import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@superagent-ai/safety-agent";
function guard(config = {}) {
  const {
    apiKey = process.env.SUPERAGENT_API_KEY,
    systemPrompt,
    model,
    chunkSize
  } = config;
  const client = createClient({ apiKey });
  return tool({
    description: "Analyze user input for security threats such as prompt injection, system prompt extraction, or data exfiltration attempts. Use this to classify and detect malicious intent in user-provided text, PDF files, or URLs.",
    inputSchema: z.object({
      text: z.string().optional().describe(
        "The user input text to analyze for security threats. Provide either text or url."
      ),
      url: z.string().url().optional().describe(
        "URL to content (text, PDF, or image) to download and analyze for security threats. Provide either text or url."
      ),
      systemPrompt: z.string().optional().describe(
        "Optional system prompt to customize the classification logic and steer the guard behavior."
      ),
      model: z.string().optional().describe(
        'Optional model to use for classification. Format: "provider/model" (e.g., "openai/gpt-4o-mini")'
      )
    }),
    execute: async ({
      text,
      url,
      systemPrompt: runtimeSystemPrompt,
      model: runtimeModel
    }) => {
      if (!text && !url) {
        throw new Error("At least one of text or url must be provided.");
      }
      const input = text || url;
      const effectiveSystemPrompt = runtimeSystemPrompt ?? systemPrompt;
      const effectiveModel = runtimeModel ?? model;
      try {
        const result = await client.guard({
          input,
          systemPrompt: effectiveSystemPrompt,
          model: effectiveModel,
          chunkSize
        });
        const response = {
          classification: result.classification,
          violation_types: result.violation_types,
          cwe_codes: result.cwe_codes,
          usage: result.usage
        };
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to analyze with Guard: ${error.message}`);
        }
        throw error;
      }
    }
  });
}

// src/tools/redact.ts
import { tool as tool2 } from "ai";
import { z as z2 } from "zod";
import { createClient as createClient2 } from "@superagent-ai/safety-agent";
function redact(config = {}) {
  const {
    apiKey = process.env.SUPERAGENT_API_KEY,
    entities,
    model: configModel,
    rewrite
  } = config;
  const client = createClient2({ apiKey });
  return tool2({
    description: "Remove sensitive information (PII/PHI) from text. Redacts SSNs, emails, phone numbers, addresses, and other personally identifiable information. Use this to sanitize user data before processing or storage.",
    inputSchema: z2.object({
      text: z2.string().min(1).describe("The text content to be analyzed and redacted"),
      entities: z2.array(z2.string()).optional().describe(
        "Optional array of custom entity types to redact. If not provided, defaults to standard PII entities (SSNs, emails, phone numbers, etc.)"
      ),
      model: z2.string().optional().describe(
        'Model to use for redaction. Format: "provider/model" (e.g., "openai/gpt-4o-mini"). Required if not set in config.'
      ),
      rewrite: z2.boolean().optional().describe(
        "When true, rewrites text contextually instead of using placeholders. Default: false"
      )
    }),
    execute: async ({
      text,
      entities: inputEntities,
      model: inputModel,
      rewrite: inputRewrite
    }) => {
      const entitiesToUse = inputEntities || entities;
      const modelToUse = inputModel || configModel;
      if (!modelToUse) {
        throw new Error(
          "Model is required for redaction. Provide it in the tool call or in the config."
        );
      }
      const rewriteToUse = inputRewrite ?? rewrite;
      try {
        const result = await client.redact({
          input: text,
          model: modelToUse,
          entities: entitiesToUse,
          rewrite: rewriteToUse
        });
        const response = {
          redacted: result.redacted,
          findings: result.findings,
          usage: result.usage
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
    }
  });
}

// src/index.ts
import { createClient as createClient3 } from "@superagent-ai/safety-agent";
export {
  createClient3 as createClient,
  guard,
  redact
};
