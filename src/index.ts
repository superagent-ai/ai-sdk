export { guard } from "./tools/guard";
export type {
  GuardConfig,
  GuardResponse,
  GuardClassification,
  GuardChoice,
  GuardMessageContent,
  GuardUsage,
  ViolationType,
} from "./tools/guard";

export { redact } from "./tools/redact";
export type {
  RedactConfig,
  RedactResponse,
  RedactChoice,
  RedactUsage,
} from "./tools/redact";

// Re-export useful types from the safety-agent SDK
export type { TokenUsage, SupportedModel } from "safety-agent";

// Re-export the createClient for advanced usage
export { createClient } from "safety-agent";
