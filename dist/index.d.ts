import * as ai from 'ai';

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
};
/**
 * Classification result from the Guard API
 */
type GuardClassification = "block" | "allow";
/**
 * Types of violations that can be detected
 */
type ViolationType = "prompt_injection" | "system_prompt_extraction" | "data_exfiltration" | "jailbreak" | string;
/**
 * Message content returned by the Guard API
 */
type GuardMessageContent = {
    classification: GuardClassification;
    violation_types: ViolationType[];
    cwe_codes: string[];
};
/**
 * Individual choice in the Guard API response
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
 * Token usage information
 */
type GuardUsage = {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
};
/**
 * Full response from the Guard API
 */
type GuardResponse = {
    id: string;
    model: string;
    choices: GuardChoice[];
    usage: GuardUsage;
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
};
/**
 * Individual choice in the Redact API response
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
 * Token usage information for Redact API
 */
type RedactUsage = {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
};
/**
 * Full response from the Redact API
 */
type RedactResponse = {
    id: string;
    model: string;
    choices: RedactChoice[];
    usage: RedactUsage;
};
/**
 * Configuration options for the Superagent Verify tool
 */
type VerifyConfig = {
    /**
     * Your Superagent API key.
     * If not provided, will use SUPERAGENT_API_KEY environment variable.
     */
    apiKey?: string;
};
/**
 * Source material for verification
 */
type VerifySource = {
    /** Name/title of the source */
    name: string;
    /** The content of the source material */
    content: string;
    /** Optional URL reference for the source */
    url?: string;
};
/**
 * Source reference in a claim result
 */
type ClaimSourceRef = {
    name: string;
    url?: string;
};
/**
 * Individual claim verification result
 */
type VerifyClaim = {
    /** The claim that was extracted and verified */
    claim: string;
    /** Whether the claim is verified as true or false */
    verdict: boolean;
    /** Sources that support or refute the claim */
    sources: ClaimSourceRef[];
    /** Evidence from the sources */
    evidence: string;
    /** Reasoning for the verdict */
    reasoning: string;
};
/**
 * Message content returned by the Verify API
 */
type VerifyMessageContent = {
    claims: VerifyClaim[];
};
/**
 * Individual choice in the Verify API response
 */
type VerifyChoice = {
    message: {
        role: "assistant";
        content: VerifyMessageContent;
    };
    finish_reason: string;
};
/**
 * Token usage information for Verify API
 */
type VerifyUsage = {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
};
/**
 * Full response from the Verify API
 */
type VerifyResponse = {
    id: string;
    model: string;
    choices: VerifyChoice[];
    usage: VerifyUsage;
};

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
declare function guard(config?: GuardConfig): ai.Tool<{
    text?: string | undefined;
    file?: string | undefined;
    url?: string | undefined;
    systemPrompt?: string | undefined;
}, GuardResponse>;

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
declare function redact(config?: RedactConfig): ai.Tool<{
    text: string;
    entities?: string[] | undefined;
}, RedactResponse>;

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
declare function verify(config?: VerifyConfig): ai.Tool<{
    text: string;
    sources: {
        name: string;
        content: string;
        url?: string | undefined;
    }[];
}, VerifyResponse>;

export { type ClaimSourceRef, type GuardChoice, type GuardClassification, type GuardConfig, type GuardMessageContent, type GuardResponse, type GuardUsage, type RedactChoice, type RedactConfig, type RedactResponse, type RedactUsage, type VerifyChoice, type VerifyClaim, type VerifyConfig, type VerifyMessageContent, type VerifyResponse, type VerifySource, type VerifyUsage, type ViolationType, guard, redact, verify };
