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

## Workbook implementation connection

The current implementation protects its API key configuration and does not
expose provider choice to callers. Authentication, browser boundaries,
authorization, account status, audit, and rate limiting are future vertical
slices. A learning example is not evidence of a deployed security control.
