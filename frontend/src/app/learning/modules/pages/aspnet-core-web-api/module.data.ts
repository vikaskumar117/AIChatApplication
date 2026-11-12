import { LearningModuleSummary } from '../../../learning.models';

export const aspnetCoreWebApiModule: LearningModuleSummary = {
  "id": "aspnet-core-web-api",
  "title": "ASP.NET Core Web API",
  "description": "Design maintainable HTTP APIs with explicit controller semantics, pipeline behavior, validation, and versioned contracts.",
  "topics": [
    {
      "id": "controllerbase-advantages",
      "title": "ControllerBase Advantages",
      "priority": "Very High",
      "summary": "ControllerBase gives API controllers MVC request, binding, validation, and response helpers without the view-rendering features of Controller."
    },
    {
      "id": "controller-vs-controllerbase",
      "title": "Controller vs ControllerBase",
      "priority": "High",
      "summary": "Controller extends ControllerBase with view and page-oriented capabilities; ControllerBase is the smaller choice for HTTP APIs."
    },
    {
      "id": "controllers-vs-minimal-apis",
      "title": "Controllers vs Minimal APIs",
      "priority": "High",
      "summary": "Controllers and Minimal APIs are two ASP.NET Core endpoint styles that share routing, dependency injection, authorization, and HTTP semantics."
    },
    {
      "id": "without-apicontroller",
      "title": "Controllers Without [ApiController]",
      "priority": "High",
      "summary": "A controller without [ApiController] can still serve an API, but it does not receive that attribute’s API-specific conventions automatically."
    },
    {
      "id": "api-controller-purpose",
      "title": "Purpose of [ApiController]",
      "priority": "Very High",
      "summary": "[ApiController] opts MVC controllers into conventions that make API binding and client-error behavior more predictable."
    },
    {
      "id": "request-pipeline",
      "title": "ASP.NET Core Request Pipeline",
      "priority": "Very High",
      "summary": "The ordered middleware pipeline surrounds endpoint execution, so ordering determines which components can observe and affect a request."
    },
    {
      "id": "custom-middleware",
      "title": "Middleware & Custom Middleware",
      "priority": "Very High",
      "summary": "Middleware is an HTTP delegate that can inspect, transform, short-circuit, or delegate request processing."
    },
    {
      "id": "dependency-injection-lifetimes",
      "title": "Dependency Injection & Service Lifetimes",
      "priority": "Very High",
      "summary": "Transient, scoped, and singleton lifetimes define how long a resolved service instance is reused and who disposes it."
    },
    {
      "id": "middleware-vs-filters",
      "title": "Middleware vs MVC Filters",
      "priority": "High",
      "summary": "Middleware wraps the application request pipeline; MVC filters run inside MVC execution and have action or result context."
    },
    {
      "id": "global-exception-handling",
      "title": "Global Exception Handling",
      "priority": "Very High",
      "summary": "A global exception boundary logs unexpected failures and returns a stable, safe error contract rather than leaking implementation details."
    },
    {
      "id": "http-method-semantics",
      "title": "HTTP Method Semantics",
      "priority": "Very High",
      "summary": "HTTP methods communicate the intended operation and whether it is safe or idempotent, independent of how an endpoint is named."
    },
    {
      "id": "common-http-status-codes",
      "title": "Common HTTP Status Codes",
      "priority": "Very High",
      "summary": "Status codes classify success, client-side request problems, and server failures; 400, 401, 403, 404, 409, and 500 have distinct meanings."
    },
    {
      "id": "model-validation",
      "title": "Model Validation",
      "priority": "Very High",
      "summary": "Model validation checks bound input against structural constraints, while application logic separately enforces business invariants."
    },
    {
      "id": "api-dtos",
      "title": "API Data Transfer Objects (DTOs)",
      "priority": "Very High",
      "summary": "DTOs define intentional API input and output contracts, decoupled from persistence entities and internal domain models."
    },
    {
      "id": "api-versioning",
      "title": "API Versioning",
      "priority": "High",
      "summary": "API versioning manages incompatible contract evolution while clients migrate at different speeds."
    },
    {
      "id": "response-result-types",
      "title": "ASP.NET Core Response Result Types",
      "priority": "High",
      "summary": "Action return types communicate whether an endpoint returns a representation, several HTTP outcomes, or a framework-level result."
    },
    {
      "id": "logging-timing-middleware",
      "title": "Logging & Timing Middleware",
      "priority": "High",
      "summary": "Request instrumentation correlates HTTP outcomes and elapsed time with structured logs and distributed traces."
    }
  ]
};
