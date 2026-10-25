# Module 12 — Architecture and Senior-Engineer Practice

**Workbook alignment:** Day 2 (OOP/SOLID), Days 25–30 (patterns, system
design, leadership, and capstone). Related tracker topics: T111–T120.

## T111 — Requirements, constraints, and capacity estimation

- **What:** Requirements state user outcomes; constraints include scale,
  privacy, budget, latency, and operations.
- **Why:** Architecture choices should solve the real problem rather than
  maximize technology count.
- **When:** Clarify functional/nonfunctional needs before choosing a database,
  queue, model, or host.
- **Limits:** Estimates are uncertain; state assumptions and revise with
  measurements.
- **Diagram:** `user outcome + constraints -> acceptance criteria -> design`
- **Project example (implemented as roadmap):** provider privacy/cost and
  gated-user requirements are documented in
  [PROJECT_ROADMAP.md](../../PROJECT_ROADMAP.md).
- **Reference:** [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)

## T112 — Modular monolith vs. microservices

- **What:** A modular monolith is one deployable app with clear internal
  boundaries; microservices split independently deployed services.
- **Why:** The project needs a simple learning platform without premature
  distributed operations.
- **When:** Keep a modular monolith until independent scaling, ownership, or
  deployment needs justify a service boundary.
- **Limits:** A monolith can become tangled without boundaries; microservices
  add network failure, observability, data consistency, and deployment costs.
- **Diagram:** `one deployable -> API / application / adapters / persistence modules`
- **Project example (chosen direction):** the current API uses service and
  provider boundaries within one ASP.NET Core application.
  [architecture.md](../architecture.md)
