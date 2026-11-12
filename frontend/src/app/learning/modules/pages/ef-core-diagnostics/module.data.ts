import { LearningModuleSummary } from '../../../learning.models';

export const efCoreDiagnosticsModule: LearningModuleSummary = {
  "id": "ef-core-diagnostics",
  "title": "EF Core, Testing & Real Project Scenarios",
  "description": "Build efficient data access, test meaningful boundaries, and diagnose production systems with evidence.",
  "topics": [
    {
      "id": "efcore-fundamentals",
      "title": "Entity Framework Core Fundamentals",
      "priority": "Very High",
      "summary": "Entity Framework Core (EF Core) is a .NET object-relational mapper (ORM): it maps .NET entity types and LINQ queries to relational schema and SQL through a database provider. DbContext is a unit-of-work and identity map that coordinates querying, change tracking, and saving."
    },
    {
      "id": "efcore-code-first-database-first",
      "title": "Code First vs Database First",
      "priority": "Very High",
      "summary": "Code First treats the EF model and migrations as the schema-evolution source of truth. Database First starts from an existing database and scaffolds entity types and DbContext from its schema; the generated code can be refreshed as the database changes."
    },
    {
      "id": "efcore-tracking-vs-no-tracking",
      "title": "Tracking vs No-Tracking Queries",
      "priority": "Very High",
      "summary": "A tracking query registers materialized entities in DbContext’s change tracker, which records state and original values for SaveChanges. A no-tracking query materializes results without registering them for normal updates; identity resolution controls whether repeated keys share an instance."
    },
    {
      "id": "efcore-related-data-loading",
      "title": "Eager, Lazy, and Explicit Loading",
      "priority": "Very High",
      "summary": "Eager loading fetches related data as part of the original query using Include/ThenInclude or projection. Lazy loading loads a navigation on access, commonly through proxies. Explicit loading deliberately issues a later query through the entry API."
    },
    {
      "id": "efcore-n-plus-one",
      "title": "Detect and Eliminate the N+1 Problem",
      "priority": "Very High",
      "summary": "N+1 is a query pattern where one query loads N parent records and subsequent navigation access issues roughly one additional query per parent."
    },
    {
      "id": "efcore-query-optimization",
      "title": "EF Core Query Optimization",
      "priority": "Very High",
      "summary": "EF Core query optimization aligns the LINQ expression, generated SQL, indexes, result shape, and database plan with the workload. Deferred IQueryable composition runs at the database only when materialized or enumerated."
    },
    {
      "id": "efcore-unit-testing",
      "title": "Unit Testing Application Logic",
      "priority": "Very High",
      "summary": "A unit test verifies a focused unit of behavior with controlled inputs and collaborators, typically without booting the web host or connecting to a production-like database."
    },
    {
      "id": "efcore-mock-vs-stub",
      "title": "Mock vs Stub vs Fake",
      "priority": "Very High",
      "summary": "A stub supplies predefined answers; a mock records or verifies expected interactions; a fake is a working simplified implementation (for example, an in-memory repository) that preserves a useful contract."
    },
    {
      "id": "efcore-integration-tests",
      "title": "Integration Testing APIs and Persistence",
      "priority": "Very High",
      "summary": "An integration test exercises multiple real components across a boundary, such as HTTP routing, dependency injection, serialization, EF Core translation, and a relational database."
    },
    {
      "id": "efcore-slow-api-diagnostics",
      "title": "Diagnose a Slow API in Production",
      "priority": "Very High",
      "summary": "Slow API diagnosis separates time spent in application code, database execution, network/dependency waits, queueing, serialization, and client transfer, then correlates a slow request with trace and resource evidence."
    },
    {
      "id": "efcore-high-cpu-memory",
      "title": "Diagnose High CPU and Memory",
      "priority": "Very High",
      "summary": "High CPU can result from application hot loops, excessive serialization, query translation/materialization, contention, or garbage collection. High memory can be allocation pressure, large caches, unbounded buffers, or retained object graphs."
    },
    {
      "id": "efcore-production-incident-handling",
      "title": "Production Incident Response",
      "priority": "Very High",
      "summary": "Incident handling is a structured process to reduce customer impact, preserve evidence, communicate status, restore service, and prevent recurrence."
    },
    {
      "id": "efcore-logging-monitoring",
      "title": "Logging, Metrics, and Distributed Tracing",
      "priority": "Very High",
      "summary": "Logs record discrete events, metrics aggregate numerical time series, and traces connect spans across a request and its dependencies. Together they describe what happened, how often, and where latency accumulated."
    },
    {
      "id": "efcore-database-failure-handling",
      "title": "Database Failure Handling and Resilience",
      "priority": "Very High",
      "summary": "Database failure handling distinguishes transient connectivity/failover conditions, command timeouts, deadlocks, constraint conflicts, cancellation, and permanent configuration or schema errors."
    },
    {
      "id": "efcore-scalable-api-design",
      "title": "Design Scalable Data-Backed APIs",
      "priority": "Very High",
      "summary": "A scalable API bounds work per request, isolates failures, manages concurrency and resources, and supports horizontal growth without relying on process-local state."
    }
  ]
};
