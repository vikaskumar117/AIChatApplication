# Senior Full-Stack .NET Interview Curriculum — Coverage Audit

**Reviewed:** 2026-11-08  
**Scope:** The topic inventory and 36 phases supplied in the learning request.

## Verdict

The topic inventory is a strong core for C#, .NET/API engineering, SQL Server,
Angular, Azure, architecture, and Generative AI. It does **not** yet cover all
36 phases. Several phases are only named, and some important senior interview
topics from the accompanying question bank are not explicit in the detailed
topic list.

Using the statuses in the table below, the inventory has **10 phases with a
strong core, 12 partially covered phases, and 14 phases with no usable
lesson-level coverage**. “Strong core” still does not mean every advanced
subtopic in that phase is complete.

Treat the phase names as the long-term roadmap, not as evidence that the
specific phase has study material. A phase is only “covered” below when the
supplied topic inventory contains enough named topics to study it.

## Master tracker review and focused additions

The supplied `Master_Tracker.xlsx` was reviewed for C# fundamentals, security,
Azure, system-design, and case-study topics. It provides a broad C# language
sequence, explicit security controls and attack topics, a substantial Azure
service list (including Logic Apps), and separate HLD/LLD and system-design
case-study phases. Its C# fundamentals sheet does not itself provide a focused
set of coding-interview exercises, so common problem-solving practice needed
to be added separately.

The application catalog now expands the requested areas:

| Area | Added lesson coverage |
|---|---|
| C# Coding & Algorithms | String reversal, word reversal, palindrome, anagram, first unique character, Two Sum, longest unique substring, and binary search; each explains the approach and complexity. |
| API Security | BOLA, SSRF, credential stuffing/brute force, and mass assignment, alongside existing SQL injection, XSS/CSRF, and rate-limiting lessons. |
| Azure | Logic Apps workflows, Storage primitives, API Management, and monitoring/availability/cost decisions, alongside compute, messaging, and managed identity. |
| System Design | A repeatable interview method, capacity estimates, a URL-shortener HLD case, and an inventory-reservation LLD case. |

These are focused additions, not completion of every row in the workbook or
all 36 roadmap phases. The broader gap assessment below remains the roadmap
baseline; each phase still needs its own lesson-level review before it can be
marked complete.

## Phase-by-phase coverage

