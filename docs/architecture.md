# AI Chat Application Architecture

## Document status

This document separates the **current implementation** from the **target
architecture**. Planned components are not represented as existing code.
Implementation status and work sequence live in
[the project roadmap](../PROJECT_ROADMAP.md).
Development is gated by release keys **key101-key110**; each key must pass its
acceptance checks before the next begins. The
[topic tracker](TOPIC_TRACKER.md) records learning progress, and the
[learning guide](learning-guide.md) expands concepts in the order their feature
is implemented.

## Product vision

Provide a browser-based chat experience where a user submits code, receives
AI-generated explanations, and can later manage private conversation history.
The application will use an Angular single-page application (SPA), an
ASP.NET Core REST API, a configurable AI provider, and a relational database.
Authentication, persistence, retrieval-augmented generation (RAG), and cloud
deployment are introduced in separate feature phases.

## Current repository architecture

```mermaid
flowchart LR
    Client[HTTP client / Swagger UI] --> Controller[ChatController]
    Controller --> Contract[IChatApiService]
    Contract --> Ollama[OllamaChatApiService]
    Contract -. alternative implementation .-> OpenAI[ChatApiService]
    Ollama --> HttpClient[IHttpClientFactory]
    OpenAI --> HttpClient
    HttpClient --> Model[Ollama or OpenAI-compatible endpoint]
    Controller --> Result[Result response]
    Middleware[ApiExceptionHandler] -. unhandled exception path .-> Result
```

### Current implementation notes

- The backend is an ASP.NET Core Web API targeting .NET 10.
- `ChatController` exposes the code-explanation endpoint and delegates to
  `IChatApiService`.
- `OllamaChatApiService` and `ChatApiService` implement the current service
  contract. `Program.cs` registers Ollama as the active implementation.
- Provider requests are made with `HttpClient`; no provider SDK abstraction is
  currently used.
- The API has a shared `Result` envelope and an exception handler.
- The active Ollama endpoint/model are configured in `appsettings.json`.
- There is no Angular project, authentication, database, EF Core, conversation
  history, RAG, or cloud deployment implemented yet.
- The `main` branch is protected from this feature work by doing development on
  `dev` and proposing changes for manual PR review.

Relevant implementation files:

- [Program.cs](../Program.cs) — service registrations and HTTP pipeline.
- [ChatController.cs](../Controllers/ChatController.cs) — current API entry
  point.
- [IChatApiService.cs](../Services/IChatApiService.cs) — current chat service
  contract.
- [OllamaChatApiService.cs](../Services/OllamaChatApiService.cs) — Ollama HTTP
  call and response parsing.
- [ChatApiService.cs](../Services/ChatApiService.cs) — OpenAI-compatible
  implementation.
- [Result.cs](../Responses/Result.cs) — shared API response envelope.
- [ApiExceptionHandler.cs](../Middleware/ApiExceptionHandler.cs) — unhandled
  exception response handling.

## Target logical architecture

```mermaid
flowchart TB
    Browser[Browser]
    SPA[Angular SPA]
    IdP[OIDC identity provider]
    API[ASP.NET Core API]
    Auth[JWT authentication and authorization policies]
    AccountAccess[Account status + permission evaluation]
    AdminUI[Admin user review and access UI]
    Validation[DTO validation, request limits, CORS, rate limits]
    App[Chat application / orchestration service]
    Repo[Conversation repository interface]
    SqlRepo[EF Core SQL repository]
    DB[(SQL database)]
    ProviderSelection[Configured AI provider selector]
    Ollama[Ollama adapter]
    OpenAI[OpenAI adapter]
    Other[Future model adapters]
    RAG[Optional retrieval service]
    Search[(Vector or search index)]
    Docs[Authorized document store]
    Queue[Optional background queue]
    Telemetry[Logs, metrics, traces, health checks]
    Secrets[Local secrets / cloud secret store]

    Browser --> SPA
    SPA -->|OIDC authorization code + PKCE| IdP
    SPA -->|Bearer access token| API
    IdP -->|Issuer, audience, keys, claims| Auth
    API --> Auth
    Auth --> AccountAccess
    AdminUI -->|approve / block / role permissions| API
    AccountAccess --> Validation
    Validation --> App
    App --> Repo
    Repo --> SqlRepo
    SqlRepo --> DB
    App --> ProviderSelection
    ProviderSelection --> Ollama
    ProviderSelection --> OpenAI
    ProviderSelection --> Other
    Ollama --> ModelEndpoint[Configured model endpoint]
    OpenAI --> ModelEndpoint
    Other --> ModelEndpoint
    App -. when feature is enabled .-> RAG
    RAG --> Search
    RAG --> Docs
    RAG --> App
    Queue -. optional async jobs .-> App
    API --> Telemetry
    App --> Telemetry
    Secrets -. configuration .-> API
    Secrets -. credentials .-> ProviderSelection
```

