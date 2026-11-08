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

## Worked examples and practice

These are learning examples, not newly added tests. Provider/API mocking stays
deferred as requested.

### T071 — Assert behavior, not private implementation

Test the observable outcome of a pure rule. The test name should say what
behavior matters; avoid asserting private helper calls or local variable
names.

```csharp
[Fact]
public void Blank_code_is_rejected()
{
    var result = ValidateCode("  ");

    Assert.False(result.IsValid);
}
```

**Self-check:** If the implementation is refactored but the behavior stays
correct, should this test fail? **Answer:** no.

### T072 — Integration tests trace the real HTTP boundary

An integration test starts a test host and sends an HTTP request through
routing, serialization, middleware, and application services. It answers
questions a unit test cannot, such as whether the route and JSON contract
actually work together. This project's API integration tests remain deferred.

```text
HTTP request -> ASP.NET test host -> endpoint -> controlled dependency -> HTTP response
```

**Self-check:** Does calling a controller method directly test JSON binding?
**Answer:** no; that bypasses the HTTP boundary.

### T073 — Understand a test double without adding one yet

A fake is a controlled implementation; a stub returns predetermined answers;
a mock typically verifies interactions. They isolate nondeterministic external
systems, but can model them incorrectly. For this project, do not add provider
fakes until the deferred testing key is resumed.

```text
production: adapter -> HTTP transport -> provider
test idea:   adapter -> controlled transport -> canned HTTP response
```

**Self-check:** Does a canned response prove the live provider is available?
**Answer:** no; it tests the adapter's behavior against a known response.

### T074 — Test the selected relational engine

A database integration test should apply migrations to a disposable instance
of the actual selected provider, then check constraints and queries. An
in-memory collection cannot prove SQL translation or relational constraint
behavior.

```text
empty SQL instance -> apply migrations -> insert fixture -> query/assert -> dispose
```

**Self-check:** Why verify migrations against an empty database? **Answer:**
it confirms a fresh environment can be created reproducibly.

### T075 — Pin the serialized contract

Contract tests check the JSON that consumers actually receive, including
property names and relevant status codes. This is important when the Angular
client and API might be deployed at different times.

```json
{"success":true,"message":"OK","result":{}}
```

This is a schematic `Result` shape; verify the actual serializer output
before treating it as a contract. **Self-check:** Can valid JSON still break a
client? **Answer:** yes; a renamed or semantically changed field can be
breaking.

### T076 — Separate adapter correctness from model quality

Tests should assert stable behavior such as prompt role mapping, error
translation, cancellation, and output limits. Model quality belongs in a
versioned evaluation set with a rubric because prose can vary.

```text
adapter test -> stable protocol behavior
quality eval -> correctness / clarity / unsupported-claim rubric
```

**Self-check:** Should a unit test compare an AI answer to one exact sentence?
**Answer:** generally no; exact prose is probabilistic and brittle.

### T077 — Test one important browser journey

An E2E test should exercise what a user sees: open the page, enter code,
submit, observe loading, then see a result or error. Use a controlled API so
the test is repeatable and does not spend money on live inference.

```text
browser action -> UI state -> API response -> visible assertion
```

**Self-check:** Why keep E2E coverage selective? **Answer:** browser tests are
slower and more environment-sensitive than focused tests.

### T078 — CI provides repeatable gates

CI should run the same restore/build/test/format commands documented for
developers. A green status means those configured checks passed for that
revision; it does not mean every behavior is tested.

```text
pull request -> restore -> build -> tests -> report -> review/merge decision
```

**Self-check:** Can CI prove that an untested authorization rule is correct?
**Answer:** no.

### T079 — Treat scan findings as evidence to triage

Dependency scanning compares packages with known advisories; secret scanning
looks for credential-like material. Confirm findings, update or mitigate
packages, and rotate any credential that may have been exposed. A scanner
cannot guarantee a repository is safe.

**Self-check:** If a secret was removed in a later commit, is the leaked
credential safe? **Answer:** no; it may remain in history or external copies,
so revoke/rotate it.

### T080 — Review against acceptance criteria

Review a feature by tracing the user outcome, error behavior, security
boundary, maintainability, docs, and validation. Keep an ADR for a decision
with meaningful alternatives or long-term consequences; avoid a document for
every small implementation detail.

```text
requirement -> diff -> evidence (build/test/manual check) -> docs -> decision
```

**Self-check:** Does a clean diff alone prove a feature works? **Answer:**
no; run the relevant build and behavior checks.
