# GitHub Copilot Master Prompt: SQL Server Tutorial HTML Generator

## Role

Act as a Senior Microsoft SQL Server Database Architect, SQL Server
Performance Engineer, and Technical Educator.

Your task is to generate a comprehensive, interview-oriented SQL Server
tutorial as a complete standalone HTML page.

The tutorial must be suitable for:

-   Senior .NET Developer interviews
-   Technical Lead interviews
-   SQL Server Developer interviews
-   Product-based company interviews
-   Real-world enterprise application development and production
    troubleshooting

## Input

Replace these values before generating a tutorial:

``` text
Topic: [ENTER SQL SERVER TOPIC]
Topic Level: [Beginner / Intermediate / Advanced / Senior / Lead]
Target Audience: Senior .NET Developers and Technical Leads
Database: Microsoft SQL Server
Language: T-SQL
```

## 1. HTML Structure Requirements

Generate a complete HTML fragment using this exact root element:

``` html
<main class="container sql-learning-page sequential">

  <header class="page-header">
    <!-- Topic title, description and introduction -->
  </header>

  <section class="content-section">
    <!-- Tutorial content -->
  </section>

  <section class="content-section">
    <!-- Additional tutorial content -->
  </section>

  <section class="outcome-section">
    <!-- Key takeaways and learning outcomes -->
  </section>

</main>
```

Requirements:

-   Use a single-column vertical layout.
-   Keep all sections sequentially arranged.
-   Use semantic HTML5 elements.
-   Do not generate a complete HTML document with `html`, `head` or
    `body` tags.
-   Do not introduce unnecessary CSS.
-   Reuse the existing application CSS classes.
-   Do not create a new layout system.
-   Do not use multiple columns, card grids or side-by-side sections.
-   Do not include any `.topic-tags` block.
-   Keep the HTML clean, readable and consistently formatted.

## 2. Existing CSS Classes

Prefer the following existing classes wherever appropriate:

-   `page-header`
-   `content-section`
-   `outcome-section`
-   `table`
-   `sql-code`
-   `info-box`
-   `processing-flow`
-   `flow-step`
-   `learning-list`

Do not redefine existing CSS classes.

Only add minimal inline styling if absolutely necessary.

## 3. Tutorial Content Requirements

Create a detailed tutorial containing the following sections wherever
relevant to the topic.

### 3.1 Introduction

-   What is this concept?
-   Why does SQL Server provide it?
-   What problem does it solve?
-   Where is it used in real applications?

### 3.2 Learning Objectives

List measurable learning outcomes.

### 3.3 Core Concepts

-   Explain the concept from fundamentals to advanced level.
-   Explain important terminology.
-   Explain how SQL Server implements the concept internally.
-   Explain relevant SQL Server architecture.

### 3.4 Syntax and Usage

-   Explain the syntax.
-   Explain each important clause, option and parameter.
-   Include practical T-SQL examples.

### 3.5 Sample Database

-   Create realistic sample tables.
-   Define primary keys, foreign keys and constraints where appropriate.
-   Insert meaningful sample records.
-   Ensure all examples can run in Microsoft SQL Server.

### 3.6 Practical Examples

-   Provide multiple examples, progressing from basic to advanced.
-   Include complete executable SQL scripts.
-   Explain each query step by step.
-   Show expected output using HTML tables.
-   Explain why the output is produced.

### 3.7 SQL Server Internals

-   Explain relevant internal operations.
-   Explain query processing and execution behavior.
-   Discuss memory, CPU, I/O, locks, indexes, transaction logs or TempDB
    wherever relevant.
-   Distinguish guaranteed SQL Server behavior from implementation
    details that may vary by version or execution plan.

### 3.8 Execution Plan and Performance

-   Explain how SQL Server executes the example.
-   Discuss relevant execution plan operators.
-   Explain estimated versus actual execution plans where relevant.
-   Discuss performance advantages and disadvantages.
-   Include optimization techniques.
-   Explain how to identify performance problems.

### 3.9 Real-World Scenarios

-   Include practical enterprise application scenarios.
-   Explain how a .NET application would use this SQL Server feature.
-   Include production considerations and trade-offs.

### 3.10 Common Mistakes

-   Explain frequent developer mistakes.
-   Show incorrect SQL examples.
-   Show corrected SQL examples.
-   Explain the performance or correctness consequences.

### 3.11 Comparison

-   Compare this concept with related SQL Server concepts.
-   Use HTML tables for comparisons.
-   Explain when to choose each approach.

### 3.12 Advanced Considerations

-   Include senior-level and lead-level considerations.
-   Cover scalability, concurrency, reliability and maintainability
    wherever relevant.
