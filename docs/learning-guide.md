# AI Chat Application Learning Guide

## How to use this guide

This is a practical learning guide for building and operating this application,
not a list of disconnected tutorials. Follow the feature sequence in the
[project roadmap](../PROJECT_ROADMAP.md). For each phase:

1. Read the feature outcome and its acceptance criteria.
2. Identify the API/UI/data behavior before editing code.
3. Implement a small vertical slice on a feature branch.
4. Add or update tests and run them locally.
5. Update the architecture, this guide, and any relevant decision record in
   the same pull request.
6. Review trade-offs and explain why the chosen design fits this stage.

The repository currently has an ASP.NET Core API, two provider implementations,
a shared response envelope, and exception handling. Angular, identity,
persistence, RAG, tests, and hosting are roadmap work, not current capabilities.
See [architecture.md](architecture.md) for current and target diagrams.

## Feature-to-concept learning map

| Feature phase | Where the concepts appear | What to understand and explain |
|---|---|---|
| 0. Baseline | `Program.cs`, project files, configuration, Git/CI docs | How the app starts, nullable types, records/classes, repository workflow, requirements, configuration sources, local vs. deployment settings |
| 1. Chat API | `Controllers/`, API contracts, validation, middleware | HTTP semantics, routing/model binding, DTOs vs. domain types, status codes, Problem Details/Result consistency, cancellation, middleware order |
| 2. AI providers | `Services/`, provider interfaces, options, DI | Async HTTP, `IHttpClientFactory`, serialization, error mapping, interface/composition, SOLID, Strategy/Factory/Adapter, timeout/retry/circuit-breaker trade-offs |
| 3. Persistence | `Infrastructure/`, EF Core `DbContext`, repositories, migrations | SQL joins/aggregates/indexes, relational modeling, EF tracking, transactions, concurrency, query plans, repository and Unit of Work trade-offs |
| 4. Angular SPA | `frontend/` Angular components, services, routes, forms | TypeScript strict mode, templates/data binding, Angular DI, `HttpClient`, RxJS streams/cancellation, reactive forms, accessibility, component/e2e testing |
| 5. Sign-in and access | Angular OIDC setup and API auth policies | OAuth 2.0 vs. OIDC, PKCE, JWT issuer/audience/signature/lifetime validation, claims/scopes/roles, authentication vs. authorization, SAML federation |
| 6. Security hardening | API CORS/rate-limit/validation config, secret config, rendering | CORS boundaries, least privilege, secrets, prompt injection, PII, XSS, output validation, rate/cost limiting, threat modeling |
| 7. Quality pipeline | Test projects, frontend tests, CI workflows | Unit/integration/contract/e2e tests, fakes, deterministic tests, testable boundaries, code review, dependency and secret scans |
| 8. RAG | Ingestion, chunking, embedding, retrieval and citations | Tokens/context budgets, embeddings, vector/hybrid search, reranking, citations, relevance evaluation, tenant filtering, indirect prompt injection |
| 9. Operations | Logging, metrics, tracing, health checks, resilience | OpenTelemetry, Application Insights, SLI/SLO, profiling, GC/allocation basics, timeouts, backpressure, retries, graceful shutdown, incident diagnosis |
| 10. Hosting | Infrastructure as code, deployment workflows, Azure/IIS config | App Service vs. containers vs. IIS, Azure SQL, managed identity, Key Vault, staging/rollback, network/security boundaries, cost and availability |
| 11. Background work | Queue API, worker, broker, persistence/outbox | Service Bus queues/topics, at-least-once delivery, idempotency, retries, DLQ, outbox, eventual consistency, poison messages |
| 12. Capstone | Architecture docs, ADRs, runbooks, demo | System design, capacity estimates, modular monolith vs. microservices, requirements, trade-offs, estimation, incident response, technical communication |

File names shown for future features describe intended code locations; they may
change as implementation evolves. Update this table when the repository
structure is established.

## Important concepts, with practical examples

### C# and .NET

- **Value and reference types:** use them to reason about copying, identity,
  nullability, and allocations. Avoid changing a type to a struct solely for
  perceived speed; measure first.
- **Nullable reference types:** make absent configuration and optional API
  data explicit. Treat warnings as useful feedback rather than suppressing them
  globally.
- **Records and DTOs:** records can make immutable API contracts concise; they
  are not automatically a good choice for every mutable EF entity.
- **Interfaces and composition:** define a contract where application behavior
  needs substitution (AI providers, repositories); avoid interfaces for every
  trivial class without a use case.
- **Generics and collections:** select collection types based on required
  semantics. `Dictionary` supports keyed lookup, `HashSet` uniqueness,
  `IEnumerable<T>` iteration, and `IQueryable<T>` provider-translated
  expressions. Do not leak `IQueryable` from persistence into application/API
  boundaries.
- **Async and cancellation:** asynchronous I/O frees request threads while
  waiting; it does not make model inference intrinsically faster. Pass
  `CancellationToken` through the call chain and do not turn a client
  cancellation into a fabricated success.
