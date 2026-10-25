# Module 07 — Identity, Authorization, and API Security

**Workbook alignment:** Day 11 (API security, identity, CORS, secrets, limits).
Related tracker topics: T061–T070 and T121–T122.

> **Status:** Authentication, account storage, authorization policies, CORS,
> rate limits, and RAG security are not implemented. The lessons describe the
> approved direction in the roadmap, not current protections.

## T061 — Authentication vs. authorization

- **What:** Authentication establishes who a caller is; authorization decides
  what that caller may do.
- **Why:** A valid identity does not automatically grant chat, history, or
  admin access.
- **When:** Authenticate protected API requests, then evaluate account status
  and operation-specific permission.
- **Limits:** A UI login state or user-supplied identifier is not proof of
  identity.
- **Diagram:** `request -> authenticate identity -> authorize action -> allow/deny`
- **Project example (planned — key104):** only an active approved account with
  chat permission may call AI. See [key104](../../PROJECT_ROADMAP.md).
- **Reference:** [ASP.NET Core authorization](https://learn.microsoft.com/aspnet/core/security/authorization/introduction)

### Worked example and self-check

A signed-in user may be authenticated but still lack permission to administer
accounts. Keep the two checks conceptually separate: validate identity first,
then evaluate permission for this specific operation.

```text
valid token? -> identify subject -> active account? -> has chat permission?
```

**Try it:** If a browser displays a user's name, has the API proven the
identity? **Answer:** no; the API must validate a trusted credential itself.

## T062 — OAuth 2.0 roles and authorization-code flow

- **What:** OAuth 2.0 delegates authorization; the authorization-code flow
  exchanges a short-lived code for tokens at the identity provider.
- **Why:** The browser app should not collect passwords or implement a token
  protocol itself.
- **When:** Use the approved OIDC authorization-code flow for a browser client.
- **Limits:** OAuth by itself is authorization, not a sign-in identity
  protocol; tokens and callback codes are sensitive.
- **Diagram:** `SPA -> authorize -> identity provider -> code -> token endpoint`
- **Project example (planned — key104):** trusted identity provider manages
  sign-in and issues tokens for the API.
- **Reference:** [OAuth 2.0](https://oauth.net/2/)

### Worked example and self-check

In authorization-code flow, the browser is redirected to the identity
provider, receives a short-lived code after sign-in, and exchanges it through
the configured client flow. The application should use a maintained library
and never ask the user for an identity-provider password itself.

```text
browser -> authorize request -> identity provider -> callback with code
       -> client library completes code exchange
```

**Try it:** Is OAuth 2.0 itself a sign-in protocol? **Answer:** no; OIDC adds
the identity layer.

## T063 — OIDC discovery, ID tokens, and sign-in

- **What:** OpenID Connect adds identity claims and discovery metadata to OAuth
  2.0.
- **Why:** The app needs a trusted way to establish the user's identity and
  issuer.
- **When:** Use a maintained OIDC client/library and validate issuer, audience,
  signature, nonce, and state as required.
- **Limits:** An ID token is for the client; it is not automatically an API
  access token.
- **Diagram:** `OIDC metadata + auth response -> validate identity -> session`
- **Project example (planned — key104):** external identity subject maps to an
  application user profile; do not trust email alone as a permanent key.
- **Reference:** [OpenID Connect](https://openid.net/developers/how-connect-works/)

### Worked example and self-check

OIDC discovery lets a client find trusted endpoints and signing keys for a
configured issuer. The application validates the identity token as intended
for the client, then uses the appropriate access token for API calls. Map a
stable issuer-plus-subject identity to the local account rather than assuming
an email address never changes.

**Try it:** Can an ID token automatically be used as an API access token?
**Answer:** no; tokens have different intended audiences and purposes.

## T064 — PKCE and public SPA client security

- **What:** PKCE binds an authorization code to a verifier held by the client.
- **Why:** It reduces the value of an intercepted code in public clients that
  cannot keep a client secret.
- **When:** Use authorization code with PKCE for an SPA.
- **Limits:** PKCE does not prevent XSS, token theft from a compromised
  browser, or API authorization bugs.
- **Diagram:** `SPA creates verifier -> challenge sent -> code returned -> verifier proves client`
- **Project example (planned — key104):** configure OIDC PKCE through a
  maintained client library; no browser token code exists yet.
- **Reference:** [OAuth 2.0 for browser-based apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)

### Worked example and self-check

PKCE uses a verifier generated by the client and a derived challenge sent with
the authorization request. When the code is redeemed, possession of the
verifier proves the redeemer is the client that initiated the flow.

```text
client creates verifier -> sends challenge -> receives code
                       -> redeems code with verifier
```

PKCE does not make a browser a confidential client. **Try it:** Should an SPA
store a client secret in its bundle? **Answer:** no; shipped client code is
public.

## T065 — JWT signature, issuer, audience, and expiry

- **What:** A JWT is a signed token carrying claims; a resource server must
  validate signature and expected issuer, audience, and lifetime.
- **Why:** The API must reject forged, wrong-purpose, or expired access tokens.
- **When:** Validate tokens using a maintained middleware and trusted identity
  provider metadata/keys.
- **Limits:** Decoding a JWT is not validation; base64 payloads are not
  confidential by default.
- **Diagram:** `Bearer token -> signature + issuer + audience + expiry checks -> principal`
- **Project example (planned — key104):** ASP.NET Core JWT bearer validation
  protects API endpoints; none is configured now.
- **Reference:** [JWT bearer authentication](https://learn.microsoft.com/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

### Worked example and self-check

A JWT payload can be decoded by anyone who obtains the token; a signature
allows a validator to detect tampering but does not encrypt the payload.
Bearer middleware must validate the signing key, expected issuer and audience,
and expiry before constructing an authenticated principal.

```text
token -> signature valid? -> trusted issuer? -> intended audience? -> not expired?
```

**Try it:** Is reading a JWT's JSON payload equivalent to validating it?
**Answer:** no; parsing does not establish who issued it or whether it was
changed.

## T066 — Claims, scopes, roles, and policy authorization

- **What:** Claims describe identity attributes; scopes/roles/policies
  represent permission rules at different levels.
- **Why:** Chat access, history ownership, and admin actions require different
  permissions.
- **When:** Authorize at each API operation, with explicit policy names and
  least privilege.
- **Limits:** A claim can become stale; role strings alone may be insufficient
  for ownership or current account-state checks.
- **Diagram:** `validated principal + current account status + policy -> decision`
- **Project example (planned — key104/key105):** server checks active status,
  permission, and conversation owner before model or history access.
- **Reference:** [Policy-based authorization](https://learn.microsoft.com/aspnet/core/security/authorization/policies)

### Worked example and self-check

A policy can express a required capability, while ownership requires
comparing the authenticated subject to the resource's owner. Do both checks
on the server for every read and write; a user-controlled `userId` in a
request body is not authority.

```text
validated subject + "chat:use" permission + active account -> permit chat
validated subject + conversation owner match             -> permit history
```

**Try it:** Is a role claim enough to decide access to a specific
conversation? **Answer:** not by itself; resource ownership must also be
checked.

## T067 — SAML federation and OIDC translation boundary

- **What:** SAML is an enterprise federation protocol; an identity platform can
  accept SAML upstream and issue OIDC to the SPA/API.
- **Why:** Enterprise SSO may require existing SAML identity providers without
  making the app a federation protocol implementation.
- **When:** Prefer OIDC for the app; support SAML at the trusted identity
  provider boundary when required.
- **Limits:** Protocol translation does not eliminate claim mapping, account
  linking, or issuer validation requirements.
- **Diagram:** `enterprise SAML IdP -> identity platform -> OIDC app`
- **Project example (planned — key104):** SAML is an optional upstream
  federation choice, not a direct Angular token protocol.
- **Reference:** [SAML overview](https://www.oasis-open.org/standard/saml/)

### Worked example and self-check

Treat SAML as an upstream enterprise integration if a customer's identity
provider requires it. A trusted identity platform can handle that protocol
and issue OIDC tokens to the application, keeping protocol-specific
complexity outside the chat app.

```text
Enterprise SAML assertion -> identity broker -> OIDC tokens -> application
```

**Try it:** Does translating protocols remove the need to validate the OIDC
issuer? **Answer:** no; the app still validates its configured trust boundary.

## T068 — CORS, cookies, CSRF, and browser boundaries

- **What:** CORS controls which browser origins can read cross-origin
  responses; cookies may be sent automatically; CSRF abuses that behavior.
- **Why:** The eventual SPA and API need an explicit trust boundary.
- **When:** Allow only known origins; choose a deliberate token or secure
  cookie/BFF architecture and apply its CSRF protections.
- **Limits:** CORS is not authentication and does not stop non-browser clients.
  `SameSite` is helpful but not a complete design by itself.
- **Diagram:** `browser origin -> CORS policy -> API` · `ambient cookie -> CSRF risk`
- **Project example (planned — key106):** configure a narrow local/production
  origin list; none is currently configured.
- **Reference:** [CORS in ASP.NET Core](https://learn.microsoft.com/aspnet/core/security/cors)

### Worked example and self-check

CORS is a browser rule governing whether JavaScript from one origin can read
a response from another. It is not an API firewall: scripts, command-line
clients, and servers are not constrained by the browser's CORS enforcement.
Choose either a token-based SPA pattern or a cookie/BFF pattern and apply the
appropriate CSRF protections rather than combining them accidentally.

```text
allowed origin -> browser may expose response to script
disallowed origin -> browser blocks script access (request may still reach API)
```

**Try it:** Does a restrictive CORS rule authenticate callers? **Answer:**
no; authentication and authorization are separate controls.

## T069 — Secret storage, rotation, and managed identity

- **What:** Secrets are credentials that require controlled storage and
  rotation; managed identity lets supported cloud services authenticate
  without a stored password.
- **Why:** Provider keys and database credentials must not leak into source,
  browser bundles, or logs.
- **When:** Use User Secrets locally, environment/secret stores in deployment,
  and managed identity when supported.
- **Limits:** Secret stores still require access control and rotation; a
  frontend environment file is public.
- **Diagram:** `API identity -> secret store/provider` (never `browser -> key`)
- **Project example (implemented guidance):** [appsettings.json](../../appsettings.json)
  has an empty OpenAI key; [Program.cs](../../Program.cs) requires one only
  when OpenAI is selected.
- **Reference:** [ASP.NET Core secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) · [Managed identities](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview)

### Worked example and self-check

Local development secrets should be stored outside source control; deployed
services should use a managed secret store or workload identity where
available. Rotation needs an operational procedure: issue a new credential,
switch consumers, verify, and revoke the old one.

```text
server identity -> authorized secret store -> provider credential -> provider
browser bundle -----------------------------------------------X-> secret
```

**Try it:** Is an Angular environment variable secret? **Answer:** no; it is
compiled into files delivered to the browser.

## T070 — OWASP risks, prompt injection, PII, and tenant isolation

- **What:** These are risks from untrusted input, excessive authority,
  sensitive-data exposure, and missing tenant boundaries.
- **Why:** Submitted source code and future retrieved documents are untrusted
  and may contain confidential content or malicious instructions.
- **When:** Threat-model data flow; minimize retention; authorize every
  resource; treat model output and retrieved text as untrusted.
- **Limits:** Prompt wording alone cannot prevent injection; defense requires
  access control, allowlists, output handling, and monitoring.
- **Diagram:** `untrusted input -> validate + authorize + minimize -> model -> validate output`
- **Project example (planned — key106/key108):** no tool execution or document
  retrieval is enabled; the API must not log submitted code or provider
  credentials.
- **Reference:** [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/)

### Worked example and self-check

Submitted code, retrieved documents, and model responses are data from
outside the trusted application boundary. Minimize what is retained, enforce
ownership on every resource, avoid logging code or credentials, and ensure a
prompt cannot grant access to tools or another tenant's records.

```text
untrusted content -> size/format checks -> authorization -> bounded model use
                                                  -> safe output rendering
```

**Try it:** Can prompt wording alone guarantee prompt-injection resistance?
**Answer:** no; authorization and capability limits must be enforced in code.

## T121 — RBAC, roles, permissions, and feature authorization

- **What:** RBAC associates roles with permissions; individual operations
  should check an explicit capability.
- **Why:** Admin user management must not be implied by normal chat access.
- **When:** Give users least privilege and authorize each server-side action.
- **Limits:** Broad roles grow difficult to manage; role membership does not
  replace account status or ownership checks.
- **Diagram:** `user -> roles -> permissions -> endpoint policy`
- **Project example (planned — key104):** `GeneralUser` and `Admin` are
  separate roles, with chat permission evaluated explicitly.
- **Reference:** [Authorization in ASP.NET Core](https://learn.microsoft.com/aspnet/core/security/authorization/introduction)

### Worked example and self-check

Define permissions around actions, not broad assumptions. A general user may
be allowed to explain code while an administrator may manage accounts; admin
privilege should not imply ownership of a user's private conversations.

```text
GeneralUser -> chat:use
Admin       -> accounts:manage
```

The API should check policy on each operation and separately verify current
account state. **Try it:** Should hiding an admin button protect the admin
endpoint? **Answer:** no; the server must enforce the permission.

## T122 — Account lifecycle, approvals, admin actions, and audit

- **What:** Account lifecycle models states and allowed transitions; audit
  records who changed what and why.
- **Why:** New accounts require approval and blocked users must lose AI/history
  access immediately.
- **When:** Validate transitions server-side and record administrative
  decisions with actor, target, reason, and timestamp.
- **Limits:** A UI hide/disable is not an access control; stale token claims
  must not override current blocked status.
- **Diagram:** `Pending -> Admin approval -> Active -> Blocked` (each transition audited)
- **Project example (planned — key104/key105):** approval and admin audit tables
  are part of the identity/persistence design; no account database exists yet.
- **Reference:** [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

### Worked example and self-check

Model account status transitions explicitly. For example, only a pending
account may be approved; a blocked account should immediately fail protected
operations even if an old token still contains a prior role. Record the
administrator, target account, action, reason, and timestamp without writing
secrets or unnecessary personal data.

```text
Pending --approve(actor, reason)--> Active --block(actor, reason)--> Blocked
```

**Try it:** Does disabling a button revoke an existing token's permissions?
**Answer:** no; the API needs a current status check or a deliberate token
revocation/expiry strategy.

## Workbook implementation connection

The current implementation protects its API key configuration and does not
expose provider choice to callers. Authentication, browser boundaries,
authorization, account status, audit, and rate limiting are future vertical
slices. A learning example is not evidence of a deployed security control.

## ASP.NET Core request security: how the pieces connect

Authentication middleware validates a credential and creates a principal.
Authorization evaluates that principal against an endpoint policy. The
middleware order matters: authentication must run before authorization so
policies can inspect the validated principal.

```text
HTTP bearer token
      -> JWT validation (signature, issuer, audience, expiry)
      -> ClaimsPrincipal
      -> endpoint policy + current account state + resource ownership
      -> allow or 401/403
```

**Future key104/key106 sketch (not registered in the current `Program.cs`):**

```csharp
builder.Services
    .AddAuthentication()
    .AddJwtBearer();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ChatAccess", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "chat:use"));
});

// In the pipeline:
app.UseAuthentication();
app.UseAuthorization();
```

Real configuration must set and validate the trusted authority/issuer and
expected audience using the selected identity provider's documentation. Do
not accept a token merely because it parses. The API must also look up current
account status where immediate blocking is required; a previously issued
role claim can become stale.

### Authentication, permission, and ownership are separate checks

```text
Is this a valid identity?       Authentication
May this identity use chat?     Authorization policy
Does this identity own chat 42? Resource ownership check
Is the account currently active? Current account-state check
```

An `[Authorize]` attribute can guard the endpoint, while a use case must
verify that the conversation's `UserId` matches the validated subject. Never
use a caller-supplied owner ID as the trusted identity.

### CORS example and its boundary

For local development, configure only the actual Angular origin; do not
enable wildcard origins to make a browser error disappear.

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDev", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});
```

Apply the named policy deliberately in the middleware pipeline. This example
is not current app configuration, and it does not authenticate callers.
Production must use the exact deployed origin and credential policy selected
for the eventual token or cookie architecture.

### OIDC and SAML boundary

```text
Angular SPA --OIDC authorization code + PKCE--> trusted identity platform
       ^                                        |
       | access token                           | upstream SAML, if required
       +---------- ASP.NET API <-----------------+
```

OIDC provides the app's identity/session protocol. An enterprise SAML identity
provider can federate upstream through a trusted identity platform; the
Angular application should not implement SAML assertion parsing itself. Use a
maintained client/library and validate state, nonce, issuer, audience, and
signatures as appropriate to the flow.

### Rate limiting and credential handling

Use separate controls for request bytes, request frequency, and provider
spend. A rate-limit policy commonly returns `429`; a request-size limit
commonly returns `413`. Choose a partition such as validated user identity
once authentication exists, with an appropriate anonymous policy before
that.

```text
request -> body-size limit -> identity/IP rate partition -> usage budget -> provider
```

Store provider credentials server-side. Locally, use the .NET user-secrets
store; in deployment, use a managed secret store or workload identity where
available. Logs and error responses must not include credentials, tokens, or
submitted source code by default.
