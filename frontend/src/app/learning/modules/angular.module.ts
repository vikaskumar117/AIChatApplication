import { LearningModule, LearningTopic, topic } from '../learning.models';

type DiagramStep = { label: string; detail: string };

function detailedTopic(
  id: string,
  title: string,
  priority: LearningTopic['priority'],
  summary: string,
  concepts: LearningTopic['concepts'],
  flow: string[],
  example: string,
  code: string,
  tradeoffs: LearningTopic['tradeoffs'],
  guidance: LearningTopic['guidance'],
  questions: string[],
  scenario: string,
  sources: NonNullable<LearningTopic['sources']>,
  diagram: DiagramStep[],
  diagramNote: string,
  exampleSteps: string[],
  commonMistakes: string[],
  bestPractices: string[],
): LearningTopic {
  return topic(id, title, priority, summary, concepts, flow, example, code, tradeoffs, guidance,
    questions, scenario, sources, {
      diagram,
      diagramNote,
      exampleSteps,
      keyTakeaways: concepts,
      commonMistakes,
      bestPractices,
      summary: `${concepts[0]} ${concepts[1]}`,
    });
}

const rxjsDocs = 'https://rxjs.dev/guide/overview';
const angularHttpDocs = 'https://angular.dev/guide/http';

export const angularModule: LearningModule = {
  id: 'angular',
  title: 'Angular',
  description: 'Architect Angular applications with deliberate state, HTTP, routing, forms, and rendering choices.',
  topics: [
    detailedTopic('rxjs-subject-vs-behavior-subject', 'Subject vs BehaviorSubject', 'Very High',
      'Choose a multicast primitive by its late-subscriber contract, not simply because a value is shared.',
      [
        'A Subject is both an Observer and an Observable: calling next broadcasts to current subscribers, but it does not retain a current value. A BehaviorSubject additionally requires a seed and synchronously emits its latest value to each new subscriber.',
        'Replay determines whether a consumer starting late can render immediately. This matters for current state such as the selected account, while replaying transient events can incorrectly repeat commands or notifications.',
        'Both subjects multicast and remain open until completed, errored, or unsubscribed. Hide writable subjects behind Observable APIs; prefer signals or a store for synchronous state when a stream contract is not needed.',
      ],
      ['Choose a stream contract', 'Publish an event or current value', 'Existing observers receive the emission', 'Late observers receive only the BehaviorSubject current value'],
      'A route-level account selector needs a current account for a component that subscribes after initialization; a toast event should not replay to a later page.',
      `private readonly accountSubject = new BehaviorSubject<Account | null>(null);
readonly account$ = this.accountSubject.asObservable();

selectAccount(account: Account): void {
  this.accountSubject.next(account);
}`,
      [['BehaviorSubject provides immediate current state to late subscribers', 'Subject is a lightweight event broadcast'], ['A writable subject can create hidden shared mutation', 'BehaviorSubject seed and stale values can misrepresent loading or logout state']],
      ['Use BehaviorSubject when consumers need the latest value and a stream API is intentional; use Subject for non-replay events.', 'Avoid exposing either subject as a public writable API or treating completion as automatic component cleanup.'],
      ['What does a late subscriber receive from each type?', 'Why is a Subject not automatically application state?', 'How should a service expose a BehaviorSubject safely?'],
      'A page opened after account selection must show the selected account immediately, but a newly mounted notification panel must not replay old toasts. Give the two needs separate stream contracts and test late subscriptions.',
      [{ label: 'Model intent', url: rxjsDocs }, { label: 'BehaviorSubject API', url: 'https://rxjs.dev/api/index/class/BehaviorSubject' }],
      [
        { label: 'Select primitive', detail: 'Determine whether consumers need a durable current value or only future events.' },
        { label: 'Publish', detail: 'next(value) synchronously multicasts to observers active at emission time.' },
        { label: 'Subscribe', detail: 'Subject supplies no past value; BehaviorSubject sends its current value on subscription.' },
        { label: 'Own lifetime', detail: 'Complete service-owned streams deliberately and dispose component subscriptions with async pipe or takeUntilDestroyed.' },
      ],
      'The first emission is part of the API contract: a BehaviorSubject can replay state, while a Subject represents events.',
      ['Expose account$ as read-only observable.', 'Use null or an explicit state union when “no account” is meaningful.', 'Use async pipe or takeUntilDestroyed for component-owned subscriptions.'],
      ['A Subject is not a cache; late subscribers miss prior events.', 'Do not seed BehaviorSubject with a fake domain object merely to avoid nullable state.', 'Do not use a BehaviorSubject as a generic global store without defining ownership.'],
      ['Keep the subject private and expose asObservable().', 'Represent loading, success, and failure explicitly when consumers need more than a nullable value.', 'Choose replay intentionally for commands versus durable state.']),

    detailedTopic('observable-vs-promise', 'Observable vs Promise', 'Very High',
      'Observable and Promise represent different asynchronous contracts: a single eventual result versus a lazy, composable sequence.',
      [
        'A Promise settles once with a value or error; an Observable can emit zero, one, or many values and then complete or error. Angular HttpClient observables normally emit one response and complete, but share the Observable contract.',
        'Observables are lazy by default: subscribing starts execution, and separate subscriptions can start separate executions. Promises represent work already started when created and cannot be cancelled through the standard Promise API.',
        'Use Promise for naturally single-result APIs and async/await control flow. Use Observable for cancellation, repeated events, operator composition, and Angular HTTP; convert only at a clear boundary because conversion changes completion and error handling.',
      ],
      ['Choose single or sequence contract', 'Create or subscribe to work', 'Handle next/value and errors', 'Complete or cancel according to the contract'],
      'A typeahead benefits from Observable cancellation and debounce; a one-off browser API wrapper may be easier to consume as a Promise.',
      `const user$ = this.http.get<User>('/api/users/42');
const user = await firstValueFrom(user$);`,
      [['Observable operators model time, retries, and cancellation', 'Promise syntax is concise for one eventual result'], ['Promises have no standard cancellation', 'Unsubscribing an Observable does not undo server work already performed']],
      ['Use Observable when the source can emit repeatedly, must be cancelled, or composes with Angular streams; use Promise for a true one-shot boundary.', 'Avoid converting a long-lived stream with firstValueFrom or lastValueFrom unless its emission and completion semantics are guaranteed.'],
      ['When does an Observable execute?', 'Can a Promise be cancelled?', 'What must be true before using lastValueFrom?'],
      'A search box issues a new request for every keystroke. Keep it as an Observable so switchMap can replace stale client work; use a Promise for a single confirmation dialog result that settles exactly once.',
      [{ label: 'RxJS overview', url: rxjsDocs }, { label: 'Angular HTTP', url: angularHttpDocs }],
      [
        { label: 'Define cardinality', detail: 'Decide whether the operation is a single settlement or a sequence over time.' },
        { label: 'Start work', detail: 'Promise-producing code commonly starts immediately; a cold Observable starts on subscription.' },
        { label: 'Consume outcome', detail: 'Promise uses await/then; Observable uses subscription, pipe operators, or async pipe.' },
        { label: 'End work', detail: 'Promise has no built-in cancellation; unsubscribe can cancel Observable delivery and supported underlying work.' },
      ],
      'HttpClient observables are usually one-response streams, but remain lazy and cancellable until completion.',
      ['Subscribe once or share deliberately when multiple consumers must not duplicate a cold request.', 'Use firstValueFrom only for a guaranteed first emission and lastValueFrom only for a stream that completes.', 'Keep errors in the same model as the chosen abstraction.'],
      ['Assuming every Observable is infinite or every HTTP observable is shared.', 'Using lastValueFrom on a stream that never completes.', 'Assuming Promise.race cancels the losing operation.'],
      ['Treat emission count, completion, and cancellation as explicit API contracts.', 'Prefer async pipe for template consumption and compose streams before subscribing.', 'Use an AbortSignal-aware API when Promise-based work must support cancellation.']),

    detailedTopic('cancel-http-requests', 'Cancel In-Flight HTTP Requests', 'Very High',
      'Cancel obsolete client-side work to avoid stale rendering and wasted resources, while distinguishing client abort from server rollback.',
      [
        'Angular HttpClient returns cold Observables. Unsubscribing before completion aborts the in-progress browser request where the backend supports it; it does not guarantee that the server did not receive or finish processing the request.',
        'switchMap unsubscribes the previous inner Observable when a newer source value arrives, making it appropriate for replaceable reads such as search. takeUntilDestroyed ends work when its Angular owner is destroyed.',
        'Cancellation is not a substitute for server idempotency, authorization, or transaction semantics. Do not cancel writes casually; a client abort can leave outcome unknown and require reconciliation.',
      ],
      ['A new intent arrives', 'switchMap unsubscribes obsolete inner request', 'Browser transport is aborted when possible', 'Only the current response updates the view'],
      'For live search, a newer query supersedes the older query; for a submitted payment, cancellation cannot establish whether the payment committed.',
      `readonly results$ = this.query$.pipe(
  debounceTime(250),
  distinctUntilChanged(),
  switchMap(query => this.http.get<Result[]>('/api/search', {
    params: { query }
  }))
);`,
      [['Prevents stale read results from winning races', 'Reduces unnecessary client/network work'], ['Server may still process an aborted request', 'switchMap is wrong when every write must be observed']],
      ['Use switchMap for replaceable reads, and async pipe or takeUntilDestroyed for owner-bound subscriptions.', 'Avoid interpreting unsubscribe as rollback or using switchMap for non-idempotent commands that must all complete.'],
      ['What exactly does HttpClient unsubscription cancel?', 'Why is switchMap a good fit for typeahead?', 'Why might mergeMap be safer than switchMap for writes?'],
      'A slow prior search finishes after a fast newer one. switchMap removes the old subscription, and the UI renders only the newest response; verify server behavior separately for any mutation endpoints.',
      [{ label: 'Angular HTTP requests', url: angularHttpDocs }, { label: 'switchMap API', url: 'https://rxjs.dev/api/operators/switchMap' }],
      [
        { label: 'Observe intent', detail: 'Each new query or selected identifier represents the latest desired read.' },
        { label: 'Replace inner work', detail: 'switchMap unsubscribes its previous inner subscription before subscribing to the new request.' },
        { label: 'Abort supported transport', detail: 'HttpClient propagates teardown to the browser backend when the request is still in flight.' },
        { label: 'Render current result', detail: 'A cancelled request cannot deliver a later next notification to this subscription.' },
      ],
      'Client cancellation controls observation and may abort transport; it cannot promise server-side cancellation or rollback.',
      ['Debounce and deduplicate user input before issuing requests.', 'Use switchMap only when newer intent supersedes earlier work.', 'Use idempotency keys and server-side status checks for critical writes.'],
      ['Starting a request inside an unmanaged nested subscribe.', 'Using switchMap for every POST/PUT even when all operations must finish.', 'Assuming unsubscribe proves a mutation was not applied.'],
      ['Prefer stream composition over manual subscription replacement.', 'Tie component-owned streams to the component lifetime.', 'Design mutation APIs for retries, idempotency, and ambiguous client disconnects.']),

    detailedTopic('parallel-api-calls', 'Call APIs Simultaneously', 'High',
      'Compose independent requests concurrently, and choose a join operator whose completion and failure semantics match the page contract.',
      [
        'Independent HttpClient requests can be created together and subscribed as a group. forkJoin is the common choice for finite HTTP calls when the screen needs one aggregate after every request has emitted and completed.',
        'Concurrency reduces wall-clock latency from roughly the sum of request durations toward the slowest request, but increases simultaneous load and can hit rate limits. Dependencies should remain sequential.',
        'forkJoin emits one tuple/object only after every input completes; any input error errors the aggregate and unsubscribes siblings. Catch errors inside individual inputs when partial data is acceptable.',
      ],
      ['Identify independent dependencies', 'Subscribe to all requests together', 'Wait for each finite request to complete', 'Render combined result or modeled partial failures'],
      'A profile page loads identity, preferences, and feature flags independently and displays them together after the responses arrive.',
      `readonly pageData$ = forkJoin({
  user: this.http.get<User>('/api/me'),
  preferences: this.http.get<Preferences>('/api/preferences'),
  flags: this.http.get<Flags>('/api/flags')
});`,
      [['Concurrent latency for independent reads', 'Typed aggregate is easy to bind'], ['One failure fails forkJoin by default', 'Launching too many calls can overload dependencies']],
      ['Use forkJoin for a finite set of independent requests whose results are needed together.', 'Avoid it for never-completing streams or dependencies where a later request needs an earlier result.'],
      ['When does forkJoin emit?', 'What happens if one request errors?', 'How should a dependent request be composed?'],
      'A dashboard loads three independent widgets. Start them concurrently, catch expected per-widget failures inside each source if partial rendering is required, and avoid blocking on an unrelated long-lived stream.',
      [{ label: 'forkJoin API', url: 'https://rxjs.dev/api/index/function/forkJoin' }, { label: 'Angular HTTP', url: angularHttpDocs }],
      [
        { label: 'Map dependencies', detail: 'Separate independent reads from requests whose parameters depend on another response.' },
        { label: 'Construct cold requests', detail: 'Create each HttpClient Observable without starting it prematurely.' },
        { label: 'Join concurrently', detail: 'forkJoin subscribes to inputs together and records each final emitted value.' },
        { label: 'Publish aggregate', detail: 'After every input completes, emit one typed result or propagate the aggregate error.' },
      ],
      'Concurrency is appropriate for independent finite work; it is not the same as sequencing dependent API calls.',
      ['Use object form to retain meaningful property names and inferred types.', 'Put catchError inside each input when failures should become per-field result states.', 'Limit concurrency for large collections rather than creating an unbounded request fan-out.'],
      ['Passing an interval or other non-completing source to forkJoin and waiting forever.', 'Catching only outside forkJoin when partial results are required.', 'Running all API calls concurrently when one requires another response.'],
      ['Use switchMap/concatMap to express dependencies and ordering.', 'Represent loading, success, and partial error explicitly.', 'Keep cancellation and owner lifetime in the subscription chain.']),

    detailedTopic('forkjoin-combinelatest-merge', 'forkJoin vs combineLatest vs merge', 'Very High',
      'These operators combine sources with different timing contracts: final values, latest snapshots, or interleaved emissions.',
      [
        'forkJoin waits for every source to complete, then emits their last values once. combineLatest waits until every source has emitted, then emits a new tuple whenever any source emits, using each source’s latest value.',
        'merge forwards each source emission independently as it arrives; it does not create a tuple or wait for all sources. Each operator preserves Observable completion/error rules, and a source error normally errors the result.',
        'Use forkJoin for finite initialization batches, combineLatest for continuously changing derived views, and merge for a unified event stream. Select by cardinality and completion, not by a vague notion of “combining.”',
      ],
      ['Choose output shape', 'Subscribe to sources', 'Wait, snapshot, or interleave according to operator', 'Handle completion and errors'],
      'Load initial settings with forkJoin, derive a filtered view from filters and live data with combineLatest, and merge independent refresh events when only event order matters.',
      `const initial$ = forkJoin([user$, settings$]);
const view$ = combineLatest([filters$, rows$]);
const events$ = merge(refreshClick$, reconnect$);`,
      [['Each operator expresses a distinct timing contract', 'Correct choice makes UI update behavior predictable'], ['Wrong operator can never emit or emit too often', 'combineLatest retains latest values and may recompute frequently']],
      ['Use forkJoin for completed finite inputs, combineLatest for latest-state recomputation, and merge for interleaved events.', 'Avoid combineLatest when any source may never emit without providing a deliberate initial value.'],
      ['Which operator emits only once after completion?', 'Why does combineLatest wait before its first emission?', 'Does merge produce a tuple?'],
      'A route combines an HTTP-loaded catalog with a live filter form. forkJoin loads finite initial resources; combineLatest drives the filtered view as either filters or rows change.',
      [{ label: 'forkJoin', url: 'https://rxjs.dev/api/index/function/forkJoin' }, { label: 'combineLatest', url: 'https://rxjs.dev/api/index/function/combineLatest' }, { label: 'merge', url: 'https://rxjs.dev/api/index/function/merge' }],
      [
        { label: 'Inspect source lifetimes', detail: 'Determine whether inputs are finite HTTP calls, ongoing state, or event streams.' },
        { label: 'Inspect desired shape', detail: 'Decide between one final tuple, repeated latest-value tuples, and one interleaved event stream.' },
        { label: 'Select operator', detail: 'forkJoin waits for completion; combineLatest waits for first values; merge forwards as values arrive.' },
        { label: 'Verify edge cases', detail: 'Check empty, never-emitting, completing, and erroring sources against the required UI behavior.' },
      ],
      'The distinguishing questions are when the first output is possible, how many outputs follow, and what completion means.',
      ['Seed state streams when a latest-value output is required immediately.', 'Use named object properties for forkJoin aggregates when supported by the project RxJS version.', 'Test error and completion behavior, not only happy-path values.'],
      ['Expecting merge to synchronize inputs into a tuple.', 'Expecting combineLatest to emit before each source has emitted once.', 'Using forkJoin with a long-lived stream that never completes.'],
      ['Write down each source’s cardinality and completion behavior before choosing.', 'Use map after combination to derive a view model.', 'Place error recovery at the level where partial versus total failure is decided.']),

    detailedTopic('angular-api-errors', 'Handle API Errors', 'Very High',
      'Treat HTTP failures as typed application states, preserving useful diagnostics while presenting safe, actionable user feedback.',
      [
        'HttpClient reports transport, timeout, and non-success responses through HttpErrorResponse on the Observable error channel. A status of 0 commonly represents network-level failure; status codes and server payloads require contextual interpretation.',
        'catchError can transform, recover, or rethrow an error. Catch at the boundary that knows whether to provide a fallback, retry a transient failure, or surface an error state; avoid swallowing failures into apparently valid empty data.',
        'Production handling separates user-safe messages from diagnostic detail, preserves correlation identifiers, and avoids logging credentials or sensitive response bodies. Retry only bounded, transient, preferably idempotent operations.',
      ],
      ['Request emits or errors', 'Classify transport and response failure', 'Recover or map to explicit error state', 'Show safe feedback and record sanitized diagnostics'],
      'A dashboard can show one failed widget beside successful widgets, while a failed authorization request should not be converted into an empty successful result.',
      `readonly report$ = this.http.get<Report>('/api/report').pipe(
  retry({ count: 2, delay: (_, attempt) => timer(attempt * 500) }),
  catchError((error: HttpErrorResponse) => {
    this.logger.warn('Report load failed', { status: error.status });
    return throwError(() => error);
  })
);`,
      [['Central policies improve consistency', 'Explicit error states make recovery possible'], ['Retries can duplicate non-idempotent writes', 'Overly broad catches hide defects and mislead users']],
      ['Use catchError to model a deliberate fallback or rethrow; retry only known transient, safe operations with bounds.', 'Avoid exposing raw server messages, credentials, or stack details to users.'],
      ['What does HttpErrorResponse status 0 often indicate?', 'Where should catchError be placed for partial widget failure?', 'When is retry unsafe?'],
      'An analytics screen has independent panels. Each panel maps its own failure to retryable local state so one outage does not erase successful results; logs include status and correlation data but not tokens or private payloads.',
      [{ label: 'Angular HTTP', url: angularHttpDocs }, { label: 'catchError API', url: 'https://rxjs.dev/api/operators/catchError' }],
      [
        { label: 'Receive failure', detail: 'HTTP errors arrive on the Observable error channel rather than as normal response values.' },
        { label: 'Classify', detail: 'Distinguish network/timeout, authorization, validation, throttling, and server failures.' },
        { label: 'Choose recovery', detail: 'Retry only bounded transient operations; otherwise map to a typed state or rethrow.' },
        { label: 'Communicate safely', detail: 'Give users actionable copy and emit sanitized telemetry for investigation.' },
      ],
      'Error placement controls whether failures are local to one request or terminate the larger composed stream.',
      ['Keep loading, success, empty, and error states distinct.', 'Use exponential backoff with jitter and Retry-After awareness where appropriate.', 'Attach request/correlation IDs to diagnostics without logging secrets.'],
      ['Returning of([]) for every failure and making outages look like empty data.', 'Retrying every status or blindly retrying POST requests.', 'Displaying raw backend error payloads to end users.'],
      ['Handle expected errors at the narrowest boundary that can recover meaningfully.', 'Keep unexpected errors observable for centralized diagnostics.', 'Make retry limits and user recovery paths explicit.']),

    detailedTopic('angular-http-interceptors', 'HTTP Interceptors', 'Very High',
      'Functional interceptors provide an ordered shared pipeline for cross-cutting request and response policies.',
      [
        'An HttpInterceptorFn receives an immutable HttpRequest and a next handler, then returns an Observable<HttpEvent<unknown>>. Clone requests to change headers or parameters; responses and errors flow back through the chain.',
        'Interceptors centralize concerns such as correlation IDs, trusted-origin credentials, timing, and consistent transport error mapping. Ordering matters: each interceptor wraps downstream processing and can observe the transformed result.',
        'Register functional interceptors with provideHttpClient(withInterceptors([...])). Keep feature business rules in services; refresh/retry logic needs recursion protection, bounded retries, and coordination across simultaneous failures.',
      ],
      ['Request enters ordered chain', 'Interceptor clones or observes request', 'Backend executes downstream handler', 'Response or error unwinds through interceptors'],
      'A correlation interceptor tags requests and measures latency without embedding telemetry code in each feature service.',
      `export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  const id = inject(CorrelationIds).create();
  return next(req.clone({ setHeaders: { 'X-Correlation-ID': id } }));
};

provideHttpClient(withInterceptors([correlationInterceptor]));`,
      [['One policy across feature services', 'Composable request and response instrumentation'], ['Ordering and retries can be difficult to reason about', 'Global logic can hide feature-specific behavior']],
      ['Use functional interceptors for transport-wide behavior and register their order intentionally.', 'Avoid unbounded retries, business-specific decisions, and logging sensitive headers.'],
      ['Why are HttpRequest objects cloned?', 'How does interceptor order affect request/response flow?', 'What prevents refresh requests from recursively invoking refresh logic?'],
      'Several APIs need correlation IDs and common telemetry. Add a functional interceptor, verify ordering with a test backend, and ensure the telemetry output redacts authorization and personal data.',
      [{ label: 'Angular interceptors', url: 'https://angular.dev/guide/http/interceptors' }, { label: 'Angular HTTP', url: angularHttpDocs }],
      [
        { label: 'Register policy', detail: 'Configure functional interceptors in a deliberate order with the application HttpClient.' },
        { label: 'Clone immutable request', detail: 'Requests are immutable; clone to add headers, params, or a controlled context value.' },
        { label: 'Delegate', detail: 'Call next(request) exactly as the chain contract requires and retain the returned event stream.' },
        { label: 'Observe unwind', detail: 'Use RxJS operators on the returned stream for response timing or scoped error handling.' },
      ],
      'An interceptor is a wrapper around a request/response Observable, not a mutable global callback.',
      ['Prefer functional interceptors for explicit dependency injection and predictable configuration.', 'Use HttpContextToken for opt-out or per-request policy flags.', 'Test both outgoing request mutations and response/error behavior.'],
      ['Mutating a request object instead of cloning it.', 'Retrying every request indefinitely or refreshing on the refresh endpoint itself.', 'Logging full headers or bodies containing credentials and personal data.'],
      ['Keep the chain narrow and ordered.', 'Protect recursive flows with explicit request context or endpoint policy.', 'Separate transport concerns from domain decisions.']),

    detailedTopic('attach-jwt-angular', 'Attach JWTs to Requests Safely', 'Very High',
      'Attach an access token only to requests that are intended for the trusted API, and keep token storage and transport risks explicit.',
      [
        'A JWT is a signed claims container, not encrypted by default; its claims can be read by anyone holding it. A bearer token grants authority to whoever possesses it until expiry or revocation policy takes effect.',
        'A functional interceptor can read an access token from an injected authentication abstraction and clone a request with an Authorization: Bearer header. Restrict attachment by trusted origin and exclude token/refresh endpoints as appropriate.',
        'Prefer short-lived access tokens and a backend-for-frontend or secure, HttpOnly, SameSite cookie strategy when architecture allows. Local storage exposes tokens to successful XSS; cookie approaches require deliberate CSRF protections. Never treat client-side JWT decoding as authorization.',
      ],
      ['Build trusted API request', 'Check destination and auth policy', 'Read current access token', 'Clone request with bearer header only when allowed'],
      'A SPA calls its own API and a third-party image service; the bearer token is attached only to the API origin.',
      `export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const trusted = new URL(req.url, location.origin).origin === 'https://api.example.com';
  const token = inject(AuthSession).accessToken();
  return next(trusted && token
    ? req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } })
    : req);
};`,
      [['Centralized attachment prevents per-service omissions', 'Origin checks reduce accidental credential disclosure'], ['XSS can steal JavaScript-readable tokens', 'Bearer tokens remain usable if leaked until policy expires them']],
      ['Use an explicit trusted-origin allowlist and a narrowly scoped token provider.', 'Avoid storing long-lived tokens in browser storage or attaching credentials to arbitrary URLs.'],
      ['Why must an interceptor restrict token destinations?', 'Is a JWT encrypted?', 'What are the main trade-offs between bearer storage and HttpOnly cookies?'],
      'A feature introduces a third-party upload endpoint. Test that its origin never receives Authorization, and ensure decoded client claims only influence UX while the server enforces permissions.',
      [{ label: 'Angular interceptors', url: 'https://angular.dev/guide/http/interceptors' }, { label: 'OWASP JWT Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html' }],
      [
        { label: 'Resolve destination', detail: 'Normalize relative URLs and compare the resulting origin against an allowlist.' },
        { label: 'Apply auth policy', detail: 'Skip public routes and authentication endpoints that must not receive the current bearer token.' },
        { label: 'Attach credential', detail: 'Clone the immutable request and set the standard Authorization Bearer header.' },
        { label: 'Enforce server-side', detail: 'The API validates signature, issuer, audience, expiry, and authorization on every protected request.' },
      ],
      'Origin validation must account for relative URLs, absolute URLs, and any supported API base paths.',
      ['Use HTTPS everywhere and short-lived, least-privilege access tokens.', 'Keep token acquisition behind an injectable auth abstraction.', 'Have the server validate claims and permissions; client decoding is not trust.'],
      ['Sending the token to every host because an interceptor sees every HttpClient request.', 'Assuming JWT payload encryption or trusting decoded claims client-side.', 'Logging or persisting bearer credentials unnecessarily.'],
      ['Prefer secure server-managed session patterns where feasible.', 'If using cookies, design CSRF defenses and SameSite policy deliberately.', 'Redact authorization headers from logs, traces, and error reports.']),

    detailedTopic('token-expiration', 'Token Expiration and Refresh', 'Very High',
      'Handle expiry as an authentication lifecycle with race control, bounded replay, and secure failure behavior.',
      [
        'An access token’s exp claim indicates the time after which a conforming server should reject it, but the client clock can be skewed and a decoded token is not proof of validity. The server remains authoritative.',
        'Refresh may occur proactively near expiry or reactively after an eligible 401. Concurrent failures should share a single refresh operation; retry each original request at most once and exclude refresh endpoints to prevent recursion.',
        'Refresh tokens are high-value credentials. Prefer secure HttpOnly cookie or server-side session designs where possible; rotate and revoke refresh credentials on the server. On refresh failure, clear local authenticated state and return the user to a safe sign-in flow.',
      ],
      ['Request receives eligible 401', 'Join or start single refresh operation', 'Update credential/session state', 'Replay original request once or terminate session'],
      'Five API calls expire together; a single-flight refresh prevents five competing token rotations and each original call is retried at most once.',
      `const refresh$ = this.refreshInFlight ??= this.auth.refresh().pipe(
  tap(token => this.auth.storeAccessToken(token)),
  finalize(() => this.refreshInFlight = undefined),
  shareReplay({ bufferSize: 1, refCount: false })
);`,
      [['Seamless renewal can reduce avoidable sign-ins', 'Single-flight refresh handles concurrent failures'], ['Refresh races can invalidate rotated credentials', 'Replay may duplicate a mutation or loop on persistent 401']],
      ['Coordinate one refresh, replay an eligible request once, and fail closed when refresh fails.', 'Avoid infinite 401 retries or trusting client-side exp checks as security enforcement.'],
      ['Why should simultaneous 401 responses share refresh work?', 'How do you prevent a refresh loop?', 'What should happen when refresh fails?'],
      'A token rotation endpoint revokes the previous refresh token. Under concurrent 401s, serialize or share refresh, preserve request context, and verify that failed refresh clears session state without exposing tokens in logs.',
      [{ label: 'Angular interceptors', url: 'https://angular.dev/guide/http/interceptors' }, { label: 'OWASP Session Management', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html' }],
      [
        { label: 'Detect eligible failure', detail: 'Distinguish expired access from authorization denial, public endpoint errors, and refresh-endpoint failures.' },
        { label: 'Coordinate refresh', detail: 'Reuse one in-flight refresh Observable or serialize rotation to avoid competing refresh-token use.' },
        { label: 'Update session', detail: 'Store only the new access credential according to the chosen threat model and invalidate stale state.' },
        { label: 'Replay once or sign out', detail: 'Retry the original request once with loop protection; otherwise clear auth state and surface sign-in.' },
      ],
      'JWT exp can inform UX scheduling, but only the server can decide whether a credential is valid.',
      ['Use short-lived access credentials and server-side refresh rotation/revocation.', 'Mark requests already refreshed to prevent loops and cap replay at one.', 'Treat replay safety separately for mutations; use server idempotency where needed.'],
      ['Launching one refresh per failed request.', 'Refreshing on every 401, including invalid permissions and the refresh endpoint.', 'Assuming a client-side expiry timer prevents server rejection or clock skew.'],
      ['Define an explicit refresh state machine and test concurrent failures.', 'Clear session data on refresh failure and do not leave a half-authenticated UI.', 'Exclude credentials from logs and telemetry.']),

    detailedTopic('angular-lifecycle-hooks', 'Angular Lifecycle Hooks', 'High',
      'Lifecycle hooks mark specific points in a component or directive’s creation, input processing, rendering, and destruction.',
      [
        'Angular constructs a component, assigns inputs, checks the view, and eventually destroys it. Hooks such as ngOnChanges, ngOnInit, ngAfterViewInit, and ngOnDestroy are callbacks for those phases, not arbitrary scheduling utilities.',
        'Choose a hook according to dependency readiness: input-dependent work belongs in ngOnChanges or an input transform/signal; one-time setup belongs in ngOnInit; DOM/view-dependent work belongs after view initialization; owned cleanup belongs at destruction.',
        'Modern Angular also offers render callbacks such as afterNextRender for DOM work. Avoid expensive work in frequently-run checking hooks. Use DestroyRef/takeUntilDestroyed to bind cleanup to the correct owner.',
      ],
      ['Inputs are assigned', 'Angular checks component and view', 'Render-dependent work runs at the appropriate phase', 'Owner is destroyed and resources are cleaned up'],
      'A chart needs a rendered host element, while data derived from an input must respond to every relevant input change.',
      `private readonly destroyRef = inject(DestroyRef);

ngOnInit(): void {
  this.feed.events$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(event => this.apply(event));
}`,
      [['Hooks clarify readiness and ownership', 'DestroyRef offers concise lifecycle-bound cleanup'], ['Misplaced work causes stale inputs or DOM timing bugs', 'Heavy checked hooks can dominate render cost']],
      ['Use the narrowest hook matching input, view, or destruction readiness.', 'Avoid subscriptions and expensive computation in ngDoCheck or repeated after-check hooks.'],
      ['When are initial inputs available?', 'Why is ngAfterViewInit appropriate for view queries?', 'How can a service subscription follow component destruction?'],
      'A reusable chart receives changing data and owns a live stream. Recompute from input changes, initialize chart integration only when its host exists, and dispose observers/third-party instances with DestroyRef.',
      [{ label: 'Angular component lifecycle', url: 'https://angular.dev/guide/components/lifecycle' }],
      [
        { label: 'Create instance', detail: 'Constructor and field initializers should establish dependencies and simple local state.' },
        { label: 'React to inputs', detail: 'ngOnChanges receives input changes; initial input values are available before ngOnInit.' },
        { label: 'Use initialized view', detail: 'After view initialization, view queries are available for DOM-dependent integration.' },
        { label: 'Release ownership', detail: 'On destroy, stop subscriptions and dispose resources owned by the instance.' },
      ],
      'A hook signals a lifecycle phase; it does not make arbitrary asynchronous work safe or automatically clean up resources.',
      ['Prefer input-driven derivations over copying input values once in ngOnInit.', 'Use afterNextRender for DOM work that must follow rendering.', 'Tie subscriptions and imperative resources to DestroyRef.'],
      ['Reading a view query before it is initialized.', 'Assuming ngOnInit runs again whenever an input changes.', 'Doing network or expensive computation in ngDoCheck.'],
      ['Keep constructors free of work that depends on inputs or rendered DOM.', 'Make cleanup ownership explicit.', 'Use lifecycle hooks sparingly when declarative signals or template bindings suffice.']),

    detailedTopic('angular-change-detection', 'Change Detection', 'Very High',
      'Change detection synchronizes template bindings with application state; performance depends on what gets checked and how state changes are observed.',
      [
        'Angular evaluates template expressions for views considered eligible for checking and applies changed binding values to the DOM. A state mutation alone is not universally a notification; Angular must know that relevant work may have occurred.',
        'Events, input updates, async pipe emissions, and signal writes read by a template provide notification paths. OnPush narrows eligibility but does not mean “never check”; Angular traverses marked paths and checks the relevant view.',
        'Use stable, immutable state boundaries, signals or async pipe, and profiling to find expensive templates. Avoid forcing detectChanges to conceal missing notification or ownership; schedule external-library callbacks through a supported Angular integration when necessary.',
      ],
      ['State or event changes', 'Angular marks affected view path', 'Eligible bindings are evaluated', 'Changed values update the DOM'],
      'A callback from a non-Angular widget updates a signal read by the template, so the state change has an explicit rendering notification.',
      `readonly count = signal(0);

increment(): void {
  this.count.update(value => value + 1);
}`,
      [['Understanding eligibility makes rendering predictable', 'Signals and async pipe provide explicit notifications'], ['Broad checks can cost time in large trees', 'Manual detection can mask broken state boundaries']],
      ['Use Angular-observed events, signals, and async pipe; profile before optimizing.', 'Avoid repeated detectChanges calls and direct DOM writes that diverge from template state.'],
      ['What does change detection do?', 'Why does an external callback sometimes leave a view stale?', 'How do async pipe and signal updates notify Angular?'],
      'A legacy chart fires a callback outside the usual Angular event path. Update a template-read signal or bridge into Angular’s scheduling model, then verify the affected view with profiling rather than adding global forced checks.',
      [{ label: 'Angular change detection', url: 'https://angular.dev/best-practices/skipping-subtrees' }],
      [
        { label: 'Mutate owned state', detail: 'A user event, signal write, input update, or stream emission changes application state.' },
        { label: 'Notify Angular', detail: 'Angular receives a supported notification and marks relevant views for checking.' },
        { label: 'Evaluate eligible views', detail: 'The tree traversal checks eligible views while respecting subtree skipping rules.' },
        { label: 'Commit DOM updates', detail: 'Only bindings whose values changed require corresponding DOM updates.' },
      ],
      'A change in memory and a request to render are related but distinct; use supported notification mechanisms.',
      ['Keep template expressions cheap and move nontrivial derivation into computed values or memoized selectors.', 'Use track/trackBy identity to preserve repeated-view instances.', 'Use Angular DevTools and production-like profiling to validate improvements.'],
      ['Assuming every object mutation triggers every view.', 'Calling detectChanges as a general-purpose fix for stale state.', 'Measuring only development mode or synthetic microbenchmarks.'],
      ['Use immutable updates at component boundaries when reference identity matters.', 'Adopt signals/async pipe for explicit reactive rendering.', 'Optimize measured bottlenecks rather than applying blanket manual detection.']),

    detailedTopic('angular-default-vs-onpush', 'Default vs OnPush', 'Very High',
      'Default and OnPush differ in when a view is eligible for checking, not in whether Angular can update it.',
      [
        'Default strategy makes a view broadly eligible during Angular change-detection passes. OnPush allows Angular to skip a subtree until a recognized trigger marks it, such as a changed input binding, an event in the subtree, a signal update read by the view, or an async pipe emission.',
        'OnPush encourages explicit data flow and can reduce unnecessary checks in large trees, but it does not eliminate checks or require every internal property to be immutable. In-place mutation of an input object can evade reference-based input change detection.',
        'Choose OnPush as the normal boundary for predictable components and pair it with immutable inputs, signals, or async pipe. markForCheck marks a view for a future check; detectChanges runs a local check immediately and should be reserved for specialized integrations.',
      ],
      ['Input/event/state changes', 'Angular evaluates strategy-specific eligibility', 'OnPush subtree is checked when marked', 'Bindings update and clean subtrees can be skipped'],
      'A parent replaces a list reference and an OnPush child updates; mutating an existing row object without a new binding reference can leave the child stale.',
      `@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class UserList {
  @Input({ required: true }) users: readonly User[] = [];
}`,
      [['OnPush reduces avoidable subtree work', 'Explicit reference flow is easier to reason about'], ['In-place mutation may not mark input changes', 'Manual marking can add complexity at integration boundaries']],
      ['Prefer OnPush with immutable inputs and signal/async-pipe state.', 'Avoid assuming OnPush means no checks or using detectChanges for ordinary data flow.'],
      ['Name four common OnPush triggers.', 'Why might mutating an input array not update an OnPush child?', 'What is the difference between markForCheck and detectChanges?'],
      'A table’s child row appears stale after an in-place update. Replace the changed row and enclosing array references, or expose the row as signal/observable state; test event and async-pipe triggers separately.',
      [{ label: 'Skipping component subtrees', url: 'https://angular.dev/best-practices/skipping-subtrees' }, { label: 'ChangeDetectionStrategy API', url: 'https://angular.dev/api/core/ChangeDetectionStrategy' }],
      [
        { label: 'Declare boundary', detail: 'OnPush tells Angular the component can be skipped until a relevant notification marks it.' },
        { label: 'Receive trigger', detail: 'Changed input binding, local event, template-read signal update, or async pipe emission can mark the view.' },
        { label: 'Check marked path', detail: 'Angular evaluates marked views and required ancestors while skipping unaffected clean subtrees.' },
        { label: 'Update consistently', detail: 'New immutable references or reactive values make state transitions visible at component boundaries.' },
      ],
      'OnPush is an eligibility optimization with defined triggers, not a guarantee of zero checks.',
      ['Keep input objects immutable or use observable/signal inputs with clear ownership.', 'Use markForCheck when a legitimate external boundary needs a future Angular check.', 'Measure subtree cost and binding work independently.'],
      ['Mutating an input object in place and expecting an input-change trigger.', 'Thinking a click inside an OnPush component is ignored.', 'Calling detectChanges repeatedly to paper over stale references.'],
      ['Design component inputs as explicit state boundaries.', 'Prefer async pipe/signals to manual subscriptions.', 'Use local detection only for deliberate low-level integration cases.']),

    detailedTopic('angular-signals', 'Angular Signals', 'Very High',
      'Signals provide synchronous reactive state with tracked reads, derived values, and controlled side effects.',
      [
        'A signal is a getter/setter-style reactive value: reading it tracks a dependency in a reactive context, while set/update changes its value and notifies consumers. computed creates a lazy, memoized derived signal; effect runs imperative work when tracked dependencies change.',
        'Signals make local UI state and derived state explicit and integrate with Angular rendering. They do not automatically make arbitrary asynchronous work cancellable, nor are effects a replacement for every stream transformation.',
        'Use computed for derivation, effects for genuine external side effects, and explicit cleanup for effect-owned resources. Avoid writing to signals from effects merely to mirror other signals; that duplicates state and can create cycles.',
      ],
      ['Read source signals', 'Update a source value', 'Invalidate dependent computed values', 'Notify template/effect consumers'],
      'A cart total is derived from cart items and discount; a computed value stays consistent without an effect copying the total into mutable state.',
      `readonly items = signal<Item[]>([]);
readonly total = computed(() =>
  this.items().reduce((sum, item) => sum + item.price, 0)
);

add(item: Item): void {
  this.items.update(items => [...items, item]);
}`,
      [['Synchronous reads and derived values are straightforward', 'Template consumers receive fine-grained notifications'], ['Effects can form cycles or leak external resources', 'Signals alone do not provide time-based stream operators']],
      ['Use signals for synchronous state and computed for pure derivation; use effects only for imperative boundaries.', 'Avoid duplicating derived state or starting unmanaged async work inside effects.'],
      ['How does computed differ from effect?', 'When is a signal read tracked?', 'Why should derived state usually not be copied through an effect?'],
      'A filter panel maintains local selections and a derived result count. Signals model selections and computed derives the count; an Observable remains responsible for debounced server search.',
      [{ label: 'Angular signals', url: 'https://angular.dev/guide/signals' }, { label: 'effect API', url: 'https://angular.dev/api/core/effect' }],
      [
        { label: 'Store source state', detail: 'Use writable signals for the smallest authoritative local state.' },
        { label: 'Track derivation', detail: 'computed records signal reads and recalculates lazily when dependencies change.' },
        { label: 'Notify consumers', detail: 'Templates and reactive consumers are informed when a dependency changes.' },
        { label: 'Run side effects sparingly', detail: 'An effect tracks reads and synchronizes with an external imperative system when necessary.' },
      ],
      'A computed value is a derivation; an effect is an imperative reaction with lifecycle and cleanup implications.',
      ['Keep signal state minimal and derive values with computed.', 'Use update for transitions based on the previous value.', 'Use effect cleanup for timers, listeners, or other owned resources.'],
      ['Creating an effect that writes a mirror of another signal.', 'Assuming effects run synchronously in every context or can replace RxJS cancellation.', 'Mutating arrays/objects in place without setting an updated value.'],
      ['Keep effects at integration boundaries, not in the middle of ordinary data flow.', 'Avoid side effects in computed functions.', 'Use interop APIs deliberately when converting between signals and observables.']),

    detailedTopic('signals-vs-rxjs', 'Signals vs RxJS', 'Very High',
      'Signals model current synchronous state; RxJS models asynchronous sequences, time, cancellation, and event composition.',
      [
        'A signal always represents a current value readable synchronously. An Observable represents zero or more future emissions, with subscription, completion, error, and teardown semantics; it may be cold or hot.',
        'Use signals for component/application state and pure derived values. Use RxJS for HTTP pipelines, user event timing, cancellation, retries, and combining streams; bridge at a clear boundary instead of converting reflexively.',
        'toSignal subscribes to an Observable and exposes its latest value, with lifecycle ownership and an initial-value/requireSync decision. toObservable emits signal changes asynchronously; neither conversion erases the underlying source’s semantics.',
      ],
      ['Model current state or event sequence', 'Compose with the matching abstraction', 'Bridge deliberately if consumer needs another shape', 'Preserve ownership and cancellation behavior'],
      'A search page uses RxJS debounceTime and switchMap for requests, then exposes the latest result as a signal for synchronous template derivations.',
      `readonly results = toSignal(
  this.query$.pipe(
    debounceTime(250),
    switchMap(query => this.api.search(query))
  ),
  { initialValue: [] as Result[] }
);`,
      [['Each abstraction is strong in its own domain', 'Interop allows incremental architecture'], ['Conversions can obscure subscription lifetime or initial state', 'Using only one abstraction creates awkward workarounds']],
      ['Use signals for current state and RxJS for temporal/asynchronous composition; interoperate at component/service boundaries.', 'Avoid treating a signal as a multi-value stream or an Observable as a synchronous state container.'],
      ['What semantics does Observable add beyond a current value?', 'What must be decided when calling toSignal?', 'When is switchMap still useful in a signal-based app?'],
      'A screen needs cancellable typeahead plus synchronous computed sorting. Keep the network timing pipeline in RxJS, bridge its latest result with toSignal, and derive local sorting with computed.',
      [{ label: 'Angular signals', url: 'https://angular.dev/guide/signals' }, { label: 'RxJS overview', url: rxjsDocs }],
      [
        { label: 'Identify semantics', detail: 'Ask whether the consumer needs a current snapshot or a sequence with timing and termination.' },
        { label: 'Choose native model', detail: 'Keep UI state and derivation in signals; keep temporal operators and cancellation in RxJS.' },
        { label: 'Bridge at boundary', detail: 'Convert once where a consumer genuinely needs the other abstraction and define its initial value.' },
        { label: 'Own lifecycle', detail: 'Ensure bridge subscriptions follow the intended injector/component lifetime and errors are handled.' },
      ],
      'Interop is a boundary choice; it does not change whether an HTTP source is cancellable or whether a signal is synchronous.',
      ['Keep RxJS operators for debounce, switchMap, retries, and multi-event composition.', 'Use computed for synchronous derivation from signal state.', 'Choose toSignal initial values or requireSync based on source guarantees.'],
      ['Converting every Observable into a signal even when stream operators are still needed.', 'Creating repeated conversions that create duplicate subscriptions.', 'Ignoring error and initial-value behavior at the interop boundary.'],
      ['Make subscription ownership and source sharing explicit.', 'Use toObservable only when a consumer needs stream composition.', 'Keep each value’s canonical source of truth singular.']),

    detailedTopic('angular-performance', 'Angular Performance', 'High',
      'Optimize measured user-visible bottlenecks across rendering, network, bundle, and memory rather than chasing a single framework metric.',
      [
        'Performance includes startup and route loading, interaction latency, rendering/scroll smoothness, network waterfalls, and memory retention. A change that improves one dimension can worsen another.',
        'Angular tools such as DevTools, browser performance traces, and bundle analysis identify expensive components, template work, long tasks, and oversized dependencies. OnPush/signals, lazy routes, stable list identity, and code splitting address different bottleneck classes.',
        'Set budgets and representative scenarios, profile production-like builds, and validate both behavior and measurements. Virtualize genuinely large lists and move CPU-heavy work to a worker only when profiling justifies the complexity.',
      ],
      ['Define user-centric metric', 'Profile representative interaction', 'Target measured bottleneck', 'Compare result against regression budget'],
      'A slow table is profiled first: the trace shows thousands of DOM rows and repeated formatting, so virtualization and precomputed view models are tested before changing unrelated HTTP code.',
      `readonly rows = computed(() =>
  this.records().map(record => ({
    ...record,
    displayDate: formatDate(record.createdAt)
  }))
);`,
      [['Profiling directs effort to actual bottlenecks', 'Layered improvements can reduce payload and rendering cost'], ['Premature optimization adds complexity', 'Caching and virtualization can increase memory or correctness risks']],
      ['Profile representative production-like flows and optimize the limiting resource.', 'Avoid broad rewrites based on assumptions or adding memoization without measuring invalidation and memory cost.'],
      ['Which measurements distinguish bundle cost from rendering cost?', 'When is list virtualization justified?', 'How do you validate an optimization without regressing correctness?'],
      'A large analytics route is slow on midrange devices. Compare cold-start, route-entry, and scroll traces; reduce its lazy chunk, virtualize the proven DOM bottleneck, and add a repeatable performance budget.',
      [{ label: 'Angular performance best practices', url: 'https://angular.dev/best-practices' }, { label: 'Angular DevTools', url: 'https://angular.dev/tools/devtools' }],
      [
        { label: 'Set target', detail: 'Choose a user-observable metric such as route-ready time, interaction latency, or scroll frame stability.' },
        { label: 'Capture baseline', detail: 'Profile a representative production build on a realistic device and dataset.' },
        { label: 'Find dominant cost', detail: 'Separate JavaScript download/execute, change detection, DOM volume, layout, and API latency.' },
        { label: 'Change and compare', detail: 'Apply one targeted intervention and rerun the same scenario plus correctness checks.' },
      ],
      'Optimization is an evidence loop; “fewer checks” is not a user outcome until measured in context.',
      ['Set bundle and interaction budgets in CI where feasible.', 'Use stable keys for repeated views and avoid expensive template calls.', 'Load noncritical features lazily and virtualize only when DOM volume is the bottleneck.'],
      ['Optimizing development-mode traces as if they were production.', 'Adding caching that serves stale or cross-user data.', 'Assuming OnPush alone fixes a long task or oversized bundle.'],
      ['Measure cold and warm paths, network conditions, and realistic data sizes.', 'Recheck accessibility and keyboard behavior after virtualization.', 'Prefer small, reversible changes with recorded before/after metrics.']),

    detailedTopic('angular-lazy-loading', 'Lazy Loading', 'High',
      'Lazy loading defers feature code until navigation or explicit demand, improving initial payload at the cost of later loading work.',
      [
        'A lazy route loads a component or route configuration through dynamic import when Angular activates that route. This creates a separate code chunk that can be downloaded and evaluated on demand.',
        'Lazy loading can reduce initial JavaScript, but does not reduce total application code and may add route-entry latency. Preloading strategies trade network/bandwidth and memory for faster subsequent navigation.',
        'Lazy-load feature boundaries that are not essential at startup, keep shared dependencies from fragmenting into excessive chunks, and inspect production bundle graphs. Route-level access checks are not a security boundary; APIs must enforce authorization.',
      ],
      ['Define route boundary', 'Build separate feature chunk', 'Navigate and fetch chunk', 'Render route after code and data readiness'],
      'An admin console used by a small subset of users is loaded as a separate route chunk rather than included in every visitor’s initial bundle.',
      `export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes')
      .then(module => module.ADMIN_ROUTES)
  }
];`,
      [['Shrinks startup code for deferred features', 'Creates clear route-level ownership boundaries'], ['First navigation can be slower', 'Excessive fragmentation and preloading can waste resources']],
      ['Lazy-load substantial, noncritical route features and measure initial and navigation costs.', 'Avoid assuming lazy loading protects code or data from unauthorized users.'],
      ['What work moves to the first feature navigation?', 'How does preloading change the trade-off?', 'Why is lazy loading not authorization?'],
      'A rarely used reporting feature inflates the main bundle. Split it at the route boundary, measure both startup and first-navigation latency, and secure all report data at the API.',
      [{ label: 'Angular routing and lazy loading', url: 'https://angular.dev/guide/routing/loading-strategies' }],
      [
        { label: 'Choose boundary', detail: 'Identify a feature that is not required for initial rendering and has a cohesive route entry.' },
        { label: 'Create dynamic import', detail: 'Use loadComponent or loadChildren so bundlers can emit a deferred chunk.' },
        { label: 'Fetch on demand', detail: 'Router activation loads the chunk and any required route data before rendering.' },
        { label: 'Tune follow-up', detail: 'Use preloading only when the expected navigation benefit outweighs bandwidth and memory cost.' },
      ],
      'Lazy routes change when code is fetched, not who is permitted to use the server-side feature.',
      ['Inspect emitted chunk sizes and route waterfalls.', 'Use route-level loading/error UX for slow or failed chunk loads.', 'Consider selective preloading for likely next routes.'],
      ['Lazy-loading tiny modules with high overhead and no meaningful startup benefit.', 'Preloading every route on constrained connections.', 'Relying on hidden route code as access control.'],
      ['Keep feature boundaries cohesive and avoid duplicate shared chunks.', 'Measure initial and deferred navigation separately.', 'Enforce permissions on the server regardless of route configuration.']),

    detailedTopic('angular-route-guards', 'Route Guards', 'Very High',
      'Route guards express client-side navigation policy and user experience; they never replace server-side authorization.',
      [
        'CanActivate, CanActivateChild, CanMatch, and CanDeactivate guard different router decisions. A guard may synchronously return a boolean or return a Promise/Observable that resolves to a decision or UrlTree/RedirectCommand.',
        'Returning a UrlTree communicates redirect intent to the router; imperatively navigating and returning false can create races. CanMatch can prevent a route from matching, while CanDeactivate is suited to unsaved-change confirmation.',
        'Guards execute in the browser and can be bypassed by a modified client or direct API call. Protect resources and actions on the backend, and keep guards fast, deterministic, and appropriately composed with authentication state.',
      ],
      ['Router attempts navigation', 'Guard evaluates policy/readiness', 'Allow, redirect, or reject navigation', 'Backend independently authorizes data/actions'],
      'An authenticated user without an admin role is redirected from the admin route, while the API still checks the role on every administrative request.',
      `export const signedInGuard: CanActivateFn = () => {
  const auth = inject(AuthSession);
  const router = inject(Router);
  return auth.isSignedIn()
    ? true
    : router.createUrlTree(['/sign-in']);
};`,
      [['Keeps navigation aligned with application state', 'UrlTree redirects are declarative and race-resistant'], ['Client checks are bypassable', 'Slow guard dependencies delay route activation']],
      ['Use guards for client navigation UX and return UrlTree for redirects.', 'Avoid treating a route guard as authorization or duplicating complex business policy in the router.'],
      ['What is the difference between CanMatch and CanActivate?', 'Why return a UrlTree rather than navigate imperatively?', 'Where must authorization be enforced?'],
      'A user can alter client state or call APIs directly. The guard hides inaccessible navigation, while each protected API independently validates the identity and permission.',
      [{ label: 'Angular route guards', url: 'https://angular.dev/guide/routing/route-guards' }],
      [
        { label: 'Attempt route transition', detail: 'The router evaluates configured guards before committing a target navigation.' },
        { label: 'Resolve policy input', detail: 'A guard reads current authentication or confirmation state and may await an Observable/Promise.' },
        { label: 'Return router decision', detail: 'Return true, false, or a UrlTree/RedirectCommand instead of starting competing navigation.' },
        { label: 'Enforce resource access', detail: 'The API validates authorization independently for every protected resource and operation.' },
      ],
      'A guard is a navigation control, not a security perimeter: the server is the authority for access.',
      ['Prefer functional guards and injectable policy services.', 'Handle an authentication state that is still loading without racing the router.', 'Use CanDeactivate for unsaved work and provide accessible confirmation.'],
      ['Using a guard as the sole protection for sensitive API data.', 'Calling router.navigate and returning false, causing competing transitions.', 'Putting long or side-effect-heavy workflows inside a guard.'],
      ['Return explicit typed decisions and keep checks fast.', 'Test direct URL entry, reload, delayed auth resolution, and rejected access.', 'Enforce authorization at the API and data layer.']),

    detailedTopic('template-vs-reactive-forms', 'Template-Driven vs Reactive Forms', 'High',
      'Both approaches use Angular forms controls; they differ mainly in where the form model and validation logic are authored.',
      [
        'Template-driven forms infer controls and much of their structure from directives in the template. Reactive forms construct an explicit FormControl/FormGroup/FormArray model in TypeScript and bind the template to it.',
        'Reactive forms suit dynamic schemas, complex cross-field validation, typed form models, and deterministic testing. Template-driven forms can be concise for small, mostly static forms with simple validation.',
        'Choose based on form complexity and team needs rather than assuming one is universally faster. Both require accessible labels, validation feedback, submission-state handling, and server-side validation.',
      ],
      ['Define controls in template or TypeScript', 'Bind values and validation rules', 'Track status and user interaction', 'Validate and submit a deliberate payload'],
      'A multi-step application with conditional sections and cross-field validation is easier to model explicitly with typed reactive forms.',
      `readonly form = new FormGroup({
  email: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email]
  })
});

submit(): void {
  if (this.form.valid) this.save(this.form.getRawValue());
}`,
      [['Reactive forms make dynamic structure and tests explicit', 'Template-driven forms reduce setup for simple forms'], ['Reactive form models add boilerplate', 'Template-driven structure can become hard to reason about as complexity grows']],
      ['Use reactive forms for dynamic, typed, or cross-field-heavy workflows; use template-driven forms for small static cases.', 'Avoid relying exclusively on client validation or disabling feedback until submission without accessibility review.'],
      ['Where is the form model defined in each approach?', 'Why are reactive forms suitable for dynamic controls?', 'What validation must still happen on the server?'],
      'A form contains conditional dependents and needs deterministic tests for validation transitions. Model it with FormGroup/FormArray and keep API validation authoritative.',
      [{ label: 'Angular forms overview', url: 'https://angular.dev/guide/forms' }, { label: 'Reactive forms', url: 'https://angular.dev/guide/forms/reactive-forms' }],
      [
        { label: 'Assess shape', detail: 'Count dynamic controls, conditional sections, cross-field rules, and testability requirements.' },
        { label: 'Choose model owner', detail: 'Template-driven forms derive controls from directives; reactive forms define the control tree in TypeScript.' },
        { label: 'Validate and present', detail: 'Track touched/dirty/pending/invalid states and expose accessible, specific error feedback.' },
        { label: 'Submit safely', detail: 'Normalize the intended payload and validate all business rules again on the server.' },
      ],
      'Reactive versus template-driven primarily describes where and how the control model is created; neither removes accessibility or server-validation responsibilities.',
      ['Use typed reactive forms when the schema is dynamic or deeply validated.', 'Keep validation messages associated with controls and usable by assistive technology.', 'Disable duplicate submission while a request is pending and report server errors.'],
      ['Treating client validators as a security boundary.', 'Using template-driven forms for a highly dynamic nested schema without a clear model.', 'Submitting raw form state without considering disabled controls and payload shape.'],
      ['Keep validation rules close to the form model appropriate to the chosen style.', 'Test invalid, pending, disabled, and server-error states.', 'Separate presentation state from trusted server decisions.']),

    detailedTopic('angular-component-communication', 'Component Communication', 'High',
      'Communication mechanisms should follow component ownership and data direction, from direct parent-child contracts to shared state services.',
      [
        'A parent supplies state through inputs and receives child intent through outputs; this keeps ownership explicit. Content/view queries and model inputs have narrower purposes, while sibling or cross-route coordination often requires a shared service/store.',
        'Signals, Observable streams, and immutable input values can carry state; outputs should express events or intent rather than let a child mutate parent-owned objects invisibly. Avoid using a global event bus for tightly related components.',
        'Choose the narrowest mechanism that matches the relationship and lifetime. Shared services should define ownership, replay, error, and cleanup contracts rather than becoming an unstructured bag of mutable state.',
      ],
      ['Identify state owner', 'Pass state down through input', 'Emit intent upward through output', 'Use scoped shared state only for broader relationships'],
      'A reusable date picker receives the selected date and emits a selection; unrelated pages do not couple themselves to its internal state.',
      `@Component({ selector: 'app-date-picker', template: '' })
export class DatePicker {
  readonly value = input<Date | null>(null);
  readonly valueChange = output<Date>();

  select(date: Date): void {
    this.valueChange.emit(date);
  }
}`,
      [['Inputs/outputs make local contracts visible', 'Scoped services support sibling or cross-route coordination'], ['Global buses obscure causality', 'Shared mutable objects make ownership and updates unclear']],
      ['Prefer input-down/event-up for direct relationships and a scoped service/store for shared lifetimes.', 'Avoid reaching into child internals or using a global event bus for routine parent-child state.'],
      ['Who owns the authoritative state in a parent-child interaction?', 'When is a service better than outputs?', 'Why should child outputs express intent rather than hidden mutation?'],
      'Two distant workflow steps need the same draft for the duration of one route. Provide a route-scoped state service and clear it with the workflow lifetime instead of creating permanent root-level mutable state.',
      [{ label: 'Angular component interaction', url: 'https://angular.dev/guide/components/inputs' }, { label: 'Outputs', url: 'https://angular.dev/guide/components/outputs' }],
      [
        { label: 'Name state owner', detail: 'Assign one component, route service, or store responsibility for canonical state.' },
        { label: 'Send state downward', detail: 'Inputs expose data and configuration at the component boundary.' },
        { label: 'Send intent upward', detail: 'Outputs communicate a user action so the owner decides how state changes.' },
        { label: 'Scope collaboration', detail: 'For distant consumers, use a service/store whose lifetime matches the shared workflow.' },
      ],
      'Communication should reveal both direction and ownership; shared state is not a reason to discard component contracts.',
      ['Keep reusable components controlled by explicit inputs and outputs.', 'Choose provider scope to match state lifetime.', 'Use readonly state interfaces and intentional update methods in shared services.'],
      ['Mutating an input object inside a child without an emitted intent.', 'Creating a root singleton event bus for unrelated features.', 'Using view queries as a substitute for a stable component API.'],
      ['Keep state local until a real sharing requirement appears.', 'Document event meaning and payload semantics.', 'Test component contracts independently from the store implementation.']),

    detailedTopic('large-angular-app-state', 'State Management in Large Applications', 'Very High',
      'Large-app state architecture is a set of ownership and consistency decisions, not a requirement to put every value in one global store.',
      [
        'Separate ephemeral view state, route/workflow state, server/cache state, and durable cross-feature client state. Each category has different lifetime, freshness, concurrency, and persistence requirements.',
        'Start with component signals or local observables, elevate state to a route-scoped service when siblings share it, and adopt a store when explicit transitions, selectors, effects, tooling, or team coordination justify its cost.',
        'Define canonical ownership, derived selectors, loading/error states, cache invalidation, and side-effect boundaries. Avoid duplicating server truth, persisting sensitive state casually, or letting components mutate a global state object directly.',
      ],
      ['Classify state by scope and durability', 'Assign one owner and transition API', 'Derive consumer views from canonical state', 'Invalidate or release state at lifecycle boundaries'],
      'A multi-step onboarding flow uses route-scoped state for its draft, server data cache for reference data, and local signals for a dialog’s open state.',
      `interface OrderState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  order: Order | null;
}

readonly state = signal<OrderState>({ status: 'idle', order: null });
readonly canSubmit = computed(() =>
  this.state().status === 'ready' && this.state().order !== null
);`,
      [['Explicit ownership prevents conflicting copies', 'Scoped state limits lifetime and unintended coupling'], ['A global store adds ceremony and migration cost', 'Cache invalidation and stale duplicated state remain hard']],
      ['Use the smallest state container that meets sharing, observability, and team needs.', 'Avoid putting transient UI state or credentials in a global persistent store by default.'],
      ['Which state belongs in a component versus a route service?', 'What problem does a selector solve?', 'When does a store’s coordination value justify its complexity?'],
      'A growing commerce app has stale cart badges and duplicated account state. Define a canonical owner, expose derived selectors, invalidate server-backed caches after mutations, and scope checkout draft state to the workflow.',
      [{ label: 'Angular signals', url: 'https://angular.dev/guide/signals' }, { label: 'NgRx documentation', url: 'https://ngrx.io/docs' }],
      [
        { label: 'Classify the value', detail: 'Distinguish local UI, route workflow, server cache, and durable cross-feature state.' },
        { label: 'Choose ownership', detail: 'Place canonical state in the narrowest component, route service, or store that serves all consumers.' },
        { label: 'Expose transitions and selectors', detail: 'Provide explicit update operations and derive views instead of exposing mutable internals.' },
        { label: 'Manage freshness and lifetime', detail: 'Define cache invalidation, persistence, reset-on-logout, and route-destruction behavior.' },
      ],
      'A store is valuable when coordinated transitions and tooling outweigh its abstraction cost; global scope alone is not a reason.',
      ['Keep server-owned data distinct from client-owned UI state.', 'Model loading/error/empty states instead of parallel booleans.', 'Use selectors/computed derivations and explicit mutations; test transitions and invalidation.'],
      ['Promoting every local boolean into global state.', 'Keeping multiple independently mutable copies of the same entity.', 'Persisting secrets or user-specific cached data without a threat and invalidation model.'],
      ['Start local and elevate only when sharing or coordination is real.', 'Align provider/store lifetime with feature and user-session boundaries.', 'Define logout clearing, cache invalidation, and concurrent update behavior.']),
  ],
};
