# Module 05 — SQL and EF Core

**Workbook alignment:** Days 7–10 (EF Core, SQL basics, joins, grouping, and
performance); SQL roadmap (subqueries, `EXISTS`, CTEs, window functions,
transactions, indexes, pagination, and tuning). Related tracker topics:
T041–T050.

> **Status:** No SQL database or EF Core code is implemented yet. The examples
> below are proposed for key105 conversation persistence and must be validated
> against the selected SQL provider before being treated as project code.

## T041 — Relational modeling, keys, and normalization

- **What:** A relational database stores related facts in tables connected by
  keys; normalization reduces duplicated facts.
- **Why:** Conversation ownership and message ordering need durable, queryable
  relationships.
- **When:** Model entities and access patterns before writing migrations.
- **Limits:** Over-normalization may make common reads more complex; denormalize
  only for a measured reason.
- **Diagram:** `AppUser 1 -> many Conversation 1 -> many Message`
- **Project example (planned — key105):** `Conversation(UserId, ...)` and
  `Message(ConversationId, Sequence, ...)` with foreign keys and ownership
  checks. See [key105](../../PROJECT_ROADMAP.md).
- **Reference:** [Database normalization](https://learn.microsoft.com/office/troubleshoot/access/database-normalization-description)

### Worked example and self-check

Store each conversation once and each message once. A message's foreign key
points to its conversation; the conversation's owner determines access. This
avoids repeating owner and title data on every message while still making
ownership enforceable.

```text
Conversations(Id, UserId, Title, CreatedAt)
       1
       |
       many
Messages(Id, ConversationId, Sequence, Content, CreatedAt)
```

**Try it:** What prevents a message from referring to a nonexistent
conversation? **Answer:** a foreign-key constraint. The API must separately
check that the current caller owns the parent conversation.

## T042 — `SELECT`, `WHERE`, sorting, `TOP`, `NULL`, `LIKE`, and dates

- **What:** SQL selects columns/rows, filters and sorts them; `TOP` limits
  output; `DISTINCT` removes duplicate rows; `IN`/`BETWEEN` match sets/ranges;
  `NULL` represents unknown or missing data, not zero or an empty string.
- **Why:** History queries should return only the caller's requested records.
- **When:** Filter at the database, use explicit date ranges and stable
  sorting, and select only the columns the feature needs.
- **Limits:** `column = NULL` is not a valid null check; use `IS NULL`.
  Wildcard search and implicit conversions can be expensive.
- **Diagram:** `table -> WHERE -> ORDER BY -> selected columns`
- **Project example (proposed):**
  ```sql
  SELECT TOP (10) Id, CreatedAt
  FROM Conversations
  WHERE UserId = @userId
    AND CreatedAt >= @fromUtc
  ORDER BY CreatedAt DESC, Id DESC;
  ```
- **Reference:** [SELECT (Transact-SQL)](https://learn.microsoft.com/sql/t-sql/queries/select-transact-sql)

### Worked example and self-check

This query returns only a user's latest ten conversations. `@userId` and
`@fromUtc` are parameters, not string-concatenated SQL. The unique `Id`
tie-breaker makes ordering stable when timestamps match.

```sql
SELECT TOP (10) Id, Title, CreatedAt
FROM Conversations
WHERE UserId = @userId
  AND CreatedAt >= @fromUtc
ORDER BY CreatedAt DESC, Id DESC;
```

`NULL` means unknown, so test it with `IS NULL`; ordinary equality comparisons
with `NULL` do not behave like comparisons to a known value.
**Try it:** How do you find rows without a title? **Answer:** `WHERE Title IS NULL`.

## T043 — `INNER JOIN` and `LEFT JOIN`

- **What:** An inner join returns matching rows; a left join preserves every
  left-side row and fills missing right-side columns with `NULL`.
- **Why:** Reports can include conversations with messages or users with no
  conversations.
- **When:** Choose the join based on whether unmatched left rows must remain.
- **Limits:** Missing join predicates multiply rows; joins can duplicate
  results when the relationship is one-to-many.
- **Diagram:** `Conversation LEFT JOIN Message -> include empty conversations`
- **Project example (planned — key105):** retrieve a user's conversations and
  only their messages, with ownership constraints in the query.
- **Reference:** [Joins (Transact-SQL)](https://learn.microsoft.com/sql/relational-databases/performance/joins)

### Worked example and self-check

An inner join removes conversations with no matching message. A left join
keeps them and fills message columns with `NULL`. Put filters carefully:
filtering a right-side column in `WHERE` can remove the null-extended rows and
make a left join behave like an inner join.

```sql
SELECT c.Id, m.Id AS MessageId
FROM Conversations AS c
LEFT JOIN Messages AS m ON m.ConversationId = c.Id
WHERE c.UserId = @userId;
```

**Try it:** Which join lists empty conversations too? **Answer:** `LEFT JOIN`
with conversations on the left.

## T044 — Aggregates, `GROUP BY`, `HAVING`, `EXISTS`, CTEs, and windows

- **What:** Aggregates summarize groups; subqueries and CTEs compose queries;
  `EXISTS` checks whether a match exists; window functions calculate across
  related rows without collapsing them.
- **Why:** These tools answer usage and history questions such as message
  counts, latest message, or ranking.
- **When:** Use `WHERE` before grouping and `HAVING` for aggregate groups;
  use `EXISTS`/`NOT EXISTS` for matching/unmatched rows and `ROW_NUMBER()` for
  per-conversation ranking.
- **Limits:** A CTE is a query expression, not necessarily a materialized
  temporary table. Window functions may need careful indexing.
- **Diagram:** `rows -> filter -> group/window calculation -> result`
- **Project example (proposed):**
  ```sql
  WITH RankedMessages AS (
      SELECT ConversationId, Content, CreatedAt,
             ROW_NUMBER() OVER (
                 PARTITION BY ConversationId ORDER BY CreatedAt DESC, Id DESC
             ) AS RowNumber
      FROM Messages
  )
  SELECT ConversationId, Content, CreatedAt
  FROM RankedMessages
  WHERE RowNumber = 1;
  ```
- **Reference:** [OVER clause](https://learn.microsoft.com/sql/t-sql/queries/select-over-clause-transact-sql) · [CTE](https://learn.microsoft.com/sql/t-sql/queries/with-common-table-expression-transact-sql)

### Worked example and self-check

Use `EXISTS` when the question is whether at least one related row exists;
the database need not return every match. Use `HAVING` to filter groups after
aggregation, and a window function when each row should remain visible beside
its group-level calculation.

```sql
SELECT c.Id
FROM Conversations AS c
WHERE c.UserId = @userId
  AND EXISTS (
      SELECT 1 FROM Messages AS m WHERE m.ConversationId = c.Id
  );
```

**Try it:** Does a CTE automatically store results in a temporary table?
**Answer:** no; it names a query expression and the optimizer chooses a plan.

## T045 — EF Core `DbContext`, entities, and configuration

- **What:** EF Core maps .NET entity objects and LINQ queries to relational
  database operations; `DbContext` tracks a unit of work.
- **Why:** It provides a typed way to persist conversations and messages.
- **When:** Use explicit entity configuration for keys, lengths, indexes, and
  relationships.
- **Limits:** EF Core does not remove the need to understand SQL; a context is
  not thread-safe and should not be shared concurrently.
- **Diagram:** `application -> DbContext -> EF provider -> SQL`
- **Project example (planned — key105):** add a scoped context and persistence
  adapter only when conversation history is implemented.
- **Reference:** [DbContext lifetime](https://learn.microsoft.com/ef/core/dbcontext-configuration/)

### Worked example and self-check

An EF Core context represents a short unit of work. A typical request obtains
the scoped context through DI, runs a query or tracks edits, and calls
`SaveChangesAsync`. Do not share one context across concurrent operations.

```csharp
var conversation = await db.Conversations
    .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
```

This is a proposed shape for key105, not existing project code.
**Try it:** Why is a `DbContext` unsuitable as a singleton? **Answer:** it is
not thread-safe and its change tracker belongs to one unit of work.

## T046 — EF Core migrations and schema deployment

- **What:** A migration records a database schema change as versioned code.
- **Why:** Fresh and existing environments need reproducible schema evolution.
- **When:** Review generated migrations and test applying them to an empty and
  upgraded database.
- **Limits:** A migration is not automatically safe for large production data;
  destructive changes may require expand/contract deployment.
- **Diagram:** `current schema + migration N -> next schema`
- **Project example (planned — key105):** migrations create user/authorization
  and conversation tables; schema deployment procedure is documented before
  production.
- **Reference:** [EF Core migrations](https://learn.microsoft.com/ef/core/managing-schemas/migrations/)

### Worked example and self-check

A migration is a reviewable description of schema changes, not merely a
command to run against production. Inspect generated SQL, test both a clean
database and an upgrade from the previous schema, then decide how deployment
will apply it. For a breaking column change, an expand/contract rollout can
keep old and new application versions working during deployment.

```text
old schema -> add compatible column -> deploy app -> backfill -> remove old column
```

**Try it:** Why test an upgrade path as well as a fresh database? **Answer:**
production data already exists and may expose migration assumptions.

## T047 — Tracking, no-tracking, and change detection

- **What:** Tracking lets EF detect changes to loaded entities; no-tracking
  queries return read-only results without that bookkeeping.
- **Why:** Read-only API history does not need change tracking.
- **When:** Use no-tracking for read-only queries and tracking when updating
  entities through a unit of work.
- **Limits:** No-tracking results are not automatically updated by later
  context changes; do not disable tracking when the workflow needs it.
- **Diagram:** `read query -> no tracking` · `edit entity -> tracked -> SaveChanges`
- **Project example (planned — key105):** use no-tracking for conversation-list
  DTO projections; inspect generated SQL.
- **Reference:** [Tracking vs. no-tracking](https://learn.microsoft.com/ef/core/querying/tracking)

### Worked example and self-check

For a read-only history page, project only the needed fields into a DTO and
avoid tracking entity changes. For an update, load the entity with tracking,
change the intended property, and save. A projection is often clearer and
lighter than loading an entire aggregate.

```csharp
var items = await db.Conversations
    .AsNoTracking()
    .Where(x => x.UserId == userId)
    .Select(x => new ConversationListItem(x.Id, x.Title, x.CreatedAt))
    .ToListAsync(cancellationToken);
```

**Try it:** Should a no-tracking query be used before editing the loaded
entity? **Answer:** usually not if the same context is expected to detect and
save those edits.

## T048 — Transactions, isolation, and optimistic concurrency

- **What:** ACID describes atomicity, consistency, isolation, and durability.
  A transaction groups writes; isolation controls concurrent visibility;
  concurrency tokens detect conflicting updates.
- **Why:** A conversation/message update may need a consistent outcome if
  multiple requests write at once.
- **When:** Use the smallest transaction that protects one business operation;
  use optimistic concurrency for conflicting edits.
- **Limits:** Long transactions hold locks and reduce throughput; isolation
  behavior differs by database.
- **Diagram:** `begin -> write message + update conversation -> commit | rollback`
- **Project example (planned — key105):** define simultaneous message append
  behavior and a concurrency field before persistence ships.
- **Reference:** [EF Core transactions](https://learn.microsoft.com/ef/core/saving/transactions)

### Worked example and self-check

Atomicity means either all writes in the unit succeed or none do. Keep the
transaction around the database writes that must succeed together; do not hold
it open while waiting on an AI provider. A provider call can take seconds and
would unnecessarily hold database locks.

```text
call provider (outside DB transaction)
begin transaction -> save message + update conversation -> commit
                                      error -> rollback
```

**Try it:** Why avoid a transaction around a slow model request? **Answer:**
it holds resources while waiting on an external system and increases
contention.

## T049 — Indexes, execution plans, sargability, and parameterization

- **What:** An index helps the database locate rows; an execution plan shows
  how a query is executed; sargable predicates allow efficient index use.
- **Why:** User-history lookups and message ordering need scalable queries.
- **When:** Index real filter/sort patterns, parameterize values, and compare
  plans and logical reads.
- **Limits:** Indexes consume storage and slow writes. A scan is not always
  wrong; avoid wrapping indexed columns in functions without evidence.
- **Diagram:** `predicate on indexed column -> seek candidate` · `function(column) -> may scan`
- **Project example (planned — key105):** likely indexes on conversation owner
  and message `(ConversationId, CreatedAt)`; confirm against actual queries.
- **Reference:** [SQL Server index design guide](https://learn.microsoft.com/sql/relational-databases/sql-server-index-design-guide)

### Worked example and self-check

If the query filters by `ConversationId` and orders by `CreatedAt`, an index
beginning with those keys may help, but the correct order depends on real
predicates and selectivity. Parameterization protects values from being
interpreted as SQL and lets the database reuse query plans.

```sql
CREATE INDEX IX_Messages_Conversation_CreatedAt
ON Messages (ConversationId, CreatedAt, Id);
```

This is a candidate, not a justified production index until the query plan and
workload support it. **Try it:** Is every table scan a bug? **Answer:** no;
scanning a small table can be cheaper than using an index.

## T050 — Pagination, N+1 queries, and query performance

- **What:** Pagination limits result size; N+1 is repeated per-row database
  querying; query tuning reduces unnecessary work.
- **Why:** Conversation history must remain bounded as data grows.
- **When:** Use stable ordering and bounded pages; project only needed columns;
  inspect generated SQL for repeated queries.
- **Limits:** Offset pagination can become expensive at large offsets; cursor
  pagination needs a stable unique ordering key.
- **Diagram:** `owner filter -> stable sort -> page -> project DTO`
- **Project example (planned — key105):** history endpoints have bounded
  pagination and owner filters before database materialization.
- **Reference:** [EF Core efficient querying](https://learn.microsoft.com/ef/core/performance/efficient-querying)

### Worked example and self-check

Page using a stable order with a unique tie-breaker. Offset pages are easy to
understand but can become slower for deep pages and may shift as rows are
inserted. Keyset pagination uses the last seen sort key and is often a better
fit for "load more" history.

```sql
SELECT TOP (@pageSize) Id, CreatedAt, Content
FROM Messages
WHERE ConversationId = @conversationId
  AND (CreatedAt < @lastCreatedAt
       OR (CreatedAt = @lastCreatedAt AND Id < @lastId))
ORDER BY CreatedAt DESC, Id DESC;
```

**Try it:** What causes an N+1 query pattern? **Answer:** loading a list once,
then issuing another query for each row instead of joining, projecting, or
batch-loading appropriately.

## Workbook SQL practice

Use a disposable SQL database when key105 lands. Practice `NULL` edge cases,
`INNER` vs `LEFT JOIN`, `WHERE` vs `HAVING`, `EXISTS`/`NOT EXISTS`, CTEs,
window ranking, parameterized filters, and stable paging. Compare a query plan
and logical reads before claiming an index improved performance.
