# Module 02 — .NET Runtime, Async, and Dependency Injection

**Workbook alignment:** Days 4–5 (async, concurrency, modern .NET, DI,
configuration, logging). Related tracker topics: T011–T020.

## T011 — `async`/`await` and I/O-bound work

- **What:** `await` lets a method yield while I/O is pending instead of
  blocking a request thread.
- **Why:** Model calls take time; blocking threads limits concurrent requests.
- **When:** Use async APIs for network, disk, and database I/O.
- **Limits:** Async does not make CPU work or the model itself faster.
- **Diagram:** `request thread -> starts HTTP -> serves another request -> resumes on response`
- **Project example (implemented):** the application and provider adapters use
  async HTTP calls. [ChatApiService.cs](../../Services/ChatApiService.cs)
- **Reference:** [Asynchronous programming](https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/)

## T012 — `CancellationToken` propagation

- **What:** A token lets a caller request that in-progress work stop.
- **Why:** If a client disconnects, the API should avoid needless provider
  work where possible.
- **When:** Accept a token at each async boundary and pass it to the next
  operation.
- **Limits:** Cancellation is cooperative; it cannot always undo work already
  accepted by a remote provider.
- **Diagram:** `HTTP request token -> chat service -> adapter -> HTTP send/read`
- **Project example (implemented):** provider calls receive the controller's
  token. [IChatApiService.cs](../../Services/IChatApiService.cs)
