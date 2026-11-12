import { LearningModuleSummary } from '../../../learning.models';

export const sqlServerModule: LearningModuleSummary = {
  "id": "sql-server",
  "title": "SQL Server",
  "description": "Write analytical queries and reason about indexes, transactions, concurrency, and production performance.",
  "topics": [
    {
      "id": "sql-query-processing-order",
      "title": "SQL Query Processing Order",
      "priority": "Very High",
      "summary": "A SELECT statement has a logical binding order: FROM, ON, JOIN, WHERE, GROUP BY, GROUPING SETS/CUBE/ROLLUP, HAVING, SELECT, DISTINCT, ORDER BY, then TOP/OFFSET-FETCH. FROM establishes input rowsets; ON evaluates the join predicate; JOIN combines matches (and preserves unmatched rows for outer joins); WHERE filters individual rows; GROUP BY forms groups; HAVING filters groups; SELECT computes output expressions and aliases; DISTINCT removes duplicate projected rows; ORDER BY orders output; TOP limits it."
    },
    {
      "id": "sql-top-three-per-department",
      "title": "Department-Wise Top Three Salaries",
      "priority": "Very High",
      "summary": "Top-N-per-group returns a limited or ranked set of employees independently within each department. A window function computes a rank without collapsing employee rows."
    },
    {
      "id": "sql-second-highest-salary",
      "title": "Find the Second-Highest Salary",
      "priority": "Very High",
      "summary": "Second-highest can mean the second distinct salary value, or the employee row in second place. Those meanings differ when salaries tie."
    },
    {
      "id": "sql-find-duplicates",
      "title": "Find Duplicate Rows by Business Key",
      "priority": "Very High",
      "summary": "A duplicate is a repeated business key, not necessarily a byte-for-byte identical database row. The key might be a normalized email, external reference, or composite of several columns."
    },
    {
      "id": "sql-delete-duplicates-keep-one",
      "title": "Delete Duplicates While Keeping One",
      "priority": "Very High",
      "summary": "A deterministic keeper rule selects exactly one surviving row per duplicate business key; other rows become deletion candidates."
    },
    {
      "id": "sql-employees-above-department-average",
      "title": "Employees Above Their Department Average",
      "priority": "Very High",
      "summary": "A per-department comparison evaluates each employee salary against an aggregate calculated for that employee’s department."
    },
    {
      "id": "sql-highest-salary-per-department",
      "title": "Highest Salary Per Department",
      "priority": "Very High",
      "summary": "The maximum salary per department can be returned as a value, or with the employee row or rows that achieve it."
    },
    {
      "id": "sql-row-number-rank-dense-rank",
      "title": "ROW_NUMBER vs RANK vs DENSE_RANK",
      "priority": "Very High",
      "summary": "These window ranking functions assign positions within an ordered partition. ROW_NUMBER assigns a unique sequence; RANK gives ties the same rank and leaves gaps; DENSE_RANK gives ties the same rank without gaps."
    },
    {
      "id": "sql-cte-temp-table-table-variable",
      "title": "CTE vs Temporary Table vs Table Variable",
      "priority": "Very High",
      "summary": "A CTE names a query expression for one following statement; #temp tables are session-scoped tempdb tables; table variables are variables backed by tempdb with table-like structure and narrower scope."
    },
    {
      "id": "sql-clustered-nonclustered-indexes",
      "title": "Clustered and Nonclustered Indexes",
      "priority": "Very High",
      "summary": "A clustered index is the table’s rowstore B-tree whose leaf level contains the data rows; a table has at most one. A nonclustered index is a separate B-tree with key columns and a row locator (clustered key or RID), and a table may have many."
    },
    {
      "id": "sql-how-indexes-speed-queries",
      "title": "How Indexes Speed Queries",
      "priority": "Very High",
      "summary": "A B-tree index narrows the rows that must be visited for selective predicates and can provide ordered rows or cover all columns needed by a query."
    },
    {
      "id": "sql-deadlocks",
      "title": "Deadlocks and Safe Recovery",
      "priority": "Very High",
      "summary": "A deadlock is a cycle of transactions, each holding a resource needed by another. SQL Server detects the cycle and chooses a victim; error 1205 means that victim transaction was rolled back."
    },
    {
      "id": "sql-isolation-levels",
      "title": "Transaction Isolation Levels",
      "priority": "Very High",
      "summary": "Isolation defines what changes a transaction can observe and which concurrent anomalies are prevented. SQL Server offers READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE, and SNAPSHOT; READ COMMITTED SNAPSHOT (RCSI) is a database option that provides statement-level versioned reads."
    },
    {
      "id": "sql-acid-transactions",
      "title": "ACID Transaction Guarantees",
      "priority": "Very High",
      "summary": "ACID describes Atomicity (all-or-nothing), Consistency (valid states/invariants), Isolation (concurrent work behaves according to isolation rules), and Durability (committed work survives failures according to configured guarantees)."
    },
    {
      "id": "sql-slow-query-optimization",
      "title": "Slow Query Optimization Method",
      "priority": "Very High",
      "summary": "Query optimization is a measured process of identifying the dominant cost (I/O, CPU, waits, blocking, network, or client processing) and changing the query, index, statistics, or workload safely."
    },
    {
      "id": "sql-execution-plans",
      "title": "Read SQL Server Execution Plans",
      "priority": "Very High",
      "summary": "An execution plan is the optimizer’s chosen physical strategy: operators and data flow used to execute a query. An estimated plan contains estimates; an actual plan adds runtime observations such as actual rows and executions."
    },
    {
      "id": "sql-common-errors-2601-2627-547-1205",
      "title": "Diagnose SQL Server Errors by Cause",
      "priority": "Very High",
      "summary": "SQL Server error numbers identify a failure category, but the constraint, statement, transaction state, and surrounding context explain the root cause. 2601 and 2627 indicate unique-key violations; 547 indicates a CHECK or FOREIGN KEY constraint conflict; 1205 means the transaction was selected as a deadlock victim."
    },
    {
      "id": "sql-stored-procedure-vs-function",
      "title": "Stored Procedure vs Function",
      "priority": "Very High",
      "summary": "A stored procedure is an executable database routine that can accept parameters, return result sets/output parameters, and perform data modifications. A function returns a scalar or table value and is designed to participate in expressions or FROM clauses, subject to SQL Server function restrictions."
    },
    {
      "id": "sql-concurrent-updates-same-row",
      "title": "Concurrent Updates to the Same Row",
      "priority": "Very High",
      "summary": "Concurrent writes to one row contend for locks or encounter optimistic concurrency conflicts. A later write may wait, overwrite earlier values, or fail based on transaction and application design."
    },
    {
      "id": "sql-injection-prevention",
      "title": "Prevent SQL Injection",
      "priority": "Very High",
      "summary": "SQL injection occurs when untrusted input is concatenated into SQL syntax, allowing input to alter the intended command or predicate."
    },
    {
      "id": "sql-inner-vs-left-join",
      "title": "INNER JOIN vs LEFT JOIN",
      "priority": "Very High",
      "summary": "INNER JOIN returns rows with matching join keys on both sides. LEFT JOIN preserves every left-side row and returns NULLs for right-side columns when no match exists."
    }
  ]
};
