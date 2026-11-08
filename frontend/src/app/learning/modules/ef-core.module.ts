import { LearningModule, topic } from '../learning.models';

type EfLesson = {
  id: string;
  title: string;
  what: string;
  why: string;
  how: string;
  flow: string[];
  example: string;
  code: string;
  benefits: string[];
  costs: string[];
  use: string;
  avoid: string;
  questions: string[];
  scenario: string;
  diagram: { label: string; detail: string; code?: string }[];
  steps: string[];
  takeaways: string[];
  mistakes: string[];
  practices: string[];
  tables?: { title: string; headers: string[]; rows: string[][] }[];
  executionPlan?: { operator: string; purpose: string }[];
  sources?: { label: string; url: string }[];
};

function efLesson(lesson: EfLesson) {
  return topic(
    lesson.id, lesson.title, 'Very High',
    lesson.what,
    [lesson.what, lesson.why, lesson.how],
    lesson.flow,
    lesson.example,
    lesson.code,
    [lesson.benefits, lesson.costs],
    [lesson.use, lesson.avoid],
    lesson.questions,
    lesson.scenario,
    lesson.sources,
    {
      diagram: lesson.diagram,
      diagramNote: 'Validate the behavior against the deployed EF Core/provider version, generated SQL, database schema, and production configuration.',
      summary: `${lesson.what} ${lesson.why}`,
      exampleSteps: lesson.steps,
      keyTakeaways: lesson.takeaways,
      commonMistakes: lesson.mistakes,
      bestPractices: lesson.practices,
      exampleTables: lesson.tables,
      executionPlan: lesson.executionPlan,
    },
  );
}

