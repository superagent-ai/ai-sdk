import * as ai from 'ai';
export { SupportedModel, TokenUsage, createClient } from '@superagent-ai/safety-agent';

/**
 * Configuration options for the Superagent Guard tool
 */
type GuardConfig = {
    /**
     * Your Superagent API key.
     * If not provided, will use SUPERAGENT_API_KEY environment variable.
     */
    apiKey?: string;
    /**
     * Optional system prompt to customize the classification logic.
     * Allows you to steer the guard behavior for your specific use case.
     */
    systemPrompt?: string;
    /**
     * Optional model to use for classification.
     * Format: "provider/model" (e.g., "openai/gpt-4o-mini")
     * If not provided, uses the default Superagent guard model.
     */
    model?: string;
    /**
     * Characters per chunk. Default: 8000. Set to 0 to disable chunking.
     */
    chunkSize?: number;
};
/**
 * Classification result from the Guard API
 */
type GuardClassification = "pass" | "block";
/**
 * Types of violations that can be detected
 */
type ViolationType = "prompt_injection" | "system_prompt_extraction" | "data_exfiltration" | "jailbreak" | string;
/**
 * Token usage information
 */
type GuardUsage = {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
};
/**
 * Response from the Guard API (simplified format from new SDK)
 */
type GuardResponse = {
    /** Whether the content passed or should be blocked */
    classification: GuardClassification;
    /** Types of violations detected */
    violation_types: string[];
    /** CWE codes associated with violations */
    cwe_codes: string[];
    /** Token usage information */
    usage: GuardUsage;
};
/**
 * Message content returned by the Guard API (legacy format for backward compatibility)
 */
type GuardMessageContent = {
    classification: GuardClassification;
    violation_types: ViolationType[];
    cwe_codes: string[];
};
/**
 * Individual choice in the Guard API response (legacy format for backward compatibility)
 */
type GuardChoice = {
    message: {
        role: "assistant";
        content: GuardMessageContent;
        reasoning?: string;
    };
    finish_reason: string;
};
/**
 * Configuration options for the Superagent Redact tool
 */
type RedactConfig = {
    /**
     * Your Superagent API key.
     * If not provided, will use SUPERAGENT_API_KEY environment variable.
     */
    apiKey?: string;
    /**
     * Optional array of custom entity types to redact.
     * If not provided, defaults to standard PII entities (SSNs, emails, phone numbers, etc.)
     */
    entities?: string[];
    /**
     * Model to use for redaction.
     * Format: "provider/model" (e.g., "openai/gpt-4o-mini")
     */
    model?: string;
    /**
     * When true, rewrites text contextually instead of using placeholders.
     * Default: false
     */
    rewrite?: boolean;
};
/**
 * Token usage information for Redact API
 */
type RedactUsage = {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
};
/**
 * Response from the Redact API (simplified format from new SDK)
 */
type RedactResponse = {
    /** The redacted/sanitized text */
    redacted: string;
    /** List of findings that were redacted */
    findings: string[];
    /** Token usage information */
    usage: RedactUsage;
};
/**
 * Individual choice in the Redact API response (legacy format for backward compatibility)
 */
type RedactChoice = {
    message: {
        role: "assistant";
        content: string;
        reasoning?: string;
    };
    finish_reason: string;
};

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
declare function guard(config?: GuardConfig): ai.Tool<{
    text?: string | undefined;
    url?: string | undefined;
    systemPrompt?: string | undefined;
    model?: string | undefined;
}, GuardResponse>;

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
 * import { redact } from "@superagent-labs/ai-sdk";
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
declare function redact(config?: RedactConfig): ai.Tool<{
    text: string;
    entities?: string[] | undefined;
    model?: string | undefined;
    rewrite?: boolean | undefined;
}, RedactResponse>;

export { type GuardChoice, type GuardClassification, type GuardConfig, type GuardMessageContent, type GuardResponse, type GuardUsage, type RedactChoice, type RedactConfig, type RedactResponse, type RedactUsage, type ViolationType, guard, redact };
