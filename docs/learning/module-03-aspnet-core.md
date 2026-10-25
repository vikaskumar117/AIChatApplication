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

### Walk-through and self-check

`POST` fits an operation that sends code and asks the server to perform work;
the request body carries the input and the response carries the explanation.
If a later feature addresses a saved conversation, that conversation can have
its own resource URL. The method and status should describe the actual result,
not just whether the controller ran.

```http
POST /api/chat/explain
Content-Type: application/json

{"code":"Console.WriteLine(\"hello\");"}
```

**Think about it:** Why not put source code in the URL? **Answer:** URLs are
for identifying resources and may be logged or cached; a potentially large
request belongs in the body of a POST operation.

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

### Walk-through and self-check

Routing selects the action using endpoint metadata; model binding deserializes
JSON to the action's parameter; middleware wraps the endpoint call. This
separation makes an HTTP request traceable instead of mixing network parsing
with provider logic.

```text
POST bytes -> exception middleware -> route match
           -> JSON to CodeRequest -> controller -> application service
```

**Think about it:** Does successful JSON binding prove the code is acceptable?
**Answer:** no. Binding checks shape/conversion; application validation checks
meaning, size, and allowed behavior.

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

### Walk-through and self-check

Treat the request DTO as a public promise and the provider DTO as an internal
protocol shape. If a provider renames a field, the browser contract should
remain stable because the adapter translates between the two.

```csharp
public sealed record ExplainCodeRequest(string Code);
public sealed record ExplainCodeResponse(string Explanation);
```

These are illustrative DTOs; use the existing project contract rather than
introducing duplicate types. **Think about it:** Why not return a provider's
raw JSON? **Answer:** it couples clients to a vendor protocol and can expose
fields not intended as part of the API.

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

### Walk-through and self-check

Validation belongs before the expensive provider call. A useful order is:
check required content, enforce the documented size limit, then execute the
use case. Do not rely only on a form's `required` attribute; a caller can send
HTTP directly.

```text
request -> required? -> within limit? -> call provider
                no          no
                +---- 400 response ----+
```

The current blank-input check is not a complete size policy. **Think about
it:** Why return a client error before calling the model? **Answer:** it saves
cost, gives actionable feedback, and keeps invalid input out of downstream
services.

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

### Walk-through and self-check

Middleware is nested: an earlier middleware can run code both before and
after the next component. Exception handling must be outside the endpoint so
it can observe exceptions thrown deeper in the pipeline.

```csharp
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
```

This is a simplified ordering sketch, not a replacement for the actual
`Program.cs`. **Think about it:** What happens if exception handling is placed
after endpoint execution? **Answer:** it cannot catch an exception that has
already escaped the endpoint.

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

### Walk-through and self-check

An error response should communicate the public failure category, while logs
retain diagnostic details on the server. Do not return stack traces, provider
credentials, or raw exception messages to a browser.

```json
{
  "title": "The request could not be completed",
  "status": 502,
  "traceId": "server-generated-correlation-id"
}
```

This is a teaching shape, not a claim that the API currently returns this
payload. **Think about it:** Is registering Problem Details enough to ensure
every error uses it? **Answer:** no; each error-producing layer must be wired
to the chosen public contract.

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

### Walk-through and self-check

Swashbuckle inspects controller routes and metadata to generate an OpenAPI
document. Swagger UI reads that document and offers a browser interface for
exploring operations. Keep in mind that the UI is a client of the API, not a
test suite or an authorization mechanism.

```text
controller attributes + DTO schemas -> OpenAPI document -> Swagger UI
                                                   \-----> generated clients
```

**Think about it:** What does the OpenAPI document help a client know?
**Answer:** paths, methods, parameters, request/response shapes, and declared
status behavior.

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

### Walk-through and self-check

An additive optional response field is often compatible with existing
clients; removing or changing the meaning of a required field may not be.
Before adopting `/v2`, identify the incompatible change and the period during
which both clients must be supported.

```text
Existing consumer -> v1 contract (keep stable)
New consumer      -> v2 contract (only when a breaking change is needed)
```

**Think about it:** Is versioning a substitute for careful API design?
**Answer:** no. It makes an intentional breaking change manageable but adds
support and retirement costs.

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

### Walk-through and self-check

Middleware surrounds the whole web pipeline; an action filter surrounds MVC
action execution. For example, a filter can inspect action arguments, while
exception middleware can handle exceptions from multiple endpoint types.
Keep business decisions in the service/use-case layer.

```text
middleware before -> authorization -> MVC filter -> action -> MVC filter
                  -> middleware after
```

**Think about it:** Should a filter decide whether a user owns a conversation?
**Answer:** the authorization/use-case layer should enforce that rule; do not
hide important business policy in a reusable MVC hook.

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

### Walk-through and self-check

A request-size cap protects memory and parsing; a rate cap protects capacity
and provider spend. These solve different problems, so an API often needs both
plus a per-user quota. A `429 Too Many Requests` response can tell a caller to
slow down, while a `413 Payload Too Large` response describes an oversized
body.

```text
HTTP body -> size check (413) -> identity/IP partition (429) -> model call
```

**Think about it:** Can one IP-based rule safely represent a user's quota?
**Answer:** not always; many people can share an IP, and one person can use
several IPs. Use authenticated identity when available and account for abuse
and fairness.

## Workbook implementation connection

The current project implements routing, binding, exception middleware,
Swagger, a request DTO, and a shared `Result`. Request length limits,
consistent documented errors, versioning, filters, and rate limiting are
tracked as remaining implementation work—not implied by adding services or
packages.
