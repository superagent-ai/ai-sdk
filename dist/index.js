// src/tools/guard.ts
import { tool } from "ai";
import { z } from "zod";
function guard(config = {}) {
  const { apiKey = process.env.SUPERAGENT_API_KEY } = config;
  return tool({
    description: "Analyze user input for security threats such as prompt injection, system prompt extraction, or data exfiltration attempts. Use this to classify and detect malicious intent in user-provided text, PDF files, or URLs.",
    inputSchema: z.object({
      text: z.string().optional().describe(
        "The user input text to analyze for security threats. Provide either text, file, or url."
      ),
      file: z.string().optional().describe(
        "Base64-encoded PDF file to analyze (format: data:application/pdf;base64,...). Provide either text, file, or url."
      ),
      url: z.string().url().optional().describe(
        "URL to a PDF file to download and analyze for security threats. Provide either text, file, or url."
      )
    }),
    execute: async ({ text, file, url }) => {
      if (!apiKey) {
        throw new Error(
          "SUPERAGENT_API_KEY is required. Set it in environment variables or pass it in config."
        );
      }
      if (!text && !file && !url) {
        throw new Error("At least one of text, file, or url must be provided.");
      }
      const requestBody = {};
      if (text) {
        requestBody.text = text;
      }
      if (file) {
        requestBody.file = file;
      }
      if (url) {
        requestBody.url = url;
      }
      try {
        const response = await fetch("https://app.superagent.sh/api/guard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Guard API error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        return data;
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
function redact(config = {}) {
  const { apiKey = process.env.SUPERAGENT_API_KEY, entities } = config;
  return tool2({
    description: "Remove sensitive information (PII/PHI) from text. Redacts SSNs, emails, phone numbers, addresses, and other personally identifiable information. Use this to sanitize user data before processing or storage.",
    inputSchema: z2.object({
      text: z2.string().min(1).describe("The text content to be analyzed and redacted"),
      entities: z2.array(z2.string()).optional().describe(
        "Optional array of custom entity types to redact. If not provided, defaults to standard PII entities (SSNs, emails, phone numbers, etc.)"
      )
    }),
    execute: async ({ text, entities: inputEntities }) => {
      if (!apiKey) {
        throw new Error(
          "SUPERAGENT_API_KEY is required. Set it in environment variables or pass it in config."
        );
      }
      const requestBody = { text };
      const entitiesToUse = inputEntities || entities;
      if (entitiesToUse && entitiesToUse.length > 0) {
        requestBody.entities = entitiesToUse;
      }
      try {
        const response = await fetch("https://app.superagent.sh/api/redact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Redact API error: ${response.status} - ${errorText}`
          );
        }
        const data = await response.json();
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to redact with Superagent: ${error.message}`);
        }
        throw error;
      }
    }
  });
}

// src/tools/verify.ts
import { tool as tool3 } from "ai";
import { z as z3 } from "zod";
function verify(config = {}) {
  const { apiKey = process.env.SUPERAGENT_API_KEY } = config;
  return tool3({
    description: "Fact-check text by verifying claims against provided source materials. Use this to validate statements, check accuracy of information, and identify unsupported claims.",
    inputSchema: z3.object({
      text: z3.string().min(1).describe("The text containing claims to verify"),
      sources: z3.array(
        z3.object({
          name: z3.string().describe("Name/title of the source"),
          content: z3.string().describe("The content of the source material"),
          url: z3.string().url().optional().describe("Optional URL reference for the source")
        })
      ).min(1).describe("Array of source materials to verify claims against")
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
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Verify API error: ${response.status} - ${errorText}`
          );
        }
        const data = await response.json();
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to verify with Superagent: ${error.message}`);
        }
        throw error;
      }
    }
  });
}
export {
  guard,
  redact,
  verify
};
