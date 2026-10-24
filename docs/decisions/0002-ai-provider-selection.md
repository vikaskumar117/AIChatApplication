# ADR 0002: AI provider selection

- **Status:** Proposed
- **Date:** 2026-10-25
- **Decision owners:** Project owner

## Context

The application has an Ollama implementation and an OpenAI-compatible
implementation. The active implementation is selected in dependency injection.
The learning goal is to support more than one model provider, with the active
provider chosen by application configuration.

## Decision

Define an application-owned provider contract for the chat-completion
capabilities the product needs. Keep HTTP protocol, credentials, model-specific
options, serialization, and response parsing in provider adapters. Bind and
validate provider settings at startup, then use a small selector/factory or
appropriate keyed DI registrations to resolve the configured implementation.
Do not let arbitrary request data select a provider unless a later product
requirement explicitly authorizes that behavior.

## Alternatives considered

- **Direct provider calls from controllers:** rejected because it couples HTTP
  endpoints to external protocols and impairs testing.
- **One common interface exposing every provider-specific option:** rejected
  because it creates a leaky, ever-growing abstraction.
- **Choose the provider from client input:** deferred because it introduces
  authorization, quota, and cost-control requirements.
- **Use an AI orchestration library immediately:** defer until the required
  features justify it; a direct adapter is useful for learning HTTP and
  provider contracts.

## Consequences

- Provider implementations can be substituted without controller changes.
- The common contract must stay focused; provider-specific features may require
  capabilities or an explicitly provider-specific path.
- Configuration errors should fail at startup; runtime failures should be
  mapped to safe, observable application outcomes.
- Retries and fallback may incur duplicate costs or change output semantics;
  they require explicit budgets and tests.

## Revisit when

Provider count, streaming/tool-call requirements, evaluation, or operational
fallback needs make the initial interface/selector inadequate.
