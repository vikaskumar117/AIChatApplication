# Module 03 — ASP.NET Core APIs and the Web Platform

**Workbook alignment:** Day 6 (routing, validation, middleware, filters, error
contracts); Day 11 (REST and DTOs). Related tracker topics: T021–T030.

## T021 — REST resource design and HTTP method semantics

- **What:** HTTP methods and status codes communicate what a request does and
  what happened.
- **Why:** Clients need a predictable contract for submitting code and handling
  errors.
- **When:** Use `POST` for the current explain operation; use resource-oriented
  `GET`, `POST`, `PATCH`, and `DELETE` when conversation resources arrive.
- **Limits:** REST does not require every operation to be CRUD; avoid inventing
  resource endpoints that obscure an action.
- **Diagram:** `client POST /api/chat/explain -> validate -> provider -> response`
- **Project example (implemented):** [ChatController.cs](../../Controllers/ChatController.cs)
  exposes `POST /api/chat/explain`.
- **Reference:** [HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)

## T022 — Routing, model binding, and request pipeline

- **What:** Routing chooses an endpoint; model binding converts HTTP data into
  action parameters; middleware runs around endpoint execution.
- **Why:** These boundaries determine how JSON reaches the controller and how
  cross-cutting policies run.
- **When:** Keep route and binding rules at the API boundary and application
  behavior in services.
- **Limits:** Binding is not business validation or authorization.
- **Diagram:** `HTTP -> middleware -> route -> JSON binding -> controller -> response`
- **Project example (implemented):** the controller uses `[Route]`,
  `[HttpPost]`, and `[FromBody]`; [Program.cs](../../Program.cs) maps controllers.