- **Concurrency controls:** use bounded concurrency for a local model or
  constrained API. `Task.WhenAll` is suitable only when parallel operations
  are independent and the total load is acceptable.
- **Runtime/performance:** learn allocation, garbage collection, LOH, JIT, and
  profiling after measuring a real hot path. Do not optimize a demo from
  guesses.

### ASP.NET Core APIs

- **Controller boundary:** bind/validate HTTP input, call application behavior,
  and map outcomes to HTTP. Controllers should not build provider JSON or issue
  EF queries directly.
- **DTOs:** public HTTP shapes should be explicit and stable. Do not expose EF
  entities, access tokens, provider secrets, or internal exception details.
- **Validation:** enforce server-side rules even if Angular validates the same
  form. Browser validation is a usability feature, not a security boundary.
- **Middleware:** ordering matters. Authentication must run before authorization;
  exception handling should surround downstream processing.
- **Result and Problem Details:** choose one consistent public error contract.
  Map domain/provider failures to safe status codes at a deliberate boundary.
- **Cancellation and deadlines:** HTTP disconnect cancellation should reach
  downstream operations. An application deadline should prevent work from
  running indefinitely.
- **OpenAPI:** document the API contract and use it to catch accidental
  breaking changes; it is not a substitute for integration tests.

### AI and LLM application design

- **Provider abstraction:** normalize only what the application needs. Keep
  provider-specific options/features available without leaking transport
  details everywhere.
- **Configuration-driven provider selection:** validate names/settings at
  startup. Avoid selecting providers based on untrusted request input unless
  explicitly authorized and cost-controlled.
- **Tokens and context:** prompts, message history, and retrieved chunks share a
  model context budget. Measure or estimate before appending unbounded chat
  history.
- **Temperature and generation settings:** tune against a repeatable evaluation
  set. A parameter change can affect determinism/quality but does not guarantee
  factual correctness.
- **Structured output:** validate JSON/schema from a model; model output is
  untrusted input.
- **Prompt injection:** system instructions are not a security boundary.
  Retrieved text and submitted code can contain adversarial instructions; do
  not give model output direct authority to access data or execute actions.
- **Evaluation:** keep a small versioned set of representative prompts and
  expected criteria. Compare answer usefulness, groundedness, citation
  correctness, latency, and cost rather than checking exact wording alone.
- **RAG:** use when users need answers grounded in a known corpus. Retrieval
  must respect authorization; citations must refer to the retrieved source.
- **Privacy/cost:** decide what user code is sent to a provider, how long data
  is retained, and how quotas/budgets are enforced.

### SQL and EF Core

- **Model from use cases:** define ownership, retention, and query patterns
  before tables. Conversation/message relationships are a starting point, not
  an assumption that all data belongs in one table.
- **Indexes:** support measured filters and sort orders, such as an owner's
  conversations ordered by update time. Extra indexes increase write/storage
  cost.
- **Pagination:** always bound list queries. Choose stable ordering and consider
  keyset pagination when offset pagination becomes expensive.
- **Tracking:** tracked entities support updates; no-tracking queries can reduce
  overhead for read-only operations. Verify behavior before applying globally.
- **Transactions/concurrency:** protect multi-step writes and define what
  happens when two messages append at once.
- **Repository trade-offs:** use application-focused operations, not a generic
  CRUD repository that hides important query semantics. Different databases
  have different transactions, query language, indexing, and consistency.
- **Migrations:** review generated migrations and plan deployment ordering;
  schema changes can be incompatible with a running previous application
  version.
- **Performance:** inspect generated SQL and execution plans. Avoid N+1 queries,
  unbounded result materialization, and filtering on non-sargable expressions.

### Angular

- **Components and services:** components own view behavior; services own
  reusable API access/state. Avoid making components a second backend.
- **TypeScript strictness:** represent API success/error variants explicitly
  rather than using `any`; server validation remains authoritative.
- **RxJS:** understand subscription lifetimes, cancellation, error paths, and
  operators before composing more streams. Prefer Angular lifecycle-aware
  cleanup patterns.
- **Forms:** use reactive forms for typed validation and predictable state.
- **Routing:** lazy-load feature areas when application size warrants it;
  route guards improve navigation UX but do not replace API authorization.
- **OIDC:** use a maintained OIDC library and authorization code with PKCE.
  Never place provider API keys in browser code.
- **Rendering:** model output is untrusted. Render plain text by default or
  sanitize Markdown; do not bypass Angular sanitization for convenience.
- **Accessibility:** support keyboard use, labels, focus management, status
  announcements, contrast, and reduced-motion preferences.
- **Testing:** component tests cover UI behavior; browser tests verify complete
  user flows and integration boundaries.

### Authentication and application security

- **Authentication (authn):** establish who the user is.
- **Authorization (authz):** decide what that authenticated user may do.
- **OIDC:** identity layer built on OAuth 2.0; typically appropriate for SPA
  sign-in and API access-token issuance.
- **JWT:** a token format, not an authentication protocol by itself. Validate
  signature, issuer, audience, lifetime, and relevant claims.