- **Reference:** [Cancellation in managed threads](https://learn.microsoft.com/dotnet/standard/threading/cancellation-in-managed-threads)

## T013 — Concurrency, thread safety, locks, and races

- **What:** Concurrency is overlapping work; a race occurs when results depend
  on timing or shared mutable state.
- **Why:** Web servers process many requests at once, so shared singleton state
  must be safe.
- **When:** Prefer immutable request data and scoped services; use locks only
  for genuinely shared mutable state.
- **Limits:** Locks can reduce throughput or deadlock. A lock in one process
  does not coordinate multiple server instances.
- **Diagram:** `request A + request B -> shared state? -> synchronize or remove sharing`
- **Project example (implemented):** the provider selector stores only a
  configured adapter reference; request-specific prompt data stays local to
  each call. [AICompletionProviderSelector.cs](../../Services/AICompletionProviderSelector.cs)
- **Reference:** [Managed threading best practices](https://learn.microsoft.com/dotnet/standard/threading/managed-threading-best-practices)

## T014 — `Task.WhenAll`, bounded concurrency, and `SemaphoreSlim`

- **What:** `Task.WhenAll` waits for independent tasks; a semaphore can cap
  how many operations run simultaneously.
- **Why:** Parallel independent I/O can reduce total wait, while a concurrency
  cap can protect limited model capacity.
- **When:** Use `WhenAll` only for independent calls; add a queue/semaphore only
  after a real capacity requirement is known.
- **Limits:** Unbounded fan-out can overwhelm a provider and increase cost.
  `WhenAll` is not a throttler.
- **Diagram:** `N tasks -> semaphore(limit k) -> at most k active`
- **Project exercise (non-production):** sketch a bounded concurrent worker
  for multiple independent code explanations. The current endpoint makes one
  provider call per request; public per-user limits belong in security
  hardening, not speculative parallelism.
- **Reference:** [Task-based asynchronous programming](https://learn.microsoft.com/dotnet/standard/parallel-programming/task-based-asynchronous-programming)

## T015 — `IAsyncEnumerable<T>` and streaming

- **What:** An async enumerable yields results over time without waiting for a
  full collection.
- **Why:** Streaming can show generated text sooner and reduce perceived wait.
- **When:** Use it when the provider and API/UI contract support incremental
  output.
- **Limits:** Streaming complicates cancellation, proxies, retries, and partial
  failure semantics. The current API returns a complete response.
- **Diagram:** `provider chunks -> async stream -> HTTP stream -> UI append`
- **Project example (planned — key103/key102 follow-up):** chat currently
  returns a complete completion; streaming is optional and should be added only
  if it improves the learning product.
- **Reference:** [Asynchronous streams](https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream)

## T016 — CLR, JIT, and garbage collection

- **What:** The CLR runs managed .NET code; the JIT compiles methods for the
  current runtime; garbage collection reclaims unreachable managed objects.
- **Why:** Runtime behavior explains startup, memory, and performance.
- **When:** Use these concepts when diagnosing warm-up, CPU, or memory issues.
- **Limits:** Knowing the model does not replace measurement; GC does not
  manage every native resource such as HTTP response streams.
- **Diagram:** `C# -> IL -> JIT machine code -> CLR execution -> GC managed heap`
- **Project example (implemented):** the API targets .NET 10 in
  [AIChatApplication.csproj](../../AIChatApplication.csproj). Low-level runtime
  tuning is not justified before profiling.
- **Reference:** [.NET fundamentals](https://learn.microsoft.com/dotnet/fundamentals/)

## T017 — Allocations, boxing, LOH, and profiling

- **What:** Allocations create managed objects; boxing wraps a value type as an
  object; large objects use a separate heap region.
- **Why:** Excess allocations can increase GC work and latency.
- **When:** Profile a real hot path before optimizing allocation-heavy code.
- **Limits:** Premature micro-optimization can hurt readability and may not
  affect the bottleneck, which is often remote inference latency.
- **Diagram:** `request -> allocations -> GC work -> latency`
- **Project exercise (non-production):** profile serialization of a
  representative chat request only to learn the tools. Provider network
  latency dominates likely response time; do not change object shapes without
  a measured application bottleneck.
- **Reference:** [Fundamentals of garbage collection](https://learn.microsoft.com/dotnet/standard/garbage-collection/fundamentals)

## T018 — DI scopes and service lifetimes

- **What:** Transient creates per resolution, scoped creates per request scope,
  and singleton lives for the application lifetime.
- **Why:** Correct lifetimes prevent shared-state bugs and manage resources.
- **When:** Use scoped for request orchestration and scoped collaborators;
  singleton only for thread-safe state that is safe to share.
- **Limits:** A singleton must not capture a scoped dependency. Longer-lived
  services can accidentally retain user/request data.
- **Diagram:** `HTTP request scope -> chat service + selector + provider`
- **Project example (implemented):** the provider, selector, and chat service
  are scoped in [Program.cs](../../Program.cs).
- **Reference:** [Dependency injection service lifetimes](https://learn.microsoft.com/dotnet/core/extensions/dependency-injection/service-lifetimes)

## T019 — Configuration, Options pattern, and validation

- **What:** Configuration combines sources; Options bind related values to
  typed classes and support validation.
- **Why:** Endpoint/model choice differs by environment; invalid settings
  should fail early.
- **When:** Bind related provider configuration to typed options and keep
  credentials in secret stores.
- **Limits:** A valid URI does not prove a remote service is reachable. Do not
  include a real key in tracked JSON.
- **Diagram:** `JSON -> environment/User Secrets override -> typed Options -> validate -> use`
- **Project example (implemented):** provider settings are validated at
  startup. [Program.cs](../../Program.cs) · [OpenAIOptions.cs](../../Options/OpenAIOptions.cs)
- **Reference:** [Options pattern](https://learn.microsoft.com/dotnet/core/extensions/options)

## T020 — `IHttpClientFactory`, named clients, and timeouts

- **What:** `IHttpClientFactory` creates clients with managed handler reuse;
  named clients allow configuration per external service.
- **Why:** Ollama and OpenAI need separate endpoints, auth, and timeout budgets.
- **When:** Use a named or typed client for each external API boundary.
- **Limits:** A timeout does not guarantee the remote provider stops work.
  Retries need a budget and idempotency/cost review.
- **Diagram:** `adapter -> named client -> handler pool -> provider endpoint`
- **Project example (implemented):** `Program.cs` registers distinct clients
  with provider-specific timeout settings.
  [OllamaChatCompletionProvider.cs](../../Services/OllamaChatCompletionProvider.cs)
- **Reference:** [HttpClient factory](https://learn.microsoft.com/dotnet/core/extensions/httpclient-factory)

## Workbook implementation connection

The project demonstrates async I/O, cancellation, typed options, logging,
lifetimes, and named clients. Parallel fan-out, async streaming, runtime tuning,
and allocation optimization remain practice or later-feature topics until
requirements or measurements justify them.

## Reading `Program.cs` — the composition root

`Program.cs` is where ASP.NET Core assembles the application. It wires services
and middleware together; it should not contain chat business logic.

```text
configuration -> service registrations -> Build()
               -> middleware pipeline -> mapped controllers -> Run()
```

1. **Create the builder.** `WebApplication.CreateBuilder(args)` loads the
   standard configuration providers and creates the DI service collection.
   `selectedProviderName` reads the provider setting so startup validation can
   check the selected adapter.
2. **Register API and error services.** `AddControllers()` enables MVC
   controllers. `AddExceptionHandler<ApiExceptionHandler>()` registers the
   application's fallback handler; `AddProblemDetails()` registers framework
   error support, although the custom handler currently writes the project's
   `Result` envelope.
3. **Register Swagger/OpenAPI.** `AddEndpointsApiExplorer()` supplies endpoint
   metadata and `AddSwaggerGen()` from Swashbuckle generates the OpenAPI JSON.
   Later, `UseSwagger()` exposes that JSON and `UseSwaggerUI()` serves the
   interactive browser UI. Here it is Development-only and `RoutePrefix = ""`
   puts the UI at the app root; the document URL is `/swagger/v1/swagger.json`.
4. **Bind and validate options.** `AddOptions<T>().BindConfiguration(...)`
   maps `appsettings.json`, environment variables, and other providers into
   typed classes. `Validate(...)` checks the selected provider's endpoint,
   model, timeout, and (for OpenAI) key. `ValidateOnStart()` fails early rather
   than waiting for a chat request.
5. **Register named HTTP clients.** Ollama and OpenAI each get a named client
   and independent timeout. `IHttpClientFactory` reuses handlers while the
   adapters keep their endpoint/protocol behavior separate.
6. **Register application composition.** Both adapters implement
   `IAICompletionProvider`. The selector returns the server-selected adapter;
   `ChatApiService` orchestrates the prompt and response. Scoped lifetime gives
   each HTTP request its own service instances.
7. **Build and order middleware.** `builder.Build()` creates the app.
   `UseExceptionHandler()` is early so it can handle exceptions from downstream
   middleware and endpoints. The development check adds Swagger UI only when
   the host environment is Development.
8. **Configure request handling.** `UseHttpsRedirection()` redirects HTTP to
   HTTPS. `UseAuthorization()` enables authorization middleware, but no
   authentication scheme or authorization policies are configured yet.
   `MapControllers()` maps attribute-routed controllers. `Run()` starts the
   host.

**Project references:** [Program.cs](../../Program.cs),
[AIChatApplication.csproj](../../AIChatApplication.csproj), and
[ChatController.cs](../../Controllers/ChatController.cs).

Swagger is a development aid and OpenAPI contract view—not an authorization
mechanism, a test suite, or proof that a provider is reachable. The app root
may redirect to Swagger's `index.html` before rendering the UI.
