# Module 11 — Reliability, Observability, and Distributed Systems

**Workbook alignment:** Days 19–20 (messaging, telemetry, health, CI/CD) and
Day 28 (timeouts, retries, circuit breakers, idempotency). Related tracker
topics: T101–T110.

## T101 — Structured logs and correlation identifiers

- **What:** Structured logs record named fields; a correlation identifier
  connects events from one request.
- **Why:** Operators need to diagnose a failure without logging sensitive
  prompts, source code, or credentials.
- **When:** Log provider name, safe error category, and trace/request ID.
- **Limits:** Logs are not metrics or traces; identifiers must not contain
  secrets or user-controlled unsafe text.
- **Diagram:** `request ID -> API log -> provider failure log -> support trace`
- **Project example (implemented):** provider error messages use structured
  logging. [ChatApiService.cs](../../Services/ChatApiService.cs)
- **Reference:** [Logging in .NET](https://learn.microsoft.com/dotnet/core/extensions/logging)

## T102 — Metrics, traces, OpenTelemetry, and Application Insights

- **What:** Metrics summarize values over time; traces show a request path;
  logs record discrete events.
- **Why:** Together they distinguish latency, dependency failures, and load.
- **When:** Instrument useful service-level indicators and external dependency
  calls before public hosting.
- **Limits:** Telemetry can expose prompts or identifiers; control cardinality,
  retention, and redaction.
- **Diagram:** `request span -> API span -> provider HTTP span + metrics/logs`
- **Project example (planned — key110):** no OpenTelemetry exporter or
  Application Insights integration is configured; add telemetry with explicit
  prompt/token redaction rules.
- **Reference:** [OpenTelemetry in .NET](https://learn.microsoft.com/dotnet/core/diagnostics/observability-with-otel)

## T103 — Liveness, readiness, and dependency health checks

- **What:** Liveness asks whether a process should restart; readiness asks
  whether it should receive traffic.
- **Why:** Hosting needs to distinguish a running process from one ready to
  serve requests.
- **When:** Define probes based on the service's actual startup/dependency
  policy.
- **Limits:** Probing every dependency too aggressively can amplify outages;
  health endpoints must not reveal secrets or internal topology.
- **Diagram:** `host -> liveness` and `load balancer -> readiness`
- **Project example (planned — key110):** no health checks are registered in
  [Program.cs](../../Program.cs).
- **Reference:** [ASP.NET Core health checks](https://learn.microsoft.com/aspnet/core/host-and-deploy/health-checks)

## T104 — Deadlines, timeouts, and cancellation budgets

- **What:** A timeout caps one operation; an overall deadline caps the whole
  request; cancellation asks work to stop.
- **Why:** A provider should not hold a request indefinitely.
- **When:** Set provider timeout below the overall HTTP/request deadline and
  propagate caller cancellation.
- **Limits:** Cancelling locally may not stop remote inference already in
  progress; overlapping timeout layers can obscure the root cause.
- **Diagram:** `API budget 90s -> provider budget 60s -> caller cancellation anytime`
- **Project example (implemented):** provider-specific timeouts are configured
  in [Program.cs](../../Program.cs); actual deployment request budgets remain
  to be coordinated.
- **Reference:** [HttpClient timeout](https://learn.microsoft.com/dotnet/api/system.net.http.httpclient.timeout)

## T105 — Retries, exponential backoff, and retry storms

- **What:** A retry repeats a failed operation; exponential backoff increases
  wait between attempts.
- **Why:** Transient failures can sometimes recover.
- **When:** Retry only classified transient failures within an overall budget
  and when duplicate effects/cost are acceptable.
- **Limits:** Retrying model generation can charge twice and multiply load
  during outages.
- **Diagram:** `transient error -> bounded delay -> retry if budget remains`
- **Project example (not enabled by design):** current adapters do not retry.
  Add retries only after idempotency, provider semantics, and a cost budget are
  documented.
- **Reference:** [Transient fault handling](https://learn.microsoft.com/azure/architecture/best-practices/transient-faults)

## T106 — Circuit breakers, bulkheads, and backpressure

- **What:** A circuit breaker temporarily stops calls to a failing dependency;
  bulkheads isolate resources; backpressure slows producers when consumers are
  saturated.
- **Why:** These patterns can prevent one slow provider from exhausting all
  API capacity.
- **When:** Add them when real dependency failure/traffic evidence supports the
  complexity.
- **Limits:** Bad thresholds can deny healthy requests; a breaker is not a
  replacement for timeout or user-facing failure handling.
- **Diagram:** `requests -> bulkhead limit -> breaker -> provider`
- **Project exercise (non-production):** sketch how a provider circuit breaker
  would interact with the existing finite named-client timeouts. Do not add a
  breaker, queue, or fallback until workload evidence warrants it.
- **Reference:** [Circuit Breaker pattern](https://learn.microsoft.com/azure/architecture/patterns/circuit-breaker)

## T107 — Caching, invalidation, privacy, and freshness

- **What:** A cache reuses prior results; invalidation controls when cached
  data is discarded.
- **Why:** Caching can reduce repeated computation and latency for safe,
  repeatable data.
- **When:** Cache only when keys include all relevant inputs and user/tenant
  boundaries; define freshness and deletion behavior.
- **Limits:** AI answers may be nondeterministic; caching private code can
  create data leakage or retention risk.
- **Diagram:** `request -> authorized cache key -> hit | provider -> store with expiry`
- **Project example (not implemented by design):** do not cache submitted code
  or model answers until privacy, ownership, and invalidation requirements
  justify it.
- **Reference:** [Cache-Aside pattern](https://learn.microsoft.com/azure/architecture/patterns/cache-aside)

## T108 — Service Bus queues/topics and competing consumers

- **What:** A queue delivers each message to one competing consumer; a topic
  can fan out to multiple subscriptions.
- **Why:** Background ingestion or long-running work can be decoupled from
  request latency.
- **When:** Use a broker when the product needs durable asynchronous work, not
  just to add infrastructure.
- **Limits:** Messaging introduces eventual consistency, operational cost,
  duplicate delivery, and poison-message handling.
- **Diagram:** `API -> queue -> worker(s)` · `publisher -> topic -> subscriptions`
- **Project example (planned/optional — key110):** no background job currently
  exists; RAG ingestion is a possible future queue use if it becomes long
  running.
- **Reference:** [Azure Service Bus messaging](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-messaging-overview)

## T109 — Idempotency, duplicate delivery, outbox, and DLQ

- **What:** Idempotency makes repeated processing safe; an outbox atomically
  stores state plus a message to publish; a dead-letter queue isolates
  repeatedly failing messages.
- **Why:** Distributed delivery is commonly at-least-once, so duplicates must
  not corrupt data.
- **When:** Add these patterns when a durable queue and multi-step state change
  are required.
- **Limits:** Deduplication needs stable keys and retention; outbox adds schema
  and dispatch operations.
- **Diagram:** `transaction: state + outbox -> dispatcher -> broker -> idempotent worker`
- **Project example (planned/optional — key110):** no queue/outbox exists;
  define idempotency before introducing background ingestion.
- **Reference:** [Transactional outbox pattern](https://learn.microsoft.com/azure/architecture/patterns/transactional-outbox)

## T110 — SLI/SLO, incident response, runbooks, and alerting

- **What:** An SLI measures service behavior; an SLO sets a target; runbooks
  guide response to known incidents.
- **Why:** A production service needs measurable reliability and repeatable
  diagnosis.
- **When:** Choose indicators tied to user outcomes, such as successful
  completion rate and provider latency.
- **Limits:** Targets without reliable measurement or action create noise;
  availability targets cannot control an external provider's service.
- **Diagram:** `telemetry -> SLI -> SLO/error budget -> alert/runbook/action`
- **Project example (planned — key110):** document provider outage, credential,
  database, and budget incidents before public hosting.
- **Reference:** [Azure Well-Architected reliability](https://learn.microsoft.com/azure/well-architected/reliability/)

## Workbook implementation connection

Current code has structured provider error logs and finite HTTP timeouts.
Health, traces, metrics, queues, caching, retries, and SLOs are not present;
add only the operational pieces justified by the selected hosting and workload.

## Worked examples and practice

These examples explain operational choices; they do not add retries, queues,
caching, or telemetry to the application.

### T101 — Log a safe request correlation

Log a trace identifier with a safe operation name and failure category. That
lets an operator follow one request without copying source code or credentials
into a log. Keep user-controlled text out of structured fields unless it has
been safely bounded and sanitized.

```text
traceId=... operation=ExplainCode provider=Ollama outcome=Timeout
```

The current provider path uses structured logging rather than composing a
single interpolated log string:

```csharp
_logger.LogError(
    exception,
    "The request to AI provider {Provider} failed.",
    provider.Name);
```

This pattern is present in
[`ChatApiService.cs`](../../Services/ChatApiService.cs). The named
`{Provider}` value can be indexed by a log backend. The exception is recorded
server-side; the public response is a separate safe `Result`. The current
code still has a broad unexpected-exception catch, documented in Module 1;
structured logging does not make that error classification ideal.

**Self-check:** Should a log record include the full submitted code to aid
debugging? **Answer:** not by default; it may be sensitive and is not needed
to correlate the failure.

### T102 — Use logs, metrics, and traces for different questions

Logs explain individual events, metrics show aggregated trends, and traces
show how time and failures flow across dependencies. A provider span can
explain latency while a metric tracks the percentage of successful calls.
Redact prompts, tokens, and personal data from all telemetry.

```text
request trace -> API span -> provider HTTP span
metrics: latency histogram + success/failure counts
```

Application Insights is one Azure monitoring service that can collect
application telemetry; OpenTelemetry is a vendor-neutral instrumentation
approach and protocol. They are related but not synonyms. A useful chat API
view would graph request success/latency and provider dependency latency,
then let an operator drill into one trace by correlation ID. Do not attach
raw prompt/code as span attributes.

**Self-check:** Is a high-cardinality user ID a good metric label? **Answer:**
usually no; it creates excessive time series and may expose personal data.

### T103 — Distinguish liveness from readiness

Liveness should answer whether the process is stuck and needs restart;
readiness asks whether it can currently serve traffic. A temporary provider
outage may make generation unavailable without meaning the API process itself
should be restarted.

```text
liveness: process can make progress?
readiness: this instance should receive new work?
```

**Self-check:** Should every health probe call the external AI provider?
**Answer:** not necessarily; frequent probes can add load or amplify an
outage.

### T104 — Budget one end-to-end request

Timeouts should compose into a deadline. If the whole request budget is 90
seconds, the provider call must leave time for API work and response delivery.
Propagate cancellation so disconnected callers do not leave unnecessary work.

```text
overall request: 90s
  provider call: <= 60s
  validation/serialization/response: remaining budget
```

These values are illustrative. **Self-check:** Why should provider timeout
not exceed the full request deadline? **Answer:** the caller would abandon the
request before the provider operation times out.

### T105 — Retry only when semantics allow it

A transient network error may recover, but a generation request can be
billable even if the response was lost. Before retrying, classify the failure,
limit attempts and total delay, and decide how duplicate work is handled.

```text
transient? -> within deadline? -> retry allowed and affordable? -> retry
```

**Self-check:** Is every HTTP 5xx safe to retry automatically? **Answer:**
no; provider semantics, idempotency, and cost matter.

### T106 — Isolate saturation

A bulkhead limits how many calls consume a resource; a circuit breaker avoids
repeated calls to a dependency that is failing. Both require measured
thresholds and clear user-facing failure behavior. Do not add a queue or
fallback just to hide provider outages.

```text
incoming work -> concurrency bound -> breaker -> provider
```

**Self-check:** Does a circuit breaker repair a failed provider? **Answer:**
no; it temporarily stops calls and gives the dependency time to recover.

### T107 — Cache only when privacy and freshness allow it

Caching can reduce repeated work but an AI answer may depend on user code,
identity, provider version, and prompt settings. A cache key must include all
relevant inputs, and the design must avoid serving one user's content to
another. Often a small chat product does not need answer caching.

```text
cache key = normalized input + relevant settings + access scope + version
```

**Self-check:** Is caching an answer by prompt text alone safe for private
content? **Answer:** not without a reviewed data-isolation and retention
design.

### T108 — Use a queue for deferred work, not ordinary request latency

A queue decouples a producer from a worker and is useful for work that can
finish later. It changes the user contract: the API may return a job ID and
the client must poll or receive a completion event. For an interactive chat
response, a queue adds complexity unless requests cannot reasonably remain
synchronous.

```text
API -> durable queue -> competing worker -> result store/notification
```

**Self-check:** Does a queue make a long-running task synchronous to the
user? **Answer:** no; it makes the work asynchronous and requires status/result
handling.

### T109 — Design for duplicate delivery

Message brokers commonly provide at-least-once delivery, so a worker can see
the same message more than once. An idempotency key or unique operation
constraint prevents duplicate effects. An outbox can atomically save business
data and an event record before a separate dispatcher publishes it.

```text
transaction: save conversation change + outbox event
dispatcher: publish event -> mark delivered
consumer: deduplicate by event/operation ID
```

**Self-check:** Should a consumer assume each event arrives exactly once?
**Answer:** no; design for duplicates.

### T110 — Make reliability measurable and actionable

An SLI is a measured outcome, such as successful explanations; an SLO is a
target over a time window. An alert should identify user impact and point to
a runbook with diagnosis and mitigation steps. Do not promise a target the
application cannot measure.

```text
measured SLI -> compare to SLO -> alert on actionable burn -> runbook
```

**Self-check:** Is "CPU under 80%" automatically a useful user SLO? **Answer:**
no; infrastructure metrics should connect to outcomes users experience.
