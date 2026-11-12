import { LearningModuleSummary } from '../../../learning.models';

export const apiSecurityAuthModule: LearningModuleSummary = {
  "id": "api-security-auth",
  "title": "API Security & Auth",
  "description": "Protect APIs through layered identity, least-privilege authorization, browser controls, safe data handling, and abuse resistance.",
  "topics": [
    {
      "id": "comprehensive-api-security",
      "title": "Securing an ASP.NET Core API",
      "priority": "Very High",
      "summary": "API security is a layered system of transport protection, trusted identity, authorization, input and data safety, resilience, and operational response."
    },
    {
      "id": "cors-and-preflight",
      "title": "CORS & Browser Preflight",
      "priority": "Very High",
      "summary": "CORS is a browser-enforced cross-origin response-sharing policy, not authentication or protection against non-browser clients."
    },
    {
      "id": "jwt-full-validation-flow",
      "title": "JWT Access Token Validation",
      "priority": "Very High",
      "summary": "An API must validate a bearer access token’s cryptographic and protocol constraints before it trusts claims or authorizes a request."
    },
    {
      "id": "jwt-oauth-oidc-distinction",
      "title": "JWT vs OAuth 2.0 vs OpenID Connect",
      "priority": "Very High",
      "summary": "JWT is a token format, OAuth 2.0 is an authorization framework, and OpenID Connect is an authentication layer built on OAuth 2.0."
    },
    {
      "id": "oauth-2-authorization",
      "title": "OAuth 2.0 Authorization",
      "priority": "Very High",
      "summary": "OAuth 2.0 lets a client obtain limited access to a protected resource without sharing the resource owner’s password with that client."
    },
    {
      "id": "oidc-user-sign-in",
      "title": "OpenID Connect & User Sign-In",
      "priority": "Very High",
      "summary": "OpenID Connect adds an interoperable identity layer to OAuth 2.0 so a client can validate a user authentication result."
    },
    {
      "id": "entra-user-sign-in",
      "title": "Microsoft Entra ID & User Sign-In",
      "priority": "High",
      "summary": "Microsoft Entra ID is an identity platform that can authenticate users and issue protocol tokens for registered applications and APIs."
    },
    {
      "id": "entra-aspnetcore-api",
      "title": "Integrating Entra ID with an ASP.NET Core API",
      "priority": "Very High",
      "summary": "An ASP.NET Core API integrates with Entra as a resource server: validate bearer access tokens for the API, then apply application authorization."
    },
    {
      "id": "authentication-vs-authorization",
      "title": "Authentication vs Authorization",
      "priority": "Very High",
      "summary": "Authentication establishes a trusted identity; authorization decides what that identity may do to a specific operation or resource."
    },
    {
      "id": "roles-vs-policy-authorization",
      "title": "Role vs Policy Authorization",
      "priority": "High",
      "summary": "Roles provide coarse identity groupings; policies express named requirements and can combine claims, roles, and custom handlers."
    },
    {
      "id": "access-vs-refresh-tokens",
      "title": "Access Tokens vs Refresh Tokens",
      "priority": "Very High",
      "summary": "Access tokens are presented to resource APIs; refresh tokens are high-value credentials used with the authorization server to obtain renewed access."
    },
    {
      "id": "token-expiration-and-rotation",
      "title": "Token Expiration & Key Rotation",
      "priority": "High",
      "summary": "Expiration bounds how long a credential is accepted; rotation replaces credentials or signing keys while preserving controlled continuity."
    },
    {
      "id": "service-to-service-authentication",
      "title": "Service-to-Service Authentication",
      "priority": "High",
      "summary": "Workload identity authenticates an application or service without pretending it is an end user."
    },
    {
      "id": "api-key-security",
      "title": "API Keys",
      "priority": "High",
      "summary": "An API key identifies or gates a client integration but is a bearer secret and usually does not provide end-user identity or fine-grained authorization."
    },
    {
      "id": "sql-injection-prevention",
      "title": "SQL Injection Prevention",
      "priority": "Very High",
      "summary": "SQL injection occurs when untrusted input changes query structure; parameterization keeps values data rather than executable SQL."
    },
    {
      "id": "xss-csrf-protection",
      "title": "XSS & CSRF",
      "priority": "Very High",
      "summary": "XSS attacks run attacker-controlled script in a user’s browser; CSRF tricks a browser into sending an authenticated action using ambient credentials."
    },
    {
      "id": "api-rate-limiting",
      "title": "API Rate Limiting",
      "priority": "High",
      "summary": "Rate limiting bounds request consumption to protect service capacity and fairness, but it does not replace authorization or broader abuse defenses."
    },
    {
      "id": "password-storage",
      "title": "Secure Password Storage",
      "priority": "Very High",
      "summary": "Passwords should be stored as salted, deliberately expensive one-way password hashes, never as plaintext or reversibly encrypted values."
    },
    {
      "id": "frontend-token-storage",
      "title": "Frontend Token Storage",
      "priority": "Very High",
      "summary": "Browser token storage is a threat-model trade-off: script-readable storage exposes tokens to XSS, while cookie-based sessions require CSRF protections."
    },
    {
      "id": "broken-object-authorization",
      "title": "Broken Object-Level Authorization (BOLA)",
      "priority": "Very High",
      "summary": "BOLA occurs when an API checks who the caller is but fails to check whether they may access the specific record they requested."
    },
    {
      "id": "ssrf-defense",
      "title": "Server-Side Request Forgery (SSRF)",
      "priority": "Very High",
      "summary": "SSRF abuses a server feature that fetches a caller-influenced destination, potentially crossing network trust boundaries."
    },
    {
      "id": "credential-stuffing-defense",
      "title": "Credential Stuffing & Brute-Force Defense",
      "priority": "High",
      "summary": "Credential stuffing reuses leaked username/password pairs, while brute-force attacks repeatedly guess credentials; layered controls limit account takeover and abuse."
    },
    {
      "id": "mass-assignment-defense",
      "title": "Mass Assignment & Over-Posting",
      "priority": "High",
      "summary": "Mass assignment occurs when an API binds untrusted request fields directly to a domain or persistence object, allowing callers to set fields they should not control."
    }
  ]
};