- **Reference:** [Monolith first](https://martinfowler.com/bliki/MonolithFirst.html)

## T113 — SOLID and pragmatic design-pattern selection

- **What:** Encapsulation hides implementation details behind a clear contract;
  SOLID is a set of heuristics for responsibility, extension,
  substitutability, interface size, and dependency direction.
- **Why:** It helps keep orchestration independent from provider protocol
  details and makes changes local to the adapter.
- **When:** Apply the principle that addresses a real change or testing
  pressure; use composition before inheritance for replaceable behavior.
- **Limits:** Applying every acronym mechanically creates needless
  abstractions; principles involve trade-offs.
- **Diagram:** `controller -> application contract <- provider adapter`
- **Project example (implemented):** `ChatApiService` depends on
  `IAICompletionProviderSelector`, not a concrete provider.
  [ChatApiService.cs](../../Services/ChatApiService.cs) depends on the contract;
  [OpenAIChatCompletionProvider.cs](../../Services/OpenAIChatCompletionProvider.cs)
  encapsulates its configuration and HTTP details behind the adapter.
- **Reference:** [Dependency inversion principle](https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)

## T114 — Strategy, Factory, Adapter, Decorator, and Mediator

- **What:** Strategy swaps behavior; Factory creates/selects objects; Adapter
  translates an interface; Decorator wraps behavior; Mediator centralizes
  dispatch between requests and handlers.
- **Why:** Provider selection needs stable orchestration and provider-specific
  protocol translation.
- **When:** Use a pattern when its problem appears in the code, not because the
  pattern is fashionable.
- **Limits:** Pattern names do not guarantee good design; extra layers make
  debugging and onboarding harder. A mediator framework is not justified for
  a small service with one use case.
- **Diagram:** `selector (factory-like) -> provider strategy -> adapter -> HTTP`
- **Project example (implemented):** selector chooses a provider strategy;
  each provider adapter translates the shared request. No Decorator is needed
  yet. [AICompletionProviderSelector.cs](../../Services/AICompletionProviderSelector.cs)
- **Reference:** [Adapter pattern](https://learn.microsoft.com/azure/architecture/patterns/adapter)

## T115 — Repository and Unit of Work trade-offs

- **What:** A repository provides a use-case-focused data access boundary;
  Unit of Work groups persistence changes.
- **Why:** Ownership and conversation operations need consistent data access.
- **When:** Add a repository when it clarifies application queries or
  authorization; EF `DbContext` already provides Unit-of-Work-like behavior.
- **Limits:** A generic repository can hide useful EF queries and duplicate
  `DbSet`/`SaveChanges`; do not add one automatically.
- **Diagram:** `use case -> conversation repository -> DbContext -> SQL`
- **Project example (planned — key105):** define repositories around actual
  user/history use cases; the current project has no database.
- **Reference:** [Repository pattern](https://learn.microsoft.com/azure/architecture/patterns/repository)

## T116 — DDD boundaries, aggregates, and invariants

- **What:** Domain-driven design models business concepts; an aggregate
  protects invariants through a consistency boundary.
- **Why:** Conversation ownership and account state impose rules that should
  not be scattered across controllers.
- **When:** Use domain modeling where rules are complex enough to benefit from
  explicit boundaries.
- **Limits:** DDD ceremony is unnecessary for simple data flows; do not turn
  every table into an aggregate.
- **Diagram:** `Conversation aggregate -> owner + ordered messages -> invariant checks`
- **Project example (planned — key105):** conversation operations must enforce
  owner access and bounded message context.
- **Reference:** [DDD-oriented microservice architecture](https://learn.microsoft.com/dotnet/architecture/microservices/)

## T117 — API/database/cache/failure-mode system design

- **What:** System design connects components, data ownership, traffic, and
  failure behavior to user requirements.
- **Why:** AI, database, and identity dependencies can fail independently.
- **When:** Draw request/data flows and identify bottlenecks and trust
  boundaries before adding services.
- **Limits:** Diagrams are models, not proof; confirm assumptions with
  measurements and failure tests.
- **Diagram:** `Angular -> API/auth -> chat service -> SQL + selected AI provider`
- **Project example (implemented/target):** current and target flows are in
  [architecture.md](../architecture.md).
- **Reference:** [Azure architecture center](https://learn.microsoft.com/azure/architecture/)

## T118 — Design reviews, ADRs, estimation, and prioritization

- **What:** An ADR records context, a decision, alternatives, consequences,
  and revisit criteria.
- **Why:** Provider and hosting choices affect privacy, cost, and future
  change.
- **When:** Write ADRs for consequential choices; keep feature tasks and
  acceptance gates in the roadmap.
- **Limits:** ADRs record reasoning, not implementation correctness; revisit
  decisions when assumptions change.
- **Diagram:** `context -> options -> criteria -> decision -> consequences`
- **Project example (implemented):** provider choice is recorded in
  [ADR 0002](../decisions/0002-ai-provider-selection.md).
- **Reference:** [Documenting architecture decisions](https://adr.github.io/)

## T119 — Mentoring, code review, and technical communication

- **What:** Technical communication explains a decision in audience-appropriate
  terms and invites useful review.
- **Why:** Senior engineers align people around outcomes and trade-offs, not
  just tools.
- **When:** Explain why a change is needed, what changed, what remains
  uncertain, and how it was verified.
- **Limits:** Avoid jargon without context and avoid claiming checks/features
  that were not performed or implemented.
- **Diagram:** `context -> options/trade-offs -> decision -> evidence -> learning`
- **Project example (implemented as learning workflow):** this guide ties each
  concept to code and labels planned work instead of presenting it as done.
- **Reference:** [Google engineering practices: code review](https://google.github.io/eng-practices/review/)

## T120 — Production incident ownership and interview walkthrough

- **What:** Incident ownership coordinates mitigation, communication, recovery,
  and learning; an interview walkthrough explains a system and its trade-offs.
- **Why:** Production engineering includes responding to failures, not only
  writing features.
- **When:** Use runbooks during incidents and prepare a concise narrative from
  requirements through operations for the capstone.
- **Limits:** Do not speculate during an incident; gather evidence, protect
  data, and document follow-up.
- **Diagram:** `detect -> assess -> mitigate -> recover -> review -> improve`
- **Project example (planned — key110):** provider outage and deployment
  runbooks are part of the capstone, not current artifacts.
- **Reference:** [Google SRE book](https://sre.google/sre-book/table-of-contents/)

## Workbook implementation connection

The provider interface and selector are examples of pragmatic SOLID and
Strategy/Adapter boundaries. Persistence, operations, and incident scenarios
will be added only when their feature keys require them. The capstone should
demonstrate working user outcomes and explain what was intentionally left out.

## Worked examples and practice

### T111 — Turn a request into measurable requirements

Before choosing a queue or database, write down the user outcome and
constraints. For this app: a user submits source code and receives an
explanation; data handling, maximum input size, response latency, model cost,
and accessibility constrain the solution.

```text
need -> acceptance: valid code gets an explanation or a clear bounded error
constraints -> privacy + size + latency + cost + supportability
```

**Self-check:** Why is "use microservices" not a user requirement? **Answer:**
it is an implementation choice that needs a concrete outcome to justify it.

### T112 — Start with clear modules in one deployable

A modular monolith can keep API, application orchestration, provider
adapters, and persistence boundaries distinct while deploying one application.
Split a module into a service only when independent scaling, ownership, or
deployment benefits exceed network and operational costs.

```text
one ASP.NET deployment
  API -> application service -> provider contract -> adapters
```

**Self-check:** Do separate folders automatically create microservices?
**Answer:** no; they are code organization within one deployable.

### T113 — Apply SOLID as a design heuristic

The provider selector and provider interface create a seam because provider
protocols vary. That is useful dependency inversion. Do not create an
interface for every class: use abstractions where substitution, testing, or a
real change boundary benefits from one.

```text
orchestration -> IAICompletionProvider -> provider-specific adapter
```

**Self-check:** Does adding more interfaces automatically improve design?
**Answer:** no; each abstraction has a maintenance and navigation cost.

### T114 — Recognize patterns in working code

The provider adapters translate a shared contract to provider protocols
(Adapter); the selector chooses an implementation (factory-like selection);
the chosen provider supplies a strategy. A decorator would wrap behavior such
as metrics, but it is not needed until that concern exists.

```text
selector -> chosen strategy/adapter -> HTTP
```

**Self-check:** Should a Mediator library be added for one simple operation?
**Answer:** not unless it solves a concrete dispatch or coordination problem.

### T115 — Add repositories only for useful boundaries

EF Core's `DbContext` already tracks changes and saves a unit of work. A
repository can be useful if it expresses domain-specific queries or isolates
an important persistence boundary, but a generic wrapper around every
`DbSet` can hide useful capabilities.

```text
use case -> conversation query boundary -> DbContext -> SQL
```

This is a future key105 design, not current code.
**Self-check:** Does wrapping `DbContext` in `IRepository<T>` automatically
make persistence testable or clean? **Answer:** no; evaluate whether it adds
clarity and useful behavior.

### T116 — Put invariants at the consistency boundary

An invariant is a rule that must always hold, such as a message belonging to
the conversation it is appended to, or a caller owning that conversation.
The API must enforce authorization, while a domain boundary can protect
valid state transitions. Do not load and expose another tenant's data before
checking ownership.

```text
Conversation operation: owner matches AND sequence is valid -> append message
```

**Self-check:** Is a database foreign key the same as an ownership check?
**Answer:** no; the foreign key ensures existence, not caller permission.

### T117 — Draw a request path and failure behavior

For each component, ask what it owns and what happens when it fails. The API
can reject invalid input; the provider can time out; persistence can reject an
unauthorized conversation. Each failure needs a bounded, safe response and
diagnostic signal.

```text
browser -> API/auth -> validation -> chat orchestration -> provider
                                      \-> persistence (future)
provider timeout -> safe error + trace ID; no credential in response
```

**Self-check:** Does an architecture diagram prove behavior under failure?
**Answer:** no; validate assumptions with implementation and targeted tests.

### T118 — Record decisions and revisit conditions

An ADR should state context, alternatives, decision, consequences, and what
would justify revisiting it. The provider ADR records why configurable
adapters are used and what trade-offs remain; it is not a substitute for
measuring provider quality.

```text
context -> options -> decision criteria -> choice -> consequences/revisit trigger
```

**Try it:** What might trigger revisiting the provider decision? **Answer:**
changed privacy requirements, cost, availability, model quality, or provider
support.

### T119 — Communicate with evidence and uncertainty

A useful review summary states the problem, the smallest intended change,
trade-offs, and validation performed. Separate facts from plans; for example,
an OpenAPI page is evidence of a generated contract, not proof that the
provider integration passed a live test.

```text
context -> change -> alternatives/trade-off -> validation evidence -> open risks
```

**Self-check:** Should a status report say "tested" if only the application
built? **Answer:** no; name the build check and state that runtime tests were
not performed.

### T120 — Explain and respond to production behavior

An incident walkthrough should identify impact, evidence, mitigation, owner,
and follow-up. An interview walkthrough can use the same structure: user
problem, architecture, key decision, failure handling, and what you would
improve after measuring.

```text
detect -> assess impact -> mitigate safely -> recover -> learn -> track actions
```

**Self-check:** Should an engineer guess at a root cause before collecting
evidence? **Answer:** no; state what is known, mitigate impact, and investigate
from logs and traces.
