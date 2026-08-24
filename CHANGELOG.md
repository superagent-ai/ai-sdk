# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] - 2026-08-24

### Changed

- Updated `safety-agent` to `0.1.8-rc1`

## [0.0.3] - 2025-12-02

### Added

- `systemPrompt` parameter to the guard tool for customizing classification logic
- Runtime `systemPrompt` can override config-level setting
- Integrated `@superagent-ai/safety-agent` SDK for improved functionality

### Changed

- Updated guard and redact tools to use the new SDK

### Removed

- Verify tool and all related types (no longer supported by the API)

## [0.0.2] - 2025-11-30

### Added

- Initial release with guard, redact, and verify tools
- Full TypeScript support
- Vercel AI SDK integration
