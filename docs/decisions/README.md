# Architecture Decision Records

Architecture Decision Records (ADRs) capture a significant choice, its context,
alternatives, consequences, and review point. An ADR is not an implementation
plan; implementation tasks live in
[PROJECT_ROADMAP.md](../../PROJECT_ROADMAP.md).

## Status meanings

- **Proposed:** a candidate for discussion; not yet approved or implemented.
- **Accepted:** chosen for the stated scope; implementation may still be pending.
- **Superseded:** replaced by a later ADR; retained for history.

## Decision index

| ADR | Subject | Status |
|---|---|---|
| [0001](0001-application-boundaries.md) | Modular monolith and application boundaries | Proposed |
| [0002](0002-ai-provider-selection.md) | Configured multi-provider AI integration | Proposed |
| [0003](0003-identity-and-federation.md) | OIDC/JWT for app identity; SAML federation when required | Proposed |
| [0004](0004-persistence-and-repositories.md) | Relational persistence and repository boundary | Proposed |
| [0005](0005-hosting-and-cost.md) | Hosting strategy and cost constraints | Proposed |

Revisit an ADR when requirements change, a new operational constraint appears,
or implementation evidence invalidates an assumption. Update the ADR status
and link the superseding record instead of silently rewriting history.
