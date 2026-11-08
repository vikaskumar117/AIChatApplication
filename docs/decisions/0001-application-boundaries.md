# ADR 0001: Application boundaries

- **Status:** Proposed
- **Date:** 2026-10-25
- **Decision owners:** Project owner

## Context

The repository currently contains a small ASP.NET Core API that calls an AI
provider. The planned application adds an Angular SPA, authentication,
conversation persistence, multiple model providers, and possibly RAG and
background jobs. Introducing a distributed system too early would add
deployment and debugging cost before the product needs it.

## Decision

Start with a modular monolith: keep the API, application orchestration,
provider adapters, persistence adapter, and cross-cutting infrastructure in
clear code boundaries, initially deployed as one API application. Keep the
Angular SPA as a separate frontend build/client. Split backend services only
when scaling, deployment independence, team ownership, or reliability
requirements justify the added distributed-system complexity.

## Alternatives considered

- **One controller containing all behavior:** rejected because provider,
  persistence, and authorization concerns become difficult to test and change.
- **Microservices from the start:** deferred because the current feature set and
  team size do not justify independent deployments, service discovery, network
  failure handling, and operational overhead.
- **One monolithic class library without boundaries:** rejected as a long-term
  direction because it makes provider and persistence changes harder to
  isolate.

## Consequences

- The API can be tested and deployed simply while retaining application-owned
  interfaces around changing infrastructure.
- In-process boundaries do not eliminate all coupling; use-case contracts
  should remain small and meaningful.
- A later service split will require explicit network contracts and operational
  design; it is not guaranteed to be a drop-in refactor.

## Revisit when

Independent scaling/deployment, team ownership, fault isolation, or compliance
requirements show measurable need for a service boundary.
