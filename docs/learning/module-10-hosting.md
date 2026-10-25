# Module 10 — Azure, Hosting, and Cloud Delivery

**Workbook alignment:** Days 17–18 (App Service, deployment slots, Azure SQL,
Storage, Key Vault, and managed identity). Related tracker topics: T091–T100.

> **Status:** No Azure resources or deployment workflows are provisioned. These
> are decision lessons for key109, not a recommendation to deploy before the
> product and budget are ready.

## T091 — Azure App Service and hosting-plan trade-offs

- **What:** App Service hosts web applications without requiring the team to
  manage the underlying operating system.
- **Why:** It can reduce server operations for a small ASP.NET API.
- **When:** Compare platform support, required scale, network access, price,
  and operational skills before choosing it. Azure Functions fit event-driven
  or short-lived serverless work better than a continuously available chat API.
- **Limits:** Plans have quotas and cost; a local Ollama model may not be
  available or economical in a managed web plan.
- **Diagram:** `browser -> hosted API -> provider/database`
- **Project example (planned — key109):** deploy API only after its chosen AI
  provider is reachable through an approved network and budget.
- **Reference:** [Azure App Service overview](https://learn.microsoft.com/azure/app-service/overview)

## T092 — Azure Static Web Apps and static Angular deployment

- **What:** Static Web Apps serves frontend assets and can integrate with
  serverless APIs.
- **Why:** An Angular SPA can be hosted separately from the ASP.NET API.
- **When:** Choose it when the client is static and its API/network/auth
  integration fits the product.
- **Limits:** Separate origins require CORS and environment-aware API URLs;
  server-side secrets must never be embedded in SPA assets.
- **Diagram:** `browser -> static Angular host -> HTTPS API`
- **Project example (planned — key109):** select frontend hosting after key103
  establishes the Angular build and key104 defines identity.
- **Reference:** [Azure Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/overview)

## T093 — IIS, reverse proxy, TLS, and app-pool identity

- **What:** IIS can host or proxy ASP.NET Core; TLS protects transport, and
  the application pool identity controls local resource access.
- **Why:** Windows hosting may be a deployment requirement.
- **When:** Configure the ASP.NET Core hosting bundle, HTTPS, forwarded headers,
  and least-privilege file/resource permissions.
- **Limits:** A reverse proxy must be configured correctly; trusting arbitrary
  forwarded headers can spoof request metadata.
- **Diagram:** `client HTTPS -> IIS reverse proxy -> Kestrel application`
- **Project exercise (non-production):** compare the IIS reverse-proxy flow
  with the planned managed-host flow. Do not add IIS deployment files unless
  Windows Server is selected as a real target.
- **Reference:** [Host ASP.NET Core on IIS](https://learn.microsoft.com/aspnet/core/host-and-deploy/iis/)

## T094 — Azure SQL, Storage, networking, backups, and cost

- **What:** Azure SQL is a managed relational database; Azure Storage holds
  object/blob data; networking and backup settings control access and recovery.
- **Why:** Conversation history requires durable storage with ownership and
  retention guarantees.
- **When:** Select a tier and network path based on workload, recovery point,
  availability, and budget.
- **Limits:** Managed service does not eliminate schema, query, backup-restore,
  or egress costs.
- **Diagram:** `API managed identity -> private/network-restricted SQL -> backup`
- **Project example (planned — key109):** choose hosting only after key105
  selects the database and verifies restore behavior. Blob storage is only
  needed if a later feature stores uploaded documents or exports.
- **Reference:** [Azure SQL documentation](https://learn.microsoft.com/azure/azure-sql/)

## T095 — Key Vault, managed identity, and least privilege

- **What:** Key Vault stores secrets; managed identity lets Azure resources
  authenticate without a long-lived credential.
- **Why:** Hosting credentials should not be committed or copied into app
  configuration.
- **When:** Grant only the application identity the specific secret/resource
  access it needs.
- **Limits:** Identity permissions can still be overbroad; rotation and
  emergency revocation need an operational process.
- **Diagram:** `App Service identity -> access policy/RBAC -> Key Vault secret`
- **Project example (planned — key109):** use managed identity for Azure
  resources where supported; provider credentials may need a separate secret
  strategy.
- **Reference:** [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/general/overview)

## T096 — Containers and environment configuration

- **What:** A container packages an application and runtime dependencies into
  a repeatable image.
- **Why:** It can reduce environment drift between development and deployment.
- **When:** Use containers when deployment/runtime portability or orchestration
  needs justify the image and operations work.
- **Limits:** Containers do not automatically make an app secure, stateless, or
  cheap; persist data outside disposable container filesystems.
- **Diagram:** `source -> image -> configured container -> external data/services`
- **Project example (planned/optional — key109):** no Dockerfile exists. Add
  one only if the selected host benefits from container delivery.
- **Reference:** [Containerize .NET applications](https://learn.microsoft.com/dotnet/core/docker/)

## T097 — Infrastructure as code

- **What:** Infrastructure as code describes cloud resources in versioned,
  repeatable definitions.
- **Why:** Environments should be reviewable and reproducible rather than
  manually clicked into existence.
- **When:** Use Bicep or Terraform when the project provisions real resources.
- **Limits:** IaC can make destructive changes quickly; review plans, protect
  state/secrets, and separate environment parameters.
- **Diagram:** `reviewed template + parameters -> deployment plan -> resources`
- **Project example (planned — key109):** select one IaC tool only after the
  hosting topology is chosen; no cloud templates exist now.
- **Reference:** [Bicep documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)

## T098 — CI/CD environments, approvals, rollback, and migrations

- **What:** CI/CD automates validated builds and controlled deployment between
  environments.
- **Why:** Releases need repeatable promotion, visibility, and recovery.
- **When:** Deploy immutable artifacts and define approval/rollback strategy
  before production.
- **Limits:** Rolling back code may not roll back database changes; migrations
  should remain compatible with both old and new code during rollout.
- **Diagram:** `build once -> staging -> smoke checks -> approval -> production`
- **Project example (planned — key107/key109):** no deployment pipeline exists;
  add it after app and database deployment requirements are concrete.
- **Reference:** [Azure deployment slots](https://learn.microsoft.com/azure/app-service/deploy-staging-slots)

## T099 — Free tiers, quotas, budgets, and total cost of ownership

- **What:** Total cost includes compute, database, storage, network, monitoring,
  model usage, and operator time.
- **Why:** “Free” plans may impose limits or become costly with real usage.
- **When:** Estimate cost for the expected demo volume and configure alerts and
  teardown steps.
- **Limits:** Prices and quotas change by region and date; do not promise zero
  cost without checking current terms.
- **Diagram:** `monthly cost = API + SQL + AI tokens + network + operations`
- **Project example (planned — key109):** compare local Ollama and hosted
  inference cost/privacy and set a teardown/budget plan before cloud
  provisioning.
- **Reference:** [Azure pricing calculator](https://azure.microsoft.com/pricing/calculator/)

## T100 — Availability, scaling, disaster recovery, and restore tests

- **What:** Availability and disaster recovery describe how the service
  continues and recovers after faults.
- **Why:** Persisted chats and identity state need an understood recovery path.
- **When:** Set recovery objectives, scale bottlenecks, and test restore from
  backup before relying on it.
- **Limits:** Replication and backups add cost; a backup not restored in a test
  is an assumption, not proven recovery.
- **Diagram:** `failure -> detect -> failover/restore -> verify data + service`
- **Project example (planned — key109/key110):** define RPO/RTO and restore
  checks after SQL and hosting choices are made.
- **Reference:** [Azure reliability](https://learn.microsoft.com/azure/reliability/)

## Workbook implementation connection

Cloud hosting is not added just to check off Azure topics. The learning
sequence first produces a stable API, identity boundary, and database; then a
hosting choice is justified by privacy, network, cost, and recovery needs.

## Worked examples and practice

These are decision exercises. They are not deployment instructions for
resources that have not been selected or provisioned.

### T091 — Choose a host from constraints

Start with runtime and network requirements. In this project, a hosted API
must reach the selected model endpoint securely; a managed host that cannot
reach a locally running Ollama instance is not a valid fit merely because it
is easy to deploy.

```text
requirements -> provider reachability + privacy + scale + budget -> host
```

**Self-check:** Should hosting be picked before knowing where inference runs?
**Answer:** not if inference connectivity and data policy constrain the host.

#### App Service settings and deployment slots

App Service **app settings** are environment-specific values exposed to the
application as configuration; secret values should come from an approved
secret store or managed identity path, not a committed file. A deployment
slot is a separately addressable deployment target (for example, staging)
that can be warmed and smoke-tested before a controlled swap.

```text
build once -> staging slot + staging settings -> smoke check
          -> swap with production slot -> monitor / swap back if needed
```

A slot swap does not make a database migration backward-compatible. Keep
schemas compatible with both old and new code during deployment, and
understand which settings are slot-sticky.

### T092 — Keep static frontend and API responsibilities separate

An Angular build is static assets; the API remains the trusted server-side
boundary. The frontend may know the API's public URL, but must not contain
provider credentials or database secrets. If frontend and API have different
origins, explicitly configure the allowed origin.

```text
browser -> static Angular files
browser -> HTTPS API (public URL, authenticated request when implemented)
```

**Self-check:** Is a frontend build variable secret? **Answer:** no; users can
inspect the delivered bundle.

### T093 — Understand reverse proxy trust

With IIS in front of Kestrel, the proxy terminates or forwards HTTPS and
passes request metadata. The app must trust forwarded headers only from known
proxies; otherwise a caller might spoof scheme or client-address information.
Give the app-pool identity only the file and network permissions it needs.

```text
client HTTPS -> trusted IIS proxy -> Kestrel -> application
```

**Self-check:** Should an app trust forwarded headers from any source?
**Answer:** no; trust only configured proxy boundaries.

### T094 — Plan relational and object storage separately

Relational data such as accounts and conversation metadata needs transactional
queries and ownership constraints. Blob storage is appropriate for large
objects only if a product feature actually needs them. Estimate backup,
network, and egress cost in addition to the service's sticker price.

```text
API identity -> SQL for structured records
             -> Blob store only for justified files
```

**Self-check:** Does a managed database remove the need for restore tests?
**Answer:** no; backup configuration and recovery need verification.

### T095 — Give managed identity minimum access

The host's managed identity is a workload identity. Grant only the specific
secret or resource actions the API needs; separate development and production
identities so a local experiment does not receive production privileges.

```text
API workload identity -> minimum role -> only required secret/resource
```

**Self-check:** Does managed identity mean no access control is required?
**Answer:** no; its permissions must still be scoped and reviewed.

For example, an API identity may need a specific secret-read permission and
database connection permission; it does not need subscription-owner rights.
Keep user identity (a person signing in) distinct from workload identity (the
host authenticating to Azure resources).

### T096 — Make container configuration external

A container image should contain the app and runtime dependencies, not
environment-specific secrets. Supply settings and credentials at runtime,
and persist data in managed external services rather than the disposable
container filesystem.

```text
same image + dev config -> dev instance
same image + prod config -> prod instance
```

**Self-check:** Should a secret be baked into a Docker image layer?
**Answer:** no; image layers can be copied and inspected.

### T097 — Treat infrastructure as reviewed code

Infrastructure as code describes resources declaratively so environments
can be reviewed and recreated. Keep secrets out of templates, review the
planned changes before applying them, and separate dev/test/prod state.

```text
template + environment parameters -> reviewed plan -> controlled apply
```

**Self-check:** Does a successful template deployment prove the service is
secure? **Answer:** no; inspect permissions, network exposure, and runtime
configuration.

### T098 — Promote changes through environments

Build an artifact once, then promote that same artifact through environments
with different configuration. Require approvals for production changes, and
plan a rollback that accounts for database schema compatibility.

```text
commit -> build artifact -> test environment -> approval -> production
                                      \-> rollback plan
```

**Self-check:** Why build a separate binary for production? **Answer:** it
creates uncertainty about whether the tested artifact is the deployed one.

### T099 — Estimate total cost, not just compute price

Include API hosting, database, storage, logging, network transfer, provider
inference, and expected usage. A free tier can have quotas or sleep behavior
that makes it unsuitable; establish alerts and a hard usage policy before
public access.

```text
monthly total = hosting + database + storage + telemetry + network + inference
```

**Self-check:** Can an inexpensive API host guarantee a low bill if users can
trigger paid model calls without limits? **Answer:** no; usage controls and
provider costs dominate.

### T100 — Prove recovery with a restore drill

Define recovery point objective (acceptable data loss) and recovery time
objective (acceptable downtime). Backups alone are not proof; restore into an
isolated environment, validate data and access rules, and record the time and
result.

```text
backup -> isolated restore -> integrity/access checks -> measured recovery
```

**Self-check:** What does a successful backup job prove? **Answer:** only
that the backup process reported success, not that the data can be restored
and used.