### Identity and home-page flow

```mermaid
flowchart TB
    Visitor[Visitor opens public Angular home]
    Home[Public home: chat composer disabled]
    Choice{Choose sign-in method}
    Local[Email/password dialog]
    Register[Register: name, email, phone, password, confirm]
    Forgot[Forgot password / reset]
    SSO[Continue with SSO]
    OIDC[OIDC authorization code + PKCE]
    IdP[Trusted identity provider]
    Callback[OIDC callback: state, nonce, code exchange]
    Session[Authenticated app session]
    Profile[Application profile, status, and permissions]
    Access{Account Active + permission?}
    Admin[Authorized Admin reviews account]
    Status[Public home + own status page only]
    Chat[Angular chat enabled]
    API[ASP.NET Core API]
    Auth[JWT/session validation and authorization]
    Fail[Safe error UI + redacted diagnostics]

    Visitor --> Home --> Choice
    Choice --> Local
    Local -->|Create account| Register
    Local -->|Forgot password| Forgot
    Register --> IdP
    Forgot --> IdP
    Local -->|Email/password via approved auth flow| IdP
    IdP -->|Local credentials verified| Session
    Choice --> SSO --> OIDC --> IdP
    IdP -->|Authorization response| Callback
    Callback -->|Validated identity/session| Session
    Session --> Profile --> Access
    Access -->|Active + permitted| Chat
    Access -->|Pending / blocked / denied| Status
    Admin -->|approve / reject / block / unblock| Profile
    Chat -->|Authorized request| API --> Auth
    Local -. invalid credentials / locked .-> Fail
    Register -. invalid / duplicate / verification .-> Fail
    Forgot -. expired or invalid token .-> Fail
    OIDC -. denied / provider unavailable .-> Fail
    Callback -. state / nonce / token failure .-> Fail
    API -. 401 / 403 / network failure .-> Fail
```

All identity components in this flow are planned. The exact identity provider
and whether credentials are managed by that provider or ASP.NET Core Identity
must be decided in key104 and recorded in
[ADR 0003](decisions/0003-identity-and-federation.md). The preferred approach
is a trusted identity platform that supports local accounts and upstream
federation. Do not create a custom password store or token protocol simply to
keep all screens inside Angular.

### Public home and sign-in UX

The home page is accessible without a session, but the chat composer and
conversation actions stay disabled until an authenticated session is confirmed.
Show a read-only preview and a clear message explaining why chat is locked.
Provide two visible actions: **Sign in** (email/password dialog with create
account and forgot-password links) and **Continue with SSO** (redirect to the
identity provider). On small screens, stack the actions; retain visible labels,
keyboard access, dialog focus management, and assistive-technology status
announcements.

Registration collects name, email, phone according to the approved policy,
password, and confirmation. Confirm-password is a client-side check and must
not be stored. Phone is recommended to be optional unless a concrete feature
requires it. Password hashing, email verification, reset, lockout, and
credentials must be handled at the trusted identity boundary.

### Authentication failure behavior

| Failure | UI behavior | Security behavior |
|---|---|---|
| Wrong credentials | Generic sign-in error and retry | Do not reveal if an email is registered; rate-limit attempts |
| Duplicate registration | Offer sign-in or password-reset path | Avoid account enumeration; never auto-link by email |
| Password confirmation mismatch | Inline validation before submit | Server/identity provider validates submitted registration |
| Email verification pending | Offer resend/continue verification | Keep protected API/chat access disabled |
| Locked or disabled account | Show safe next step/support route | Do not bypass lockout |
| Unknown email on password reset | Show the same generic confirmation | Do not reveal account existence |
| Expired/reused reset token | Explain link expiry and offer a fresh request | Reject the token; never allow replay |
| User cancels SSO | Return to public home with neutral message | Keep chat disabled |
| Identity provider unavailable | Show temporary issue and retry option | Do not fall back to a fake authenticated session |
| State/nonce/code-exchange failure | Clear partial login state and offer restart | Reject callback; never log codes or tokens |
| Invalid issuer/audience/signature/claims | Safe sign-in failure message | Reject identity/token and deny API access |
| Expired token/session | Try only approved renewal, then request sign-in | API returns `401`; do not retry indefinitely |
| Insufficient permission | Show access-denied state | API returns `403`; do not treat as signed out success |
| API/network unavailable | Show retryable chat error | Never call model provider directly from Angular |
| Session state cannot be verified | Return to locked home/login options | Fail closed until authentication is re-established |

