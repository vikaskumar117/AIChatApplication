# ADR 0003: Identity and federation

- **Status:** Proposed
- **Date:** 2026-10-25
- **Decision owners:** Project owner

## Context

The planned Angular application needs user sign-in, while the API needs
independent authorization for each request and strict conversation ownership.
The learning plan includes OAuth 2.0, OIDC, JWT, and SAML.

## Decision

Prefer OIDC for Angular user sign-in and JWT bearer access tokens for calls to
the ASP.NET Core API. Use authorization-code flow with PKCE through a maintained
client library and a trusted identity provider. Validate tokens in the API and
derive the owner from validated claims; never trust an owner ID supplied only
by the client.

If an enterprise identity system requires SAML, prefer federation at the
identity-provider boundary so the application can continue consuming OIDC/JWT.
Do not implement a custom identity provider or custom token cryptography.
Select the actual identity provider only after comparing learning goals,
free-tier eligibility, user limits, production terms, and deployment needs.

## Alternatives considered

- **Anonymous public API:** suitable only for an isolated local prototype; not
  for private conversation history or an internet-facing deployment.
- **App-issued JWTs/password storage:** rejected for the learning product unless
  there is a specific requirement to operate a full identity system.
- **Direct SAML protocol handling in the SPA/API:** deferred; it adds protocol
  complexity and is unnecessary when the provider can federate upstream.

## Consequences

- Authentication and authorization remain distinct: valid sign-in does not
  automatically authorize access to every conversation.
- The identity provider's pricing and user-count terms may affect hosting cost.
- Token storage, refresh, logout, redirect allowlists, and XSS/CSRF risks need
  deliberate implementation and tests.
- Provider selection remains open; a local mock/test identity strategy is
  needed for automated tests.

## Revisit when

The expected users, enterprise SSO requirements, data residency, provider
pricing, or deployment target are known.
