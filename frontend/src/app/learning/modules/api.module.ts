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

export const apiModule: LearningModule = {
  id: 'api-concurrency-resilience',
  title: 'API Concurrency & Resilience',
  description: 'Handle competing edits, retries, and failures without corrupting data or duplicating effects.',
  topics: [
    lesson({
      id: 'data-concurrency-fundamentals', title: 'Data Concurrency', priority: 'Very High',
      summary: 'Data concurrency is the behavior of overlapping operations that read or change shared state.',
      concepts: [
        'Data concurrency describes multiple requests, users, or workers accessing and changing the same logical data during overlapping time.',
        'Without an explicit consistency strategy, later writes can silently overwrite earlier work, invariants can be violated, and retries can duplicate effects.',
        'Identify shared invariants, select isolation and concurrency controls appropriate to the workflow, and make conflict detection or atomic updates part of the persistence boundary.',
      ],
      flow: ['Actors read shared state', 'Operations overlap in time', 'Persistence policy preserves invariant or detects conflict'],
      details: ['An initial read is only a snapshot of the state at that time; it does not reserve the row for the reader.', 'Concurrent work may interleave or commit in an order different from the order users saw.', 'Transactions, optimistic tokens, locks, constraints, or atomic conditional updates determine whether invariants hold.'],
      example: 'Two shoppers read stock quantity 1; each tries to reserve the final item, so a conditional update must ensure only one reservation succeeds.',
      code: `var changed = await db.Products
    .Where(p => p.Id == id && p.AvailableQuantity > 0)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(p => p.AvailableQuantity, p => p.AvailableQuantity - 1), ct);
if (changed == 0) return Conflict();`,
      advantages: ['Explicit concurrency policy preserves business invariants', 'Conflict detection gives clients a safe recovery path'],
      disadvantages: ['Coordination adds storage and application complexity', 'Overly broad locking can reduce throughput and cause deadlocks'],
      use: 'Identify the invariant at risk and choose the narrowest database-supported mechanism that protects it.',
      avoid: 'Avoid assuming that a request-scoped DbContext or transaction automatically prevents every lost update.',
      questions: ['What is a lost update?', 'Why is a read followed by a write unsafe under concurrency?', 'Which invariants need a database-level constraint?'],
      scenario: 'Flash-sale requests oversell the last items; encode inventory availability in an atomic conditional database operation and observe contention under load.',
      note: 'Concurrency correctness is defined by the business invariant and database isolation behavior, not by whether requests execute on separate threads.',
      takeaways: ['Overlapping work is normal in distributed APIs.', 'A read alone does not reserve state.', 'Protect invariants at the persistence boundary.'],
      mistakes: ['Assuming application-level validation remains true at write time.', 'Using locks across network calls or long user interactions.'],
      practices: ['Document invariants and identify race windows explicitly.', 'Use constraints, atomic operations, or version checks and test simultaneous requests.'],
      sources: [{ label: 'EF Core concurrency handling', url: 'https://learn.microsoft.com/en-us/ef/core/saving/concurrency' }],
    }),
    lesson({
      id: 'concurrent-user-edits', title: 'Concurrent Edits & Lost Updates', priority: 'Very High',
      summary: 'A lost update occurs when a later save overwrites changes made after the editor loaded its original copy.',
      concepts: [
        'A concurrent edit is an update based on a snapshot that may have become stale while the user was editing.',
        'Silently applying both writes as if no conflict occurred discards one editor’s intent and undermines data integrity.',
        'Return a version with the representation, require that version on update, and detect mismatch atomically when saving so the API can reject or reconcile stale changes.',
      ],
      flow: ['Editor A and B load same version', 'A commits a change', 'B submits stale version and conflict is detected'],
      details: ['Both clients receive representation version v1 and make independent edits.', 'The first accepted update changes the row and its version to v2.', 'A write conditioned on v1 affects no row or fails a concurrency check, so the stale editor must reload, merge, or explicitly retry.'],
      example: 'Two support agents edit a customer address; the second save reports a conflict rather than silently erasing the first agent’s changes.',
      code: `// Update only if the submitted version is still current.
var affected = await db.Customers
    .Where(c => c.Id == id && c.Version == request.Version)
    .ExecuteUpdateAsync(setters => setters
        .SetProperty(c => c.Address, request.Address), ct);
return affected == 0 ? Conflict() : NoContent();`,
      advantages: ['Protects user intent and exposes stale work', 'Allows deliberate reload, merge, or conflict resolution'],
      disadvantages: ['Users may need to resolve conflicts', 'Version tokens and client contracts require coordination'],
      use: 'Use conflict detection for collaborative or long-lived edits where overwriting another user’s work is unacceptable.',
      avoid: 'Avoid last-write-wins unless the data and product explicitly accept discarded updates.',
      questions: ['What is a lost update?', 'Why should the API detect rather than guess a merge?', 'What recovery choices can a client offer?'],
      scenario: 'An editor submits a form open for twenty minutes while another agent changed the record; return the current representation/version safely and offer a user-reviewed merge.',
      note: 'A conflict response should not expose fields the caller is not authorized to see.',
      takeaways: ['User edit forms are stale snapshots.', 'A version check must be atomic with the write.', 'Conflict recovery can be reload, merge, or explicit overwrite by policy.'],
      mistakes: ['Checking a version in application memory and saving later without a conditional write.', 'Automatically merging fields without understanding business meaning.'],
      practices: ['Include an opaque version or ETag in editable representations.', 'Test simultaneous updates and verify that no successful write is silently lost.'],
      sources: [{ label: 'EF Core concurrency handling', url: 'https://learn.microsoft.com/en-us/ef/core/saving/concurrency' }],
    }),
    lesson({
      id: 'api-concurrent-edit-handling', title: 'Handling Concurrent Edits in an API', priority: 'High',
      summary: 'An API should define how a detected stale update is communicated and how a client can recover without overwriting newer state.',
      concepts: [
        'Concurrent-edit handling is the API contract for a write that no longer matches the state on which the client based its change.',
        'A stable conflict response allows clients to preserve user work and choose a safe reload or merge rather than blindly retrying stale data.',
        'Use a version precondition or database concurrency token, translate only the known stale-write condition to 409 Conflict or an HTTP conditional 412 response, and include a safe Problem Details body with a current version or link where policy allows.',
      ],
      flow: ['Client submits representation and version', 'Server checks version in atomic write', 'Return update or actionable conflict'],
      details: ['The API contract identifies the expected version using a body token or HTTP ETag/If-Match precondition.', 'The persistence layer compares that expected value as part of the write and detects whether another update won.', 'The API returns success only when the write applied; otherwise it returns a client-actionable 409 or 412 without leaking protected data.'],
      example: 'A stale If-Match header produces 412 Precondition Failed; an application-level version conflict without HTTP preconditions may use 409 Conflict.',
      code: `if (!Request.Headers.IfMatch.Contains(currentEtag))
    return StatusCode(StatusCodes.Status412PreconditionFailed);
// Prefer enforcing If-Match atomically through the persistence version check.`,
      advantages: ['Clients receive an explicit and actionable result', 'Separates stale updates from infrastructure failures'],
      disadvantages: ['Response semantics and retry UX must be designed', 'The server must avoid a time-of-check/time-of-use gap'],
      use: 'Choose 412 when a conditional request precondition failed and 409 for a domain-state conflict without that HTTP precondition.',
      avoid: 'Avoid sending a stale full-document retry as an automatic response to conflict.',
      questions: ['When should an API use 409 versus 412?', 'What makes a version check race-safe?', 'Which client recovery choices are appropriate?'],
      scenario: 'A mobile client retries an old update after receiving 409; return a stable Problem Details type and safe current version, then let the client reload or present a merge rather than replaying stale data.',
      note: 'The exact 409/412 contract depends on whether the failed condition is an HTTP request precondition or an application conflict; use it consistently.',
      takeaways: ['Make conflict semantics part of the API contract.', 'Enforce the version check in the same atomic write path.', 'Do not silently discard or auto-replay stale user intent.'],
      mistakes: ['Checking ETag before starting the transaction and assuming it remains current.', 'Returning 500 for a normal stale edit.'],
      practices: ['Use stable problem types and include safe recovery information.', 'Record conflict metrics and test stale If-Match and body-version cases.'],
      sources: [{ label: 'RFC 9110: If-Match and preconditions', url: 'https://www.rfc-editor.org/rfc/rfc9110' }, { label: 'RFC 9457 Problem Details', url: 'https://www.rfc-editor.org/rfc/rfc9457' }],
    }),
    lesson({
      id: 'optimistic-vs-pessimistic-concurrency', title: 'Optimistic vs Pessimistic Concurrency', priority: 'Very High',
      summary: 'Optimistic concurrency detects a conflict when committing; pessimistic concurrency acquires a lock to exclude competing work.',
      concepts: [
        'Optimistic concurrency assumes simultaneous conflicts are uncommon and verifies a version or condition when writing; pessimistic concurrency locks relevant data before work proceeds.',
        'The choice trades throughput and lock contention against conflict frequency and the cost of retry or user resolution.',
        'Use row-version or conditional updates for ordinary edits and short transactions; choose an appropriate database lock only for a critical invariant that cannot be safely expressed otherwise, with bounded duration and deadlock-aware retry.',
      ],
      flow: ['Select concurrency strategy', 'Perform conditional write or acquire lock', 'Commit, detect conflict, or release lock'],
      details: ['Optimistic reads proceed without blocking and retain an original version for the later write.', 'Pessimistic mode takes database locks, causing competing operations to wait, fail, or deadlock depending on policy.', 'The database confirms the result at commit; retry is safe only when operation semantics and side effects permit it.'],
      example: 'Use optimistic tokens for product-description edits; use a short database transaction for a scarce inventory allocation when atomic conditional decrement is not sufficient.',
      code: `// Optimistic EF Core token:
modelBuilder.Entity<Product>()
    .Property(p => p.Version)
    .IsRowVersion();`,
      advantages: ['Optimistic updates offer high concurrency with little blocking', 'Pessimistic locking can serialize truly exclusive short operations'],
      disadvantages: ['Optimistic conflicts require merge or retry policy', 'Locks can block, reduce throughput, and deadlock'],
      use: 'Prefer optimistic checks for typical web edits and use short, explicit locks only when contention and invariant analysis justify them.',
      avoid: 'Avoid holding database locks while waiting for users, networks, or external payment providers.',
      questions: ['How does optimistic concurrency detect conflict?', 'What are the costs of pessimistic locking?', 'When is retry unsafe?'],
      scenario: 'A shipment allocation workflow has high contention; compare atomic conditional updates, optimistic retries, and short transactions under representative load before choosing a locking policy.',
      note: 'A transaction provides atomicity and isolation according to its configured database level; it does not inherently solve every lost-update policy.',
      takeaways: ['Optimistic detects; pessimistic blocks competitors.', 'Choose based on contention, invariant, and recovery cost.', 'Keep transactions and locks short.'],
      mistakes: ['Retrying non-idempotent external effects after a database conflict.', 'Assuming higher isolation always improves correctness without throughput cost.'],
      practices: ['Instrument conflicts, wait time, and deadlocks before tuning.', 'Keep external calls outside locked transactions and use an outbox where needed.'],
      sources: [{ label: 'EF Core concurrency handling', url: 'https://learn.microsoft.com/en-us/ef/core/saving/concurrency' }],
    }),
    lesson({
      id: 'sqlserver-ef-rowversion', title: 'SQL Server RowVersion & EF Core', priority: 'Very High',
      summary: 'SQL Server rowversion is an automatically changing binary version stamp that EF Core can use to detect a stale update.',
      concepts: [
        'SQL Server rowversion is an eight-byte database-generated value that changes when a row containing it is inserted or updated; it is not a date or time.',
        'It lets the database atomically reject an update based on an old row image instead of silently overwriting a newer version.',
        'Map a byte-array property with IsRowVersion or Timestamp, return it as an opaque API version/ETag, let EF include the original token in UPDATE conditions, and handle DbUpdateConcurrencyException with an explicit conflict response.',
      ],
      flow: ['Read entity and rowversion', 'EF writes with original version condition', 'Zero affected rows throws concurrency exception'],
      details: ['SQL Server assigns the rowversion value and changes it when the row is updated.', 'EF Core tracks the original token and includes it in the generated update predicate.', 'If another writer changed the row, the conditional write affects no row and EF throws DbUpdateConcurrencyException for application handling.'],
      example: 'An EF Core update uses the original rowversion; if another transaction changed the row first, the API returns a stale-write conflict rather than overwriting.',
      code: `public sealed class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public byte[] RowVersion { get; set; } = [];
}
modelBuilder.Entity<Product>().Property(p => p.RowVersion).IsRowVersion();`,
      advantages: ['Database-generated token simplifies row-level optimistic checks', 'EF Core provides a dedicated concurrency exception'],
      disadvantages: ['Rowversion is SQL Server-specific and changes on any row update', 'It detects a conflict but does not merge or resolve business intent'],
      use: 'Use rowversion for SQL Server row-level optimistic concurrency where any row update should invalidate prior representations.',
      avoid: 'Avoid interpreting rowversion as wall-clock time or exposing it as a mutable, user-selected value.',
      questions: ['Is SQL Server rowversion a timestamp?', 'What happens when the original token no longer matches?', 'How should an API expose the token to clients?'],
      scenario: 'An EF Core SaveChangesAsync throws DbUpdateConcurrencyException; reload current values only when authorized, distinguish deleted versus modified rows, and return a conflict without leaking protected values.',
      note: 'SQL Server rowversion is a binary counter value, not a date; other databases may need application-managed concurrency tokens.',
      takeaways: ['Rowversion is generated by SQL Server and is not time.', 'EF checks the original token as part of the write.', 'DbUpdateConcurrencyException requires deliberate resolution.'],
      mistakes: ['Calling it a timestamp and assuming it expresses chronological time.', 'Catching the exception and saving stale values over the newer row.'],
      practices: ['Treat rowversion as opaque and encode it safely for API use.', 'Handle deleted, changed, and authorized-reload paths explicitly.'],
      sources: [{ label: 'EF Core concurrency handling', url: 'https://learn.microsoft.com/en-us/ef/core/saving/concurrency' }, { label: 'SQL Server rowversion data type', url: 'https://learn.microsoft.com/en-us/sql/t-sql/data-types/rowversion-transact-sql' }],
    }),
    lesson({
      id: 'request-idempotency', title: 'Request Idempotency & Idempotency Keys', priority: 'Very High',
      summary: 'An idempotent operation has the same intended effect when the same request is repeated, which makes uncertain network retries safer.',
      concepts: [
        'Request idempotency is the property that repeating the same operation has the same intended state effect as performing it once.',
        'A client timeout does not reveal whether the server committed, so a safe replay mechanism prevents duplicate business effects.',
        'For retryable non-idempotent operations, accept a scoped idempotency key, store its request fingerprint and outcome under a unique constraint, and atomically coordinate the record with the operation or durable workflow.',
      ],
      flow: ['Client sends stable operation key', 'Server claims key and performs operation once', 'Replay returns recorded outcome'],
      details: ['The client reuses one unpredictable key for retries of the same logical operation.', 'A unique scoped key and request fingerprint prevent concurrent duplicates and detect accidental key reuse for a different request.', 'The server durably associates the key with the operation result; replay returns the prior outcome rather than repeating side effects.'],
      example: 'A checkout POST times out after the order is committed; retry with the same idempotency key returns the already-created order.',
      code: `// Unique index: (tenantId, operationName, idempotencyKey)
// In one transaction, store request hash + operation result.
if (existingKey is not null)
    return existingKey.RequestHash == requestHash
        ? Replay(existingKey.StoredResponse)
        : Conflict();`,
      advantages: ['Makes retries safe when outcome is uncertain', 'Prevents duplicate creates or charges under concurrent requests'],
      disadvantages: ['Requires retention, key scope, and concurrent claim semantics', 'External side effects may need an outbox or provider idempotency support'],
      use: 'Use idempotency keys for retryable create or payment operations whose duplicate execution has meaningful cost.',
      avoid: 'Avoid using an idempotency key as authorization or storing keys without expiry, scope, and mismatch policy.',
      questions: ['Why is a timeout an uncertain outcome?', 'What should happen if the same key has a different request body?', 'How do concurrent first requests avoid double execution?'],
      scenario: 'Two identical payment requests arrive concurrently with one key; a unique constraint or atomic key claim allows one operation and the other waits for or replays its recorded outcome.',
      note: 'A database transaction cannot atomically commit an arbitrary external payment; combine durable local intent/outbox with downstream provider idempotency and reconciliation.',
      takeaways: ['A stable key identifies one logical operation across retries.', 'Request fingerprint prevents unsafe key reuse.', 'Exactly-once effects across distributed systems require coordination, not just a header.'],
      mistakes: ['Creating the side effect before claiming the key atomically.', 'Returning a prior result for a different request payload with the same key.'],
      practices: ['Use unique constraints, durable outcomes, bounded key retention, and replay metrics.', 'Coordinate external side effects with outbox/inbox patterns and downstream idempotency.'],
      sources: [{ label: 'RFC 9110: Idempotent Methods', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-9.2.2' }],
    }),
    lesson({
      id: 'http-idempotent-methods', title: 'Idempotent HTTP Methods', priority: 'High',
      summary: 'HTTP defines PUT and DELETE as idempotent in intended effect, and GET, HEAD, OPTIONS, and TRACE as safe and therefore idempotent.',
      concepts: [
        'An HTTP method is idempotent when multiple identical requests have the same intended effect on server state as one request.',
        'Idempotence lets clients and intermediaries reason about retries after communication failure, but it does not promise identical response codes or zero repeated processing.',
        'Implement GET without intended mutation, make PUT represent replacement and DELETE repeated deletion leave the same desired state, and add idempotency mechanisms when a POST business action must be safely retried.',
      ],
      flow: ['Issue request once', 'Repeat same request', 'Intended final state remains equivalent'],
      details: ['A safe method such as GET is intended not to change server state and is idempotent.', 'PUT replacement and DELETE removal are idempotent by their intended effect, though logging or other ancillary processing may still occur.', 'POST is not inherently idempotent; client retry safety requires a defined API contract or idempotency key for duplicate-sensitive actions.'],
      example: 'Deleting an already-deleted resource can return 404 on a later call yet remain idempotent because the resource stays absent.',
      code: `PUT /api/profiles/42
{ "displayName": "Mina", "locale": "en-GB" }

DELETE /api/profiles/42
// Repeating either request does not create an additional intended state change.`,
      advantages: ['Supports safer retries for defined operations', 'Aligns endpoint behavior with standard HTTP semantics'],
      disadvantages: ['Ancillary side effects can accidentally make repeated calls harmful', 'Idempotence is often misread as identical responses or writes'],
      use: 'Use safe/idempotent method semantics to guide client retries and design repeatable resource state transitions.',
      avoid: 'Avoid mutating data on GET or assuming POST is retry-safe without a deduplication contract.',
      questions: ['Which standard methods are idempotent?', 'Can an idempotent request return different status codes on retry?', 'Is zero database writes required by idempotence?'],
      scenario: 'A gateway retries DELETE after a timeout; ensure repeat deletion does not trigger a second refund or notification, even if the response to a later call differs.',
      note: 'Idempotent describes intended effect on resource state; it does not require the server to avoid all internal writes or side effects.',
      takeaways: ['PUT and DELETE are idempotent by intended effect.', 'Idempotence does not mean identical response or no database write.', 'POST retries need operation-specific protection when duplicates matter.'],
      mistakes: ['Putting analytics-triggering or payment side effects in GET.', 'Assuming returning the same status code is required for idempotence.'],
      practices: ['Document retry semantics and side effects per operation.', 'Test repeated requests, including timeouts and concurrent delivery.'],
      sources: [{ label: 'RFC 9110: Safe and Idempotent Methods', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-9.2' }],
    }),
    lesson({
      id: 'put-avoiding-unnecessary-writes', title: 'PUT: Avoiding Unnecessary Database Writes', priority: 'High',
      summary: 'A PUT request can be idempotent even if the server writes each time; avoiding needless writes is a separate optimization and side-effect concern.',
      concepts: [
        'PUT requests that the target resource be created or replaced with the supplied representation according to the API contract.',
        'A representation that is unchanged can still produce the same intended state, but repeated database writes may update audit fields, trigger events, invalidate caches, or create contention.',
        'Compare normalized persisted values when worthwhile, avoid generating change-only effects for unchanged data, and retain concurrency checks and PUT’s replacement semantics regardless of whether a physical write is skipped.',
      ],
      flow: ['Receive full replacement representation', 'Compare with current resource under concurrency rules', 'Persist only meaningful changes or confirm unchanged state'],
      details: ['PUT defines replacement of the target representation; omitted-field behavior must be explicit in the API contract.', 'An unchanged representation has no intended resource-state change, even if a database UPDATE command would otherwise run.', 'Avoiding a write may reduce triggers and churn but must not weaken version checks, audit requirements, or external effect handling.'],
      example: 'A client repeats PUT for an unchanged profile; the API preserves the same representation and avoids creating a duplicate “profile changed” event.',
      code: `if (!Equivalent(current, request))
{
    ApplyReplacement(current, request);
    await db.SaveChangesAsync(ct);
}
// Still enforce the expected row version / If-Match condition.`,
      advantages: ['Can reduce database churn, trigger work, and noisy audit events', 'Keeps change events aligned with actual domain changes'],
      disadvantages: ['Equality comparison adds complexity and can miss semantic differences', 'Skipping persistence can conflict with audit or freshness policies'],
      use: 'Avoid writes only when equality semantics and side effects are defined and measured.',
      avoid: 'Avoid conflating a no-op optimization with request idempotency or skipping stale-version checks.',
      questions: ['Can a repeated PUT be idempotent while issuing SQL UPDATE twice?', 'Why might an unchanged write still have side effects?', 'Should equality comparison bypass concurrency validation?'],
      scenario: 'Repeated client synchronization causes update triggers and cache invalidations for unchanged records; compare canonical values, suppress change events for true no-ops, and preserve ETag checks.',
      note: 'This is a storage and side-effect optimization, distinct from idempotency keys used to deduplicate non-idempotent business requests.',
      takeaways: ['PUT idempotence concerns intended state, not the count of SQL writes.', 'Unnecessary writes may trigger observable downstream work.', 'No-op optimization must preserve concurrency and audit requirements.'],
      mistakes: ['Claiming idempotence requires that the server perform no second database write.', 'Skipping an If-Match or version check because the values appear equal.'],
      practices: ['Define canonical equality and whether audit updates count as meaningful changes.', 'Measure write amplification and test event/outbox behavior on unchanged PUTs.'],
      sources: [{ label: 'RFC 9110: PUT', url: 'https://www.rfc-editor.org/rfc/rfc9110#section-9.3.4' }],
    }),
    lesson({
      id: 'duplicate-order-payment-requests', title: 'Preventing Duplicate Orders & Payments', priority: 'Very High',
      summary: 'Duplicate-sensitive business operations need durable deduplication across retries, concurrent requests, and downstream failures.',
      concepts: [
        'A duplicate order or payment is an unintended second business effect caused by repeated delivery or repeated client submission.',
        'Network timeouts, user double-clicks, proxy retries, and webhook redelivery make duplicate delivery normal rather than exceptional.',
        'Combine client idempotency keys with database uniqueness and a durable operation state machine; coordinate payment-provider idempotency, transactional outbox/inbox delivery, and reconciliation for failures crossing system boundaries.',
      ],
      flow: ['Receive operation key and command', 'Atomically create durable operation/order', 'Coordinate provider effect and replay final result'],
      details: ['Each logical checkout has a stable, scoped key and request fingerprint.', 'A unique constraint guarantees only one local operation can own the key and create the order state.', 'A durable outbox and provider-supported idempotency key handle payment delivery; reconciliation resolves ambiguous external outcomes.'],
      example: 'A payment provider charges successfully but the response is lost; retry with the provider’s stable idempotency key and reconcile the same payment rather than creating a second charge.',
      code: `// Persist order + outbox message in one database transaction.
// Deliver with the same provider idempotency key and persist provider result.
await outbox.EnqueueAsync(new ChargePayment(order.Id, key), ct);`,
      advantages: ['Protects customers against duplicate orders and charges', 'Durable records support retries, audit, and reconciliation'],
      disadvantages: ['Distributed workflows require state machines and operational monitoring', 'Provider idempotency windows and local retention policies must align'],
      use: 'Use end-to-end deduplication for payment, order, booking, and other non-repeatable business effects.',
      avoid: 'Avoid assuming an HTTP retry policy, a database transaction, or a frontend disabled button guarantees exactly-once payment.',
      questions: ['Why cannot one local transaction guarantee exactly one external charge?', 'How do an outbox and provider idempotency key work together?', 'How should an ambiguous provider timeout be reconciled?'],
      scenario: 'A payment call times out after the provider may have charged; persist the operation as pending, query or replay using the same provider key, reconcile provider state, and do not tell the customer to start a new charge blindly.',
      note: 'Distributed systems provide at-least-once delivery in many designs; practical safety comes from idempotent processing, durable deduplication, and reconciliation.',
      takeaways: ['Duplicate delivery is expected in distributed workflows.', 'Persist local intent and deduplicate by a stable operation identity.', 'Use downstream idempotency and reconcile uncertain outcomes.'],
      mistakes: ['Generating a new provider key on every retry.', 'Marking an order paid before a durable, reconciled payment result exists.'],
      practices: ['Use outbox/inbox, unique constraints, state transitions, and reconciliation dashboards.', 'Design customer-visible states for pending, succeeded, failed, and needs-review operations.'],
      sources: [{ label: 'AWS Builders’ Library: Making retries safe with idempotent APIs', url: 'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/' }],
    }),
    lesson({
      id: 'put-vs-patch', title: 'PUT vs PATCH', priority: 'Very High',
      summary: 'PUT conventionally replaces a resource representation; PATCH applies a defined partial modification.',
      concepts: [
        'PUT requests creation or replacement of the target resource representation, whereas PATCH carries instructions to modify only part of the resource.',
        'Clear semantics prevent omitted fields from being accidentally cleared or preserved contrary to client expectations.',
        'Define whether PUT requires a complete representation, select and document a PATCH format such as JSON Merge Patch or JSON Patch, validate allowed paths and invariants, and protect both with concurrency preconditions.',
      ],
      flow: ['Client selects replacement or patch document', 'API validates representation and version', 'Apply full replacement or partial operation'],
      details: ['PUT is idempotent in intended effect and its request representation is the replacement contract; omitted-field semantics must be clear.', 'PATCH describes modifications and is not automatically idempotent; its format defines how operations apply.', 'The API validates authorization, allowed fields, domain invariants, and concurrency before persisting changes.'],
      example: 'PUT sends the full editable profile; PATCH may update only preferred language without resetting omitted notification settings.',
      code: `[HttpPut("{id:int}")]
public Task<IActionResult> Replace(int id, ReplaceProfileRequest body) => ...;

[HttpPatch("{id:int}")]
public Task<IActionResult> Patch(int id, JsonPatchDocument<ProfileDto> patch) => ...;`,
      advantages: ['PUT gives a clear full-replacement contract', 'PATCH can reduce payloads for focused partial changes'],
      disadvantages: ['PUT payloads can be larger and completeness rules need care', 'PATCH formats introduce path, authorization, and validation complexity'],
      use: 'Use PUT when the client supplies the intended full editable representation and PATCH for deliberately specified partial changes.',
      avoid: 'Avoid applying arbitrary patch paths to persistence entities or silently treating partial input as replacement.',
      questions: ['Is PATCH necessarily idempotent?', 'What happens to an omitted field in PUT?', 'How do you prevent a patch from changing a forbidden property?'],
      scenario: 'A client PATCHes a profile role property by guessing a JSON path; constrain permitted operations, authorize each mutable property, validate the resulting resource, and enforce If-Match.',
      note: 'PATCH semantics depend on the chosen patch media type; the method itself does not define whether repeating a particular patch has the same effect.',
      takeaways: ['PUT is replacement; PATCH is format-defined modification.', 'PATCH is not automatically idempotent.', 'Validate resulting state, mutable fields, permissions, and version.'],
      mistakes: ['Using a patch document directly against a database entity.', 'Assuming PUT’s omitted fields are preserved without documenting that behavior.'],
      practices: ['Advertise supported patch media types and allowed operations.', 'Test repeated PATCH, invalid paths, property authorization, and stale versions.'],
      sources: [{ label: 'RFC 9110: PUT and PATCH semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110' }, { label: 'RFC 5789: PATCH Method', url: 'https://www.rfc-editor.org/rfc/rfc5789' }],
    }),
    lesson({
      id: 'api-error-status-codes', title: 'Error Status Codes for APIs', priority: 'High',
      summary: 'Status codes distinguish invalid input, missing authentication, denied access, stale state, and unexpected server failure.',
      concepts: [
        'An HTTP error status classifies why the requested operation did not succeed from the API consumer’s perspective.',
        'Clients need distinct outcomes to know whether to correct input, authenticate, request permission, resolve a conflict, or contact support.',
        'Use 400 for malformed or invalid request data, 401 for missing or unacceptable authentication, 403 for authenticated but unauthorized callers, 404 for absent or intentionally concealed resources, 409 for domain or write conflicts, 412 for failed HTTP preconditions, and 500 for unexpected failures.',
      ],
      flow: ['Classify failure layer', 'Choose semantically correct status', 'Return stable safe error contract'],
      details: ['Request parsing and validation failures are client errors, not server exceptions.', 'Authentication and authorization failures are different and may carry protocol-specific challenge behavior.', 'State conflicts and failed If-Match preconditions are distinct from unexpected server errors and should support client recovery.'],
      example: 'An invalid model gets 400, an expired access token gets 401, an authenticated forbidden operation gets 403, a stale edit gets 409 or 412 according to its contract, and an outage gets 500.',
      code: `return failure switch
{
    InvalidInput => BadRequest(problem),
    MissingResource => NotFound(),
    StaleVersion => Conflict(problem),
    _ => StatusCode(StatusCodes.Status500InternalServerError, safeProblem)
};`,
      advantages: ['Enables reliable client recovery and telemetry grouping', 'Prevents normal business outcomes from masquerading as server faults'],
      disadvantages: ['Status semantics can leak resource existence', 'Inconsistent mapping creates fragile clients'],
      use: 'Define each failure mapping with client recovery, security disclosure, and retry semantics in mind.',
      avoid: 'Avoid returning 500 for normal invalid input or 200 with an error-shaped body.',
      questions: ['How do 401 and 403 differ?', 'When is 412 more precise than 409?', 'Which failures should clients retry?'],
      scenario: 'A mobile client retries a stale edit and overloads an API; return a distinct conflict code and problem type so it can refresh rather than retrying unchanged input.',
      note: 'A 404 may intentionally hide a protected resource; status choice should follow a consistent access-control and disclosure policy.',
      takeaways: ['Classify errors by cause and recovery action.', '401 authentication differs from 403 authorization.', '409/412 represent conflicts, while 500 represents unexpected server failure.'],
      mistakes: ['Returning 401 for every authorization denial.', 'Using 500 for validation or concurrency conflicts.'],
      practices: ['Document status codes, challenge headers, and retry guidance per endpoint.', 'Ensure unexpected errors do not expose internal details.'],
      sources: [{ label: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110' }],
    }),
    lesson({
      id: 'standard-api-error-response', title: 'Standard API Error Responses', priority: 'High',
      summary: 'A standard error body gives clients stable machine-readable classification without exposing internal implementation details.',
      concepts: [
        'A standard API error response is a consistent representation of a failed HTTP operation, including status and safe diagnostic fields.',
        'Stable error types, validation details, and trace identifiers simplify client handling and support investigations while limiting disclosure.',
        'Adopt RFC 9457 Problem Details or a documented compatible schema, keep status aligned with the HTTP response, define validation extension shapes, and expose correlation identifiers without stack traces or secrets.',
      ],
      flow: ['Failure is classified', 'Problem document is constructed safely', 'Client acts on type, status, and trace context'],
      details: ['The HTTP status remains authoritative and should agree with the problem document status.', 'A problem type or stable code can identify a client-actionable failure without parsing prose.', 'A trace identifier links the response to protected server telemetry; details must avoid secrets and internal exception content.'],
      example: 'A validation response provides field-level errors and a trace ID; the client displays corrections while support can find the correlated log entry.',
      code: `return Results.Problem(
    type: "https://api.example/problems/order-conflict",
    title: "Order cannot be updated",
    statusCode: StatusCodes.Status409Conflict,
    extensions: new Dictionary<string, object?>
    {
        ["traceId"] = Activity.Current?.TraceId.ToString()
    });`,
      advantages: ['Consistent client parsing across endpoints', 'Safe trace correlation improves supportability'],
      disadvantages: ['Clients can become coupled to unstable prose or implementation codes', 'Overly detailed errors can leak sensitive state'],
      use: 'Use stable problem types and validation extensions with well-defined client recovery semantics.',
      avoid: 'Avoid returning raw exceptions, SQL messages, stack traces, access tokens, or arbitrary database fields.',
      questions: ['Which fields are defined by Problem Details?', 'Why should clients rely on problem type/code rather than title prose?', 'How can a trace ID help without leaking internals?'],
      scenario: 'An SDK parses inconsistent ad hoc error JSON; standardize on Problem Details, preserve status semantics, and add contract tests for validation, conflict, and server failures.',
      note: 'RFC 9457 obsoletes RFC 7807; ASP.NET Core support may refer to both terminology and version-specific framework APIs.',
      takeaways: ['Keep status and problem status consistent.', 'Use stable types/codes and safe details.', 'Connect client support reports to internal traces.'],
      mistakes: ['Exposing exception.Message or stack traces as detail.', 'Changing a stable error code while keeping the same prose and expecting clients to recover.'],
      practices: ['Use RFC 9457 Problem Details and a documented validation shape.', 'Localize user-facing prose in clients while treating server problem types as stable identifiers.'],
      sources: [{ label: 'RFC 9457: Problem Details for HTTP APIs', url: 'https://www.rfc-editor.org/rfc/rfc9457' }, { label: 'ASP.NET Core error handling', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors' }],
    }),
    lesson({
      id: 'problem-details', title: 'ProblemDetails in ASP.NET Core', priority: 'High',
      summary: 'ProblemDetails is ASP.NET Core’s model for producing interoperable error documents based on the Problem Details standard.',
      concepts: [
        'ProblemDetails is a structured HTTP error representation with standard fields such as type, title, status, detail, and instance.',
        'A shared model helps APIs express client-actionable errors consistently and interoperate with generic HTTP tooling.',
        'Register AddProblemDetails for framework integrations, use ValidationProblemDetails for model errors, and customize safe extensions such as traceId or stable error codes without changing HTTP status semantics.',
      ],
      flow: ['Application identifies error outcome', 'Framework serializes problem document', 'Client interprets status and stable type'],
      details: ['The type URI identifies the problem category; title is a short summary and detail provides safe occurrence-specific context.', 'ValidationProblemDetails can carry field-level errors for input failures.', 'Framework services and exception/status middleware can produce problem documents when configured and when the response has not started.'],
      example: 'A stale update returns 409 with a stable conflict type and safe guidance, while an unexpected server exception returns a generic 500 problem with a trace identifier.',
      code: `builder.Services.AddProblemDetails();

return Conflict(new ProblemDetails
{
    Type = "https://api.example/problems/version-conflict",
    Title = "The resource has changed",
    Status = StatusCodes.Status409Conflict,
    Detail = "Reload the resource before applying this update."
});`,
      advantages: ['Standardized error structure and framework support', 'Extensible for validation and trace correlation'],
      disadvantages: ['Misleading detail or mismatched status can break clients', 'Problem documents do not decide which errors are safe to reveal'],
      use: 'Use ProblemDetails for API errors and maintain stable problem types for supported client behavior.',
      avoid: 'Avoid putting secrets, internal exception diagnostics, or sensitive resource snapshots in extensions.',
      questions: ['What is the purpose of the type member?', 'How does ValidationProblemDetails differ?', 'Does AddProblemDetails automatically catch every exception?'],
      scenario: 'A team enables AddProblemDetails but still sees inconsistent failures; configure exception and status-code handling explicitly, then test content type and body for all failure layers.',
      note: 'AddProblemDetails registers services; middleware such as UseExceptionHandler or UseStatusCodePages may still be needed to produce responses for the relevant failures.',
      takeaways: ['ProblemDetails standardizes representation, not classification.', 'Configure the middleware that produces errors.', 'Keep status, type, and disclosure consistent.'],
      mistakes: ['Assuming AddProblemDetails alone globally catches exceptions.', 'Exposing internal detail because the standard has a detail field.'],
      practices: ['Use RFC 9457-compatible response bodies and validation contracts.', 'Integration-test status, content type, extensions, and sensitive-data redaction.'],
      sources: [{ label: 'Handle errors in ASP.NET Core APIs', url: 'https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors' }, { label: 'RFC 9457 Problem Details', url: 'https://www.rfc-editor.org/rfc/rfc9457' }],
    }),
    lesson({
      id: 'central-exception-handling', title: 'Centralized Exception Handling', priority: 'Very High',
      summary: 'Centralized exception handling turns unhandled failures into consistent, safe API responses while preserving operational diagnostics.',
      concepts: [
        'Centralized exception handling is a boundary that observes unhandled exceptions from downstream request processing and maps them to HTTP behavior.',
        'It avoids repetitive catch blocks and prevents unexpected failures from leaking stack traces or inconsistent implementation details to clients.',
        'Register UseExceptionHandler early with AddProblemDetails or an IExceptionHandler for known mappings, log exceptions with trace correlation, map only understood domain errors, and let unknown exceptions remain generic 500 failures.',
      ],
      flow: ['Downstream operation throws', 'Exception boundary logs and classifies', 'Client receives safe Problem Details'],
      details: ['Exception middleware must wrap routing and endpoint work that it is expected to catch.', 'Known exception types map to deliberate outcomes; expected validation, missing data, and business conflicts should usually be represented without exceptions.', 'A generic fallback returns safe 500 content while protected logs record exception and trace context.'],
      example: 'A known optimistic-concurrency exception becomes 409; an unanticipated database connectivity failure is logged and returned as generic 500.',
      code: `builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
app.UseExceptionHandler();

internal sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger)
    : IExceptionHandler
{
    public ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        logger.LogError(exception, "Unhandled request failure {TraceId}",
            context.TraceIdentifier);
        return ValueTask.FromResult(false); // Leave generic handling to configured pipeline.
    }
}`,
      advantages: ['Consistent error shape and centralized telemetry', 'Keeps endpoint code focused on expected outcomes'],
      disadvantages: ['Incorrect mapping can hide faults or mislead clients', 'Handled exceptions need explicit logging and observability'],
      use: 'Use global middleware or IExceptionHandler for unexpected failures and narrowly mapped known domain exceptions.',
      avoid: 'Avoid catch-all success responses, exception-driven normal control flow, and public stack traces.',
      questions: ['Why must exception middleware be early?', 'When should a handler return false?', 'How should a known concurrency exception differ from an unknown exception?'],
      scenario: 'A custom handler suppresses all diagnostics while returning 500; ensure handled exceptions are logged and measured, and let unknown failures reach the generic safe fallback.',
      note: 'When an IExceptionHandler returns true, it has handled the failure; make sure its logging and metrics preserve operational visibility.',
      takeaways: ['Centralize unhandled failures, not ordinary control flow.', 'Map known failures narrowly; keep unknown failures generic.', 'Safe client output and rich protected diagnostics can coexist.'],
      mistakes: ['Returning true for every exception without logging it.', 'Mapping every exception to 400 or including its message in the response.'],
      practices: ['Attach trace correlation and alert on unexpected 5xx rates.', 'Test known mapping, unknown fallback, response-started behavior, and disclosure.'],
      sources: [{ label: 'ASP.NET Core exception handling', url: 'https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling' }, { label: 'RFC 9457 Problem Details', url: 'https://www.rfc-editor.org/rfc/rfc9457' }],
    }),
  ],
};
