import { LearningModule, LessonVisual, topic } from '../learning.models';

type Lesson = (
  id: string, title: string, concepts: [string, string, string], example: string, code: string,
  advantages: string[], disadvantages: string[], guidance: [string, string], questions: string[],
  scenario: string, visual: Omit<LessonVisual, 'commonMistakes'>, sources?: { label: string; url: string }[],
) => ReturnType<typeof topic>;

const lesson: Lesson = (id, title, concepts, example, code, advantages, disadvantages, guidance, questions, scenario, visual, sources) =>
  topic(id, title, 'High', concepts[0], concepts, visual.diagram.map(node => node.label), example, code,
    [advantages, disadvantages], guidance, questions, scenario, sources, {
      ...visual,
      commonMistakes: [guidance[1], `Assuming ${title.toLowerCase()} guarantees outcomes beyond its stated scope.`],
    });

const visual = (
  diagram: LessonVisual['diagram'], diagramNote: string, exampleSteps: string[], keyTakeaways: string[],
  bestPractices: string[], summary: string,
): Omit<LessonVisual, 'commonMistakes'> => ({ diagram, diagramNote, exampleSteps, keyTakeaways, bestPractices, summary });

const patterns = 'https://learn.microsoft.com/dotnet/standard/design-guidelines/';
const diDocs = 'https://learn.microsoft.com/dotnet/core/extensions/dependency-injection';

