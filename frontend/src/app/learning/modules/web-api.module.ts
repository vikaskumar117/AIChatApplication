import { LearningModule, topic } from '../learning.models';

type Lesson = {
  id: string;
  title: string;
  priority: 'Very High' | 'High';
  summary: string;
  concepts: [string, string, string];
  flow: string[];
  details: string[];
  example: string;
  code: string;
  advantages: string[];
  disadvantages: string[];
  use: string;
  avoid: string;
  questions: string[];
  scenario: string;
  note: string;
  takeaways: string[];
  mistakes: string[];
  practices: string[];
  sources?: { label: string; url: string }[];
};

function lesson(item: Lesson) {
  return topic(
    item.id, item.title, item.priority, item.summary, item.concepts, item.flow,
    item.example, item.code,
    [item.advantages, item.disadvantages],
    [item.use, item.avoid],
    item.questions, item.scenario, item.sources,
    {
      diagram: item.flow.map((label, index) => ({ label, detail: item.details[index] })),
      diagramNote: item.note,
      exampleSteps: item.flow,
      keyTakeaways: item.takeaways,
      commonMistakes: item.mistakes,
      bestPractices: item.practices,
      summary: item.summary,
    },
  );
}

export const webApiModule: LearningModule = {
  id: 'aspnet-core-web-api',
  title: 'ASP.NET Core Web API',
  description: 'Design maintainable HTTP APIs with explicit controller semantics, pipeline behavior, validation, and versioned contracts.',
  topics: [
    lesson({
      id: 'controllerbase-advantages', title: 'ControllerBase Advantages', priority: 'Very High',
      summary: 'ControllerBase gives API controllers MVC request, binding, validation, and response helpers without the view-rendering features of Controller.',
      concepts: [
        'ControllerBase is the base class for MVC API controllers and exposes helpers such as Ok, CreatedAtAction, NotFound, and ValidationProblem.',
        'Those helpers produce framework-compatible action results and make HTTP intent more legible than manually constructing every response.',
        'Inherit from ControllerBase, add route and HTTP-method attributes, inject application services, and return ActionResult<T> or an explicit result from each action.',
      ],
      flow: ['Route selects API action', 'ControllerBase binds and invokes', 'Action result becomes HTTP response'],
      details: ['Endpoint routing matches the route template and HTTP verb before MVC invokes the action.', 'Model binding, validation state, ModelState, and response helpers are available through the base class.', 'MVC executes the selected result and formatter to set status, headers, and serialized body.'],
      example: 'A ProductsController returns 201 with a Location header after creating a product, rather than hand-writing status and JSON response code.',
      code: ` [ApiController]
[Route("api/products")]
public sealed class ProductsController(IProductService products) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> Get(int id, CancellationToken ct)
    {
        var product = await products.FindAsync(id, ct);
        return product is null ? NotFound() : Ok(product);
    }
}`,
      advantages: ['Focused API surface without Razor view support', 'Convenient HTTP results and MVC integration', 'Works with filters, formatters, binding, and DI'],
      disadvantages: ['Still couples endpoint code to MVC abstractions', 'Helpers do not enforce good status semantics automatically'],
      use: 'Use ControllerBase for attribute-routed MVC controllers that return JSON, files, or other HTTP results.',
      avoid: 'Avoid manually returning 200 for missing resources or exposing persistence entities simply because a helper makes it convenient.',
      questions: ['Which API response helpers does ControllerBase provide?', 'Why is it preferable to Controller for a JSON API?', 'When should an action use ActionResult<T>?'],
      scenario: 'Standardize several resource controllers so create, missing-resource, and validation responses consistently use CreatedAtAction, NotFound, and validation results while preserving service boundaries.',
      note: 'ControllerBase is an API-oriented MVC base class; it does not itself configure routing, authentication, or API conventions.',
      takeaways: ['ControllerBase supplies API-focused MVC behavior.', 'Action helpers express response intent but do not choose domain semantics for you.', 'Return contracts, not database entities.'],
      mistakes: ['Assuming inheriting ControllerBase automatically applies [ApiController].', 'Returning Ok(null) for a resource that does not exist.'],
      practices: ['Use explicit route and verb attributes and typed response contracts.', 'Inject application services and pass cancellation through asynchronous work.'],
      sources: [{ label: 'Create web APIs with ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/' }],
    }),
    lesson({
      id: 'controller-vs-controllerbase', title: 'Controller vs ControllerBase', priority: 'High',
      summary: 'Controller extends ControllerBase with view and page-oriented capabilities; ControllerBase is the smaller choice for HTTP APIs.',
      concepts: [
        'Controller inherits ControllerBase and adds view-related functionality such as ViewData, ViewBag, and view rendering support.',
        'A JSON API normally does not render server-side views, so inheriting ControllerBase keeps its intent and available surface focused.',
        'Use Controller when actions genuinely return MVC views; use ControllerBase for API actions, typically paired with [ApiController] where its conventions are wanted.',
      ],
      flow: ['Choose response style', 'Select matching MVC base class', 'Keep controller responsibilities explicit'],
      details: ['A server-rendered MVC action returns HTML view results; an API action generally returns serialized data or an HTTP result.', 'ControllerBase provides the common MVC context and HTTP response helpers; Controller adds view abstractions.', 'The selected base class does not choose authentication policy, model contract, or API validation convention.'],
      example: 'An admin website action that returns a Razor view can use Controller; its JSON-backed inventory endpoints should use ControllerBase.',
      code: `public sealed class InventoryApiController : ControllerBase { /* HTTP API actions */ }
public sealed class DashboardController : Controller { /* server-rendered views */ }`,
      advantages: ['Choosing the narrow base communicates intent', 'ControllerBase avoids unused view facilities in APIs'],
      disadvantages: ['The two types share names and common members, which can confuse newcomers', 'Changing base classes does not itself alter endpoint security or behavior'],
      use: 'Use ControllerBase for APIs and Controller only where server-side view rendering is part of the application.',
      avoid: 'Avoid choosing Controller because it appears more powerful when no view behavior is needed.',
      questions: ['What does Controller add beyond ControllerBase?', 'Does ControllerBase prevent returning HTML?', 'Does the base class determine whether a route is an API?'],
      scenario: 'A mixed MVC application is being split into API and page controllers; classify actions by response responsibility and retain shared business logic in services rather than controller inheritance.',
      note: 'Both are MVC controller base classes; neither is a replacement for middleware or an authorization policy.',
      takeaways: ['Controller inherits ControllerBase.', 'Use the smaller API-oriented base for API-only controllers.', 'Choose based on response responsibility, not assumed security.'],
      mistakes: ['Claiming ControllerBase cannot return a file or non-JSON result.', 'Assuming Controller automatically provides API validation semantics.'],
      practices: ['Keep MVC view actions and API actions recognizable in names and routing.', 'Keep domain logic outside either controller base class.'],
      sources: [{ label: 'ControllerBase API reference', url: 'https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase' }],
    }),
    lesson({
      id: 'controllers-vs-minimal-apis', title: 'Controllers vs Minimal APIs', priority: 'High',
      summary: 'Controllers and Minimal APIs are two ASP.NET Core endpoint styles that share routing, dependency injection, authorization, and HTTP semantics.',
      concepts: [
        'Controllers group actions in classes with MVC conventions, model binding, filters, formatters, and established controller-oriented tooling; Minimal APIs declare route handlers directly.',
        'Choosing a style affects organization and available extension points, but neither style is inherently the correct choice for every service or automatically more secure.',
        'Compare team conventions, API size, validation and filter needs, endpoint metadata, testing, and maintainability; keep handlers thin, use the same service boundaries, and select a consistent style for related endpoints.',
      ],
      flow: ['Select endpoint organization', 'Routing binds and invokes handler', 'Shared policies and services implement behavior'],
      details: ['A controller style organizes related route actions under controller classes and MVC conventions.', 'A Minimal API style maps handlers through endpoint routing, with parameter binding and endpoint filters/metadata.', 'Both styles can use DI, authentication, authorization, OpenAPI, validation, and shared application services.'],
      example: 'A focused health endpoint may be concise as a Minimal API while a resource API with established MVC filters and conventions may remain controller-based.',
      code: `app.MapGet("/health", () => TypedResults.Ok(new HealthResponse("ok")))
    .WithName("Health")
    .WithSummary("Reports service health");`,
      advantages: ['Controllers provide familiar structure and MVC extension points', 'Minimal APIs reduce ceremony for focused endpoint sets'],
      disadvantages: ['Controllers add conventions and structure that small services may not need', 'Minimal API registrations can become difficult to navigate when ungrouped'],
      use: 'Choose based on API complexity, required extension points, operational tooling, and established team conventions.',
      avoid: 'Avoid migrating solely on unmeasured performance claims or mixing styles without a clear boundary.',
      questions: ['Which MVC features do controllers organize?', 'Can Minimal APIs use DI and authorization?', 'What factors are more useful than assumptions about performance?'],
      scenario: 'A small service has a few endpoints and a team accustomed to controllers; prototype both styles around the same service layer and compare testing, generated OpenAPI, and maintenance cost.',
      note: 'Controller APIs and Minimal APIs execute through endpoint routing but have different action/handler abstractions and extension points.',
      takeaways: ['Both styles can implement secure, typed HTTP APIs.', 'Choose for organization and framework needs, not slogans.', 'Keep application logic and policy consistent regardless of endpoint syntax.'],
      mistakes: ['Assuming Minimal APIs cannot use filters, validation, or authorization.', 'Assuming selecting controllers automatically configures API-controller behavior.'],
      practices: ['Keep a consistent style within a coherent API surface.', 'Compare generated contracts and integration behavior when choosing or migrating.'],
      sources: [{ label: 'ASP.NET Core APIs overview', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/apis' }, { label: 'Minimal APIs overview', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/overview' }],
    }),
    lesson({
      id: 'without-apicontroller', title: 'Controllers Without [ApiController]', priority: 'High',
      summary: 'A controller without [ApiController] can still serve an API, but it does not receive that attribute’s API-specific conventions automatically.',
      concepts: [
        'An MVC controller can expose HTTP endpoints without [ApiController]; the attribute is a set of conventions, not a prerequisite for routing or JSON.',
        'Without it, teams may need to explicitly handle invalid ModelState, binding-source ambiguity, and client-error response conventions.',
        'Compare behavior deliberately when migrating: add explicit validation handling or apply [ApiController] to the controller or assembly and test changed binding and error responses.',
      ],
      flow: ['Request matches controller route', 'MVC binds parameters and records errors', 'Action or explicit convention handles outcome'],
      details: ['Routing and MVC still dispatch the action; ControllerBase and normal formatters remain available.', 'Invalid model state is not automatically converted to the same 400 response convention as an API controller.', 'A deliberate action branch, filter, or global convention must decide how binding and validation failures become HTTP responses.'],
      example: 'A legacy action may execute with invalid ModelState unless it checks ModelState.IsValid or adopts the API controller convention.',
      code: `if (!ModelState.IsValid)
    return ValidationProblem(ModelState);
var result = await service.CreateAsync(request, ct);`,
      advantages: ['Allows explicit legacy or specialized MVC behavior', 'Useful where the API controller conventions are intentionally not desired'],
      disadvantages: ['More repeated validation and binding decisions', 'Clients may see inconsistent errors between controllers'],
      use: 'Use an unadorned controller when you intentionally own binding and validation response behavior.',
      avoid: 'Avoid assuming that data annotations alone guarantee an automatic 400 response on an ordinary controller.',
      questions: ['Can a controller route work without [ApiController]?', 'What should the action do with invalid ModelState?', 'How would you migrate legacy behavior safely?'],
      scenario: 'A service returns 200 for invalid request objects in one legacy controller; add explicit validation handling and integration tests before moving it to shared API conventions.',
      note: 'The exact binding and validation conventions depend on applied MVC attributes and configuration; verify the app’s actual registration.',
      takeaways: ['[ApiController] is a convention package, not the switch that enables APIs.', 'Without it, explicitly define invalid-model behavior.', 'Migration can change HTTP behavior and must be tested.'],
      mistakes: ['Equating missing [ApiController] with no model binding.', 'Assuming invalid annotations always stop an ordinary controller action.'],
      practices: ['Test malformed JSON, missing values, and annotation failures at the HTTP boundary.', 'Document deliberate exceptions to shared validation conventions.'],
      sources: [{ label: 'API controller behavior', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/#apicontroller-attribute' }],
    }),
    lesson({
      id: 'api-controller-purpose', title: 'Purpose of [ApiController]', priority: 'Very High',
      summary: '[ApiController] opts MVC controllers into conventions that make API binding and client-error behavior more predictable.',
      concepts: [
        '[ApiController] marks a controller as an API controller and enables conventions including automatic 400 responses for invalid model state.',
        'Automatic consistent failures prevent actions from accidentally processing invalid input and reduce repetitive boilerplate.',
        'The attribute also enables inference of binding sources for parameters and client-error conventions; inspect generated responses and override inference only when the contract requires it.',
      ],
      flow: ['Bind request using API conventions', 'Validate model and infer sources', 'Short-circuit invalid input with 400'],
      details: ['MVC binds from route, query, body, and services using explicit declarations or API-controller inference rules.', 'Validation annotations and validators populate ModelState; binding failures do too.', 'An invalid model state yields a validation-problem response before the action body executes unless behavior is deliberately customized.'],
      example: 'A [Required] field missing from a JSON POST receives a 400 validation response instead of entering the create action.',
      code: `[ApiController]
[Route("api/orders")]
public sealed class OrdersController : ControllerBase
{
    [HttpPost]
    public ActionResult<OrderDto> Create(CreateOrderRequest request) =>
        CreatedAtAction(nameof(Get), new { id = 42 }, new OrderDto(42));
}`,
      advantages: ['Consistent model-state handling', 'Less repetitive binding and validation code', 'Useful API error conventions and metadata'],
      disadvantages: ['Inference may be surprising if a signature is ambiguous', 'Automatic 400 responses can change legacy clients’ observed behavior'],
      use: 'Use [ApiController] for JSON-oriented MVC APIs with consistent automatic validation responses.',
      avoid: 'Avoid relying on inference as undocumented magic; specify [FromRoute], [FromQuery], [FromBody], or [FromServices] when clarity matters.',
      questions: ['What happens to an invalid model state by default?', 'How are parameter binding sources inferred?', 'How can a team make binding intent explicit?'],
      scenario: 'An API receives a scalar parameter from an unexpected source after adding a service dependency; make the source explicit and contract-test binding and validation errors.',
      note: 'Automatic 400 concerns MVC model state; it does not replace business-rule validation, authorization, or conflict detection.',
      takeaways: ['The attribute adds conventions, especially automatic 400 validation responses.', 'Binding failures also contribute to model state.', 'Domain invariants remain the application’s responsibility.'],
      mistakes: ['Treating syntactically valid input as valid business data.', 'Returning an ad hoc 200 response for invalid model state.'],
      practices: ['Use request DTOs with explicit constraints and stable validation errors.', 'Exercise invalid JSON, missing fields, and invalid annotation values in HTTP tests.'],
      sources: [{ label: 'ASP.NET Core Web API controllers', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/' }],
    }),
    lesson({
      id: 'request-pipeline', title: 'ASP.NET Core Request Pipeline', priority: 'Very High',
      summary: 'The ordered middleware pipeline surrounds endpoint execution, so ordering determines which components can observe and affect a request.',
      concepts: [
        'The request pipeline is a chain of delegates that can handle a request, call the next delegate, and observe the response as execution unwinds.',
        'Ordering controls behavior such as exception capture, HTTPS redirection, routing, authentication, authorization, and endpoint execution.',
        'Build the pipeline in Program.cs, place exception handling early, route before endpoint-aware policies where required, authenticate before authorize, then map or execute endpoints.',
      ],
      flow: ['Request enters early middleware', 'Routing, auth, and endpoint execute', 'Response unwinds toward server'],
      details: ['An early component can catch exceptions and attach request context around all downstream work.', 'Routing selects endpoint metadata; authentication establishes a principal and authorization evaluates endpoint policy.', 'The endpoint writes a response, after which earlier middleware can log timing or add headers if the response has not started.'],
      example: 'Exception handling wraps authentication and controller execution; authentication establishes the user before authorization checks access.',
      code: `app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();`,
      advantages: ['Compositional cross-cutting behavior', 'Explicit ordering makes request lifecycle understandable'],
      disadvantages: ['Misordering can bypass policies or prevent exception handling', 'Each component can add latency or alter the response'],
      use: 'Use middleware for application-wide behavior and verify ordering against the features each component depends on.',
      avoid: 'Avoid placing authentication after endpoints or placing exception handling so late that earlier failures escape it.',
      questions: ['What does calling next mean?', 'Why does middleware order matter?', 'Where should authentication and authorization appear?'],
      scenario: 'A new authorization requirement sees no authenticated user; inspect the actual pipeline and move authentication ahead of authorization while testing both anonymous and authenticated requests.',
      note: 'Exact middleware requirements vary with hosting model and framework version; the sequence shown is a common controller API arrangement.',
      takeaways: ['Middleware wraps downstream work.', 'Ordering determines the observable request and response path.', 'Authentication must establish identity before authorization evaluates it.'],
      mistakes: ['Assuming registration order is irrelevant.', 'Putting endpoint-specific business decisions in global middleware.'],
      practices: ['Keep a concise, reviewed pipeline in Program.cs.', 'Add integration tests for middleware order, short-circuiting, and exceptions.'],
      sources: [{ label: 'ASP.NET Core middleware', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/' }],
    }),
    lesson({
      id: 'custom-middleware', title: 'Middleware & Custom Middleware', priority: 'Very High',
      summary: 'Middleware is an HTTP delegate that can inspect, transform, short-circuit, or delegate request processing.',
      concepts: [
        'Middleware is a component that receives HttpContext and a RequestDelegate representing the next pipeline step.',
        'It is suited to cross-cutting HTTP concerns such as correlation, request timing, and carefully designed exception translation because it surrounds endpoint execution.',
        'Implement a convention-based InvokeAsync method or a small inline delegate, register it in the required order, call next exactly when continuing, and keep per-request state in HttpContext rather than mutable singleton fields.',
      ],
      flow: ['Inspect request context', 'Continue or intentionally short-circuit', 'Observe or finalize response'],
      details: ['HttpContext carries request, response, user, features, and per-request items.', 'Calling RequestDelegate hands control to downstream middleware; not calling it ends the current pipeline path.', 'After downstream completion middleware can record status or add headers, subject to response-start constraints.'],
      example: 'Attach a trace identifier to structured logs for every request, including requests that later fail.',
      code: `app.Use(async (context, next) =>
{
    var started = Stopwatch.GetTimestamp();
    await next(context);
    logger.LogInformation("HTTP {Status} took {Elapsed}ms",
        context.Response.StatusCode,
        Stopwatch.GetElapsedTime(started).TotalMilliseconds);
});`,
      advantages: ['One implementation covers many endpoints', 'Can operate before and after endpoint execution'],
      disadvantages: ['Global scope can make endpoint-specific behavior awkward', 'Incorrect lifetime use or body buffering can cause bugs and cost'],
      use: 'Use custom middleware when the same HTTP concern must consistently wrap a broad part of the application.',
      avoid: 'Avoid storing request state in middleware instance fields or reading request bodies without deliberate buffering, limits, and privacy review.',
      questions: ['How does middleware continue the pipeline?', 'What does short-circuit mean?', 'Where should request-specific state live?'],
      scenario: 'Add a correlation header even on controlled errors; place middleware before exception and endpoint processing, preserve an existing trace ID only when validated, and test header behavior after response start.',
      note: 'Middleware may be constructed once; do not assume its instance is per request.',
      takeaways: ['A middleware can continue or short-circuit.', 'It can wrap downstream execution and observe responses.', 'Global cross-cutting scope is powerful and must be bounded.'],
      mistakes: ['Calling next twice or failing to await downstream processing.', 'Keeping mutable request data in a long-lived middleware field.'],
      practices: ['Use framework-provided diagnostics when they already meet the need.', 'Keep middleware stateless and pass cancellation and request context through.'],
      sources: [{ label: 'Write custom ASP.NET Core middleware', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write' }],
    }),
    lesson({
      id: 'dependency-injection-lifetimes', title: 'Dependency Injection & Service Lifetimes', priority: 'Very High',
      summary: 'Transient, scoped, and singleton lifetimes define how long a resolved service instance is reused and who disposes it.',
      concepts: [
        'Dependency injection constructs services from registrations; transient creates per resolution, scoped reuses within a scope, and singleton reuses for the container lifetime.',
        'Matching lifetime to state and resource ownership prevents stale shared state, concurrent access bugs, and use-after-disposal.',
        'Register services with AddTransient, AddScoped, or AddSingleton; use scoped services such as DbContext per web request, and create an explicit scope when a background singleton must use scoped dependencies.',
      ],
      flow: ['Application requests a service', 'Container resolves within a scope', 'Container disposes owned instances at lifetime end'],
      details: ['Registration defines implementation and instance lifetime; constructor injection makes dependencies explicit.', 'HTTP requests ordinarily have a DI scope, which is not the same as a database transaction.', 'Scoped and transient disposable services are disposed with their owning scope; singleton instances live until host shutdown.'],
      example: 'A request-scoped order service may use a request-scoped DbContext, while a singleton clock must be thread-safe and state-independent.',
      code: `services.AddScoped<IOrderService, OrderService>();
services.AddScoped<AppDbContext>();
services.AddSingleton<IClock, SystemClock>();
services.AddTransient<IEmailFormatter, EmailFormatter>();`,
      advantages: ['Centralized composition and deterministic disposal', 'Scopes can align stateful work with request boundaries'],
      disadvantages: ['Captive dependencies can outlive their required scope', 'Singleton mutable state introduces concurrency risks'],
      use: 'Use scoped for request-oriented services, singleton for safe shared services, and transient for lightweight independent objects.',
      avoid: 'Avoid injecting a scoped DbContext into a singleton or registering mutable request state as a singleton.',
      questions: ['How do the three built-in lifetimes differ?', 'What is a captive dependency?', 'How should a background worker consume a scoped service?'],
      scenario: 'A hosted worker needs EF Core; inject IServiceScopeFactory, create and dispose an async scope per operation, and use cancellation during the work.',
      note: 'A scope is an object-ownership boundary, not a guarantee of transactionality or thread safety.',
      takeaways: ['Lifetime determines reuse and disposal.', 'A singleton must not capture a shorter-lived scoped dependency.', 'Create scopes deliberately in hosted background work.'],
      mistakes: ['Assuming AddScoped means one instance per HTTP request in every host.', 'Sharing a DbContext concurrently because it is registered scoped.'],
      practices: ['Enable scope validation in development and tests.', 'Keep singleton dependencies thread-safe and immutable where practical.'],
      sources: [{ label: 'Dependency injection in ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection' }],
    }),
    lesson({
      id: 'middleware-vs-filters', title: 'Middleware vs MVC Filters', priority: 'High',
      summary: 'Middleware wraps the application request pipeline; MVC filters run inside MVC execution and have action or result context.',
      concepts: [
        'Middleware sees HttpContext for requests that traverse its pipeline and can run before routing or around selected downstream work.',
        'Filters are MVC extension points for concerns that need MVC action, model-state, or result context, and they run only when MVC executes.',
        'Select middleware for broad transport behavior and filters for MVC-specific behavior; choose the appropriate filter stage such as authorization, action, exception, or result.',
      ],
      flow: ['Middleware receives HTTP request', 'MVC selects filter pipeline', 'Action and result execute within middleware'],
      details: ['Middleware surrounds downstream components and may also apply to non-MVC endpoints.', 'MVC filters operate after endpoint selection and can access MVC-specific action arguments or results.', 'The HTTP response unwinds through middleware after MVC filters and action execution complete.'],
      example: 'Use middleware for request-wide correlation; use an action filter for a legacy MVC-only action convention that requires action arguments.',
      code: `app.UseMiddleware<RequestCorrelationMiddleware>();
services.AddControllers(options =>
    options.Filters.Add<AuditActionFilter>());`,
      advantages: ['Middleware covers broader endpoint types', 'Filters provide MVC-specific lifecycle context'],
      disadvantages: ['Filters do not cover Minimal APIs or unrelated middleware endpoints', 'Middleware lacks action-specific metadata before routing/endpoint selection'],
      use: 'Use middleware for application-wide HTTP concerns and filters for MVC controller/action execution concerns.',
      avoid: 'Avoid using an MVC filter to enforce a security boundary across non-MVC endpoints.',
      questions: ['Which layer can see MVC action arguments?', 'Does a filter run for a Minimal API endpoint?', 'When is middleware preferable?'],
      scenario: 'An audit rule must cover MVC actions but not health checks; implement and test an MVC filter while keeping authentication and global exception handling in their appropriate layers.',
      note: 'Endpoint filters are a separate abstraction for endpoint handlers; do not confuse them with MVC filters.',
      takeaways: ['Middleware is pipeline-level; MVC filters are framework execution-level.', 'Filters have MVC context but narrower coverage.', 'Security boundaries must cover every endpoint style in use.'],
      mistakes: ['Assuming an action filter runs before every application middleware.', 'Using a controller-only filter as the only API-wide authorization defense.'],
      practices: ['Place each concern at the narrowest layer that reliably covers it.', 'Test actual endpoint coverage when MVC and Minimal APIs coexist.'],
      sources: [{ label: 'ASP.NET Core filters', url: 'https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters' }],
    }),
    lesson({
      id: 'global-exception-handling', title: 'Global Exception Handling', priority: 'Very High',
      summary: 'A global exception boundary logs unexpected failures and returns a stable, safe error contract rather than leaking implementation details.',
      concepts: [
        'Global exception handling is a pipeline boundary that observes unhandled downstream exceptions and maps them to HTTP error responses.',
        'Consistent failures make client behavior predictable while separating safe public diagnostics from sensitive internal logs.',
        'Register AddProblemDetails and UseExceptionHandler early, or implement IExceptionHandler for deliberate domain-exception mappings; log with trace correlation and avoid writing exception messages to public responses.',
      ],
      flow: ['Exception escapes endpoint', 'Boundary logs and maps known failure', 'Client receives safe error response'],
      details: ['The exception handler must be early enough to wrap components that can fail.', 'Known application exceptions can map to intentional statuses; unknown exceptions remain generic server failures.', 'Problem Details supplies a standard error shape while logs retain diagnostic detail under access controls.'],
      example: 'A concurrency exception maps to 409 only when it represents a known client-resolvable conflict; an unexpected database outage remains 500.',
      code: `builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
app.UseExceptionHandler();`,
      advantages: ['Consistent error contract and telemetry', 'Avoids duplicated try/catch and unsafe error construction'],
      disadvantages: ['Incorrect exception mapping can misstate system health', 'A handler may suppress framework diagnostics if logging is incomplete'],
      use: 'Use centralized handling for unexpected exceptions and explicitly recognized domain failures.',
      avoid: 'Avoid translating every exception to 400 or including stack traces, SQL, tokens, or exception messages in public details.',
      questions: ['Where must exception middleware be placed?', 'Which failures should map to 409?', 'What belongs in the client response versus logs?'],
      scenario: 'Production clients receive inconsistent errors and logs lack correlation; add centralized Problem Details with a trace identifier, preserve safe 500 output, and test known and unknown exceptions.',
      note: 'An exception handler should not turn expected validation or not-found outcomes into exceptions for normal control flow.',
      takeaways: ['Centralize unhandled failures at the HTTP boundary.', 'Map known errors deliberately and retain a safe generic 500.', 'Correlate public error IDs with protected diagnostic logs.'],
      mistakes: ['Returning exception.Message or stack traces to callers.', 'Catching exceptions and returning success-shaped fallbacks.'],
      practices: ['Use Problem Details and a trace ID for supportable errors.', 'Test status, content type, disclosure, and logging behavior for every mapping.'],
      sources: [{ label: 'Handle errors in ASP.NET Core APIs', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors' }, { label: 'RFC 9457 Problem Details', url: 'https://www.rfc-editor.org/rfc/rfc9457' }],
    }),
    lesson({
      id: 'http-method-semantics', title: 'HTTP Method Semantics', priority: 'Very High',
      summary: 'HTTP methods communicate the intended operation and whether it is safe or idempotent, independent of how an endpoint is named.',
      concepts: [
        'A method is the standardized request verb—such as GET, POST, PUT, PATCH, or DELETE—that describes the requested interaction with a resource.',
        'Correct semantics enable predictable retries, caching, intermediaries, and client expectations; safe means intended not to change state, while idempotent means repeated identical requests have the same intended effect.',
        'Map verbs to resource operations: GET reads, POST creates or invokes non-idempotent processing, PUT replaces a resource representation, PATCH applies a partial change, and DELETE removes or deactivates it.',
      ],
      flow: ['Client selects method and resource', 'API applies method contract', 'Response reflects operation outcome'],
      details: ['The method and URI together identify the requested resource operation.', 'GET is safe and idempotent; PUT and DELETE are idempotent by intended effect, and POST is not inherently idempotent.', 'The server still must implement those semantics consistently; status codes and validators communicate outcome and concurrency.'],
      example: 'Use GET /orders/7 to retrieve, POST /orders to create, PUT /orders/7 for full replacement, and PATCH /orders/7 for a defined partial change.',
      code: `[HttpGet("{id:int}")] public Task<ActionResult<OrderDto>> Get(int id) => ...;
[HttpPost] public Task<ActionResult<OrderDto>> Create(CreateOrderDto input) => ...;
[HttpPut("{id:int}")] public Task<IActionResult> Replace(int id, ReplaceOrderDto input) => ...;`,
      advantages: ['Standard semantics aid retries, caches, and client libraries', 'Resource-oriented verbs make contracts easier to reason about'],
      disadvantages: ['PATCH formats require clear semantics and validation', 'A badly implemented endpoint can violate its declared method semantics'],
      use: 'Choose a method based on its HTTP semantics and the resource contract, and document conditional behavior.',
      avoid: 'Avoid state changes on GET or using POST as a catch-all solely for convenience.',
      questions: ['What is the difference between safe and idempotent?', 'Is DELETE idempotent if a repeated call returns 404?', 'When should a resource use PATCH rather than PUT?'],
      scenario: 'A client retries a timed-out update; align method semantics and conditional request behavior so repeating the same operation does not create an additional business effect.',
      note: 'Idempotence concerns intended server effect, not necessarily identical status codes, response bodies, or zero database writes on each repetition.',
      takeaways: ['Safe and idempotent are distinct properties.', 'PUT and DELETE are idempotent in intended effect.', 'Method choice is an externally visible contract.'],
      mistakes: ['Treating every repeated request as harmless regardless of side effects.', 'Using GET for actions that mutate persistent state.'],
      practices: ['Document full replacement versus partial update.', 'Use idempotency keys where retryable POST operations must prevent duplicate business effects.'],
      sources: [{ label: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110' }],
    }),
    lesson({
      id: 'common-http-status-codes', title: 'Common HTTP Status Codes', priority: 'Very High',
      summary: 'Status codes classify success, client-side request problems, and server failures; 400, 401, 403, 404, 409, and 500 have distinct meanings.',
      concepts: [
        'An HTTP status code is the response’s standardized three-digit classification of whether and how the request was handled.',
        'Precise codes let clients choose correct next steps, such as correcting input, authenticating, requesting permission, resolving a conflict, or retrying later.',
        'Use 200 for successful representation, 201 for creation, 204 for success without a body, 400 for invalid requests, 401 for missing or invalid authentication, 403 for denied permission, 404 for absent or undisclosed resources, 409 for state conflicts, and 500 for unexpected server errors.',
      ],
      flow: ['Classify outcome', 'Select status and safe body', 'Client follows status-specific recovery'],
      details: ['A successful read commonly returns 200; creation commonly returns 201 with Location; deletion can return 204.', '400 means the request is invalid; 401 means valid authentication credentials are absent or unacceptable and normally carries an authentication challenge.', '403 means identity is understood but permission is denied; 404 means no accessible resource is exposed; 409 signals a conflict with current state; 500 is an unexpected server failure.'],
      example: 'An expired bearer credential yields 401; an authenticated user lacking the required permission gets 403; a stale version update gets 409.',
      code: `return product is null
    ? NotFound()
    : Ok(ProductDto.From(product));
// A stale write may return Conflict(problemDetails); an unexpected exception is 500.`,
      advantages: ['Predictable machine-readable client behavior', 'Clear distinction between authentication, permission, and state conflicts'],
      disadvantages: ['A status can leak resource existence if policy requires concealment', 'Poorly defined client retries can amplify transient failures'],
      use: 'Use the most specific status consistent with the HTTP contract and security disclosure policy.',
      avoid: 'Avoid returning 200 for failures or using 401 and 403 interchangeably without a deliberate concealment policy.',
      questions: ['How do 401 and 403 differ?', 'When is 409 appropriate?', 'Should validation errors return 500?'],
      scenario: 'A client retries all non-200 responses and creates load; publish a status contract distinguishing correctable 400, authentication 401, forbidden 403, conflict 409, and retryable server failures.',
      note: 'A 404 may intentionally conceal that a protected resource exists; choose based on the threat model and keep behavior consistent.',
      takeaways: ['401 is authentication; 403 is authorization.', '409 represents a resolvable state conflict, not arbitrary failure.', '500 is for unexpected server-side failures, not invalid input.'],
      mistakes: ['Using 401 when the caller is authenticated but lacks permission.', 'Returning stack traces or sensitive resource details in error bodies.'],
      practices: ['Define status, headers, and error body for every endpoint outcome.', 'Test client retry behavior separately from status classification.'],
      sources: [{ label: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110' }],
    }),
    lesson({
      id: 'model-validation', title: 'Model Validation', priority: 'Very High',
      summary: 'Model validation checks bound input against structural constraints, while application logic separately enforces business invariants.',
      concepts: [
        'Model validation evaluates a bound request model against rules such as required values, ranges, formats, and custom validators.',
        'Rejecting malformed or structurally invalid input at the boundary prevents invalid data from entering application workflows and gives clients actionable feedback.',
        'Use dedicated request DTOs and annotations or validators; with [ApiController], MVC automatically returns a 400 validation problem when ModelState is invalid, while domain rules should be checked in application services and may yield a conflict or domain validation result.',
      ],
      flow: ['Deserialize and bind request', 'Evaluate input constraints', 'Reject or pass valid request to application'],
      details: ['Malformed JSON and binding errors can populate model state before action execution.', 'Annotations such as Required and Range validate shape and simple constraints; [ApiController] can short-circuit invalid state.', 'Cross-record or time-varying business rules belong in application/domain logic and must be rechecked transactionally where necessary.'],
      example: 'A quantity must be a positive integer at request validation, while available inventory must be checked against current persisted stock during the operation.',
      code: `public sealed record CreateOrderRequest
{
    [Required, MaxLength(80)] public required string Reference { get; init; }
    [Range(1, 100)] public int Quantity { get; init; }
}`,
      advantages: ['Fast, consistent feedback for structural errors', 'Keeps HTTP input rules explicit and testable'],
      disadvantages: ['Annotations do not express every business invariant', 'Automatic errors can be breaking if response shape changes'],
      use: 'Validate shape and simple request constraints at the API boundary, then validate business rules at the appropriate application boundary.',
      avoid: 'Avoid trusting client validation or checking mutable business facts only before a long-running transaction.',
      questions: ['What does [ApiController] do with invalid ModelState?', 'How does model validation differ from domain validation?', 'Where should stock availability be checked?'],
      scenario: 'Two valid order requests compete for the last item; boundary validation accepts both shapes, but atomic application logic ensures only one can reserve inventory.',
      note: 'A 400 validation response describes an invalid request; it does not prove that the requested operation is currently feasible.',
      takeaways: ['Binding, structural validation, and business validation are distinct steps.', 'Invalid ModelState can be automatically returned as 400 under [ApiController].', 'Mutable state rules need transactional enforcement.'],
      mistakes: ['Relying only on browser-side validation.', 'Placing all validation in data annotations, including database-dependent rules.'],
      practices: ['Use stable request DTOs and structured validation-problem responses.', 'Test malformed bodies, annotation failures, and business-rule races separately.'],
      sources: [{ label: 'Model validation in ASP.NET Core MVC', url: 'https://learn.microsoft.com/en-us/aspnet/core/mvc/models/validation' }],
    }),
    lesson({
      id: 'api-dtos', title: 'API Data Transfer Objects (DTOs)', priority: 'Very High',
      summary: 'DTOs define intentional API input and output contracts, decoupled from persistence entities and internal domain models.',
      concepts: [
        'A Data Transfer Object is a type shaped for data crossing an API boundary, such as a create request or response representation.',
        'Separate contracts prevent accidental exposure of internal fields and allow storage models to evolve without silently breaking clients.',
        'Define explicit request and response DTOs, validate request fields, map at an application boundary, and return only fields the caller is authorized to see.',
      ],
      flow: ['Deserialize request DTO', 'Map and enforce application rules', 'Project authorized response DTO'],
      details: ['Request DTOs describe the accepted wire contract and should not be persistence entities.', 'Application logic maps accepted values into domain operations rather than trusting client-supplied internal fields.', 'Response projection controls serialization and must account for caller-specific data permissions.'],
      example: 'A create request accepts ProductName and Price, while the response adds server-assigned Id and CreatedAt without exposing EF navigation properties.',
      code: `public sealed record CreateProductRequest(string Name, decimal Price);
public sealed record ProductResponse(int Id, string Name, decimal Price);

var response = new ProductResponse(entity.Id, entity.Name, entity.Price);`,
      advantages: ['Stable, explicit, reviewable API contracts', 'Reduces over-posting and sensitive field leakage'],
      disadvantages: ['Requires mapping and contract maintenance', 'Duplicated shapes can drift if boundaries are poorly designed'],
      use: 'Use distinct DTOs for externally visible request and response contracts, particularly when data is privileged or versioned.',
      avoid: 'Avoid serializing tracked ORM entities directly or accepting server-managed fields from clients.',
      questions: ['How do DTOs prevent over-posting?', 'Why should a response be projected?', 'When should request and response types differ?'],
      scenario: 'A new database column stores a fraud-review flag; DTO projection ensures it remains private while the API evolves its public response deliberately.',
      note: 'Records and immutability are useful choices, but the essential architectural property is the explicit boundary contract.',
      takeaways: ['DTOs are wire contracts, not database models.', 'Input and output shapes often have different trust and exposure rules.', 'Mapping is a useful place to enforce authorized projection.'],
      mistakes: ['Binding a persistence entity directly from an untrusted request.', 'Returning every entity property by default.'],
      practices: ['Version and document DTOs as public contracts.', 'Keep mapping explicit for sensitive or permission-dependent fields.'],
      sources: [{ label: 'Create web APIs with ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/' }],
    }),
    lesson({
      id: 'api-versioning', title: 'API Versioning', priority: 'High',
      summary: 'API versioning manages incompatible contract evolution while clients migrate at different speeds.',
      concepts: [
        'An API version identifies a contract generation, selected through a documented mechanism such as a URL segment, query value, or header.',
        'Explicit compatibility and retirement policies let old clients continue functioning while the provider adds breaking behavior in a new contract.',
        'Prefer compatible additive evolution where possible; version truly breaking changes, route each version to deliberate DTO and behavior, monitor usage, and communicate deprecation and sunset dates.',
      ],
      flow: ['Client selects contract version', 'Routing resolves compatible endpoint', 'Versioned response follows documented schema'],
      details: ['The API contract may select version via URI, query, header, or media type; each mechanism has caching and operational trade-offs.', 'The server must consistently route and serialize the chosen contract, not just label a route.', 'Deprecation information and adoption telemetry guide a measured retirement rather than abrupt removal.'],
      example: 'Keep /api/v1/orders stable while /api/v2/orders introduces a breaking representation change and a published migration window.',
      code: `[ApiController]
[Route("api/v2/orders")]
public sealed class OrdersV2Controller : ControllerBase { /* v2 DTO contract */ }`,
      advantages: ['Supports gradual consumer migration', 'Makes breaking changes explicit and testable'],
      disadvantages: ['Every supported version increases test and support burden', 'Versioning cannot rescue poor compatibility discipline'],
      use: 'Version when the public contract must break and retain only versions with an owned support and sunset policy.',
      avoid: 'Avoid creating a new version for compatible optional additions or leaving versions supported indefinitely without policy.',
      questions: ['What is a breaking API change?', 'Compare URL and header version selection.', 'How should a version be retired?'],
      scenario: 'A mobile client remains deployed for months; introduce a new version, measure adoption, publish migration examples, and remove the old contract only after the communicated support period.',
      note: 'Version the contract deliberately; framework package choice and version selection syntax depend on the application architecture.',
      takeaways: ['Prefer compatible evolution; version breaking contracts.', 'Each version requires routing, tests, and support ownership.', 'Deprecation should be observable and communicated.'],
      mistakes: ['Treating a new route alone as a complete versioning strategy.', 'Removing an old version based only on the latest client release date.'],
      practices: ['Maintain contract tests for every supported version.', 'Track per-version usage and publish a realistic deprecation schedule.'],
      sources: [{ label: 'API design guidance: versioning', url: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design#versioning-a-restful-web-api' }],
    }),
    lesson({
      id: 'response-result-types', title: 'ASP.NET Core Response Result Types', priority: 'High',
      summary: 'Action return types communicate whether an endpoint returns a representation, several HTTP outcomes, or a framework-level result.',
      concepts: [
        'An action result type describes the response value and HTTP result an MVC action can produce.',
        'Typed contracts improve readability, static checking, and API documentation; overly broad result types can obscure endpoint behavior.',
        'Use ActionResult<T> for a typed representation plus MVC results such as NotFound, use IActionResult when outcomes are heterogeneous, or return a DTO directly for a simple success-only endpoint.',
      ],
      flow: ['Action selects typed result', 'MVC executes result and formatter', 'Status, headers, and body are emitted'],
      details: ['A DTO return is serialized by MVC but offers less explicit status choice than an action result.', 'ActionResult<T> supports a typed body alongside common status helpers such as Ok and NotFound.', 'IActionResult is flexible but response metadata should be documented explicitly for OpenAPI consumers.'],
      example: 'A lookup returns ActionResult<ProductDto> so the success schema is visible while the action can also return 404.',
      code: `[HttpGet("{id:int}")]
public async Task<ActionResult<ProductDto>> Get(int id, CancellationToken ct)
{
    var product = await service.FindAsync(id, ct);
    return product is null ? NotFound() : Ok(product);
}`,
      advantages: ['Typed success contracts clarify API output', 'Action results express status and header behavior'],
      disadvantages: ['Broad IActionResult hides response schemas unless documented', 'Implicit conversions can obscure response construction'],
      use: 'Use ActionResult<T> for controller endpoints with a primary representation and a few explicit HTTP alternatives.',
      avoid: 'Avoid returning object or IActionResult everywhere without documenting possible status and body contracts.',
      questions: ['When is ActionResult<T> useful?', 'What does IActionResult represent?', 'How do result types help OpenAPI?'],
      scenario: 'A generated client cannot determine the success schema because actions return object; replace it with explicit DTO return types and document non-success responses.',
      note: 'MVC controller results differ from Minimal API IResult and TypedResults, although both represent HTTP responses.',
      takeaways: ['Return types are part of the API design and documentation story.', 'Use a typed success contract with explicit alternatives.', 'Document outcomes that static inference cannot see.'],
      mistakes: ['Returning a DTO with an accidental 200 for a missing resource.', 'Assuming a return type alone documents every error response.'],
      practices: ['Declare response metadata for success and relevant errors.', 'Use CreatedAtAction for resource creation and NoContent when no representation is returned.'],
      sources: [{ label: 'Action return types in ASP.NET Core Web API', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types' }],
    }),
    lesson({
      id: 'logging-timing-middleware', title: 'Logging & Timing Middleware', priority: 'High',
      summary: 'Request instrumentation correlates HTTP outcomes and elapsed time with structured logs and distributed traces.',
      concepts: [
        'Observability middleware records selected request metadata and measures time spent around downstream processing.',
        'Correlated structured signals help architects distinguish routing, application, and dependency latency without inspecting sensitive payloads.',
        'Capture method, route template, status, duration, and trace identifier; use framework diagnostics where possible and propagate Activity trace context across service calls.',
      ],
      flow: ['Capture safe request context', 'Run downstream application work', 'Record status, duration, and correlation'],
      details: ['Route templates have lower cardinality and less sensitive data than raw paths containing identifiers.', 'Downstream execution includes endpoint and dependency time; distributed traces provide spans for finer attribution.', 'Logging occurs after response completion when possible and records trace context for support correlation.'],
      example: 'An incident review correlates slow order requests with a database span by trace ID and route template.',
      code: `var started = Stopwatch.GetTimestamp();
await next(context);
logger.LogInformation("HTTP {Method} {Route} {Status} in {ElapsedMs}ms TraceId={TraceId}",
    context.Request.Method, context.GetEndpoint()?.DisplayName,
    context.Response.StatusCode, Stopwatch.GetElapsedTime(started).TotalMilliseconds,
    context.TraceIdentifier);`,
      advantages: ['Consistent request-level operational context', 'Supports latency analysis and cross-service investigation'],
      disadvantages: ['High-volume logs and high-cardinality fields raise cost', 'Over-collection can expose secrets or personal data'],
      use: 'Use structured framework logging and tracing with reviewed fields, sampling, retention, and access controls.',
      avoid: 'Avoid logging authorization headers, tokens, passwords, full bodies, or raw user identifiers without a documented need and safeguards.',
      questions: ['Why log route templates rather than raw paths?', 'How do trace IDs help across services?', 'Why not log every request body?'],
      scenario: 'p95 latency worsens while logs grow; sample noisy low-value routes, correlate traces with dependency spans, and remove sensitive high-cardinality dimensions.',
      note: 'Use ILogger message templates and distributed tracing rather than creating duplicate unstructured request logs.',
      takeaways: ['Measure the whole request and trace dependencies separately.', 'Correlate with trace context and bounded dimensions.', 'Data minimization is an observability control.'],
      mistakes: ['Logging bearer tokens or entire bodies for convenience.', 'Using raw URLs or user input as unbounded metric labels.'],
      practices: ['Define redaction, retention, and access policies for telemetry.', 'Prefer standard ASP.NET Core diagnostics and OpenTelemetry instrumentation.'],
      sources: [{ label: 'ASP.NET Core logging', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/logging/' }],
    }),
  ],
};