Log only safe failure categories and correlation IDs. Never log passwords,
reset tokens, authorization codes, access tokens, or full user-info payloads.

## User roles, approval status, and feature permissions

### Authorization rules

Authentication answers who signed in. The application then evaluates both the
user's **account status** and **roles/permissions**:

| Account status | Chat / AI calls | Read-only public/account view | Admin operations |
|---|---:|---:|---:|
| `PendingApproval` | Deny | Allow public home + own status page only; no history | Deny |
| `Active` + `GeneralUser` | Allow only permitted user features | Allow | Deny |
| `Active` + `Admin` | Allow only permitted admin features | Allow | Allow by explicit permission |
| `Blocked` | Deny all AI/chat features | Allow public home + own status page only; no history | Deny |
| `Rejected` / `Disabled` (if adopted) | Deny | Allow public home + approved status/help only; no history | Deny |

Status and role are independent. An `Admin` role does not silently make a
blocked account active, and approval does not grant an `Admin` role. Initial
registration and first accepted SSO identity receive `GeneralUser` plus
`PendingApproval`. Admin approval changes status to `Active`; it does not
change role. Admin blocking immediately denies AI/chat and other protected
capabilities, regardless of a still-valid identity-provider token.

For this application's view-only behavior, **PendingApproval and Blocked users
see only the public home and their own account-status page**. They cannot read
previous conversation history. They also cannot submit prompts, invoke a
provider, create/update/delete conversations, retrieve RAG content, use
function/tool calling, or access admin operations.

Initial active-role permission mapping should be explicit: `GeneralUser` gets
only approved user capabilities (initially `chat.use` and own-conversation
operations); `Admin` gets user-management capabilities and may use chat only
if `chat.use` is granted to that role. Account status remains a deny gate over
every role and permission.

Enforce this on the server for every protected request. The Angular page
disables chat and shows a view-only state for usability, but API middleware or
application authorization must independently check current account state and
permission. If using cached status/claims, define short expiration and
revocation behavior so a block takes effect promptly.

### Planned relational schema

The following schema is a starting design to review during key104/key105, not
an implemented migration. The identity provider owns password credentials when
one is used; the application database stores only the external identity
mapping and application authorization data.

```mermaid
erDiagram
    AppUsers {
        uuid AppUserId PK
        string IdentityIssuer
        string IdentitySubject
        string NormalizedEmail
        string DisplayName
        string PhoneNumber "optional"
        string AccountStatus
        datetime CreatedUtc
        datetime UpdatedUtc
        uuid ApprovedByUserId FK
        datetime ApprovedUtc
        uuid RowVersion "concurrency token"
    }
    Roles {
        int RoleId PK
        string Name UK "Admin or GeneralUser"
        string Description
    }
    UserRoles {
        uuid AppUserId PK,FK
        int RoleId PK,FK
        uuid AssignedByUserId FK
        datetime AssignedUtc
    }
    Permissions {
        int PermissionId PK
        string PermissionKey UK
        string Description
    }
    RolePermissions {
        int RoleId PK,FK
        int PermissionId PK,FK
    }
    UserPermissionOverrides {
        uuid AppUserId PK,FK
        int PermissionId PK,FK
        boolean IsGranted
        uuid ChangedByUserId FK
        datetime ChangedUtc
    }
    AdminAuditEvents {
        long AuditEventId PK
        uuid ActorUserId FK
        uuid TargetUserId FK
        string Action
        string PreviousValue
        string NewValue
        string Reason
        datetime OccurredUtc
        string CorrelationId
    }
    Conversations {
        uuid ConversationId PK
        uuid OwnerUserId FK
        string Title
        datetime CreatedUtc
        datetime UpdatedUtc
    }
    Messages {
        uuid MessageId PK
        uuid ConversationId FK
        string Role
        string Content
        datetime CreatedUtc
    }

    AppUsers ||--o{ UserRoles : has
    Roles ||--o{ UserRoles : assigned
    Roles ||--o{ RolePermissions : grants
    Permissions ||--o{ RolePermissions : included
    AppUsers ||--o{ UserPermissionOverrides : receives
    Permissions ||--o{ UserPermissionOverrides : overridden
    AppUsers ||--o{ AdminAuditEvents : acts
    AppUsers ||--o{ AdminAuditEvents : targeted
    AppUsers ||--o{ Conversations : owns
    Conversations ||--o{ Messages : contains
```

