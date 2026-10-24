# Learning Topic Tracker

## Overall progress

**Topics completed: 0 / 120 — 0%**

Progress formula: `completed topics ÷ 120 × 100`. Count only rows whose status
is **Done**. Update the number and percentage at the top whenever a status
changes. Markdown does not calculate this value automatically; the maintainer
must update it in the same documentation change. “Done” means you can explain
the concept in your own words, point to its project use (or explain why the
project does not use it), and answer a practical trade-off question. Reading
the guide alone does not mark a topic done.

## Status values

- **Not started** — not studied yet.
- **In progress** — studying or applying it in the current release key.
- **Done** — demonstrated understanding and recorded project evidence.
- **Blocked** — cannot progress; record what is needed in Evidence / notes.
- **Deferred** — intentionally postponed; include the reason.

Update the status and evidence after the concept is implemented, tested, or
discussed in a release-key review. Do not mark a topic done solely because code
was generated or copied.

## Topic inventory

There are **12 modules × 10 topics = 120 topics**. IDs remain stable when
statuses change. Add topics by increasing the denominator and updating this
inventory count and completion formula.

## Planned release-key coverage

Topics are introduced when their project feature makes them concrete. They can
be studied earlier, but the key assignment below gives each topic a practical
implementation/review point. The detailed lesson card is added or expanded in
the learning guide as that key is worked.

| Release key | Topic IDs primarily covered |
|---|---|
| key101 | T001-T003, T007, T011-T012, T018-T019, T021-T027, T071-T073, T075 |
| key102 | T004-T006, T020, T034-T040 |
| key103 | T051-T060 |
| key104 | T061-T067 |
| key105 | T008-T009, T041-T050, ownership aspects of T068 |
| key106 | T030, T068-T070, T088-T090 |
| key107 | T071-T080 |
| key108 | T031-T032, T081-T087 |
| key109 | T091-T100 |
| key110 | T010, T013-T017, T028-T029, T033, T101-T120 |

### Module 1 — C# language and type system (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T001 | Value types and reference types | Not started | |
| T002 | Nullable reference types and nullability flow | Not started | |
| T003 | Records, classes, immutability, and equality | Not started | |
| T004 | Generics, constraints, and variance | Not started | |
| T005 | Delegates, events, and callbacks | Not started | |
| T006 | Pattern matching and switch expressions | Not started | |
| T007 | Exceptions and domain error modeling | Not started | |
| T008 | `IEnumerable<T>` vs. `IQueryable<T>` | Not started | |
| T009 | Collections: List, Dictionary, HashSet, queues | Not started | |
| T010 | `Span<T>`, `Memory<T>`, and allocation-aware APIs | Not started | |

### Module 2 — .NET runtime, async, and dependency injection (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T011 | `async`/`await` and I/O-bound work | Not started | |
| T012 | `CancellationToken` propagation | Not started | |
| T013 | Concurrency, thread safety, locks, and races | Not started | |
| T014 | `Task.WhenAll`, bounded concurrency, and `SemaphoreSlim` | Not started | |
| T015 | `IAsyncEnumerable<T>` and streaming | Not started | |
| T016 | CLR, JIT, and garbage collection fundamentals | Not started | |
| T017 | Allocations, boxing, LOH, and memory profiling | Not started | |
| T018 | DI scopes, singleton/scoped/transient lifetimes | Not started | |
| T019 | Configuration, Options pattern, and validation | Not started | |
| T020 | `IHttpClientFactory`, typed clients, and HTTP timeouts | Not started | |

### Module 3 — ASP.NET Core API and web platform (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T021 | REST resource design and HTTP method semantics | Not started | |
| T022 | Routing, model binding, and request pipeline | Not started | |
| T023 | Request/response DTOs and API compatibility | Not started | |
| T024 | Server-side validation and input limits | Not started | |
| T025 | Middleware ordering and exception handling | Not started | |
| T026 | Problem Details and consistent error contracts | Not started | |
| T027 | OpenAPI/Swagger contract documentation | Not started | |
| T028 | API versioning and backward compatibility | Not started | |
| T029 | Filters, endpoint metadata, and cross-cutting behavior | Not started | |
| T030 | Rate limiting and request-size controls | Not started | |

### Module 4 — AI and GenAI application engineering (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T031 | Tokens, tokenization, and context windows | Not started | |
| T032 | System/user messages and prompt construction | Not started | |
| T033 | Temperature and generation parameters | Not started | |
| T034 | Model/provider abstraction and adapter boundaries | Not started | |
| T035 | Configuration-based provider selection | Not started | |
| T036 | Structured output and schema validation | Not started | |
| T037 | Streaming completions and partial output | Not started | |
| T038 | Model quality, latency, privacy, and cost trade-offs | Not started | |
| T039 | Evaluation datasets and repeatable quality checks | Not started | |
| T040 | Tool/function calling and safe capability design | Not started | |

### Module 5 — SQL and EF Core (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T041 | Relational modeling, keys, and normalization | Not started | |
| T042 | SELECT, WHERE, ORDER BY, NULL, LIKE, and dates | Not started | |
| T043 | INNER/LEFT JOIN and relationship queries | Not started | |
| T044 | GROUP BY, HAVING, aggregates, and subqueries | Not started | |
| T045 | EF Core DbContext, entities, and configuration | Not started | |
| T046 | EF Core migrations and schema deployment | Not started | |
| T047 | Tracking, no-tracking, and change detection | Not started | |
| T048 | Transactions, isolation, and optimistic concurrency | Not started | |
| T049 | Indexes, execution plans, and sargability | Not started | |
| T050 | Pagination, N+1 queries, and query performance | Not started | |