- **Reference:** [ASP.NET Core request pipeline](https://learn.microsoft.com/aspnet/core/fundamentals/middleware/)

## T023 — Request/response DTOs and API compatibility

- **What:** A DTO is a deliberate data shape crossing an API boundary.
- **Why:** Public JSON should not expose internal entities or provider wire
  formats.
- **When:** Define DTOs for requests/responses and version changes that break
  existing consumers.
- **Limits:** Duplicating every internal type can add mapping work; share only
  stable, intentional contracts.
- **Diagram:** `HTTP DTO -> application model -> provider request`
- **Project example (implemented):** `CodeRequest` is the API request; provider
  messages use a separate `AICompletionRequest`.
  [ChatController.cs](../../Controllers/ChatController.cs) · [AICompletionRequest.cs](../../Services/AICompletionRequest.cs)
- **Reference:** [Create web APIs with ASP.NET Core](https://learn.microsoft.com/aspnet/core/web-api/)

## T024 — Server-side validation and input limits

- **What:** Validation checks that input satisfies required shape and business
  rules; limits bound resource use.
- **Why:** Browser validation can be bypassed and model calls have cost.
- **When:** Validate at the API boundary before persistence or provider calls.
- **Limits:** Validation rules need documented limits and helpful errors; the
  current key101 validation/length work is incomplete.
- **Diagram:** `untrusted request -> validation -> reject 400 | application`
- **Project example (current behavior):** [ChatApiService.cs](../../Services/ChatApiService.cs)
  rejects blank code. Maximum-size rules are planned in key101/key106; do not
  claim they exist yet.
- **Reference:** [Model validation in ASP.NET Core](https://learn.microsoft.com/aspnet/core/mvc/models/validation)

## T025 — Middleware ordering and exception handling

- **What:** Middleware is an ordered chain that can inspect, change, or stop
  requests and responses.
- **Why:** Central exception handling should wrap endpoint execution.
- **When:** Put cross-cutting behavior in middleware when it applies to the
  whole HTTP pipeline.
- **Limits:** Ordering changes behavior. Middleware is not a substitute for
  endpoint-specific validation.
- **Diagram:** `exception handler [ HTTPS [ auth [ endpoint ] ] ]`
- **Project example (implemented):** `UseExceptionHandler()` runs before
  endpoints in [Program.cs](../../Program.cs).
- **Reference:** [ASP.NET Core middleware](https://learn.microsoft.com/aspnet/core/fundamentals/middleware/)

## T026 — Problem Details and consistent error contracts

- **What:** Problem Details is a standard JSON shape for HTTP errors; an
  application may also define a stable envelope.
- **Why:** Clients need consistent status and error fields without internal
  stack traces.
- **When:** Choose one public error contract and document when each status is
  returned.
- **Limits:** Registering Problem Details does not make every controller
  response use that shape. This project currently returns `Result` in its
  exception handler, so consistency remains work.
- **Diagram:** `internal exception -> structured log -> safe public error`
- **Project example (implemented, consistency follow-up):**
  [ApiExceptionHandler.cs](../../Middleware/ApiExceptionHandler.cs) writes a
  `Result`; [Result.cs](../../Responses/Result.cs) defines the envelope.
- **Reference:** [Problem Details in ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/error-handling-api)

## T027 — OpenAPI and Swagger

- **What:** OpenAPI is a machine-readable API description; Swagger UI renders
  it as an interactive browser.
- **Why:** Developers can inspect routes and try requests without a separate
  client.
- **When:** Use it during local development and publish a reviewed API
  description where appropriate.
- **Limits:** Swagger UI does not prove runtime correctness, replace tests, or
  secure an endpoint.
- **Diagram:** `controllers + metadata -> OpenAPI JSON -> Swagger UI -> HTTP call`
- **Project example (implemented):** Swashbuckle is registered in
  [Program.cs](../../Program.cs); the UI is development-only and mounted at
  `/`. Package reference: [AIChatApplication.csproj](../../AIChatApplication.csproj).
- **Reference:** [OpenAPI in ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/openapi/aspnetcore-openapi)

## T028 — API versioning and backward compatibility

- **What:** Versioning lets clients and server evolve without silently
  breaking existing consumers.
- **Why:** A future Angular app and external clients may deploy at different
  times.
- **When:** Introduce a versioning policy when there is an actual incompatible
  contract change or multiple supported clients.
- **Limits:** Versioning every endpoint early adds maintenance and does not
  prevent poor schema changes.
- **Diagram:** `client v1 -> contract v1` · `client v2 -> contract v2`
- **Project example (planned — key101/key105):** the API currently has no
  version strategy. Before changing the response envelope or adding chat
  resources, document whether a breaking change requires a version.
- **Reference:** [API design guidance](https://learn.microsoft.com/azure/architecture/best-practices/api-design)

## T029 — Filters, endpoint metadata, and cross-cutting behavior

- **What:** MVC filters run around MVC stages; endpoint metadata describes
  endpoint behavior to tooling and middleware.
- **Why:** They can apply MVC-specific policies or document behavior without
  duplicating controller code.
- **When:** Prefer middleware for whole-pipeline policies and filters for
  MVC-specific action/result concerns.
- **Limits:** Filters do not cover every endpoint type; avoid using them to
  hide core business logic.
- **Diagram:** `middleware -> MVC filters -> action -> result filters -> response`
- **Project exercise (non-production):** trace where an MVC action filter would
  run around `ChatController`, then compare that with the existing global
  exception middleware. No custom filter is needed for this endpoint.
- **Reference:** [Filters in ASP.NET Core](https://learn.microsoft.com/aspnet/core/mvc/controllers/filters)

## T030 — Rate limiting and request-size controls

- **What:** Rate limits cap request frequency; size limits cap how much data a
  caller can send.
- **Why:** The API calls a cost-bearing provider and accepts source code.
- **When:** Add per-user and unauthenticated/IP policies before public use.
- **Limits:** IP limits can affect users behind shared NAT; rate limits do not
  replace quotas or input validation.
- **Diagram:** `request -> size gate -> rate-limit partition -> chat service`
- **Project example (planned — key106):** rate limits and explicit request-size
  controls are not currently registered in [Program.cs](../../Program.cs).
- **Reference:** [ASP.NET Core rate limiting](https://learn.microsoft.com/aspnet/core/performance/rate-limit)

## Workbook implementation connection

The current project implements routing, binding, exception middleware,
Swagger, a request DTO, and a shared `Result`. Request length limits,
consistent documented errors, versioning, filters, and rate limiting are
tracked as remaining implementation work—not implied by adding services or
packages.
