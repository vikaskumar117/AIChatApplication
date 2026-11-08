import { LearningModule, topic } from '../learning.models';

export const azureModule: LearningModule = {
  id: 'azure-cloud',
  title: 'Azure Cloud',
  description:
    'Choose Azure compute, messaging, and identity services with explicit scaling, delivery, networking, and security decisions.',
  topics: [
    topic(
      'azure-compute-services',
      'App Service vs Functions vs Container Apps',
      'Very High',
      'Azure App Service, Azure Functions, and Azure Container Apps are managed compute platforms with different workload and operations boundaries.',
      [
        'WHAT — App Service hosts web apps and APIs; Functions runs event-triggered functions; Container Apps runs containerized applications. A plan is the capacity and billing boundary that backs an app or workload.',
        'WHY — Matching the runtime model to request patterns, latency, dependencies, and operational skill prevents paying for idle capacity or inheriting unnecessary host management.',
        'HOW — App Service scales its plan and supports deployment slots; Functions binds triggers and bindings to code and scales according to its hosting plan; Container Apps deploys revisions and can scale replicas from HTTP or event metrics through KEDA-based rules. Scale-to-zero and cold-start behavior depend on the selected plan, configuration, and workload.',
      ],
      [
        'Describe traffic, duration, and runtime needs',
        'Choose platform, plan, and scale limits',
        'Deploy with identity and network boundaries',
        'Measure latency, scale, and cost',
      ],
      'For a public .NET API with steady traffic, compare App Service with a minimum-capacity Container App. Put bursty queue work in Functions when its execution and timeout model fits; test idle-to-first-request latency before accepting scale-to-zero.',
      `// Selection checklist
// Managed web API / deployment slots -> App Service
// Triggered, bounded event work -> Functions
// Existing container / sidecars / scale rules -> Container Apps
// Then set min/max capacity, identity, network access, and alerts.`,
      [
        [
          'Managed platforms offload host patching and orchestration',
          'Each platform offers a different deployment and scaling model',
        ],
        [
          'Plan, region, minimum replicas, and workload profile drive cost',
          'Scale-out does not remove cold starts, quotas, or downstream bottlenecks',
        ],
      ],
      [
        'Use App Service for conventional web workloads, Functions for event-oriented units of work, and Container Apps when container packaging or replica-level control matters.',
        'Avoid selecting solely by headline price or assuming every plan scales to zero, has identical startup behavior, or provides the same network controls.',
      ],
      [
        'What is the difference between an app and its App Service plan?',
        'Why can a scale-to-zero workload have a cold start?',
        'When does a Container App need a minimum replica?',
        'How would you compare steady-state and burst cost?',
      ],
      'A customer-facing API has low overnight traffic but a strict first-request latency SLO. Load-test cold and warm starts, compare a warm minimum replica or always-on plan with true utilization, validate outbound dependencies and private ingress, then set alerts for latency, replica limits, and spend.',
      [
        {
          label: 'App Service overview',
          url: 'https://learn.microsoft.com/azure/app-service/overview',
        },
        {
          label: 'Azure Functions hosting options',
          url: 'https://learn.microsoft.com/azure/azure-functions/functions-scale',
        },
        {
          label: 'Container Apps scale',
          url: 'https://learn.microsoft.com/azure/container-apps/scale-app',
        },
        {
          label: 'App Service networking features',
          url: 'https://learn.microsoft.com/azure/app-service/networking-features',
        },
      ],
      {
        diagram: [
          {
            label: 'Web app / API',
            detail: 'App Service plan; slots and app-level scaling fit managed web hosting.',
          },
          {
            label: 'Event handler',
            detail:
              'Functions trigger and hosting plan determine scale, duration, and startup behavior.',
          },
          {
            label: 'Container workload',
            detail: 'Container Apps revisions and scale rules control replicas and rollout.',
          },
          {
            label: 'Production controls',
            detail: 'Identity, ingress/egress, min/max capacity, telemetry, and budget guardrails.',
          },
        ],
        diagramNote:
          'Platform choice is a workload decision; plan, network, and scale configuration determine its real production behavior.',
        exampleSteps: [
          'Measure request rate, burst, duration, and first-request SLO.',
          'Inventory runtime, container, sidecar, and private-network requirements.',
          'Compare an equivalent load test on candidate plans, including idle and peak cost.',
          'Deploy with health checks, bounded scale, managed identity, and rollback path.',
        ],
        keyTakeaways: [
          'The service name does not determine the bill; the selected plan and capacity do.',
          'Scale rules need safe maximums and downstream capacity.',
          'Private ingress and outbound VNet access are separate networking decisions.',
        ],
        commonMistakes: [
          'Assuming scale-to-zero is free of cold starts or available on every plan.',
          'Comparing prices without including minimum capacity, logs, network egress, and dependent services.',
          'Allowing autoscale to exceed database connection or API quotas.',
        ],
        bestPractices: [
          'Load-test startup and scale behavior against the actual latency objective.',
          'Use managed identity, health probes, deployment slots or revisions, and bounded autoscale.',
          'Monitor cost per request alongside latency, errors, and replica count.',
        ],
        summary:
          'Choose a hosting model from workload shape, then prove its scale, networking, latency, and cost under representative load.',
      },
    ),
    topic(
      'azure-messaging-services',
      'Service Bus vs Event Hubs vs Event Grid',
      'Very High',
      'Azure Service Bus, Event Hubs, and Event Grid support distinct messaging semantics: durable work, retained event streams, and event notification routing.',
      [
        'WHAT — Service Bus is a broker for commands and enterprise messaging; Event Hubs is a partitioned event-stream ingestion service; Event Grid routes event notifications to subscribers.',
        'WHY — Delivery, ordering, replay, and fan-out differ. Selecting the service by its required semantics avoids data loss or costly application-level reimplementation.',
        'HOW — Service Bus queues use competing consumers and PeekLock settlement; topics fan out to subscriptions. Event Hubs consumers read partitions and checkpoint offsets. Event Grid pushes events to handlers and retries delivery. All can redeliver; none makes arbitrary downstream side effects exactly-once.',
      ],
      [
        'Define command, stream, or notification',
        'Select broker and partition / subscription shape',
        'Authenticate producers and consumers',
        'Handle duplicates, failures, and replay',
      ],
      'Use Service Bus for an order-fulfillment command that needs settlement and a dead-letter queue, Event Hubs for replayable clickstream ingestion, and Event Grid to notify a handler that a resource changed.',
      `// Durable command -> Service Bus PeekLock
// High-volume retained stream -> Event Hubs partition + checkpoint
// Discrete state-change notification -> Event Grid subscription
// Consumer: validate, process idempotently, then settle/checkpoint.`,
      [
        [
          'Queues and subscriptions decouple producers from consumers',
          'Retention and replay support recovery and new stream readers',
        ],
        [
          'At-least-once delivery means duplicates must be expected',
          'Ordering, retry, retention, throughput, and cost differ by service',
        ],
      ],
      [
        'Choose by required ordering scope, replay horizon, throughput, fan-out, and consumer ownership.',
        'Avoid assuming a successful publish means a business transaction completed, or assuming a broker prevents duplicate side effects.',
      ],
      [
        'What does PeekLock protect, and when is a message completed?',
        'How do Event Hubs partitions constrain ordering and parallelism?',
        'What delivery and ordering expectations should an Event Grid handler implement?',
        'How do you make a consumer safe to retry?',
      ],
      'A payment workflow receives a redelivered command after the worker crashes between charging and completing its message. Persist an idempotency key with the business operation, use bounded retries and a dead-letter recovery process, and reconcile uncertain external outcomes instead of charging again blindly.',
      [
        {
          label: 'Service Bus queues, topics, and subscriptions',
          url: 'https://learn.microsoft.com/azure/service-bus-messaging/service-bus-queues-topics-subscriptions',
        },
        {
          label: 'Service Bus message transfers, locks, and settlement',
          url: 'https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement',
        },
        {
          label: 'Event Hubs features and concepts',
          url: 'https://learn.microsoft.com/azure/event-hubs/event-hubs-features',
        },
        {
          label: 'Event Grid delivery and retry',
          url: 'https://learn.microsoft.com/azure/event-grid/delivery-and-retry',
        },
      ],
      {
        diagram: [
          {
            label: 'Command / work item',
            detail: 'Service Bus: lock, settle, defer, or dead-letter a durable message.',
          },
          {
            label: 'Telemetry stream',
            detail: 'Event Hubs: partitioned ordered records, retention, consumer offsets, replay.',
          },
          {
            label: 'State-change event',
            detail: 'Event Grid: filtered push delivery to one or more handlers.',
          },
          {
            label: 'Idempotent consumer',
            detail:
              'Expect retries and duplicates; commit business effects before settlement/checkpoint.',
          },
        ],
        diagramNote:
          'Service Bus PeekLock is at-least-once, Event Hubs checkpoints can replay records, and Event Grid retries can redeliver; application effects still need idempotency.',
        exampleSteps: [
          'Write down ordering scope, replay needs, expected throughput, and subscriber count.',
          'Pick a broker and configure retention, sessions/partitions, retry, and dead-letter behavior.',
          'Use managed identity and least-privilege sender/receiver roles; restrict network paths where supported.',
          'Test crash-before-commit and crash-after-commit cases; measure backlog, throttles, and recovery time.',
        ],
        keyTakeaways: [
          'At-least-once is the practical contract to design for; duplicates are normal recovery behavior.',
          'Event Hubs orders within a partition, not globally across the stream.',
          'A dead-letter queue or failed-event destination is an operational workflow, not automatic resolution.',
        ],
        commonMistakes: [
          'Calling a broker exactly-once and omitting idempotency for database or payment side effects.',
          'Checkpointing an Event Hubs offset before the corresponding work is durably complete.',
          'Increasing retries indefinitely, creating poison-message loops or retry storms.',
        ],
        bestPractices: [
          'Use stable business idempotency keys and durable deduplication for non-repeatable effects.',
          'Set bounded exponential backoff with jitter, dead-letter thresholds, and an owned replay procedure.',
          'Monitor oldest message age, partition lag, delivery failures, and dead-letter growth.',
        ],
        summary:
          'Select the broker by message semantics and build consumers for redelivery, bounded recovery, and explicit replay.',
      },
    ),
    topic(
      'azure-key-vault-managed-identity',
      'Key Vault & Managed Identity',
      'High',
      'Managed identity supplies an Azure workload identity; Key Vault controls access to stored secrets, keys, and certificates.',
      [
        'WHAT — A managed identity is a Microsoft Entra identity provisioned for an Azure resource. Key Vault is a protected service for secrets, cryptographic keys, and certificates.',
        'WHY — Workload identity removes application-managed client secrets, while centralized authorization, audit, and rotation reduce exposure and simplify response.',
        'HOW — The workload obtains a short-lived Entra token through the Azure identity platform; Key Vault validates it and authorizes the operation through its configured authorization model, commonly Azure RBAC. A private endpoint can provide private network access, but private DNS, routing, firewall rules, and identity authorization must all be correct.',
      ],
      [
        'Enable system- or user-assigned identity',
        'Grant only required Key Vault data action',
        'Resolve and reach the vault endpoint',
        'Fetch, cache safely, rotate, and audit',
      ],
      'An App Service reads a database credential using its system-assigned identity. Its role permits only the needed secret read in the chosen vault; private DNS and outbound routing are tested from the app environment.',
      `var credential = new DefaultAzureCredential();
var client = new SecretClient(new Uri(vaultUri), credential);
var response = await client.GetSecretAsync("DatabasePassword", cancellationToken);
var password = response.Value.Value;`,
      [
        [
          'Avoids storing a long-lived application credential',
          'Centralizes access control, versioning, and audit events',
        ],
        [
          'Mis-scoped identity or role still grants excessive access',
          'Vault requests add latency, quota, availability, and transaction cost',
        ],
      ],
      [
        'Use separate identities and vault scopes for meaningful workload boundaries; grant the minimum data-plane role and restrict network access where feasible.',
        'Avoid broad subscription-owner permissions, embedding secrets in source/configuration, or fetching a secret on every request.',
      ],
      [
        'How does a managed identity obtain a Key Vault token?',
        'When is a user-assigned identity useful across resource lifecycles?',
        'Why can a private endpoint still fail to provide access?',
        'How should a rotated secret reach existing connections?',
      ],
      'A service suddenly fails after a vault private endpoint is added. Verify identity token acquisition, data-plane role scope, private DNS resolution, route/firewall policy, and vault throttling separately; use bounded retry for transient failures, alert on access errors, and rotate credentials with an overlap period.',
      [
        {
          label: 'Managed identities overview',
          url: 'https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview',
        },
        {
          label: 'Authenticate to Key Vault with a managed identity',
          url: 'https://learn.microsoft.com/azure/key-vault/general/tutorial-net-create-vault-azure-web-app',
        },
        {
          label: 'Key Vault network security',
          url: 'https://learn.microsoft.com/azure/key-vault/general/network-security',
        },
        {
          label: 'Key Vault throttling guidance',
          url: 'https://learn.microsoft.com/azure/key-vault/general/overview-throttling',
        },
      ],
      {
        diagram: [
          {
            label: 'Azure workload',
            detail:
              'System-assigned identity follows the resource lifecycle; user-assigned identity is independently managed.',
          },
          {
            label: 'Entra token',
            detail:
              'DefaultAzureCredential requests a short-lived token; no app-held client secret is needed.',
          },
          {
            label: 'Network path',
            detail:
              'Public endpoint restrictions or private endpoint plus private DNS and valid routes.',
          },
          {
            label: 'Key Vault authorization',
            detail:
              'RBAC or configured access policy grants specific secret, key, or certificate operations.',
          },
          {
            label: 'Consumer and audit',
            detail:
              'Cache within rotation bounds, handle throttles, and monitor access without logging values.',
          },
        ],
        diagramNote:
          'Successful access requires identity, authorization, and network reachability; a private endpoint does not itself grant permission.',
        exampleSteps: [
          'Enable managed identity on the app and choose its lifecycle boundary.',
          'Assign a narrowly scoped Key Vault data-plane role.',
          'Configure firewall or private endpoint, private DNS, and outbound network routes.',
          'Use the SDK credential chain, cache appropriately, and test rotation and throttling behavior.',
        ],
        keyTakeaways: [
          'Authentication proves the workload identity; authorization decides what it may do.',
          'Private networking and RBAC are independent controls that must both work.',
          'Key Vault is not a high-throughput per-request configuration database.',
        ],
        commonMistakes: [
          'Granting broad vault access to make deployment succeed instead of diagnosing the exact missing data action.',
          'Adding a private endpoint without validating DNS from the workload subnet.',
          'Logging secret values or treating every failed request as safe to retry indefinitely.',
        ],
        bestPractices: [
          'Prefer managed identity and least-privilege data roles; separate identities across trust boundaries.',
          'Use private networking where required and verify DNS, egress, and role assignments in deployment tests.',
          'Use bounded exponential retry for transient throttling, cache secrets with an intentional rotation window, and alert on access anomalies.',
        ],
        summary:
          'Secure Key Vault access by proving identity, least-privilege authorization, private network reachability, and rotation behavior together.',
      },
    ),
    topic(
      'azure-logic-apps',
      'Azure Logic Apps & Workflow Automation',
      'Very High',
      'Logic Apps orchestrates connector-based workflows across services; it is best for integration and business processes, not as a substitute for every application service.',
      [
        'WHAT — A Logic App is a managed workflow made of a trigger and actions. Connectors integrate services such as email, Service Bus, storage, and line-of-business systems.',
        'WHY — It reduces custom glue code for approvals, notifications, scheduled integrations, and cross-system workflows while providing run history and managed connectors.',
        'HOW — A trigger starts a workflow; actions execute sequentially or in controlled branches/parallel scopes. Configure authentication, retry, timeout, concurrency, and failure handling explicitly. Consumption and Standard have different hosting, networking, state, and pricing characteristics, so compare the required behavior rather than choosing by name.',
      ],
      [
        'Select an event or schedule trigger',
        'Validate and normalize the incoming payload',
        'Run connector actions and business branches',
        'Retry transient failures; route terminal failures for repair',
        'Track run state, latency, and cost',
      ],
      'When a new vendor invoice arrives, a workflow validates metadata, stores the document, requests approval, and publishes an approved-invoice message to Service Bus. The accounting service owns financial rules and idempotent posting.',
      `// Workflow shape (not a complete deployment template):
Trigger: Blob created
  -> Validate metadata and size
  -> Store document reference
  -> Request approval
  -> If approved: send Service Bus command
  -> If rejected/failed: record reason and alert

// Use managed identity where supported; keep connector credentials out of workflow inputs.`,
      [
        ['Managed connectors and run history speed up integration delivery', 'Workflow steps and failures are visible to operators'],
        ['Connector limits, retries, and per-action cost can surprise at scale', 'Complex domain logic and long-running high-throughput compute can become difficult to maintain in a visual workflow'],
      ],
      [
        'Use for integration orchestration, approvals, scheduled jobs, and low-code workflows with clear ownership and bounded throughput.',
        'Avoid placing core domain invariants, latency-critical request logic, or unbounded high-volume processing solely in a connector workflow.',
      ],
      [
        'What is the difference between a trigger and an action?',
        'How do Consumption and Standard affect hosting and networking decisions?',
        'Why must actions be idempotent if retries are enabled?',
        'When should a workflow call a service instead of containing business logic?',
      ],
      'An approval workflow times out after a downstream system processes an action but before the workflow records success. Use a stable business operation ID, make the receiving API idempotent, inspect run history, and design a replay/compensation path before enabling automatic retries.',
      [
        { label: 'Azure Logic Apps overview', url: 'https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-overview' },
        { label: 'Logic Apps Standard and Consumption', url: 'https://learn.microsoft.com/en-us/azure/logic-apps/single-tenant-overview-compare' },
        { label: 'Logic Apps security and authentication', url: 'https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-securing-a-logic-app' },
      ],
      {
        diagram: [
          { label: 'Trigger', detail: 'Schedule, HTTP request, or connector event starts a run.' },
          { label: 'Validate', detail: 'Check schema, required fields, and safe size limits.' },
          { label: 'Orchestrate', detail: 'Actions call systems, branch, wait for approval, or fan out bounded work.' },
          { label: 'Recover', detail: 'Retry transient faults; route permanent failures to a tracked remediation path.' },
          { label: 'Observe', detail: 'Run history, alerts, and cost metrics support operations.' },
        ],
        diagramNote: 'A workflow may retry or replay actions. Use idempotent downstream operations and avoid treating workflow completion as a cross-system transaction.',
        exampleSteps: [
          'A blob event starts the workflow with a document reference.',
          'The workflow validates metadata and stores an approval request.',
          'On approval, it sends a stable command ID to Service Bus.',
          'The accounting consumer deduplicates the command before posting.',
        ],
        keyTakeaways: [
          'Triggers start runs; actions perform work.',
          'The receiving service should own business invariants and idempotency.',
          'Choose hosting, state, networking, and billing model from workflow needs.',
        ],
        commonMistakes: [
          'Enabling retries on a non-idempotent action and creating duplicate side effects.',
          'Putting secrets in workflow definitions, inputs, or run-history outputs.',
          'Treating a visual workflow as unlimited compute or a distributed transaction.',
        ],
        bestPractices: [
          'Use managed identity, secure inputs/outputs, and least-privilege connector permissions.',
          'Set retry, timeout, concurrency, retention, and dead-letter/remediation behavior deliberately.',
          'Monitor failed runs, action latency, throttles, and cost; test replay and duplicate delivery.',
        ],
        summary: 'Logic Apps is effective integration orchestration when authentication, retries, idempotency, ownership, and operations are designed explicitly.',
      },
    ),
    topic(
      'azure-storage-services',
      'Azure Storage: Blob, Queue, and Files',
      'High',
      'Azure Storage provides distinct primitives: Blob for object data, Queue Storage for simple messages, and Azure Files for managed file shares.',
      [
        'WHAT — Blob Storage stores unstructured objects; Queue Storage provides a simple asynchronous message queue; Azure Files exposes managed SMB/NFS file shares.',
        'WHY — Choosing storage by access pattern avoids forcing a filesystem, database, or enterprise broker model onto the wrong workload.',
        'HOW — Select account redundancy, access tier, lifecycle, authorization, network access, and retention. Use Entra ID and managed identity where supported; use SAS only with narrow scope and expiry. Queue consumers must handle visibility timeouts, poison messages, duplicate delivery, and idempotent processing.',
      ],
      [
        'Classify object, message, or shared-file data',
        'Choose redundancy, tier, lifecycle, and access model',
        'Grant least privilege and restrict network paths',
        'Handle retry, retention, backup, and recovery',
      ],
      'A document service stores file bytes in Blob Storage and keeps searchable metadata in Azure SQL. A Queue Storage message carries the blob reference for thumbnail generation; the worker is idempotent and can retry safely.',
      `// Prefer workload identity instead of a connection string secret.
var credential = new DefaultAzureCredential();
var blobService = new BlobServiceClient(
    new Uri(storageAccountUri), credential);
var container = blobService.GetBlobContainerClient("documents");

// Store metadata separately; avoid embedding authorization decisions in a public blob URL.`,
      [
        ['Managed durability, tiers, and scaling reduce storage operations', 'Lifecycle rules can lower long-term object cost'],
        ['Redundancy and access tier affect cost and recovery characteristics', 'A storage account key or overly broad SAS can expose many objects'],
      ],
      [
        'Use Blob for durable object content, Queue Storage for simple decoupled work, and Files when shared filesystem semantics are required.',
        'Avoid treating Queue Storage as a full-featured enterprise broker or exposing account keys and public blobs by default.',
      ],
      [
        'When would you choose Blob over Azure Files?',
        'What must a queue consumer do when a message is delivered again?',
        'How do access tiers and redundancy affect cost and recovery?',
        'Why prefer managed identity to an account key?',
      ],
      'A public upload endpoint receives large files and triggers repeated processing. Enforce size/type limits, quarantine and scan before use, store privately, enqueue only a stable blob reference, use a managed identity, and monitor queue age and storage egress.',
      [
        { label: 'Azure Storage introduction', url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-introduction' },
        { label: 'Authorize Blob data access with Microsoft Entra ID', url: 'https://learn.microsoft.com/en-us/azure/storage/blobs/authorize-access-azure-active-directory' },
      ],
      {
        diagram: [
          { label: 'Document bytes', detail: 'Blob Storage holds private, versioned objects with lifecycle rules.' },
          { label: 'Metadata', detail: 'A database stores owner, status, and business relationships.' },
          { label: 'Queue reference', detail: 'A small message carries the blob ID, not the entire file.' },
          { label: 'Worker', detail: 'An idempotent processor scans and transforms the object.' },
          { label: 'Lifecycle', detail: 'Retention, tiering, deletion, and recovery follow policy.' },
        ],
        diagramNote: 'Keep authorization metadata authoritative in the application; a blob URL or queue message is not proof that a caller may access the data.',
        exampleSteps: [
          'Upload to a private container and validate size and allowed content.',
          'Persist document ownership and processing state.',
          'Enqueue a stable document ID; worker loads the blob under managed identity.',
          'Deduplicate processing, record outcome, and apply retention rules.',
        ],
        keyTakeaways: [
          'Pick the primitive by access semantics: object, message, or shared filesystem.',
          'Store references in messages rather than large payloads.',
          'Redundancy, tier, retention, and access controls are architecture decisions.',
        ],
        commonMistakes: [
          'Making a container public to simplify downloads.',
          'Using long-lived account keys or broad, non-expiring SAS tokens.',
          'Assuming a storage queue provides ordering, transactions, or dead-letter features like Service Bus.',
        ],
        bestPractices: [
          'Use managed identity, private access, and narrow data-plane roles.',
          'Apply lifecycle policies, versioning/soft delete, and recovery tests based on business RPO/RTO.',
          'Validate uploads, scan untrusted content, and make processors safe for retries.',
        ],
        summary: 'Use each Azure Storage primitive for its intended data shape and design identity, lifecycle, recovery, and duplicate handling.',
      },
    ),
    topic(
      'azure-api-management',
      'Azure API Management & Gateway Policies',
      'High',
      'API Management provides a managed API gateway and developer-facing API lifecycle capabilities; policies apply controlled cross-cutting behavior at the gateway.',
      [
        'WHAT — Azure API Management (APIM) is a managed gateway and API management platform for publishing, protecting, transforming, and observing APIs.',
        'WHY — A gateway centralizes consumer-facing controls such as authentication validation, quotas, routing, versioning, and request/response transformation without duplicating all of them in every client.',
        'HOW — A request passes through gateway policy scopes and is forwarded to a backend. Policies can authenticate, rate-limit, rewrite, or transform, but the backend must still enforce business authorization and data ownership. Network mode, tier, region, and private connectivity determine the real trust boundary.',
      ],
      [
        'Publish an API contract and product',
        'Authenticate callers and apply edge policies',
        'Route to a protected backend',
        'Backend enforces resource authorization',
        'Measure traffic, errors, latency, and quota usage',
      ],
      'APIM validates caller tokens, applies a per-product quota, and routes requests to an internal Orders API. The Orders API independently verifies order ownership and tenant boundaries.',
      `<!-- Illustrative APIM policy fragment; configure values and scope per environment. -->
<inbound>
  <base />
  <rate-limit-by-key calls="60" renewal-period="60"
      counter-key="@(context.Subscription?.Id ?? context.Request.IpAddress)" />
  <set-header name="X-Request-Id" exists-action="override">
    <value>@(context.RequestId.ToString())</value>
  </set-header>
</inbound>`,
      [
        ['Consistent gateway policies and API publication controls', 'Can protect or hide backend endpoints behind a managed boundary'],
        ['Gateway policies and tier/network features have limits and cost', 'Misconfigured transformations can create divergent API behavior or false authorization confidence'],
      ],
      [
        'Use APIM for governed external APIs, shared gateway policies, consumer onboarding, and controlled routing.',
        'Avoid putting all domain authorization in gateway policies or assuming an API key alone proves end-user identity.',
      ],
      [
        'What belongs at a gateway versus in the backend?',
        'Why does APIM not replace object-level authorization?',
        'How do quota/rate policies differ from backend capacity protection?',
        'What must be considered when APIM reaches a private backend?',
      ],
      'A new gateway policy accidentally trusts a client-supplied tenant header. Remove that trust, derive identity from validated credentials, keep object authorization in the backend, test policy inheritance, and verify private backend reachability and quota behavior.',
      [
        { label: 'Azure API Management overview', url: 'https://learn.microsoft.com/en-us/azure/api-management/api-management-key-concepts' },
        { label: 'APIM policy reference', url: 'https://learn.microsoft.com/en-us/azure/api-management/api-management-policies' },
      ],
      {
        diagram: [
          { label: 'Consumer', detail: 'Uses a documented API and an approved identity/credential.' },
          { label: 'APIM gateway', detail: 'Validates configured credentials, applies quotas, and routes traffic.' },
          { label: 'Protected backend', detail: 'Authenticates/authorizes the operation and resource independently.' },
          { label: 'Telemetry', detail: 'Correlates gateway and backend metrics without logging secrets.' },
        ],
        diagramNote: 'Gateway controls protect the API boundary; they do not prove that a caller may access a particular business record.',
        exampleSteps: [
          'Publish an API version with a clear contract and product.',
          'Apply token validation and route-level rate limits at APIM.',
          'Keep the backend private where appropriate and authenticate gateway-to-backend traffic.',
          'Enforce tenant and resource permissions in the backend; correlate gateway and service telemetry.',
        ],
        keyTakeaways: [
          'APIM is an API gateway and management surface, not a complete application security model.',
          'Do not trust caller-supplied identity headers.',
          'Network mode, SKU, region, and policies shape operational behavior and cost.',
        ],
        commonMistakes: [
          'Assuming a subscription key is user authentication.',
          'Removing backend authorization after moving checks to a gateway.',
          'Ignoring policy inheritance, rate-limit scope, private DNS, and backend connectivity.',
        ],
        bestPractices: [
          'Use OAuth/OIDC tokens for user or service identity and keep backend authorization authoritative.',
          'Version contracts deliberately and test policies at each scope.',
          'Monitor rejected requests, throttles, latency, backend errors, and gateway capacity.',
        ],
        summary: 'APIM centralizes API-edge governance; preserve independent backend authorization and validate the full network and policy path.',
      },
    ),
    topic(
      'azure-monitor-resilience-cost',
      'Azure Monitoring, Availability & Cost',
      'High',
      'Production Azure architecture connects service health and application telemetry to measurable reliability, recovery, and cost objectives.',
      [
        'WHAT — Azure Monitor collects metrics, logs, traces, and platform signals; Application Insights provides application telemetry. Availability and disaster recovery define how services continue or recover after failures.',
        'WHY — A deployed service is not production-ready without detection, actionable alerts, tested recovery, and an understood cost envelope.',
        'HOW — Define SLIs/SLOs, instrument correlated requests, create alerts for user impact and saturation, and test backup/restore and regional recovery. Set budgets, tags, autoscale bounds, and cost-per-transaction visibility; higher redundancy and replicas improve resilience but increase cost and operational complexity.',
      ],
      [
        'Set availability, latency, and recovery objectives',
        'Emit correlated metrics, traces, and structured logs',
        'Alert on user impact and resource saturation',
        'Test backup, restore, failover, and rollback',
        'Review cost, capacity, and reliability trade-offs',
      ],
      'An order API has an availability SLO and a defined recovery point. Application Insights traces a request through the API and database, alerts on error-budget burn, while scheduled restore exercises verify backups and Azure Cost Management highlights cost per successful order.',
      `// Example Kusto query: failed requests by operation over the last hour
requests
| where timestamp > ago(1h)
| summarize total=count(),
            failures=countif(success == false)
  by operation_Name
| extend failureRate = todouble(failures) / total
| order by failureRate desc`,
      [
        ['Correlated telemetry shortens detection and diagnosis', 'Explicit RPO/RTO and budgets make trade-offs measurable'],
        ['Telemetry retention, replicas, backups, and cross-region traffic cost money', 'Alerts without ownership or tested runbooks create noise rather than resilience'],
      ],
      [
        'Use SLO-driven monitoring, owned alerts, tested recovery, and cost guardrails for production workloads.',
        'Avoid equating a green health probe with end-to-end availability or assuming backups are recoverable without restore tests.',
      ],
      [
        'What is the difference between a health check and an SLO?',
        'How do RPO and RTO influence architecture?',
        'Why must alerts have an owner and runbook?',
        'How can autoscaling increase both resilience and cost?',
      ],
      'A regional outage causes the application to fail over, but stale data and unexpectedly high egress costs follow. Revisit consistency and RPO, test failback, alert on replication lag and spend, and document who owns recovery decisions.',
      [
        { label: 'Azure Monitor overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/overview' },
        { label: 'Application Insights overview', url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview' },
        { label: 'Azure Well-Architected reliability', url: 'https://learn.microsoft.com/en-us/azure/well-architected/reliability/' },
        { label: 'Azure Cost Management', url: 'https://learn.microsoft.com/en-us/azure/cost-management-billing/cost-management-billing-overview' },
      ],
      {
        diagram: [
          { label: 'Application signals', detail: 'Requests, dependencies, exceptions, traces, and business outcomes.' },
          { label: 'Azure Monitor', detail: 'Correlates telemetry, platform metrics, logs, and alerts.' },
          { label: 'Operational response', detail: 'Owned alert, runbook, incident decision, and recovery action.' },
          { label: 'Resilience test', detail: 'Restore, failover, failback, and data-integrity verification.' },
          { label: 'Cost feedback', detail: 'Budgets and unit-cost metrics inform capacity and design trade-offs.' },
        ],
        diagramNote: 'Reliability is a tested operating capability; monitoring detects symptoms, while recovery objectives and exercises prove recoverability.',
        exampleSteps: [
          'Set user-facing latency/availability objectives and RPO/RTO.',
          'Instrument APIs and dependencies with correlated telemetry.',
          'Alert on SLO burn, queue age, dependency saturation, and backup failures.',
          'Run restore/failover exercises and compare actual recovery to objectives.',
          'Review cost per successful workload and adjust bounded scaling.',
        ],
        keyTakeaways: [
          'Health probes, SLIs/SLOs, and recovery objectives answer different questions.',
          'A backup is useful only when restore and integrity are tested.',
          'Cost, reliability, and performance are connected design constraints.',
        ],
        commonMistakes: [
          'Alerting on every metric threshold without user-impact context or ownership.',
          'Assuming multi-region deployment automatically provides safe failover.',
          'Scaling without maximums, budget alerts, or downstream capacity checks.',
        ],
        bestPractices: [
          'Correlate traces, metrics, and structured logs with safe redaction.',
          'Attach runbooks and owners to actionable alerts; review noisy alerts.',
          'Test restore/failover regularly and track cost per meaningful business transaction.',
        ],
        summary: 'Measure user outcomes, exercise recovery, and include cost guardrails so Azure reliability claims are operationally verifiable.',
      },
    ),
  ],
};
