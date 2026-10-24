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

After successful authentication, the application returns to the home/chat
experience and enables chat only after the application session is confirmed.
The API independently validates authentication and authorization; a client
route guard or hidden/disabled UI is not a security boundary.

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

## Consequences

- Authentication and authorization remain distinct: valid sign-in does not
  automatically authorize access to every conversation.
- The identity provider's pricing and user-count terms may affect hosting cost.
- Registration, email verification, password recovery, lockout, MFA, token
  refresh, logout, redirect allowlists, and XSS/CSRF risks need deliberate
  implementation and tests.
- Public home and chat-locked UI are usability controls only; the API must
  enforce auth on every protected operation.
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
