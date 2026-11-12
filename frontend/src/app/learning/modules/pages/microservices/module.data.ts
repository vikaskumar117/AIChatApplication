import { LearningModuleSummary } from '../../../learning.models';

export const microservicesModule: LearningModuleSummary = {
  "id": "microservices",
  "title": "Microservices",
  "description": "Design service boundaries, communication, and failure recovery with explicit consistency and delivery guarantees.",
  "topics": [
    {
      "id": "service-communication",
      "title": "Service Communication",
      "priority": "High",
      "summary": "Service communication is a contract and transport through which independently deployed components exchange commands, queries, or facts."
    },
    {
      "id": "sync-vs-async",
      "title": "Synchronous vs Asynchronous Communication",
      "priority": "High",
      "summary": "Synchronous request/response keeps the caller waiting for a result; asynchronous messaging lets sender and receiver progress at different times."
    },
    {
      "id": "downstream-outage",
      "title": "Responding to a Downstream Outage",
      "priority": "High",
      "summary": "A downstream outage is any dependency becoming unavailable, slow, overloaded, or semantically unhealthy from this caller’s perspective."
    },
    {
      "id": "failure-handling",
      "title": "Failure Handling Across Services",
      "priority": "High",
      "summary": "Failure handling is the end-to-end policy for classifying errors, containing impact, recovering work, and communicating outcomes across service boundaries."
    },
    {
      "id": "circuit-breaker",
      "title": "Circuit Breaker",
      "priority": "High",
      "summary": "A circuit breaker temporarily rejects calls to a dependency after a configured failure signal, then permits a limited recovery probe."
    },
    {
      "id": "retry-policy",
      "title": "Retry Policy",
      "priority": "High",
      "summary": "A retry is another attempt after a classified transient failure; backoff spaces attempts, and jitter randomizes timing among callers."
    },
    {
      "id": "timeout-deadline",
      "title": "Timeouts and Deadlines",
      "priority": "High",
      "summary": "A timeout bounds how long one operation waits; a deadline is the end-to-end time budget by which the whole request must complete."
    },
    {
      "id": "api-gateway",
      "title": "API Gateway",
      "priority": "High",
      "summary": "An API gateway is a controlled client-facing entry point that routes requests and may handle cross-cutting edge concerns such as authentication, rate limiting, and protocol translation."
    },
    {
      "id": "service-discovery",
      "title": "Service Discovery",
      "priority": "High",
      "summary": "Service discovery resolves a logical service name to currently available instances or endpoints."
    },
    {
      "id": "rabbitmq-azure-service-bus",
      "title": "RabbitMQ and Azure Service Bus Concepts",
      "priority": "High",
      "summary": "A message broker accepts messages and routes or stores them for consumers; RabbitMQ commonly uses exchanges, bindings, and queues, while Azure Service Bus provides queues and topics/subscriptions as managed messaging primitives."
    },
    {
      "id": "event-driven-architecture",
      "title": "Event-Driven Architecture",
      "priority": "High",
      "summary": "Event-driven architecture uses events—immutable statements that something already happened—to notify interested consumers without requiring the producer to invoke each one."
    },
    {
      "id": "saga-pattern",
      "title": "Saga Pattern",
      "priority": "High",
      "summary": "A saga is a long-running business workflow made of local transactions, with forward actions and compensating actions to address later failure."
    },
    {
      "id": "distributed-transaction",
      "title": "Distributed Transactions",
      "priority": "High",
      "summary": "A distributed transaction attempts to commit changes across multiple resource managers as one atomic outcome, commonly through a coordinator and a protocol such as two-phase commit."
    },
    {
      "id": "cross-service-consistency",
      "title": "Cross-Service Consistency",
      "priority": "High",
      "summary": "Cross-service consistency describes how independently committed data copies and service-owned states converge and what stale or intermediate state consumers may observe."
    },
    {
      "id": "monolith-vs-microservices",
      "title": "Monolith vs Microservices",
      "priority": "High",
      "summary": "A monolith packages an application as one deployable unit, while microservices split capabilities into separately owned and deployed services with explicit boundaries."
    },
    {
      "id": "duplicate-message-handling",
      "title": "Duplicate Message Handling and Idempotency",
      "priority": "High",
      "summary": "A duplicate message is the same logical delivery processed more than once; an idempotent operation produces the same effective state when repeated with the same identity."
    },
    {
      "id": "transactional-outbox",
      "title": "Transactional Outbox",
      "priority": "High",
      "summary": "The transactional outbox stores the intent to publish alongside the business state change in the same local database transaction."
    }
  ]
};