**Schema rules to validate before migration**

- `AppUsers` has a unique constraint on `(IdentityIssuer, IdentitySubject)`;
  email is profile/contact data and must not be the sole external identity key.
- Normalize email for lookup and uniqueness only if product requirements
  define that behavior; identity-provider email verification is distinct from
  application approval.
- `AccountStatus` should be a constrained value (database check/lookup or
  validated enum mapping). Define legal transitions in application logic and
  test them.
- Seed exactly `Admin` and `GeneralUser` roles initially. Never grant Admin
  from public registration or an untrusted client-supplied claim.
- Use a unique composite key on `UserRoles(AppUserId, RoleId)` and
  `RolePermissions(RoleId, PermissionId)`.
- Assign permissions through role-permission links, not client-side role
  strings. Evaluate access as: account is `Active` **and** the required
  permission is granted; account status is a deny gate regardless of grants.
- Protect admin operations with active-account checks and the specific
  `admin.*` permission. Do not assume that every Admin feature is automatically
  available merely because a user has the `Admin` role.
- Create stable permission keys such as `chat.use`,
  `conversation.read.own`, `conversation.delete.own`,
  `admin.users.review`, `admin.users.block`, and `admin.permissions.manage`.
  The initial authorization can be coarse role-based; permissions let later
  releases restrict features without proliferating hard-coded role checks.
- `UserPermissionOverrides` is a future extension for per-user restrictions,
  not required for initial role-based access. If adopted, use a unique
  `(AppUserId, PermissionId)` key, define grant/deny precedence explicitly, and
  audit who changed it; an explicit deny must not be accidentally overridden
  by a role grant.
- Keep administrative audit events append-only to application paths. Capture
  actor, target, action, before/after status or role, reason, timestamp, and
  correlation ID. Restrict access to audit data and never put passwords/tokens
  in the audit payload.
- Add concurrency protection to approval/block transitions. Do not silently
  overwrite a concurrent admin decision.
- Conversation/message queries must always scope by the server-derived
  `AppUserId`; never trust an owner ID supplied by Angular.
- Protect the last active Admin from accidental removal/blocking and document
  a secure out-of-band break-glass bootstrap/recovery procedure.

### Admin approval and blocked-user workflow

```mermaid
stateDiagram-v2
    [*] --> PendingApproval: local registration / first SSO
    PendingApproval --> Active: Admin approves
    PendingApproval --> Rejected: Admin rejects (if enabled)
    Active --> Blocked: Admin blocks
    Blocked --> Active: Admin unblocks
    Active --> Disabled: authorized admin action (optional)
    Rejected --> PendingApproval: resubmission / explicit re-review (if enabled)
```

Every state change requires an Admin authorization check, a valid transition,
and an audit event. Admin approval/block/unblock endpoints must be idempotent
or reject stale transitions clearly. A pending or blocked user sees an
accessible status explanation and sign-out/help actions only; they cannot read
old chat history. The chat composer, send button, all conversation reads and
mutations, model selection, RAG, and any tool/function calling remain
unavailable. The API returns a consistent `403` (or a documented account-state
outcome) for denied protected actions and must not call the model.

### Request flow: chat completion

1. The user establishes a session through the approved email/password or SSO
   flow; SSO uses OIDC authorization-code flow with PKCE where configured.
2. Angular obtains the approved API access token or uses the approved BFF
   session and calls the API over HTTPS.
3. ASP.NET Core validates the JWT or trusted session, resolves the
   server-side application user, and requires an `Active` account plus the
   permission for the requested operation. Pending/blocked users cannot use
   this flow or retrieve old conversation history.
4. The API validates the request and applies input, request-size, CORS, and
   rate-limit policies.
5. The chat application verifies conversation ownership and loads only the
   bounded context needed for the request.
6. The configured provider adapter converts the provider-neutral request into
   the provider's HTTP/SDK format.
7. The adapter applies timeouts/cancellation, parses the response, and maps
   provider errors to application outcomes without exposing secrets.
8. The application persists user and assistant messages according to the
   retention rules and returns a stable API response.
9. Angular renders the answer as text or safely sanitized Markdown, with
   loading/error states and accessible controls.

### Request flow: RAG (future)

1. An authorized user uploads or selects content they are allowed to access.
2. An ingestion workflow validates the file, extracts text, chunks it, and
   stores source metadata plus embeddings.
3. On a chat request, retrieval filters by tenant/user permissions before
   searching.
4. Only relevant, authorized chunks within the model context budget are added
   as untrusted reference material.
5. The response contains source identifiers/citations; the UI displays them
   safely.
