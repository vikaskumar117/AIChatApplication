# Module 06 — Angular and TypeScript

**Workbook alignment:** Days 13–16 (components, services, RxJS, forms,
routing, lazy loading, accessibility). Related tracker topics: T051–T060.

> **Status:** There is no Angular frontend in the repository yet. All snippets
> in this module are proposed examples for key103; they are not current
> application code.

## T051 — TypeScript strict typing, generics, and unions

- **What:** TypeScript adds compile-time types to JavaScript; unions express
  values that can be one of several known shapes.
- **Why:** Explicit request/response types catch UI/API mismatches earlier.
- **When:** Model loading, success, and error states as discriminated unions
  rather than loosely typed flags.
- **Limits:** Types are erased at runtime; external JSON still needs runtime
  checks at trust boundaries.
- **Diagram:** `unknown JSON -> validate/map -> typed application state`
- **Project example (planned — key103):**
  ```ts
  type ChatState =
    | { kind: 'idle' }
    | { kind: 'loading' }
    | { kind: 'success'; answer: string }
    | { kind: 'error'; message: string };
  ```
- **Reference:** [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Worked example and self-check

The `kind` field is a discriminant: inside each branch TypeScript knows which
other fields exist. This is safer than unrelated booleans such as
`isLoading`, `hasError`, and `hasAnswer`, which can accidentally all be true.
At the HTTP boundary, validate untrusted JSON before treating it as this type.

```ts
function messageFor(state: ChatState): string {
  switch (state.kind) {
    case 'idle': return 'Enter code to explain.';
    case 'loading': return 'Working…';
    case 'success': return state.answer;
    case 'error': return state.message;
  }
}
```

**Try it:** What does TypeScript narrow after `case 'success'`? **Answer:**
the state includes an `answer` string.

## T052 — Angular components, templates, and data binding

- **What:** A component owns view state and a template renders it with
  bindings.
- **Why:** The chat screen needs clear input, loading, answer, and error
  presentation.
- **When:** Keep UI state and interaction in a focused component; move reusable
  I/O to a service.
- **Limits:** A component should not become the place for all networking,
  authentication, and business logic.
- **Diagram:** `component state <-> template bindings -> accessible UI`
- **Project example (planned — key103):** create a standalone home/chat
  component with a locked signed-out state before authentication is available.
- **Reference:** [Angular components](https://angular.dev/essentials/components)

### Worked example and self-check

A component is the UI boundary: it holds the form state and renders it.
Templates should bind to state rather than construct provider requests or
contain lengthy business rules. A label gives assistive technology the
meaning of the input, and a disabled submit button communicates pending work.

```html
<label for="code">Code to explain</label>
<textarea id="code" [value]="code"></textarea>
<button type="button" [disabled]="loading">Explain</button>
```

This is illustrative Angular template syntax. **Try it:** Should provider
selection logic live in the component? **Answer:** no; the server owns that
decision and a focused API service handles HTTP.

## T053 — Angular dependency injection and services

- **What:** Angular DI provides shared services to components; services
  encapsulate reusable behavior.
- **Why:** API access should be separate from the rendering component.
- **When:** Put HTTP calls and shared application state in focused services.
- **Limits:** A service should not become a giant catch-all; scope/lifetime
  choices affect shared state.
- **Diagram:** `component -> ChatApiService -> HTTP`
- **Project example (planned — key103):** `ChatApiService` wraps the .NET
  endpoint; the UI component consumes it through DI.
- **Reference:** [Angular dependency injection](https://angular.dev/guide/di)

### Worked example and self-check

The component depends on a small service contract rather than knowing the URL,
headers, and JSON details. This makes the component easier to test and keeps
the transport code in one place.

```ts
@Injectable({ providedIn: 'root' })
export class ChatApiService {
  constructor(private readonly http: HttpClient) {}

  explain(code: string) {
    return this.http.post<ExplainResponse>(
      '/api/chat/explain', { code });
  }
}
```

**Try it:** Why inject `HttpClient` rather than create network logic inside
each component? **Answer:** consistent configuration, reuse, and a clear
testing seam.

## T054 — `HttpClient`, typed API calls, and interceptors

- **What:** Angular `HttpClient` sends HTTP requests; interceptors can
  consistently handle cross-cutting request/response behavior.
- **Why:** One API client keeps route and response handling consistent.
- **When:** Use typed request/response models and interceptors for appropriate
  shared concerns such as correlation IDs.
- **Limits:** Generic response types are compile-time promises, not JSON
  validation; do not place provider secrets in the browser.
- **Diagram:** `component -> typed service -> HttpClient -> ASP.NET API`
- **Project example (planned — key103):** POST the code DTO to the existing
  `/api/chat/explain` route; add authentication headers only after key104.
- **Reference:** [Angular HTTP](https://angular.dev/guide/http)

### Worked example and self-check

An `HttpClient` generic documents the expected response shape to TypeScript;
it does not inspect the actual JSON at runtime. Never embed an AI provider key
in this code—the browser bundle is visible to users. Use environment config
only for public values such as the API base URL.

```text
Angular service -> POST /api/chat/explain -> ASP.NET DTO -> Result response
```

The current endpoint has no authentication configured, so do not imply an
interceptor makes it authenticated. **Try it:** Does
`post<ExplainResponse>(...)` validate JSON? **Answer:** no; it is a compile
time assertion about the expected shape.

## T055 — RxJS Observables, operators, cancellation, and errors

- **What:** An Observable represents values over time; operators transform or
  coordinate streams.
- **Why:** UI requests need loading/error handling and cancellation when the
  user navigates or replaces a request.
- **When:** Use `async` pipe for template subscriptions and `switchMap` for
  replaceable searches.
- **Limits:** Not every interaction needs RxJS composition; `switchMap` cancels
  the client subscription but may not undo remote provider work.
- **Diagram:** `form value -> switchMap(HTTP) -> success/error state`
- **Project example (planned — key103):** chat submissions should avoid
  duplicate clicks and surface errors; only cancel/retry when semantics are
  clear.
- **Reference:** [RxJS documentation](https://rxjs.dev/guide/overview)

### Worked example and self-check

For a replaceable search, `switchMap` unsubscribes from the previous inner
observable when a new value arrives. That is useful for typeahead, but a chat
submission often should not silently discard a response; choose behavior by
the interaction.

```ts
readonly answer$ = this.codeControl.valueChanges.pipe(
  debounceTime(250),
  distinctUntilChanged(),
  switchMap(code => this.api.explain(code))
);
```

**Try it:** Does unsubscribing guarantee that a remote model stopped working?
**Answer:** no; cancellation must propagate through the server and provider,
and even then remote work may already have started.

## T056 — Reactive forms and client-side validation

- **What:** Reactive forms model controls and validation rules explicitly in
  code.
- **Why:** The code input needs required and length checks with useful feedback.
- **When:** Use them for forms with non-trivial validation, dynamic state, or
  testable rules.
- **Limits:** Client validation improves usability but is not a security
  boundary; the API must independently validate input.
- **Diagram:** `form input -> client validation -> API validation -> service`
- **Project example (planned — key103):** validate the required code field and
  mirror server limits once key101 defines the maximum.
- **Reference:** [Angular reactive forms](https://angular.dev/guide/forms/reactive-forms)

### Worked example and self-check

Reactive forms define validation in component code, making rules explicit
and testable. Client checks help users fix mistakes early; the API must repeat
the relevant checks because requests can bypass the browser entirely.

```ts
readonly codeControl = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required]
});
```

Add a maximum length only when it matches the API's documented limit.
**Try it:** Can a user remove the HTML `required` attribute and submit an
empty request? **Answer:** yes; server validation is authoritative.

## T057 — Angular routing, guards, and lazy loading

- **What:** The router maps URLs to views; guards can control navigation;
  lazy loading defers code until a route is needed.
- **Why:** A public home and future authenticated areas need clear routes.
- **When:** Lazy-load meaningful feature areas; use guards for navigation UX
  while enforcing access on the API too.
- **Limits:** A client guard is not authorization: callers can invoke the API
  directly.
- **Diagram:** `URL -> router -> guard UX -> lazy feature component`
- **Project example (planned — key103/key104):** home is public; authenticated
  routes arrive after OIDC. API policies remain authoritative.
- **Reference:** [Angular routing](https://angular.dev/guide/routing)

### Worked example and self-check

Lazy loading can reduce the initial download when a substantial feature is
needed only on a later route. A route guard improves navigation experience,
but the API must verify each protected operation because routes can be
invoked directly.

```ts
export const routes: Routes = [
  { path: '', loadComponent: () => import('./home.component')
      .then(m => m.HomeComponent) }
];
```

**Try it:** Is a client route guard an API security boundary? **Answer:** no;
server-side authentication and authorization are required.

## T058 — Signals, change detection, and state-management trade-offs

- **What:** Signals represent reactive state; change detection updates the
  rendered view when state changes.
- **Why:** Explicit state makes loading and access states easier to reason
  about.
- **When:** Start with component/service state; adopt a larger state library
  only if shared state complexity warrants it.
- **Limits:** Signals do not replace HTTP, validation, or server truth.
- **Diagram:** `signal change -> dependent template updates`
- **Project example (planned — key103):** represent signed-out, loading, and
  response states without a separate state-management package.
- **Reference:** [Angular signals](https://angular.dev/guide/signals)

### Worked example and self-check

A signal is a small reactive value. Reading it in a template creates a
dependency, and updating it notifies the view. For this chat screen, a handful
of signals can represent current input, pending state, and displayed response
without an additional state framework.

```ts
readonly loading = signal(false);
readonly answer = signal('');
```

Keep server truth on the server; a local `signedIn` signal cannot grant API
access. **Try it:** Do signals replace an HTTP client? **Answer:** no; they
represent/react to state, while HTTP still transports requests.

## T059 — Accessibility and safe rendering of generated content

- **What:** Accessibility makes controls usable with assistive technologies;
  safe rendering prevents untrusted model output from becoming executable
  markup.
- **Why:** Chat output and errors need to work for keyboard and screen-reader
  users without creating XSS risk.
- **When:** Use semantic controls, labels, focus handling, announced status,
  and plain text by default.
- **Limits:** Automated accessibility checks do not replace keyboard/screen
  reader review; never bypass Angular sanitization for raw model HTML.
- **Diagram:** `untrusted answer -> plain text or maintained sanitizer -> DOM`
- **Project example (planned — key103/key106):** show model output as text
  unless safe Markdown rendering is explicitly required and sanitized.
- **Reference:** [Angular security](https://angular.dev/best-practices/security) · [W3C WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/)

### Worked example and self-check

Render generated explanations as text by default. If formatting becomes a
product requirement, use a maintained Markdown renderer and sanitize output;
never opt out of Angular's protections to make model-generated HTML render.
For accessibility, announce pending and completed states and make every
control keyboard-operable.

```html
<p role="status" aria-live="polite">{{ statusMessage }}</p>
<pre>{{ answer }}</pre>
```

**Try it:** Is model-produced HTML trusted because it came from the provider?
**Answer:** no; it is untrusted content and must not be executed in the DOM.

## T060 — Angular component and browser end-to-end tests

- **What:** Component tests check UI behavior; browser E2E tests exercise
  realistic user flows.
- **Why:** The chat experience has meaningful locked, loading, success, and
  error states.
- **When:** Test observable behavior, using controlled API responses for
  repeatability.
- **Limits:** E2E tests are slower and more environment-sensitive than focused
  component tests; test only key user paths.
- **Diagram:** `fake API -> component test` · `browser -> app + controlled API -> E2E`
- **Project example (planned — key103/key107):** cover signed-out gating,
  valid/invalid input, loading, error, and successful display.
- **Reference:** [Angular testing](https://angular.dev/guide/testing)

### Worked example and self-check

Component tests should verify what users can observe: an invalid form cannot
submit, pending work is announced, and an error is visible. E2E tests should
cover only critical flows because they are slower and need a browser
environment. In both, use a controlled API response rather than a live model
to keep the test stable and cost-free.

```text
test: submit code -> controlled API success -> answer appears
```

**Try it:** Why avoid a real AI provider in every UI test? **Answer:** cost,
latency, nondeterminism, and external availability.

## Workbook implementation connection

The Angular work is a real product feature, not a throwaway sample: it will
provide a responsive public home, gated chat composer, typed API service,
accessible form and response states. Authentication remains a separate key;
the UI must not pretend that a decorative sign-in enables protected API
access.