export const efCoreModule: LearningModule = {
  id: 'ef-core-diagnostics',
  title: 'EF Core, Testing & Real Project Scenarios',
  description: 'Build efficient data access, test meaningful boundaries, and diagnose production systems with evidence.',
  topics: [
    efLesson({
      id: 'efcore-fundamentals', title: 'Entity Framework Core Fundamentals',
      what: 'Entity Framework Core (EF Core) is a .NET object-relational mapper (ORM): it maps .NET entity types and LINQ queries to relational schema and SQL through a database provider. DbContext is a unit-of-work and identity map that coordinates querying, change tracking, and saving.',
      why: 'EF Core reduces repetitive data-access code while preserving access to relational capabilities, but the abstraction does not remove SQL, transaction, schema, or provider behavior.',
      how: 'Model entities and relationships, configure mappings and constraints, compose LINQ expressions, inspect translated SQL, and call SaveChangesAsync to persist tracked changes. Use migrations or a separately managed schema workflow and keep DbContext scoped to a unit of work.',
      flow: ['Model and provider configuration', 'LINQ expression tree', 'Provider translates to SQL', 'Database executes and returns rows', 'Materialize entities and track changes', 'SaveChanges persists unit of work'],
      example: 'A request loads a customer projection and updates an order within one scoped DbContext.',
      code: `var order = await db.Orders
    .Where(o => o.Id == orderId)
    .Select(o => new { o.Id, o.Status })
    .SingleOrDefaultAsync(ct);

var entity = await db.Orders.SingleAsync(o => o.Id == orderId, ct);
entity.Status = OrderStatus.Confirmed;
await db.SaveChangesAsync(ct);`,
      benefits: ['LINQ and change tracking simplify common relational CRUD and mapping.', 'Provider abstraction and migrations support repeatable development workflows.'],
      costs: ['Generated SQL and provider translation can differ from developer expectations.', 'Change tracking, relationship loading, and abstractions can add allocations or hide round trips.'],
      use: 'Use EF Core for domain-oriented data access when generated SQL and provider behavior are understood and measured.',
      avoid: 'Avoid treating EF Core as a substitute for relational modeling, SQL knowledge, or reviewing critical generated SQL.',
      questions: ['What responsibilities does DbContext have?', 'How does LINQ become SQL?', 'Why can two EF Core providers translate a query differently?'],
      scenario: 'A team ships a query that works in the in-memory provider but fails on SQL Server translation. Reproduce using the production relational provider, inspect generated SQL, and keep provider-specific behavior inside integration coverage.',
      diagram: [
        { label: 'Entity model', detail: 'CLR types, keys, relationships, and configuration define the object model.' },
        { label: 'LINQ expression', detail: 'Queryable operators build an expression tree; they are not ordinary in-memory enumeration yet.' },
        { label: 'Provider translation', detail: 'Database provider maps supported expressions and types into SQL.' },
        { label: 'Database execution', detail: 'SQL Server applies schema, constraints, transactions, indexes, and query planning.' },
        { label: 'Materialization / unit of work', detail: 'Results become entities/projections; SaveChanges emits writes for tracked changes.' },
      ],
      steps: ['Configure provider, entity keys, relationships, and constraints.', 'Compose IQueryable before materialization.', 'Inspect generated SQL for important query paths.', 'Use a scoped DbContext and explicitly save a bounded unit of work.'],
      takeaways: ['DbContext is a short-lived unit of work and identity map.', 'LINQ query translation is provider- and version-dependent.', 'EF Core does not eliminate SQL, database constraints, or transaction semantics.', 'Review generated SQL and measure critical paths.'],
      mistakes: ['Treating IQueryable operations as already executed in memory.', 'Keeping one DbContext for an application lifetime.', 'Assuming EF InMemory behavior proves relational-provider correctness.'],
      practices: ['Scope DbContext to a request or explicit unit of work.', 'Use async database APIs with cancellation tokens in server paths.', 'Configure keys, relationships, and constraints intentionally.', 'Inspect SQL and use a relational provider for integration tests.'],
      sources: [{ label: 'Microsoft Learn: EF Core overview', url: 'https://learn.microsoft.com/en-us/ef/core/' }],
    }),
    efLesson({
      id: 'efcore-code-first-database-first', title: 'Code First vs Database First',
      what: 'Code First treats the EF model and migrations as the schema-evolution source of truth. Database First starts from an existing database and scaffolds entity types and DbContext from its schema; the generated code can be refreshed as the database changes.',
      why: 'The approach must fit ownership and deployment governance. A database may be shared across applications or controlled by DBAs, while a product team may own migrations alongside application code.',
      how: 'For Code First, review migrations, generate scripts, and apply them in a controlled deployment pipeline. For Database First, scaffold with explicit schema/table filters, keep custom behavior in partial classes or separate configuration, and avoid overwriting hand-authored code.',
      flow: ['Choose schema source of truth', 'Model or inspect existing schema', 'Generate migration or scaffold model', 'Review changes and deployment script', 'Validate upgrade and rollback strategy'],
      example: 'A new service owns its schema and uses reviewed migrations; a legacy shared database is scaffolded read-only and deployed through the DBA pipeline.',
      code: `// Code First: create a migration from reviewed model changes.
dotnet ef migrations add AddOrderStatus
dotnet ef migrations script --idempotent

// Database First: scaffold selected schema from the existing database.
dotnet ef dbcontext scaffold "<connection-string-from-secret-store>" \\
  Microsoft.EntityFrameworkCore.SqlServer \\
  --context AppDbContext --schema sales --table Order --no-onconfiguring`,
      benefits: ['Code First keeps model evolution and migration history close to application code.', 'Database First can integrate with an established schema and DBA governance.'],
      costs: ['Migrations need careful review for data loss, locks, and deployment sequencing.', 'Scaffolding can be overwritten and database drift complicates model ownership.'],
      use: 'Use Code First when the application team owns schema evolution; scaffold when the database is authoritative or externally governed.',
      avoid: 'Avoid applying unreviewed migrations automatically at production startup or editing generated scaffolding in place without a regeneration strategy.',
      questions: ['Who owns the schema in each workflow?', 'How should a production migration be deployed?', 'How do you preserve custom behavior across re-scaffolding?'],
      scenario: 'A new API shares a legacy database with several consumers. Treat the database as authoritative, scaffold only the owned schema surface, place custom mapping separately, and coordinate additive changes through the database deployment process.',
      diagram: [
        { label: 'Code First', detail: 'EF model changes produce migrations that describe schema evolution.' },
        { label: 'Database First', detail: 'Existing schema is scaffolded into entity and context code.' },
        { label: 'Review boundary', detail: 'Migration scripts or scaffold diffs are reviewed with schema owners.' },
        { label: 'Deploy safely', detail: 'Apply compatible schema changes in an ordered release pipeline.' },
      ],
      steps: ['Identify the authoritative schema owner and deployment pipeline.', 'Select migrations or scaffolding to match that ownership.', 'Review SQL/data impact and environment differences.', 'Test upgrade from a production-like prior schema and plan compatibility/rollback.'],
      takeaways: ['Code First and Database First differ primarily in source of truth and workflow.', 'Generated migrations and scaffolded code both require review.', 'Database changes should be versioned and deployed through a controlled pipeline.', 'Use additive, backward-compatible releases when app instances roll gradually.'],
      mistakes: ['Assuming Code First means the database is created only at runtime.', 'Applying migrations automatically in production without deployment controls.', 'Editing scaffolded files directly and losing changes on regeneration.'],
      practices: ['Document schema ownership and drift policy.', 'Generate and review SQL scripts before production deployment.', 'Use partial classes/configuration for custom scaffold behavior.', 'Test migration compatibility across deployment order.'],
      sources: [{ label: 'Microsoft Learn: Managing migrations', url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/' }, { label: 'Microsoft Learn: Reverse engineering', url: 'https://learn.microsoft.com/en-us/ef/core/managing-schemas/scaffolding/' }],
    }),
    efLesson({
      id: 'efcore-tracking-vs-no-tracking', title: 'Tracking vs No-Tracking Queries',
      what: 'A tracking query registers materialized entities in DbContext’s change tracker, which records state and original values for SaveChanges. A no-tracking query materializes results without registering them for normal updates; identity resolution controls whether repeated keys share an instance.',
      why: 'Tracking supports convenient updates and identity consistency but consumes CPU and memory. Read-only endpoints often benefit from projection or no-tracking materialization.',
      how: 'Use tracked entities for update workflows. Use Select projections for read models, or AsNoTracking for read-only entity results. AsNoTrackingWithIdentityResolution deduplicates entity instances within one result without retaining them in the context tracker.',
      flow: ['Compose query', 'Choose entity state behavior', 'Materialize results', 'Edit and SaveChanges or discard read-only results'],
      example: 'An API list returns a DTO projection; an edit command loads one tracked entity and changes allowed fields.',
      code: `var rows = await db.Orders
    .AsNoTracking()
    .Where(o => o.CreatedAt >= start)
    .Select(o => new OrderSummary(o.Id, o.Status, o.Total))
    .ToListAsync(ct);

var order = await db.Orders.SingleAsync(o => o.Id == command.Id, ct);
order.Status = command.Status;
await db.SaveChangesAsync(ct);`,
      benefits: ['No-tracking/projection reduces tracker state on read-heavy paths.', 'Tracking supports identity resolution and convenient change persistence.'],
      costs: ['No-tracking entities do not automatically persist edits.', 'Tracking a large graph increases memory and can return existing context instances with locally modified values.'],
      use: 'Use projection/no-tracking for read models and tracking for bounded update units.',
      avoid: 'Avoid enabling tracking globally for large read-only reports or using no-tracking when you expect SaveChanges to persist detached edits.',
      questions: ['What does the change tracker record?', 'How does AsNoTrackingWithIdentityResolution differ from tracking?', 'Why is a DTO projection often preferable to an entity for an API?'],
      scenario: 'A report retains thousands of tracked entities per request. Project only required fields, compare allocations and SQL result size, and retain tracked reads only in write workflows.',
      diagram: [
        { label: 'Tracking query', detail: 'Entities are registered with state/original values in the DbContext change tracker.' },
        { label: 'No-tracking query', detail: 'Entities or DTOs are materialized without normal change tracking.' },
        { label: 'Identity resolution', detail: 'Repeated entity keys may reuse one object; no-tracking variant can resolve without context tracking.' },
        { label: 'Persist or return', detail: 'Tracked edits are detected by SaveChanges; read-only projections are returned directly.' },
      ],
      steps: ['Identify whether the request reads, updates, or both.', 'Project to a DTO when only selected fields are required.', 'Choose tracking behavior explicitly for entity results.', 'Measure allocations and ensure detached updates are attached/validated deliberately if needed.'],
      takeaways: ['Tracking stores entity state for change detection and unit-of-work persistence.', 'No-tracking is appropriate for many read-only paths.', 'Projection avoids materializing unused columns and entity state.', 'Identity resolution and tracking are related but distinct choices.'],
      mistakes: ['Changing a no-tracking entity and expecting SaveChanges to detect it.', 'Returning full entity graphs where a DTO projection suffices.', 'Reusing a long-lived context and observing stale/locally changed instances.'],
      practices: ['Use short-lived DbContext instances.', 'Choose tracking mode per query based on behavior.', 'Prefer DTO projections for read APIs.', 'Test update flows for concurrency and field-level authorization.'],
      sources: [{ label: 'Microsoft Learn: Tracking vs. no-tracking queries', url: 'https://learn.microsoft.com/en-us/ef/core/querying/tracking' }],
    }),
    efLesson({
      id: 'efcore-related-data-loading', title: 'Eager, Lazy, and Explicit Loading',
      what: 'Eager loading fetches related data as part of the original query using Include/ThenInclude or projection. Lazy loading loads a navigation on access, commonly through proxies. Explicit loading deliberately issues a later query through the entry API.',
      why: 'Loading strategy controls round trips, row multiplication, memory, and when data access occurs. A navigation access can otherwise hide database I/O.',
      how: 'Prefer projection for read-model shapes, Include when a bounded entity graph is needed, explicit loading when a conditional follow-up is intentional, and lazy loading only when its hidden-query behavior is controlled and measured. Consider split queries for large collection graphs.',
      flow: ['Specify required graph', 'Choose eager/projection, explicit, or lazy', 'Inspect SQL and command count', 'Balance round trips and row volume'],
      example: 'Return order summaries and line counts in a projection; load a full order aggregate with Include only for a bounded command.',
      code: `// Projection for a read model:
var summaries = await db.Orders
    .Select(o => new OrderSummaryDto(
        o.Id, o.Number, o.Lines.Count))
    .ToListAsync(ct);

// Explicit loading for a conditional detail path:
var order = await db.Orders.SingleAsync(o => o.Id == id, ct);
if (needLines)
    await db.Entry(order).Collection(o => o.Lines).LoadAsync(ct);`,
      benefits: ['Eager loading makes graph shape visible at the query site.', 'Projection returns only required data; explicit loading is deliberate and conditional.'],
      costs: ['Eager collection joins can duplicate parent columns and inflate results.', 'Lazy loading hides additional queries; explicit loading can increase round trips.'],
      use: 'Use projection for APIs, eager loading for bounded required graphs, and explicit loading for intentionally conditional access.',
      avoid: 'Avoid uncontrolled lazy loading in serialization, loops, or code where hidden I/O violates latency expectations.',
      questions: ['How do the three loading strategies differ?', 'When can Include create a large joined result?', 'How can split queries affect consistency and round trips?'],
      scenario: 'An API serializer touches navigation properties after the service returns. Disable or constrain lazy loading, define the response graph in a projection, and verify SQL command count and result size.',
      diagram: [
        { label: 'Eager', detail: 'Include or projection requests related data as part of a defined query.' },
        { label: 'Lazy', detail: 'Navigation access triggers a hidden query when an unloaded property is read.' },
        { label: 'Explicit', detail: 'Application code issues a deliberate Load/LoadAsync after deciding it is needed.' },
        { label: 'Measure graph', detail: 'Inspect round trips, joins, duplicated rows, payload size, and consistency needs.' },
      ],
      steps: ['Define the response/entity graph and whether each relation is always required.', 'Prefer a projection for API output or Include for a bounded entity graph.', 'Use explicit loading for conditional secondary data.', 'Inspect generated SQL, number of commands, and result volume.'],
      takeaways: ['Eager, lazy, and explicit describe when/how navigation data is fetched.', 'Projection often gives the most precise read shape.', 'Lazy loading can make database access invisible to callers.', 'Split queries trade row multiplication for extra commands and consistency considerations.'],
      mistakes: ['Enabling lazy loading without accounting for serializers and loops.', 'Adding several collection Includes without checking cartesian multiplication.', 'Assuming Include is needed when a DTO projection can express the result.'],
      practices: ['Make query shape explicit at the service boundary.', 'Count database commands in tests and diagnostics.', 'Use split-query behavior intentionally and verify transactional consistency.', 'Avoid serializing tracked entities directly from an API.'],
      sources: [{ label: 'Microsoft Learn: Loading related data', url: 'https://learn.microsoft.com/en-us/ef/core/querying/related-data/' }],
    }),
    efLesson({
      id: 'efcore-n-plus-one', title: 'Detect and Eliminate the N+1 Problem',
      what: 'N+1 is a query pattern where one query loads N parent records and subsequent navigation access issues roughly one additional query per parent.',
      why: 'Round-trip latency and database work can dominate endpoint time and grow linearly with page size, even when each individual SQL statement is quick.',
      how: 'Count commands and inspect EF Core database logs/traces. Replace repeated navigation access with a projection, an appropriate Include, or an intentional grouped query. Compare generated SQL, rows transferred, and latency; an overly broad join can also be inefficient.',
      flow: ['Load parent collection', 'Access each related navigation', 'Observe N additional commands', 'Project/include/group to bounded query shape', 'Measure command and row counts'],
      example: 'Return order number and line count with a single aggregate projection instead of enumerating each order’s Lines.',
      code: `var summaries = await db.Orders
    .Where(o => o.CreatedAt >= start)
    .Select(o => new OrderSummaryDto(
        o.Id, o.Number, o.Lines.Count))
    .ToListAsync(ct);`,
      benefits: ['Projection/grouping can reduce round trips and avoid loading unused entity graphs.', 'Command-count instrumentation makes the issue measurable.'],
      costs: ['A large Include can replace many round trips with a huge duplicated join result.', 'Provider translation and split-query choices need verification.'],
      use: 'Use projection for read models and bounded Includes when entity relationships are required.',
      avoid: 'Avoid navigation access inside loops and lazy-loading during serialization.',
      questions: ['How does query count grow in an N+1 pattern?', 'How can projection avoid over-fetching?', 'Why is Include not automatically the best fix?'],
      scenario: 'An orders endpoint is fast for one record and slow for a full page. Trace shows one orders query and 50 line queries. Replace with aggregate projection, assert command count in an integration test, and compare rows and response latency.',
      diagram: [
        { label: 'Initial query', detail: 'Fetch N parent entities.' },
        { label: 'Navigation loop', detail: 'Each access triggers a relationship query, often via lazy loading.' },
        { label: 'N extra round trips', detail: 'Database calls grow with parent count and network latency.' },
        { label: 'Bounded shape', detail: 'Projection, grouped query, or deliberate Include fetches the required result.' },
      ],
      steps: ['Record database command count per request and correlate with parent count.', 'Identify navigation accesses that issue SQL.', 'Express the response as projection or a bounded graph.', 'Test SQL command count and compare rows transferred and p95 latency.'],
      takeaways: ['N+1 means one parent query plus per-parent relationship queries.', 'Count commands; one slow query is not the only performance problem.', 'Projection often avoids both N+1 and over-fetching.', 'Validate that the fix reduces total work, not just command count.'],
      mistakes: ['Relying on endpoint duration without observing database command count.', 'Replacing N+1 with a massive multi-collection join.', 'Allowing JSON serialization to trigger lazy loads.'],
      practices: ['Instrument EF command counts and durations.', 'Write list endpoints as explicit DTO projections.', 'Add regression tests for query count on representative data.', 'Use Include only when the entity graph is truly required.'],
      sources: [{ label: 'Microsoft Learn: Efficient querying', url: 'https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying' }],
    }),
    efLesson({
      id: 'efcore-query-optimization', title: 'EF Core Query Optimization',
      what: 'EF Core query optimization aligns the LINQ expression, generated SQL, indexes, result shape, and database plan with the workload. Deferred IQueryable composition runs at the database only when materialized or enumerated.',
      why: 'ORM abstractions can hide over-fetching, client-side work, repeated queries, tracking allocations, and provider translation costs. Database-side execution still follows database planning and resource constraints.',
      how: 'Project only required columns, filter and page on the server, use AsNoTracking for read-only entities, avoid premature ToList, inspect generated SQL and actual plans, and measure reads/rows/time. Use compiled queries only after measurement shows query compilation overhead is material.',
      flow: ['Compose IQueryable', 'Translate LINQ to SQL', 'Database filters/orders/pages', 'Materialize selected rows', 'Measure and refine'],
      example: 'A paged endpoint applies a stable server-side order and projection before ToListAsync.',
      code: `var page = await db.Products
    .AsNoTracking()
    .Where(p => p.IsActive && p.Name.StartsWith(prefix))
    .OrderBy(p => p.Name).ThenBy(p => p.Id)
    .Skip(offset).Take(pageSize)
    .Select(p => new ProductDto(p.Id, p.Name, p.Price))
    .ToListAsync(ct);`,
      benefits: ['Projection and server-side filtering reduce transferred rows and allocations.', 'Generated SQL and plans allow optimization at the actual database boundary.'],
      costs: ['Some LINQ expressions do not translate or translate differently by provider/version.', 'Offset paging cost can rise at deep pages; specialized SQL or keyset paging may be needed.'],
      use: 'Use explicit query shapes and measurements for high-volume or latency-sensitive endpoints.',
      avoid: 'Avoid materializing early, loading full graphs by default, or introducing compiled/raw SQL complexity before measurement.',
      questions: ['What is the difference between IQueryable and IEnumerable execution?', 'Why add a unique tie-breaker to pagination?', 'When would compiled queries be worthwhile?'],
      scenario: 'A catalog API allocates heavily and returns slow deep pages. Project DTOs, filter on the server, add a stable ordering, inspect the SQL plan and logical reads, then evaluate keyset pagination and index design.',
      diagram: [
        { label: 'Expression tree', detail: 'IQueryable composes operations before execution.' },
        { label: 'SQL translation', detail: 'EF provider translates supported expressions for the target database.' },
        { label: 'Database plan', detail: 'SQL Server chooses access paths, joins, sort, and pagination strategy.' },
        { label: 'Materialization', detail: 'Only requested rows/columns become DTOs or tracked entities.' },
        { label: 'Measurement', detail: 'Validate command count, result size, allocations, reads, and tail latency.' },
      ],
      steps: ['Keep filters, ordering, projection, and paging in IQueryable before materialization.', 'Use deterministic ordering and page-size limits.', 'Inspect generated SQL and actual database plan.', 'Measure allocations, logical reads, result size, and p95/p99 latency.'],
      takeaways: ['IQueryable is deferred until materialization; ToList changes the boundary to memory.', 'Project only the required fields and keep filtering/paging server-side.', 'Generated SQL and database plans are part of EF performance diagnosis.', 'Optimize from workload evidence, not premature complexity.'],
      mistakes: ['Calling ToList before Where/Select and processing the full table in memory.', 'Using Skip/Take without deterministic order.', 'Assuming compiled queries fix a database bottleneck.'],
      practices: ['Set a maximum page size and stable unique ordering.', 'Use cancellation-aware async terminal operators.', 'Inspect SQL and plan for critical queries.', 'Benchmark representative data distributions and concurrency.'],
      sources: [{ label: 'Microsoft Learn: Efficient querying', url: 'https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying' }],
    }),
    efLesson({
      id: 'efcore-unit-testing', title: 'Unit Testing Application Logic',
      what: 'A unit test verifies a focused unit of behavior with controlled inputs and collaborators, typically without booting the web host or connecting to a production-like database.',
      why: 'Fast isolated tests support frequent feedback and precise business-rule coverage, but they do not prove EF translation, SQL constraints, provider behavior, or deployment wiring.',
      how: 'Keep domain rules in testable units, use real simple values for pure logic, inject ports for external effects, and assert observable behavior. Keep tests independent of implementation details and reserve relational boundaries for integration tests.',
      flow: ['Arrange inputs and collaborators', 'Act on one behavior', 'Assert result and observable effects', 'Keep test deterministic and isolated'],
      example: 'Unit-test a discount calculation without mocking the calculator itself or involving EF Core.',
      code: `[Fact]
public void Discount_is_applied_to_eligible_total()
{
    var total = PriceCalculator.Total(100m, 10m);

    Assert.Equal(90m, total);
}`,
      benefits: ['Fast, deterministic feedback for business rules.', 'Failures identify a narrow behavior and are inexpensive to run.'],
      costs: ['Mocks can become coupled to implementation and do not validate infrastructure behavior.', 'Excessive isolation can miss wiring and database translation defects.'],
      use: 'Use unit tests for pure logic, validation, state transitions, and orchestration decisions.',
      avoid: 'Avoid testing EF query translation or relational behavior solely with mocked DbSet or EF InMemory.',
      questions: ['What should a unit test isolate?', 'Which behavior belongs in an integration test?', 'How can over-mocking make tests brittle?'],
      scenario: 'A pricing change has many boundary rules. Extract deterministic calculation logic, test thresholds and rounding, then add a small set of integration tests for persistence and API behavior.',
      diagram: [
        { label: 'Arrange', detail: 'Construct domain values and deterministic dependencies.' },
        { label: 'Act', detail: 'Execute one public behavior or state transition.' },
        { label: 'Assert', detail: 'Check the outcome and meaningful observable side effects.' },
        { label: 'Boundary coverage', detail: 'Leave database/provider and host wiring to integration tests.' },
      ],
      steps: ['Choose one behavior and its boundary.', 'Create ordinary inputs and minimal fake collaborators.', 'Call the public unit behavior once.', 'Assert result, state transition, and only meaningful interactions.'],
      takeaways: ['Unit tests are best for focused deterministic logic.', 'Mocks do not prove database or framework behavior.', 'Test behavior rather than private implementation details.', 'Complement unit tests with integration coverage at critical boundaries.'],
      mistakes: ['Mocking every value object and pure function.', 'Asserting internal call order without a behavioral reason.', 'Using EF InMemory as evidence of relational correctness.'],
      practices: ['Keep tests small, deterministic, and independently runnable.', 'Use parameterized tests for rule boundaries.', 'Name tests around behavior and expected outcome.', 'Run relational integration tests for SQL-dependent behavior.'],
      sources: [{ label: 'Microsoft Learn: Unit testing best practices', url: 'https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices' }],
    }),
    efLesson({
      id: 'efcore-mock-vs-stub', title: 'Mock vs Stub vs Fake',
      what: 'A stub supplies predefined answers; a mock records or verifies expected interactions; a fake is a working simplified implementation (for example, an in-memory repository) that preserves a useful contract.',
      why: 'Choosing the least complex test double keeps tests readable and avoids mistaking a mock’s configured behavior for production correctness.',
      how: 'Use a stub to control collaborator output, a mock when an interaction itself is part of the contract, and a fake when a lightweight working implementation improves confidence. Prefer real pure components; use real database integration tests when provider semantics matter.',
      flow: ['Identify dependency role', 'Choose real object or test double', 'Configure answer or interaction', 'Assert behavior at the boundary'],
      example: 'Stub a payment gateway response to test orchestration; use a mock only when verifying that an authorization call is required is itself the behavior.',
      code: `// Stub: deterministic response, no interaction assertion.
var gateway = new StubPaymentGateway(PaymentResult.Approved);
var service = new CheckoutService(gateway);

var result = await service.CheckoutAsync(order, ct);

Assert.Equal(CheckoutStatus.Confirmed, result.Status);`,
      benefits: ['Doubles isolate external nondeterminism and make failure paths testable.', 'A fake can exercise more realistic behavior than a long list of mock setups.'],
      costs: ['Mocks can couple tests to call choreography.', 'Fakes may diverge from production implementation; stubs validate only configured cases.'],
      use: 'Use the simplest double that exposes the behavior under test; reserve interaction mocks for meaningful contracts.',
      avoid: 'Avoid mocking EF Core internals or using a fake repository as proof of SQL translation and constraints.',
      questions: ['How does a stub differ from a mock?', 'When is a fake preferable?', 'What can a test double not prove about a database provider?'],
      scenario: 'A service test verifies six repository calls in exact order and breaks during a harmless refactor. Replace interaction-heavy assertions with a stubbed collaborator and assert the resulting business outcome; retain integration coverage for persistence.',
      diagram: [
        { label: 'Stub', detail: 'Returns configured values to drive a branch or outcome.' },
        { label: 'Mock', detail: 'Records/verifies a meaningful expected interaction.' },
        { label: 'Fake', detail: 'Runs a simplified working implementation of a dependency contract.' },
        { label: 'Real boundary test', detail: 'Use the actual relational provider for translation and constraint semantics.' },
      ],
      steps: ['Ask whether the dependency behavior or the interaction is the contract.', 'Use a real deterministic object when practical.', 'Stub nondeterministic answers; mock only meaningful interactions; use fakes for useful lightweight behavior.', 'Test provider-specific behavior against a relational database separately.'],
      takeaways: ['Stub supplies answers; mock verifies interaction; fake provides simplified working behavior.', 'Prefer the simplest test double that tests behavior.', 'Test doubles do not prove production database semantics.', 'Do not mock internal EF Core implementation details.'],
      mistakes: ['Calling every test double a mock and obscuring its purpose.', 'Verifying incidental call order rather than observable contract.', 'Treating an in-memory fake repository as equivalent to SQL Server.'],
      practices: ['Keep doubles at application-owned interfaces.', 'Use strict interaction expectations only when the interaction is contractual.', 'Make fakes explicit about behaviors they do not emulate.', 'Pair unit tests with provider-realistic integration tests.'],
    }),
    efLesson({
      id: 'efcore-integration-tests', title: 'Integration Testing APIs and Persistence',
      what: 'An integration test exercises multiple real components across a boundary, such as HTTP routing, dependency injection, serialization, EF Core translation, and a relational database.',
      why: 'Integration tests catch configuration, mapping, provider, constraint, and middleware failures that isolated unit tests cannot observe.',
      how: 'Use WebApplicationFactory for an in-process ASP.NET Core test host and a disposable relational database such as SQL Server in a container or SQLite when its semantics are sufficient. Isolate test data, apply schema deliberately, and clean up reliably.',
      flow: ['Boot test host and real provider', 'Arrange isolated data', 'Call endpoint or application boundary', 'Assert HTTP and persisted state', 'Dispose isolated resources'],
      example: 'Post an order through the test server, verify status code, and query the database to ensure the transaction persisted the expected order.',
      code: `public sealed class OrdersApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;
    public OrdersApiTests(WebApplicationFactory<Program> factory) =>
        _client = factory.CreateClient();

    [Fact]
    public async Task Post_order_returns_created()
    {
        var response = await _client.PostAsJsonAsync(
            "/api/orders", new CreateOrderRequest("SKU-1", 2));
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}`,
      benefits: ['Validates real dependency injection, HTTP pipeline, serialization, and relational semantics.', 'Provides confidence in behavior across component boundaries.'],
      costs: ['Slower and more operationally complex than unit tests.', 'Shared databases, nondeterministic state, and parallel runs can cause flaky tests.'],
      use: 'Use for critical API flows, EF translation, constraints, transactions, authentication wiring, and provider-specific behavior.',
      avoid: 'Avoid running destructive tests against shared or production databases or using a provider that cannot represent the behavior being tested.',
      questions: ['What does WebApplicationFactory exercise?', 'When is SQLite insufficient compared with SQL Server?', 'How do you isolate parallel integration tests?'],
      scenario: 'A migration introduces a SQL Server-specific filtered index and a query translation regression. Run integration tests against the same engine/provider version in an isolated database and verify both schema and endpoint behavior.',
      diagram: [
        { label: 'Test host', detail: 'WebApplicationFactory boots the actual ASP.NET Core pipeline and DI configuration.' },
        { label: 'Relational provider', detail: 'A disposable database executes real SQL, constraints, and transactions.' },
        { label: 'HTTP boundary', detail: 'Test client sends real serialized requests through routing and middleware.' },
        { label: 'Assertions / cleanup', detail: 'Verify response and persisted state; isolate and dispose test resources.' },
      ],
      steps: ['Select a provider that matches the behavior under test.', 'Create a unique database/schema per test run or collection.', 'Arrange data through known setup and call the public HTTP/application boundary.', 'Assert response and database outcome, then clean up regardless of test result.'],
      takeaways: ['Integration tests validate wiring and real boundary behavior.', 'EF InMemory is not a relational database substitute.', 'Use production-compatible provider testing for SQL-specific behavior.', 'Isolation and cleanup are essential for repeatable parallel runs.'],
      mistakes: ['Using one shared database and relying on test execution order.', 'Testing provider-specific SQL only with EF InMemory.', 'Ignoring cleanup after test failure.'],
      practices: ['Use disposable, isolated databases or containers.', 'Keep fixtures deterministic and parallel-safe.', 'Apply migrations/schema through an explicit test setup.', 'Test a focused set of critical end-to-end flows.'],
      sources: [{ label: 'Microsoft Learn: Integration tests in ASP.NET Core', url: 'https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests' }],
    }),
    efLesson({
      id: 'efcore-slow-api-diagnostics', title: 'Diagnose a Slow API in Production',
      what: 'Slow API diagnosis separates time spent in application code, database execution, network/dependency waits, queueing, serialization, and client transfer, then correlates a slow request with trace and resource evidence.',
      why: 'Endpoint duration alone cannot reveal whether the cause is an N+1 query, blocking, pool exhaustion, downstream latency, CPU saturation, or oversized response.',
      how: 'Compare p50/p95/p99 by route and deployment version, inspect distributed traces and dependency spans, correlate EF command count/duration and Query Store, check connection/thread pools and waits, and reproduce with representative inputs. Change one hypothesis and watch tail latency.',
      flow: ['Detect route-level latency regression', 'Trace request spans and dependency calls', 'Correlate EF/SQL commands and host saturation', 'Test likely cause', 'Roll out and verify tail latency'],
      example: 'A route’s p99 rises while SQL duration is stable but command count rises with page size, pointing to N+1 or serialization-triggered loading.',
      code: `// Diagnostic sequence (run through approved telemetry, not by logging secrets):
// 1. Compare route p50/p95/p99 by build and endpoint.
// 2. Open a slow request trace and inspect DB/downstream spans.
// 3. Compare EF command count, duration, rows, and SQL Query Store history.
// 4. Check connection-pool waits, CPU, GC, thread-pool queue, and response bytes.
// 5. Reproduce with bounded representative inputs; validate one fix.`,
      benefits: ['Correlated traces distinguish application, database, and dependency latency.', 'Tail percentiles show user impact hidden by averages.'],
      costs: ['High-cardinality or verbose telemetry can be expensive and expose sensitive data.', 'Sampling can omit rare slow traces and correlation requires consistent IDs.'],
      use: 'Use end-to-end tracing and resource/dependency correlation for production latency incidents.',
      avoid: 'Avoid logging full request bodies/SQL parameter values or optimizing from aggregate average duration alone.',
      questions: ['Why are p95/p99 more useful than averages during incidents?', 'How do traces distinguish SQL time from application time?', 'Which EF metrics help identify N+1 or pool pressure?'],
      scenario: 'A checkout API p99 doubles after a release. Compare old/new route traces, inspect database command count and dependency spans, check thread/connection pools and response size, then roll back or deploy a measured fix with dashboard verification.',
      diagram: [
        { label: 'SLO / percentile alert', detail: 'Identify affected route, customer impact, time window, and deployment correlation.' },
        { label: 'Distributed trace', detail: 'Break request latency into application, DB, and downstream spans.' },
        { label: 'EF and SQL evidence', detail: 'Inspect command count/duration, Query Store plans, waits, and row volume.' },
        { label: 'Host and network', detail: 'Check CPU, GC, thread/connection pools, queueing, serialization, and response bytes.' },
        { label: 'Mitigate / verify', detail: 'Choose rollback or targeted fix; validate recovery against SLO and error rate.' },
      ],
      steps: ['Confirm affected route, percentile, scope, and recent changes.', 'Open representative slow traces and attribute time by span.', 'Correlate EF command metrics, SQL plan history, pool waits, CPU/GC, and payload size.', 'Mitigate safely, then verify p95/p99, errors, and resource trend.'],
      takeaways: ['API latency spans application, data, dependencies, and transfer.', 'Percentiles expose tail degradation hidden by mean duration.', 'Query count, SQL duration, and host saturation are complementary evidence.', 'Protect telemetry from high-cardinality and sensitive payloads.'],
      mistakes: ['Blaming SQL before examining trace spans or dependency time.', 'Using average latency as the sole SLO signal.', 'Enabling unrestricted EF sensitive-data logging in production.'],
      practices: ['Propagate trace/correlation IDs across services.', 'Track route percentiles, command count, dependency latency, errors, and saturation.', 'Use sampling and redaction policies.', 'Maintain rollback and incident runbooks.'],
      sources: [{ label: 'Microsoft Learn: OpenTelemetry in .NET', url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel' }],
    }),
    efLesson({
      id: 'efcore-high-cpu-memory', title: 'Diagnose High CPU and Memory',
      what: 'High CPU can result from application hot loops, excessive serialization, query translation/materialization, contention, or garbage collection. High memory can be allocation pressure, large caches, unbounded buffers, or retained object graphs.',
      why: 'CPU and memory symptoms require different evidence: a high allocation rate can cause GC/CPU without a leak, while retained memory can grow with stable allocation rate.',
      how: 'Start with bounded runtime counters and process/container metrics. Use dotnet-counters for live trends, dotnet-trace for sampled CPU/GC stacks, and dotnet-dump for heap/root analysis when authorized. Correlate with request volume and deployment; production dumps may contain sensitive data.',
      flow: ['Observe CPU, heap, allocation, GC and request metrics', 'Compare trend to load and build', 'Capture bounded trace or authorized dump', 'Identify hot path or retention root', 'Verify under representative load'],
      example: 'A rising heap after each request but stable traffic suggests retained objects; compare GC heap size and inspect roots in a secured dump.',
      code: `dotnet-counters monitor --process-id <pid>
dotnet-trace collect --process-id <pid>
dotnet-dump collect --process-id <pid>
// Collect only with authorization, bounded duration, secure storage, and a data-handling plan.`,
      benefits: ['Runtime tools distinguish live allocation, CPU hot paths, GC activity, and object retention.', 'Repeated measurements validate remediation rather than relying on one snapshot.'],
      costs: ['Tracing and dumps add overhead and require runtime/OS access.', 'Heap dumps can contain secrets, tokens, personal data, and application payloads.'],
      use: 'Use least-invasive metrics first, then approved traces or dumps when evidence needs deeper stacks or object roots.',
      avoid: 'Avoid collecting or sharing production dumps without authorization, access controls, retention limits, and data review.',
      questions: ['How do allocation pressure and a memory leak differ?', 'Which tool helps identify live counters versus CPU stacks?', 'Why is a production dump sensitive?'],
      scenario: 'Memory climbs after deployment while request volume is flat. Compare per-build allocation and heap trends, trace hot allocations, inspect retained roots in an approved secured dump, and verify stable memory after the fix.',
      diagram: [
        { label: 'Metrics first', detail: 'Observe process/container CPU, working set, GC heap, allocation, and request rate.' },
        { label: 'Trace', detail: 'Capture bounded CPU/GC stacks to locate hot methods and allocation sources.' },
        { label: 'Dump if authorized', detail: 'Inspect object graph and retaining roots using secured diagnostic storage.' },
        { label: 'Fix and compare', detail: 'Repeat the same load and compare allocation, heap, latency, and CPU.' },
      ],
      steps: ['Establish resource trends and relate them to traffic, version, and container limits.', 'Use counters to distinguish allocation rate, GC, and retained heap.', 'Capture a bounded trace; take a dump only when authorized and protected.', 'Identify hot path or retaining root and reproduce under representative load.'],
      takeaways: ['High allocation can cause CPU/GC without a retained-memory leak.', 'Counters show trends; traces reveal stacks; dumps reveal retained objects/roots.', 'Production diagnostic artifacts may contain sensitive data.', 'Verify the fix under comparable traffic and resource limits.'],
      mistakes: ['Calling all memory growth a leak without checking allocation and GC.', 'Collecting full dumps casually or storing them in unsecured locations.', 'Optimizing code from one CPU sample without representative load.'],
      practices: ['Start with metrics and least-invasive collection.', 'Bound duration and overhead of traces.', 'Secure, restrict, and expire diagnostic artifacts.', 'Compare before/after by build and representative request mix.'],
      sources: [{ label: 'Microsoft Learn: .NET diagnostics tools', url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/' }],
    }),
    efLesson({
      id: 'efcore-production-incident-handling', title: 'Production Incident Response',
      what: 'Incident handling is a structured process to reduce customer impact, preserve evidence, communicate status, restore service, and prevent recurrence.',
      why: 'Uncoordinated debugging during an outage can increase blast radius, lose evidence, and delay a safe mitigation. A rollback or feature disable may be better than an immediate code fix.',
      how: 'Declare severity and an incident lead, scope impact, check recent changes and SLOs, choose reversible mitigations, preserve relevant telemetry, communicate on a cadence, verify recovery, and run a blameless follow-up with owners and due dates.',
      flow: ['Detect and declare', 'Assign incident roles and scope impact', 'Mitigate with reversible action', 'Verify recovery and communicate', 'Review root causes and actions'],
      example: 'A new release causes database timeouts; stop rollout or roll back, protect the database from retry amplification, confirm recovery, and investigate using traces and Query Store after stabilization.',
      code: `// Operational checklist:
// 1. Declare incident; name incident lead and communications owner.
// 2. Quantify affected routes, tenants, regions, errors, and SLO impact.
// 3. Pause rollout / rollback / disable feature using the safest reversible control.
// 4. Check retry volume, DB saturation, queue depth, and dependency health.
// 5. Verify recovery, communicate status, preserve evidence, and assign follow-ups.`,
      benefits: ['Clear roles and reversible mitigations reduce time to restore service.', 'Evidence preservation enables durable fixes after recovery.'],
      costs: ['Incident coordination consumes engineering capacity and requires practiced runbooks.', 'A mitigation can trade feature availability for system stability.'],
      use: 'Use a formal incident process for material customer impact, data integrity risk, or SLO breaches.',
      avoid: 'Avoid speculative changes, blame-focused reviews, or continuing retries that amplify a failing dependency.',
      questions: ['Who owns decisions during an incident?', 'Why prefer reversible mitigation?', 'What should a post-incident review produce?'],
      scenario: 'A database failover increases API timeouts and retry traffic. Pause deployment, set bounded retries/circuit breaking, communicate scope, verify connection recovery and queue drain, then review failover handling and load tests.',
      diagram: [
        { label: 'Detect / declare', detail: 'Use alert and impact criteria; open incident record and establish severity.' },
        { label: 'Coordinate', detail: 'Assign incident lead, technical responders, and communications owner.' },
        { label: 'Mitigate', detail: 'Choose rollback, feature flag, traffic shift, or capacity protection with low-risk reversibility.' },
        { label: 'Verify', detail: 'Check SLOs, error rate, queue recovery, and data integrity.' },
        { label: 'Learn', detail: 'Preserve evidence and create blameless, owned corrective actions.' },
      ],
      steps: ['Declare and define customer impact, severity, and incident roles.', 'Stop rollout or select the safest reversible mitigation.', 'Protect dependencies from retry storms and monitor recovery indicators.', 'Communicate status, preserve evidence, and schedule blameless follow-up actions.'],
      takeaways: ['Restore service safely before attempting a risky deep fix.', 'Assign a clear incident lead and communications owner.', 'Use reversible mitigations and verify against customer-facing SLOs.', 'Post-incident review should produce owned, time-bound system improvements.'],
      mistakes: ['Making multiple untracked changes during an outage.', 'Retrying aggressively against an unhealthy database.', 'Closing the incident when alerts clear without checking data integrity and backlog.'],
      practices: ['Practice runbooks and rollback procedures.', 'Maintain explicit severity and escalation criteria.', 'Communicate impact and next update cadence.', 'Review systems and process, not individual blame.'],
    }),
    efLesson({
      id: 'efcore-logging-monitoring', title: 'Logging, Metrics, and Distributed Tracing',
      what: 'Logs record discrete events, metrics aggregate numerical time series, and traces connect spans across a request and its dependencies. Together they describe what happened, how often, and where latency accumulated.',
      why: 'Logs alone are difficult to aggregate; metrics lack per-request context; traces show causal timing but may be sampled. Correlation across all three improves diagnosis.',
      how: 'Use structured logs with stable event IDs and trace IDs, low-cardinality metrics for latency/error/saturation, and distributed tracing for request/dependency spans. Redact secrets and personal data; avoid SQL parameter logging unless explicitly approved and protected.',
      flow: ['Instrument request and dependency boundaries', 'Emit structured logs and metrics', 'Propagate trace context', 'Correlate during alert/incident', 'Tune sampling and retention'],
      example: 'An API trace has an EF database span linked to a request ID, while route-level histograms show the p99 regression.',
      code: `using var activity = ActivitySource.StartActivity("orders.create");
logger.LogInformation("Creating order {OrderId} TraceId={TraceId}",
    orderId, Activity.Current?.TraceId);

// Record low-cardinality metrics such as route, result, and dependency duration.
// Do not use user IDs, raw SQL, tokens, or arbitrary query strings as metric labels.`,
      benefits: ['Three telemetry signals answer complementary diagnostic questions.', 'Correlation IDs connect API activity to dependencies and logs.'],
      costs: ['Telemetry volume, cardinality, retention, and sampling require governance.', 'Sensitive data can leak through log scopes, SQL, headers, or exception messages.'],
      use: 'Use structured, correlated telemetry aligned with SLOs and incident questions.',
      avoid: 'Avoid high-cardinality metric labels, unredacted secrets, and unbounded verbose production logging.',
      questions: ['When do you use logs versus metrics versus traces?', 'Why are user IDs bad metric labels?', 'How does trace context improve SQL/API diagnosis?'],
      scenario: 'A latency alert cannot identify which dependency is slow. Add trace propagation and bounded dependency spans, correlate EF command metrics by route/build, and use redaction and low-cardinality tags.',
      diagram: [
        { label: 'Metrics', detail: 'Aggregate latency, errors, traffic, and saturation for alerts and trends.' },
        { label: 'Trace', detail: 'Connect request and dependency spans to explain per-request latency.' },
        { label: 'Structured logs', detail: 'Record detailed events with stable fields and correlation IDs.' },
        { label: 'Governance', detail: 'Redact sensitive fields and control cardinality, sampling, and retention.' },
      ],
      steps: ['Define service SLOs and the metrics that signal user impact.', 'Instrument route and dependency spans with propagated trace context.', 'Emit structured event logs linked by trace/correlation ID.', 'Review labels, redaction, sampling, access, and retention policies.'],
      takeaways: ['Metrics detect and quantify; traces localize latency; logs explain events.', 'Trace correlation connects EF/database activity to API requests.', 'High-cardinality labels increase cost and harm aggregation.', 'Never log secrets or unrestricted production SQL parameter values.'],
      mistakes: ['Using logs as the only source for fleet-wide latency trends.', 'Adding user IDs or arbitrary strings as metric dimensions.', 'Enabling sensitive EF logging in production without strict controls.'],
      practices: ['Use OpenTelemetry-compatible instrumentation and context propagation.', 'Keep metric dimensions bounded and stable.', 'Redact personal data, credentials, and sensitive query values.', 'Define retention and access controls for telemetry.'],
      sources: [{ label: 'Microsoft Learn: .NET observability with OpenTelemetry', url: 'https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel' }],
    }),
    efLesson({
      id: 'efcore-database-failure-handling', title: 'Database Failure Handling and Resilience',
      what: 'Database failure handling distinguishes transient connectivity/failover conditions, command timeouts, deadlocks, constraint conflicts, cancellation, and permanent configuration or schema errors.',
      why: 'Retrying every failure can amplify outages, duplicate non-idempotent writes, and delay recovery. Some failures need a bounded retry; others require a caller correction or operator action.',
      how: 'Use provider-supported execution strategies for classified transient faults, bounded retries with jitter and deadlines, idempotency keys for commands, and short transactions. Keep external side effects outside retryable database units or use an outbox; surface permanent errors appropriately.',
      flow: ['Classify database failure', 'Check cancellation and operation safety', 'Retry only transient idempotent unit with bounds', 'Respect request deadline and circuit state', 'Record outcome and recover'],
      example: 'A transient failover error on an idempotent read can retry within a short deadline; a unique-key conflict should be interpreted as a domain outcome, not retried blindly.',
      code: `options.UseSqlServer(connectionString, sql =>
    sql.EnableRetryOnFailure(
        maxRetryCount: 3,
        maxRetryDelay: TimeSpan.FromSeconds(5),
        errorNumbersToAdd: null));

// When using an execution strategy with an explicit transaction, execute
// the whole transaction delegate through that strategy and ensure replay safety.`,
      benefits: ['Bounded transient retries can ride through brief failover or network blips.', 'Classification and idempotency protect data from duplicate effects.'],
      costs: ['Retries increase latency and load; stacked retry layers multiply attempts.', 'Execution-strategy replay can repeat transaction work and requires idempotent boundaries.'],
      use: 'Use provider-aware bounded retry for classified transient failures within request deadlines.',
      avoid: 'Avoid retrying validation, foreign-key/unique conflicts, cancellation, or all exceptions indiscriminately.',
      questions: ['Why are retries dangerous during a database outage?', 'What makes a command safe to retry?', 'How should explicit transactions interact with an EF execution strategy?'],
      scenario: 'Database failover creates timeouts and retry storms. Cap retries and total deadline, remove duplicate retry layers, apply circuit/load shedding, verify writes are idempotent, and monitor recovery and duplicate request outcomes.',
      diagram: [
        { label: 'Failure classification', detail: 'Separate transient availability faults from constraint, validation, timeout, and cancellation outcomes.' },
        { label: 'Safety check', detail: 'Determine whether command/transaction is idempotent and side effects can be replayed.' },
        { label: 'Bounded strategy', detail: 'Retry classified faults with capped attempts, jitter, and remaining deadline.' },
        { label: 'Circuit / recovery', detail: 'Avoid amplification; record result and allow dependency health recovery.' },
      ],
      steps: ['Classify provider exception and operation outcome.', 'Check request cancellation, deadline, and idempotency.', 'Use one bounded retry layer with provider-aware transient classification.', 'Keep external effects outside replay or use outbox/idempotency and monitor attempts.'],
      takeaways: ['Not all database failures are transient.', 'Retries need limits, deadlines, and replay-safe operations.', 'Unique/FK conflicts are business/schema outcomes, not generic retry signals.', 'Stacked retries can multiply load during an outage.'],
      mistakes: ['Retrying all exceptions, including cancellation and constraint violations.', 'Retrying a transaction that has already sent an email or charged a card.', 'Combining several independent retry layers without an attempt budget.'],
      practices: ['Use provider execution strategy and a bounded total deadline.', 'Use idempotency keys for externally retried commands.', 'Test failover and uncertain commit outcomes.', 'Monitor retry counts, pool waits, and dependency health.'],
      sources: [{ label: 'Microsoft Learn: Connection resiliency', url: 'https://learn.microsoft.com/en-us/ef/core/miscellaneous/connection-resiliency' }],
    }),
    efLesson({
      id: 'efcore-scalable-api-design', title: 'Design Scalable Data-Backed APIs',
      what: 'A scalable API bounds work per request, isolates failures, manages concurrency and resources, and supports horizontal growth without relying on process-local state.',
      why: 'Unbounded queries, payloads, synchronous I/O, shared mutable state, and retry amplification make traffic growth translate directly into database saturation and tail latency.',
      how: 'Use DTO projections, bounded pagination, async I/O and cancellation, short DbContext/transaction scopes, connection-pool awareness, rate limits, caching where consistency permits, and background queues/outbox for long-running work. Design idempotent writes and observe SLOs.',
      flow: ['Define request budget and contract', 'Bound rows, payload, and concurrency', 'Use async and short-lived data work', 'Scale dependencies and isolate failures', 'Observe SLOs and adjust capacity'],
      example: 'A catalog endpoint caps page size, uses keyset pagination, projects DTOs, and returns a continuation token instead of loading the whole table.',
      code: `var page = await db.Products
    .AsNoTracking()
    .Where(p => p.IsActive &&
        (p.Name.CompareTo(afterName) > 0 ||
         (p.Name == afterName && p.Id > afterId)))
    .OrderBy(p => p.Name).ThenBy(p => p.Id)
    .Take(Math.Clamp(request.PageSize, 1, 100))
    .Select(p => new ProductDto(p.Id, p.Name, p.Price))
    .ToListAsync(ct);`,
      benefits: ['Bounded requests protect database and service capacity.', 'Stateless APIs, idempotency, and observable budgets support horizontal scaling.'],
      costs: ['Pagination, caching, and asynchronous workflows add contract and consistency complexity.', 'Capacity limits and rate limits can reject work that previously queued implicitly.'],
      use: 'Use bounded resource consumption and explicit consistency contracts for public or high-volume APIs.',
      avoid: 'Avoid unbounded collection endpoints, per-request unbounded fan-out, and relying on in-memory state for cross-instance coordination.',
      questions: ['Why cap page size?', 'When is keyset pagination better than deep OFFSET?', 'How do idempotency and outbox support scale?'],
      scenario: 'A product endpoint causes database CPU spikes as traffic grows. Cap page size, use keyset pagination and a covering access path if measured, apply request budgets and rate limiting, and monitor latency/DB saturation while scaling out.',
      diagram: [
        { label: 'Bounded contract', detail: 'Cap page size, payload, request deadline, and fan-out.' },
        { label: 'Efficient data access', detail: 'Project DTOs, paginate deterministically, and keep DbContext/transactions short.' },
        { label: 'Resilience', detail: 'Use rate limits, bounded retries, idempotency, and queues for deferred work.' },
        { label: 'Horizontal capacity', detail: 'Keep API instances stateless and understand shared database/pool bottlenecks.' },
        { label: 'SLO feedback', detail: 'Use latency, error, traffic, and saturation telemetry to scale or tune safely.' },
      ],
      steps: ['Set request, pagination, payload, and dependency budgets.', 'Design query projection and stable keyset or bounded offset paging.', 'Use async cancellation, short transaction scope, and idempotent writes.', 'Load-test end-to-end while monitoring database, connection pools, and tail latency.'],
      takeaways: ['Scale requires bounded work and explicit resource budgets.', 'Database capacity and connection pools remain shared constraints when API replicas grow.', 'Idempotency and outbox patterns support reliable retries and asynchronous work.', 'SLOs and load tests guide capacity decisions.'],
      mistakes: ['Returning all matching rows or allowing unbounded page sizes.', 'Assuming adding API replicas automatically increases database capacity.', 'Using distributed retries without idempotency or a total deadline.'],
      practices: ['Use capped pagination, DTO projection, cancellation, and async I/O.', 'Keep application instances stateless and DbContext scoped.', 'Apply rate limits, backpressure, and idempotency to protect dependencies.', 'Load-test realistic traffic mixes and monitor saturation and tail percentiles.'],
      sources: [{ label: 'Microsoft Learn: EF Core performance', url: 'https://learn.microsoft.com/en-us/ef/core/performance/' }],
    }),
  ],
};