- **SAML:** commonly used in enterprise identity federation. Prefer having the
  identity provider translate/federate SAML to OIDC for the SPA/API instead of
  writing SAML protocol handling into the application.
- **CORS:** browser cross-origin policy, not API authentication or a general
  firewall.
- **Secrets:** keep credentials out of source control, frontend bundles, logs,
  and exception responses. Rotate and scope them.
- **Rate limits:** protect availability and model budgets. User identity and
  abuse patterns determine suitable partitions and limits.
- **OWASP mindset:** validate inputs, minimize data, apply least privilege,
  review dependencies, and test ownership/security boundaries.

### Azure, delivery, and operations

- **Hosting choice:** use App Service for managed web hosting, containers when
  packaging/runtime control is needed, or IIS for Windows self-hosting. Choose
  based on operational needs, not only a free badge.
- **Managed identity:** prefer workload identity to a stored credential for
  Azure-to-Azure access when supported.
- **Key Vault:** use for secrets that remain necessary; restrict access and
  audit secret reads.
- **CI/CD:** build/test on pull requests; deploy immutable artifacts to
  environments with controlled configuration.
- **Infrastructure as code:** make cloud resources reviewable/reproducible.
- **Observability:** correlate logs, metrics, and traces without collecting
  sensitive prompt content.
- **Health checks:** distinguish a process being alive from being ready to
  accept useful requests.
- **Queues:** add only for durable background work. Assume at-least-once delivery
  and design idempotent handlers.
- **Reliability:** retry only transient failures, bound retries, use deadlines,
  and consider circuit breakers/backpressure based on measured behavior.
- **Cost:** include inference, compute, database, logs, storage, bandwidth,
  identity plan, domain, and backups—not only the API host.

## Free and paid tooling

“Free” can mean free/open-source software, a free account tier with quotas, a
trial, or a paid service with a free allowance. Check terms/limits before
depending on it; they change.

| Category | Free options / local use | Paid or potentially paid parts |
|---|---|---|
| .NET and Angular | .NET SDK/ASP.NET Core and Angular are free/open source | Hosting and some commercial support are separate |
| IDE | VS Code is free | Some IDE editions/features and AI coding services have paid tiers |
| AI inference | Ollama software is free; local model use avoids per-request provider billing | Hardware/electricity; hosted model APIs commonly charge per usage |
| SQL | Local developer/community databases and EF Core learning tools | Managed database hosting, storage, backups, and production licenses/tiers as applicable |
| Testing | xUnit/NUnit/MSTest, Playwright, and many libraries are free/open source | CI hosted minutes, test management platforms, and device/browser farms can cost |
| Identity | Some identity providers offer developer/free tiers | User counts, enterprise features, MAU, or production requirements may be paid |
| Static web hosting | GitHub Pages, Cloudflare Pages, and some Azure Static Web Apps tiers have free offerings/limits | Custom features, usage beyond quotas, API hosting, domains, and enterprise support |
| API hosting | Local hosting; some clouds/PaaS offer limited free/shared tiers | Always-on compute, scale, storage, bandwidth, custom networking, production SLA |
| Observability | Local OpenTelemetry stack and some free quotas | Retention, ingestion volume, dashboards, and managed telemetry beyond quota |
| Messaging/RAG | Local broker/search tools may be used for learning | Managed queue, embedding inference, vector storage, and search usage |

### Completely free hosting: realistic expectation

There is no general guarantee that the **entire** app (Angular, .NET API, SQL,
identity, Ollama inference, storage, TLS/domain, logs, and reliable uptime) can
be hosted publicly and permanently for zero cost.

- A local-only stack can avoid cloud bills, but requires your own computer and
  is not continuously available.
- Free static hosting can serve Angular files but does not run the .NET API,
  SQL database, or Ollama.
- Free/shared API plans may sleep or have strict CPU/memory/egress/runtime
  restrictions. Confirm the current .NET support explicitly.
- Free SQL allowances may be temporary, capped, or limited by region/account.
- Running Ollama in the cloud can require significant memory/CPU/GPU and is
  unlikely to be a dependable zero-cost hosted component.
- IIS on your PC avoids a cloud VM invoice but not electricity, internet,
  domain/TLS, security maintenance, backups, and uptime risk. Do not directly
  expose a development machine as a production server.

For the first demo, prefer local Angular + API + Ollama + local SQL. Later,
compare Azure free allowances and a static frontend with a separately hosted
API. Check live pricing and create budget alerts before provisioning resources.
References are maintained in the
[roadmap hosting/tooling section](../PROJECT_ROADMAP.md#tooling-and-cost-guide).

## Documentation and comments

- Code comments should explain a non-obvious decision, security constraint, or
  tricky behavior, not restate the next line of code.
- Use this guide for longer concept explanations and link to actual files after
  those files exist.
- Update the phase mapping when filenames or implementation boundaries change.
- Mark planned features as planned; do not imply an unimplemented feature is
  operational.
- Record consequential choices in `docs/decisions/` and link them here.
