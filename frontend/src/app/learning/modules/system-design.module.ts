import { LearningModule, topic } from '../learning.models';

export const systemDesignModule: LearningModule = {
  id: 'system-design',
  title: 'System Design',
  description: 'Design for scale, failure, and clear operational guarantees across distributed components.',
  topics: [
    topic('ecommerce-order-system', 'Scalable E-Commerce Order API', 'Very High',
      'Design checkout as a durable, idempotent workflow that preserves inventory and payment invariants while downstream work scales independently.',
      [
        'WHAT — An order API accepts a customer command and coordinates state changes across services. Idempotency means repeating the same logical request does not create an additional order or charge; an outbox atomically records an event beside local database changes.',
        'WHY — Bursts, timeouts, retries, and partial failures are normal in distributed systems. A durable order state and queued work let the API respond predictably without requiring every dependency to be available in one synchronous request.',
        'HOW — Authenticate and validate, claim an idempotency key, then persist the order and an outbox event in one database transaction. A publisher delivers the event at least once; idempotent consumers reserve inventory, authorize payment, and advance a versioned state machine. Retry transient failures and use explicit compensation for business failures.',
      ],
      ['Validate the caller and idempotency key; return the original result for a duplicate key.', 'Persist order state and an outbox record together, then acknowledge durable acceptance.', 'Publish with retries; consumers deduplicate and apply valid state transitions.', 'Reserve inventory, authorize payment, and confirm or compensate with an auditable outcome.'],
      'A customer retries checkout after a gateway timeout. The API returns the already-created order for the same key; if a payment provider later reports success after a timeout, the workflow queries or retries with the provider’s stable key before deciding whether to refund or continue.',
      `POST /orders (Idempotency-Key: client-generated stable key)
  -> transaction: create Pending order + Outbox event
  -> publisher: deliver event at least once
  -> workflow: reserve inventory -> authorize payment
  -> transition to Confirmed, or compensate and record failure`,
      [
        ['Queue-backed stages can scale and recover independently', 'Durable state makes retries and operator repair possible'],
        ['The workflow is eventually consistent, not one global transaction', 'Outbox, deduplication, compensation, and queue operations require ownership'],
      ],
      ['Use explicit state transitions, a transactional outbox, idempotency at each side-effect boundary, bounded queues, and reconciliation.', 'Avoid claiming “exactly once” across independent services or using distributed locks instead of database constraints and ownership.'],
      ['Why is an outbox needed if the order is already in a database?', 'How do you prevent a retried checkout from creating a second charge?', 'How would you prevent inventory oversell under concurrent orders?', 'What happens if payment succeeds but the consumer crashes before recording success?'],
      'A seasonal sale creates a traffic spike while the payment processor slows down. Keep acceptance within database and queue capacity, return only after durable persistence, slow or reject excess work deliberately, bound retries, and expose stuck-order age so operations can recover or compensate safely.',
      [
        { label: 'Microsoft: Transactional outbox pattern', url: 'https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-outbox-cosmos' },
        { label: 'AWS Prescriptive Guidance: Saga pattern', url: 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga.html' },
      ],
      {
        diagram: [
          { label: 'Request boundary', detail: 'Validate identity and key; duplicate key returns the stored outcome.' },
          { label: 'Order + outbox transaction', detail: 'One local commit prevents a saved order with a silently missing event.' },
          { label: 'At-least-once delivery', detail: 'Publisher retries; consumers must tolerate duplicate messages.' },
          { label: 'Order workflow', detail: 'Reserve stock, authorize payment, and advance only legal states.' },
          { label: 'Recovery path', detail: 'Retry transient failures; compensate, reconcile, or alert on terminal cases.' },
        ],
        diagramNote: 'The database transaction protects only local order and outbox writes. It does not make inventory, payment, and order storage one atomic transaction.',
        exampleSteps: ['Client retries POST with the same idempotency key.', 'API returns the existing Pending order rather than creating a second one.', 'Outbox publisher may deliver twice; consumer deduplication prevents repeated reservation.', 'Payment timeout triggers provider-key retry or status lookup before a refund decision.'],
        keyTakeaways: ['Persist acceptance before acknowledging it.', 'Assume message delivery and client requests can be repeated.', 'Model business recovery explicitly; technical retries alone cannot undo a completed payment.'],
        commonMistakes: ['Publishing directly after database commit can lose the event if the process crashes between the two operations.', 'Calling a message queue “exactly once” does not remove duplicate side effects in the consumer.', 'Retrying a payment with a new provider key can create a second charge.'],
        bestPractices: ['Document state transitions, invariants, idempotency scope, and retention for each key.', 'Set bounded retries, dead-letter handling, queue-age alerts, and a reconciliation process.', 'Use database uniqueness or conditional updates for inventory ownership; load-test overload and recovery behavior.'],
        summary: 'Durable local acceptance, at-least-once messaging, idempotent effects, and explicit compensation make checkout recoverable under partial failure.',
      }),
    topic('redis-distributed-cache', 'Redis Distributed Caching', 'Very High',
      'A shared Redis cache can reduce repeated source reads across service instances, provided the system deliberately manages stale values, misses, and cache failure.',
      [
        'WHAT — Distributed caching stores reusable data outside an individual process so multiple instances can read it. Cache-aside is a pattern where the application checks the cache, loads the source on a miss, then populates the cache.',
        'WHY — Reusing computed or read-heavy data can lower latency and database load. The trade is additional network and operational dependency plus a second copy that may be stale or missing.',
        'HOW — Choose a versioned key, identity/tenant scope, serialization, TTL, and invalidation owner. Read cache with a short timeout; on miss load the source, then populate with a bounded lifetime. Protect hot misses with request coalescing or jittered refresh, and cap fallback concurrency when Redis is unhealthy.',
      ],
      ['Build a stable, tenant-safe cache key and read Redis with a bounded timeout.', 'On a miss, load the authoritative source and populate the cache with an explicit TTL.', 'Invalidate or refresh after source changes; measure hit rate, latency, staleness, and fallback load.'],
      'A catalog service caches a public product listing for a short TTL. After a successful catalog update it invalidates affected keys; simultaneous misses for a popular listing are coalesced so one database read refreshes the value for waiting requests.',
      `var value = await cache.GetStringAsync(key, cancellationToken);
if (value is null)
{
    value = await LoadFromDatabaseAsync(cancellationToken);
    await cache.SetStringAsync(
        key,
        value,
        new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        },
        cancellationToken);
}`,
      [
        ['Shared values reduce duplicate work across instances', 'TTL and eviction can bound stale-data exposure and storage'],
        ['A cache hit can still be stale or incorrect if keys are poorly scoped', 'Cache outage can transfer load to the source and trigger a cascading failure'],
      ],
      ['Use for rebuildable or explicitly stale-tolerant data with a clear key, TTL, invalidation, timeout, and fallback budget.', 'Avoid caching authorization-sensitive responses without complete identity-aware keys, or using cache as the only durable copy of critical data.'],
      ['Explain the cache-aside read and write path.', 'How do cache penetration, breakdown, and stampede differ?', 'What should happen to source traffic when Redis is unavailable?', 'How would you prevent one tenant’s cached data from being served to another?'],
      'Redis latency increases during a catalog promotion. Bound cache timeouts, coalesce refreshes for hot keys, and apply a concurrency limit to database fallbacks; if the source budget is exhausted, serve an allowed stale value or fail deliberately rather than overload the database.',
      [
        { label: 'Redis documentation: Cache-aside pattern', url: 'https://redis.io/learn/howtos/solutions/microservices/caching' },
        { label: 'Microsoft: Distributed caching in ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed' },
      ],
      {
        diagram: [
          { label: 'Request + scoped key', detail: 'Key includes resource version and every tenant/identity dimension that changes the result.' },
          { label: 'Redis lookup', detail: 'Bounded-time cache hit returns reusable data; misses are expected.' },
          { label: 'Authoritative source', detail: 'Miss loads database or service under a fallback concurrency budget.' },
          { label: 'TTL + invalidation', detail: 'Expiration limits age; write-side invalidation reduces stale windows.' },
          { label: 'Failure controls', detail: 'Coalescing, stale fallback, and source limits prevent a miss storm.' },
        ],
        diagramNote: 'Cache-aside makes the application responsible for cache population and freshness; Redis availability does not replace source-of-truth durability.',
        exampleSteps: ['Read a tenant-scoped listing key from Redis.', 'On miss, join an in-flight refresh or acquire the refresh slot.', 'Load the authoritative listing and cache it with a measured TTL.', 'Invalidate the affected key after a catalog update and monitor fallback volume.'],
        keyTakeaways: ['A cache improves performance, not correctness or durability by itself.', 'TTL bounds age but does not guarantee immediate consistency.', 'Design Redis outage behavior before production traffic depends on it.'],
        commonMistakes: ['Using a key without tenant or authorization scope can leak data across users.', 'Letting every concurrent miss hit the database causes a cache stampede.', 'Treating an unbounded database fallback as a safe response to cache failure.'],
        bestPractices: ['Set explicit timeouts, TTLs, payload limits, and source fallback concurrency.', 'Use jitter or request coalescing for hot keys and track staleness and hit ratio.', 'Cache only data whose freshness and invalidation contract is understood.'],
        summary: 'Cache-aside trades source work for a bounded, potentially stale copy; key design and failure budgets determine whether it is safe.',
      }),
    topic('distributed-rate-limiting', 'Distributed Rate Limiting', 'High',
      'A distributed rate limiter applies shared request quotas across service replicas while controlling bursts and protecting downstream capacity.',
      [
        'WHAT — Rate limiting admits or rejects requests according to a policy and identity key. A token bucket has a capacity, a refill rate, and a cost per request; it permits bounded bursts while limiting sustained throughput.',
        'WHY — Local counters multiply allowances when a service has multiple replicas. Shared enforcement helps protect a tenant’s fairness and backend capacity, at the cost of coordination latency and a dependency that needs its own failure policy.',
        'HOW — Choose trusted keys (such as authenticated tenant plus route), algorithm, quota, burst, and response semantics. Consume quota atomically at the gateway or in a shared store; return HTTP 429 with useful retry guidance when rejected. Keep a separate global safety limit for expensive downstream resources.',
      ],
      ['Resolve the authenticated caller and the policy key.', 'Atomically consume quota using a gateway or shared limiter.', 'Allow within quota; otherwise return 429 and retry guidance.', 'Observe rejected requests and limiter health; define behavior if coordination is unavailable.'],
      'Give each authenticated tenant a token bucket with a short burst allowance and a sustained refill limit, while enforcing a stricter global budget on a costly report-generation backend.',
      `// Token bucket policy example:
capacity = 100 tokens
refill = 20 tokens per second
request cost = 1 token

// Evaluate and update tokens atomically in the shared limiter.
// If insufficient: return 429 with Retry-After when known.`,
      [
        ['Controls bursts and protects shared resources', 'Tenant policies can improve fairness across replicas'],
        ['Shared checks add latency and another failure mode', 'Bad identity keys or policy boundaries can unfairly block callers'],
      ],
      ['Use at an ingress or shared enforcement point with authenticated keys, atomic accounting, explicit burst policy, and a documented limiter-outage mode.', 'Avoid trusting arbitrary client-supplied identity headers or relying only on per-instance counters when quotas are meant to be global.'],
      ['How does token bucket differ from fixed window?', 'Why can per-process limits exceed the intended quota?', 'Where should a global backend limit be enforced?', 'How should clients and the service behave when quota is exhausted or the shared limiter is down?'],
      'A tenant spreads a traffic burst across several application replicas and overloads an expensive search endpoint. Enforce a tenant quota at ingress and a global backend budget near search, return 429 consistently, and verify that limiter-store failure cannot silently make every replica unlimited.',
      [
        { label: 'Microsoft: ASP.NET Core rate limiting middleware', url: 'https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit' },
        { label: 'RFC 6585: 429 Too Many Requests', url: 'https://www.rfc-editor.org/rfc/rfc6585#section-4' },
      ],
      {
        diagram: [
          { label: 'Trusted identity', detail: 'Resolve an authenticated tenant or principal; do not trust a caller-chosen quota identity.' },
          { label: 'Policy bucket', detail: 'Capacity and refill rate define allowed burst and sustained request rate.' },
          { label: 'Atomic consume', detail: 'One coordinated decision prevents replicas from independently granting full quota.' },
          { label: 'Allow or 429', detail: 'Reject with a clear response and retry guidance where calculable.' },
          { label: 'Backend safety limit', detail: 'A separate global budget protects the scarce downstream resource.' },
        ],
        diagramNote: 'A tenant quota is a fairness policy; a global downstream limit is a capacity guard. They solve different problems and may both be necessary.',
        exampleSteps: ['Authenticate tenant and map request route to a policy.', 'Atomically refill and consume one token in the shared limiter.', 'Continue when a token is available; otherwise respond 429.', 'Track allowed, rejected, and limiter-unavailable rates separately.'],
        keyTakeaways: ['Token bucket permits controlled bursts while bounding long-term rate.', 'Distributed replicas need shared or consistently partitioned accounting.', '429 is a policy response, not a generic server failure.'],
        commonMistakes: ['Using an untrusted header as the quota key lets callers evade or share limits.', 'Applying only local limits gives each replica its own full quota.', 'Failing open during limiter outage can overload the very service the limiter protects.'],
        bestPractices: ['Separate per-tenant fairness limits from global resource safety limits.', 'Set atomicity, timeout, fail-open/fail-closed behavior, and retry guidance deliberately.', 'Test multi-replica bursts, identity spoofing, and shared-store outage behavior.'],
        summary: 'A shared, atomic limiter enforces a deliberate burst and sustained-rate policy, with trusted identities and explicit behavior under failure.',
      }),
    topic('system-design-interview-method', 'System Design: From Requirements to Architecture', 'Very High',
      'A repeatable system-design process turns an ambiguous product request into a testable architecture and explicit trade-offs.',
      [
        'WHAT — System design is the process of defining components, data ownership, interfaces, deployment, and operational behavior that satisfy product and quality requirements.',
        'WHY — Starting with technologies instead of requirements creates overbuilt or unsafe designs. A structured discussion makes assumptions, constraints, and trade-offs visible.',
        'HOW — Clarify functional requirements and exclusions; quantify traffic, data, latency, availability, and security; sketch a high-level design; define APIs and data ownership; deep-dive the highest-risk component; then address failure, scaling, observability, cost, and evolution.',
      ],
      ['Clarify users, use cases, and scope.', 'Set measurable quality goals and assumptions.', 'Estimate load and identify bottlenecks.', 'Draw HLD components and data flows.', 'Deep-dive API/data model and critical algorithms.', 'Review failures, security, operations, cost, and trade-offs.'],
      'For a notification service, clarify channels, delivery guarantees, throughput, and user preferences first. Then estimate peak sends, separate request acceptance from delivery, and deep-dive deduplication and provider failure rather than prematurely choosing a queue.',
      `// Interview checklist
1. Requirements + explicit non-goals
2. SLOs, traffic, storage, and latency budget
3. API contracts + data ownership
4. HLD: clients -> edge -> services -> data/queues
5. LLD: state transitions, boundaries, concurrency
6. Failure, security, observability, cost, rollout

// State assumptions and revisit them when the design changes.`,
      [
        ['Creates a clear reasoning path from product need to implementation', 'Makes assumptions and risks reviewable'],
        ['Early estimates are uncertain and must be labeled', 'A checklist cannot replace domain judgment or validate a design by itself'],
      ],
      ['Use this sequence in interviews and architecture reviews; adapt depth to the most important risk and stated constraints.', 'Avoid spending most of the time on technology names before defining requirements, capacity, and success criteria.'],
      ['What is the difference between functional and non-functional requirements?', 'How do you choose which component to deep-dive?', 'What assumptions would change your architecture?', 'How do you explain a trade-off to a product stakeholder?'],
      'A team proposes microservices for a small new product without traffic or team constraints. Reframe the decision around independent scaling, ownership, deployment needs, and operational readiness; start with the simplest boundary that preserves a credible evolution path.',
      [
        { label: 'Azure Well-Architected Framework', url: 'https://learn.microsoft.com/en-us/azure/well-architected/' },
        { label: 'AWS Well-Architected Framework', url: 'https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html' },
      ],
      {
        diagram: [
          { label: 'Requirements', detail: 'Who uses it? What is in scope? What must not happen?' },
          { label: 'Quality goals', detail: 'Latency, availability, consistency, security, recovery, and cost targets.' },
          { label: 'Capacity + contracts', detail: 'Estimate load; define API, data ownership, and invariants.' },
          { label: 'HLD / LLD', detail: 'Draw components, then detail the highest-risk path and state transitions.' },
          { label: 'Validate + evolve', detail: 'Test failure modes, bottlenecks, operational plans, and trade-offs.' },
        ],
        diagramNote: 'Architecture is a set of decisions against constraints. Record assumptions so a changed requirement triggers a deliberate redesign rather than hidden drift.',
        exampleSteps: [
          'Ask whether notifications are best-effort or must be durably accepted.',
          'Estimate peak event rate and provider quotas.',
          'Draw API, durable queue, dispatcher, preference store, and provider adapters.',
          'Deep-dive deduplication, retries, rate limits, delivery status, and replay.',
        ],
        keyTakeaways: ['Separate requirements from solution choices.', 'Use estimates to expose scale constraints, not to claim false precision.', 'Connect each major choice to a requirement and a trade-off.'],
        commonMistakes: ['Jumping to microservices or a database before clarifying the workload.', 'Treating availability, consistency, and latency as unlimited goals.', 'Ignoring failure, operations, security, and cost until the end.'],
        bestPractices: ['State assumptions aloud and label estimates.', 'Use diagrams to show ownership and request/event direction.', 'Prioritize the hardest constraint and revisit the design when assumptions change.'],
        summary: 'Clarify, quantify, sketch, deep-dive, and validate; the quality of the reasoning matters more than a fashionable technology list.',
      }),
    topic('capacity-estimation', 'Capacity Estimation: Traffic, Storage & Latency', 'Very High',
      'Back-of-the-envelope estimates translate product usage into rough traffic, storage, bandwidth, and capacity requirements.',
      [
        'WHAT — Capacity estimation approximates the scale of reads, writes, data, and network traffic using explicit assumptions.',
        'WHY — Rough arithmetic reveals bottlenecks, order-of-magnitude costs, and when batching, partitioning, caching, or asynchronous processing may be needed.',
        'HOW — Convert daily active users and actions per user into average requests per second, apply a peak factor, estimate bytes per request and retention, then compare those rates with database, queue, and downstream limits. Label assumptions and add headroom; do not treat estimates as measured capacity.',
      ],
      ['Write assumptions and units.', 'Estimate average request rate.', 'Apply peak and read/write distribution.', 'Estimate retained data and bandwidth.', 'Compare with per-instance and dependency capacity.', 'Validate through load tests and production telemetry.'],
      'Illustration: 1 million daily users making 20 actions/day yields 20 million actions/day, about 231 average actions/second. A 5x peak factor gives roughly 1,155 peak actions/second before retries, fan-out, or background work.',
      `// Illustrative sizing
actionsPerDay = 1_000_000 users * 20 actions = 20,000,000
averageRps = actionsPerDay / 86,400 ≈ 231
peakRps = averageRps * 5 ≈ 1,155

// If each durable event is 2 KB and retained for 30 days:
rawStorage ≈ actionsPerDay * 2 KB * 30
           ≈ 1.2 TB decimal, before indexes, replicas, and compression.`,
      [
        ['Makes hidden load and retention assumptions visible', 'Helps compare architectural options before implementation'],
        ['Averages hide bursts, skew, retries, and hot keys', 'Storage and throughput estimates omit overhead unless explicitly modeled'],
      ],
      ['Use as a first-pass sizing and interview reasoning tool; validate with benchmark and telemetry.', 'Avoid using rough calculations as a production quota or omitting replication, indexes, backups, retries, and growth.'],
      ['Why calculate both average and peak throughput?', 'How do fan-out and retries change request volume?', 'What storage overhead is missing from raw payload estimates?', 'How would you validate an estimate?'],
      'A queue-backed workflow appears to support 1,000 requests/second on average, but a flash sale creates a 10x burst and a downstream vendor accepts only 100/second. Bound ingress, queue safely, pace consumers, define overload responses, and alert on oldest-message age rather than scaling the API without limit.',
      [
        { label: 'Azure Well-Architected performance efficiency', url: 'https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/' },
      ],
      {
        diagram: [
          { label: 'Usage assumptions', detail: 'Users, actions/user, payload sizes, retention, and peak factor.' },
          { label: 'Rates', detail: 'Average and peak RPS; split reads, writes, retries, and background work.' },
          { label: 'Data + bandwidth', detail: 'Daily growth, retention, replication, indexes, and network transfer.' },
          { label: 'Capacity limits', detail: 'Compare app, database, queue, and provider throughput.' },
          { label: 'Validate', detail: 'Load-test realistic bursts and revise with observed telemetry.' },
        ],
        diagramNote: 'These are estimates with uncertainty. Add explicit overhead and test at the target workload before committing to capacity.',
        exampleSteps: [
          'Convert 20 million daily actions to about 231 average requests/second.',
          'Apply a stated 5x peak to estimate about 1,155 requests/second.',
          'Include retries, fan-out, and uneven tenant/key distribution.',
          'Load-test the limiting database and external dependency, then set bounded autoscaling.',
        ],
        keyTakeaways: ['Always state units and assumptions.', 'Average traffic is not a peak-capacity target.', 'Include downstream limits, data overhead, and operational headroom.'],
        commonMistakes: ['Using a daily total as if requests arrive evenly.', 'Ignoring retries and fan-out.', 'Treating raw payload storage as total provisioned storage.'],
        bestPractices: ['Estimate orders of magnitude before choosing components.', 'Use realistic peak, skew, retention, and growth assumptions.', 'Validate estimates with load tests and actual production metrics.'],
        summary: 'Capacity math is a hypothesis generator: quantify assumptions, identify bottlenecks, then validate with representative tests.',
      }),
    topic('hld-url-shortener', 'HLD Case Study: URL Shortener', 'High',
      'A URL shortener maps a compact key to a destination and redirects reads quickly while protecting key uniqueness and abuse boundaries.',
      [
        'WHAT — The service creates a short code for a long URL and resolves that code to a redirect target.',
        'WHY — The workload is write-light and read-heavy, making it a useful exercise in API design, key generation, storage, caching, abuse controls, and analytics trade-offs.',
        'HOW — Validate and normalize the URL, generate a unique key with collision handling, persist the mapping, and return a short link. On redirect, check cache then storage, apply expiry/safety policy, and return the configured redirect. Analytics can be emitted asynchronously so counting does not dominate the redirect path.',
      ],
      ['Define create/redirect APIs, expiry, privacy, and abuse requirements.', 'Estimate write/read ratios and retention.', 'Generate unique short keys and persist mapping.', 'Resolve via cache and durable store.', 'Protect against malicious destinations and abusive traffic.', 'Send analytics asynchronously with an explicit consistency trade-off.'],
      'A link service handles 100 writes/second and 10,000 redirects/second. Keep the mapping store authoritative, cache hot codes, reserve keys transactionally, and decouple click analytics so an analytics outage does not block redirects.',
      `POST /links { "url": "https://example.com/article" }
  -> validate scheme/domain policy
  -> generate unique code; retry on unique-key conflict
  -> persist(code, destination, owner, expiresAt)
  -> return https://sho.rt/{code}

GET /{code}
  -> cache lookup -> store on miss -> apply expiry/safety
  -> redirect; emit click event asynchronously`,
      [
        ['Read path can be fast with cache and compact indexed key lookup', 'Analytics and creation can scale independently'],
        ['Hot links create cache/key hotspots', 'Redirect safety, privacy, abuse, and analytics retention add operational complexity'],
      ],
      ['Use when durable links, ownership, expiry, and measurable redirect behavior are clear requirements.', 'Avoid inventing a globally distributed design before traffic, availability, and data residency needs justify it.'],
      ['How do you prevent short-code collisions?', 'What is the difference between 301 and 302 redirects?', 'What should happen if analytics is unavailable?', 'How do you prevent the service from becoming a malicious redirector?'],
      'A marketing campaign creates a hot link and millions of redirect requests while a user submits a phishing destination. Apply URL policy and reputation controls at creation, rate-limit abusive clients, cache the hot mapping safely, and send analytics through a bounded queue.',
      [
        { label: 'Azure Architecture Center', url: 'https://learn.microsoft.com/en-us/azure/architecture/' },
      ],
      {
        diagram: [
          { label: 'Create API', detail: 'Authenticate as needed; validate URL and enforce abuse policy.' },
          { label: 'Key + durable mapping', detail: 'Generate unique code and commit mapping with expiry/owner metadata.' },
          { label: 'Redirect API', detail: 'Read cache, then store; validate expiry and response policy.' },
          { label: 'Analytics queue', detail: 'Emit click event without waiting for analytics processing.' },
          { label: 'Operations', detail: 'Monitor hot keys, cache misses, abuse, storage growth, and queue lag.' },
        ],
        diagramNote: 'The mapping store owns redirect correctness. Cache and analytics are supporting paths with separate consistency and failure expectations.',
        exampleSteps: [
          'Normalize and validate the submitted URL before storing it.',
          'Insert the code under a unique constraint; generate another code on conflict.',
          'Resolve redirect from cache or the indexed mapping table.',
          'Publish click analytics asynchronously and tolerate duplicate events.',
        ],
        keyTakeaways: ['Define URL safety, expiry, and ownership before designing storage.', 'Unique constraints are the final collision guard.', 'Keep analytics off the latency-critical redirect path.'],
        commonMistakes: ['Assuming random code generation cannot collide.', 'Allowing arbitrary untrusted destinations without abuse controls.', 'Making analytics synchronous and turning its outage into redirect failure.'],
        bestPractices: ['Use idempotent creation where clients may retry.', 'Protect hot keys and bound analytics backlog.', 'Choose redirect status and caching policy from product semantics.'],
        summary: 'A URL shortener is a read-heavy key-to-URL system; unique persistence, safe destinations, caching, and decoupled analytics are its core decisions.',
      }),
    topic('lld-inventory-reservation', 'LLD Case Study: Inventory Reservation', 'High',
      'Low-level design turns a business operation into explicit domain objects, contracts, state transitions, and concurrency invariants.',
      [
        'WHAT — Low-level design (LLD) specifies the internal responsibilities, APIs, data model, and interactions of a component in enough detail to implement and test it.',
        'WHY — Clear invariants prevent a high-level design from hiding race conditions such as overselling the last unit or releasing inventory twice.',
        'HOW — Define the aggregate boundary and state machine, expose intent-focused operations, enforce invariants with a database transaction/conditional update, make commands idempotent, and keep external side effects outside the database transaction through an outbox or workflow.',
      ],
      ['Write the invariant: available quantity never becomes negative.', 'Define reservation states and allowed transitions.', 'Design commands, responses, and persistence constraints.', 'Use atomic conditional updates or optimistic concurrency.', 'Make expiry/release and duplicate requests idempotent.', 'Test concurrent and failure interleavings.'],
      'Two shoppers request the last unit. The inventory update must atomically succeed for at most one request; a later payment failure releases the reservation through an idempotent state transition rather than incrementing stock blindly.',
      `UPDATE Inventory
SET Available = Available - @quantity
WHERE Sku = @sku
  AND Available >= @quantity;

-- Require exactly one affected row; zero means unavailable.
-- Persist a unique ReservationId and state transition in the same transaction.`,
      [
        ['Explicit invariants and transitions make behavior testable', 'Atomic conditional writes protect against concurrent oversell'],
        ['Concurrency and retry behavior add implementation complexity', 'Incorrect compensations can corrupt stock or release another reservation'],
      ],
      ['Use explicit domain operations and atomic persistence when concurrent requests can compete for scarce inventory.', 'Avoid read-then-write checks without a transaction/condition or a compensating update with no reservation identity.'],
      ['Why is checking Available before updating unsafe?', 'How does a unique reservation ID help with retries?', 'Which states and transitions should a reservation have?', 'How do you release stock after payment failure without double-incrementing?'],
      'A worker retries a reservation-expiry event after a timeout, while a payment event arrives concurrently. Use conditional, versioned state transitions keyed by reservation ID, serialize or detect conflicting updates, and reconcile ambiguous payment outcomes before releasing stock.',
      [
        { label: 'EF Core concurrency handling', url: 'https://learn.microsoft.com/en-us/ef/core/saving/concurrency' },
        { label: 'SQL Server transaction locking and row versioning', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide' },
      ],
      {
        diagram: [
          { label: 'Reserve command', detail: 'Request includes SKU, quantity, and stable reservation/idempotency key.' },
          { label: 'Atomic invariant check', detail: 'Conditional update succeeds only when available quantity is sufficient.' },
          { label: 'Reservation state', detail: 'Create Pending reservation with expiry and version.' },
          { label: 'Payment outcome', detail: 'Confirm, or release through an idempotent conditional transition.' },
          { label: 'Reconciliation', detail: 'Detect expired/stuck records and resolve uncertain external outcomes.' },
        ],
        diagramNote: 'The database condition prevents oversell locally. Payment and inventory do not share one transaction, so workflow state and reconciliation remain necessary.',
        exampleSteps: [
          'Two transactions request the final unit.',
          'The database serializes conditional updates; only one affects a row.',
          'The winner creates a reservation with a stable ID and expiry.',
          'Payment success confirms it; failure releases it only if the expected state/version still matches.',
        ],
        keyTakeaways: ['Put concurrency invariants in atomic database operations, not only in application checks.', 'Use explicit states and stable IDs for retries.', 'Cross-service outcomes need workflow and reconciliation.'],
        commonMistakes: ['Reading stock and later decrementing without a conditional update.', 'Incrementing inventory on every retry of a release event.', 'Holding a database transaction open while calling a payment provider.'],
        bestPractices: ['Use unique constraints and conditional state/version updates.', 'Test concurrent last-item reservations and duplicate confirm/release commands.', 'Track reservation age and reconcile stuck or ambiguous states.'],
        summary: 'LLD makes invariants executable: conditional updates, state transitions, idempotency, and reconciliation protect inventory under concurrency.',
      }),
  ],
};
