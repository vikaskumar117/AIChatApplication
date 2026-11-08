import { LearningModule, topic } from '../learning.models';

type SqlLesson = {
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

function sqlLesson(lesson: SqlLesson) {
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
      diagramNote: 'The diagram is a reasoning aid for this topic; confirm behavior against the actual schema, constraints, isolation settings, and execution plan in your environment.',
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

const employeeTables = [
  { title: 'dbo.Employee (sample)', headers: ['EmployeeId', 'Name', 'DepartmentId', 'Salary'], rows: [['1', 'Ari', '10', '120000'], ['2', 'Bo', '10', '110000'], ['3', 'Cy', '10', '110000'], ['4', 'Dee', '20', '95000'], ['5', 'Eli', '20', '90000']] },
  { title: 'dbo.Department', headers: ['DepartmentId', 'Name'], rows: [['10', 'Engineering'], ['20', 'Finance']] },
];

export const dataModule: LearningModule = {
  id: 'sql-server',
  title: 'SQL Server',
  description: 'Write analytical queries and reason about indexes, transactions, concurrency, and production performance.',
  topics: [
    sqlLesson({
      id: 'sql-query-processing-order', title: 'SQL Query Processing Order',
      what: 'A SELECT statement has a logical binding order: FROM, ON, JOIN, WHERE, GROUP BY, GROUPING SETS/CUBE/ROLLUP, HAVING, SELECT, DISTINCT, ORDER BY, then TOP/OFFSET-FETCH. FROM establishes input rowsets; ON evaluates the join predicate; JOIN combines matches (and preserves unmatched rows for outer joins); WHERE filters individual rows; GROUP BY forms groups; HAVING filters groups; SELECT computes output expressions and aliases; DISTINCT removes duplicate projected rows; ORDER BY orders output; TOP limits it.',
      why: 'Logical binding explains why a SELECT alias is generally unavailable in WHERE but available in ORDER BY, why WHERE and HAVING are not interchangeable, and where join multiplication occurs. It describes meaning and scope, not a mandatory physical sequence of CPU operations.',
      how: 'The optimizer transforms the relational expression and selects physical operators such as seeks, scans, nested loops, hash joins, aggregates, and sorts. It may push a safe predicate earlier or reorder inner joins while preserving semantics. Outer-join null preservation, nondeterministic expressions, and other semantic boundaries constrain transformations. Inspect the actual execution plan for implementation, not as a restatement of logical clause order.',
      flow: ['FROM / ON / JOIN form rowset', 'WHERE filters rows', 'GROUP BY forms groups; HAVING filters groups', 'SELECT projects; DISTINCT removes duplicates', 'ORDER BY sorts; TOP or OFFSET-FETCH limits'],
      example: 'Count active employees per department, retain departments with more than ten, then return the highest counts. The sample input is deliberately small; the result table represents a larger data set.',
      code: `SELECT d.Name AS DepartmentName, COUNT(e.EmployeeId) AS ActiveEmployees
FROM dbo.Employee AS e
INNER JOIN dbo.Department AS d ON d.DepartmentId = e.DepartmentId
WHERE e.IsActive = 1
GROUP BY d.Name
HAVING COUNT(e.EmployeeId) > 10
ORDER BY ActiveEmployees DESC, DepartmentName
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;`,
      benefits: ['Predictable name and aggregate scope makes queries easier to reason about.', 'Separating logical meaning from physical operators helps diagnose correctness and performance independently.'],
      costs: ['Logical ordering does not guarantee a particular operator, access path, or fast runtime.', 'A legal query can still multiply rows or sort a large input expensively.'],
      use: 'Use logical binding order to debug aliases, joins, filters, grouping, and paging; use the actual plan and runtime statistics to diagnose cost.',
      avoid: 'Do not assume the engine physically executes each clause in this exact order, or use HAVING for ordinary row predicates. Do not page without a deterministic order.',
      questions: ['Why is a SELECT alias usually unavailable to WHERE but available to ORDER BY?', 'How do WHERE and HAVING differ?', 'Does logical binding order prescribe physical operator order?', 'How can an outer join change the effect of a predicate in WHERE?'],
      scenario: 'A department report counts too many employees. Verify join cardinality and duplicate keys, place row-level active filtering in WHERE, group at the intended grain, and apply thresholds in HAVING. Compare actual and estimated row counts and inspect the plan; do not infer execution order from the written query.',
      diagram: [
        { label: 'FROM / ON', detail: 'Name source rowsets and evaluate candidate join predicates.', code: 'Employee e JOIN Department d ON ...' },
        { label: 'JOIN', detail: 'Produce matching rows; outer joins also preserve specified unmatched rows.' },
        { label: 'WHERE', detail: 'Filter rows before aggregate groups exist.', code: 'e.IsActive = 1' },
        { label: 'GROUP BY / HAVING', detail: 'Form groups, compute aggregates, then filter groups.', code: 'HAVING COUNT(*) > 10' },
        { label: 'SELECT / DISTINCT', detail: 'Compute output expressions and aliases; optionally remove duplicate projected rows.' },
        { label: 'ORDER BY / TOP', detail: 'Sort output and limit rows. The optimizer chooses a possibly very different physical plan.' },
      ],
      steps: ['Join employee to department on the key, establishing row grain.', 'WHERE removes inactive employee rows before grouping.', 'GROUP BY forms one group per department; HAVING removes small groups.', 'SELECT computes count and alias; ORDER BY can bind that alias; OFFSET-FETCH selects a page.'],
      takeaways: ['WHERE filters rows; HAVING filters aggregate groups.', 'SELECT aliases are bound after WHERE; ORDER BY can generally use output aliases.', 'Joins can multiply rows before grouping; check key cardinality and result grain.', 'The optimizer may reorder or transform work; inspect the actual physical plan separately.'],
      mistakes: ['Treating the logical order as a required physical execution sequence.', 'Using HAVING instead of WHERE for a non-aggregate predicate.', 'Filtering a nullable side of a LEFT JOIN in WHERE when unmatched rows must survive.', 'Using TOP or pagination without a stable ORDER BY and unique tie-breaker.'],
      practices: ['State the intended grain and join keys before aggregating.', 'Use WHERE for row predicates and HAVING for aggregate predicates.', 'Use aliases in ORDER BY, not as if SELECT had already run in WHERE.', 'Compare actual versus estimated rows and inspect the actual plan for performance.'],
      tables: [
        { title: 'Employee input (illustrative subset)', headers: ['EmployeeId', 'DepartmentId', 'IsActive'], rows: [['1', '10', '1'], ['2', '10', '1'], ['3', '20', '1'], ['4', '30', '0']] },
        { title: 'Department input', headers: ['DepartmentId', 'Name'], rows: [['10', 'Engineering'], ['20', 'Finance'], ['30', 'Operations']] },
        { title: 'Result (larger illustrative data set, threshold > 10)', headers: ['DepartmentName', 'ActiveEmployees'], rows: [['Engineering', '25'], ['Finance', '18'], ['Sales', '12']] },
      ],
      executionPlan: [
        { operator: 'Illustrative: Index Seek / Scan', purpose: 'Read Employee and Department according to available indexes and estimated selectivity.' },
        { operator: 'Illustrative: Filter', purpose: 'Apply the active-row predicate; the optimizer may push it toward the access operator.' },
        { operator: 'Illustrative: Nested Loops / Hash Match', purpose: 'Join on DepartmentId; chosen based on estimates, indexes, and row counts.' },
        { operator: 'Illustrative: Hash or Stream Aggregate', purpose: 'Group joined active rows by department and compute count.' },
        { operator: 'Illustrative: Filter', purpose: 'Apply HAVING count > 10 after aggregate semantics.' },
        { operator: 'Illustrative: Sort + Top', purpose: 'Order by count and apply the requested page. This is not a guaranteed plan.' },
      ],
      sources: [{ label: 'Microsoft Learn: SELECT (Transact-SQL)', url: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql' }],
    }),
    sqlLesson({
      id: 'sql-top-three-per-department', title: 'Department-Wise Top Three Salaries',
      what: 'Top-N-per-group returns a limited or ranked set of employees independently within each department. A window function computes a rank without collapsing employee rows.',
      why: 'A single global TOP (3) returns only three employees overall. Partitioning provides a scalable expression of the per-department requirement and allows the result to retain employee details.',
      how: 'Use ROW_NUMBER when exactly three rows per department are required and ties need a deterministic tie-breaker. Use RANK or DENSE_RANK when salary ties should share a position; rank <= 3 can return more than three employees. Define the policy explicitly.',
      flow: ['Choose salary tie policy', 'Partition employees by department', 'Order salary descending within each partition', 'Filter the computed rank'],
      example: 'Return every employee whose salary is in the top three distinct salary levels in their department; ties at the cutoff are included.',
      code: `WITH ranked AS (
  SELECT e.EmployeeId, e.Name, e.DepartmentId, e.Salary,
         DENSE_RANK() OVER (
           PARTITION BY e.DepartmentId ORDER BY e.Salary DESC
         ) AS salary_rank
  FROM dbo.Employee AS e
)
SELECT EmployeeId, Name, DepartmentId, Salary, salary_rank
FROM ranked
WHERE salary_rank <= 3
ORDER BY DepartmentId, Salary DESC, EmployeeId;`,
      benefits: ['Window functions preserve row details while ranking each group.', 'The rank predicate makes inclusion of salary ties explicit.'],
      costs: ['Ranking may require sorting many rows and memory; spills can hurt performance.', 'Tie-inclusive ranks may return more than three employees per department.'],
      use: 'Use this when the business definition is top three salary levels per department and all ties at those levels should appear.',
      avoid: 'Do not use DENSE_RANK if the contract requires exactly three employee rows; choose ROW_NUMBER with a stable unique ordering instead.',
      questions: ['Why is global TOP not a per-department solution?', 'How does the tie policy affect the number of returned rows?', 'What index key order could support this partition and order?'],
      scenario: 'Compensation reporting requires everyone sharing any of the top three salary levels in each department. Confirm that ties are included, rank within department, then inspect sort and memory grant behavior on production-like volumes.',
      diagram: [
        { label: 'Employee rows', detail: 'Retain the employee grain; do not aggregate away names or IDs.' },
        { label: 'Partition', detail: 'Start independent ranking sequences for each DepartmentId.', code: 'PARTITION BY DepartmentId' },
        { label: 'Order / rank', detail: 'Assign rank by salary descending; DENSE_RANK gives equal salary equal rank.' },
        { label: 'Filter rank', detail: 'Keep salary ranks 1 through 3, including all boundary ties.', code: 'salary_rank <= 3' },
      ],
      steps: ['Select the employee detail columns.', 'Partition by department and order by salary descending.', 'Choose DENSE_RANK so equal salaries share a rank without gaps.', 'Filter in an outer query because the window result is not available in the same query WHERE.'],
      takeaways: ['Partitioning restarts rank per department.', 'DENSE_RANK <= 3 means three distinct salary values, not three employee rows.', 'Window calculations are filtered in an outer query or CTE.', 'Use actual plan data to assess sorting and indexing.'],
      mistakes: ['Using TOP (3) globally and expecting it to reset per department.', 'Assuming ties cannot cause more than three output rows.', 'Filtering a window-function alias in the same SELECT-level WHERE.'],
      practices: ['Write down whether N means rows, rank positions, or distinct values.', 'Add a deterministic unique tie-breaker to ROW_NUMBER ordering.', 'Test departments with salary ties at both included and excluded boundaries.'],
      tables: employeeTables,
      sources: [{ label: 'Microsoft Learn: Ranking functions', url: 'https://learn.microsoft.com/en-us/sql/t-sql/functions/ranking-functions-transact-sql' }],
    }),
    sqlLesson({
      id: 'sql-second-highest-salary', title: 'Find the Second-Highest Salary',
      what: 'Second-highest can mean the second distinct salary value, or the employee row in second place. Those meanings differ when salaries tie.',
      why: 'Explicitly defining the result avoids returning an arbitrary employee or mistakenly treating two employees tied for the highest pay as first and second.',
      how: 'For the second distinct amount, use DENSE_RANK over salary DESC and filter rank 2. For exactly the second row, use ROW_NUMBER with a stable unique tie-breaker. MAX below MAX is an alternative for one distinct amount but handles NULL and empty input deliberately.',
      flow: ['Clarify distinct amount versus employee position', 'Rank salaries globally', 'Filter rank two', 'Define empty and tie behavior'],
      example: 'Return the second distinct salary value and all employees paid that amount.',
      code: `WITH ranked AS (
  SELECT EmployeeId, Name, Salary,
         DENSE_RANK() OVER (ORDER BY Salary DESC) AS salary_rank
  FROM dbo.Employee
  WHERE Salary IS NOT NULL
)
SELECT EmployeeId, Name, Salary
FROM ranked
WHERE salary_rank = 2;`,
      benefits: ['DENSE_RANK states distinct-value semantics and preserves all employees tied at the amount.', 'The query naturally returns no rows when fewer than two distinct non-NULL amounts exist.'],
      costs: ['Ranking may sort the candidate set.', 'Different business meanings require different ranking semantics.'],
      use: 'Use DENSE_RANK when asking for the second-highest distinct salary and the employees receiving it.',
      avoid: 'Avoid MAX(MAX(...)) when NULL, no rows, or tie behavior is unclear; avoid ROW_NUMBER without deterministic ordering.',
      questions: ['Why does DENSE_RANK differ from ROW_NUMBER with ties?', 'What should the query return when fewer than two distinct salaries exist?', 'How can a unique tie-breaker define the second employee row?'],
      scenario: 'An HR API is asked for “the second highest salary.” Clarify whether the API returns a salary amount or a person position, define tie behavior, and test zero, one, tied-highest, and tied-second cases.',
      diagram: [
        { label: 'Filter input', detail: 'Choose whether NULL salary rows participate; here they are excluded.' },
        { label: 'Order distinct values', detail: 'Rank salary values descending.', code: 'DENSE_RANK() OVER (ORDER BY Salary DESC)' },
        { label: 'Select rank 2', detail: 'Return all employees sharing the second distinct value.' },
      ],
      steps: ['Exclude NULL salaries according to the stated rule.', 'Assign a dense rank over all employees ordered by salary descending.', 'Filter rank 2 outside the ranking query.', 'Return all ties at the second distinct amount.'],
      takeaways: ['“Second-highest salary” is ambiguous until tie semantics are defined.', 'DENSE_RANK returns the second distinct value.', 'ROW_NUMBER returns a row position and needs deterministic ordering.', 'No rank 2 means no result, not an invented zero.'],
      mistakes: ['Using ROW_NUMBER and arbitrarily selecting among tied salaries.', 'Using RANK = 2 and overlooking rank gaps.', 'Ignoring NULL and empty-table behavior.'],
      practices: ['Document whether the output is a value or employee row.', 'Test tied maximum, tied second, NULL, and fewer-than-two-value cases.', 'Use DENSE_RANK for distinct ordinal values.'],
    }),
    sqlLesson({
      id: 'sql-find-duplicates', title: 'Find Duplicate Rows by Business Key',
      what: 'A duplicate is a repeated business key, not necessarily a byte-for-byte identical database row. The key might be a normalized email, external reference, or composite of several columns.',
      why: 'Reliable duplicate detection requires agreeing on equality rules, including case, whitespace, collation, NULL behavior, and which columns define one logical entity.',
      how: 'GROUP BY the business key and use HAVING COUNT(*) > 1 to find duplicate key groups. Join those keys back to the source to inspect all candidate rows before any cleanup.',
      flow: ['Define duplicate key and normalization', 'Group by key', 'Keep groups with count greater than one', 'Inspect source rows and choose policy'],
      example: 'Find duplicate normalized emails while retaining full row details for review.',
      code: `SELECT NormalizedEmail, COUNT_BIG(*) AS DuplicateCount
FROM dbo.Customer
WHERE NormalizedEmail IS NOT NULL
GROUP BY NormalizedEmail
HAVING COUNT_BIG(*) > 1
ORDER BY DuplicateCount DESC, NormalizedEmail;

-- Review all rows for the duplicate keys before taking any action.
SELECT c.*
FROM dbo.Customer AS c
JOIN (
  SELECT NormalizedEmail
  FROM dbo.Customer
  WHERE NormalizedEmail IS NOT NULL
  GROUP BY NormalizedEmail
  HAVING COUNT_BIG(*) > 1
) AS dup ON dup.NormalizedEmail = c.NormalizedEmail
ORDER BY c.NormalizedEmail, c.CreatedAt, c.CustomerId;`,
      benefits: ['Groups expose frequency and duplicate-key distribution.', 'The review query makes candidate records visible before remediation.'],
      costs: ['Grouping may scan and aggregate a large table.', 'Incorrect key normalization can merge distinct people or miss equivalent values.'],
      use: 'Use for profiling, data-quality monitoring, and reviewed duplicate remediation.',
      avoid: 'Do not define duplicates by a convenient single column if the business key is composite or NULLs have special meaning.',
      questions: ['Which columns determine logical uniqueness?', 'How should case and whitespace be normalized?', 'Why inspect full rows after grouping duplicate keys?'],
      scenario: 'A CRM import reports duplicate customer emails. Confirm canonicalization and NULL rules with product owners, count duplicate groups, review their histories and references, and plan a reversible merge policy.',
      diagram: [
        { label: 'Business identity', detail: 'Specify columns and canonicalization that define one logical record.' },
        { label: 'Group and count', detail: 'Aggregate rows at the defined key grain.', code: 'GROUP BY key HAVING COUNT(*) > 1' },
        { label: 'Inspect candidates', detail: 'Join duplicate keys back to records to review IDs, references, and timestamps.' },
      ],
      steps: ['Agree on the normalized business key and NULL treatment.', 'Use GROUP BY / HAVING to identify repeated key values.', 'Join the duplicate keys back to the base table and review every candidate.', 'Record a retention or merge rule before changing data.'],
      takeaways: ['Duplicate detection starts with domain identity, not SQL syntax.', 'GROUP BY with HAVING COUNT(*) > 1 finds repeated key groups.', 'Inspect candidate rows and foreign-key dependencies before cleanup.', 'Prevent recurrence with an appropriate unique constraint or index after remediation.'],
      mistakes: ['Deleting records based on a non-unique or incomplete key.', 'Ignoring case, whitespace, collation, or NULL semantics.', 'Assuming identical displayed values mean no dependent records need merging.'],
      practices: ['Normalize keys consistently at ingestion and comparison boundaries.', 'Capture candidate counts and sample rows for review.', 'Add a unique invariant after all existing conflicting data is resolved.'],
    }),
    sqlLesson({
      id: 'sql-delete-duplicates-keep-one', title: 'Delete Duplicates While Keeping One',
      what: 'A deterministic keeper rule selects exactly one surviving row per duplicate business key; other rows become deletion candidates.',
      why: 'A cleanup query without an explicit retention policy can delete the valuable or referenced record. Large unbounded deletes also create locks, log growth, and replication or availability impact.',
      how: 'Preview ROW_NUMBER() candidates in a transaction, order by a documented preference plus a unique ID, check references and row counts, take a verified backup, then delete reviewed batches. The sample DELETE is intentionally commented out until preview, authorization, and rollback steps are complete.',
      flow: ['Define key and keeper policy', 'Rank candidates deterministically', 'Preview rows where rn > 1', 'Back up and delete in a controlled transaction/batches', 'Verify and enforce uniqueness'],
      example: 'Keep the earliest customer record per normalized email; use CustomerId to break timestamp ties.',
      code: `-- PREVIEW ONLY: review the candidate IDs and dependent references first.
WITH ranked AS (
  SELECT CustomerId, NormalizedEmail, CreatedAt,
         ROW_NUMBER() OVER (
           PARTITION BY NormalizedEmail
           ORDER BY CreatedAt, CustomerId
         ) AS rn
  FROM dbo.Customer
  WHERE NormalizedEmail IS NOT NULL
)
SELECT CustomerId, NormalizedEmail, CreatedAt
FROM ranked
WHERE rn > 1
ORDER BY NormalizedEmail, CreatedAt, CustomerId;

-- After backup, approval, dependency handling, and a tested rollback plan:
-- BEGIN TRANSACTION;
-- WITH ranked AS (...)
-- DELETE FROM ranked WHERE rn > 1;
-- Verify @@ROWCOUNT and invariants before COMMIT; otherwise ROLLBACK.`,
      benefits: ['A unique ordering makes survivor selection repeatable.', 'A preview allows reconciliation and rollback planning before data changes.'],
      costs: ['Large deletes can block, fill the transaction log, and cascade or orphan business data.', 'Batching introduces operational complexity and needs a stable candidate strategy.'],
      use: 'Use only after defining the true business key and approved retention/merge behavior.',
      avoid: 'Do not execute the delete on production as an unreviewed script or rely on a non-unique ordering.',
      questions: ['Why must the ROW_NUMBER ordering end with a unique key?', 'What must be checked before deleting a duplicate with foreign-key references?', 'How do batching and transactions trade off atomicity and operational impact?'],
      scenario: 'An online customer table contains millions of duplicate imports. Export and review candidate IDs, resolve foreign-key references to the keeper, rehearse a logged batch process on a restored copy, monitor log and blocking, then add a unique constraint after cleanup.',
      diagram: [
        { label: 'Policy', detail: 'Choose duplicate key, survivor, and dependent-record merge rules.' },
        { label: 'Rank', detail: 'ROW_NUMBER selects one keeper with a unique deterministic order.' },
        { label: 'Preview', detail: 'Inspect rn > 1 IDs and references; confirm counts and backup.' },
        { label: 'Controlled change', detail: 'Delete approved batches inside explicit transaction boundaries and verify results.' },
        { label: 'Prevent recurrence', detail: 'Add a suitable unique constraint/index after conflicts are resolved.' },
      ],
      steps: ['Preview the ranked result and verify each rn = 1 keeper.', 'Check every duplicate candidate for foreign-key references and domain history.', 'Back up, test rollback, estimate log impact, and get approval.', 'Delete in controlled batches or a reviewed transaction, verify row counts, then enforce uniqueness.'],
      takeaways: ['Never delete until the business key and keeper policy are explicit.', 'Use a deterministic unique tie-breaker in ROW_NUMBER ordering.', 'Preview, back up, account for references, and plan transaction-log impact.', 'Enforce uniqueness after cleanup to stop the source of duplicates.'],
      mistakes: ['Running a DELETE before reviewing candidate IDs and foreign-key relationships.', 'Using CreatedAt alone when timestamps can tie.', 'Putting an enormous delete in one transaction without checking log and blocking capacity.'],
      practices: ['Run the preview and deletion against the same controlled candidate definition.', 'Use a tested restore/rollback procedure and capture affected IDs.', 'Consider batches, lock timeout, monitoring, and resumability for large tables.', 'Create the unique constraint or unique filtered index only after validating its semantics.'],
    }),
    sqlLesson({
      id: 'sql-employees-above-department-average', title: 'Employees Above Their Department Average',
      what: 'A per-department comparison evaluates each employee salary against an aggregate calculated for that employee’s department.',
      why: 'A single overall average answers a different question. A windowed average keeps employee detail while computing a group-level benchmark.',
      how: 'AVG(Salary) OVER (PARTITION BY DepartmentId) attaches an average to each employee row. Filter in an outer query because the window alias is not available in that query block’s WHERE.',
      flow: ['Partition employee rows by department', 'Compute department average', 'Compare each salary to its group average', 'Return employee-level rows'],
      example: 'Return employees whose salary is strictly greater than their department’s average non-NULL salary.',
      code: `WITH scored AS (
  SELECT e.EmployeeId, e.Name, e.DepartmentId, e.Salary,
         AVG(CAST(e.Salary AS decimal(19, 4))) OVER (
           PARTITION BY e.DepartmentId
         ) AS DepartmentAverage
  FROM dbo.Employee AS e
)
SELECT EmployeeId, Name, DepartmentId, Salary, DepartmentAverage
FROM scored
WHERE Salary > DepartmentAverage
ORDER BY DepartmentId, Salary DESC;`,
      benefits: ['Window aggregate avoids a separate self-join and preserves employee detail.', 'The comparison uses each department’s own cohort.'],
      costs: ['The query must read enough rows to calculate averages.', 'NULL salaries are ignored by AVG; a department with all NULL salaries has no qualifying comparisons.'],
      use: 'Use a window aggregate when both employee details and a department statistic are required.',
      avoid: 'Do not compare to a company-wide AVG or silently coalesce an undefined all-NULL group average to zero.',
      questions: ['Why use PARTITION BY here?', 'How does AVG treat NULL salaries?', 'Why filter the computed average in an outer query?'],
      scenario: 'A compensation audit flags employees above their group mean. Confirm whether salary components and inactive employees belong in the cohort, then validate the group and NULL policy with HR before reporting.',
      diagram: [
        { label: 'Eligible rows', detail: 'Apply cohort rules such as active employees or salary type.' },
        { label: 'Partition', detail: 'Separate each department into its own analytic window.' },
        { label: 'AVG window', detail: 'Compute the mean without collapsing employee rows.', code: 'AVG(Salary) OVER (PARTITION BY DepartmentId)' },
        { label: 'Compare', detail: 'Filter employees whose salary exceeds the attached group mean.' },
      ],
      steps: ['Define which employees contribute to the average.', 'Calculate AVG over each DepartmentId partition.', 'Keep the employee-level rows and filter in the outer query.', 'Validate NULL and decimal precision behavior.'],
      takeaways: ['Window aggregates retain row detail while calculating group statistics.', 'PARTITION BY prevents the average from becoming global.', 'AVG ignores NULL inputs; all-NULL groups produce NULL.', 'Filter a window alias in an outer query block.'],
      mistakes: ['Comparing against the overall company average.', 'Using integer arithmetic or unintended salary conversion precision.', 'Forgetting that filtering employees before the window changes the cohort.'],
      practices: ['Make population eligibility and NULL handling explicit.', 'Use an appropriate decimal type for the aggregate.', 'Test small departments and all-NULL salary groups.'],
    }),
    sqlLesson({
      id: 'sql-highest-salary-per-department', title: 'Highest Salary Per Department',
      what: 'The maximum salary per department can be returned as a value, or with the employee row or rows that achieve it.',
      why: 'A grouped MAX returns only the amount; reporting the employee requires a join-back or a ranking method. Ties must be treated intentionally.',
      how: 'Use MAX with GROUP BY for amounts. Use DENSE_RANK or a join on department plus maximum when all ties should appear; use ROW_NUMBER with deterministic ordering for one chosen winner.',
      flow: ['Choose amount-only or employee rows', 'Compute maximum by department', 'Join or rank to recover matching employees', 'Preserve ties or select one deterministically'],
      example: 'Return every employee tied for the highest non-NULL salary in their department.',
      code: `WITH ranked AS (
  SELECT EmployeeId, Name, DepartmentId, Salary,
         DENSE_RANK() OVER (
           PARTITION BY DepartmentId ORDER BY Salary DESC
         ) AS salary_rank
  FROM dbo.Employee
  WHERE Salary IS NOT NULL
)
SELECT EmployeeId, Name, DepartmentId, Salary
FROM ranked
WHERE salary_rank = 1
ORDER BY DepartmentId, EmployeeId;`,
      benefits: ['Window ranking preserves employee details and all top ties.', 'The tie policy is visible and testable.'],
      costs: ['Ranking may sort data; grouped aggregate plus join can also require additional work.', 'Departments with no non-NULL salary have no qualifying employee.'],
      use: 'Use DENSE_RANK = 1 when the answer should include every employee tied at the department maximum.',
      avoid: 'Avoid joining only by salary; include the department key or employees from other departments may match.',
      questions: ['Why does GROUP BY MAX not return the employee name?', 'How do you include all employees tied for maximum?', 'What columns are needed in an aggregate join-back?'],
      scenario: 'A dashboard needs the top-paid employee in each department. Product clarifies all ties should appear; implement rank 1 and test departments with no salary and multiple maximum-paid people.',
      diagram: [
        { label: 'Department partition', detail: 'Compute maxima independently per DepartmentId.' },
        { label: 'Salary order', detail: 'Place highest salary first in each partition.' },
        { label: 'Rank 1', detail: 'Select the maximum row or every employee tied at that salary.' },
      ],
      steps: ['Filter NULL salaries if those do not represent a pay amount.', 'Rank rows descending within each department.', 'Select rank 1 and retain all ties.', 'If only the maximum amount is needed, use GROUP BY DepartmentId with MAX(Salary).'],
      takeaways: ['GROUP BY MAX returns a value, not its associated employee.', 'Rank 1 preserves all equal maximum rows.', 'Join-back must include the grouping key.', 'Define behavior for NULL-only departments.'],
      mistakes: ['Selecting an unrelated employee name alongside MAX without a valid grouping rule.', 'Joining max salary back on salary only and mixing departments.', 'Using ROW_NUMBER when all ties are required.'],
      practices: ['Specify whether ties are all returned or one is selected.', 'Use a unique tie-breaker for one-winner requirements.', 'Test NULL-only and tied-maximum groups.'],
      tables: employeeTables,
    }),
    sqlLesson({
      id: 'sql-row-number-rank-dense-rank', title: 'ROW_NUMBER vs RANK vs DENSE_RANK',
      what: 'These window ranking functions assign positions within an ordered partition. ROW_NUMBER assigns a unique sequence; RANK gives ties the same rank and leaves gaps; DENSE_RANK gives ties the same rank without gaps.',
      why: 'The ranking function determines how ties affect top-N boundaries and whether a query returns a fixed row count or a fixed number of rank/value levels.',
      how: 'Use OVER(PARTITION BY group ORDER BY score) to define scope and order. ROW_NUMBER ordering should include a unique key for repeatability. RANK and DENSE_RANK preserve equal ordering values as ties.',
      flow: ['Partition rows', 'Order within each partition', 'Assign function-specific positions', 'Filter using the required row/tie semantics'],
      example: 'For scores 100, 90, 90, 80 the functions return row numbers 1,2,3,4; ranks 1,2,2,4; dense ranks 1,2,2,3.',
      code: `SELECT EmployeeId, Salary,
       ROW_NUMBER() OVER (ORDER BY Salary DESC, EmployeeId) AS row_num,
       RANK()       OVER (ORDER BY Salary DESC) AS salary_rank,
       DENSE_RANK() OVER (ORDER BY Salary DESC) AS salary_dense_rank
FROM dbo.Employee
ORDER BY Salary DESC, EmployeeId;`,
      benefits: ['Provides explicit control of row positions and tie behavior.', 'Works for pagination, leaderboards, and top-N analyses.'],
      costs: ['Ordering can require substantial sorting.', 'Nondeterministic ROW_NUMBER ties can change between executions without a unique ordering.'],
      use: 'Use ROW_NUMBER for a deterministic single row sequence; RANK for competition ranking; DENSE_RANK for distinct ordered values.',
      avoid: 'Do not filter rank values before defining what ties should mean; do not expect RANK <= N to return exactly N rows.',
      questions: ['What ranks result for values 100, 90, 90, 80?', 'Which function returns exactly N rows if enough rows exist?', 'When should the ordering include a unique key?'],
      scenario: 'A leaderboard shows duplicate place labels and a top-five report returns six people. Align rank semantics with product: competition places, distinct score levels, or exactly five rows, then test ties at the cutoff.',
      diagram: [
        { label: 'Partition', detail: 'Start a separate sequence for each group.' },
        { label: 'Sort', detail: 'Order rows by the ranking measure; decide whether tie-breaker belongs in the order.' },
        { label: 'ROW_NUMBER', detail: 'Unique sequential row positions; with a unique order, exactly one row per number.' },
        { label: 'RANK / DENSE_RANK', detail: 'Ties share a number; RANK leaves gaps, DENSE_RANK does not.' },
      ],
      steps: ['Choose whether ties should share a rank.', 'Define partition and ranking columns.', 'Include a unique tie-breaker only when individual row order should be unique.', 'Filter using the selected function’s semantics.'],
      takeaways: ['ROW_NUMBER is a row sequence; RANK is competition position; DENSE_RANK is distinct-value position.', 'Ties make rank <= N potentially return more than N rows.', 'A unique order is needed for repeatable ROW_NUMBER assignments.', 'Partitioning restarts the ranking independently for each group.'],
      mistakes: ['Adding EmployeeId to RANK ordering when equal salaries must remain tied.', 'Expecting RANK to have no gaps after ties.', 'Assuming ROW_NUMBER is repeatable when order columns are not unique.'],
      practices: ['Test ranking functions with intentional ties and cutoff ties.', 'Document whether N means rows, places, or distinct values.', 'Use stable unique ordering when deterministic row assignment matters.'],
      tables: [{ title: 'Ranking example', headers: ['Score', 'ROW_NUMBER', 'RANK', 'DENSE_RANK'], rows: [['100', '1', '1', '1'], ['90', '2', '2', '2'], ['90', '3', '2', '2'], ['80', '4', '4', '3']] }],
    }),
    sqlLesson({
      id: 'sql-cte-temp-table-table-variable', title: 'CTE vs Temporary Table vs Table Variable',
      what: 'A CTE names a query expression for one following statement; #temp tables are session-scoped tempdb tables; table variables are variables backed by tempdb with table-like structure and narrower scope.',
      why: 'Choice affects reuse, statistics, indexes, compilation, scope, and plan quality. A CTE is not inherently a materialized cache, and a table variable is not guaranteed to stay in memory.',
      how: 'Use CTEs to express one statement clearly. Use #temp tables for multi-step intermediate results, indexes/statistics, and reuse. Use table variables for small, bounded intermediate sets where testing confirms plan quality; SQL Server version and deferred compilation affect estimates.',
      flow: ['Define intermediate result and lifetime', 'Choose single statement or reusable materialization', 'Consider indexes and cardinality estimates', 'Measure plan and tempdb/write implications'],
      example: 'Stage a filtered customer set used by several statements and add an index when its cardinality makes reuse valuable.',
      code: `-- CTE: readable expression scoped to the next statement.
;WITH Active AS (
  SELECT CustomerId, RegionId FROM dbo.Customer WHERE IsActive = 1
)
SELECT RegionId, COUNT_BIG(*) FROM Active GROUP BY RegionId;

-- #temp: materialized, reusable intermediate result; evaluate indexing.
SELECT CustomerId, RegionId INTO #Active
FROM dbo.Customer WHERE IsActive = 1;
CREATE INDEX IX_Active_Region ON #Active(RegionId);
SELECT RegionId, COUNT_BIG(*) FROM #Active GROUP BY RegionId;
DROP TABLE #Active;`,
      benefits: ['CTEs make a single relational expression readable.', '#temp tables enable reuse and statistics/index choices for complex workflows.'],
      costs: ['CTEs may be inlined/re-evaluated in a plan and do not imply storage.', 'Temp tables use tempdb and add writes, lifecycle, and compilation considerations; table-variable estimates can be poor for some workloads.'],
      use: 'Use CTE for one-statement decomposition; #temp for measured multi-step reuse or cardinality-sensitive work; table variables for small predictable scoped sets.',
      avoid: 'Avoid assuming a CTE caches rows or a table variable is always faster or memory-only. Do not choose based on folklore without representative plans.',
      questions: ['Is a CTE necessarily materialized?', 'When can a temp table improve a multi-stage query?', 'Why can table-variable cardinality affect plan quality?'],
      scenario: 'A report reuses an intermediate million-row customer set and spills repeatedly. Compare a CTE, #temp table with an appropriate index, and the original plan using actual rows, tempdb activity, and end-to-end latency.',
      diagram: [
        { label: 'CTE', detail: 'Named expression scoped to the next statement; optimizer may inline it.' },
        { label: '#temp', detail: 'Session-scoped tempdb object; can be reused and indexed.' },
        { label: '@table', detail: 'Variable scope; tempdb-backed behavior and cardinality estimation depend on version/features.' },
        { label: 'Choose with evidence', detail: 'Compare scope, reuse, statistics, indexes, compilation, and measured workload.' },
      ],
      steps: ['Estimate row count, lifetime, number of references, and required indexes.', 'Start with a CTE for a one-statement readable expression.', 'Materialize to #temp if reuse or statistics/indexes improve measured plans.', 'Test table variables only for bounded inputs on the deployed SQL Server version.'],
      takeaways: ['A CTE is syntax for a query expression, not a guaranteed cache.', '#temp tables provide reusable materialization and index/statistics options.', 'Table variables can spill/use tempdb and have version-dependent estimates.', 'Benchmark actual plans and workload, not object-name folklore.'],
      mistakes: ['Expecting a repeated CTE reference to run once and cache results.', 'Assuming table variables are always in memory or always outperform temp tables.', 'Ignoring tempdb and compilation costs when materializing.'],
      practices: ['Choose the narrowest lifetime and scope that fits the workflow.', 'Compare actual versus estimated rows and spills.', 'Include data volume and SQL Server version in performance tests.'],
      sources: [{ label: 'Microsoft Learn: WITH common table expression', url: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql' }],
    }),
    sqlLesson({
      id: 'sql-clustered-nonclustered-indexes', title: 'Clustered and Nonclustered Indexes',
      what: 'A clustered index is the table’s rowstore B-tree whose leaf level contains the data rows; a table has at most one. A nonclustered index is a separate B-tree with key columns and a row locator (clustered key or RID), and a table may have many.',
      why: 'Indexes provide ordered access paths, support constraints, and can avoid scans or lookups. Each index also adds storage, write work, and maintenance.',
      how: 'Choose a clustered key that fits access patterns and key stability; design nonclustered keys for predicates, joins, ordering, and grouping. INCLUDE non-key columns for coverage without making them ordering keys. Validate with actual plans and workload evidence.',
      flow: ['Understand query predicates and row grain', 'Choose clustered row organization', 'Add focused nonclustered access path', 'Measure reads, writes, lookups, and maintenance'],
      example: 'Support department salary ordering and return employee name without making Name part of the index search key.',
      code: `-- Example only: verify existing indexes, workload, and write cost first.
CREATE NONCLUSTERED INDEX IX_Employee_Department_Salary
ON dbo.Employee (DepartmentId, Salary DESC)
INCLUDE (EmployeeId, Name);`,
      benefits: ['Can reduce logical reads, support ordered access, and cover a query.', 'Unique indexes enforce data invariants as well as aiding access.'],
      costs: ['Every insert/update/delete may maintain affected indexes.', 'Indexes consume storage, can cause page splits, and may be unused or duplicated.'],
      use: 'Use a focused index when measured predicates, joins, ordering, or constraints justify its read benefit.',
      avoid: 'Avoid indexing every column or using wide, volatile clustered keys without considering write amplification and row-locator size.',
      questions: ['What is stored at the leaf level of a clustered index?', 'Why does a nonclustered index need a row locator?', 'When does INCLUDE help versus adding a key column?'],
      scenario: 'A salary report scans a large employee table. Confirm query shape and selectivity, compare existing indexes and actual plan, evaluate a department/salary key with includes, then measure read improvement against insert/update cost.',
      diagram: [
        { label: 'Clustered B-tree', detail: 'Leaf level is the table data; defines rowstore organization and row locator for secondary indexes.' },
        { label: 'Nonclustered key', detail: 'Separate ordered tree stores search keys plus row locator.' },
        { label: 'INCLUDE payload', detail: 'Leaf-only columns can cover output without extending search/order key.' },
        { label: 'Access plan', detail: 'Optimizer may seek, scan, lookup, or prefer another access path.' },
      ],
      steps: ['List filters, joins, order columns, selected fields, and write rates.', 'Review existing indexes and actual execution plans.', 'Design key columns in useful leading order; add minimal included payload.', 'Measure logical reads, duration, and write overhead under representative load.'],
      takeaways: ['A table has at most one clustered index; its leaf level is the table data.', 'A nonclustered index stores key values and a row locator.', 'INCLUDE can cover output without expanding the index key.', 'Indexes trade read efficiency for storage and write maintenance.'],
      mistakes: ['Creating overlapping indexes without comparing their key and include columns.', 'Putting every selected column into the key instead of using INCLUDE.', 'Treating an index seek as proof of a fast query regardless of rows read or lookups.'],
      practices: ['Use plans and workload measurements to justify index changes.', 'Keep keys narrow and stable; include only columns that avoid material cost.', 'Monitor usage, write impact, statistics, and duplicate/overlapping indexes.'],
      sources: [{ label: 'Microsoft Learn: SQL Server indexes', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/indexes/sql-server-index-design-guide' }],
    }),
    sqlLesson({
      id: 'sql-how-indexes-speed-queries', title: 'How Indexes Speed Queries',
      what: 'A B-tree index narrows the rows that must be visited for selective predicates and can provide ordered rows or cover all columns needed by a query.',
      why: 'Reading fewer pages can reduce I/O and CPU, but an index seek can still return many rows, perform many lookups, or feed an expensive join or sort.',
      how: 'Align leading key columns with useful equality/range predicates and ordering; keep predicates sargable (search-argument-able), maintain statistics, and check actual rows, logical reads, lookups, and spills. The optimizer chooses indexes using estimated costs and available statistics.',
      flow: ['Predicate and projection', 'Estimate selectivity from statistics', 'Choose seek/scan plus joins/lookups', 'Measure actual pages, rows, CPU and latency'],
      example: 'An equality filter on DepartmentId followed by salary ordering can use an index beginning with DepartmentId then Salary.',
      code: `-- Sargable predicate can use a key on HireDate.
SELECT EmployeeId, HireDate
FROM dbo.Employee
WHERE HireDate >= @startDate
  AND HireDate < @endDate;
-- Avoid wrapping the indexed column in CONVERT(YEAR, HireDate) = @year.`,
      benefits: ['Reduces pages read for selective access and may satisfy ordering.', 'Covering indexes can eliminate key lookups for a specific query.'],
      costs: ['Low-selectivity scans may be cheaper than many random lookups.', 'Indexes cannot compensate for bad estimates, excessive rows, or costly downstream operators.'],
      use: 'Use an index when plan and I/O evidence shows it supports a meaningful predicate, join, ordering, or coverage need.',
      avoid: 'Do not add an index solely because a query is slow; first inspect waits, row estimates, sargability, and bottleneck location.',
      questions: ['Why can a scan be optimal?', 'What makes a predicate non-sargable?', 'How can an index seek still perform poorly?'],
      scenario: 'An indexed endpoint gets slower as data grows. Compare actual and estimated rows, check whether a seek reads most of the table or causes lookups, review statistics and parameter sensitivity, and test a narrow index against logical reads and write workload.',
      diagram: [
        { label: 'Sargable predicate', detail: 'Expose an indexable range/equality condition on the stored key.' },
        { label: 'Statistics estimate', detail: 'Histogram and density information inform cardinality and cost estimates.' },
        { label: 'Access and operators', detail: 'Seek, scan, lookup, join, sort, or aggregate are selected for the full plan.' },
        { label: 'Runtime validation', detail: 'Actual rows, reads, CPU, spills, and waits confirm whether it helped.' },
      ],
      steps: ['Capture the actual plan and SET STATISTICS IO, TIME output in a safe representative environment.', 'Check predicate sargability, estimated/actual cardinality, and index leading keys.', 'Look beyond “seek” for rows read, lookups, joins, sorts, and spills.', 'Compare before/after read, CPU, latency, and write overhead.'],
      takeaways: ['Indexes reduce data access only when query shape and selectivity benefit.', 'A seek can still read many rows or trigger expensive lookups.', 'Sargable predicates and accurate statistics support better access choices.', 'Optimize the whole plan and measured workload, not a single operator label.'],
      mistakes: ['Assuming every scan is bad or every seek is good.', 'Applying functions to indexed columns unnecessarily in predicates.', 'Adding indexes without accounting for write amplification.'],
      practices: ['Measure logical reads, actual rows, CPU, waits, and end-to-end latency.', 'Keep predicates type-compatible and sargable where semantics allow.', 'Validate index changes with read-heavy and write-heavy workload tests.'],
    }),
    sqlLesson({
      id: 'sql-deadlocks', title: 'Deadlocks and Safe Recovery',
      what: 'A deadlock is a cycle of transactions, each holding a resource needed by another. SQL Server detects the cycle and chooses a victim; error 1205 means that victim transaction was rolled back.',
      why: 'Deadlocks differ from ordinary blocking: a wait may resolve when its holder commits, while a deadlock cycle cannot progress without aborting a participant.',
      how: 'Capture the deadlock graph (extended events/system_health), identify statements, lock modes, indexes, and access order, then shorten transactions, standardize resource order, and improve selective access. Retry the entire database unit only when safe, bounded, and idempotent.',
      flow: ['Transactions acquire locks', 'Each requests a held resource', 'Wait-for cycle is detected', 'Victim is rolled back', 'Investigate graph and prevent recurrence'],
      example: 'Transaction A locks Order then Inventory while B locks Inventory then Order; standardize both to Order then Inventory.',
      code: `-- Pseudocode: retry the complete database operation with bounded backoff.
// Retry only a known transient deadlock and only an idempotent DB unit.
await retryPolicy.ExecuteAsync(async () =>
{
    await using var tx = await connection.BeginTransactionAsync(ct);
    await UpdateOrderThenInventoryAsync(tx, orderId, ct);
    await tx.CommitAsync(ct);
});`,
      benefits: ['Deadlock graphs expose involved resources and statements.', 'A bounded retry can recover a transient victim rollback.'],
      costs: ['Retries add latency and can amplify load during contention.', 'Blind retries can duplicate external effects or mask a systemic lock-order flaw.'],
      use: 'Use retries for a narrowly classified transient failure when the transaction can safely be replayed.',
      avoid: 'Avoid retrying non-idempotent external side effects inside the retry boundary or swallowing 1205 without diagnosis.',
      questions: ['How does deadlock differ from blocking?', 'What does error 1205 tell you?', 'Which information in a deadlock graph guides remediation?'],
      scenario: 'Checkout intermittently fails with 1205. Capture graphs during the incident, map locks to statements and indexes, standardize entity update order, shorten transaction scope, and add a bounded database-only retry with idempotency keys for external payment actions.',
      diagram: [
        { label: 'Transaction A', detail: 'Holds resource 1 and requests resource 2.' },
        { label: 'Transaction B', detail: 'Holds resource 2 and requests resource 1.' },
        { label: 'Cycle detection', detail: 'The lock manager detects a wait-for cycle and chooses a victim.' },
        { label: '1205 rollback', detail: 'Victim transaction is rolled back; caller must decide whether safe retry applies.' },
        { label: 'Root-cause fix', detail: 'Use graph evidence to correct order, duration, indexes, and retry boundary.' },
      ],
      steps: ['Capture the deadlock graph and correlate transaction IDs to application operations.', 'Inspect resource types, lock modes, access order, and plan/index support.', 'Make access order consistent and reduce lock duration.', 'Retry only a safe, idempotent transaction with bounded backoff; verify external effects are outside or deduplicated.'],
      takeaways: ['1205 means SQL Server selected and rolled back a deadlock victim.', 'Blocking alone is not a deadlock; a cycle is required.', 'Deadlock graphs are stronger evidence than guessing from application logs.', 'Retries complement, not replace, concurrency design fixes.'],
      mistakes: ['Treating every timeout or blocking wait as a deadlock.', 'Retrying unboundedly or retrying operations with already-issued external side effects.', 'Changing isolation or adding indexes without graph and plan evidence.'],
      practices: ['Use Extended Events/system_health to capture deadlock XML.', 'Keep transactions short and acquire shared resources in a consistent order.', 'Use bounded jittered retries only for safe transient transaction failures.', 'Log operation correlation IDs and retry counts without sensitive SQL parameter values.'],
      sources: [{ label: 'Microsoft Learn: Deadlocks guide', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide' }],
    }),
    sqlLesson({
      id: 'sql-isolation-levels', title: 'Transaction Isolation Levels',
      what: 'Isolation defines what changes a transaction can observe and which concurrent anomalies are prevented. SQL Server offers READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE, and SNAPSHOT; READ COMMITTED SNAPSHOT (RCSI) is a database option that provides statement-level versioned reads.',
      why: 'Isolation is a correctness and concurrency decision: stronger guarantees can increase locking, blocking, or row-version storage. Snapshot and RCSI use row versions rather than making readers wait for many writers.',
      how: 'READ UNCOMMITTED permits dirty reads; READ COMMITTED avoids dirty reads; REPEATABLE READ retains locks on read rows; SERIALIZABLE protects qualifying key ranges against phantoms; SNAPSHOT gives a transactionally consistent versioned view and can raise update conflicts. Select the weakest level that maintains invariants and test under real concurrency.',
      flow: ['Define required consistency invariant', 'Choose locking or versioning semantics', 'Run reads and writes in transaction scope', 'Measure blocking, conflicts, and version-store use'],
      example: 'For a transfer, protect the debit/credit invariant with an atomic transaction and appropriate concurrency control; do not use READ UNCOMMITTED for balances.',
      code: `SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
  SELECT AccountId, Balance
  FROM dbo.Account
  WHERE AccountId IN (@fromId, @toId);
  -- Validate and update both accounts atomically; handle snapshot update conflicts.
COMMIT TRANSACTION;
-- SNAPSHOT must be enabled for the database; verify operations policy first.`,
      benefits: ['Versioned reads can reduce reader/writer blocking.', 'Higher isolation can protect multi-statement invariants from anomalies.'],
      costs: ['Serializable range locks may reduce concurrency.', 'Snapshot/RCSI consume version-store resources; snapshot transactions can encounter update conflicts.'],
      use: 'Use the lowest isolation that preserves the actual invariant; consider versioned reads for workloads where blocking is costly and capacity is monitored.',
      avoid: 'Avoid READ UNCOMMITTED for correctness-sensitive data and avoid changing database-wide RCSI or transaction isolation without workload testing.',
      questions: ['Which level can allow dirty reads?', 'How do SNAPSHOT and RCSI differ?', 'What anomaly does SERIALIZABLE prevent that REPEATABLE READ may allow?'],
      scenario: 'A balance report blocks writers while occasional reports need a consistent view. Evaluate RCSI for statement-level consistency or SNAPSHOT for transaction-level view, check tempdb/version-store headroom, and preserve atomic conditional updates for invariant enforcement.',
      diagram: [
        { label: 'Invariant', detail: 'Specify whether the operation needs statement or transaction consistency and which anomalies are unacceptable.' },
        { label: 'Isolation choice', detail: 'Select locking-based level or versioned SNAPSHOT/RCSI semantics.' },
        { label: 'Concurrent execution', detail: 'Locks can block; versioned reads consume row versions and can conflict on writes.' },
        { label: 'Validate', detail: 'Stress concurrent workload and monitor waits, conflicts, and version-store growth.' },
      ],
      steps: ['Describe the correctness invariant and possible anomalies.', 'Choose isolation and transaction boundaries that protect it.', 'Check database options for RCSI/SNAPSHOT and understand statement versus transaction snapshots.', 'Load-test blocking, update conflicts, and version-store capacity.'],
      takeaways: ['READ UNCOMMITTED can expose uncommitted changes.', 'SERIALIZABLE protects qualifying ranges but can increase blocking.', 'RCSI gives statement-level versioned reads; SNAPSHOT gives transaction-level view.', 'Isolation cannot replace constraints or atomic operations for core invariants.'],
      mistakes: ['Assuming READ COMMITTED means one consistent snapshot across a multi-statement transaction.', 'Enabling row versioning without monitoring version-store capacity.', 'Using NOLOCK to “fix” blocking while accepting inconsistent results unknowingly.'],
      practices: ['Choose isolation from explicit business correctness requirements.', 'Keep transaction scopes short and use constraints/conditional updates.', 'Monitor lock waits, deadlocks, snapshot conflicts, and version-store growth.'],
      sources: [{ label: 'Microsoft Learn: Transaction locking and row versioning guide', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide' }],
    }),
    sqlLesson({
      id: 'sql-acid-transactions', title: 'ACID Transaction Guarantees',
      what: 'ACID describes Atomicity (all-or-nothing), Consistency (valid states/invariants), Isolation (concurrent work behaves according to isolation rules), and Durability (committed work survives failures according to configured guarantees).',
      why: 'ACID guides schema constraints, transaction boundaries, error handling, and recovery design. It does not mean every business workflow automatically has correct invariants or that all isolation levels provide serial behavior.',
      how: 'Place related database changes in a transaction, enforce invariants with constraints and conditional updates, handle errors with rollback, and commit only after the unit succeeds. Durability depends on commit and SQL Server recovery/configuration; external services are not included in a local SQL transaction.',
      flow: ['Begin unit of work', 'Apply constrained changes', 'Commit all or rollback all', 'Recover committed state after failure'],
      example: 'A funds transfer debits and credits two accounts in one transaction and uses a conditional debit to prevent overdraft.',
      code: `SET XACT_ABORT ON;
BEGIN TRY
  BEGIN TRANSACTION;
  UPDATE dbo.Account
    SET Balance = Balance - @amount
    WHERE AccountId = @fromId AND Balance >= @amount;
  IF @@ROWCOUNT <> 1 THROW 50001, 'Insufficient funds or account missing.', 1;
  UPDATE dbo.Account SET Balance = Balance + @amount WHERE AccountId = @toId;
  IF @@ROWCOUNT <> 1 THROW 50002, 'Destination account missing.', 1;
  COMMIT TRANSACTION;
END TRY
BEGIN CATCH
  IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
  THROW;
END CATCH;`,
      benefits: ['Atomic commits prevent partially applied database units.', 'Constraints and transactions protect consistency during concurrency.'],
      costs: ['Long transactions hold locks or versions and can increase contention.', 'A local transaction does not atomically commit email, payment gateway, or message broker effects.'],
      use: 'Use transactions for a bounded set of database changes that must succeed or fail together.',
      avoid: 'Avoid holding a DB transaction open across slow external calls; use an outbox/saga and idempotency for cross-system workflows.',
      questions: ['What does consistency mean in ACID?', 'How does a transaction provide atomicity?', 'Why is a payment API call not covered by a SQL transaction?'],
      scenario: 'An order is saved but inventory is not decremented. Put database invariant changes in one transaction and use an outbox for subsequent events; make consumers idempotent to handle delivery retries.',
      diagram: [
        { label: 'Atomicity', detail: 'Commit all database statements or roll the unit back.' },
        { label: 'Consistency', detail: 'Constraints and application rules move data between valid states.' },
        { label: 'Isolation', detail: 'Concurrent transactions follow configured visibility and locking/versioning behavior.' },
        { label: 'Durability', detail: 'A successful commit is recoverable under the configured database durability model.' },
        { label: 'System boundary', detail: 'External effects require outbox/saga/idempotency; they are outside local SQL ACID.' },
      ],
      steps: ['Identify the state invariant and all rows that participate.', 'Use constraints and a transaction to apply the database unit.', 'Rollback and propagate failures; do not report success before commit.', 'Use durable messaging patterns for external effects.'],
      takeaways: ['Atomicity concerns a transaction’s all-or-nothing outcome.', 'Consistency comes from enforcing valid state, not from the word ACID alone.', 'Isolation behavior depends on the selected level and implementation.', 'External systems need distributed workflow patterns beyond a local database transaction.'],
      mistakes: ['Assuming a successful application method means the transaction committed.', 'Holding a transaction open while calling remote services.', 'Relying only on application validation instead of database constraints for shared invariants.'],
      practices: ['Keep transactions short and scoped to related database writes.', 'Use constraints and conditional writes for invariants.', 'Use outbox, idempotency, and compensating actions across service boundaries.', 'Handle rollback and uncertain commit outcomes explicitly.'],
    }),
    sqlLesson({
      id: 'sql-slow-query-optimization', title: 'Slow Query Optimization Method',
      what: 'Query optimization is a measured process of identifying the dominant cost (I/O, CPU, waits, blocking, network, or client processing) and changing the query, index, statistics, or workload safely.',
      why: 'A slow endpoint is not always a slow SQL statement. Guessing or rewriting before collecting a baseline can optimize the wrong layer and cause regressions.',
      how: 'Capture duration, CPU, logical reads, row counts, waits, and actual plan; identify parameter sensitivity, implicit conversions, non-sargable predicates, excess result data, poor estimates, spills, and blocking. Change one hypothesis at a time and compare representative workloads.',
      flow: ['Establish reproducible baseline', 'Find expensive statement and bottleneck', 'Inspect plan, parameters, waits, and data shape', 'Test one targeted change', 'Compare and monitor regression risk'],
      example: 'A date-range query scans because a conversion wraps the indexed column; rewrite to a half-open date range, then validate correctness and reads.',
      code: `-- Prefer a half-open range over applying YEAR() to the column.
SELECT OrderId, CreatedAt, Total
FROM dbo.[Order]
WHERE CreatedAt >= @dayStart
  AND CreatedAt < DATEADD(day, 1, @dayStart);`,
      benefits: ['Evidence-driven changes target the measured bottleneck.', 'A baseline and controlled comparison reduce regression risk.'],
      costs: ['Plan/runtime collection and representative load testing require time and access.', 'Parameter sensitivity and changing data distributions can make one plan or benchmark misleading.'],
      use: 'Use this workflow for regressions and expensive queries before changing schema or query shape.',
      avoid: 'Avoid optimizing from elapsed time alone or treating a single plan screenshot as a representative workload.',
      questions: ['Which metrics distinguish CPU-bound from I/O-bound work?', 'What does a large estimated-versus-actual row difference suggest?', 'How do parameter-sensitive plans affect query tuning?'],
      scenario: 'An API’s p95 latency doubled after data growth. Correlate request traces with Query Store, compare plan IDs and logical reads, inspect waits and row estimates, test a sargable predicate/index change on representative parameters, then monitor p95 and write costs after rollout.',
      diagram: [
        { label: 'Baseline', detail: 'Capture query identity, parameter values/ranges, duration, CPU, reads, and result size.' },
        { label: 'Evidence', detail: 'Use actual plan, Query Store, waits, statistics, and trace correlation.' },
        { label: 'Hypothesis', detail: 'Target one cause such as bad estimates, lookup amplification, blocking, or client over-fetch.' },
        { label: 'Controlled change', detail: 'Test correctness and performance against representative data and concurrency.' },
        { label: 'Verify rollout', detail: 'Monitor tail latency and resource/write impacts; rollback if regression appears.' },
      ],
      steps: ['Identify the exact query and capture representative parameters.', 'Record baseline duration, CPU, logical reads, row counts, waits, and plan.', 'Determine whether database execution, blocking, network transfer, or client work dominates.', 'Test one change and compare correctness, p95/p99, reads, CPU, and write impact.'],
      takeaways: ['Diagnose the bottleneck before editing SQL.', 'Actual row counts, reads, waits, and parameters add context beyond elapsed time.', 'Change one hypothesis at a time and verify under representative workload.', 'Query Store helps compare plans and regressions over time.'],
      mistakes: ['Adding an index before checking whether the query is blocked or returning too many rows.', 'Using only average duration and missing tail latency or parameter variation.', 'Applying a rewrite without comparing semantics and result cardinality.'],
      practices: ['Correlate API traces with database query identity and Query Store.', 'Record parameter ranges, plan, actual rows, reads, CPU, waits, and result size.', 'Roll out risky changes gradually with monitoring and a rollback path.'],
      sources: [{ label: 'Microsoft Learn: Query Store', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store' }],
    }),
    sqlLesson({
      id: 'sql-execution-plans', title: 'Read SQL Server Execution Plans',
      what: 'An execution plan is the optimizer’s chosen physical strategy: operators and data flow used to execute a query. An estimated plan contains estimates; an actual plan adds runtime observations such as actual rows and executions.',
      why: 'Plans reveal access methods, join algorithms, sorts, aggregates, lookups, spills, and estimate errors. They explain implementation, not the logical SQL binding order or every external bottleneck.',
      how: 'Read from data-producing inputs toward parent operators; compare estimated and actual rows, check warnings and memory grants, inspect predicates and rows read, and correlate with runtime metrics and waits. A graphical icon or cost percentage is not a complete diagnosis.',
      flow: ['Compile query and estimate alternatives', 'Choose physical operators and exchanges', 'Execute and collect actual metrics', 'Compare estimates with actual workload'],
      example: 'A key lookup repeated hundreds of thousands of times may indicate an index coverage trade-off; verify rows, reads, and write costs before changing it.',
      code: `SET STATISTICS IO, TIME ON;
-- In SSMS, enable Include Actual Execution Plan, then run a representative query.
SELECT EmployeeId, Name
FROM dbo.Employee
WHERE DepartmentId = @departmentId
ORDER BY Salary DESC;
SET STATISTICS IO, TIME OFF;`,
      benefits: ['Shows operator choices and estimate/runtime evidence.', 'Helps explain scans, lookups, joins, sorts, spills, and memory grants.'],
      costs: ['Actual plan capture adds overhead and may expose sensitive literals or schema details.', 'Estimated operator percentages are relative estimates, not direct elapsed-time attribution.'],
      use: 'Use actual plans with representative parameter values alongside Query Store, reads, CPU, waits, and latency.',
      avoid: 'Avoid assuming the largest estimated-cost operator is the actual bottleneck or that an estimated plan proves runtime behavior.',
      questions: ['What extra information does an actual plan provide?', 'How do you interpret estimated-versus-actual row discrepancy?', 'Why is a key lookup not automatically bad?'],
      scenario: 'A query suddenly spills to tempdb. Capture an actual plan on representative data, inspect sort/hash warnings, memory grant and estimate errors, validate statistics and parameter behavior, then test a measured fix.',
      diagram: [
        { label: 'Estimated rows', detail: 'Optimizer uses statistics and parameters to estimate cardinality and cost.' },
        { label: 'Physical operators', detail: 'Access, join, filter, aggregate, sort, and exchange operators form a dataflow plan.' },
        { label: 'Runtime metrics', detail: 'Actual plan adds rows, executions, warnings, and observed resource details.' },
        { label: 'Evidence correlation', detail: 'Combine plan findings with IO/TIME, waits, Query Store, and end-to-end trace.' },
      ],
      steps: ['Capture an actual plan using representative parameters in a safe environment.', 'Read data flow from leaves toward root and inspect predicates, joins, and row counts.', 'Compare estimated and actual rows; investigate spills, memory grants, and repeated lookups.', 'Correlate with logical reads, CPU, waits, and application latency before changing anything.'],
      takeaways: ['A plan describes physical implementation, not logical clause-binding order.', 'Actual plans provide runtime evidence unavailable from estimated plans.', 'Estimate errors can propagate into join, memory, and access-path choices.', 'Plan cost percentages and seek/scan labels are clues, not conclusions.'],
      mistakes: ['Reading plan flow as if it guaranteed the written SQL clause order.', 'Treating estimated cost percentages as actual elapsed-time percentages.', 'Capturing an actual plan with unrepresentative parameters and extrapolating.'],
      practices: ['Use Query Store to examine plan history and regressions.', 'Use representative parameters/data and protect captured plan artifacts.', 'Confirm a plan hypothesis with IO, TIME, waits, and end-to-end measurements.'],
      sources: [{ label: 'Microsoft Learn: Display and save execution plans', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/performance/display-and-save-execution-plans' }],
    }),
    sqlLesson({
      id: 'sql-common-errors-2601-2627-547-1205', title: 'Diagnose SQL Server Errors by Cause',
      what: 'SQL Server error numbers identify a failure category, but the constraint, statement, transaction state, and surrounding context explain the root cause. 2601 and 2627 indicate unique-key violations; 547 indicates a CHECK or FOREIGN KEY constraint conflict; 1205 means the transaction was selected as a deadlock victim.',
      why: 'Fixing the invariant or concurrency behavior is more reliable than memorizing numbers or retrying every database exception.',
      how: 'Capture structured exception number, constraint/index, operation, correlation ID, and safe parameter context. For 2601/2627, prevent conflicting writes or handle idempotent duplicate requests; for 547, correct parent/child order or business references; for 1205, inspect deadlock graph and retry only a safe whole transaction.',
      flow: ['Capture number and constraint/context', 'Classify violated invariant or concurrency event', 'Correct caller/data/transaction design', 'Retry only known transient safe operations'],
      example: 'A repeated import gets 2601/2627 on an idempotency key: treat the unique constraint as authoritative and return the already-created result where appropriate.',
      code: `try
{
    await repository.InsertAsync(entity, ct);
}
catch (SqlException ex) when (ex.Number is 2601 or 2627)
{
    // Only treat as idempotent success after verifying the conflicting key
    // represents this same request; otherwise propagate the conflict.
    var existing = await repository.FindByRequestKeyAsync(requestKey, ct);
    if (existing is null || existing.PayloadHash != payloadHash) throw;
}
// A 547 needs relationship/business correction; a 1205 needs graph diagnosis
// and at most a bounded retry of a safe database transaction.`,
      benefits: ['Cause-focused handling preserves database constraints and business semantics.', 'Structured errors improve diagnosis and safe recovery.'],
      costs: ['Exception classification must account for provider and constraint context.', 'Overly broad catches can hide data corruption or programming errors.'],
      use: 'Use targeted handling for known constraint conflicts and transient deadlock victims with verified idempotency.',
      avoid: 'Avoid retrying every SqlException, suppressing a foreign-key conflict, or using error number as the only diagnostic evidence.',
      questions: ['What do 2601/2627, 547, and 1205 broadly indicate?', 'Why can 2601/2627 require different caller behavior?', 'What should be captured with an error number?'],
      scenario: 'An import service floods retries after duplicate-key errors. Keep the unique key as the concurrency authority, look up and validate the existing request for idempotent replay, surface mismatches as conflicts, and diagnose 547/1205 independently.',
      diagram: [
        { label: '2601 / 2627', detail: 'Unique index or PRIMARY KEY / UNIQUE constraint conflict; verify duplicate request versus invalid conflict.' },
        { label: '547', detail: 'FOREIGN KEY or CHECK constraint conflict; correct relationship, order, or business input.' },
        { label: '1205', detail: 'Deadlock victim rollback; analyze graph and safe transaction retry policy.' },
        { label: 'Fix root cause', detail: 'Preserve constraints and handle only known, semantically safe outcomes.' },
      ],
      steps: ['Log the SQL exception number, constraint/index, statement context, and correlation ID without secrets.', 'For 2601/2627, determine whether the write is a legitimate idempotent replay or a true conflict.', 'For 547, inspect violated FK/CHECK invariant and transaction operation order.', 'For 1205, inspect deadlock graph and retry only a safe whole transaction with bounded policy.'],
      takeaways: ['2601/2627 are uniqueness conflicts; the constraint is protecting an invariant.', '547 is a constraint conflict, commonly FK or CHECK; fix relationship or input.', '1205 reports a deadlock victim, not a generic connection failure.', 'Error number plus constraint, operation, transaction state, and correlation gives actionable diagnosis.'],
      mistakes: ['Retrying unique-key violations as though they were transient outages.', 'Disabling constraints to bypass a 547 without repairing data integrity.', 'Treating every database exception as retryable or logging sensitive parameters.'],
      practices: ['Handle uniqueness conflicts according to idempotency and business semantics.', 'Keep FK/check/unique constraints as authoritative safeguards.', 'Use bounded retry only for classified transient failures.', 'Log safe structured diagnostics and preserve the original exception.'],
      sources: [{ label: 'Microsoft Learn: Database Engine events and errors', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/errors-events/database-engine-events-and-errors' }],
    }),
    sqlLesson({
      id: 'sql-stored-procedure-vs-function', title: 'Stored Procedure vs Function',
      what: 'A stored procedure is an executable database routine that can accept parameters, return result sets/output parameters, and perform data modifications. A function returns a scalar or table value and is designed to participate in expressions or FROM clauses, subject to SQL Server function restrictions.',
      why: 'The choice affects composability, side effects, result shape, permissions, and optimizer visibility. It is not simply “procedure is faster” or “function is reusable.”',
      how: 'Use procedures for command/workflow boundaries, transactional operations, and multiple result sets. Use inline table-valued functions for composable relational logic where appropriate; scalar and multi-statement functions have distinct optimizer/performance characteristics that require version-aware measurement.',
      flow: ['Identify command or composable expression', 'Choose routine contract and result shape', 'Respect function side-effect restrictions', 'Measure plan and operational ownership'],
      example: 'A transfer command belongs in a stored procedure; a reusable filtered customer rowset may be an inline table-valued function.',
      code: `CREATE OR ALTER PROCEDURE dbo.GetDepartmentEmployees
  @DepartmentId int
AS
BEGIN
  SET NOCOUNT ON;
  SELECT EmployeeId, Name
  FROM dbo.Employee
  WHERE DepartmentId = @DepartmentId;
END;

-- Inline TVF is composable as a table expression.
CREATE OR ALTER FUNCTION dbo.EmployeesInDepartment(@DepartmentId int)
RETURNS TABLE
AS
RETURN (
  SELECT EmployeeId, Name
  FROM dbo.Employee
  WHERE DepartmentId = @DepartmentId
);`,
      benefits: ['Procedures expose command-oriented behavior and multiple output channels.', 'Inline TVFs can compose relational logic into a caller query.'],
      costs: ['Database routines introduce deployment/versioning and ownership boundaries.', 'Function restrictions and scalar/multi-statement function performance vary by form and engine version.'],
      use: 'Use procedures for database commands and explicit operational APIs; use inline TVFs when composable set logic is useful and measured.',
      avoid: 'Avoid placing all business logic in opaque database code or assuming every function is inlined and equally performant.',
      questions: ['Which routine is naturally composable in FROM?', 'Can a stored procedure be used as a scalar expression?', 'Why distinguish inline from multi-statement TVFs?'],
      scenario: 'Several reports duplicate a department filter while a write workflow needs atomic multi-step behavior. Expose read logic through a measured inline TVF if composition helps, and keep the write workflow in a procedure or application transaction with clear ownership.',
      diagram: [
        { label: 'Stored procedure', detail: 'Command-oriented invocation; can return result sets and output values, with data modifications.' },
        { label: 'Function', detail: 'Returns scalar or table value and can participate in expressions/query clauses subject to restrictions.' },
        { label: 'Composition', detail: 'Inline TVF can be part of a relational query; procedure result sets are invoked separately.' },
        { label: 'Measure', detail: 'Evaluate optimizer behavior, permissions, deployment, and maintainability.' },
      ],
      steps: ['Determine whether the caller needs a command or a composable value.', 'Choose result contract and side-effect requirements.', 'Account for SQL Server function restrictions and inline versus multi-statement form.', 'Benchmark the calling query and document database code ownership.'],
      takeaways: ['Procedures are command routines; functions return values usable in expressions or table contexts.', 'Procedures can return multiple result sets; functions have stricter side-effect rules.', 'Inline and multi-statement table-valued functions have different optimization behavior.', 'Choose based on composition, transaction boundary, ownership, and measured performance.'],
      mistakes: ['Trying to call a procedure as if it were a scalar expression.', 'Assuming every function can modify arbitrary database state.', 'Assuming stored procedures are inherently faster than parameterized queries.'],
      practices: ['Use parameterized calls and explicit contracts.', 'Keep database routines versioned with the application schema.', 'Inspect actual plans for functions in real calling queries.', 'Grant least privilege and avoid dynamic SQL unless identifiers are safely validated.'],
      sources: [{ label: 'Microsoft Learn: Create user-defined functions', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/user-defined-functions/create-user-defined-functions-database-engine' }],
    }),
    sqlLesson({
      id: 'sql-concurrent-updates-same-row', title: 'Concurrent Updates to the Same Row',
      what: 'Concurrent writes to one row contend for locks or encounter optimistic concurrency conflicts. A later write may wait, overwrite earlier values, or fail based on transaction and application design.',
      why: 'A read-modify-write sequence can lose updates if application code calculates from stale data. Correctness requires atomic SQL operations, concurrency tokens, or an explicit serialization strategy.',
      how: 'Prefer atomic conditional updates such as Balance = Balance - @amount WHERE Balance >= @amount and check affected rows. In EF use a concurrency token/rowversion and handle DbUpdateConcurrencyException by reloading, merging, or rejecting. Keep transactions short.',
      flow: ['Two requests read state', 'Both compute writes', 'Database serializes or detects conflict', 'Application handles affected-row/conflict result'],
      example: 'An inventory decrement must never make stock negative; perform one conditional UPDATE and treat zero affected rows as unavailable or stale.',
      code: `UPDATE dbo.Inventory
SET Quantity = Quantity - @requested
WHERE ProductId = @productId
  AND Quantity >= @requested;

IF @@ROWCOUNT = 0
  THROW 50010, 'Insufficient stock or product not found.', 1;`,
      benefits: ['Atomic predicates prevent stale application reads from violating invariants.', 'Optimistic concurrency supports conflict detection without long-held read locks.'],
      costs: ['Conflicts require domain-specific retry, merge, or rejection behavior.', 'Pessimistic locking can reduce throughput when contention is high.'],
      use: 'Use conditional updates for simple invariants and rowversion/ETag-style optimistic concurrency for user-edited records.',
      avoid: 'Avoid silently overwriting stale state or retrying a business update without revalidating its preconditions.',
      questions: ['What is a lost update?', 'How does a rowversion concurrency token detect a stale write?', 'Why should affected row count be checked?'],
      scenario: 'Two shoppers attempt to buy the last item. Use a single conditional inventory decrement, commit order state atomically, treat zero affected rows as a domain conflict, and emit the order event through an outbox.',
      diagram: [
        { label: 'Read / intent', detail: 'Requests may observe the same initial value.' },
        { label: 'Atomic write', detail: 'Predicate and mutation execute together under database concurrency control.' },
        { label: 'Conflict signal', detail: 'Affected-row count or rowversion mismatch reveals stale/invalid state.' },
        { label: 'Domain response', detail: 'Reload, merge, reject, or bounded-retry only according to business rules.' },
      ],
      steps: ['Identify invariant and concurrent write pattern.', 'Express simple checks in the UPDATE predicate and update atomically.', 'Check affected rows or compare concurrency token.', 'Handle conflict as a domain outcome and keep external effects idempotent.'],
      takeaways: ['Read-modify-write in application memory can lose updates.', 'Atomic conditional SQL is effective for simple invariants.', 'Rowversion detects stale writes; it does not automatically resolve conflicts.', 'Check affected rows and make retry/merge semantics explicit.'],
      mistakes: ['Overwriting a row with a stale entity without concurrency checking.', 'Retrying stale writes blindly and reintroducing the same conflict.', 'Assuming a transaction alone prevents lost updates at every isolation level.'],
      practices: ['Use conditional updates or optimistic concurrency tokens.', 'Keep transactions short and handle conflict exceptions explicitly.', 'Use unique constraints and domain-level idempotency for concurrent requests.'],
    }),
    sqlLesson({
      id: 'sql-injection-prevention', title: 'Prevent SQL Injection',
      what: 'SQL injection occurs when untrusted input is concatenated into SQL syntax, allowing input to alter the intended command or predicate.',
      why: 'Injection can bypass authorization filters, expose or modify data, and execute unintended statements. Escaping ad hoc is fragile, especially for encoding, quoting, and multiple SQL dialect details.',
      how: 'Use parameterized commands so values are data, not executable syntax. For dynamic identifiers or sort directions that cannot be parameters, map input to a strict allowlist and quote validated identifiers. Apply least privilege and avoid returning raw database errors.',
      flow: ['Treat external input as untrusted', 'Bind values as typed parameters', 'Allowlist unavoidable identifiers', 'Limit DB privileges and validate behavior'],
      example: 'A search term is passed as a parameter; the chosen sort column is selected from a fixed server-side mapping.',
      code: `using var command = new SqlCommand(
    "SELECT UserId, DisplayName FROM dbo.Users WHERE Email = @email",
    connection);
command.Parameters.Add("@email", SqlDbType.NVarChar, 320).Value = email;

// For an identifier (not a value), select only from a server-side allowlist:
var sortColumn = sortKey switch
{
    "name" => "[DisplayName]",
    "created" => "[CreatedAt]",
    _ => "[UserId]"
};
var sql = $"SELECT UserId, DisplayName FROM dbo.Users ORDER BY {sortColumn}";`,
      benefits: ['Parameters separate data values from SQL code.', 'Allowlisting provides a safe finite vocabulary for dynamic identifiers.'],
      costs: ['Identifiers and SQL structure cannot generally be supplied as ordinary value parameters.', 'Dynamic query shapes need careful plan and authorization review.'],
      use: 'Use typed parameters for every untrusted value and strict allowlists for unavoidable structural choices.',
      avoid: 'Avoid string concatenation for values, blacklists, “escaping” as a substitute for parameters, and excessive database privileges.',
      questions: ['Why can a parameter represent a value but not a table name?', 'How should a dynamic ORDER BY column be selected?', 'Why is least privilege part of injection defense?'],
      scenario: 'A search endpoint accepts free text and a sort option. Bind search text, map sort options to fixed identifiers, restrict database principal permissions, and test adversarial inputs without exposing SQL or credentials.',
      diagram: [
        { label: 'Untrusted input', detail: 'HTTP values are data and must not become SQL syntax.' },
        { label: 'Typed parameter', detail: 'Driver sends the value separately from command text.' },
        { label: 'Allowlisted structure', detail: 'Dynamic column/table choices come only from an explicit server-side mapping.' },
        { label: 'Defense in depth', detail: 'Least privilege, validation, safe errors, and security tests limit impact.' },
      ],
      steps: ['Use parameterized APIs/ORM interpolation for all scalar values.', 'For identifiers or sort directions, map a finite enum to known SQL fragments.', 'Give the application DB identity only required permissions.', 'Test inputs containing quotes, comments, encodings, and unexpected sort keys; log safely.'],
      takeaways: ['Parameterized values are data, not SQL syntax.', 'Identifiers and keywords need server-side allowlists, not ordinary value parameters.', 'Escaping and input filtering are not substitutes for parameterization.', 'Least privilege and safe error handling reduce impact.'],
      mistakes: ['Interpolating user values into raw SQL strings.', 'Assuming an ORM makes manually constructed raw SQL safe.', 'Allowing user-provided table or column names without strict mapping.'],
      practices: ['Use typed parameters and ORM parameter APIs.', 'Keep dynamic query structure finite and allowlisted.', 'Use least-privilege database credentials and avoid leaking error details.', 'Review raw SQL and test injection boundaries.'],
      sources: [{ label: 'Microsoft Learn: SQL injection', url: 'https://learn.microsoft.com/en-us/sql/relational-databases/security/sql-injection' }],
    }),
    sqlLesson({
      id: 'sql-inner-vs-left-join', title: 'INNER JOIN vs LEFT JOIN',
      what: 'INNER JOIN returns rows with matching join keys on both sides. LEFT JOIN preserves every left-side row and returns NULLs for right-side columns when no match exists.',
      why: 'Join type encodes whether unmatched left entities matter. A predicate on the nullable right side in WHERE can remove unmatched rows and make a LEFT JOIN behave like an inner join for that predicate.',
      how: 'Put relationship matching in ON. Put right-side filters in ON when unmatched left rows must remain; put them in WHERE only when the result should exclude rows without a qualifying right match. Use COUNT(right.PrimaryKey), not COUNT(*), to count actual matches after an outer join.',
      flow: ['Choose preserved side', 'Match using ON keys', 'Inner join drops unmatched rows', 'Left join supplies NULL-extended rows', 'Apply filters with intended null semantics'],
      example: 'List all departments, including those with no employees, and count employee matches.',
      code: `SELECT d.DepartmentId, d.Name,
       COUNT(e.EmployeeId) AS EmployeeCount
FROM dbo.Department AS d
LEFT JOIN dbo.Employee AS e
  ON e.DepartmentId = d.DepartmentId
 AND e.IsActive = 1
GROUP BY d.DepartmentId, d.Name
ORDER BY d.DepartmentId;`,
      benefits: ['INNER JOIN returns only valid matches.', 'LEFT JOIN preserves the parent set for optional relationships and zero-count reporting.'],
      costs: ['Outer joins introduce NULLs and require correct aggregate/filter behavior.', 'Incorrect join keys or one-to-many cardinality can multiply output rows.'],
      use: 'Use LEFT JOIN when every left row must appear even if no right-side match exists.',
      avoid: 'Avoid moving right-side qualification into WHERE when unmatched left rows must remain; avoid joining without understanding cardinality.',
      questions: ['How does LEFT JOIN represent no match?', 'Why can a WHERE predicate on the right table remove unmatched rows?', 'Why count a nullable right-side key instead of COUNT(*)?'],
      scenario: 'A department report omits empty departments after an employee filter was added. Move the employee qualification into ON, count a non-nullable employee key, and verify one output row per department.',
      diagram: [
        { label: 'Left relation', detail: 'Rows from this side are preserved by LEFT JOIN.' },
        { label: 'ON match', detail: 'Match candidates on keys and any right-side condition that defines an eligible match.' },
        { label: 'INNER result', detail: 'Keep only matched pairs.' },
        { label: 'LEFT result', detail: 'Keep matches plus one NULL-extended right side for unmatched left rows.' },
        { label: 'WHERE / aggregate', detail: 'Apply filters with intended null behavior; count a right key to count matches.' },
      ],
      steps: ['Decide whether unmatched left rows belong in output.', 'Join using the relationship key in ON.', 'Put optional-side qualification in ON if left rows should remain.', 'Use COUNT(right-side key) for matched-row counts and inspect row multiplicity.'],
      takeaways: ['INNER JOIN drops rows without a match.', 'LEFT JOIN preserves left rows and supplies NULL right-side values.', 'A right-side WHERE condition can remove NULL-extended rows.', 'COUNT(*) counts the preserved row; COUNT(non-null right key) counts matches.'],
      mistakes: ['Filtering the nullable side in WHERE while expecting all left rows.', 'Using COUNT(*) to count matches after a LEFT JOIN.', 'Assuming a join produces one row per left entity without checking cardinality.'],
      practices: ['Write down which side must be preserved.', 'Keep match predicates in ON and reason about post-join WHERE separately.', 'Test unmatched rows, duplicate matches, and NULL join keys.'],
      sources: [{ label: 'Microsoft Learn: FROM and JOIN (Transact-SQL)', url: 'https://learn.microsoft.com/en-us/sql/t-sql/queries/from-transact-sql' }],
    }),
  ],
};