| Phase | Supplied topics | Coverage | Main gaps |
|---|---|---|---|
| 01 — C# Fundamentals & Advanced C# | Types, nullability, OOP, SOLID, generics, collections, LINQ, delegates, expressions | **Strong core** | Boxing, `ref`/`out`/`in`, virtual dispatch/hiding, extension methods, explicit OOP pillars |
| 02 — .NET / ASP.NET Core | Tasks, cancellation, concurrency, CLR, configuration, logging, DI, middleware, EF, HTTP resilience | **Partial** | GC generations/disposal/thread pool are not explicit in the supplied topics; several ASP.NET controller/model-binding details are absent |
| 03 — REST API + Web Fundamentals | REST, verbs, DTO validation, ProblemDetails, pagination, idempotency, routing | **Partial** | HTTP status-code decisions, Controller/ControllerBase, `[ApiController]`, CORS and browser fundamentals |
| 04 — SQL / Database Engineering | Relational modeling, joins, aggregates, transactions, indexes, plans, statistics | **Partial** | Database-platform breadth and explicit query exercises/error diagnosis |
| 05 — MS SQL Server | CTE/window functions, isolation, locks, deadlocks, indexes, execution plans, parameterization | **Strong core** | Named scenario queries, SQL error numbers, stored procedure vs function |
| 06 — PostgreSQL | No PostgreSQL-specific topic | **Missing** | PostgreSQL query plans, indexes, transactions, JSONB, operational differences |
| 07 — Angular | Components, binding, lifecycle, services, HTTP, routing, forms, RxJS, Signals, change detection | **Strong core** | Ensure cancellation, operator semantics, error handling, token expiry and large-app state are taught as separate lessons |
| 08 — JavaScript / TypeScript | TypeScript appears only through Angular topics | **Missing as a phase** | JavaScript runtime/event loop, promises, closures, modules, TypeScript narrowing, unions, generics and compiler settings |
| 09 — Testing & Quality | Not explicit in the supplied topic inventory | **Missing** | Unit/integration/contract tests, test doubles, test strategy, CI quality gates |
| 10 — Azure | Compute, storage/SQL, deployment slots, Service Bus, Key Vault, APIM, Monitor, DR, cost | **Strong core** | Add hands-on architecture decisions and failure/cost scenarios |
| 11 — Git / GitHub / Copilot | No topic | **Missing** | Branching, merges, conflicts, pull requests, code review, safe AI-assisted development |
| 12 — Docker / DevOps / CI-CD | No topic | **Missing** | Containers, images, pipelines, artifacts, deployment strategies, secrets in CI |
| 13 — MongoDB | No topic | **Missing** | Document modeling, indexes, consistency and query patterns |
| 14 — Elasticsearch | No topic | **Missing** | Mapping, analyzers, inverted indexes, relevance and indexing lifecycle |
| 15 — Software Design & Architecture | Clean Architecture, capacity, scaling, trade-offs | **Partial** | Boundaries, quality attributes, ADRs, modular monolith and migration strategy |
| 16 — Design Patterns | SOLID, Factory, Strategy, Adapter, Decorator, Repository, Unit of Work, CQRS | **Strong core** | Observer and pattern-selection/refactoring examples |
| 17 — DDD / CQRS / Event Sourcing | CQRS and Mediator; DDD/event sourcing are not explicit | **Partial** | Aggregates, entities/value objects, bounded contexts, domain events, event sourcing and projections |
| 18 — Distributed Systems | Queues, resilience, event-driven design, observability | **Partial** | Delivery semantics, ordering, consistency, partitions, clock/failure assumptions |
| 19 — Microservices | Phase named, but no dedicated microservices topic in the new inventory | **Missing as a named topic group** | Service boundaries, ownership, communication, deployment, discovery, failure isolation |
| 20 — Kafka / Messaging | Queues and event-driven design; Service Bus elsewhere | **Partial** | Kafka partitions, offsets, consumer groups, retention, ordering and replay |
| 21 — Caching / Redis / Performance | Caching/CDN and scaling | **Partial** | Redis data structures, invalidation, stampede prevention, profiling and capacity measurement |
| 22 — Security | CIA, threat modeling, auth, OAuth/OIDC/JWT, RBAC, XSS/CSRF, injection, secrets/TLS, AI prompt injection, rate limits | **Strong core** | CORS, Entra integration, password storage, API keys, browser token storage, SSRF mitigations in depth |
| 23 — Observability / Production Engineering | Health checks, OpenTelemetry, Monitor, audit, secure logs | **Partial** | SLI/SLOs, alert design, incident response, traces/metrics/log correlation, production diagnostic workflows |
| 24 — Enterprise Integration / Workflow | Queues, background services, messaging, AI tools | **Partial** | Workflow state, retries/compensation, outbox/inbox and integration contracts |
| 25 — Data Engineering | No topic | **Missing** | Ingestion, batch/stream processing, data quality, lineage and warehouse/lake concepts |
| 26 — AI / Machine Learning Fundamentals | No foundational ML topic | **Missing** | Training vs inference, evaluation, features, model limitations and lifecycle |
| 27 — Generative AI / LLM | Tokens, prompts, safety, Semantic Kernel, RAG, MCP, agents and tools | **Strong core** | Evaluation, privacy boundaries, grounding quality and operational cost controls |
| 28 — Ollama / Local AI | No topic in the supplied inventory | **Missing** | Local model setup, resource limits, model selection, API compatibility and privacy trade-offs |
| 29 — RAG / Vector Search | RAG, vector databases, embeddings | **Strong core** | Retrieval evaluation, chunking experiments, hybrid search and access-filter tests |
| 30 — AI Agents / AI-powered Applications | Multi-agent workflows and function/tool use | **Strong core** | Tool authorization, bounded autonomy, auditability and human approval |
| 31 — System Design | Requirements, estimates, scaling, caching, queues, resilience and observability | **Strong core** | Worked designs with calculations and explicit constraints |
| 32 — System Design Case Studies | No named case-study set | **Missing** | End-to-end cases such as order processing, chat, search, notification and document ingestion |
| 33 — Solution / Enterprise Architecture | Clean Architecture and architecture topics | **Partial** | Context maps, integration choices, governance, evolution and architecture review |
| 34 — Leadership / Tech Lead / Architect | No topic | **Missing** | Technical decisions, mentoring, conflict, prioritization, incident leadership and communication |
| 35 — Interview Preparation | Questions are present, but no practice/review workflow | **Partial** | Mock interviews, answer feedback, spaced revision and project-story preparation |
| 36 — Enterprise Capstone Project | No capstone specification | **Missing** | Integrated requirements, architecture, implementation milestones, quality gates and operational acceptance |

