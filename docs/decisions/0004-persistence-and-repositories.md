# ADR 0004: Persistence and repository boundary

- **Status:** Proposed
- **Date:** 2026-10-25
- **Decision owners:** Project owner

## Context

The application is expected to persist conversations and load authorized
history/context for AI prompts. SQL and EF Core are learning goals. The project
owner also wants the option to change storage technology later.

## Decision

Start with a relational database and EF Core once the persistence phase begins.
Define application-focused repository interfaces for conversation/message
operations and implement them using EF Core. Do not expose EF entities,
`DbContext`, or `IQueryable` to controllers or the Angular API contract.
Choose SQL Server/Azure SQL or another SQL engine after checking local
development, hosting, cost, and interview goals.

The repository boundary is for isolation and testability; it does not promise a
free database switch. A move to MongoDB or another store requires reassessing
transactions, consistency, query patterns, indexing, and data modeling.

## Alternatives considered

- **No persistence:** simplest first API stage, but cannot support history or
  context retrieval.
- **Database calls in controllers:** rejected due to coupling and testability.
- **Generic CRUD repository:** rejected if it hides domain queries or EF Core
  behavior without a concrete benefit.
- **MongoDB first:** remains possible if product requirements favor document
  storage, but SQL is preferred for the planned relational/EF Core learning.

## Consequences

- EF Core migrations and SQL query behavior become part of the operational
  lifecycle.
- Repository methods should follow real use cases and preserve pagination and
  ownership predicates.
- The choice of database host can alter cost; free local software does not make
  managed database hosting free.
- Unit of Work should not duplicate `DbContext` without a specific need.

## Revisit when

Conversation volume, data shape, consistency requirements, hosting costs, or
the need for a non-relational search/document store is better understood.
