import { LearningModuleSummary } from '../../../learning.models';

export const angularModule: LearningModuleSummary = {
  "id": "angular",
  "title": "Angular",
  "description": "Architect Angular applications with deliberate state, HTTP, routing, forms, and rendering choices.",
  "topics": [
    {
      "id": "rxjs-subject-vs-behavior-subject",
      "title": "Subject vs BehaviorSubject",
      "priority": "Very High",
      "summary": "Choose a multicast primitive by its late-subscriber contract, not simply because a value is shared."
    },
    {
      "id": "observable-vs-promise",
      "title": "Observable vs Promise",
      "priority": "Very High",
      "summary": "Observable and Promise represent different asynchronous contracts: a single eventual result versus a lazy, composable sequence."
    },
    {
      "id": "cancel-http-requests",
      "title": "Cancel In-Flight HTTP Requests",
      "priority": "Very High",
      "summary": "Cancel obsolete client-side work to avoid stale rendering and wasted resources, while distinguishing client abort from server rollback."
    },
    {
      "id": "parallel-api-calls",
      "title": "Call APIs Simultaneously",
      "priority": "High",
      "summary": "Compose independent requests concurrently, and choose a join operator whose completion and failure semantics match the page contract."
    },
    {
      "id": "forkjoin-combinelatest-merge",
      "title": "forkJoin vs combineLatest vs merge",
      "priority": "Very High",
      "summary": "These operators combine sources with different timing contracts: final values, latest snapshots, or interleaved emissions."
    },
    {
      "id": "angular-api-errors",
      "title": "Handle API Errors",
      "priority": "Very High",
      "summary": "Treat HTTP failures as typed application states, preserving useful diagnostics while presenting safe, actionable user feedback."
    },
    {
      "id": "angular-http-interceptors",
      "title": "HTTP Interceptors",
      "priority": "Very High",
      "summary": "Functional interceptors provide an ordered shared pipeline for cross-cutting request and response policies."
    },
    {
      "id": "attach-jwt-angular",
      "title": "Attach JWTs to Requests Safely",
      "priority": "Very High",
      "summary": "Attach an access token only to requests that are intended for the trusted API, and keep token storage and transport risks explicit."
    },
    {
      "id": "token-expiration",
      "title": "Token Expiration and Refresh",
      "priority": "Very High",
      "summary": "Handle expiry as an authentication lifecycle with race control, bounded replay, and secure failure behavior."
    },
    {
      "id": "angular-lifecycle-hooks",
      "title": "Angular Lifecycle Hooks",
      "priority": "High",
      "summary": "Lifecycle hooks mark specific points in a component or directive’s creation, input processing, rendering, and destruction."
    },
    {
      "id": "angular-change-detection",
      "title": "Change Detection",
      "priority": "Very High",
      "summary": "Change detection synchronizes template bindings with application state; performance depends on what gets checked and how state changes are observed."
    },
    {
      "id": "angular-default-vs-onpush",
      "title": "Default vs OnPush",
      "priority": "Very High",
      "summary": "Default and OnPush differ in when a view is eligible for checking, not in whether Angular can update it."
    },
    {
      "id": "angular-signals",
      "title": "Angular Signals",
      "priority": "Very High",
      "summary": "Signals provide synchronous reactive state with tracked reads, derived values, and controlled side effects."
    },
    {
      "id": "signals-vs-rxjs",
      "title": "Signals vs RxJS",
      "priority": "Very High",
      "summary": "Signals model current synchronous state; RxJS models asynchronous sequences, time, cancellation, and event composition."
    },
    {
      "id": "angular-performance",
      "title": "Angular Performance",
      "priority": "High",
      "summary": "Optimize measured user-visible bottlenecks across rendering, network, bundle, and memory rather than chasing a single framework metric."
    },
    {
      "id": "angular-lazy-loading",
      "title": "Lazy Loading",
      "priority": "High",
      "summary": "Lazy loading defers feature code until navigation or explicit demand, improving initial payload at the cost of later loading work."
    },
    {
      "id": "angular-route-guards",
      "title": "Route Guards",
      "priority": "Very High",
      "summary": "Route guards express client-side navigation policy and user experience; they never replace server-side authorization."
    },
    {
      "id": "template-vs-reactive-forms",
      "title": "Template-Driven vs Reactive Forms",
      "priority": "High",
      "summary": "Both approaches use Angular forms controls; they differ mainly in where the form model and validation logic are authored."
    },
    {
      "id": "angular-component-communication",
      "title": "Component Communication",
      "priority": "High",
      "summary": "Communication mechanisms should follow component ownership and data direction, from direct parent-child contracts to shared state services."
    },
    {
      "id": "large-angular-app-state",
      "title": "State Management in Large Applications",
      "priority": "Very High",
      "summary": "Large-app state architecture is a set of ownership and consistency decisions, not a requirement to put every value in one global store."
    }
  ]
};
