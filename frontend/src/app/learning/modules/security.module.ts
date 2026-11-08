import { LearningModule, topic } from '../learning.models';

type Lesson = {
  id: string;
  title: string;
  priority: 'Very High' | 'High';
  summary: string;
  concepts: [string, string, string];
  flow: string[];
  details: string[];
  example: string;
  code: string;
  advantages: string[];
  disadvantages: string[];
  use: string;
  avoid: string;
  questions: string[];
  scenario: string;
  note: string;
  takeaways: string[];
  mistakes: string[];
  practices: string[];
  sources?: { label: string; url: string }[];
};

function lesson(item: Lesson) {
  return topic(
    item.id, item.title, item.priority, item.summary, item.concepts, item.flow,
    item.example, item.code,
    [item.advantages, item.disadvantages],
    [item.use, item.avoid],
    item.questions, item.scenario, item.sources,
    {
      diagram: item.flow.map((label, index) => ({ label, detail: item.details[index] })),
      diagramNote: item.note,
      exampleSteps: item.flow,
      keyTakeaways: item.takeaways,
      commonMistakes: item.mistakes,
      bestPractices: item.practices,
      summary: item.summary,
    },
  );
}

export const securityModule: LearningModule = {
  id: 'api-security-auth',
  title: 'API Security & Auth',
  description: 'Protect APIs through layered identity, least-privilege authorization, browser controls, safe data handling, and abuse resistance.',
  topics: [
    lesson({
      id: 'comprehensive-api-security', title: 'Securing an ASP.NET Core API', priority: 'Very High',
      summary: 'API security is a layered system of transport protection, trusted identity, authorization, input and data safety, resilience, and operational response.',
      concepts: [
        'API security is the set of controls that protects a service, its data, and its availability across the complete request lifecycle.',
        'No single control—CORS, a JWT, a firewall, or input validation—covers all threats; defense in depth limits the impact when one layer fails.',
        'Require HTTPS, authenticate trusted principals, authorize every operation and resource, validate input, parameterize database access, constrain resource use, protect secrets, log security events safely, and continuously test and patch the deployed system.',
      ],
      flow: ['Harden transport and edge', 'Authenticate and authorize', 'Validate, execute, observe, and respond'],
      details: ['TLS, secure configuration, gateway controls, request size/time limits, and managed secrets reduce exposure before application logic.', 'Authentication establishes a principal; endpoint policy and resource checks decide whether that principal may perform this operation.', 'Validated inputs, parameterized access, output encoding, rate limits, telemetry, patching, and incident response protect data and availability end to end.'],
      example: 'A multi-tenant Orders API validates an Entra-issued access token, checks both order permission and tenant ownership, queries with parameters, limits expensive searches, and emits redacted trace-correlated audit events.',
      code: `builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = configuration["Identity:Authority"];
        options.Audience = configuration["Identity:OrdersAudience"];
    });
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options => { /* partition and bound costly routes */ });

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();`,
      advantages: ['Layered safeguards reduce single-control failure risk', 'Clear boundaries make controls auditable and testable'],
      disadvantages: ['Security requires operational ownership and continuous review', 'Misconfigured layers can cause outages or false confidence'],
      use: 'Apply a threat-model-driven baseline to every API and add controls proportionate to data sensitivity, exposure, and abuse cost.',
      avoid: 'Avoid describing an API as secure because it uses JWT, CORS, HTTPS, or a gateway alone.',
      questions: ['Why is CORS not an API authorization mechanism?', 'How do authentication and resource authorization compose?', 'Which controls reduce both data theft and resource exhaustion?'],
      scenario: 'An external assessment finds cross-tenant access and unbounded search traffic; first enforce resource ownership and operation-specific permissions, then bound expensive work, add regression tests, and review telemetry for prior exposure.',
      note: 'Security is a lifecycle property: design, implementation, deployment, monitoring, recovery, and retirement all matter.',
      takeaways: ['Use defense in depth with explicit trust boundaries.', 'Authorize the requested resource, not merely the route.', 'Availability and operational response are security concerns too.'],
      mistakes: ['Treating CORS as protection against direct HTTP clients.', 'Treating authentication as proof of authorization for every record.'],
      practices: ['Threat-model endpoints, identities, data flows, and failure modes.', 'Automate dependency updates, security tests, redaction checks, and incident-ready telemetry.'],
      sources: [{ label: 'ASP.NET Core security', url: 'https://learn.microsoft.com/en-us/aspnet/core/security/' }, { label: 'OWASP API Security Top 10', url: 'https://owasp.org/API-Security/' }],
    }),
    lesson({
      id: 'cors-and-preflight', title: 'CORS & Browser Preflight', priority: 'Very High',
      summary: 'CORS is a browser-enforced cross-origin response-sharing policy, not authentication or protection against non-browser clients.',
      concepts: [
        'Cross-Origin Resource Sharing (CORS) is a browser protocol in which a server declares which origins may read responses to cross-origin requests.',
        'It allows a site to deliberately expose an API to approved browser origins, but does not stop curl, servers, or malicious clients from sending HTTP requests.',
        'For a non-simple browser request, the browser first sends OPTIONS preflight with Origin, requested method, and requested headers; the API or proxy must return matching allow headers before the browser sends the actual request.',
      ],
      flow: ['Browser evaluates cross-origin call', 'OPTIONS preflight checks policy', 'Allowed call proceeds; browser gates response'],
      details: ['Origin consists of scheme, host, and port and is distinct from the request URL path.', 'Preflight asks whether the origin, method, and headers are allowed; it is not the business request and does not authenticate the user.', 'CORS headers let a browser expose the response to script; server-side authentication and authorization still decide whether the request is permitted.'],
      example: 'A browser sends JSON with an Authorization header, so its OPTIONS preflight asks whether https://app.example may use POST and Authorization; the API separately validates the resulting bearer token.',
      code: `builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
    policy.WithOrigins("https://app.example")
          .WithMethods("GET", "POST")
          .WithHeaders("Content-Type", "Authorization")));

app.UseRouting();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();`,
      advantages: ['Enables controlled browser cross-origin access', 'Keeps browser response exposure policy explicit'],
      disadvantages: ['Does not block direct clients or replace authorization', 'Credentialed CORS and wildcard origins are easy to misconfigure'],
      use: 'Configure exact trusted origins and only required methods and headers for browser clients.',
      avoid: 'Avoid wildcard origins with credentials and avoid claiming CORS prevents unauthorized requests.',
      questions: ['When does a browser send preflight?', 'What can CORS not protect against?', 'Why is wildcard origin unsafe with credentials?'],
      scenario: 'A frontend engineer reports that a browser blocks a call while a command-line client succeeds; inspect OPTIONS routing and CORS headers, while separately verifying the API’s actual authorization policy.',
      note: 'CORS behavior is enforced by browsers; the server must still handle every request as untrusted input.',
      takeaways: ['CORS controls browser response sharing, not API authentication.', 'Preflight is an OPTIONS permission check for some cross-origin requests.', 'Allow-list origins and keep credential rules intentional.'],
      mistakes: ['Using CORS as the only defense for a sensitive endpoint.', 'Reflecting arbitrary Origin values or combining wildcard origins with credentials.'],
      practices: ['Test preflight for each required method and custom header in a real browser.', 'Keep CORS rules narrow and independently test authentication and authorization.'],
      sources: [{ label: 'Enable Cross-Origin Requests (CORS) in ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/security/cors' }, { label: 'Fetch Standard: CORS protocol', url: 'https://fetch.spec.whatwg.org/#cors-protocol' }],
    }),
    lesson({
      id: 'jwt-full-validation-flow', title: 'JWT Access Token Validation', priority: 'Very High',
      summary: 'An API must validate a bearer access token’s cryptographic and protocol constraints before it trusts claims or authorizes a request.',
      concepts: [
        'A JSON Web Token (JWT) is a compact claims format; a typical signed JWT encodes header and payload in readable Base64URL form and adds a signature.',
        'A signature protects integrity but does not encrypt claims, establish trust in an arbitrary issuer, or grant access to every resource.',
        'The API obtains signing keys from a configured trusted authority, validates signature and allowed algorithm, issuer, API audience, lifetime including exp and nbf with bounded clock skew, then applies scope/role policy and resource-level checks.',
      ],
      flow: ['Receive bearer access token', 'Validate trust, signature, audience, and time', 'Authorize permission and target resource'],
      details: ['The bearer token is a credential; receive it over TLS and use a supported token handler with trusted discovery and keys.', 'Validation must bind the token to the expected issuer and this API as audience, enforce lifetime, and handle key rollover safely.', 'Claims become inputs to authorization only after validation; route policies and record ownership checks remain separate.'],
      example: 'The Orders API rejects an otherwise well-signed token whose aud is the Billing API and returns 401 rather than trusting its decoded orders.read claim.',
      code: `builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = configuration["Identity:Authority"];
        options.Audience = "api://orders";
        options.TokenValidationParameters.ValidateIssuer = true;
        options.TokenValidationParameters.ValidateAudience = true;
        options.TokenValidationParameters.ValidateLifetime = true;
    });
app.UseAuthentication();
app.UseAuthorization();`,
      advantages: ['Signature-validated claims can be checked locally at scale', 'Standard authority metadata supports interoperable key rollover'],
      disadvantages: ['Revocation before expiry may require provider checks or application state', 'Configuration errors can accept wrong issuers or reject valid key rotations'],
      use: 'Use maintained bearer authentication middleware and configure exact issuer, API audience, lifetime, and authorization requirements.',
      avoid: 'Never trust a decoded token, accept arbitrary algorithms/issuers, log bearer credentials, or send an ID token as an API access token.',
      questions: ['What does a JWT signature prove and not prove?', 'Why validate audience as well as issuer?', 'What is the difference between 401 and 403 after token processing?'],
      scenario: 'A signing key rotates and some API instances reject new tokens; use trusted metadata and overlapping key rollover, test old and new key windows, and keep issuer/audience restrictions intact.',
      note: 'Opaque access tokens are also valid: the resource server validates them through an appropriate introspection or provider mechanism rather than parsing JWT claims.',
      takeaways: ['A JWT is a format, not a complete authentication protocol.', 'Validate signature, issuer, audience, lifetime, and allowed algorithm.', 'Authentication precedes scope, role, and resource authorization.'],
      mistakes: ['Base64URL-decoding a payload and treating its claims as trusted.', 'Checking signature but omitting audience or issuer validation.'],
      practices: ['Use provider discovery/JWKS and tested key rollover rather than hard-coded static assumptions.', 'Test wrong issuer, wrong audience, expired tokens, key rotation, insufficient scope, and resource ownership.'],
      sources: [{ label: 'RFC 7519: JSON Web Token', url: 'https://www.rfc-editor.org/rfc/rfc7519' }, { label: 'Microsoft identity platform access tokens', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens' }],
    }),
    lesson({
      id: 'jwt-oauth-oidc-distinction', title: 'JWT vs OAuth 2.0 vs OpenID Connect', priority: 'Very High',
      summary: 'JWT is a token format, OAuth 2.0 is an authorization framework, and OpenID Connect is an authentication layer built on OAuth 2.0.',
      concepts: [
        'JWT (JSON Web Token) describes a compact token representation, OAuth 2.0 describes delegated access to protected resources, and OpenID Connect (OIDC) defines interoperable user authentication on top of OAuth.',
        'Separating format, authorization protocol, and authentication protocol prevents confusing a readable token with proof of sign-in or permission.',
        'An identity provider may issue JWT or opaque access tokens through OAuth; an OIDC client validates an ID token for its own audience, while the API validates an access token intended for that API.',
      ],
      flow: ['OIDC client signs user in', 'OAuth authorization obtains API access', 'API validates its intended access token'],
      details: ['OIDC adds authentication semantics and ID tokens for the relying client; an ID token is not an API credential.', 'OAuth grants scoped access and does not prescribe that the access token be a JWT.', 'A resource API accepts a token addressed to it, validating JWT locally or using the issuer’s opaque-token mechanism.'],
      example: 'A SPA signs in with OIDC, obtains an OAuth access token for Orders, and sends that access token—not the ID token—to the Orders API.',
      code: `// Conceptual roles; token formats are independent:
OIDC: client validates ID token where aud == client_id
OAuth: client obtains access token for api://orders
API: validates that access token where aud == api://orders`,
      advantages: ['Clear role separation improves protocol choices', 'Works with either JWT or opaque access tokens'],
      disadvantages: ['Terminology and similarly named tokens confuse implementers', 'Incorrect audience or token-type handling can expose APIs'],
      use: 'Use OIDC for user sign-in, OAuth access tokens for delegated or application API access, and treat JWT only as one possible token format.',
      avoid: 'Avoid treating OAuth alone as an identity protocol or assuming every access token is a JWT.',
      questions: ['Which item is a format rather than a protocol?', 'What is the purpose and audience of an ID token?', 'Can an OAuth access token be opaque?'],
      scenario: 'A client sends its ID token to a microservice because both are JWTs; reject the wrong token type and audience, configure an API access-token acquisition flow, and verify resource server validation.',
      note: 'A token’s meaning comes from the protocol, issuer, audience, and resource contract—not simply its three-part appearance.',
      takeaways: ['JWT is a format; OAuth is delegated authorization; OIDC adds authentication.', 'ID tokens are for the OIDC client; access tokens are for a resource.', 'Access tokens may be JWT or opaque.'],
      mistakes: ['Calling every JWT an access token.', 'Using an ID token as authorization to an API because it is signed.'],
      practices: ['Use protocol libraries and issuer metadata rather than parsing tokens to infer purpose.', 'Validate token audience and expected token type at each boundary.'],
      sources: [{ label: 'OAuth 2.0 RFC 6749', url: 'https://www.rfc-editor.org/rfc/rfc6749' }, { label: 'OpenID Connect Core 1.0', url: 'https://openid.net/specs/openid-connect-core-1_0.html' }],
    }),
    lesson({
      id: 'oauth-2-authorization', title: 'OAuth 2.0 Authorization', priority: 'Very High',
      summary: 'OAuth 2.0 lets a client obtain limited access to a protected resource without sharing the resource owner’s password with that client.',
      concepts: [
        'OAuth 2.0 is an authorization framework involving a client, authorization server, resource owner, and resource server.',
        'Scoped delegation limits what a client can request and allows the authorization server to issue access without exposing the user’s password to the client.',
        'Interactive public clients should use Authorization Code with PKCE and validate state; confidential services use an appropriate client authentication flow such as Client Credentials, while the resource API enforces the granted access.',
      ],
      flow: ['Client requests narrow authorization', 'Authorization server authenticates and issues token', 'Resource API validates access and permission'],
      details: ['The client requests a specific resource and minimal scope from an authorization server.', 'The authorization server applies user authentication, consent, client registration, and grant policy before issuing credentials.', 'The API validates that the access token is intended for it and enforces scopes and resource access.'],
      example: 'A reporting client requests orders.read, receives a token through Authorization Code with PKCE, and cannot use that token for the Billing API.',
      code: `GET /authorize?response_type=code&client_id=reporting
  &redirect_uri=https%3A%2F%2Fapp.example%2Fcallback
  &scope=orders.read&state=<unpredictable-value>
  &code_challenge=<S256-PKCE-challenge>
POST /token  // redeem one-time code with code_verifier`,
      advantages: ['Delegates limited access without password sharing', 'Scopes, audiences, and consent provide policy boundaries'],
      disadvantages: ['Redirect and token flows have security-sensitive parameters', 'Stolen bearer tokens can be replayed until expiry or revocation'],
      use: 'Use Authorization Code with PKCE for interactive public clients and supported workload grants for services.',
      avoid: 'Avoid Resource Owner Password Credentials, custom token protocols, broad scopes, and treating OAuth alone as user identity.',
      questions: ['What are the roles in OAuth?', 'Why use PKCE?', 'What distinguishes an access token from an authorization code?'],
      scenario: 'A native app can no longer protect a client secret; register it as a public client and use Authorization Code with PKCE, exact redirect URIs, minimal scopes, and API audience checks.',
      note: 'OAuth describes authorization flows, not a required access-token serialization.',
      takeaways: ['OAuth delegates access; it does not define user authentication claims by itself.', 'PKCE protects authorization-code redemption.', 'The API is responsible for enforcing token permissions.'],
      mistakes: ['Embedding a confidential client secret in a public SPA or mobile app.', 'Assuming a requested scope guarantees authorization to every record.'],
      practices: ['Use established identity platform libraries and exact redirect URI registration.', 'Request only necessary scopes and validate audience at each API.'],
      sources: [{ label: 'RFC 6749: The OAuth 2.0 Authorization Framework', url: 'https://www.rfc-editor.org/rfc/rfc6749' }, { label: 'RFC 7636: PKCE', url: 'https://www.rfc-editor.org/rfc/rfc7636' }],
    }),
    lesson({
      id: 'oidc-user-sign-in', title: 'OpenID Connect & User Sign-In', priority: 'Very High',
      summary: 'OpenID Connect adds an interoperable identity layer to OAuth 2.0 so a client can validate a user authentication result.',
      concepts: [
        'OpenID Connect (OIDC) is a protocol for user authentication built on OAuth 2.0 and signaled by requesting the openid scope.',
        'A validated identity result lets the client establish a sign-in session without handling the identity provider’s password directly.',
        'Use Authorization Code with PKCE where appropriate, validate state and nonce, validate the ID token’s signature, issuer, client audience, expiry, and nonce, then create the application session and obtain separate access tokens for APIs.',
      ],
      flow: ['Client initiates OIDC request', 'Provider authenticates and returns code', 'Client validates ID token and establishes session'],
      details: ['The authorization request includes openid scope, state, nonce, and PKCE parameters according to client type.', 'The provider authenticates the user and returns an authorization code to the registered callback.', 'The client validates protocol response and ID token, then creates a local session; an API access token has a different audience and purpose.'],
      example: 'The web client uses a validated ID token to complete sign-in and sends a distinct Orders access token to the Orders API.',
      code: `// Prefer maintained ASP.NET Core OIDC middleware.
options.ResponseType = "code";
options.UsePkce = true;
// Validate callback state and ID-token nonce through the middleware;
// do not accept arbitrary tokens or account-link by email alone.`,
      advantages: ['Standard discovery, sign-in flow, and identity claims', 'Integrates with established identity providers and middleware'],
      disadvantages: ['Client must protect protocol state and local session', 'ID tokens are frequently confused with API access tokens'],
      use: 'Use OIDC when an application needs standards-based user authentication.',
      avoid: 'Avoid sending an ID token to an API or trusting unvalidated email or profile claims for account linking.',
      questions: ['What does the openid scope indicate?', 'What is an ID token audience?', 'What do state and nonce protect?'],
      scenario: 'A callback receives a signed ID token intended for a different client; reject it, retain callback state validation, and establish no local session until protocol validation succeeds.',
      note: 'Use the stable issuer-and-subject pair to identify an external account; email addresses can change or be reassigned.',
      takeaways: ['OIDC provides sign-in semantics on OAuth.', 'ID token audience identifies the client, not the API.', 'Validate state, nonce, issuer, audience, signature, and lifetime.'],
      mistakes: ['Using an ID token as a bearer credential to an API.', 'Using email as a permanent external identity key.'],
      practices: ['Use maintained OIDC middleware and discovery metadata.', 'Use (`iss`, `sub`) for federated identity linkage and secure the resulting session.'],
      sources: [{ label: 'OpenID Connect Core 1.0', url: 'https://openid.net/specs/openid-connect-core-1_0.html' }, { label: 'Microsoft identity platform OIDC', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-protocols-oidc' }],
    }),
    lesson({
      id: 'entra-user-sign-in', title: 'Microsoft Entra ID & User Sign-In', priority: 'High',
      summary: 'Microsoft Entra ID is an identity platform that can authenticate users and issue protocol tokens for registered applications and APIs.',
      concepts: [
        'Microsoft Entra ID is Microsoft’s cloud identity and access management service, with tenant, application-registration, and identity-platform capabilities.',
        'Using a managed identity provider centralizes sign-in policy such as MFA and conditional access instead of building password authentication into each application.',
        'Register the client application and redirect URI, use the Microsoft identity platform with OIDC Authorization Code flow and PKCE for public clients, request only needed API scopes, and let the API validate tokens issued for its registration.',
      ],
      flow: ['Register client and API', 'User signs in at Entra', 'Client obtains API-scoped access token'],
      details: ['Application registration defines client identity, redirect URIs, supported account types, and exposed API permissions.', 'Entra authenticates according to tenant policies and returns an authorization response through a supported flow.', 'The client requests a resource-specific access token; the API validates issuer, tenant policy, audience, and authorization claims.'],
      example: 'An employee signs in to an internal portal with Entra; the portal obtains a token for the Inventory API rather than forwarding an ID token.',
      code: `// Client registration configuration (conceptual)
Authority = "https://login.microsoftonline.com/{tenantId}/v2.0";
ClientId = configuration["Entra:ClientId"];
RedirectUri = "https://portal.example/signin-oidc";
// Request only the exposed API scopes needed by this feature.`,
      advantages: ['Centralized identity controls, lifecycle, and policy', 'Standards-based integrations and workload identity options'],
      disadvantages: ['Tenant, consent, and registration settings require operational governance', 'Cloud identity availability and configuration become dependencies'],
      use: 'Use Entra ID for supported organizational and customer identity scenarios when its tenant and account model matches requirements.',
      avoid: 'Avoid hardcoding tenant secrets or assuming all tenants, account types, claims, and consent configurations behave identically.',
      questions: ['What is the distinction between an app registration and a service principal?', 'Which token is sent to the API?', 'Where are MFA and conditional-access policies enforced?'],
      scenario: 'A multi-tenant SaaS begins accepting organizational users; explicitly decide supported tenants, issuer validation, consent, tenant authorization, and account-linking policy before enabling sign-in.',
      note: 'Entra is an identity provider; the application remains responsible for authorization to its own data and operations.',
      takeaways: ['Entra performs identity and token issuance under configured tenant policy.', 'The client needs an API access token, not just an ID token.', 'Tenant and resource authorization are application design decisions.'],
      mistakes: ['Trusting a token because it came from Microsoft without checking tenant and API audience.', 'Confusing authentication registration with application-level permission.'],
      practices: ['Use Microsoft identity libraries and supported platform flows.', 'Treat tenant ID, issuer, audience, scopes, and consent as explicit security configuration.'],
      sources: [{ label: 'Microsoft identity platform overview', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-overview' }, { label: 'Microsoft identity platform authentication flows', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/msal-authentication-flows' }],
    }),
    lesson({
      id: 'entra-aspnetcore-api', title: 'Integrating Entra ID with an ASP.NET Core API', priority: 'Very High',
      summary: 'An ASP.NET Core API integrates with Entra as a resource server: validate bearer access tokens for the API, then apply application authorization.',
      concepts: [
        'An Entra-protected API is a resource server registered with an application ID URI and exposes delegated scopes or application roles.',
        'Configuring the API audience and issuer prevents tokens for another application or tenant from being accepted as API credentials.',
        'Register Microsoft identity Web API authentication or supported JwtBearer options, configure the expected audience/tenant, add authorization policies for scopes or roles, and put UseAuthentication before UseAuthorization.',
      ],
      flow: ['Client requests token for API resource', 'API validates token and creates principal', 'Policy and resource checks authorize request'],
      details: ['The client requests the API’s scope or application permission from Entra, not a generic sign-in token.', 'Bearer middleware uses trusted authority metadata and keys to validate issuer, signature, lifetime, and audience.', 'ASP.NET authorization policies check required delegated scope or app role; domain checks enforce tenant and record ownership.'],
      example: 'A controller requires the Orders.Read scope and then verifies that the current organization may access the specific order.',
      code: `builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://login.microsoftonline.com/{tenantId}/v2.0";
        options.Audience = "api://orders-api";
    });
builder.Services.AddAuthorization(options =>
    options.AddPolicy("Orders.Read", p => p.RequireClaim("scp", "Orders.Read")));
app.UseAuthentication();
app.UseAuthorization();`,
      advantages: ['Standard issuer metadata and key rollover', 'Centralized user and workload identity with API permission models'],
      disadvantages: ['Claim names and issuer behavior vary by token version and flow', 'Misconfigured tenant or audience can either block legitimate callers or trust the wrong tokens'],
      use: 'Use a supported Microsoft identity integration package or carefully configured bearer middleware with explicit tenant and audience policy.',
      avoid: 'Avoid writing custom JWT parsing or accepting any tenant/token based only on a valid signature.',
      questions: ['What does the API audience identify?', 'How do delegated scopes differ from application roles?', 'Why is UseAuthentication ordered before UseAuthorization?'],
      scenario: 'A service token has an app role but no delegated scope; design separate policies for delegated user calls and application-only calls, then test both principal types and tenant boundaries.',
      note: 'Exact claim conventions depend on Entra token version and permission model; inspect documented token claims and configure policies accordingly.',
      takeaways: ['Register the API resource and validate tokens intended for it.', 'Scopes commonly represent delegated permissions; app roles can represent application permissions.', 'Identity provider authorization does not replace record-level checks.'],
      mistakes: ['Validating only the signature and accepting a token for another API.', 'Assuming a scope claim and an app-role claim are interchangeable.'],
      practices: ['Use platform libraries, explicit audience and tenant constraints, and authorization policies.', 'Test anonymous, wrong-audience, wrong-tenant, insufficient-scope, app-only, and user-delegated cases.'],
      sources: [{ label: 'Protect an ASP.NET Core web API with Microsoft identity platform', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/scenario-protected-web-api-overview' }, { label: 'Microsoft.Identity.Web', url: 'https://learn.microsoft.com/en-us/entra/msal/dotnet/microsoft-identity-web/' }],
    }),
    lesson({
      id: 'authentication-vs-authorization', title: 'Authentication vs Authorization', priority: 'Very High',
      summary: 'Authentication establishes a trusted identity; authorization decides what that identity may do to a specific operation or resource.',
      concepts: [
        'Authentication verifies credentials and constructs a principal representing an identity and its validated claims.',
        'Authorization evaluates that principal against endpoint policy and often the target resource, preventing the mistaken assumption that a signed-in user can access all data.',
        'Configure authentication schemes and middleware to establish HttpContext.User, then require authorization policies and perform resource checks for ownership, tenant, or state.',
      ],
      flow: ['Credential is presented', 'Authentication establishes principal', 'Authorization permits or denies requested action'],
      details: ['Authentication validates credentials such as bearer tokens or cookies under a configured scheme.', 'The resulting ClaimsPrincipal is trusted only according to the handler’s validation rules.', 'Authorization evaluates requirements for the operation and may load a target resource for a decision.'],
      example: 'A valid employee token authenticates the caller, but the API denies access to a payroll record outside that caller’s authorized division.',
      code: `[Authorize(Policy = "Payroll.Read")]
[HttpGet("{id:int}")]
public async Task<ActionResult<PayrollDto>> Get(int id)
{
    var record = await repository.FindAsync(id);
    if (record is null) return NotFound();
    return await authorization.AuthorizeAsync(User, record, "DivisionAccess")
        ? Ok(PayrollDto.From(record)) : Forbid();
}`,
      advantages: ['Clear separation makes policy and identity independently testable', 'Resource checks support least privilege'],
      disadvantages: ['Valid credentials alone do not ensure correct data isolation', 'Policy drift across endpoints can create gaps'],
      use: 'Authenticate every protected request and authorize every sensitive operation and target resource.',
      avoid: 'Avoid treating a successful login or token signature as blanket data permission.',
      questions: ['What does authentication establish?', 'When is resource-based authorization needed?', 'What is the normal distinction between 401 and 403?'],
      scenario: 'A user can retrieve another tenant’s record by changing an identifier; add resource/tenant authorization after authentication and test guessed IDs across tenants.',
      note: 'A 401 response indicates missing or unacceptable authentication; 403 means the authenticated principal is not allowed, subject to deliberate resource-concealment policy.',
      takeaways: ['Authentication identifies; authorization decides access.', 'Policies and resource checks both matter.', 'Use 401 and 403 for different failure conditions.'],
      mistakes: ['Checking only that User.Identity.IsAuthenticated is true.', 'Trusting client-provided user or tenant IDs as identity evidence.'],
      practices: ['Apply default-deny policies to protected route groups.', 'Test authorization with realistic cross-tenant and role combinations.'],
      sources: [{ label: 'Authorization in ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction' }],
    }),
    lesson({
      id: 'roles-vs-policy-authorization', title: 'Role vs Policy Authorization', priority: 'High',
      summary: 'Roles provide coarse identity groupings; policies express named requirements and can combine claims, roles, and custom handlers.',
      concepts: [
        'A role is a claim-like grouping of principals, while an authorization policy is a named set of requirements evaluated by ASP.NET Core.',
        'Policies model permissions and contextual rules more flexibly than embedding scattered role checks in endpoint code.',
        'Use roles for stable coarse group membership, policy requirements for capabilities and combinations, and resource-based handlers when permission depends on a loaded record.',
      ],
      flow: ['Principal carries validated claims', 'Policy evaluates requirements', 'Handler grants or denies operation'],
      details: ['The identity provider supplies trusted role or permission claims after token validation.', 'A policy combines requirements such as role, claim, authentication strength, or custom logic.', 'Authorization handlers evaluate context and can inspect the particular resource; successful authorization requires all policy requirements to succeed.'],
      example: 'An administrator role may access a general diagnostics endpoint, while a policy for editing an invoice also requires matching tenant ownership.',
      code: `builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Invoices.Read",
        p => p.RequireClaim("permission", "invoice.read"));
});
[Authorize(Policy = "Invoices.Read")]`,
      advantages: ['Named policies centralize and test rules', 'Custom requirements scale beyond role-only checks'],
      disadvantages: ['Overly broad role claims can grant excess access', 'Custom handlers need clear failure behavior and observability'],
      use: 'Use policies for application capabilities and resource handlers for ownership, tenant, or workflow state.',
      avoid: 'Avoid trusting client-supplied roles or scattering magic-string role checks through business logic.',
      questions: ['How does a role differ from a policy?', 'When does a requirement need a resource handler?', 'Do policy requirements combine with AND or OR semantics by default?'],
      scenario: 'A permission model evolves from admin/user roles to tenant-scoped features; introduce named policies and resource handlers with migration tests before removing legacy role checks.',
      note: 'Multiple requirements in one policy must succeed; use explicit requirement design for alternative permission paths.',
      takeaways: ['Roles are one input to authorization, not a complete model.', 'Policies express reusable named requirements.', 'Resource-specific permissions need resource-aware checks.'],
      mistakes: ['Using broad administrator roles for ordinary user capabilities.', 'Assuming a policy that checks a role also checks record ownership.'],
      practices: ['Centralize capability names and policy registration.', 'Unit-test handlers and integration-test endpoint policy behavior.'],
      sources: [{ label: 'Policy-based authorization in ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies' }],
    }),
    lesson({
      id: 'access-vs-refresh-tokens', title: 'Access Tokens vs Refresh Tokens', priority: 'Very High',
      summary: 'Access tokens are presented to resource APIs; refresh tokens are high-value credentials used with the authorization server to obtain renewed access.',
      concepts: [
        'An access token is a credential for a particular resource server and carries or references authorization; a refresh token is a credential for renewing access at the authorization server.',
        'Keeping access tokens short-lived limits the window of exposure, while protecting refresh tokens and rotating them helps detect replay and revoke sessions.',
        'The client sends access tokens only to their intended API and presents refresh credentials only to the token issuer over TLS; provider policy controls rotation, expiry, and revocation.',
      ],
      flow: ['Client uses access token at API', 'Access expires or nears expiry', 'Client redeems protected refresh token at issuer'],
      details: ['The API validates an access token addressed to its audience and never redeems a refresh token.', 'Expiration ends the credential’s accepted validity, subject to issuer and API validation; refresh may be constrained by session and risk policy.', 'Rotation issues a replacement and invalidates prior refresh credentials; reuse detection can revoke a token family.'],
      example: 'A browser application obtains a fresh API token through the identity provider’s supported session and refresh-token policy rather than posting refresh tokens to an API.',
      code: `// Access token: Authorization: Bearer <resource access token>
// Refresh token: submit only to the configured authorization server's
// supported token endpoint; never send it to the resource API.`,
      advantages: ['Short access-token lifetime limits routine exposure', 'Refresh rotation can detect stolen-token replay'],
      disadvantages: ['Refresh-token theft has prolonged account impact', 'Rotation and concurrent refreshes require issuer/client coordination'],
      use: 'Use provider-supported refresh-token policy and secure storage; revoke sessions or token families when compromise is suspected.',
      avoid: 'Avoid treating a refresh token like an ordinary API token or persisting it in an insecure browser location.',
      questions: ['Which token is sent to the resource API?', 'Why rotate refresh tokens?', 'What should happen when a rotated token is reused?'],
      scenario: 'Telemetry identifies reuse of a refresh token after rotation; revoke the affected token family, investigate session compromise, and verify refresh concurrency and reauthentication recovery.',
      note: 'Refresh-token availability and rotation rules vary by identity provider, client type, and grant; follow provider guidance.',
      takeaways: ['Access and refresh tokens have distinct recipients and purposes.', 'Refresh tokens are especially sensitive credentials.', 'Expiry and revocation are separate controls.'],
      mistakes: ['Sending a refresh token as a bearer credential to a business API.', 'Assuming a short access lifetime alone prevents refresh-token theft.'],
      practices: ['Use least-privilege access tokens, provider rotation, and revocation.', 'Design refresh concurrency and replay responses, then monitor and test them.'],
      sources: [{ label: 'OAuth 2.0 Security Best Current Practice (RFC 9700)', url: 'https://www.rfc-editor.org/rfc/rfc9700' }],
    }),
    lesson({
      id: 'token-expiration-and-rotation', title: 'Token Expiration & Key Rotation', priority: 'High',
      summary: 'Expiration bounds how long a credential is accepted; rotation replaces credentials or signing keys while preserving controlled continuity.',
      concepts: [
        'Token expiration is the validity limit enforced by the issuer and resource server, while key rotation changes the cryptographic material used to sign or verify tokens.',
        'Shorter validity limits exposure but increases renewal traffic and may disrupt long-running work; planned key rollover avoids dependence on one permanent key.',
        'Validate exp and nbf with tightly bounded clock skew, consume trusted key-set updates, support overlapping old/new signing keys during planned rollover, and revoke or deny credentials when compromise requires immediate action.',
      ],
      flow: ['Issuer signs with current key', 'API validates time and trusted key set', 'Rotation overlaps keys and retires old key'],
      details: ['The exp and nbf claims define token acceptance times; systems need synchronized clocks and deliberate skew limits.', 'APIs trust only configured issuer metadata and keys, refreshing keys safely when a key identifier changes.', 'During planned rollover, old verification keys may remain available until prior tokens expire; a compromised key may require accelerated revocation and reauthentication.'],
      example: 'A provider publishes a new signing key; API instances load it from trusted metadata while still validating unexpired tokens signed by the retiring key.',
      code: `options.TokenValidationParameters.ClockSkew = TimeSpan.FromMinutes(2);
// Configure trusted Authority/MetadataAddress and test key rollover;
// do not disable lifetime validation to work around clock drift.`,
      advantages: ['Bounds credential lifetime and reduces impact window', 'Rotation supports cryptographic hygiene and incident recovery'],
      disadvantages: ['Very short validity can cause outages under clock or provider failures', 'Revocation and distributed key propagation are operationally complex'],
      use: 'Choose token lifetimes based on threat, client, and usability needs; automate monitored key rollover and emergency response.',
      avoid: 'Avoid infinite-lived tokens, unbounded clock skew, and ad hoc key changes without overlap or incident plans.',
      questions: ['How is expiration different from revocation?', 'Why can APIs accept old and new keys during rollover?', 'What is the risk of excessive clock skew?'],
      scenario: 'An old signing key is compromised; distinguish routine rollover from emergency compromise, remove trust promptly, invalidate affected sessions as appropriate, and monitor validation failures.',
      note: 'A self-contained JWT generally remains valid until expiry unless the API uses additional revocation or session-state checks.',
      takeaways: ['Expiry bounds normal acceptance; it is not immediate revocation.', 'Planned key rotation needs trusted metadata and overlap.', 'Compromised credentials require an incident response beyond waiting for expiry.'],
      mistakes: ['Disabling lifetime validation to fix an environment clock issue.', 'Assuming a rotated signing key instantly invalidates all previously issued JWTs.'],
      practices: ['Synchronize clocks and use small documented skew.', 'Exercise key rollover and emergency revocation in operational tests.'],
      sources: [{ label: 'Microsoft identity platform signing key rollover', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/signing-key-rollover' }, { label: 'RFC 7519: exp and nbf claims', url: 'https://www.rfc-editor.org/rfc/rfc7519' }],
    }),
    lesson({
      id: 'service-to-service-authentication', title: 'Service-to-Service Authentication', priority: 'High',
      summary: 'Workload identity authenticates an application or service without pretending it is an end user.',
      concepts: [
        'Service-to-service authentication establishes a workload principal, commonly through client credentials, managed identity, workload federation, or mutual TLS.',
        'Machine identities make service access auditable and avoid sharing a human user password; narrow resource permissions limit the impact of a compromised workload.',
        'Prefer managed identity or federation where available, request a short-lived token for the specific downstream audience, validate TLS and destination, and enforce app permission and resource policy at the receiver.',
      ],
      flow: ['Workload proves application identity', 'Issuer returns audience-scoped credential', 'Target validates identity and application permission'],
      details: ['A workload identity is distinct from a delegated user identity and should not impersonate an interactive user.', 'The identity provider issues a token or certificate based on workload trust and configured permissions.', 'The receiving API validates the credential and applies application-level permissions; network location alone does not establish trust.'],
      example: 'A background inventory worker uses its managed identity to obtain an Orders API token with only the required application permission.',
      code: `// Conceptual managed identity token acquisition:
var token = await credential.GetTokenAsync(
    new TokenRequestContext(["api://orders/.default"]),
    cancellationToken);`,
      advantages: ['Avoids embedding long-lived shared secrets', 'Provides distinct audit identity and narrow application permission'],
      disadvantages: ['Identity federation and permission configuration span services', 'Certificate, token, or mesh operations need lifecycle ownership'],
      use: 'Use managed workload identity or federation and narrowly scoped application permissions for machine callers.',
      avoid: 'Avoid committing client secrets, sharing one identity across unrelated workloads, or treating a service mesh as application authorization.',
      questions: ['When is Client Credentials appropriate?', 'How does mTLS differ from a bearer token?', 'Why is a service mesh not a replacement for API authorization?'],
      scenario: 'A client secret leaked from deployment settings; revoke and rotate it, migrate to workload identity, audit downstream permissions, and inspect logs for its prior use.',
      note: 'mTLS authenticates a transport peer; OAuth access tokens can represent application permissions. They may be combined but solve different protocol concerns.',
      takeaways: ['Machine identity is not a user identity.', 'Use short-lived and audience-specific credentials.', 'The target service still makes an authorization decision.'],
      mistakes: ['Using a developer’s personal token in a scheduled job.', 'Assuming a private subnet or service-mesh identity alone authorizes every operation.'],
      practices: ['Assign a distinct workload identity per trust boundary.', 'Rotate/revoke credentials and continuously review granted app roles and scopes.'],
      sources: [{ label: 'Microsoft identity platform Client Credentials flow', url: 'https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow' }],
    }),
    lesson({
      id: 'api-key-security', title: 'API Keys', priority: 'High',
      summary: 'An API key identifies or gates a client integration but is a bearer secret and usually does not provide end-user identity or fine-grained authorization.',
      concepts: [
        'An API key is a shared credential issued to a client and presented with requests so a service can identify, meter, or restrict that client.',
        'Keys are simple for controlled integrations but can be copied and replayed; possession alone does not prove a human identity or justify access to a particular user’s records.',
        'Transmit keys only over TLS, store and rotate them as secrets, scope and rate-limit them where supported, compare securely, and combine them with user or workload authorization for sensitive operations.',
      ],
      flow: ['Client retrieves protected key', 'Request presents key over TLS', 'Gateway/API checks key and applies limits'],
      details: ['An issued key must be stored outside source control and protected in the client environment.', 'The server authenticates key possession, maps it to a client record, and checks active status and permitted use.', 'A separate authorization decision still limits data and actions; logs should record a safe key identifier, never the secret value.'],
      example: 'A partner webhook uses a rotated, partner-specific key for initial client identification, while signed payload verification and resource authorization protect business operations.',
      code: `// Prefer an authorization header, not a URL query parameter.
request.Headers.Authorization = new AuthenticationHeaderValue("ApiKey", apiKey);
// Server stores a verifier/hash where feasible; redact the credential from logs.`,
      advantages: ['Simple integration and client metering', 'Supports independent revocation for partner credentials'],
      disadvantages: ['Bearer secret theft enables replay', 'Weak identity and authorization semantics if used alone'],
      use: 'Use API keys for bounded client identification or low-risk integration access with rotation and abuse controls.',
      avoid: 'Avoid using a single static API key as sole authorization for sensitive user data or embedding a secret in public browser/mobile code.',
      questions: ['What does an API key establish?', 'Why should a key not be placed in a URL?', 'How should key rotation avoid an integration outage?'],
      scenario: 'A public JavaScript bundle exposes a key; revoke it, review usage, assume it was public, move privileged access behind a trusted backend, and issue independently revocable partner credentials.',
      note: 'A key is a credential, not encryption; hashing stored keys helps limit database disclosure but does not prevent replay of a stolen plaintext key.',
      takeaways: ['API keys are bearer secrets with limited identity semantics.', 'Do not expose privileged keys in public clients or URLs.', 'Pair key checks with authorization, rotation, and rate limits.'],
      mistakes: ['Logging or committing API keys.', 'Assuming API-key authentication grants per-user permission.'],
      practices: ['Issue per-client keys with revocation, expiration, and least privilege.', 'Use a secrets manager, TLS, redaction, monitoring, and planned rotation.'],
      sources: [{ label: 'OWASP REST Security Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html' }],
    }),
    lesson({
      id: 'sql-injection-prevention', title: 'SQL Injection Prevention', priority: 'Very High',
      summary: 'SQL injection occurs when untrusted input changes query structure; parameterization keeps values data rather than executable SQL.',
      concepts: [
        'SQL injection is a vulnerability where attacker-controlled input is interpreted as part of a SQL command.',
        'An injected query can bypass filters, expose or alter records, or damage data using the application’s database privileges.',
        'Use EF Core LINQ or parameterized commands for values, allow-list any dynamic identifiers or sort expressions that cannot be parameters, minimize database privileges, and test authorization and query behavior.',
      ],
      flow: ['Untrusted input enters data query', 'Parameterized query preserves SQL structure', 'Database executes bounded command under least privilege'],
      details: ['Concatenating a user value into SQL can transform a value into query syntax.', 'A parameter binds a value separately so SQL parsing does not treat its contents as SQL operators.', 'Database permissions and application authorization limit damage but do not replace safe query construction.'],
      example: 'Search for a username using a parameterized equality predicate rather than concatenating it into a WHERE clause.',
      code: `var user = await db.Users
    .SingleOrDefaultAsync(u => u.Name == requestedName, cancellationToken);

// Raw SQL: pass values as parameters; allow-list dynamic column identifiers.`,
      advantages: ['Parameterization blocks value-based SQL syntax injection', 'Least privilege constrains impact of other defects'],
      disadvantages: ['Dynamic identifiers and query composition require careful allow-list design', 'Safe SQL does not prove row-level authorization is correct'],
      use: 'Use ORM expression trees or explicit parameters and pair them with least privilege and resource authorization.',
      avoid: 'Avoid constructing SQL values through string concatenation or accepting arbitrary ORDER BY/table names.',
      questions: ['Why do query parameters prevent SQL injection?', 'Can a parameter safely represent a column name?', 'Does parameterization replace authorization?'],
      scenario: 'A report endpoint builds a sort expression from client input; replace arbitrary SQL fragments with an allow-listed mapping and verify tenant filters are still applied.',
      note: 'Parameterization protects query syntax; it does not by itself prevent an authorized query from returning another tenant’s rows.',
      takeaways: ['Treat all external input as data, never trusted SQL syntax.', 'Parameters represent values, not identifiers.', 'Database least privilege and authorization provide separate layers.'],
      mistakes: ['Using string interpolation in raw SQL for values.', 'Assuming parameterized SQL prevents broken tenant isolation.'],
      practices: ['Review raw SQL and use parameter APIs consistently.', 'Test malicious inputs and cross-tenant access with least-privilege database identities.'],
      sources: [{ label: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' }],
    }),
    lesson({
      id: 'xss-csrf-protection', title: 'XSS & CSRF', priority: 'Very High',
      summary: 'XSS attacks run attacker-controlled script in a user’s browser; CSRF tricks a browser into sending an authenticated action using ambient credentials.',
      concepts: [
        'Cross-Site Scripting (XSS) is execution of untrusted content as script in a trusted origin, while Cross-Site Request Forgery (CSRF) abuses credentials the browser attaches automatically.',
        'XSS can steal accessible tokens or act as the user; CSRF can trigger state changes when a browser automatically sends cookies, even though the attacker may not read the response.',
        'Use context-aware output encoding and safe DOM APIs to prevent XSS; for cookie-authenticated state-changing requests use SameSite cookies as a defense-in-depth measure plus antiforgery tokens or robust origin checks, and never rely on CORS alone.',
      ],
      flow: ['Attacker-controlled content reaches browser', 'Browser credentials or script behavior are abused', 'Encoding, cookie, and request-origin defenses reduce risk'],
      details: ['Unsafe HTML/script sinks can turn stored or reflected untrusted text into executable code in the application origin.', 'Cookies may be automatically attached to a cross-site request; bearer tokens explicitly held by script have different CSRF exposure but remain vulnerable to XSS theft.', 'Contextual encoding and safe rendering reduce XSS; antiforgery/origin and SameSite controls address cookie-based CSRF but require correct deployment.'],
      example: 'A browser app renders a comment as text, while a cookie-authenticated transfer endpoint requires a server-validated antiforgery token.',
      code: `// Frontend: render untrusted text through framework interpolation/textContent, not innerHTML.
// ASP.NET Core cookie-authenticated MVC:
services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");
// Validate the token on state-changing endpoints; configure cookie policy deliberately.`,
      advantages: ['Layered browser controls address distinct attack classes', 'Safe templating and antiforgery middleware reduce repeated mistakes'],
      disadvantages: ['Security depends on rendering context and cookie architecture', 'SameSite or CORS settings alone do not cover every browser flow'],
      use: 'Use safe output encoding for all untrusted content and antiforgery controls when browsers attach authentication cookies automatically.',
      avoid: 'Avoid treating sanitization as universal, disabling browser protections, or assuming bearer-token storage is safe from XSS.',
      questions: ['How does CSRF differ from XSS?', 'Why can HttpOnly cookies help against token theft but not CSRF?', 'Does CORS prevent CSRF?'],
      scenario: 'A comment page introduces stored markup and a cookie-authenticated delete endpoint; render content as text, retain robust CSP as defense in depth, and require server-validated antiforgery protection for state changes.',
      note: 'CSRF defenses depend on credential transport; APIs using cookies and APIs using explicitly attached bearer tokens have different exposure, while XSS remains a major client risk.',
      takeaways: ['XSS executes script; CSRF abuses ambient browser credentials.', 'HttpOnly limits JavaScript reads but does not prevent the browser sending cookies.', 'CORS is not an authorization or universal CSRF defense.'],
      mistakes: ['Using raw HTML rendering for untrusted text.', 'Assuming SameSite or an uncredentialed CORS policy makes all state changes safe.'],
      practices: ['Use framework auto-escaping, context-aware encoding, CSP, and safe DOM APIs.', 'For cookie auth, implement and test antiforgery and origin controls for unsafe methods.'],
      sources: [{ label: 'OWASP Cross Site Scripting Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' }, { label: 'ASP.NET Core antiforgery', url: 'https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery' }],
    }),
    lesson({
      id: 'api-rate-limiting', title: 'API Rate Limiting', priority: 'High',
      summary: 'Rate limiting bounds request consumption to protect service capacity and fairness, but it does not replace authorization or broader abuse defenses.',
      concepts: [
        'Rate limiting constrains how many requests or how much work a caller may consume during a defined interval.',
        'Limits reduce accidental overload and some abusive traffic, preserving capacity for legitimate callers and downstream dependencies.',
        'Choose fixed-window, sliding-window, token-bucket, or concurrency limits based on workload; partition by trusted identity or client, apply limits at the appropriate distributed layer, return 429 with useful retry metadata where appropriate, and monitor rejected traffic.',
      ],
      flow: ['Identify caller and operation cost', 'Apply partitioned limit or queue policy', 'Allow request or reject with 429'],
      details: ['A partition key should come from a validated principal or trusted gateway, not an attacker-controlled header.', 'The limiter accounts for request volume, burst behavior, or concurrent work based on a deliberate algorithm.', 'Rejected calls receive a clear status and observability; distributed deployments may need gateway/shared coordination.'],
      example: 'Partition expensive search requests by authenticated customer and also apply a global concurrency cap on the database-intensive operation.',
      code: `builder.Services.AddRateLimiter(options =>
{
    options.AddTokenBucketLimiter("search", limiter =>
    {
        limiter.TokenLimit = 30;
        limiter.TokensPerPeriod = 10;
        limiter.ReplenishmentPeriod = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
});
app.UseRateLimiter();`,
      advantages: ['Protects capacity from bursts and noisy clients', 'Can enforce fairness and service tiers'],
      disadvantages: ['Poor limits reject legitimate bursts or enable identity evasion', 'Per-instance memory limits are not automatically globally coordinated'],
      use: 'Limit expensive and abuse-prone operations with identity-aware partitions, global capacity bounds, and observable policy.',
      avoid: 'Avoid relying exclusively on source IP, which may be shared or rotated, or treating rate limiting as permission control.',
      questions: ['How do fixed-window and token-bucket limits differ?', 'Why may an in-memory limiter be insufficient across replicas?', 'What response should a limit rejection use?'],
      scenario: 'A public search API is distributed across ten replicas and IP-based limits are bypassed; add gateway/global protection and authenticated customer partitions, then measure legitimate rejection rates.',
      note: 'Rate limits should complement request-size limits, timeouts, concurrency controls, quotas, authentication, and authorization.',
      takeaways: ['Limit resource consumption, not just request count.', 'Use a trustworthy partition key and account for distributed deployment.', '429 is a load-control response, not an authentication failure.'],
      mistakes: ['Trusting a client-supplied identity header for rate-limit partitioning.', 'Assuming fixed per-instance thresholds create a global quota.'],
      practices: ['Set explicit burst, queue, fairness, and retry behavior.', 'Load-test limits and monitor false positives and downstream health.'],
      sources: [{ label: 'Rate limiting middleware in ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit' }],
    }),
    lesson({
      id: 'password-storage', title: 'Secure Password Storage', priority: 'Very High',
      summary: 'Passwords should be stored as salted, deliberately expensive one-way password hashes, never as plaintext or reversibly encrypted values.',
      concepts: [
        'A password hash is a one-way verifier computed with a password-specific derivation algorithm, unique salt, and work factor.',
        'If a credential database leaks, slow salted hashing raises the cost of guessing and prevents identical passwords from sharing identical stored values.',
        'Use a maintained identity framework and modern password hashing such as Argon2id, scrypt, bcrypt, or PBKDF2 according to policy; store algorithm parameters and salt, compare through the framework, and rehash after successful login when parameters need upgrading.',
      ],
      flow: ['Registration receives password securely', 'Password hasher salts and derives verifier', 'Login recomputes and compares safely'],
      details: ['The application accepts a password only over TLS and does not log or persist the original secret.', 'A unique salt and configurable expensive derivation create a verifier suitable for future parameter upgrades.', 'At login the trusted library verifies the supplied password and can transparently upgrade the stored hash after successful authentication.'],
      example: 'ASP.NET Core Identity manages salted password hashes and format/version metadata, allowing work-factor upgrades without storing recoverable passwords.',
      code: `// Prefer ASP.NET Core Identity's IPasswordHasher<TUser>.
var hash = passwordHasher.HashPassword(user, password);
var result = passwordHasher.VerifyHashedPassword(user, hash, suppliedPassword);
// Never store password or a fast unsalted SHA-256 digest.`,
      advantages: ['Limits damage from database disclosure', 'Parameterized work factors support migration over time'],
      disadvantages: ['Expensive verification consumes CPU and needs abuse controls', 'Legacy hashes require careful migration and reset policy'],
      use: 'Use a maintained identity framework and an approved adaptive password-hashing algorithm with current parameters.',
      avoid: 'Never store plaintext, reversible-encrypted passwords, or fast general hashes such as bare SHA-256.',
      questions: ['Why must each password have a unique salt?', 'Why are password hashes deliberately slow?', 'How should an application upgrade hashing parameters?'],
      scenario: 'A credential database is exfiltrated; preserve forensic evidence, force risk-based resets, invalidate sessions, assess hash parameters, and upgrade the verifier strategy without exposing passwords to operators.',
      note: 'A pepper can add protection when stored separately in a secret manager, but it does not replace a salt and adaptive password hash.',
      takeaways: ['Store password verifiers, never passwords.', 'Use unique salts and adaptive password hashing.', 'Rehash and respond to compromise through controlled identity lifecycle.'],
      mistakes: ['Using a fast hash or reversible encryption for password storage.', 'Logging passwords or sending them to analytics/error telemetry.'],
      practices: ['Delegate hashing and verification to ASP.NET Core Identity or a vetted library.', 'Add login throttling, MFA options, breach response, and secure secret handling.'],
      sources: [{ label: 'ASP.NET Core Identity configuration', url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration' }, { label: 'OWASP Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' }],
    }),
    lesson({
      id: 'frontend-token-storage', title: 'Frontend Token Storage', priority: 'Very High',
      summary: 'Browser token storage is a threat-model trade-off: script-readable storage exposes tokens to XSS, while cookie-based sessions require CSRF protections.',
      concepts: [
        'Frontend token storage is the mechanism by which a browser client retains an access or session credential between requests.',
        'Any credential available to JavaScript can be exfiltrated by successful XSS; cookies marked HttpOnly reduce script access but are automatically attached by the browser and therefore require CSRF defenses.',
        'Prefer a backend-for-frontend with a server-side token store and secure HttpOnly, Secure, SameSite cookies for high-risk browser applications; otherwise use provider-recommended in-memory token handling, short lifetimes, CSP/XSS controls, and never place credentials in URLs or logs.',
      ],
      flow: ['Choose browser credential architecture', 'Protect token from script or ambient abuse', 'Attach credential to intended requests'],
      details: ['LocalStorage persists across page loads and is readable by same-origin script; sessionStorage is also script-readable.', 'HttpOnly cookies cannot be read by JavaScript but browsers attach them automatically according to cookie rules.', 'BFF keeps provider tokens server-side and gives the browser a protected session cookie; all designs still require XSS defenses and suitable CSRF controls.'],
      example: 'A BFF stores OAuth tokens server-side and returns an HttpOnly Secure session cookie; unsafe browser requests also carry a validated antiforgery token.',
      code: `// Cookie-based BFF session: tune for deployment and browser requirements.
options.Cookie.HttpOnly = true;
options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
options.Cookie.SameSite = SameSiteMode.Lax;
// Add antiforgery protection to state-changing requests.`,
      advantages: ['HttpOnly/BFF designs keep long-lived provider tokens out of JavaScript', 'In-memory access tokens reduce persistent exposure compared with localStorage'],
      disadvantages: ['Cookie sessions create CSRF considerations', 'BFF adds server state, proxying, and operational complexity'],
      use: 'Choose storage based on the client architecture, threat model, and provider guidance; for sensitive browser apps strongly consider a BFF.',
      avoid: 'Avoid putting refresh tokens or privileged credentials in localStorage, URLs, source bundles, or telemetry.',
      questions: ['Why does HttpOnly reduce but not eliminate browser risk?', 'How does a cookie-based design affect CSRF?', 'What does a BFF change about token exposure?'],
      scenario: 'A security review finds long-lived refresh tokens in localStorage; revoke active tokens, migrate to a BFF or supported safer browser pattern, add XSS and CSRF controls, and plan session reauthentication.',
      note: 'No browser storage choice makes an application immune to active same-origin XSS; architecture reduces exposure but does not replace prevention.',
      takeaways: ['JavaScript-readable storage is vulnerable to token theft through XSS.', 'HttpOnly cookies reduce script access but are ambient credentials.', 'BFF, CSRF, XSS, and session lifecycle must be designed together.'],
      mistakes: ['Calling localStorage secure because it is not a cookie.', 'Assuming HttpOnly prevents CSRF or prevents malicious same-origin actions.'],
      practices: ['Use short-lived, least-privilege tokens and avoid persistent browser secrets.', 'Apply CSP, safe rendering, cookie flags, antiforgery validation, and session revocation.'],
      sources: [{ label: 'OAuth 2.0 for Browser-Based Applications (IETF draft)', url: 'https://datatracker.ietf.org/doc/draft-ietf-oauth-browser-based-apps/' }, { label: 'OWASP Session Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' }],
    }),
    lesson({
      id: 'broken-object-authorization', title: 'Broken Object-Level Authorization (BOLA)', priority: 'Very High',
      summary: 'BOLA occurs when an API checks who the caller is but fails to check whether they may access the specific record they requested.',
      concepts: [
        'Object-level authorization verifies that the authenticated caller may perform this operation on this particular resource.',
        'An endpoint-level role check does not stop one authorized user from reading or changing another tenant’s order, invoice, or profile.',
        'Scope the data lookup by the caller’s trusted tenant or ownership context, then enforce the operation policy. Return a consistent not-found or forbidden response according to the API’s disclosure policy.',
      ],
      flow: ['Authenticate caller', 'Resolve resource within authorized scope', 'Authorize operation', 'Return only permitted data'],
      details: ['A valid token establishes identity and claims; it does not prove access to every object ID.', 'Prefer querying by both resource ID and trusted tenant/owner ID so unauthorized records are not loaded accidentally.', 'Apply the same rule to reads, updates, deletes, exports, nested resources, and background jobs.'],
      example: 'A customer can read only orders in their own tenant, even if they guess or receive another order ID.',
      code: `var tenantId = currentUser.GetRequiredTenantId();
var order = await db.Orders
    .SingleOrDefaultAsync(
        x => x.Id == orderId && x.TenantId == tenantId,
        cancellationToken);

if (order is null)
    return NotFound();`,
      advantages: ['Enforces least privilege at the resource boundary', 'Tenant-scoped queries reduce accidental data exposure'],
      disadvantages: ['Rules must be consistently applied across every access path', 'Incorrect tenant or ownership claims can still invalidate the boundary'],
      use: 'Authorize every object access using server-trusted identity and ownership data, including nested and asynchronous operations.',
      avoid: 'Avoid relying on opaque IDs, UI filtering, route-level authentication, or client-supplied tenant IDs as authorization.',
      questions: ['Why is authentication insufficient to prevent BOLA?', 'Where should tenant scoping be enforced?', 'How do you test cross-tenant access?'],
      scenario: 'A penetration test discovers that changing an order ID returns another tenant’s record. Add tenant-scoped repository queries, audit all read/write/export paths, invalidate exposed credentials if needed, and add cross-tenant regression tests.',
      note: 'BOLA is an authorization failure, not a token-format problem. Random IDs can reduce guessing but never replace access checks.',
      takeaways: ['Authorize the object and action, not just the endpoint.', 'Derive tenant scope from validated server-side identity.', 'Test both allowed and denied cross-tenant cases.'],
      mistakes: ['Checking only that a user has the Customer role.', 'Trusting tenantId in the request body or query string.', 'Protecting GET while leaving update, delete, export, or background paths unscoped.'],
      practices: ['Centralize resource access policies and scope data queries.', 'Use negative authorization tests with two distinct tenants.', 'Audit logs should identify actor and resource without recording sensitive payloads.'],
      sources: [{ label: 'OWASP API1: Broken Object Level Authorization', url: 'https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/' }],
    }),
    lesson({
      id: 'ssrf-defense', title: 'Server-Side Request Forgery (SSRF)', priority: 'Very High',
      summary: 'SSRF abuses a server feature that fetches a caller-influenced destination, potentially crossing network trust boundaries.',
      concepts: [
        'SSRF occurs when a server makes a network request using an attacker-influenced URL or destination without adequate destination controls.',
        'The server may reach internal services or cloud metadata endpoints that an external caller cannot access directly; a syntactically valid URL is not necessarily a safe destination.',
        'Prefer mapping a validated business identifier to a fixed trusted endpoint. If arbitrary destinations are essential, enforce strict scheme/host allowlists, safe DNS/IP validation, redirect restrictions, response limits, timeouts, and outbound network controls.',
      ],
      flow: ['Caller supplies or influences destination', 'Server validates destination and request purpose', 'Egress policy restricts reachable networks', 'Bound response and record safe telemetry'],
      details: ['Application-level checks alone can be bypassed by redirects, DNS changes, alternate IP encodings, or parser differences.', 'Egress controls should block loopback, link-local, private, and metadata ranges unless explicitly required.', 'Never forward internal credentials or unrestricted headers to a destination selected by an untrusted caller.'],
      example: 'A report API accepts a partner ID and resolves it to a preconfigured partner endpoint instead of accepting an arbitrary fetch URL.',
      code: `// Map an approved business key to configuration; do not fetch a caller URL.
if (!partnerEndpoints.TryGetValue(partnerId, out Uri? endpoint))
    return BadRequest("Unknown partner.");

using var request = new HttpRequestMessage(HttpMethod.Get, endpoint);
using var response = await httpClient.SendAsync(
    request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
response.EnsureSuccessStatusCode();`,
      advantages: ['Fixed destinations sharply reduce the reachable attack surface', 'Network egress restrictions add defense if application validation fails'],
      disadvantages: ['Legitimate dynamic-fetch use cases need careful destination governance', 'DNS, redirect, proxy, and IPv6 behavior require operational testing'],
      use: 'Use fixed integrations where possible; otherwise combine strict allowlisting with network-level egress enforcement and bounded requests.',
      avoid: 'Avoid accepting arbitrary URLs for server-side fetching or assuming a hostname string check is sufficient.',
      questions: ['Why can a backend reach destinations unavailable to a browser?', 'How can redirects undermine a host allowlist?', 'Why are egress controls important in addition to URL validation?'],
      scenario: 'A document-preview service fetches arbitrary URLs. Disable arbitrary fetching, rotate any credentials that may have been exposed, review egress logs, replace URLs with approved document IDs, and restrict outbound access at the network layer.',
      note: 'The safest SSRF defense is not making a request to a user-selected destination at all.',
      takeaways: ['Treat outbound destinations as security-sensitive input.', 'Prefer a fixed endpoint selected by trusted configuration.', 'Use network egress controls as an independent security layer.'],
      mistakes: ['Blocking only a few literal IP strings.', 'Following redirects without revalidating the destination.', 'Returning raw internal response bodies or forwarding caller credentials.'],
      practices: ['Use dedicated outbound clients with short timeouts and response-size limits.', 'Disable redirects or validate every redirect target and resolved address.', 'Restrict workload egress and test DNS, IPv4/IPv6, proxies, and metadata protections.'],
      sources: [{ label: 'OWASP SSRF Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' }],
    }),
    lesson({
      id: 'credential-stuffing-defense', title: 'Credential Stuffing & Brute-Force Defense', priority: 'High',
      summary: 'Credential stuffing reuses leaked username/password pairs, while brute-force attacks repeatedly guess credentials; layered controls limit account takeover and abuse.',
      concepts: [
        'Credential stuffing tests previously exposed credentials against another service; brute force attempts many candidate passwords against an account or login surface.',
        'A correct password alone may not indicate a legitimate user because passwords are reused and automated traffic can create large request volumes.',
        'Use adaptive throttling, account-aware and network-aware rate limits, MFA or passkeys, breached-password screening, generic error responses, secure password hashing, and risk-based alerts. Avoid permanent lockouts that attackers can weaponize for denial of service.',
      ],
      flow: ['Detect repeated or anomalous sign-in attempts', 'Apply layered throttling and risk checks', 'Require stronger proof when risk is elevated', 'Alert and protect account recovery'],
      details: ['IP-only limits are insufficient because attackers distribute traffic; account-only hard locks can deny service to victims.', 'MFA reduces the value of a stolen password but recovery flows must be equally protected.', 'Log security outcomes with privacy-aware identifiers; never log passwords or full tokens.'],
      example: 'An identity service applies short account-aware throttles, network reputation signals, MFA for risky sign-ins, and monitored recovery instead of exposing whether an email address exists.',
      code: `services.Configure<IdentityOptions>(options =>
{
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.AllowedForNewUsers = true;
});

// Also configure gateway limits, MFA/risk controls, and safe recovery.
// Avoid exposing account existence in login or reset responses.`,
      advantages: ['Layered friction reduces automated account takeover', 'Risk-based responses can be less disruptive to legitimate users'],
      disadvantages: ['Strict thresholds can lock out real users or be abused for denial of service', 'Detection and recovery require careful privacy and support operations'],
      use: 'Protect login, MFA, and recovery endpoints with adaptive controls and monitor attack patterns across accounts and networks.',
      avoid: 'Avoid relying only on CAPTCHA, IP blocks, a single hard lockout threshold, or password complexity rules.',
      questions: ['How does credential stuffing differ from brute force?', 'Why can account lockout become a denial-of-service vector?', 'Which controls should protect password reset as well as login?'],
      scenario: 'A credential-stuffing wave causes many failed logins and support calls. Add adaptive rate limits and MFA challenges, use generic user-facing errors, monitor distributed patterns, protect recovery endpoints, and communicate account remediation without disclosing sensitive details.',
      note: 'Rate limits slow abuse; MFA, safe recovery, password hygiene, and detection reduce the chance and impact of account takeover.',
      takeaways: ['Assume passwords may be reused or exposed elsewhere.', 'Use multiple signals and controls rather than one threshold.', 'Secure account recovery to the same standard as sign-in.'],
      mistakes: ['Using only IP throttling against distributed traffic.', 'Permanently locking accounts after a small number of failures.', 'Leaking account existence through different login and reset responses.'],
      practices: ['Use MFA/passkeys, breached-password checks, adaptive throttling, and secure password hashing.', 'Apply controls to login, MFA verification, registration, and recovery.', 'Alert on distributed failure patterns and provide a safe account recovery path.'],
      sources: [{ label: 'OWASP Credential Stuffing Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html' }],
    }),
    lesson({
      id: 'mass-assignment-defense', title: 'Mass Assignment & Over-Posting', priority: 'High',
      summary: 'Mass assignment occurs when an API binds untrusted request fields directly to a domain or persistence object, allowing callers to set fields they should not control.',
      concepts: [
        'Over-posting is an unsafe binding pattern where extra request properties are accepted and mapped to privileged or internal fields.',
        'A normal update endpoint may unintentionally let a caller change ownership, approval state, account role, or price if those fields exist on the bound entity.',
        'Use purpose-specific request DTOs with only editable fields, validate them, and assign changes explicitly after authorization. Enforce important invariants in the domain and database as well.',
      ],
      flow: ['Receive a narrow request DTO', 'Validate allowed fields', 'Authorize the requested change', 'Map explicitly to domain state'],
      details: ['Binding a persistence entity exposes the entity’s writable surface as the API contract.', 'A DTO is an allowlist; new entity properties do not automatically become client-editable.', 'Authorization and business invariants remain necessary even with a narrow DTO.'],
      example: 'A profile update accepts display name and phone number but never accepts IsAdmin, TenantId, or approval status.',
      code: `public sealed record UpdateProfileRequest(
    string DisplayName,
    string? PhoneNumber);

var profile = await profiles.GetForUserAsync(userId, cancellationToken);
if (profile is null) return NotFound();

profile.ChangeDisplayName(request.DisplayName);
profile.ChangePhoneNumber(request.PhoneNumber);`,
      advantages: ['Makes the writable API surface explicit', 'Prevents new internal entity properties from being implicitly exposed'],
      disadvantages: ['Requires deliberate mapping and DTO maintenance', 'A DTO does not replace authorization or domain validation'],
      use: 'Create separate input contracts for create, update, and privileged operations; map only authorized fields.',
      avoid: 'Avoid binding HTTP request bodies directly to EF entities or using broad reflection-based property copying for sensitive updates.',
      questions: ['Why is an EF entity a risky request model?', 'How does a DTO reduce over-posting?', 'What other checks are still required after using a DTO?'],
      scenario: 'A user can change an approval flag through an update endpoint. Remove entity binding, constrain the request DTO, add an authorized approval command, review audit logs, and test that privileged fields in extra JSON properties are ignored or rejected.',
      note: 'Input shape is an authorization boundary: only fields deliberately exposed should be writable.',
      takeaways: ['Treat request DTOs as field-level allowlists.', 'Map changes explicitly after authorization.', 'Protect business invariants beyond the API binding layer.'],
      mistakes: ['Using one entity as both persistence model and public API contract.', 'Copying every matching property from request to entity.', 'Assuming client-side forms prevent crafted requests.'],
      practices: ['Use separate DTOs and commands for privileged state changes.', 'Reject or ignore unexpected fields consistently and test the behavior.', 'Add domain and database constraints for critical invariants.'],
      sources: [{ label: 'OWASP Mass Assignment Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html' }],
    }),
  ],
};
