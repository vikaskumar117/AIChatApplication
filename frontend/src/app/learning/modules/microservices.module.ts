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

const learn = 'https://learn.microsoft.com/dotnet/architecture/microservices/';

export const microservicesModule: LearningModule = {
  id: 'microservices',
  title: 'Microservices',
  description: 'Design service boundaries, communication, and failure recovery with explicit consistency and delivery guarantees.',
  topics: [
    lesson('service-communication', 'Service Communication', [
      'Service communication is a contract and transport through which independently deployed components exchange commands, queries, or facts.',
      'Choosing a communication boundary shapes coupling, latency, failure propagation, deployment independence, and how much state a caller can observe.',
      'Define ownership and a versioned contract first, then choose request/response (HTTP or gRPC) for an immediate answer or a broker for deferred work. Propagate correlation and trace context; never expose another service’s database as an integration contract.',
    ], 'Checkout asks Pricing for a current quote, then publishes OrderPlaced so fulfillment can proceed without Checkout knowing its implementation.',
    `public sealed record PriceQuote(Guid ProductId, decimal Amount);
var quote = await pricing.GetQuoteAsync(productId, deadlineToken);
await bus.PublishAsync(new OrderPlaced(orderId, quote.Amount), deadlineToken);`,
    ['Explicit contracts allow independent implementation and deployment.', 'Different interaction styles can match synchronous decisions and deferred work.'],
    ['Every network hop adds latency and a partial-failure boundary.', 'Poorly owned contracts couple services just as tightly as shared code or schemas.'],
    ['Use a narrow service API or event contract owned by the producing domain.', 'Avoid chatty calls, shared database access, and contracts that expose internal persistence models.'],
    ['What belongs in a service contract?', 'How does a command differ from an event?', 'Why is a network call not equivalent to a local method call?'],
    'A team splits an application and discovers the new services still share tables. Establish data ownership and migrate callers to explicit contracts before claiming independent deployment.',
    visual([
      { label: 'Caller intent', detail: 'Choose command, query, or published fact and define its owner.' },
      { label: 'Contract', detail: 'Versioned schema and semantics; no private table or implementation leakage.' },
      { label: 'Transport', detail: 'HTTP/gRPC for direct response, or broker for deferred delivery.' },
      { label: 'Observability', detail: 'Carry trace and correlation IDs across process boundaries.' },
    ], 'The contract expresses domain intent; the transport determines timing and failure behavior, not business ownership.',
    ['Name the business intent and owning service.', 'Specify the response, error, and versioning semantics.', 'Choose direct transport or broker based on timing and coupling.', 'Instrument the full cross-service path.'],
    ['Service calls are fallible network operations.', 'Contracts are more than endpoint URLs.', 'Do not share another service’s database as an API.'],
    ['Assign one authoritative owner to each piece of data.', 'Set compatibility rules and trace context at the contract boundary.'],
    'A service boundary is a contract plus ownership and operational behavior, not merely a process or URL.'),
    [ { label: 'Microsoft microservices architecture', url: learn } ]),

    lesson('sync-vs-async', 'Synchronous vs Asynchronous Communication', [
      'Synchronous request/response keeps the caller waiting for a result; asynchronous messaging lets sender and receiver progress at different times.',
      'The choice changes user-visible latency, coupling, backpressure, outage propagation, and whether the caller can know completion immediately.',
      'Use sync when a decision is needed now and the dependency can meet the caller’s deadline. Use async when work can be deferred, buffered, or processed independently; model pending status and eventual results explicitly.',
    ], 'A checkout synchronously checks an authorization decision, but asynchronously requests a shipping label after the order is accepted.',
    `var decision = await risk.CheckAsync(order, deadlineToken);
if (!decision.Allowed) return Results.Conflict();
await bus.PublishAsync(new OrderAccepted(order.Id), deadlineToken);`,
    ['Sync is straightforward when the response is required immediately.', 'Async can absorb bursts and decouple producer availability from consumer availability.'],
    ['Sync dependency chains add latency and amplify outages.', 'Async adds queues, delayed results, duplicate delivery, ordering concerns, and harder tracing.'],
    ['Use synchronous communication for bounded immediate decisions and async for deferrable work.', 'Avoid async solely to hide slow work when the caller still needs the result before responding.'],
    ['What does a broker decouple that HTTP does not?', 'When is a synchronous call still the right choice?', 'What user experience changes when work becomes asynchronous?'],
    'A user’s order endpoint times out while a background email eventually sends. Separate order acceptance from email completion and expose status only where business semantics require it.',
    visual([
      { label: 'Immediate need', detail: 'If caller must decide now, request/response returns a result or bounded error.' },
      { label: 'Deferred intent', detail: 'A message records work that may be handled after the producer returns.' },
      { label: 'Consumer outcome', detail: 'Async consumers acknowledge, retry, or dead-letter and report eventual status.' },
    ], 'Asynchronous does not mean “no waiting anywhere”: it moves the wait and makes completion state explicit.',
    ['Ask whether the caller needs the answer to complete its operation.', 'For sync, propagate a bounded deadline.', 'For async, persist intent and define how consumers report failure.', 'Communicate pending and eventual status to clients when needed.'],
    ['Calling an async method is not itself asynchronous decoupling.', 'Do not promise immediate completion for queued work.', 'A queue buffers work but cannot create unlimited capacity.'],
    ['Use async for durable, independently processable work.', 'Set queue limits, consumer capacity, and client-visible completion semantics.'],
    'Sync couples availability in time; async loosens timing but requires explicit delivery and completion semantics.'),
    [ { label: 'Microsoft microservices communication', url: learn } ]),

    lesson('downstream-outage', 'Responding to a Downstream Outage', [
      'A downstream outage is any dependency becoming unavailable, slow, overloaded, or semantically unhealthy from this caller’s perspective.',
      'In a distributed system, partial failure is normal: the process may be healthy while one dependency fails, and waiting calls can exhaust threads, sockets, or request capacity.',
      'Bound each call with a deadline, limit concurrent work, fail fast when possible, and choose a business-valid fallback, queued continuation, or explicit error. Avoid retrying every request during an outage.',
    ], 'If Recommendations is down, the product page still returns core product details and omits the optional recommendation panel.',
    `using var cts = CancellationTokenSource.CreateLinkedTokenSource(requestAborted);
cts.CancelAfter(TimeSpan.FromMilliseconds(250));
try { return await recommendations.GetAsync(id, cts.Token); }
catch (OperationCanceledException) when (!requestAborted.IsCancellationRequested)
{ return RecommendationResult.Unavailable(); }`,
    ['Explicit degradation preserves critical paths when an optional dependency fails.', 'Load shedding protects healthy dependencies and local capacity.'],
    ['Fallbacks can mislead users if stale or semantically invalid.', 'A failed dependency can still cause cascading overload through queued or blocked calls.'],
    ['Classify dependencies as critical or optional and define outage behavior per operation.', 'Avoid swallowing failures or presenting defaults that look authoritative.'],
    ['How can a slow dependency take down a healthy caller?', 'What is graceful degradation?', 'Which failures should become user-visible errors?'],
    'Catalog is healthy but its image service is stalled. Deadline-bound image calls and a placeholder protect product requests; dashboards distinguish degraded images from catalog errors.',
    visual([
      { label: 'Detect health', detail: 'Observe latency, error rate, saturation, and dependency-specific health.' },
      { label: 'Contain work', detail: 'Deadline, concurrency cap, and load shedding bound resource consumption.' },
      { label: 'Choose outcome', detail: 'Return explicit failure, valid fallback, or durable deferred work.' },
      { label: 'Recover safely', detail: 'Watch recovery and prevent a burst of queued requests from stampeding the dependency.' },
    ], 'A fallback is a business decision, not a generic exception handler; only use data that is safe to present as a substitute.',
    ['Determine whether the dependency is essential to this use case.', 'Set a caller budget and concurrency limit.', 'Map failure to valid fallback, pending status, or explicit error.', 'Alert on degradation and test recovery under load.'],
    ['Returning empty data may falsely imply “no results.”', 'Retrying an outage can intensify overload.', 'A health endpoint alone does not prove an operation is usable.'],
    ['Keep critical and optional dependencies distinct.', 'Expose degraded behavior in telemetry and, where appropriate, the response.'],
    'Outage handling limits resource damage and preserves truthful business behavior; it does not make the dependency available.')),

    lesson('failure-handling', 'Failure Handling Across Services', [
      'Failure handling is the end-to-end policy for classifying errors, containing impact, recovering work, and communicating outcomes across service boundaries.',
      'Transport failures, timeouts, validation errors, conflicts, and permanent business rejection have different recovery semantics; treating all as exceptions to retry creates duplicates and load.',
      'Classify failures as transient or permanent, use deadlines and bounded retries only where safe, preserve durable work where needed, and expose terminal failures through stable contracts and telemetry.',
    ], 'An inventory conflict is returned to the user; a temporary network error on a read may be retried once; a failed event is parked for diagnosis.',
    `if (response.StatusCode == HttpStatusCode.Conflict)
    return OrderResult.Rejected("Inventory changed");
if ((int)response.StatusCode >= 500)
    throw new TransientDependencyException();
return await response.Content.ReadFromJsonAsync<StockResult>(ct);`,
    ['Correct classification avoids useless work and makes recovery understandable.', 'Durable failure paths support investigation and safe replay.'],
    ['More failure states require deliberate contracts and operational ownership.', 'Dead-letter queues can become silent data graveyards without monitoring and replay controls.'],
    ['Model expected business rejection separately from transient infrastructure failure.', 'Avoid catching all exceptions and retrying or returning success-shaped defaults.'],
    ['Which failures are safe to retry?', 'How should a permanent rejection differ from a transient failure?', 'What operational process is needed for dead-lettered messages?'],
    'A malformed event repeatedly fails a consumer. Stop automatic redelivery, dead-letter with context, alert an owner, fix or transform the event, then replay under controlled deduplication.',
    visual([
      { label: 'Classify', detail: 'Separate validation/business outcomes, transient faults, and permanent faults.' },
      { label: 'Contain', detail: 'Deadlines, bounded concurrency, and breaker state limit blast radius.' },
      { label: 'Recover', detail: 'Retry safe transient work; persist or dead-letter work that needs intervention.' },
      { label: 'Communicate', detail: 'Return a stable outcome and emit correlated metrics, traces, and logs.' },
    ], 'Retry, timeout, and circuit breaker solve different problems and should be composed deliberately, not treated as synonyms.',
    ['Define error taxonomy at each contract.', 'Set one overall time budget across nested work.', 'Give every failed durable item an owner and replay path.', 'Record correlation IDs without logging secrets.'],
    ['Retrying validation errors cannot fix them.', 'Catching exceptions without preserving cause hides incidents.', 'Dead-lettering is not resolution.'],
    ['Make recovery bounded and observable.', 'Make manual replay idempotent and access-controlled.'],
    'Reliable failure handling combines classification, containment, truthful outcomes, and a recovery process.')),

    lesson('circuit-breaker', 'Circuit Breaker', [
      'A circuit breaker temporarily rejects calls to a dependency after a configured failure signal, then permits a limited recovery probe.',
      'It prevents callers from repeatedly consuming resources on a dependency likely to fail; it does not make an operation succeed or guarantee recovery.',
      'Track selected failures over a window: closed allows traffic, open fails fast, and half-open admits probes. Use meaningful thresholds and a fallback only if the operation has valid alternative behavior.',
    ], 'A recommendation client opens after sustained timeouts, fails fast for a short interval, then allows a probe to test recovery.',
    `// Pseudocode: closed -> open after threshold
// open -> fail fast until break duration expires
// half-open -> allow limited probe; close on recovery`,
    ['Avoids wasting caller capacity on a failing dependency.', 'Allows a dependency to recover without a constant flood of requests.'],
    ['Thresholds can cause false opens or synchronized recovery bursts.', 'A breaker does not replace timeouts, retries, or business fallback.'],
    ['Use for remote dependencies with observable failure signals and a defined fast-fail behavior.', 'Avoid a breaker around local deterministic validation or as a substitute for fixing chronic capacity limits.'],
    ['What distinguishes open from half-open?', 'Why should a breaker be paired with a timeout?', 'What can a breaker not guarantee?'],
    'The shipping provider becomes slow. A breaker prevents every API worker from waiting on it; shipment creation remains pending and a background workflow resumes after recovery.',
    visual([
      { label: 'Closed', detail: 'Calls flow; configured failures are measured over a bounded window.' },
      { label: 'Open', detail: 'Calls fail fast for a cool-down period instead of reaching the dependency.' },
      { label: 'Half-open', detail: 'A limited probe tests recovery; success closes and failure reopens.' },
    ], 'The breaker is a stateful traffic gate; timeout bounds an in-flight call, while retry decides whether to make another attempt.',
    ['Count only relevant failures, not caller cancellation or business rejection.', 'Tune thresholds from dependency behavior and service objectives.', 'Provide bounded probe traffic and monitor state changes.'],
    ['Treating the breaker as a retry policy.', 'Opening on every HTTP error, including valid 4xx responses.', 'Assuming open means the dependency is permanently down.'],
    ['Compose breaker with a deadline and concurrency controls.', 'Make open-state behavior explicit and observable.'],
    'A circuit breaker limits repeated calls during failure; it is not a recovery mechanism by itself.')),

    lesson('retry-policy', 'Retry Policy', [
      'A retry is another attempt after a classified transient failure; backoff spaces attempts, and jitter randomizes timing among callers.',
      'Retries can improve success for short-lived faults, but multiply traffic, extend latency, and can repeat side effects when outcome is uncertain.',
      'Retry only transient errors, cap attempts and total elapsed time, use exponential backoff with jitter, honor server guidance, and require idempotency or a deduplication key for mutations.',
    ], 'A safe inventory read retries one connection reset with jitter; a payment submission reuses the same idempotency key rather than issuing a new charge.',
    `var options = new HttpRequestMessage(HttpMethod.Post, "/payments");
options.Headers.Add("Idempotency-Key", command.OperationId.ToString());
// Retry policy must bound attempts and total deadline.`,
    ['Can mask brief transient network or service faults.', 'Backoff can reduce synchronized load when many callers fail together.'],
    ['Amplifies overload and consumes the request time budget.', 'An unknown first-attempt outcome can produce duplicate side effects.'],
    ['Use bounded retries for transient errors on idempotent or deduplicated operations.', 'Avoid retries for validation failures, unbounded loops, or calls already near their deadline.'],
    ['Why add jitter to exponential backoff?', 'When can a timeout lead to a duplicate side effect?', 'What is the difference between attempt limit and total deadline?'],
    'A payment request times out after the provider may have accepted it. Reconcile or retry with the provider’s idempotency key; never generate a fresh operation identity.',
    visual([
      { label: 'Classify fault', detail: 'Retry only likely transient conditions, not business rejection.' },
      { label: 'Wait safely', detail: 'Use capped exponential backoff plus jitter within a total deadline.' },
      { label: 'Repeat safely', detail: 'Use idempotent operation or stable deduplication identity.' },
      { label: 'Stop and surface', detail: 'Exhaustion returns an explicit failure for fallback or recovery.' },
    ], 'A timeout says the response was not observed, not that the server did no work; retry correctness depends on operation semantics.',
    ['Budget attempts within the caller deadline.', 'Use jitter and respect Retry-After when applicable.', 'Keep the same idempotency key across attempts.', 'Measure retry volume separately from original requests.'],
    ['Retrying every status code.', 'Starting nested retry policies at every layer and multiplying attempts.', 'Creating a new idempotency key per attempt.'],
    ['Choose one deliberate retry owner per operation path.', 'Disable or reduce retries during overload when they worsen saturation.'],
    'Retries trade extra work and latency for transient-fault tolerance; safe operation identity and strict budgets are prerequisites.')),

    lesson('timeout-deadline', 'Timeouts and Deadlines', [
      'A timeout bounds how long one operation waits; a deadline is the end-to-end time budget by which the whole request must complete.',
      'Without bounds, blocked calls retain sockets and capacity, and nested services can continue work after the caller has abandoned it.',
      'Propagate the remaining deadline and cancellation token to downstream operations, reserving time for local processing and response; distinguish caller cancellation from dependency timeout.',
    ], 'A 900 ms API budget allocates 250 ms to pricing, 400 ms to inventory, and leaves time for validation and response rather than granting each hop 900 ms.',
    `using var cts = CancellationTokenSource.CreateLinkedTokenSource(requestAborted);
cts.CancelAfter(remainingBudget);
var result = await client.GetAsync(uri, cts.Token);`,
    ['Bounds latency and resource occupancy.', 'A propagated budget discourages work that cannot affect the response in time.'],
    ['Too-short budgets create avoidable failures; too-long budgets tie up capacity.', 'Cancellation may not stop remote work already accepted by a downstream service.'],
    ['Set budgets from user-facing SLOs and dependency latency distributions.', 'Avoid treating every OperationCanceledException as a dependency timeout.'],
    ['How does a deadline differ from a per-hop timeout?', 'Why propagate cancellation?', 'What does a client timeout tell you about server-side execution?'],
    'A mobile client disconnects while a report service is querying downstream systems. Propagate cancellation to safe reads and ensure accepted durable jobs are not accidentally discarded.',
    visual([
      { label: 'Request budget', detail: 'Choose an overall limit from the operation’s user-facing latency objective.' },
      { label: 'Allocate hops', detail: 'Each dependency gets only the remaining time, reserving response overhead.' },
      { label: 'Cancel work', detail: 'Pass cancellation to operations that can safely stop.' },
      { label: 'Classify outcome', detail: 'Distinguish deadline expiry, caller abort, and service shutdown.' },
    ], 'Timeout is a local bound; deadline is a shared end-to-end budget. Neither proves whether a remote side effect committed.',
    ['Propagate cancellation and remaining time, not the original full budget.', 'Leave budget for validation, persistence, and response.', 'Record timeout location and elapsed duration.'],
    ['Giving every nested call the full request timeout.', 'Retrying after deadline expiry.', 'Assuming cancellation rolled back remote work.'],
    ['Use deadlines with bounded retries and idempotent mutations.', 'Reconcile uncertain outcomes for commands with side effects.'],
    'Deadlines bound the entire operation; per-hop timeouts and cancellation implement that budget at specific boundaries.')),

    lesson('api-gateway', 'API Gateway', [
      'An API gateway is a controlled client-facing entry point that routes requests and may handle cross-cutting edge concerns such as authentication, rate limiting, and protocol translation.',
      'It hides internal topology from clients and can compose or tailor APIs, while centralizing edge traffic policy.',
      'Keep business invariants and authoritative authorization in services; keep gateway policies narrow, versioned, observable, and highly available. A backend-for-frontend is a gateway tailored to a client experience.',
    ], 'A mobile BFF turns several internal reads into one mobile response, while Order service still validates ownership and order state.',
    `// YARP-style configuration concept:
// route: /api/orders/{**rest}
// destination: orders-cluster
// Keep order authorization in the Order service.`,
    ['Reduces client knowledge of service topology.', 'Provides a practical place for edge policies and client-specific composition.'],
    ['Can become a bottleneck, shared failure domain, or deployment coupling point.', 'Retries or transformations at the edge can obscure behavior and duplicate side effects.'],
    ['Use a gateway for external routing and client-specific needs with clear ownership.', 'Avoid placing domain workflows or the only authorization checks in proxy configuration.'],
    ['What responsibilities belong at the gateway?', 'How does a BFF differ from a generic gateway?', 'Why must services still enforce authorization?'],
    'The gateway retries a timed-out order POST and creates duplicate orders. Remove unsafe automatic retries or require an idempotency key enforced by the owning service.',
    visual([
      { label: 'Client edge', detail: 'Authenticate the client and apply coarse rate or request-size limits.' },
      { label: 'Route / compose', detail: 'Map stable public routes to internal APIs or a client-specific response.' },
      { label: 'Service authority', detail: 'Service validates business rules and resource-level authorization.' },
      { label: 'Edge telemetry', detail: 'Track route, status, latency, and downstream correlation.' },
    ], 'The gateway is a policy and routing boundary, not a replacement for domain ownership or service-level access checks.',
    ['Define allowed edge concerns and delegate domain rules to services.', 'Use idempotency for any retried mutation.', 'Version public contracts independently from internal addresses.'],
    ['Putting all business orchestration in one gateway.', 'Trusting gateway authentication alone for object-level authorization.', 'Assuming a gateway can hide every internal failure.'],
    ['Keep routing configuration reviewable and observable.', 'Design gateway availability, capacity, and rollback as production dependencies.'],
    'A gateway simplifies clients but becomes critical infrastructure and must preserve service authority.')),

    lesson('service-discovery', 'Service Discovery', [
      'Service discovery resolves a logical service name to currently available instances or endpoints.',
      'Instances change with deployment, scaling, and failure; hard-coded addresses create brittle deployments and stale routing.',
      'Use platform DNS, a registry, or a load balancer to resolve instances, then combine health-aware routing with connection refresh and bounded client behavior.',
    ], 'A client calls `inventory` by logical name; Kubernetes DNS and a Service route to healthy replicas without embedding pod addresses.',
    `var client = httpClientFactory.CreateClient("inventory");
var response = await client.GetAsync("/v1/items/42", deadlineToken);`,
    ['Decouples callers from ephemeral instance addresses.', 'Enables scale-out and instance replacement without client redeployment.'],
    ['Stale DNS, health checks, and client connection pools can delay convergence.', 'A registry adds operational state and can itself become a dependency.'],
    ['Use the discovery mechanism already supported by the deployment platform where possible.', 'Avoid hand-maintained endpoint lists or assuming discovery proves business health.'],
    ['What is the difference between service naming and discovery?', 'Why can DNS changes take time to affect a client?', 'What should health-aware routing check?'],
    'After rolling deployment, clients retain connections to removed instances. Tune connection lifetime and drain behavior, and observe discovery and readiness convergence.',
    visual([
      { label: 'Logical name', detail: 'Caller targets a stable service identity, not an instance IP.' },
      { label: 'Resolve', detail: 'DNS, registry, or platform control plane returns eligible endpoints.' },
      { label: 'Select endpoint', detail: 'Load balancing and readiness determine where this call goes.' },
      { label: 'Refresh', detail: 'Connection and DNS caches converge as instances change.' },
    ], 'Discovery locates candidates; readiness and application-level checks determine whether a candidate can serve useful work.',
    ['Use stable service identity and platform-native discovery.', 'Test endpoint turnover and connection draining.', 'Monitor resolution failures and unhealthy-instance routing.'],
    ['Confusing liveness with readiness.', 'Assuming updated DNS instantly replaces pooled connections.', 'Treating service discovery as authorization.'],
    ['Coordinate discovery with rollout and graceful shutdown.', 'Avoid custom registries unless platform needs justify their complexity.'],
    'Service discovery replaces fixed addresses with a dynamic resolution mechanism whose caching and health semantics must be understood.')),

    lesson('rabbitmq-azure-service-bus', 'RabbitMQ and Azure Service Bus Concepts', [
      'A message broker accepts messages and routes or stores them for consumers; RabbitMQ commonly uses exchanges, bindings, and queues, while Azure Service Bus provides queues and topics/subscriptions as managed messaging primitives.',
      'Brokers decouple producer and consumer timing, buffer load, and support competing consumers or fan-out, but introduce delivery, ordering, capacity, and operations concerns.',
      'Choose queue for competing work and topic/subscriptions for independent subscribers; define acknowledgements, retention, dead-letter handling, ordering scope, and duplicate detection for the actual broker and tier.',
    ], 'OrderPlaced is published to a topic; fulfillment and analytics subscriptions each receive their own copy, while one fulfillment queue distributes work across workers.',
    `public sealed record OrderPlaced(Guid OrderId, long Sequence);
// Broker-specific publisher persists/sends the message.
// Consumer acknowledges only after its durable effect is complete.`,
    ['Buffers bursts and permits consumers to scale independently.', 'Topics enable multiple subscribers without producer knowledge of each consumer.'],
    ['Brokers can fill, redeliver, reorder, or reject work under quota and outage conditions.', 'Broker semantics differ; “exactly once” claims do not remove application-level duplicate effects.'],
    ['Use broker primitives to match competing work versus independent subscriptions.', 'Avoid assuming broker configuration alone guarantees end-to-end processing exactly once.'],
    ['How does a queue differ from a topic subscription?', 'Why acknowledge after durable processing?', 'What is a dead-letter queue for?'],
    'A consumer crashes after charging a card but before acknowledging. The broker redelivers; a stable message ID and idempotent payment operation prevent a second charge.',
    visual([
      { label: 'Producer', detail: 'Sends a versioned message with stable identity and required metadata.' },
      { label: 'Routing', detail: 'Exchange/binding or queue/topic subscription routes to intended work.' },
      { label: 'Consumer', detail: 'Processes with bounded concurrency and acknowledges after durable outcome.' },
      { label: 'Recovery', detail: 'Retry, dead-letter, inspect, and safely replay failed messages.' },
    ], 'Broker-level acceptance, delivery to a consumer, and completion of the business effect are separate milestones.',
    ['Specify message identity, schema, retention, and ordering needs.', 'Acknowledge only after the outcome is durable.', 'Monitor age, depth, redelivery, and dead-letter volume.'],
    ['Acknowledging before committing the business effect.', 'Assuming queues preserve global order at scale.', 'Treating dead-letter queues as automatically repaired.'],
    ['Design consumers for duplicate delivery.', 'Document broker-specific limits, lock/visibility timeout, and replay operations.'],
    'A broker transports and stores work; application correctness still depends on consumer behavior and explicit delivery semantics.'),
    [ { label: 'Azure Service Bus documentation', url: 'https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview' },
      { label: 'RabbitMQ tutorials', url: 'https://www.rabbitmq.com/tutorials' } ]),

    lesson('event-driven-architecture', 'Event-Driven Architecture', [
      'Event-driven architecture uses events—immutable statements that something already happened—to notify interested consumers without requiring the producer to invoke each one.',
      'It supports independent subscribers and asynchronous workflows, but consumers observe changes later and producer-to-consumer contracts still couple meaning and schema.',
      'Publish domain facts after the authoritative state change, version schemas compatibly, and design consumers for duplicates, reordering, lag, and eventual consistency. Use commands for requests to perform work, not as disguised facts.',
    ], 'The Order service emits OrderConfirmed; invoice, fulfillment, and analytics consumers independently react at their own pace.',
    `public sealed record OrderConfirmed(Guid EventId, Guid OrderId, DateTimeOffset OccurredAt);
// Publish after the order state and outbox row commit together.`,
    ['One event can serve several independent consumers.', 'Producer does not need to know consumer deployment or availability.'],
    ['Consumers see stale or reordered views and can fail independently.', 'Event schema and semantics become long-lived public contracts.'],
    ['Use events for facts and independent reactions that may be eventual.', 'Avoid eventing synchronous decisions that must be atomically answered to the caller.'],
    ['How does an event differ from a command?', 'Why can an event consumer see stale state?', 'What does eventual consistency mean to a client?'],
    'Analytics falls behind while checkout remains available. Track consumer lag and communicate the freshness of analytics rather than treating event acceptance as projection completion.',
    visual([
      { label: 'Domain change', detail: 'Owning service commits the authoritative state transition.' },
      { label: 'Fact event', detail: 'A versioned immutable event names what happened, with stable identity.' },
      { label: 'Independent consumers', detail: 'Subscribers update their own state and may progress at different rates.' },
      { label: 'Convergence', detail: 'Lag and replay eventually bring projections up to date.' },
    ], 'Event publication is not proof every subscriber has processed the event; producer commit, broker acceptance, and consumer effect are distinct.',
    ['Publish domain facts, not private table-change dumps.', 'Track consumer lag and schema compatibility.', 'Make projections replayable and consumer effects idempotent.'],
    ['Using an event as a command while claiming it is a fact.', 'Assuming message order across partitions or subscriptions.', 'Returning success to a client that requires downstream completion.'],
    ['Define event ownership and compatibility policy.', 'Expose freshness or pending status when consumers affect user expectations.'],
    'Events decouple reactions in time, not meaning; eventual consistency and consumer recovery are part of the contract.')),

    lesson('saga-pattern', 'Saga Pattern', [
      'A saga is a long-running business workflow made of local transactions, with forward actions and compensating actions to address later failure.',
      'Independent service databases cannot generally share one ACID transaction; saga coordination accepts intermediate states and eventual completion or business cancellation.',
      'Persist workflow state and step identity, make each participant idempotent, distinguish retryable failure from business rejection, and orchestrate centrally or react through choreography. Compensation is a new business action, not a time-travel rollback.',
    ], 'Reserve inventory, authorize payment, then confirm. If payment is declined, release the reservation; if a refund is required, record it as a new financial transaction.',
    `// Orchestrated saga outline:
await inventory.ReserveAsync(orderId, stepKey, ct);
try { await payments.AuthorizeAsync(orderId, stepKey, ct); }
catch (PaymentDeclinedException) { await inventory.ReleaseAsync(orderId, stepKey, ct); }`,
    ['Coordinates a business flow across independent ownership and databases.', 'Makes intermediate state and recovery behavior explicit.'],
    ['Compensations may fail or be impossible to reverse perfectly.', 'Workflow state, retries, timeout handling, and operator tooling add substantial complexity.'],
    ['Use for multi-step, long-running workflows that span service-owned transactions.', 'Avoid a saga for a short operation that fits in one service-owned database transaction.'],
    ['How does orchestration differ from choreography?', 'Why is compensation not rollback?', 'How should an uncertain participant outcome be reconciled?'],
    'Payment times out after inventory reservation. Query or deduplicate by operation ID before repeating authorization, persist saga progress, and release inventory only after a confirmed rejection or explicit expiry policy.',
    visual([
      { label: 'Start and persist', detail: 'Record saga identity, business key, and current state before advancing.' },
      { label: 'Local step', detail: 'A participant commits its own transaction and supports an idempotency key.' },
      { label: 'Next or compensate', detail: 'Continue on success; retry, reconcile, or invoke a business compensation.' },
      { label: 'Terminal state', detail: 'Complete, cancelled, or escalated state is observable and auditable.' },
    ], 'Compensation changes business state to a valid alternative; it cannot erase history or guarantee the original side effect was undone.',
    ['Persist progress and each step’s operation identity.', 'Model timeout as an uncertain result until reconciled.', 'Make compensation idempotent and auditable.', 'Provide stuck-saga alerts and controlled operator recovery.'],
    ['Assuming a timeout means the step did not commit.', 'Calling compensation an atomic rollback.', 'Starting a new saga for each retry.'],
    ['Use explicit state transitions and terminal outcomes.', 'Do not introduce a saga where one local transaction is sufficient.'],
    'A saga trades global atomic rollback for durable coordination, idempotent local steps, and compensating business actions.')),

    lesson('distributed-transaction', 'Distributed Transactions', [
      'A distributed transaction attempts to commit changes across multiple resource managers as one atomic outcome, commonly through a coordinator and a protocol such as two-phase commit.',
      'It promises stronger atomicity than independent local commits but introduces coordination, availability, lock duration, failure recovery, and support constraints.',
      'Prefer one service-owned local transaction plus outbox or a saga when services own independent stores. Use a distributed transaction only when all participants support the protocol and the consistency requirement justifies operational coupling.',
    ], 'Two databases under one tightly controlled application may use a supported transaction coordinator; independent microservices instead commit locally and coordinate with an outbox/saga.',
    `await using var tx = await db.Database.BeginTransactionAsync(ct);
db.Orders.Add(order);
db.Outbox.Add(OutboxMessage.For("OrderCreated", order.Id));
await db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);`,
    ['Can provide atomic commit across compatible participants.', 'Simplifies invariants when a genuinely shared transaction boundary is feasible.'],
    ['Coordinator and participant support constrain deployment and technology.', 'Coordination can block or reduce availability during failures and lengthen resource locks.'],
    ['Use only when all participants and infrastructure support the required protocol and failure model.', 'Avoid assuming HTTP calls or a broker publication automatically join a database transaction.'],
    ['What does two-phase commit coordinate?', 'Why can distributed commit block during failure?', 'When is an outbox preferable?'],
    'An order service wants atomic database update plus broker publish. Since the broker is not in the database transaction, store an outbox row atomically and dispatch it rather than claiming a cross-resource commit.',
    visual([
      { label: 'Prepare', detail: 'Coordinator asks each supported participant to promise it can commit.' },
      { label: 'Decision', detail: 'Coordinator durably decides commit or abort for the transaction.' },
      { label: 'Participants', detail: 'Resources apply the same decision and release held state.' },
      { label: 'Recovery', detail: 'Coordinator logs and resolves in-doubt work after interruption.' },
    ], 'Two-phase commit is a protocol between compatible resource managers, not an ordinary sequence of service API calls.',
    ['Verify participant and platform support before design approval.', 'Understand coordinator recovery and in-doubt operations.', 'Prefer local atomicity with outbox when spanning database and broker.'],
    ['Calling a saga a distributed ACID transaction.', 'Assuming a database transaction covers network calls.', 'Ignoring lock and coordinator failure behavior.'],
    ['Choose the narrowest transaction boundary that protects the invariant.', 'Document operational recovery for prepared or in-doubt transactions.'],
    'Distributed transactions can provide atomicity at the cost of coordination and availability; independent services more often need eventual workflows.')),

    lesson('cross-service-consistency', 'Cross-Service Consistency', [
      'Cross-service consistency describes how independently committed data copies and service-owned states converge and what stale or intermediate state consumers may observe.',
      'Each service should own its authoritative data; synchronous reads can provide fresher answers but increase coupling, while event-driven projections trade freshness for availability and autonomy.',
      'Define the invariant, acceptable staleness, and source of truth; propagate changes reliably, expose version/last-updated state if needed, and provide reconciliation for missed or inconsistent work.',
    ], 'The order is authoritative for order status; a reporting projection may lag by seconds, while payment authorization remains owned by Payments.',
    `public sealed record OrderView(Guid Id, string Status, long Version, DateTimeOffset UpdatedAt);
// Client can display "updating" while the projection version catches up.`,
    ['Allows service autonomy and query-optimized local views.', 'Can keep noncritical reads available while consumers catch up.'],
    ['Stale views can confuse users or violate hidden assumptions.', 'Reconciliation, replay, and freshness monitoring add operational work.'],
    ['Use eventual consistency where the business accepts bounded delay and clear intermediate states.', 'Avoid duplicating authoritative writes across services or promising a global read-your-writes guarantee without implementing it.'],
    ['What is an authoritative source of truth?', 'How do you communicate eventual consistency to clients?', 'What does reconciliation detect that message delivery metrics may not?'],
    'A user confirms an order but the account page still shows the old status. Return the committed order version and let the view report freshness; investigate projection lag without accepting a second order.',
    visual([
      { label: 'Authority', detail: 'One service owns the invariant and commits the canonical state.' },
      { label: 'Propagation', detail: 'Outbox/event or explicit request communicates a versioned change.' },
      { label: 'Local view', detail: 'Consumers build projections that can temporarily lag or replay.' },
      { label: 'Reconcile', detail: 'Compare versions/state and repair gaps with observable procedures.' },
    ], 'Eventual consistency means replicas may temporarily disagree but converge if updates are delivered and processing succeeds; it is not a guarantee of a fixed delay.',
    ['Name authoritative data and tolerated staleness per field.', 'Expose pending or freshness semantics when they matter.', 'Use reconciliation and projection rebuilds as designed recovery paths.'],
    ['Assuming eventual consistency always converges without delivery and repair.', 'Reading a projection immediately and treating stale data as canonical.', 'Updating the same invariant in multiple services.'],
    ['Make write ownership explicit.', 'Measure lag and test replay/rebuild behavior.'],
    'Cross-service consistency is an explicit business contract about ownership, stale observations, convergence, and repair.')),

    lesson('monolith-vs-microservices', 'Monolith vs Microservices', [
      'A monolith packages an application as one deployable unit, while microservices split capabilities into separately owned and deployed services with explicit boundaries.',
      'The decision trades local simplicity and transaction ease against independent scaling and team autonomy; microservices also make network failure, operations, data ownership, and release coordination first-class work.',
      'Start from domain boundaries, team structure, deployment needs, and bottlenecks. A modular monolith can preserve strong internal boundaries and defer distributed-system cost until independent deployment provides measurable value.',
    ], 'A small team keeps checkout and catalog as modules in one application until ownership, release cadence, or scaling needs justify independent services.',
    `// Modular monolith boundary:
public interface IInventoryAvailability
{
    Task<bool> IsAvailableAsync(Guid sku, CancellationToken ct);
}`,
    ['Monoliths simplify local calls, transactions, debugging, and deployment.', 'Microservices can isolate scaling, failure, and releases across autonomous teams.'],
    ['Monolith modules can become entangled and share release risk.', 'Microservices add network latency, partial failure, observability, and platform operating cost.'],
    ['Choose service separation for proven autonomy, scaling, or fault-isolation needs.', 'Avoid splitting by technical layer or adopting microservices as a default maturity step.'],
    ['When is a modular monolith a better choice?', 'Which costs appear when a local call becomes remote?', 'What organizational condition supports independent services?'],
    'A team splits a monolith but cannot deploy services independently because every release requires a coordinated schema migration. Establish ownership and compatibility before further decomposition.',
    visual([
      { label: 'Boundary', detail: 'Group capabilities by cohesive domain ownership, not arbitrary code size.' },
      { label: 'Deployment', detail: 'Compare one release unit with independently operated services.' },
      { label: 'Data', detail: 'Local transaction simplicity versus service-owned data and propagation.' },
      { label: 'Operating model', detail: 'Account for on-call, telemetry, automation, and platform support.' },
    ], 'Microservices optimize some kinds of autonomy while moving complexity into communication and operations; they are not a universal upgrade.',
    ['Measure the concrete pain before splitting.', 'Enforce module boundaries inside a monolith.', 'Include on-call and platform costs in the architecture decision.'],
    ['Splitting by CRUD table or technical layer.', 'Assuming more services automatically means better scaling.', 'Ignoring coordinated deployment and shared database coupling.'],
    ['Prefer reversible incremental boundaries.', 'Adopt the simplest architecture that meets current constraints.'],
    'Architecture choice is a cost and capability decision; modularity can exist without network boundaries.')),

    lesson('duplicate-message-handling', 'Duplicate Message Handling and Idempotency', [
      'A duplicate message is the same logical delivery processed more than once; an idempotent operation produces the same effective state when repeated with the same identity.',
      'At-least-once delivery is commonly used because acknowledgement can be lost after a consumer commits. The broker may redeliver even though the business effect succeeded.',
      'Assign a stable message/operation ID, atomically record deduplication with the business effect where possible, and define retention and conflict behavior. Exactly-once transport does not by itself guarantee exactly-once external side effects.',
    ], 'A payment consumer stores the event ID and payment result in the same database transaction; redelivery returns the saved result instead of charging again.',
    `await using var tx = await db.Database.BeginTransactionAsync(ct);
if (await db.ProcessedMessages.AnyAsync(x => x.Id == message.Id, ct)) return;
await payments.ApplyAsync(message.Payment, ct);
db.ProcessedMessages.Add(new ProcessedMessage(message.Id));
await db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);`,
    ['Deduplication protects business effects against redelivery and uncertain acknowledgements.', 'Stable operation identities support replay and reconciliation.'],
    ['Deduplication storage needs retention, transaction design, and capacity.', 'External side effects may not share the consumer’s transaction and need provider idempotency or reconciliation.'],
    ['Assume broker messages can repeat and make effects idempotent or deduplicated.', 'Avoid claiming exactly-once business processing from a broker feature alone.'],
    ['Why can a message be redelivered after a successful effect?', 'Where should a deduplication record be committed?', 'How do you handle a provider side effect outside the local transaction?'],
    'The consumer commits an invoice, then crashes before ACK. Redelivery finds the event ID transactionally and skips the duplicate; downstream email uses its own idempotency key.',
    visual([
      { label: 'Stable identity', detail: 'Each logical message and side-effecting operation keeps one durable key.' },
      { label: 'Check / apply', detail: 'Deduplication decision and local business mutation share an atomic boundary.' },
      { label: 'Acknowledge', detail: 'Acknowledge after durable success; crash before ACK safely causes redelivery.' },
      { label: 'External effects', detail: 'Use provider idempotency or reconciliation when effect is outside the local transaction.' },
    ], 'At-least-once delivery means one or more attempts, not guaranteed eventual success; dead-lettering and operational recovery still matter.',
    ['Keep the same idempotency identity across retries and replay.', 'Commit processed identity with the local effect.', 'Set retention longer than the maximum redelivery/replay horizon.'],
    ['Recording “processed” before the effect can lose work.', 'Recording it after an unprotected external effect can duplicate that effect.', 'Assuming deduplication makes arbitrary handlers safe.'],
    ['Design idempotency into consumer contracts.', 'Test crash points before effect, after effect, and before acknowledgement.'],
    'Duplicate handling is a consumer correctness property built from stable identity, atomic local effects, and explicit handling for external side effects.')),

    lesson('transactional-outbox', 'Transactional Outbox', [
      'The transactional outbox stores the intent to publish alongside the business state change in the same local database transaction.',
      'Writing a database row and sending a broker message separately creates a dual-write gap: either action can succeed while the other fails.',
      'Commit business data and an outbox record atomically; a dispatcher or change-data-capture pipeline publishes committed records. Expect repeats and make consumers idempotent; monitor backlog and poison records.',
    ], 'Order creation and OrderPlaced outbox row commit together; a dispatcher later publishes the event to the broker.',
    `await using var tx = await db.Database.BeginTransactionAsync(ct);
db.Orders.Add(order);
db.Outbox.Add(OutboxMessage.For("OrderPlaced", order.Id));
await db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);`,
    ['Closes the lost-publish-intent gap without a distributed commit.', 'Supports polling or CDC and lets the business transaction remain local.'],
    ['Adds dispatcher, storage, cleanup, and backlog operations.', 'A crash after publish but before marking completion can produce duplicate delivery.'],
    ['Use when database state and broker publication intent must stay consistent.', 'Avoid describing the pattern as exactly-once delivery or adding it where no event consistency requirement exists.'],
    ['What dual-write failure does the outbox prevent?', 'Why can the dispatcher publish twice?', 'How does CDC differ from polling?'],
    'A broker outage leaves committed events pending. Alert on oldest-record age and backlog, resume dispatch, and verify replay cannot duplicate a payment or notification.',
    visual([
      { label: 'Local transaction', detail: 'Business state and serialized outbox intent commit atomically.' },
      { label: 'Dispatcher / CDC', detail: 'A worker or log reader finds only committed event records.' },
      { label: 'Broker publish', detail: 'Publisher retries safely; publish status can be uncertain after a crash.' },
      { label: 'Idempotent consumer', detail: 'Consumer handles repeat delivery and commits its own effect safely.' },
    ], 'The outbox guarantees durable publish intent with the local update, not atomic broker delivery or exactly-once consumer effects.',
    ['Use stable event IDs and schema versions.', 'Monitor age and volume, not only dispatcher liveness.', 'Plan cleanup, poison handling, and replay procedures.'],
    ['Publishing inside the DB transaction and assuming the broker joins it.', 'Marking published before send and losing the event.', 'Ignoring duplicate delivery after an uncertain publish result.'],
    ['Keep the outbox write in the same database transaction as the business mutation.', 'Make consumers idempotent even if the publisher tracks sent state.'],
    'The outbox converts a dangerous dual write into durable intent plus at-least-once dispatch and idempotent consumption.')),
  ],
};