6. Deleting or revoking a source removes it from future retrieval.

## Trust boundaries and security controls

| Boundary | Controls to implement |
|---|---|
| Browser to API | HTTPS, JWT validation, authorization policies, request validation, size limits, rate limits |
| SPA origin to API | Explicit CORS allowlist; CORS is not authentication |
| API to database | Least-privilege identity/credentials, parameterized queries, encrypted transport, ownership enforcement |
| API to model provider | Provider-specific credentials kept server-side, outbound timeout, cancellation, bounded input/context, cost controls |
| User content to model | Treat code and documents as untrusted; mitigate prompt injection; do not execute generated output |
| Model response to browser | Validate structured output; render safe text/Markdown; never trust model HTML or tool arguments |
| Build/deployment pipeline | Secret scanning, dependency checks, protected branch/PR, environment separation, controlled migrations |
| Operations/telemetry | Redact tokens, prompts and source code by default; configure retention and access controls |

## Component responsibilities in the target design

- **Angular SPA:** user interface, form-level validation, OIDC client flow,
  API calls, accessible loading/error states. It must not call model providers
  directly or contain provider secrets.
- **Controllers/API layer:** HTTP contract, binding, authorization metadata, and
  conversion of application outcomes to HTTP status/responses. Keep provider
  details and database queries out of controllers.
- **Chat application service:** use-case orchestration: validate ownership,
  load context, call retrieval if enabled, select AI provider, persist results,
  and return an application outcome.
- **AI provider adapters:** isolate provider-specific endpoint, credential,
  serialization, response parsing, and error translation behind a common
  application-owned interface.
- **Provider selector:** use validated configuration to select a registered
  provider. Unknown provider names should fail clearly at startup.
- **Repository interfaces:** express persistence use cases without returning
  EF Core entities or `IQueryable`. They reduce infrastructure coupling but do
  not make SQL and document databases semantically identical.
- **EF Core persistence adapter:** own `DbContext`, migrations, mapping,
  database-specific query behavior, indexes, and transactions.
- **Identity provider:** authenticate users and issue tokens. The API validates
  JWT access tokens; it must not trust user IDs supplied only in a request body.
- **RAG/queue/observability:** optional components introduced only when product
  and operational requirements justify them.

## Hosting topology options

### Local learning setup

Run Angular, ASP.NET Core, Ollama, and a local database on the developer's
machine. This avoids cloud resource charges but consumes local hardware and
electricity. It is available only while services are running and should not be
treated as secure public hosting.

### Low-cost/free-tier demo

Host the Angular static build on a static hosting plan and the API/database on
separate services whose current free allowances support the chosen runtime.
Cloud free tiers can sleep, have quota/region/account restrictions, or change.
Ollama needs compute/memory suitable for the selected model; do not assume a
small shared web tier can run it.

### Azure learning deployment

Potential topology: Angular on Azure Static Web Apps, API on App Service or a
container host, SQL on Azure SQL, secrets through managed identity/Key Vault,
telemetry through Application Insights. Exact cost depends on region, account
eligibility, tier, logs, storage, networking, and usage. Check the live
[Azure free services page](https://azure.microsoft.com/pricing/free-services/)
and [pricing calculator](https://azure.microsoft.com/pricing/calculator/)
before deploying; create budget alerts and remove unused resources.

### IIS/self-hosted deployment

ASP.NET Core can be hosted behind IIS on Windows, but the machine, reliable
internet, TLS/domain, firewall configuration, backups, patching, monitoring,
and operational responsibility are not free. For learning, use a private
network or VPN rather than exposing a development PC directly to the internet.

See [the roadmap's tooling and cost guide](../PROJECT_ROADMAP.md#tooling-and-cost-guide)
for the distinction between free software, free-tier hosting, and operating
costs.

## Architecture decisions and open questions

Proposed decisions and alternatives are tracked in
[docs/decisions](decisions/README.md). The following remain open until their
feature phase:

- Which OIDC identity provider and whether enterprise SAML federation is needed.
- Which relational database to start with and where it will run.
- Whether the first hosted environment needs to be always-on or can be a
  sleeping/quota-limited demo.
- Which AI provider selection mechanism best matches the number of providers.
- Whether RAG and background processing are product requirements or later
  optional extensions.
- Retention, export, and deletion policy for submitted source code and chats.

## Keeping this document current

Update this file in the same PR whenever a component is implemented, removed,
or changes responsibility. Keep the current-state diagram factual. Update the
target diagram only when the intended architecture changes. Link the PR's
decision records and implementation files; do not document a planned feature as
deployed.
