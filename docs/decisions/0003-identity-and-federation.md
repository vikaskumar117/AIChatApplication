# ADR 0003: Identity and federation

- **Status:** Proposed
- **Date:** 2026-10-25
- **Decision owners:** Project owner

## Context

The planned Angular application needs user sign-in, while the API needs
independent authorization for each request and strict conversation ownership.
The learning plan includes OAuth 2.0, OIDC, JWT, and SAML.

## Proposed direction

The public Angular home offers two clearly labeled choices:

1. **Sign in** with email/password, with create-account and forgot-password
   flows.
2. **Continue with SSO**, redirecting to the configured identity provider.

The application distinguishes identity authentication from its own approval
and access policy. Each newly registered local account and first accepted SSO
identity is provisioned in the application as `GeneralUser` with
`PendingApproval`. An Admin must approve the account before chat is enabled.
An Admin can block an active account; pending and blocked users can see only
the public home and their own account-status page. They cannot read saved
conversation history or call chat, model, conversation, or other AI features.
Approval and blocking are application-owned state, not claims the browser may
assert.

After authentication the application establishes its session, loads the
current application status/roles, and enables chat only if status is `Active`
and the required permission is present. The API independently enforces this
policy on every protected request; a client route guard or hidden/disabled UI
is not a security boundary.

Prefer a trusted identity platform that can manage both local email/password
accounts and external OIDC/SAML federation. Use authorization-code flow with
PKCE for SPA OIDC and validate the resulting identity/session at the API
boundary. If the identity platform cannot provide the required local-account
registration/recovery UX, evaluate ASP.NET Core Identity plus a carefully
reviewed first-party session/token design. Do not invent password hashing,
recovery token handling, OIDC/SAML protocols, or JWT cryptography.

Do not select a provider or token/session architecture until reviewing its
local-account features, federation support, Angular integration, free-tier
eligibility, user limits, production terms, and deployment requirements. Record
the concrete provider and session design before key104 implementation.

If enterprise identity requires SAML, prefer federation at the identity
provider boundary so the application can continue using OIDC/JWT or the
approved server-side session design.

## Alternatives considered

- **Email/password stored by custom application code:** rejected. Use a
  maintained identity platform or ASP.NET Core Identity so password hashing,
  reset tokens, lockout, and password policy are not handwritten.
- **One SPA form directly mixing credentials with SSO credentials:** rejected.
  Email/password form submits only to the approved identity boundary; SSO
  credentials are entered at the identity provider.
- **Custom JWT issuer and protocol:** deferred unless the selected architecture
  explicitly requires a first-party token issuer and its security design is
  reviewed.
- **Direct SAML protocol handling in Angular/API:** deferred; use provider
  federation when possible.
- **Anonymous access to chat:** allowed only for public landing/marketing
  content; protected chat API and conversation data require authentication and
  authorization.
- **Using only an identity-provider role claim for app approval:** rejected as
  the sole source of truth. The application must persist and audit its
  approval/status decision; trusted provider claims may contribute identity
  facts but must not let a public user self-approve.

## Consequences

- Authentication and authorization remain distinct: valid sign-in does not
  automatically authorize access to every conversation.
- The identity provider's pricing and user-count terms may affect hosting cost.
- Registration, email verification, password recovery, lockout, MFA, token
  refresh, logout, redirect allowlists, and XSS/CSRF risks need deliberate
  implementation and tests.
- Public home and chat-locked UI are usability controls only; the API must
  enforce auth on every protected operation.
- Initial registration and first SSO login default to `GeneralUser` +
  `PendingApproval`; approval changes status to `Active`, not role.
- `Blocked` overrides every feature permission. Role assignment does not
  override blocked/pending status.
- The initial two roles are `Admin` and `GeneralUser`; Admin assignment is
  provisioned out-of-band and audited, never through self-registration.
- Admin approval, rejection, block/unblock, and later role/permission changes
  require an append-only audit record and protection against removing the last
  active administrator.
- Feature-level authorization should be modeled with permission keys and
  role-permission mappings so future admin controls do not require embedding
  many role-name conditionals in endpoints.
- Start with exactly two roles, `Admin` and `GeneralUser`, and explicit
  permission keys. Plan `UserPermissionOverrides` as a future schema extension
  for individual grants/restrictions; define deny precedence and audit changes
  before exposing that administration feature.
- Re-evaluate application account status per protected request or document a
  short-lived cache/revocation approach so blocking takes effect promptly.
- Phone number should be optional unless a documented requirement justifies
  collection; avoid collecting unnecessary personal data.
- Errors must not reveal whether an email exists. Reset links must expire and
  be single-use; auth callback errors must fail closed.
- Provider selection remains open; a local mock/test identity strategy is
  needed for automated tests.

## Revisit when

The expected users, local-account policy, enterprise SSO requirements, data
residency, provider pricing, or deployment target are known. Review this ADR
before beginning key104 and mark it Accepted only after the identity/session
design is chosen.