export const designModule: LearningModule = {
  id: 'design-patterns',
  title: 'Design Patterns & SOLID',
  description: 'Apply patterns and design principles when they clarify responsibilities, variation, and testable boundaries.',
  topics: [
    lesson('why-design-patterns', 'Patterns: What They Are and Why They Matter', [
      'A design pattern is a named, reusable arrangement of responsibilities and collaborations for a recurring design problem; it is guidance, not a library or a complete implementation.',
      'A shared vocabulary helps engineers discuss trade-offs and recognize proven structures, but patterns do not remove domain decisions or guarantee good design.',
      'Start with the concrete change pressure, choose the smallest structure that isolates it, and compare the added indirection and lifecycle cost with the flexibility gained.',
    ], 'A payment service needs to support new providers. Strategy can isolate provider-specific behavior; adding a pattern without provider variation would add ceremony without solving a problem.',
    `public interface IPaymentMethod
{
    Task<PaymentResult> PayAsync(PaymentRequest request, CancellationToken ct);
}`,
    ['Provides a concise vocabulary for responsibilities and collaboration.', 'Can isolate change, improve substitutability, and make tests more focused.'],
    ['Named patterns can be over-applied and add indirection or abstractions.', 'A textbook structure may not fit the real domain or framework.'],
    ['Use a pattern when a recurring change or collaboration problem is present.', 'Avoid choosing a pattern by name before understanding the forces and constraints.'],
    ['What problem does a pattern solve beyond giving code a familiar shape?', 'How do you decide if an abstraction is worth its cost?', 'Can a pattern guarantee maintainability?'],
    'A team introduces factories, repositories, and mediators in a small CRUD feature. Review whether each boundary represents real variation or merely adds files and navigation.',
    visual([
      { label: 'Pressure', detail: 'Identify recurring variation, construction, communication, or responsibility change.' },
      { label: 'Structure', detail: 'Assign roles and collaborations that isolate that pressure.' },
      { label: 'Trade-off', detail: 'Compare flexibility and testability against indirection and lifecycle cost.' },
      { label: 'Evidence', detail: 'Keep the design only if it improves a realistic change or test.' },
    ], 'Patterns are tools and shared language; context and measured consequences determine whether to apply them.',
    ['State the change that is difficult today.', 'Choose the smallest pattern that separates that change.', 'Review whether tests and callers became clearer.', 'Remove layers that have no distinct responsibility.'],
    ['Treating pattern names as architecture goals.', 'Confusing extra interfaces with decoupling.', 'Adding extension points for hypothetical needs.'],
    ['Explain both the problem and the trade-off in a review.', 'Prefer simple code until change pressure justifies structure.'],
    'A pattern earns its place by improving a real design constraint, not by matching a catalog diagram.'),
    [ { label: '.NET design guidelines', url: patterns } ]),

    lesson('patterns-in-projects', 'Patterns Used Together in Projects', [
      'Production systems commonly combine a few patterns around a use case: dependency injection assembles collaborators, a strategy selects policy, a repository may encapsulate domain queries, and a decorator adds cross-cutting behavior.',
      'Patterns compose to separate change and testing boundaries, but unnecessary layers multiply indirection and can obscure control flow and transaction ownership.',
      'Trace one request through its composition root, handler, domain policy, persistence boundary, and infrastructure; identify who owns state, errors, retries, and commit before adding another pattern.',
    ], 'Order placement uses DI to provide an order repository and payment strategy; a logging decorator adds telemetry without changing payment logic.',
    `public sealed class OrderService(IOrderRepository orders, IPaymentMethod payment)
{
    public async Task PlaceAsync(Order order, CancellationToken ct)
    {
        await payment.PayAsync(order.Payment, ct);
        await orders.AddAsync(order, ct);
    }
}`,
    ['Responsibilities can be isolated and tested at meaningful boundaries.', 'Cross-cutting behavior can be composed without embedding it in every domain class.'],
    ['Too many handlers, interfaces, and wrappers make navigation harder.', 'Patterns composed without explicit transaction/error semantics can create correctness gaps.'],
    ['Use patterns that answer a concrete need in the use case and document ownership.', 'Avoid layering every CRUD action through a pattern stack by default.'],
    ['Where are implementations composed in a .NET application?', 'How can decorators add behavior without changing a service?', 'Who owns the transaction when several patterns participate?'],
    'A payment succeeds but order persistence fails. Trace the flow and redesign the transaction/workflow boundary rather than assuming DI or repositories make the two effects atomic.',
    visual([
      { label: 'Composition root', detail: 'DI registers concrete infrastructure and policy implementations.' },
      { label: 'Use-case service', detail: 'Coordinates one application operation and its error/transaction boundary.' },
      { label: 'Domain policy', detail: 'Strategy or domain object owns business variation and invariants.' },
      { label: 'Infrastructure', detail: 'Repository or adapter integrates with persistence and external providers.' },
    ], 'Patterns provide local structures; the request flow still needs one explicit owner for ordering, failures, and durable effects.',
    ['Follow an actual request across the layers.', 'Name the unique responsibility each layer owns.', 'Make transaction and external side-effect boundaries explicit.', 'Remove wrappers that merely forward every call.'],
    ['Assuming dependency injection itself creates good architecture.', 'Splitting business decisions between handler, controller, and repository.', 'Committing one effect before an unrelated effect with no recovery plan.'],
    ['Keep composition at the application boundary.', 'Test policy, orchestration, and infrastructure at their appropriate levels.'],
    'Patterns work together when responsibilities remain distinct and the use-case flow stays understandable.')),

    lesson('repository-pattern', 'Repository Pattern', [
      'A repository provides a domain-oriented boundary for retrieving and persisting aggregates while hiding persistence-specific details where that abstraction is valuable.',
      'It can keep domain/application code independent of storage mechanics and centralize meaningful queries; a generic wrapper around every ORM operation often only hides useful capabilities.',
      'Define operations in terms of the aggregate and use case, keep query behavior explicit, and clarify whether the repository stages changes or commits them. In EF Core, DbContext already tracks entities and implements repository/unit-of-work-like behavior.',
    ], 'An OrderRepository exposes GetForConfirmationAsync with required lines and status rather than leaking a generic IQueryable to every caller.',
    `public interface IOrderRepository
{
    Task<Order?> GetForConfirmationAsync(Guid id, CancellationToken ct);
    void Add(Order order);
}`,
    ['Domain-specific operations communicate intent and can protect aggregate boundaries.', 'Can isolate persistence technology when that is a real architectural seam.'],
    ['Generic repositories duplicate ORM APIs and restrict query composition.', 'Extra abstractions complicate transactions, projections, and testing if they add no behavior.'],
    ['Use a repository for aggregate-oriented operations or a meaningful persistence boundary.', 'Avoid wrapping every DbSet method or returning IQueryable across an abstraction boundary without an explicit design.'],
    ['What does a domain repository own?', 'What repository-like features does EF Core DbContext provide?', 'Why can a generic repository make queries harder?'],
    'A report query needs grouping and projection. Keep it as an explicit query optimized for reporting instead of forcing it through a CRUD repository designed for aggregate writes.',
    visual([
      { label: 'Use-case intent', detail: 'Caller requests a domain operation such as load order for confirmation.' },
      { label: 'Repository contract', detail: 'Contract exposes aggregate-focused queries and persistence intent.' },
      { label: 'Implementation', detail: 'EF or another store performs mapping, query, and tracking.' },
      { label: 'Commit owner', detail: 'Application unit of work controls when staged changes become durable.' },
    ], 'A repository is a boundary only when its API communicates intent or isolates change; renaming DbSet operations alone is not isolation.',
    ['Keep aggregate invariants with the aggregate and its application use case.', 'Make transaction/commit ownership explicit.', 'Use direct projections for read models when they are clearer.'],
    ['Returning IQueryable that silently leaks provider behavior.', 'Adding a generic repository that only forwards Add, Find, and Save.', 'Hiding commits in methods when callers need to combine changes.'],
    ['Use domain-focused method names and cancellation.', 'Keep query tracking and consistency expectations visible.'],
    'A repository is useful when it protects a meaningful domain or persistence boundary, not as a mandatory wrapper around an ORM.')),

    lesson('unit-of-work-pattern', 'Unit of Work Pattern', [
      'A unit of work coordinates a set of related changes and commits them as one local persistence transaction where the store supports it.',
      'It prevents callers from independently saving parts of one use case and clarifies the atomic boundary; it cannot atomically include arbitrary remote API calls.',
      'Load and change tracked entities, stage related additions/removals, then commit once. EF Core DbContext tracks changes and SaveChanges normally commits those database changes transactionally when supported.',
    ], 'Confirming an order changes order status and writes an audit row in one database transaction, then separately publishes an outbox event.',
    `await using var tx = await db.Database.BeginTransactionAsync(ct);
order.Confirm();
db.AuditEntries.Add(AuditEntry.For(order));
db.Outbox.Add(OutboxMessage.For("OrderConfirmed", order.Id));
await db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);`,
    ['Keeps related local changes atomic and provides one explicit commit point.', 'Supports batching and change tracking across a use case.'],
    ['A unit of work is store-specific and does not span independent remote services by default.', 'Long-lived tracked contexts retain state and can mix unrelated operations.'],
    ['Use one short-lived unit of work per business operation requiring a coordinated local commit.', 'Avoid holding a database transaction open across network calls or user interaction.'],
    ['What does a unit of work coordinate?', 'When does EF Core SaveChanges use a transaction?', 'Can a unit of work include a payment provider call?'],
    'An order is saved before its audit record due to two commits. Stage both under one context/transaction and use an outbox for external publication.',
    visual([
      { label: 'Load state', detail: 'A short-lived context tracks relevant entities and changes.' },
      { label: 'Stage changes', detail: 'Aggregate updates and related rows remain uncommitted in the unit.' },
      { label: 'Commit once', detail: 'SaveChanges applies local database changes under supported transaction semantics.' },
      { label: 'External effects', detail: 'Outbox or workflow coordinates effects outside the database transaction.' },
    ], 'Local atomic commit does not imply a distributed transaction; network side effects need their own reliability design.',
    ['Scope context and transaction to one operation.', 'Keep commit ownership explicit and commit once where practical.', 'Use an outbox for database-plus-message intent.'],
    ['Sharing one DbContext for an entire application lifetime.', 'Assuming SaveChanges rolls back a completed external API call.', 'Opening a transaction before slow remote I/O.'],
    ['Keep database transactions short.', 'Test both commit and rollback behavior for important invariants.'],
    'A unit of work protects one local commit boundary; distributed side effects require another pattern.')),

    lesson('factory-pattern', 'Factory Pattern', [
      'A factory centralizes object creation when construction depends on input, configuration, or a family of related products.',
      'It hides construction details from consumers and can enforce valid object setup; a factory is unnecessary when ordinary constructor injection already expresses stable dependencies.',
      'Make selection criteria explicit, return an abstraction where behavior varies, and keep factories focused on creation rather than accumulating business workflow or service-location responsibilities.',
    ], 'A document importer creates a CSV or JSON parser based on a validated file format.',
    `public interface IImportParser { Task<ImportResult> ParseAsync(Stream input, CancellationToken ct); }
public sealed class ImportParserFactory(IEnumerable<IImportParser> parsers)
{
    public IImportParser For(string format) =>
        parsers.Single(p => p.Supports(format));
}`,
    ['Encapsulates variable or complex construction.', 'Centralizes validation and product-family consistency.'],
    ['Can become a service locator or giant switch with hidden dependencies.', 'Adds little value when the type is known and constructor injection suffices.'],
    ['Use when creation or product selection is genuinely variable or complex.', 'Avoid a factory that resolves arbitrary services or owns unrelated business behavior.'],
    ['What does a factory hide from its client?', 'How is a factory different from a DI container?', 'When would direct constructor injection be simpler?'],
    'New import formats arrive monthly. Add a parser and register it; reject unsupported formats explicitly instead of silently selecting a default parser.',
    visual([
      { label: 'Creation request', detail: 'Caller specifies validated input such as format or product kind.' },
      { label: 'Selection', detail: 'Factory applies a focused creation rule and handles unsupported cases.' },
      { label: 'Construction', detail: 'Product receives required dependencies and valid configuration.' },
      { label: 'Abstraction', detail: 'Caller uses the created product without depending on concrete construction.' },
    ], 'A factory encapsulates a creation decision; dependency injection composes object graphs and manages lifetimes.',
    ['Keep product selection deterministic and testable.', 'Fail clearly for unknown or ambiguous formats.', 'Use DI for stable application wiring and a factory for runtime choice.'],
    ['Resolving any arbitrary type from a general factory.', 'Repeating a large format switch in multiple callers.', 'Returning null for unsupported creation.'],
    ['Return a useful abstraction and keep creation side-effect expectations clear.', 'Avoid adding a factory for a single obvious new operation.'],
    'Factories are useful when creation is a real variability point, not just because an object has a constructor.')),

    lesson('singleton-pattern', 'Singleton Pattern and DI Lifetime', [
      'Singleton describes one shared instance for a defined application/container lifetime; in .NET, singleton DI registration is often preferable to a globally accessible static instance.',
      'Sharing immutable or thread-safe services avoids repeated construction, but a singleton lives across requests and may retain state or dependencies longer than intended.',
      'Register the service once in the composition root, make shared state immutable or synchronized, and do not capture scoped request services in a singleton.',
    ], 'A stateless serializer is singleton-safe; a request-specific shopping cart is not and should be scoped to its user/session context.',
    `services.AddSingleton<IClock, SystemClock>();
services.AddScoped<IOrderService, OrderService>();
// Do not inject a scoped DbContext into a singleton.`,
    ['Shares expensive, safe-to-share infrastructure for the process lifetime.', 'DI makes lifecycle explicit and substitutes implementations in tests.'],
    ['Mutable shared state creates races and cross-request leakage.', 'A singleton can retain resources or accidentally depend on request-scoped state.'],
    ['Use singleton for stateless or deliberately thread-safe shared services.', 'Avoid storing user/request data or injecting scoped dependencies into a singleton.'],
    ['What lifetime does a DI singleton have?', 'Why is a singleton with a scoped DbContext unsafe?', 'When is a static singleton harder to test?'],
    'A singleton cache stores the current user ID and leaks one customer’s state into another request. Move request data to scoped state and use a properly designed shared cache if needed.',
    visual([
      { label: 'Composition', detail: 'Container creates one instance for the configured provider lifetime.' },
      { label: 'Concurrent calls', detail: 'Many request threads can use it at the same time.' },
      { label: 'Dependencies', detail: 'Its dependency graph must have compatible or safely managed lifetimes.' },
      { label: 'Shutdown', detail: 'Container disposes owned resources when its lifetime ends.' },
    ], 'Singleton means shared instance, not automatically thread-safe, immutable, globally valid, or distributed across application processes.',
    ['Review every dependency lifetime and mutable field.', 'Prefer immutable data or explicit synchronization for shared state.', 'Use DI registration rather than hidden static access.'],
    ['Treating one instance as inherently thread-safe.', 'Capturing scoped services or per-request data.', 'Assuming singleton state is shared across multiple app replicas.'],
    ['Keep singleton state minimal and bounded.', 'Use distributed storage when state must be shared across processes.'],
    'Singleton is a lifetime choice with concurrency and dependency consequences, not a universal object-management shortcut.')),

    lesson('strategy-pattern', 'Strategy Pattern: Shipping Rate Example', [
      'Strategy defines a family of interchangeable algorithms behind a common contract so a caller can select behavior without embedding each algorithm in its own conditional logic.',
      'It localizes policy variation and makes alternatives independently testable; one class per trivial branch can still be needless indirection.',
      'Represent each rate calculation as a strategy, select by explicit eligibility/context, and keep each strategy responsible for its own rules. Decide how ties, no-match, configuration, and fallback behave.',
    ], 'A shipping quote chooses an eligible carrier strategy using destination, weight, and service constraints, then returns an estimate with its assumptions.',
    `public interface IShippingRate
{
    bool Supports(Shipment shipment);
    decimal Quote(Shipment shipment);
}
var strategy = rates.Single(x => x.Supports(shipment));
var quote = strategy.Quote(shipment);`,
    ['Adds a carrier policy without changing unrelated quote logic.', 'Enables direct tests of each algorithm and supports runtime selection.'],
    ['Selection rules can become scattered or ambiguous.', 'Additional types and registrations are unnecessary for stable, tiny behavior.'],
    ['Use when behavior varies by context and alternatives share a meaningful contract.', 'Avoid strategy when one simple expression is clearer and unlikely to vary.'],
    ['How does Strategy differ from a conditional?', 'Where should strategy selection live?', 'What should happen if multiple strategies match?'],
    'A new carrier supports only some postal codes. Its Supports rule and quote tests define eligibility; the selector detects no match rather than silently choosing the wrong carrier.',
    visual([
      { label: 'Shipment context', detail: 'Caller supplies destination, dimensions, and required delivery speed.' },
      { label: 'Eligible strategies', detail: 'Each carrier declares supported input and constraints.' },
      { label: 'Selection rule', detail: 'Application policy resolves one valid match or an explicit no-match result.' },
      { label: 'Quote result', detail: 'Chosen algorithm returns amount plus currency, expiry, and assumptions.' },
    ], 'Strategy isolates calculations; deciding which policy is valid remains an explicit business rule.',
    ['Keep strategy contracts cohesive and deterministic.', 'Test boundary conditions and selection ambiguity.', 'Return rich results when quote assumptions matter.'],
    ['Selecting the first strategy with registration-order-dependent behavior.', 'Hiding business eligibility inside an untestable selector.', 'Treating estimates as guaranteed prices.'],
    ['Make no-match and tie behavior explicit.', 'Inject strategies through DI rather than constructing them in the caller.'],
    'Strategy is valuable when meaningful algorithms vary at runtime and share a truthful contract.')),

    lesson('observer-pattern', 'Observer Pattern', [
      'Observer establishes a one-to-many notification relationship: a subject publishes a change or event and interested observers react without the subject directly owning each observer’s work.',
      'It reduces direct coupling between publisher and subscribers, but introduces lifecycle, ordering, error-isolation, and synchronous-versus-asynchronous delivery questions.',
      'Use in-process events for bounded local notification or a durable broker for cross-process delivery; define subscription lifetime, failure behavior, and whether observers run before or after state is committed.',
    ], 'When an order changes in memory, UI observers refresh; for durable invoice generation across processes, publish a persisted domain event instead.',
    `public event EventHandler<OrderChangedEventArgs>? Changed;
protected void OnChanged(Order order) =>
    Changed?.Invoke(this, new OrderChangedEventArgs(order.Id));`,
    ['Publisher need not call each subscriber by concrete type.', 'Can support extensible local notifications and reactive views.'],
    ['Synchronous observers can slow or fail the publisher.', 'Unmanaged subscriptions cause leaks; in-memory events are lost on process crash.'],
    ['Use for local notifications with clear lifetime and failure semantics.', 'Avoid in-process Observer when durable cross-service delivery or independent recovery is required.'],
    ['How does Observer reduce coupling?', 'What happens if a synchronous observer throws?', 'Why is an in-memory event not a durable integration event?'],
    'A UI subscriber remains attached after a view closes and leaks memory. Unsubscribe with the view lifetime; persist cross-service events through an outbox.',
    visual([
      { label: 'Subject', detail: 'Publishes a notification after a defined state change.' },
      { label: 'Subscription', detail: 'Observer registration has an explicit lifetime and cancellation path.' },
      { label: 'Notification', detail: 'Payload states what changed without exposing unnecessary internals.' },
      { label: 'Observer action', detail: 'Subscriber handles failure and ordering according to delivery semantics.' },
    ], 'The classic in-process pattern is not automatically asynchronous, durable, ordered, or isolated from subscriber exceptions.',
    ['Define whether notification is synchronous or queued.', 'Unsubscribe or scope event handlers to component lifetime.', 'Persist an outbox event for durable integration.'],
    ['Publishing before state is committed when observers assume durability.', 'Allowing one observer failure to unexpectedly abort all subscribers.', 'Using process-local events as a cross-service message bus.'],
    ['Keep event payloads small and meaningful.', 'Test subscription cleanup and observer failure behavior.'],
    'Observer decouples notification relationships but requires explicit delivery, lifetime, and error semantics.')),

    lesson('decorator-pattern', 'Decorator Pattern', [
      'Decorator wraps an object behind the same contract and adds behavior before or after delegating to the wrapped object.',
      'It composes optional cross-cutting behavior without subclassing every implementation or embedding logging/caching/retry policy in domain logic.',
      'Keep the same abstraction at the wrapper boundary, make ordering explicit, and ensure added behavior preserves the contract, errors, cancellation, and disposal semantics.',
    ], 'A logging decorator records a payment call while forwarding the same request and cancellation token to the provider implementation.',
    `public sealed class LoggingPayment(IPaymentMethod inner, ILogger<LoggingPayment> log)
    : IPaymentMethod
{
    public async Task<PaymentResult> PayAsync(PaymentRequest request, CancellationToken ct)
    {
        log.LogInformation("Starting payment {Id}", request.Id);
        return await inner.PayAsync(request, ct);
    }
}`,
    ['Composes optional concerns around stable contracts.', 'Avoids subclass explosion and keeps core implementation focused.'],
    ['Wrapper ordering can change semantics and become hard to trace.', 'A decorator that changes errors or ignores cancellation violates substitutability.'],
    ['Use for cross-cutting behavior that can be expressed while preserving the contract.', 'Avoid wrapping every service in generic layers that obscure call flow.'],
    ['How is a decorator different from inheritance?', 'Why does wrapper order matter?', 'What contract behavior must a decorator preserve?'],
    'A caching decorator returns stale payment status. Restrict caching to suitable read contracts and define invalidation and freshness explicitly.',
    visual([
      { label: 'Client', detail: 'Depends only on the service contract.' },
      { label: 'Decorator', detail: 'Implements the same contract and adds one cohesive behavior.' },
      { label: 'Wrapped service', detail: 'Performs the original work and retains ownership of its domain result.' },
      { label: 'Composition order', detail: 'DI or explicit composition determines which policies wrap which others.' },
    ], 'A decorator should be substitutable for the wrapped service; retry, caching, and authorization wrappers can alter semantics and need deliberate ordering.',
    ['Pass cancellation and preserve result/error behavior.', 'Add one focused concern per decorator.', 'Test wrapper behavior and the composed order.'],
    ['Swallowing exceptions or changing return semantics silently.', 'Caching mutable or sensitive results without policy.', 'Creating recursive decoration through incorrect DI registration.'],
    ['Name wrappers by the behavior they add.', 'Keep ordering visible in composition and diagnostics.'],
    'Decorator extends behavior through composition while preserving the wrapped contract.')),

    lesson('adapter-pattern', 'Adapter Pattern', [
      'Adapter translates one interface or data model into another so incompatible components can collaborate without changing either component’s core contract.',
      'It isolates vendor-specific APIs, legacy protocols, and awkward external models from application/domain code.',
      'Define the application-facing port, implement a focused adapter around the external client, translate units/errors explicitly, and map cancellation and retry semantics carefully.',
    ], 'An adapter converts a shipping provider’s pounds-and-string statuses into the application’s kilograms-and-shipment-state model.',
    `public interface ICarrier
{
    Task<ShipmentStatus> GetStatusAsync(Guid shipmentId, CancellationToken ct);
}
public sealed class CarrierAdapter(ExternalCarrierClient client) : ICarrier
{
    public async Task<ShipmentStatus> GetStatusAsync(Guid id, CancellationToken ct) =>
        Map(await client.LookupAsync(id.ToString(), ct));
}`,
    ['Protects domain code from vendor churn and incompatible types.', 'Creates a focused seam for testing external integration behavior.'],
    ['Mapping layers require maintenance as external contracts evolve.', 'An adapter can conceal important differences if it normalizes errors or units incorrectly.'],
    ['Use at integration boundaries where interfaces or semantics do not match.', 'Avoid an adapter that simply renames every method without meaningful translation.'],
    ['What mismatch does an adapter resolve?', 'Where should vendor-specific types be translated?', 'How should an adapter represent provider errors?'],
    'The provider changes status spelling from `IN_TRANSIT` to `MOVING`. Update and test the adapter mapping; domain workflows remain independent of provider wire format.',
    visual([
      { label: 'Application port', detail: 'Stable domain-facing operation and types express what the app needs.' },
      { label: 'Adapter', detail: 'Translates identifiers, units, status, errors, and cancellation deliberately.' },
      { label: 'External API', detail: 'Vendor contract remains isolated behind its client and credentials.' },
      { label: 'Normalized outcome', detail: 'Caller receives domain meaning or an explicit integration failure.' },
    ], 'An adapter translates semantics, not just syntax; ambiguous provider outcomes should remain visible rather than being silently normalized.',
    ['Keep vendor SDK types outside domain-facing contracts.', 'Test mapping with real documented response variations.', 'Preserve relevant error codes and retryability.'],
    ['Converting units without precision or range checks.', 'Mapping unknown external states to a success default.', 'Letting provider exceptions leak as domain exceptions.'],
    ['Fail explicitly on unknown contract values.', 'Use contract tests or recorded sanitized fixtures for integrations.'],
    'An adapter contains integration mismatch while preserving the meaning and uncertainty of the external system.')),

    lesson('dependency-injection-pattern', 'Dependency Injection Pattern', [
      'Dependency injection supplies an object’s required collaborators from outside rather than having the object construct or locate them itself.',
      'It separates policy from concrete construction, supports substitution, and makes object lifetime composition explicit; a container is one DI mechanism, not the pattern itself.',
      'Prefer constructor injection for required dependencies, compose implementations at the application boundary, and choose transient/scoped/singleton lifetimes according to state and ownership.',
    ], 'OrderService declares an IOrderRepository dependency; the ASP.NET Core composition root registers the EF implementation for the request scope.',
    `services.AddScoped<IOrderRepository, EfOrderRepository>();
services.AddScoped<OrderService>();

public sealed class OrderService(IOrderRepository orders)
{
    public Task<Order?> FindAsync(Guid id, CancellationToken ct) => orders.FindAsync(id, ct);
}`,
    ['Dependencies are visible and replaceable for testing or configuration.', 'Composition centralizes implementation choice and lifecycle management.'],
    ['Container misconfiguration and lifetime mismatch can fail at runtime.', 'Service locator patterns hide dependencies and weaken compile-time clarity.'],
    ['Use constructor injection for required collaborators and composition-root registration.', 'Avoid resolving arbitrary services from IServiceProvider inside domain logic.'],
    ['What is the difference between DI and a DI container?', 'Why is constructor injection useful?', 'What is a captive dependency?'],
    'A singleton background service captures a scoped DbContext. Create a scope per operation or use an appropriate factory rather than sharing a request-scoped context.',
    visual([
      { label: 'Consumer contract', detail: 'Class declares required abstractions in its constructor.' },
      { label: 'Composition root', detail: 'Application registers concrete implementations and lifecycle.' },
      { label: 'Container resolution', detail: 'Container builds the object graph and detects some scope errors.' },
      { label: 'Operation', detail: 'Consumer uses the dependency without knowing how it was created.' },
    ], 'DI is a design technique; a container automates composition but does not choose correct boundaries or lifetimes for you.',
    ['Keep required dependencies constructor-visible.', 'Register lifetimes that match state ownership.', 'Use explicit scopes in long-lived workers.'],
    ['Calling IServiceProvider as a hidden service locator.', 'Injecting a scoped service into a singleton.', 'Adding an interface for every class without a substitutability need.'],
    ['Keep composition in startup/module boundaries.', 'Validate registrations and test important object graphs.'],
    'Dependency injection separates use from construction; correct abstraction and lifetime design remain application responsibilities.')),

    lesson('cqrs-pattern', 'CQRS', [
      'Command Query Responsibility Segregation separates operations that change state (commands) from operations that read and return data (queries).',
      'Different read and write needs can benefit from distinct models, validation, and scaling; CQRS does not require separate databases, event sourcing, or a mediator library.',
      'Make commands express intent and enforce invariants at the authoritative write boundary; shape queries as direct read projections. Split stores only when measured requirements justify synchronization and operational complexity.',
    ], 'ConfirmOrder validates and changes the aggregate; GetOrderSummary projects a lightweight DTO for the customer dashboard.',
    `public sealed record ConfirmOrder(Guid OrderId);
public sealed record GetOrderSummary(Guid OrderId);
// Command handler enforces the invariant; query handler projects read data.`,
    ['Separates write invariants from read-oriented projection needs.', 'Enables independent optimization when workloads materially diverge.'],
    ['Additional message types and handlers add indirection.', 'Separate read stores introduce replication lag, rebuild, and reconciliation concerns.'],
    ['Use when read and write models or scaling constraints differ materially.', 'Avoid a separate database, event sourcing, or MediatR solely because the term CQRS is fashionable.'],
    ['Does CQRS require two databases?', 'How does a command differ from a query?', 'What new consistency problem comes with a separate read model?'],
    'A dashboard requires denormalized search while writes remain authoritative. Update the projection reliably, state its freshness, and retain a rebuild path.',
    visual([
      { label: 'Command', detail: 'Expresses intent to change authoritative state and may be rejected by an invariant.' },
      { label: 'Write model', detail: 'Applies domain rules and commits through the owning transaction boundary.' },
      { label: 'Query', detail: 'Reads a projection shaped for the caller without changing state.' },
      { label: 'Optional projection', detail: 'Separate model/store scales independently but may lag and require rebuild.' },
    ], 'Separate read/write responsibilities first; physically separate databases only when the benefit outweighs consistency and operations cost.',
    ['Make command handling authoritative for invariants.', 'Return query DTOs rather than exposing persistence entities.', 'Specify projection freshness when read models lag.'],
    ['Calling every method a command/query while retaining tangled responsibilities.', 'Assuming MediatR is CQRS.', 'Introducing eventual consistency without a user-visible freshness policy.'],
    ['Start with logical separation in one database.', 'Measure read/write pressure before adding another store.'],
    'CQRS separates intent and models; physical separation and event sourcing are independent choices.')),

    lesson('solid-srp', 'SOLID: Single Responsibility Principle', [
      'Single Responsibility Principle (SRP) says a module should have one coherent reason to change, often expressed as one actor or policy that owns its behavior.',
      'Cohesive responsibilities are easier to change and test; “one responsibility” does not mean one method or one class per statement.',
      'Separate policies with independent change causes while keeping behavior that changes together cohesive. For example, calculate an invoice in domain code and delegate persistence and email delivery to their owners.',
    ], 'A tax-rule change should not require editing a class whose other reason to change is SMTP formatting or database schema.',
    `public sealed class InvoiceCalculator
{
    public decimal Total(Invoice invoice) =>
        invoice.Lines.Sum(x => x.Quantity * x.UnitPrice) + invoice.Tax;
}
// Persistence and notification belong to separate collaborators.`,
    ['Independent changes affect smaller, more cohesive units.', 'Domain behavior can be tested without database or email infrastructure.'],
    ['Over-splitting produces tiny types and navigation overhead.', 'Responsibility boundaries depend on the domain and change ownership.'],
    ['Separate code with independent policy owners or change cadence.', 'Avoid treating every operation or field as a separate responsibility.'],
    ['What does “one reason to change” mean in practice?', 'Why is a one-method-per-class rule not SRP?', 'How would you split a class that calculates, saves, and emails an invoice?'],
    'A tax update repeatedly breaks email notifications because both behaviors share one class. Separate the policies and test calculation independently.',
    visual([
      { label: 'Mixed reasons', detail: 'Tax regulation, database schema, and SMTP format change for different owners.' },
      { label: 'Cohesive policy', detail: 'InvoiceCalculator owns invoice math and its business invariants.' },
      { label: 'Persistence boundary', detail: 'Repository or application service owns storage interaction.' },
      { label: 'Notification boundary', detail: 'Notification service owns delivery formatting and provider behavior.' },
    ], 'SRP is about cohesive reasons to change, not class size or a mandatory count of methods.',
    ['Identify actors or policies that drive changes.', 'Keep related decisions together and unrelated decisions separate.', 'Test pure domain rules independently.'],
    ['Splitting a class mechanically into many pass-through types.', 'Leaving one policy scattered across several classes.', 'Using “single responsibility” to mean one statement per type.'],
    ['Use change history and ownership to find useful boundaries.', 'Refactor when changes repeatedly collide, not based on line count alone.'],
    'SRP improves cohesion by aligning a module with one coherent change responsibility.')),

    lesson('solid-ocp', 'SOLID: Open/Closed Principle', [
      'Open/Closed Principle (OCP) says a component should support anticipated extension without requiring changes to stable existing code.',
      'It can reduce regression risk when variation is known, but no design can be open to every future change; extension points themselves have cost.',
      'Isolate demonstrated variation behind a stable abstraction, such as a discount policy strategy, while keeping ordinary domain changes direct rather than forcing every rule into plugins.',
    ], 'Add a seasonal discount by registering a new policy rather than modifying a growing switch that calculates every discount type.',
    `public interface IDiscountPolicy { bool AppliesTo(Cart cart); decimal Calculate(Cart cart); }
public sealed class MemberDiscount : IDiscountPolicy
{
    public bool AppliesTo(Cart cart) => cart.IsMember;
    public decimal Calculate(Cart cart) => cart.Subtotal * 0.05m;
}`,
    ['Protects stable paths when well-understood variants are added.', 'Makes each new behavior independently testable.'],
    ['Premature extension points constrain later design and add indirection.', 'Some changes alter the abstraction itself and still require existing code edits.'],
    ['Use for recurring, expected variation with a stable contract.', 'Avoid designing a plugin framework for one speculative exception.'],
    ['Does OCP forbid modifying existing code?', 'What evidence justifies an extension point?', 'How can a strategy support OCP for discounts?'],
    'New discount types arrive often, but the code edits an increasingly risky switch. Introduce a policy abstraction and explicitly define precedence and overlap behavior.',
    visual([
      { label: 'Stable caller', detail: 'Checkout asks for a discount policy without enumerating every algorithm.' },
      { label: 'Extension contract', detail: 'Policy contract captures meaningful inputs and output semantics.' },
      { label: 'New policy', detail: 'A new implementation adds a known variation behind the contract.' },
      { label: 'Selection', detail: 'Application resolves eligibility and conflicts deterministically.' },
    ], 'OCP is a targeted change-risk technique, not a promise that existing code will never change.',
    ['Base abstractions on repeated real variation.', 'Specify eligibility, precedence, and fallback.', 'Add regression tests for existing implementations.'],
    ['Making every conditional a strategy.', 'Assuming a new implementation can never require a contract change.', 'Adding extension hooks without a known consumer.'],
    ['Keep the abstraction smaller than the variation it covers.', 'Revisit extension boundaries when new cases challenge the model.'],
    'OCP protects stable behavior by isolating known extension points while accepting that abstractions can evolve.')),

    lesson('solid-lsp', 'SOLID: Liskov Substitution Principle', [
      'Liskov Substitution Principle (LSP) requires a subtype to remain usable wherever its base contract is expected without breaking promised behavior or strengthening preconditions.',
      'Inheritance is safe only when derived types preserve the semantic contract, not merely method signatures; violations make callers depend on concrete-type exceptions.',
      'State preconditions, postconditions, and invariants in the abstraction. Prefer composition or separate capability interfaces when a subtype cannot support the base behavior.',
    ], 'A read-only storage implementation should not implement an interface promising deletion; split read and write capabilities rather than throwing NotSupportedException.',
    `public interface IOrderReader
{
    Task<Order?> FindAsync(Guid id, CancellationToken ct);
}
public interface IOrderWriter
{
    Task SaveAsync(Order order, CancellationToken ct);
}`,
    ['Reliable substitution reduces type-specific branches in callers.', 'Clear contracts encourage correct abstraction and composition.'],
    ['Broad base types can be hard to design without accidental promises.', 'Replacing inheritance with excessive tiny interfaces can also fragment the design.'],
    ['Use inheritance when derived types honor the same observable contract.', 'Avoid subclasses that reject valid base operations or change their meaning unexpectedly.'],
    ['Why is throwing NotSupportedException from an override suspicious?', 'How do preconditions and postconditions relate to LSP?', 'When is composition preferable to inheritance?'],
    'A fake repository rejects writes even though the contract promises them. Split the capability or use a test double that fulfills the same behavior.',
    visual([
      { label: 'Base contract', detail: 'Documents allowed inputs, guarantees, errors, and invariants.' },
      { label: 'Derived implementation', detail: 'Supports the same valid operations without stronger caller requirements.' },
      { label: 'Substitution', detail: 'Caller uses either implementation without concrete-type checks.' },
      { label: 'Capability boundary', detail: 'Unsupported behavior is excluded from an abstraction rather than rejected at runtime.' },
    ], 'LSP is behavioral substitutability; matching signatures and compiling successfully are not enough.',
    ['Document semantics and error behavior in contracts.', 'Test implementations against shared contract tests.', 'Use composition or narrower capabilities for divergent behavior.'],
    ['Overriding a valid operation to throw.', 'Changing units, side effects, or guarantees in a subtype without contract notice.', 'Adding concrete-type conditionals to compensate for a false abstraction.'],
    ['Prefer small truthful abstractions over broad speculative base classes.', 'Test all implementations against the same behavioral expectations.'],
    'A subtype must honor the base abstraction’s behavior, not just its method shapes.')),

    lesson('solid-isp', 'SOLID: Interface Segregation Principle', [
      'Interface Segregation Principle (ISP) says clients should not depend on operations they do not use; interfaces should represent cohesive client needs.',
      'Focused interfaces reduce unwanted coupling and make implementations and test doubles simpler, but excessive fragmentation creates needless contracts and wiring.',
      'Split a broad device API into capabilities used by distinct clients—for example, printing versus scanning—so a printer-only device need not fake scanning.',
    ], 'A receipt printer implements IPrintReceipt, while a multifunction device implements both print and scan capabilities.',
    `public interface IPrintReceipt { Task PrintAsync(Receipt receipt, CancellationToken ct); }
public interface IScanDocument { Task<Scan> ScanAsync(CancellationToken ct); }
public sealed class ReceiptPrinter : IPrintReceipt { /* print only */ }`,
    ['Changes to unused methods no longer affect every client.', 'Implementations and test doubles need only fulfill relevant capabilities.'],
    ['Too many micro-interfaces can obscure cohesive concepts.', 'Splitting interfaces does not automatically make domain boundaries correct.'],
    ['Separate methods when distinct clients need independent capabilities.', 'Avoid interfaces so small they carry no meaningful cohesion or substitution role.'],
    ['What is the client perspective in ISP?', 'Why is a printer forced to scan a design smell?', 'How can interface fragmentation also hurt?'],
    'A shipping client changes because an unrelated invoice method was added to a large gateway interface. Split interfaces along stable client capabilities.',
    visual([
      { label: 'Broad contract', detail: 'One interface combines print, scan, fax, and maintenance operations.' },
      { label: 'Client needs', detail: 'Receipt workflow uses printing only; archive workflow uses scanning.' },
      { label: 'Segregated contracts', detail: 'Each abstraction presents the cohesive operations a client actually needs.' },
      { label: 'Implementations', detail: 'Simple devices implement only the capabilities they support.' },
    ], 'ISP is about client dependency and cohesive capabilities, not maximizing the number of interfaces.',
    ['Group operations by real client use and change together.', 'Make unsupported capability impossible to request through the contract.', 'Use contract tests for each capability.'],
    ['One giant interface that forces no-op or throwing methods.', 'Creating a separate interface for every single method without cohesion.', 'Treating interface count as a quality metric.'],
    ['Follow actual client dependency boundaries.', 'Keep composition manageable as interfaces are split.'],
    'ISP keeps clients coupled only to cohesive capabilities they consume.')),

    lesson('solid-dip', 'SOLID: Dependency Inversion Principle', [
      'Dependency Inversion Principle (DIP) says high-level policy should not depend directly on low-level details; both should depend on abstractions owned around the policy.',
      'It lets business rules remain stable when databases, transports, or vendors change, but an interface is useful only when it represents a meaningful direction of dependency.',
      'Define an application-facing contract for a required capability, implement it in infrastructure, and inject it at composition. Do not confuse DIP with placing interfaces on every class or with dependency injection itself.',
    ], 'Order policy depends on IPaymentAuthorizer; the infrastructure adapter depends on the provider SDK and implements that port.',
    `public interface IPaymentAuthorizer
{
    Task<Authorization> AuthorizeAsync(Payment payment, CancellationToken ct);
}
public sealed class OrderCheckout(IPaymentAuthorizer payments) { /* high-level policy */ }`,
    ['High-level domain policy can be tested without external systems.', 'Infrastructure replacement does not require rewriting business rules.'],
    ['Abstractions can become needless indirection if no meaningful boundary exists.', 'A poorly owned abstraction can leak vendor details or be shaped by low-level constraints.'],
    ['Use at volatile or external boundaries where policy must remain independent.', 'Avoid introducing abstractions for stable internal details that have no substitutability need.'],
    ['How is DIP different from dependency injection?', 'Which side should own an application port?', 'Why is an interface around every class not automatically DIP?'],
    'A vendor SDK type has spread through domain services. Introduce an application-owned port and adapter, then map provider errors into meaningful application outcomes.',
    visual([
      { label: 'High-level policy', detail: 'Checkout expresses the business decision it needs to make.' },
      { label: 'Abstraction / port', detail: 'Application contract describes capability in domain-relevant terms.' },
      { label: 'Low-level adapter', detail: 'Infrastructure implements the port using provider-specific SDK details.' },
      { label: 'Composition', detail: 'DI binds the port to the adapter at the application boundary.' },
    ], 'DIP is about source-code dependency direction; DI is one mechanism for supplying implementations at runtime.',
    ['Keep ports in the layer whose policy needs the capability.', 'Translate vendor models at the infrastructure boundary.', 'Test business policy against the abstraction and adapter separately.'],
    ['Leaking vendor SDK types through the application port.', 'Assuming an interface alone reverses dependency direction.', 'Adding abstractions without a real volatility or testing boundary.'],
    ['Keep contracts small and domain-relevant.', 'Use explicit composition rather than service location.'],
    'DIP protects higher-level policy from low-level detail through a meaningful abstraction owned by the policy.')),

    lesson('repository-unit-testing', 'Repository Pattern and Unit Testing', [
      'A unit test verifies a focused unit of behavior with controlled collaborators; a repository can provide a seam for application behavior, but it does not make database behavior correct by itself.',
      'Tests should distinguish pure domain decisions, orchestration, and provider-specific query/transaction semantics; mocking an ORM can produce confidence without exercising real SQL behavior.',
      'Unit-test domain rules directly, use fakes or mocks at owned boundaries for application orchestration, and add integration tests against the actual persistence provider for mappings, queries, and transactions.',
    ], 'Test that a confirmation handler rejects cancelled orders with a fake repository; separately test its EF query and transaction against a relational test database.',
    `var repository = new FakeOrderRepository(Order.Cancelled(orderId));
var handler = new ConfirmOrderHandler(repository);
var result = await handler.Handle(new ConfirmOrder(orderId), ct);
Assert.Equal(ConfirmResult.AlreadyCancelled, result);`,
    ['Focused tests give fast feedback on business outcomes.', 'Provider integration tests catch SQL, mapping, and transaction errors that mocks cannot.'],
    ['Mocks can become coupled to implementation details.', 'In-memory providers may differ from production relational behavior.'],
    ['Use unit tests for deterministic policy and interaction boundaries; integration tests for persistence semantics.', 'Avoid mocking every DbSet and treating those tests as proof of database correctness.'],
    ['What should a repository unit test prove?', 'When is an integration test necessary?', 'Why can mocking EF Core hide defects?'],
    'A repository test passes with an in-memory fake but production SQL fails on a translation. Add provider-backed coverage for the query and retain unit tests for domain rules.',
    visual([
      { label: 'Domain unit', detail: 'Test invariant and calculation without storage or network dependencies.' },
      { label: 'Application unit', detail: 'Fake a meaningful repository boundary and assert outcome/coordination.' },
      { label: 'Repository integration', detail: 'Run real provider queries, constraints, and transaction behavior.' },
      { label: 'Production confidence', detail: 'Use representative migrations and database semantics, not only mocks.' },
    ], 'A test double isolates collaborators; only an integration test validates how a specific persistence provider behaves.',
    ['Test observable behavior rather than private method calls.', 'Use a relational provider for SQL-dependent query semantics.', 'Keep fake repository behavior faithful to its contract.'],
    ['Mocking an entire ORM query pipeline.', 'Using an in-memory substitute for database constraints and SQL translation.', 'Asserting only that SaveChanges was called rather than that behavior is correct.'],
    ['Keep unit and integration test goals distinct.', 'Run important repository tests against the same provider family as production.'],
    'Repository boundaries can support focused tests, but persistence correctness requires provider-backed integration coverage.')),

    lesson('singleton-thread-safety', 'Singleton Thread Safety', [
      'Thread safety means concurrent operations preserve an object’s invariants and return valid results under the object’s shared-state access patterns.',
      'A DI singleton can serve many concurrent requests in one process; safe construction does not make mutable fields, collections, caches, or compound read-modify-write operations safe.',
      'Prefer immutable state or thread-safe primitives/collections, synchronize compound invariants, bound cache growth, and test concurrent behavior. Use Lazy<T> when safe lazy construction is actually needed; DI already controls ordinary service creation.',
    ], 'A singleton token cache uses ConcurrentDictionary for independent entries but still coordinates expiration updates that span multiple operations.',
    `private readonly ConcurrentDictionary<string, Token> _tokens = new();
public Token GetOrAdd(string key, Func<string, Token> create) =>
    _tokens.GetOrAdd(key, create);`,
    ['Safe shared state avoids races and inconsistent cross-request behavior.', 'Thread-safe collections support common concurrent access patterns.'],
    ['Locks, concurrent collections, and atomicity can add contention or complexity.', 'A thread-safe collection does not make multi-step business invariants atomic.'],
    ['Use immutable data or proven synchronization appropriate to the invariant.', 'Avoid mutable singleton state when request-scoped or distributed state is the real requirement.'],
    ['Does ConcurrentDictionary make every operation atomic?', 'How do thread safety and singleton lifetime relate?', 'When is Lazy<T> useful in a DI application?'],
    'Concurrent cache misses create duplicate expensive tokens. Use an appropriate single-flight or lazy-value strategy, then define expiry, failure caching, and memory bounds.',
    visual([
      { label: 'Shared instance', detail: 'One singleton is concurrently accessed by requests and background work.' },
      { label: 'State invariant', detail: 'Identify fields and multi-step operations whose consistency must hold.' },
      { label: 'Synchronization', detail: 'Use immutable data, atomic operations, or a narrowly scoped lock.' },
      { label: 'Operational bound', detail: 'Control contention, cache size, expiration, and lifecycle.' },
    ], 'Thread safety preserves invariants under concurrency; merely replacing a Dictionary with ConcurrentDictionary may not make a multi-operation update atomic.',
    ['Minimize shared mutable state.', 'Use synchronization around the entire invariant, not isolated field access.', 'Stress-test concurrent creation, update, and eviction paths.'],
    ['Assuming a singleton is safe because it was constructed once.', 'Relying on unsynchronized check-then-act logic.', 'Using a process-local singleton for state that must coordinate across replicas.'],
    ['Document concurrency assumptions and ownership.', 'Choose distributed coordination only when cross-process consistency is required.'],
    'Singleton safety depends on concurrent state access and invariant design, not just registration lifetime.')),
  ],
};
