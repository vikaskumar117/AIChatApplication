import { LearningModuleSummary } from '../../../learning.models';

export const apiConcurrencyResilienceModule: LearningModuleSummary = {
  "id": "api-concurrency-resilience",
  "title": "API Concurrency & Resilience",
  "description": "Handle competing edits, retries, and failures without corrupting data or duplicating effects.",
  "topics": [
    {
      "id": "data-concurrency-fundamentals",
      "title": "Data Concurrency",
      "priority": "Very High",
      "summary": "Data concurrency is the behavior of overlapping operations that read or change shared state."
    },
    {
      "id": "concurrent-user-edits",
      "title": "Concurrent Edits & Lost Updates",
      "priority": "Very High",
      "summary": "A lost update occurs when a later save overwrites changes made after the editor loaded its original copy."
    },
    {
      "id": "api-concurrent-edit-handling",
      "title": "Handling Concurrent Edits in an API",
      "priority": "High",
      "summary": "An API should define how a detected stale update is communicated and how a client can recover without overwriting newer state."
    },
    {
      "id": "optimistic-vs-pessimistic-concurrency",
      "title": "Optimistic vs Pessimistic Concurrency",
      "priority": "Very High",
      "summary": "Optimistic concurrency detects a conflict when committing; pessimistic concurrency acquires a lock to exclude competing work."
    },
    {
      "id": "sqlserver-ef-rowversion",
      "title": "SQL Server RowVersion & EF Core",
      "priority": "Very High",
      "summary": "SQL Server rowversion is an automatically changing binary version stamp that EF Core can use to detect a stale update."
    },
    {
      "id": "request-idempotency",
      "title": "Request Idempotency & Idempotency Keys",
      "priority": "Very High",
      "summary": "An idempotent operation has the same intended effect when the same request is repeated, which makes uncertain network retries safer."
    },
    {
      "id": "http-idempotent-methods",
      "title": "Idempotent HTTP Methods",
      "priority": "High",
      "summary": "HTTP defines PUT and DELETE as idempotent in intended effect, and GET, HEAD, OPTIONS, and TRACE as safe and therefore idempotent."
    },
    {
      "id": "put-avoiding-unnecessary-writes",
      "title": "PUT: Avoiding Unnecessary Database Writes",
      "priority": "High",
      "summary": "A PUT request can be idempotent even if the server writes each time; avoiding needless writes is a separate optimization and side-effect concern."
    },
    {
      "id": "duplicate-order-payment-requests",
      "title": "Preventing Duplicate Orders & Payments",
      "priority": "Very High",
      "summary": "Duplicate-sensitive business operations need durable deduplication across retries, concurrent requests, and downstream failures."
    },
    {
      "id": "put-vs-patch",
      "title": "PUT vs PATCH",
      "priority": "Very High",
      "summary": "PUT conventionally replaces a resource representation; PATCH applies a defined partial modification."
    },
    {
      "id": "api-error-status-codes",
      "title": "Error Status Codes for APIs",
      "priority": "High",
      "summary": "Status codes distinguish invalid input, missing authentication, denied access, stale state, and unexpected server failure."
    },
    {
      "id": "standard-api-error-response",
      "title": "Standard API Error Responses",
      "priority": "High",
      "summary": "A standard error body gives clients stable machine-readable classification without exposing internal implementation details."
    },
    {
      "id": "problem-details",
      "title": "ProblemDetails in ASP.NET Core",
      "priority": "High",
      "summary": "ProblemDetails is ASP.NET Core’s model for producing interoperable error documents based on the Problem Details standard."
    },
    {
      "id": "central-exception-handling",
      "title": "Centralized Exception Handling",
      "priority": "Very High",
      "summary": "Centralized exception handling turns unhandled failures into consistent, safe API responses while preserving operational diagnostics."
    }
  ]
};