### Module 6 — Angular and TypeScript (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T051 | TypeScript strict typing, generics, and unions | Not started | |
| T052 | Angular components, templates, and data binding | Not started | |
| T053 | Angular dependency injection and services | Not started | |
| T054 | `HttpClient`, typed API calls, and interceptors | Not started | |
| T055 | RxJS Observables, operators, cancellation, and errors | Not started | |
| T056 | Reactive forms and client-side validation | Not started | |
| T057 | Angular routing, guards, and lazy loading | Not started | |
| T058 | Signals/change detection and state-management trade-offs | Not started | |
| T059 | Accessibility and safe rendering of generated content | Not started | |
| T060 | Angular component and browser end-to-end tests | Not started | |

### Module 7 — Authentication, authorization, and API security (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T061 | Authentication vs. authorization | Not started | |
| T062 | OAuth 2.0 roles and authorization-code flow | Not started | |
| T063 | OIDC discovery, ID tokens, and user sign-in | Not started | |
| T064 | PKCE and public SPA client security | Not started | |
| T065 | JWT signature, issuer, audience, and expiry validation | Not started | |
| T066 | Claims, scopes, roles, and policy authorization | Not started | |
| T067 | SAML federation and OIDC translation boundary | Not started | |
| T068 | CORS, cookies, CSRF, and browser security boundaries | Not started | |
| T069 | Secret storage, rotation, and managed identity | Not started | |
| T070 | OWASP risks, prompt injection, PII, and tenant isolation | Not started | |

### Module 8 — Testing, maintainability, and engineering workflow (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T071 | Unit tests and behavior-focused assertions | Not started | |
| T072 | Integration tests for ASP.NET Core APIs | Not started | |
| T073 | HTTP fakes, test doubles, and provider isolation | Not started | |
| T074 | Database integration tests and migration verification | Not started | |
| T075 | Contract tests and serialization compatibility | Not started | |
| T076 | Deterministic tests for probabilistic AI behavior | Not started | |
| T077 | Playwright end-to-end tests | Not started | |
| T078 | CI build, test, formatting, and artifact steps | Not started | |
| T079 | Dependency/secret scanning and supply-chain checks | Not started | |
| T080 | Code review, PR gates, and technical documentation | Not started | |

### Module 9 — RAG, responsible AI, and data governance (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T081 | Embeddings and semantic similarity | Not started | |
| T082 | Document ingestion, parsing, and validation | Not started | |
| T083 | Chunking strategy and metadata | Not started | |
| T084 | Vector search, hybrid search, and filtering | Not started | |
| T085 | Retrieval ranking, reranking, and context budgets | Not started | |
| T086 | Citations, grounded answers, and insufficient evidence | Not started | |
| T087 | Retrieval evaluation and groundedness measurement | Not started | |
| T088 | Indirect prompt injection in retrieved content | Not started | |
| T089 | PII, retention, deletion, and data minimization | Not started | |
| T090 | Responsible AI, human oversight, and refusal behavior | Not started | |

### Module 10 — Azure, hosting, and cloud delivery (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T091 | Azure App Service and hosting-plan trade-offs | Not started | |
| T092 | Azure Static Web Apps and static Angular deployment | Not started | |
| T093 | IIS hosting, reverse proxy, TLS, and app-pool identity | Not started | |
| T094 | Azure SQL, networking, backups, and cost | Not started | |
| T095 | Key Vault, managed identity, and least privilege | Not started | |
| T096 | Containers and environment configuration | Not started | |
| T097 | Infrastructure as code (Bicep/Terraform) | Not started | |
| T098 | CI/CD environments, approvals, rollback, and migrations | Not started | |
| T099 | Free tiers, quotas, budgets, and total cost of ownership | Not started | |
| T100 | Availability, scaling, disaster recovery, and restore tests | Not started | |

### Module 11 — Reliability, observability, and distributed systems (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T101 | Structured logs and correlation identifiers | Not started | |
| T102 | Metrics, traces, OpenTelemetry, and Application Insights | Not started | |
| T103 | Liveness, readiness, and dependency health checks | Not started | |
| T104 | Deadlines, timeouts, and cancellation budgets | Not started | |
| T105 | Retries, exponential backoff, and retry storms | Not started | |
| T106 | Circuit breakers, bulkheads, and backpressure | Not started | |
| T107 | Caching, invalidation, privacy, and freshness | Not started | |
| T108 | Service Bus queues/topics and competing consumers | Not started | |
| T109 | Idempotency, duplicate delivery, outbox, and DLQ | Not started | |
| T110 | SLI/SLO, incident response, runbooks, and alerting | Not started | |

### Module 12 — Architecture and senior-engineer interview practice (10)

| ID | Topic | Status | Evidence / notes |
|---|---|---|---|
| T111 | Requirements, constraints, and capacity estimation | Not started | |
| T112 | Modular monolith vs. microservices | Not started | |
| T113 | SOLID and pragmatic design-pattern selection | Not started | |
| T114 | Strategy, Factory, Adapter, and Decorator | Not started | |
| T115 | Repository and Unit of Work trade-offs | Not started | |
| T116 | DDD boundaries, aggregates, and invariants | Not started | |
| T117 | API/database/cache/failure-mode system design | Not started | |
| T118 | Design reviews, ADRs, estimation, and prioritization | Not started | |
| T119 | Mentoring, code review, and technical communication | Not started | |
| T120 | Production incident ownership and interview walkthrough | Not started | |

## Review log

| Date | Release key | Topics updated | Notes |
|---|---|---|---|
| 2026-10-25 | Planning | 120 topics inventoried | Initial statuses are Not started; implementation has not begun. |