## Important gaps in the supplied interview-question coverage

The following were asked for in the accompanying interview bank but are not
clear, standalone topics in the new inventory. Add them explicitly or link them
to a lesson that teaches them in depth:

- **C#/.NET:** boxing/unboxing; value/reference assignment details; `ref`, `out`,
  and `in`; overloading vs overriding and `virtual`/`override`/`new`; OOP pillars;
  extension methods; thread-pool starvation; `ConfigureAwait(false)`; GC
  generations; `IDisposable`; memory-leak diagnosis.
- **ASP.NET Core:** Controller vs ControllerBase; `[ApiController]`; model
  validation; middleware vs filters; HTTP status-code selection; response
  result types.
- **Security:** CORS; Microsoft Entra ID and API integration; API-key
  limitations; password hashing; access/refresh token expiration; safe browser
  token storage. The new inventory combines “OAuth 2.0, OIDC and JWT”; teach
  these as **three related but distinct lessons** (authorization framework,
  authentication protocol, and token format/validation).
- **API concurrency:** SQL Server `rowversion`; conflict resolution; PUT vs
  PATCH; request idempotency vs avoiding unnecessary writes in an idempotent
  PUT. Keep these distinctions separate.
- **Microservices:** circuit breaker, retry, timeout/deadline, saga, distributed
  transactions, duplicate delivery, outbox/inbox, and monolith-vs-microservices
  decision.
- **SQL Server:** second-highest salary, top-N per department, duplicates,
  above-department-average queries, `ROW_NUMBER` vs `RANK` vs `DENSE_RANK`,
  SQL error 2601/2627 (duplicate key), 547 (foreign-key conflict), 1205
  (deadlock victim), stored procedure vs function, and INNER vs LEFT JOIN.
- **Angular:** Observable vs Promise; cancellation; `forkJoin` vs
  `combineLatest` vs `merge`; error handling; interceptors and token expiry;
  lifecycle hooks; route guards; forms; component communication; state
  management.
- **Quality/operations:** testing strategy and doubles; production incident
  response; slow API diagnosis; high CPU/memory investigation; database
  failure handling; logging and monitoring.

Some of these may already appear in the earlier workbook-derived course or
application lesson data. This audit says they are **not explicit in the new
topic inventory**, not that no related content exists anywhere in the repo.
Reconcile the current application catalog and printable guide against one
canonical topic list before marking a topic complete.

## Recommended sequencing

1. Keep the 36 phases as the roadmap headings.
2. Add lesson-level topics for every phase marked Missing or Partial.
3. Keep one central concept per lesson; use “related concepts” only for
   comparison, not as a reason to teach separate protocols or patterns in one
   shallow page.
4. Give each lesson a stable ID and map it to one phase and, when relevant,
   one interview-bank question.
5. Prioritize the first ten phases for the Full Stack .NET interview path;
   treat databases, Azure, security, testing, architecture and production
   engineering as required senior depth.

## Required lesson-document format

Use the copyable
[topic lesson template](TOPIC_LESSON_TEMPLATE.md) for each lesson. It follows
the requested 16-part interview-preparation format and requires a meaningful
diagram, an explained example, counter-question answers, an architect-level
scenario, and concise revision material.
