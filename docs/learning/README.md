# Project Learning Guide

This folder is the **canonical learning source** for the project. Its scope is
the concepts in the workbook *Ultimate_30_Day_Senior_DotNET_AI_Engineer_Roadmap.xlsx*
and the detailed topic inventory formerly duplicated in
[TOPIC_TRACKER.md](../TOPIC_TRACKER.md). Each lesson uses simple explanations,
project context, trade-offs, a visual, and a reference.

The workbook's days are a suggested study sequence, not a requirement to add
every technology or pattern to production code. A concept must connect to this
project in one of three honest ways:

- **Implemented** — the linked code exists and is used now.
- **Planned** — a later feature key will make the concept real; snippets are
  labeled as proposed until implemented.
- **Project exercise** — the concept matters for learning but is not justified
  as production behavior. Use a small, chat-project-related exercise without
  adding an unnecessary runtime feature or dependency.

Do not mark a concept learned because code was generated or a page was read.
Explain the idea simply, trace its project example, and describe a limitation
or alternative first. The
[topic tracker](../TOPIC_TRACKER.md) records only study status; lesson content
and project evidence belong here.

## Modules

| Module | Coverage | Topics |
|---|---|---|
| [01 — C# language and types](module-01-csharp.md) | Workbook day 1; language fundamentals and data structures | T001–T010 |
| [02 — .NET runtime, async, and DI](module-02-dotnet-runtime.md) | Workbook days 4–5; runtime, HTTP, configuration, and lifetimes | T011–T020 |
| [03 — ASP.NET Core APIs](module-03-aspnet-core.md) | Workbook day 6; HTTP contracts and request pipeline | T021–T030 |
| [04 — AI and GenAI engineering](module-04-ai-engineering.md) | Workbook days 21–22; model integration and generation behavior | T031–T040 |
| [05 — SQL and EF Core](module-05-sql-efcore.md) | Workbook days 7–10 and SQL roadmap; data modeling and query performance | T041–T050 |
| [06 — Angular and TypeScript](module-06-angular.md) | Workbook days 13–16; browser client foundations | T051–T060 |
| [07 — Identity and API security](module-07-security.md) | Workbook day 11; OIDC, access control, and secure boundaries | T061–T070, T121–T122 |
| [08 — Testing and engineering workflow](module-08-quality.md) | Workbook day 12; tests, maintainability, and delivery | T071–T080 |
| [09 — RAG and responsible AI](module-09-rag.md) | Workbook days 23–24; grounded retrieval and data governance | T081–T090 |
| [10 — Azure and hosting](module-10-hosting.md) | Workbook days 17–18; delivery and cloud resource choices | T091–T100 |
| [11 — Reliability and distributed systems](module-11-reliability.md) | Workbook days 19–20 and 28; asynchronous work and operations | T101–T110 |
| [12 — Architecture and senior engineering](module-12-architecture.md) | Workbook days 2, 25–30; design, leadership, and capstone | T111–T120 |

Workbook days 2–3 are covered across Modules 1, 5, and 12. SQL topics that
extend beyond the tracker labels—CTEs, window functions, `EXISTS`, parameterized
queries, and SQL Server execution plans—are included in Module 5. The workbook's
interview-practice and learning-resource sheets are used throughout the
modules: use the official links first, then practice explaining the project
example aloud.

## Lesson standard

Every topic is taught, not just summarized. Use the expanded
[value types vs. reference types lesson](module-01-csharp.md) as the depth
example. Include:

1. A simple-language introduction before detailed terminology.
2. **What**, **why**, and **when** — with enough context to explain the idea
   without requiring an outside search.
3. **Limits** — trade-offs, common mistakes, and reasonable alternatives.
4. **Examples** — complete focused snippets for code concepts, with a short
   explanation of the important lines.
5. **Diagrams** — rendered Mermaid diagrams and a plain-text fallback for
   memory/request flows where useful.
6. **Project connection** — actual code, or an explicitly labeled proposal
   tied to a feature key.
7. **Practice** — questions or a small task, with answers or a self-check.
8. **References** — official documentation or primary technical sources.

Lessons describe what is implemented today separately from what is planned.
Production use is added only when it helps the chat product; a project
exercise is not a reason to create a needless feature. The worked examples
and self-checks throughout Modules 1–12 extend the topic summaries into
practice material. Mermaid diagrams include text fallbacks where a visual
flow is useful; not every concept needs a memory-layout illustration.

## Project sequence and evidence

Feature implementation order and acceptance criteria live in the
[project roadmap](../../PROJECT_ROADMAP.md). Each topic's lesson names the
feature key that will supply its project example. Implement the smallest
useful vertical slice, update the lesson to link to actual code, and only then
mark it as learned in the tracker.

The project currently has a .NET API, configured Ollama/OpenAI-compatible
adapters, exception handling, and development Swagger. Angular, authentication,
SQL persistence, automated tests, RAG, hosting, and operations are future
features. The presence of a lesson does not claim those features exist.

## Workbook and references

The workbook is the source for the 30-day study themes and SQL practice
sequence; this guide is the source for explanations and project mapping. For
official documentation, see Microsoft's [.NET documentation](https://learn.microsoft.com/dotnet/),
[ASP.NET Core documentation](https://learn.microsoft.com/aspnet/core/),
[EF Core documentation](https://learn.microsoft.com/ef/core/),
[SQL Server documentation](https://learn.microsoft.com/sql/),
the [Angular documentation](https://angular.dev/overview), and the
[Azure architecture center](https://learn.microsoft.com/azure/architecture/).
