# Module 08 — Testing, Maintainability, and Engineering Workflow

**Workbook alignment:** Day 12 (unit/integration tests, fakes, logging, and
boundaries). Related tracker topics: T071–T080.

## T071 — Unit tests and behavior-focused assertions

- **What:** A unit test checks one behavior with controlled collaborators.
- **Why:** It catches regressions without starting a provider or database.
- **When:** Test deterministic rules such as validation, mapping, and selector
  behavior.
- **Limits:** Tests that mirror implementation details break during harmless
  refactors; assertions should describe behavior.
- **Diagram:** `input + fake dependency -> unit -> expected outcome`
- **Project example (planned — key107):** add tests for completion mapping and
  configured provider selection. There is no test project yet.
- **Reference:** [.NET testing](https://learn.microsoft.com/dotnet/core/testing/)

## T072 — Integration tests for ASP.NET Core APIs

- **What:** Integration tests exercise multiple app layers through an HTTP
  request.
- **Why:** They verify routing, JSON binding, middleware, and response status
  together.
- **When:** Cover a few high-value API contracts with a controlled provider.
- **Limits:** Avoid network calls and real hosted inference in routine tests;
  integration suites take longer than focused unit tests.
- **Diagram:** `test host -> HTTP request -> controller + service + fake provider`
- **Project example (deferred — key101/key107):** user chose to skip fake HTTP
  and API mocking for now; the endpoint has not been integration-tested.
- **Reference:** [Integration tests in ASP.NET Core](https://learn.microsoft.com/aspnet/core/test/integration-tests)

## T073 — HTTP fakes, test doubles, and provider isolation

- **What:** A fake or stub replaces an external dependency with predictable
  behavior.
- **Why:** Provider tests should not require an internet connection, API key,
  or local model.
- **When:** Fake `HttpMessageHandler` responses to check request shape,
  parsing, errors, and cancellation.
- **Limits:** Fakes can miss real service incompatibilities; pair them with
  occasional opt-in smoke tests.
- **Diagram:** `provider adapter -> fake handler -> controlled response`
- **Project example (deferred by request):** named HTTP clients create the
  transport seam, but no fake handler or provider adapter tests were added.
- **Reference:** [Unit testing best practices](https://learn.microsoft.com/dotnet/core/testing/unit-testing-best-practices)

## T074 — Database integration tests and migration verification

- **What:** Database integration tests run against the actual database
  provider or a faithful disposable instance.
- **Why:** SQL translation, constraints, and migrations differ from in-memory
  collections and mock behavior.
- **When:** Test migrations on empty databases and data-access behavior against
  the selected SQL engine.
- **Limits:** They need isolated databases and cleanup; EF InMemory does not
  behave like relational SQL.
- **Diagram:** `migration -> disposable SQL -> repository query/assertion`
- **Project example (planned — key105/key107):** verify conversation ownership,
  migration application, and pagination against the chosen SQL provider.
- **Reference:** [Testing EF Core applications](https://learn.microsoft.com/ef/core/testing/)

## T075 — Contract tests and serialization compatibility

- **What:** Contract checks verify that API request and response shapes remain
  compatible with consumers.
- **Why:** Angular and API deployments may not happen together.
- **When:** Pin important JSON fields/statuses and test OpenAPI or real
  serialization where it matters.
- **Limits:** A schema match does not guarantee semantics or useful error
  behavior.
- **Diagram:** `API implementation -> serialized JSON -> client contract`
- **Project example (planned — key101/key107):** `Result.Data` is serialized as
  `result`; add checks before changing the envelope.
  [Result.cs](../../Responses/Result.cs)
- **Reference:** [OpenAPI specification](https://spec.openapis.org/oas/latest.html)

## T076 — Deterministic tests for probabilistic AI behavior

- **What:** Deterministic tests assert stable boundaries while treating model
  prose as variable.
- **Why:** Exact generated wording changes across models and versions.
- **When:** Assert request composition, safety rules, schema validity, and
  rubric thresholds rather than exact narrative text.
- **Limits:** A fake response verifies adapter behavior, not actual model
  quality; evaluation needs representative examples.
- **Diagram:** `fixed input -> controlled fake` for code behavior; `dataset -> rubric` for quality
- **Project example (deferred/planned — key107/key108):** no evaluation corpus
  or provider fake exists yet.
- **Reference:** [OpenAI evaluations](https://platform.openai.com/docs/guides/evals)

## T077 — Playwright end-to-end tests

- **What:** E2E tests operate the application through a real browser.
- **Why:** They can verify visible states, keyboard flows, and client/API
  integration.
- **When:** Automate a small number of critical user journeys.
- **Limits:** Browser tests can be brittle and slow; isolate data and avoid
  live model calls.
- **Diagram:** `Playwright browser -> Angular UI -> controlled API -> assertion`
- **Project example (planned — key103/key107):** test signed-out gating and
  submit-to-response using a controlled test API/session.
- **Reference:** [Playwright for .NET](https://playwright.dev/dotnet/)

## T078 — CI build, tests, formatting, and artifacts

- **What:** Continuous integration runs repeatable checks on every change.
- **Why:** It catches build or quality failures before merge.
- **When:** Add build/test/format/security jobs when the required commands and
  projects are defined.
- **Limits:** Green CI only proves configured checks pass; it cannot prove
  missing scenarios are correct.
- **Diagram:** `pull request -> restore -> build -> tests -> review gate`
- **Project example (planned — key107):** repository currently has no CI
  workflow. Do not claim test gates are passing.
- **Reference:** [GitHub Actions for .NET](https://learn.microsoft.com/dotnet/devops/dotnet-github-action)

## T079 — Dependency/secret scanning and supply-chain checks

- **What:** Scanning checks dependencies and repository changes for known
  vulnerabilities or exposed credentials.
- **Why:** A package or committed key can compromise a deployment.
- **When:** Run automated checks in CI and rotate a credential if exposure is
  suspected.
- **Limits:** Scanners have false positives and cannot replace updates,
  review, least privilege, or secret hygiene.
- **Diagram:** `source + dependencies -> scanner -> findings -> triage/fix`
- **Project example (planned — key106/key107):** no scanning workflow is
  configured; real provider credentials must remain outside tracked files.
- **Reference:** [GitHub dependency review](https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review)

## T080 — Code review, PR gates, and technical documentation

- **What:** Review checks correctness, risk, maintainability, and whether
  decisions are explained.
- **Why:** A learning project should make reasoning visible, not only compile.
- **When:** Review each feature against acceptance criteria and update linked
  docs in the same change.
- **Limits:** Review is not a substitute for running code or tests; excessive
  process can slow small safe changes.
- **Diagram:** `change -> build/test -> peer review -> merge -> demo`
- **Project example (implemented as project guidance):** release workflow and
  decision records are described in [PROJECT_ROADMAP.md](../../PROJECT_ROADMAP.md)
  and [ADR index](../decisions/README.md).
- **Reference:** [GitHub pull request reviews](https://docs.github.com/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests)

## Workbook implementation connection

Automated tests are intentionally not being implemented in this documentation
step. Provider/API fakes are explicitly deferred by the user; the guide marks
them deferred rather than treating the successful build or Swagger check as
test coverage.