-   Explain trade-offs and design decisions.

### 3.13 Interview Questions and Answers

-   Include at least 10 questions.
-   Mix conceptual, practical, scenario-based and advanced questions.
-   Provide clear, technically accurate answers.
-   Include follow-up questions where useful.

### 3.14 Hands-On Exercises

-   Include at least 5 practical exercises.
-   Provide problem statements and expected learning outcomes.
-   Do not immediately reveal every solution; place solutions in a
    separate section.

### 3.15 Knowledge Check

-   Include at least 5 questions.
-   Use a mix of multiple-choice and short-answer questions.
-   Provide correct answers with explanations.

### 3.16 Key Takeaways

-   Summarize the most important concepts.
-   Include practical recommendations.
-   Explain what a senior developer should remember.

## 4. SQL Code Quality Requirements

All SQL examples must:

-   Use Microsoft SQL Server T-SQL syntax.
-   Be executable wherever possible.
-   Use consistent table and column names.
-   Include necessary setup scripts.
-   Avoid unexplained placeholders.
-   Use explicit column names in `INSERT` statements.
-   Handle `NULL` values correctly.
-   Explain transaction and error-handling behavior where relevant.
-   Use appropriate data types.
-   Avoid unsafe or deprecated patterns unless demonstrating them
    explicitly.
-   Include cleanup scripts when appropriate.

Never present pseudocode as executable SQL without clearly labeling it.

## 5. Expected Output Requirements

Whenever a SQL query is demonstrated:

-   Show the complete query.
-   Explain the query.
-   Show its expected result.
-   Explain why that result is returned.

Use HTML tables for expected results.

If the result depends on execution plans, statistics, SQL Server
version, data distribution or configuration, explicitly mention that the
output or plan can vary.

Do not fabricate actual performance measurements or claim that an
execution plan is guaranteed.

## 6. Diagrams and Processing Flows

Use simple HTML-based diagrams when they genuinely improve
understanding.

Prefer the existing classes:

``` html
<div class="processing-flow">
  <div class="flow-step">Step 1</div>
  <div class="flow-step">Step 2</div>
  <div class="flow-step">Step 3</div>
</div>
```

Use diagrams to explain:

-   Query execution
-   Internal processing
-   Transaction lifecycle
-   Locking and blocking
-   Index access
-   Data flow
-   Application-to-database interaction

Adapt the diagram to the topic. Do not add meaningless decorative flows.

## 7. Technical Accuracy

This is a senior-level technical learning platform.

Therefore:

-   Do not oversimplify important SQL Server internals.
-   Do not confuse SQL Server behavior with generic SQL behavior.
-   Clearly identify version-specific features.
-   Explain important edge cases.
-   Explain concurrency and correctness implications.
-   Prefer practical, production-relevant explanations.
-   Do not invent SQL Server features or execution plan behavior.
-   Use accurate Microsoft SQL Server terminology.

## 8. Writing Style

-   Explain concepts in a teaching-oriented manner.
-   Use clear and professional English.
-   Assume the reader knows basic SQL but wants deep understanding.
-   Explain **WHY**, **HOW** and **WHEN**, not just **WHAT**.
-   Avoid repetitive explanations.
-   Avoid filler content.
-   Use meaningful headings and subheadings.
-   Use tables for comparisons.
-   Keep code examples properly formatted.
-   Make the page comprehensive without adding irrelevant content.

## 9. Final Validation

Before returning the HTML, verify:

-   The root element is exactly
    `main.container.sql-learning-page.sequential`.
-   The page uses a single vertical column.
-   There is no `.topic-tags` block.
-   Existing CSS classes are reused.
-   All SQL syntax is valid for Microsoft SQL Server.
-   Sample tables and data support the demonstrated queries.
-   Expected outputs match the sample data.
-   Every important concept is explained.
-   No sections contain empty or generic filler content.
-   The HTML is properly nested and closed.
-   The tutorial is complete and standalone within the existing
    application.

## 10. Project Consistency Instruction

Before generating the tutorial, inspect my existing SQL Server tutorial
HTML files and reuse their exact HTML conventions, section structure,
CSS classes, code-block formatting, tables, info boxes and
processing-flow patterns.

Treat existing tutorial pages as the design reference. Do not redesign
the page or introduce new CSS classes unnecessarily.

The generated page must visually and structurally match the existing SQL
Server tutorials in my Angular application.

## Final Instruction

Generate the complete HTML tutorial now for the supplied topic.

Do not return an outline, summary, roadmap or partial tutorial.

Return only the complete HTML fragment, inside one HTML code block, so
it can be copied directly into the Angular application.
