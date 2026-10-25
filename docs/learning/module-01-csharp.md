# Module 01 — C# Language and Types

**Workbook alignment:** Day 1 (C# foundations), Day 2 (OOP/SOLID), Day 3
(collections/LINQ). Related tracker topics: T001–T010.

## T001 — Value types and reference types

- **What:** A value variable contains its value; a reference variable points to
  an object.
- **Why:** This explains copying, shared state, and why changing an object
  through one reference can be visible through another.
- **When:** Use value types for small values such as numbers and dates; use
  classes/records for objects with identity or larger data.
- **Limits:** A value type can still contain references; copying a reference
  does not clone the referenced object.
- **Diagram:** `int copy = independent value` · `class copy = second reference -> same object`
- **Project example (implemented):** `Result` is a reference-type record;
  nullable strings explicitly represent absent response data.
  [Result.cs](../../Responses/Result.cs)
  ```csharp
  public sealed record Result(int StatusCode, string? ErrorMessage, string? Data);
  ```
- **Reference:** [C# types](https://learn.microsoft.com/dotnet/csharp/fundamentals/types/)

## T002 — Nullable reference types and nullability flow

- **What:** Nullable annotations tell the compiler which references may be
  absent.
- **Why:** Configuration and provider responses can be missing; making absence
  explicit helps prevent null dereferences.
- **When:** Use `T?` for genuinely optional data and check it before use.
- **Limits:** Nullable analysis is compile-time assistance, not runtime
  validation of external JSON or configuration.
- **Diagram:** `external value -> null check -> safe use`
- **Project example (implemented):** the API result allows optional messages
  and successful data.
  [Result.cs](../../Responses/Result.cs)
  ```csharp
  string? ErrorMessage; // absence is part of the contract
  ```
- **Reference:** [Nullable reference types](https://learn.microsoft.com/dotnet/csharp/nullable-references)

## T003 — Records, classes, immutability, and equality

- **What:** A record is a data-oriented type with value equality; a class
  normally compares identity unless equality is customized.
- **Why:** Completion messages and API results are values, while services
  perform behavior.
- **When:** Prefer records for small data contracts; prefer classes for
  behavior, identity, or mutable lifecycles.
- **Limits:** Records are reference types by default, and their immutability is
  shallow. `sealed` prevents inheritance; it does not make an instance
  immutable.
- **Diagram:** `record data -> compare values` · `service class -> execute behavior`
- **Project example (implemented):** [AIMessage.cs](../../Services/AIMessage.cs)
  is a sealed record. It is sealed because provider variation uses an interface,
  not subclasses.
  ```csharp
  public sealed record AIMessage(string Role, string Content);
  ```
- **Reference:** [Records](https://learn.microsoft.com/dotnet/csharp/fundamentals/types/records)

## T004 — Generics, constraints, and variance

- **What:** Generics let a type or method work with a typed family of values;
  constraints restrict which types are valid.
- **Why:** They preserve compile-time types and avoid repeating similar logic
  for each data type.
- **When:** Use them for reusable collections, `Task<T>`, and genuinely
  reusable repository operations.
- **Limits:** A generic abstraction can obscure a simple feature. Variance
  (`in`/`out`) applies only to interfaces and delegates and has type-safety
  rules.
- **Diagram:** `T input -> reusable operation<T> -> T result`
- **Project example (implemented):** `Task<Result>` and
  `IOptions<OpenAIOptions>` are typed APIs. A generic repository is not added
  without a demonstrated persistence use case.
  [IChatApiService.cs](../../Services/IChatApiService.cs)
- **Reference:** [Generics](https://learn.microsoft.com/dotnet/csharp/fundamentals/types/generics)

## T005 — Delegates, events, and callbacks

- **What:** A delegate is a type-safe reference to a method; an event exposes
  notifications without giving subscribers control over invocation.
- **Why:** Callbacks let a component report a result or notification without
  owning the receiver's behavior.
- **When:** Use delegates for short behavior parameters and events for
  in-process publish/subscribe notifications with clear ownership.
- **Limits:** Events can retain subscribers and cause memory leaks or hidden
  control flow. They are not a replacement for a durable message queue.
- **Diagram:** `publisher -> event -> subscribers`
- **Project exercise (non-production):** no app event system is justified yet.
  Sketch `Action<AICompletion>` as a local notification around a chat response;
  durable background notifications belong to a queue feature, not a static
  event.
- **Reference:** [Delegates](https://learn.microsoft.com/dotnet/csharp/programming-guide/delegates/)

## T006 — Pattern matching and switch expressions

- **What:** Pattern matching selects behavior based on a value's type, shape,
  or state.
- **Why:** It can make a small set of known cases explicit and readable.
- **When:** Use it for finite domain outcomes, such as mapping provider states
  to safe API responses.
- **Limits:** Long nested switches often indicate responsibilities should be
  separated. Avoid replacing simple boolean logic with elaborate patterns.
- **Diagram:** `outcome -> case A / case B / default`
- **Project example (implemented):** the response flow uses exception type
  branches to map known provider failures.
  [ChatApiService.cs](../../Services/ChatApiService.cs)
  ```csharp
  catch (HttpRequestException exception) { /* map provider failure */ }
  ```
- **Reference:** [Pattern matching](https://learn.microsoft.com/dotnet/csharp/fundamentals/functional/pattern-matching)

## T007 — Exceptions and domain error modeling

- **What:** Exceptions report exceptional failures; expected outcomes should
  have an explicit result or validation representation.
- **Why:** Provider outages and malformed responses need safe, observable
  handling without exposing internal details.
- **When:** Catch errors where the application can add useful context or map
  them to a public outcome; let unexpected errors reach global handling.
- **Limits:** Broad catches can disguise programming defects. Do not turn a
  caller cancellation into a provider error.
- **Diagram:** `provider error -> log safe context -> 502/504 response`
- **Project example (implemented):** [ChatApiService.cs](../../Services/ChatApiService.cs)
  maps provider failures, while [ApiExceptionHandler.cs](../../Middleware/ApiExceptionHandler.cs)
  handles otherwise-unhandled exceptions.
- **Reference:** [Exception handling](https://learn.microsoft.com/dotnet/csharp/fundamentals/exceptions/)

## T008 — `IEnumerable<T>` vs. `IQueryable<T>`

- **What:** `IEnumerable<T>` iterates in application memory; `IQueryable<T>`
  builds an expression that a provider such as EF Core may translate to SQL.
- **Why:** Filtering in SQL can avoid loading an entire table into the API.
- **When:** Keep database filters on `IQueryable` until the query is complete;
  materialize at a deliberate boundary.
- **Limits:** Not every .NET method translates to SQL; deferred queries can
  surprise, and leaking `IQueryable` couples layers to EF.
- **Diagram:** `IQueryable -> SQL database filter -> rows` vs. `IEnumerable -> loaded rows -> memory filter`
- **Project example (planned — key105):** conversation-history queries will
  filter by owner and paginate in SQL before returning DTOs. No database query
  exists yet.
- **Reference:** [LINQ query execution](https://learn.microsoft.com/dotnet/csharp/linq/get-started/introduction-to-linq-queries)

## T009 — Collections: lists, dictionaries, sets, and queues

- **What:** Collections store groups of values with different lookup and
  ordering behaviors.
- **Why:** The correct collection makes intent clear and can improve lookup
  efficiency.
- **When:** Use lists for ordered sequences, dictionaries for keyed lookup,
  sets for uniqueness, and queues for FIFO work.
- **Limits:** In-memory collections are not durable shared storage; a queue
  collection is not a broker.
- **Diagram:** `ordered -> List` · `key -> Dictionary` · `unique -> HashSet` · `FIFO -> Queue`
- **Project example (implemented):** the selector receives all registered
  providers as `IEnumerable<IAICompletionProvider>` and finds the configured
  one.
  [AICompletionProviderSelector.cs](../../Services/AICompletionProviderSelector.cs)
- **Reference:** [Collections](https://learn.microsoft.com/dotnet/csharp/programming-guide/concepts/collections)

## T010 — `Span<T>`, `Memory<T>`, and allocation-aware APIs

- **What:** These types describe slices of memory without necessarily copying
  the underlying data.
- **Why:** They can reduce allocations in measured, high-throughput parsing or
  buffer-processing code.
- **When:** Use them when profiling identifies copying or allocation as a
  real bottleneck.
- **Limits:** They add lifetime and API complexity; `Span<T>` cannot cross
  `await` boundaries in ordinary code.
- **Diagram:** `buffer [start..end] -> view (no copied payload)`
- **Project exercise (non-production):** current chat traffic is not a measured
  memory bottleneck. Do not add spans to the API for appearance; compare
  parsing a representative request buffer with and without a copied slice.
- **Reference:** [Memory and span usage guidelines](https://learn.microsoft.com/dotnet/standard/memory-and-spans/)

## Workbook implementation connection

The workbook's practice asks for model equality/copy behavior (T001–T003),
composition and interfaces (T113), and collection/query behavior (T008–T009).
Only concepts with a product reason belong in runtime code. The project uses
provider interfaces and immutable request values now; SQL query concepts arrive
with conversation persistence in key105. Other items above are clearly marked
as non-production project exercises when production use is not justified.
