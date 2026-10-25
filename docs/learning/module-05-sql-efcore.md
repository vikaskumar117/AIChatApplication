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

## Workbook SQL practice

Use a disposable SQL database when key105 lands. Practice `NULL` edge cases,
`INNER` vs `LEFT JOIN`, `WHERE` vs `HAVING`, `EXISTS`/`NOT EXISTS`, CTEs,
window ranking, parameterized filters, and stable paging. Compare a query plan
and logical reads before claiming an index improved performance.
