// Re-export types from the safety-agent SDK
export type {
  ClientConfig,
  GuardOptions as SafetyAgentGuardOptions,
  RedactOptions as SafetyAgentRedactOptions,
  GuardResponse as SafetyAgentGuardResponse,
  RedactResponse as SafetyAgentRedactResponse,
  TokenUsage,
  SupportedModel,
} from "@superagent-ai/safety-agent";

/**
 * Configuration options for the Superagent Guard tool
 */
export type GuardConfig = {
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
export type GuardClassification = "pass" | "block";

/**
 * Types of violations that can be detected
 */
export type ViolationType =
  | "prompt_injection"
  | "system_prompt_extraction"
  | "data_exfiltration"
  | "jailbreak"
  | string;

/**
 * Token usage information
 */
export type GuardUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

/**
 * Response from the Guard API (simplified format from new SDK)
 */
export type GuardResponse = {
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
export type GuardMessageContent = {
  classification: GuardClassification;
  violation_types: ViolationType[];
  cwe_codes: string[];
};

/**
 * Individual choice in the Guard API response (legacy format for backward compatibility)
 */
export type GuardChoice = {
  message: {
    role: "assistant";
    content: GuardMessageContent;
    reasoning?: string;
  };
  finish_reason: string;
};

// ============================================
// Redact API Types
// ============================================

/**
 * Configuration options for the Superagent Redact tool
 */
export type RedactConfig = {
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
export type RedactUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

/**
 * Response from the Redact API (simplified format from new SDK)
 */
export type RedactResponse = {
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
export type RedactChoice = {
  message: {
    role: "assistant";
    content: string;
    reasoning?: string;
  };
  finish_reason: string;
};

// ============================================
// Verify API Types
// ============================================

/**
 * Configuration options for the Superagent Verify tool
 */
export type VerifyConfig = {
  /**
   * Your Superagent API key.
   * If not provided, will use SUPERAGENT_API_KEY environment variable.
   */
  apiKey?: string;
};

/**
 * Source material for verification
 */
export type VerifySource = {
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
export type ClaimSourceRef = {
  name: string;
  url?: string;
};

/**
 * Individual claim verification result
 */
export type VerifyClaim = {
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
export type VerifyMessageContent = {
  claims: VerifyClaim[];
};

/**
 * Individual choice in the Verify API response
 */
export type VerifyChoice = {
  message: {
    role: "assistant";
    content: VerifyMessageContent;
  };
  finish_reason: string;
};

/**
 * Token usage information for Verify API
 */
export type VerifyUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

/**
 * Full response from the Verify API
 */
export type VerifyResponse = {
  id: string;
  model: string;
  choices: VerifyChoice[];
  usage: VerifyUsage;
};
