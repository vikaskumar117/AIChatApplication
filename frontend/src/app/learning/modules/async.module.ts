import { LearningModule, topic } from '../learning.models';

const visual = (
  diagram: { label: string; detail: string }[],
  exampleSteps: string[],
  keyTakeaways: string[],
  commonMistakes: string[],
  bestPractices: string[],
  summary: string,
) => ({ diagram, diagramNote: 'Follow each labeled stage to see the concrete scheduling, ownership, or memory effect.', exampleSteps, keyTakeaways, commonMistakes, bestPractices, summary });

const asyncSources = [
  { label: 'Microsoft Learn: Asynchronous programming scenarios', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/' },
  { label: 'Microsoft Learn: Asynchronous programming with async and await', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/async-scenarios' },
];

export const asyncModule: LearningModule = {
  id: 'dotnet-async-memory',
  title: 'Async Programming, Tasks, Threads & Memory',
  description: 'Design scalable asynchronous code, protect shared state, and diagnose managed-memory and resource-lifetime problems.',
  topics: [
    topic('async-vs-sync', 'Asynchronous vs Synchronous Work', 'Very High',
      'Synchronous calls wait inline; asynchronous operations let the caller make progress while an operation is pending.',
      [
        'Synchronous execution runs a call and does not continue until it returns. Asynchronous APIs represent incomplete work and allow a method to suspend and later observe its completion.',
        'Async is valuable for latency-bound work such as network, file, and database I/O because a waiting request need not occupy a worker thread. It does not make the underlying operation faster and is not automatically beneficial for tiny CPU work.',
        'Use true asynchronous I/O APIs end-to-end, await their results, and propagate cancellation. For CPU-bound work, optimize or schedule bounded computation rather than wrapping it in async syntax by default.',
      ],
      ['Start operation', 'Synchronous caller blocks or async caller yields', 'Continue after completion'],
      'A web request awaits a database query so the worker can serve other requests while the database responds.',
      `// Synchronous wait occupies the caller:
var text = client.GetStringAsync(url).GetAwaiter().GetResult();

// Asynchronous wait yields while I/O is pending:
var asyncText = await client.GetStringAsync(url, cancellationToken);`,
      [['Improves I/O concurrency and responsiveness', 'Cancellation and composition are explicit'], ['Adds state-machine and task overhead', 'Does not reduce dependency latency or CPU cost']],
      ['Use async APIs for naturally asynchronous I/O and keep the call chain async.', 'Avoid sync-over-async and async wrappers around already synchronous tiny operations.'],
      ['Does async mean parallel?', 'Why can async improve server throughput?', 'Does await make a database query faster?'],
      'A highly concurrent API spends most time waiting on downstream I/O. Use async drivers and cancellation, then measure queueing and latency rather than adding threads.',
      asyncSources,
      visual(
        [{ label: 'I/O request begins', detail: 'The client starts a database or network operation that may take time.' }, { label: 'Synchronous path', detail: 'Caller remains blocked and cannot serve other work.' }, { label: 'Asynchronous path', detail: 'Caller awaits a Task and yields its execution opportunity while I/O is pending.' }, { label: 'Completion observed', detail: 'Continuation reads result or handles exception after completion.' }],
        ['Compare synchronous blocking with awaiting the same I/O operation.', 'Pass cancellation to the asynchronous API.', 'Handle the result only after completion.'],
        ['Async primarily improves waiting efficiency.', 'Async does not imply a new thread or parallel execution.', 'The operation’s actual latency may be unchanged.'],
        ['Using Task.Run around asynchronous I/O.', 'Assuming async alone makes CPU-bound code faster.'],
        ['Propagate async through API boundaries.', 'Pass cancellation and set sensible timeouts.', 'Measure throughput, latency, and resource use.'],
        'Async lets a caller yield during incomplete operations; it improves responsiveness and I/O scalability, not intrinsic operation speed.',
      )),

    topic('async-internals', 'What Happens Inside an Async Method', 'Very High',
      'An async method runs synchronously until it reaches an incomplete awaitable, then returns control and resumes later.',
      [
        'A Task is a representation of future completion, result, cancellation, or failure. Await registers a continuation—the remaining method work to run after completion—rather than blocking the current thread.',
        'The compiler and runtime coordinate suspension so a waiting thread can do other work. If the awaited operation is already complete, execution may continue synchronously without a suspension.',
        'The runtime schedules or invokes the continuation according to the awaiter and captured context/scheduler. I/O completion often uses operating-system completion mechanisms; it does not require one thread per waiting request.',
      ],
      ['Run method prefix', 'Await incomplete operation and return Task', 'Resume continuation after completion'],
      'LoadAsync begins the request immediately, returns its Task when the HTTP operation is pending, then completes with the response after resumption.',
      `static async Task<string> LoadAsync(HttpClient client, CancellationToken token)
{
    var response = await client.GetStringAsync("/status", token);
    return response;
}`,
      [['Threads are not tied up for asynchronous waits', 'Tasks compose completion and failure'], ['Continuation scheduling adds complexity', 'Blocking can consume the scalability benefit']],
      ['Think of await as registering remaining work, not starting a thread.', 'Avoid blocking the Task in request or UI paths.'],
      ['What is a continuation?', 'Does an incomplete await always suspend?', 'Does every asynchronous operation use a thread?'],
      'An endpoint performs multiple slow I/O calls. Await the actual asynchronous provider operations and observe continuation delays separately from dependency latency.',
      asyncSources,
      visual(
        [{ label: 'Synchronous prefix', detail: 'The method executes normally until the first await whose operation is incomplete.' }, { label: 'Task returned', detail: 'The caller receives a representation of eventual completion while the method is suspended.' }, { label: 'I/O completes', detail: 'The external operation signals completion without occupying a waiting worker.' }, { label: 'Continuation resumes', detail: 'The remainder runs on the applicable context or scheduler and completes the Task.' }],
        ['Invoke LoadAsync and note that its prefix starts immediately.', 'When the HTTP task is incomplete, the method returns its Task.', 'After response completion, read the result and complete LoadAsync.'],
        ['Await composes completion without blocking.', 'Already-completed awaits may continue inline.', 'Task represents lifecycle and outcome, not a thread.'],
        ['Assuming calling an async method queues all its code.', 'Assuming every continuation runs on a dedicated thread.'],
        ['Observe and await returned tasks.', 'Use true async I/O.', 'Trace queueing and continuation latency under load.'],
        'Async execution runs until an incomplete await, returns a Task, and resumes its continuation when the awaited operation completes.',
      )),

    topic('task-vs-thread', 'Task vs Thread', 'Very High',
      'A Task models an operation’s completion and outcome; a Thread is an operating-system execution resource.',
      [
        'A Task can represent a result, exception, or cancellation and can complete without owning a dedicated thread, as with asynchronous I/O. A Thread is an execution path with its own stack and scheduling cost.',
        'Tasks are easier to compose, await, cancel cooperatively, and aggregate. Threads are useful for specialized long-lived or low-level execution requirements but are expensive to create and manage directly.',
        'Await Tasks for operation completion. Do not equate Task count with thread count; a Task may use a pool worker while running, or no worker while an I/O operation is pending.',
      ],
      ['Represent operation as Task', 'Use worker thread only while code executes', 'Observe result independently of thread identity'],
      'A File.ReadAllTextAsync task represents a read that can be pending without dedicating a thread to wait for disk completion.',
      `Task<string> read = File.ReadAllTextAsync(path, cancellationToken);
string contents = await read;

// A dedicated thread is explicit and usually unnecessary for ordinary work:
var thread = new Thread(() => Console.WriteLine("worker"));
thread.Start();
thread.Join();`,
      [['Tasks compose naturally with async APIs', 'Thread pools reuse workers'], ['Dedicated threads consume stack and scheduling resources', 'A task does not guarantee parallelism']],
      ['Use Task-based APIs for normal asynchronous work and Thread only for justified low-level control.', 'Avoid creating one dedicated thread per request or task.'],
      ['Can a Task exist without a worker thread?', 'What does a thread provide?', 'Does awaiting a Task guarantee execution on another thread?'],
      'A server creates a new Thread for each incoming operation and exhausts resources. Replace ordinary I/O waits with async Tasks and bound CPU parallelism separately.',
      asyncSources,
      visual(
        [{ label: 'Task abstraction', detail: 'Tracks operation completion, result, exception, and cancellation.' }, { label: 'I/O pending', detail: 'Task remains incomplete while no worker thread needs to wait for the device.' }, { label: 'Thread execution', detail: 'A thread supplies an execution stack while synchronous instructions are running.' }, { label: 'Await outcome', detail: 'Caller composes Task completion without owning a thread.' }],
        ['Start an asynchronous file read and keep its Task.', 'Await the Task to get the content.', 'Contrast with explicitly constructing and joining a dedicated Thread.'],
        ['Task is an operation abstraction, not a thread wrapper.', 'Threads are scarce execution resources.', 'I/O Tasks may spend most of their lifetime without a worker.'],
        ['Assuming every Task creates a thread.', 'Creating dedicated threads for routine network waits.'],
        ['Prefer Task and async APIs for composable work.', 'Use dedicated threads only for requirements that justify lifecycle control.', 'Bound CPU work.'],
        'Tasks represent outcomes and compose operations; threads execute instructions and are not allocated one-for-one to Tasks.',
      )),

    topic('task-vs-task-run', 'Task vs Task.Run', 'High',
      'Task represents work or completion; Task.Run schedules a delegate on the thread pool.',
      [
        'A Task is a general awaitable handle. Task.Run queues synchronous CPU-bound work to a pool worker and returns a Task for that delegate’s completion.',
        'Task.Run can keep a UI thread responsive or isolate bounded CPU work, but it does not make blocking I/O scalable and adds scheduling overhead. On server request threads it can worsen pool pressure.',
        'Call asynchronous I/O APIs directly and await them. Use Task.Run only when a synchronous CPU operation must move off a responsive thread or when deliberate scheduling is part of the design.',
      ],
      ['Choose the actual operation', 'Await native async I/O or schedule CPU delegate', 'Observe completion and cancellation'],
      'ReadAsync should be awaited directly; a substantial CPU-only image transform may be scheduled with Task.Run from a UI event handler.',
      `var contents = await File.ReadAllTextAsync(path, token); // direct async I/O
var digest = await Task.Run(() => ComputeDigest(contents), token); // CPU-bound delegate`,
      [['Task composes any supported completion', 'Task.Run protects a responsive caller from CPU work'], ['Unnecessary scheduling overhead', 'Blocking on pool workers can cause starvation']],
      ['Use Task.Run selectively for CPU-bound work that benefits from offloading.', 'Avoid wrapping native async I/O or every service method in Task.Run.'],
      ['What does Task.Run schedule?', 'Why not wrap HTTP calls in Task.Run?', 'When could Task.Run help a UI?'],
      'A Web API wraps database queries in Task.Run. Remove the wrapper, use the provider’s asynchronous I/O, and separately cap expensive CPU transformations.',
      asyncSources,
      visual(
        [{ label: 'I/O-bound operation', detail: 'Native ReadAllTextAsync yields while the filesystem operation completes.' }, { label: 'CPU-bound delegate', detail: 'ComputeDigest consumes CPU and may be scheduled on a worker.' }, { label: 'Task.Run', detail: 'Queues the synchronous delegate; it does not convert an operation into true async I/O.' }, { label: 'Await result', detail: 'Caller observes completion, errors, or cancellation.' }],
        ['Await native asynchronous file reading directly.', 'Schedule only the CPU-intensive digest when offloading is appropriate.', 'Await both tasks and propagate cancellation.'],
        ['Task is the completion abstraction; Task.Run is a scheduling API.', 'I/O async frees a worker while waiting.', 'Task.Run uses finite thread-pool capacity.'],
        ['Wrapping an already-asynchronous HTTP/database call in Task.Run.', 'Using Task.Run to hide blocking work on a saturated server.'],
        ['Classify work as I/O-bound or CPU-bound first.', 'Bound expensive parallel CPU tasks.', 'Measure end-to-end latency and pool queueing.'],
        'Task.Run schedules synchronous delegate work on the pool; it is not a general-purpose async wrapper.',
      )),

    topic('async-await', 'Compiler State Machine and Await', 'Very High',
      'The compiler transforms an async method into a state machine that stores progress across suspension points.',
      [
        'A state machine is generated logic with a state value and fields for locals that must survive an await. An awaiter reports completion and registers the continuation.',
        'The transformation enables sequential-looking code to resume later without keeping a thread blocked. It can allocate or retain state, especially for incomplete awaits, so async is not free.',
        'At each await the method checks completion; if incomplete, it saves state, arranges continuation, and returns. On resumption it retrieves the result, which may throw the awaited operation’s exception, and proceeds.',
      ],
      ['Execute until await', 'Save live locals and continuation state', 'Resume at state and observe awaited result'],
      'A local value used after an HTTP await must be available to the continuation, so generated state captures what is needed.',
      `static async Task<int> ReadLengthAsync(HttpClient client, CancellationToken token)
{
    int multiplier = 2;
    string body = await client.GetStringAsync("/data", token);
    return body.Length * multiplier;
}`,
      [['Readable sequential control flow', 'No blocked worker during incomplete await'], ['State and continuation have overhead', 'Captured locals can extend object lifetimes']],
      ['Await returned asynchronous operations and keep state lifetimes short.', 'Avoid unnecessary async state machines when a method only returns an existing Task and needs no transformation.'],
      ['What is stored in the generated state machine?', 'What does the awaiter do?', 'When can await continue synchronously?'],
      'A high-volume parser’s allocation profile shows many tiny completed async operations. Preserve async where needed for composition; optimize measured hot paths without losing exception or cancellation semantics.',
      asyncSources,
      visual(
        [{ label: 'Initial state', detail: 'Generated method begins executing ordinary code and stores its current state.' }, { label: 'Awaiter check', detail: 'Completed operation proceeds inline; incomplete operation requires suspension.' }, { label: 'Saved continuation', detail: 'State and locals needed after await are retained for later execution.' }, { label: 'Resumption', detail: 'Awaiter supplies the result or exception and state machine continues.' }],
        ['Set multiplier before the await.', 'If the HTTP Task is incomplete, preserve multiplier and continuation state.', 'Resume, obtain body, then calculate the result.'],
        ['State machines preserve method progress across awaits.', 'Only values needed after suspension must remain live.', 'Awaiting an already-completed Task may avoid a suspension.'],
        ['Assuming one thread remains parked with the local stack.', 'Capturing large object graphs across long waits unnecessarily.'],
        ['Keep async methods composable and cancellation-aware.', 'Minimize long-lived references across awaits.', 'Profile before removing async/await for micro-optimization.'],
        'The compiler-generated state machine saves the necessary state at incomplete awaits and resumes through an awaiter continuation.',
      )),

    topic('task-whenall-whenany', 'Task.WhenAll vs Task.WhenAny', 'High',
      'WhenAll completes after all supplied tasks complete; WhenAny completes when one task completes.',
      [
        'WhenAll is a join over a set of operations: its task completes when every input task reaches a terminal state. WhenAny returns the first completed Task, not its result value.',
        'Parallelizing independent I/O can reduce aggregate latency, while racing alternatives can reduce time to first result. Both patterns require explicit cancellation and cleanup for work that continues.',
        'Await WhenAll to retrieve results in input order and observe failures. After WhenAny, await the returned task to observe its result; cancel or drain losing operations when appropriate.',
      ],
      ['Start independent operations', 'Join all or select first completion', 'Observe all results and handle remaining work'],
      'Load independent profile and permissions concurrently with WhenAll; use WhenAny only when whichever endpoint responds first is acceptable and the loser is canceled or drained.',
      `Task<string> profile = LoadProfileAsync(token);
Task<string> flags = LoadFlagsAsync(token);
string[] results = await Task.WhenAll(profile, flags);

Task<string> first = await Task.WhenAny(profile, flags);
string firstResult = await first;`,
      [['Concurrent independent work can reduce wait time', 'WhenAny supports race and fallback patterns'], ['Failures and cancellation require explicit policy', 'Losing tasks may continue consuming resources']],
      ['Use WhenAll for independent work that must all succeed or be accounted for.', 'Avoid unbounded fan-out and abandoning WhenAny losers.'],
      ['Does WhenAny return the result?', 'How are WhenAll results ordered?', 'What should happen to losing tasks after a race?'],
      'A dashboard loads independent data sources. Use bounded concurrency and WhenAll if all sections are mandatory; otherwise define timeout, fallback, and loser cancellation policy.',
      asyncSources,
      visual(
        [{ label: 'Start independent tasks', detail: 'Both operations begin before awaiting, enabling overlap.' }, { label: 'WhenAll join', detail: 'Completion waits for every input task and preserves input order for results.' }, { label: 'WhenAny race', detail: 'Completion identifies the first finished Task, not its result.' }, { label: 'Cleanup remaining work', detail: 'Cancel, observe, or intentionally allow other tasks to finish.' }],
        ['Start profile and flags tasks before awaiting either.', 'Use WhenAll when both results are required.', 'Alternatively await WhenAny and then await the returned task for its result.'],
        ['WhenAll joins every task.', 'WhenAny returns a completed Task.', 'Concurrency requires bounded fan-out and explicit loser policy.'],
        ['Starting one task, awaiting it, then starting the next and expecting overlap.', 'Discarding tasks that lost a WhenAny race without observing errors.'],
        ['Propagate cancellation tokens.', 'Bound concurrent operations.', 'Define partial failure and timeout behavior.'],
        'WhenAll joins all operations; WhenAny selects a completed task, while the caller remains responsible for all outcomes and cleanup.',
      )),

    topic('async-without-await', 'Async Methods Without Await', 'High',
      'An async method with no await runs synchronously and may add a redundant state machine or task wrapper.',
      [
        'The async modifier enables await and compiler transformation. Without an await, no suspension can occur inside that method; the body executes synchronously before returning its completed result or faulted task.',
        'Keeping async without await often produces a compiler warning and unnecessary state-machine machinery. It can still be intentional when the method must convert synchronous exceptions into a faulted Task consistently with an asynchronous contract.',
        'If simply forwarding a Task, remove async and return it directly. If constructing a result synchronously, return Task.FromResult or ValueTask only when semantics and API contract support it.',
      ],
      ['Execute method synchronously', 'Return completed or faulted Task', 'Remove wrapper when forwarding existing Task'],
      'A method that only returns repository.LoadAsync can return that Task directly; retaining async/await adds no behavior.',
      `// Redundant wrapper:
async Task<Customer?> FindAsync(Guid id) => await repository.FindAsync(id);

// Direct forwarding:
Task<Customer?> FindAsync(Guid id) => repository.FindAsync(id);`,
      [['Direct forwarding avoids needless state-machine work', 'Consistent async contract may be valuable'], ['Synchronous exceptions may escape differently', 'Removing async can change stack traces and exception timing']],
      ['Return a Task directly when truly forwarding without transformation.', 'Keep async when adding await-specific cleanup, exception conversion, or multiple sequential asynchronous steps.'],
      ['What happens to code in async without await?', 'How does direct forwarding affect synchronous exceptions?', 'When is retaining async intentional?'],
      'A repository wrapper merely forwards a Task. Remove the redundant async modifier only after verifying callers and tests accept exception timing and stack-trace behavior.',
      asyncSources,
      visual(
        [{ label: 'No await point', detail: 'Method has no suspension site and executes its body synchronously.' }, { label: 'Completed task result', detail: 'The async wrapper packages a synchronous result or exception in a Task.' }, { label: 'Direct forwarding', detail: 'Returning the existing Task avoids an extra wrapper state machine.' }],
        ['Inspect whether the body has any await or transformation.', 'Return the repository Task directly if forwarding only.', 'Retain async if local catch/finally or exception semantics are required.'],
        ['async without await is not asynchronous suspension.', 'Direct forwarding may alter synchronous exception timing.', 'Compiler warnings are useful signals, not automatic refactoring rules.'],
        ['Removing async without checking exception behavior.', 'Using Task.Run merely to make a synchronous body appear asynchronous.'],
        ['Keep method semantics consistent with its contract.', 'Use Task.FromResult for truly synchronous results when useful.', 'Test both successful and failing paths after refactoring.'],
        'Without await an async method runs synchronously; direct Task forwarding is simpler unless async exception or cleanup semantics are needed.',
      )),

    topic('unawaited-async', 'Consequences of an Unawaited Async Call', 'Very High',
      'An unawaited Task is unobserved by the caller: the operation still runs, but ordering, errors, and completion are no longer coordinated.',
      [
        'Calling an async Task-returning method starts it and returns its Task. If the caller discards that Task, it cannot reliably know when work finished or observe its failure.',
        'Fire-and-forget work can outlive request scopes, lose cancellation, fail after a response succeeded, or disappear during process shutdown. async void is even less observable and should be reserved for event handlers.',
        'Await the Task, return it to a caller, or transfer ownership to a durable background-work system that captures errors, retries safely, and manages shutdown.',
      ],
      ['Invoke operation', 'Retain and observe Task or discard it', 'Handle completion and failure deliberately'],
      'Do not start order persistence and return success before it completes; await it or enqueue durable work with an acknowledged status.',
      `// Dangerous: task and exception are discarded
SaveOrderAsync(order, token);

// Request-owned work:
await SaveOrderAsync(order, token);

// Deliberate background ownership requires a queue/worker, not a naked call.`,
      [['Awaiting propagates errors and sequencing', 'Durable queues provide explicit background ownership'], ['Discarded tasks can fail silently', 'Request-scoped dependencies may be disposed too early']],
      ['Await or return Task from all request-owned work.', 'Avoid naked fire-and-forget tasks and async void outside event handlers.'],
      ['Does an unawaited Task stop running?', 'When might its exception become visible?', 'How should durable background work be started?'],
      'A request must send an email after accepting an order. Persist an outbox message transactionally and let a monitored worker deliver it rather than discarding SendAsync.',
      asyncSources,
      visual(
        [{ label: 'Task starts', detail: 'Calling an async method starts its synchronous prefix and produces a Task.' }, { label: 'Task discarded', detail: 'Caller loses completion, ordering, cancellation, and direct exception observation.' }, { label: 'Failure or shutdown', detail: 'Work can fault after the response or be interrupted when process ends.' }, { label: 'Owned background work', detail: 'Queue and worker provide monitoring, retry, and shutdown policy.' }],
        ['Compare a naked SaveOrderAsync call with awaiting it.', 'Observe that await propagates completion and failure.', 'Move truly durable background work to an owned queue.'],
        ['Unawaited Task does not mean work never starts.', 'Discarding a Task discards coordination and observation.', 'Fire-and-forget is an ownership decision, not a syntax trick.'],
        ['Launching background work from a request with scoped dependencies.', 'Using async void to hide missing Task ownership.', 'Assuming process shutdown waits for outstanding work.'],
        ['Await request-owned work.', 'Capture background work in a durable queue when required.', 'Log, retry, cancel, and drain work deliberately.'],
        'Unawaited asynchronous work continues independently but loses reliable completion and failure handling; establish explicit ownership.',
      )),

    topic('thread-pool', '.NET Thread Pool', 'High',
      'The thread pool reuses worker threads for short-running work and coordinates queued callbacks and continuations.',
      [
        'A worker thread executes scheduled code; a work queue holds work until a worker can run it. The pool dynamically adjusts worker availability but is finite and shared by many runtime components.',
        'Reusing workers avoids the cost of creating a dedicated thread for every operation. Blocking workers reduces available capacity and can delay unrelated requests, timers, and continuations.',
        'Use asynchronous I/O to avoid occupying workers while waiting, bound CPU parallelism, and inspect runtime counters for queue length, thread count, and completed work.',
      ],
      ['Queue work item', 'Available worker executes instructions', 'Worker returns to pool for reuse'],
      'Task.Run schedules CPU work onto pool capacity; asynchronous network waiting does not need a worker parked for the whole wait.',
      `await Task.Run(() => CalculateReport(input), cancellationToken);
await httpClient.GetAsync(url, cancellationToken); // async wait, no worker blocked for duration`,
      [['Worker reuse reduces thread creation', 'Shared pool supports many framework features'], ['Blocking delays unrelated work', 'Unbounded work can grow queues and latency']],
      ['Keep pool work short and nonblocking; bound CPU-heavy fan-out.', 'Avoid long waits or synchronous blocking on pool workers.'],
      ['What kinds of work use the thread pool?', 'Why does blocking reduce capacity?', 'What should be measured during queueing incidents?'],
      'A service queues CPU-heavy exports alongside request continuations. Move long batch processing to a bounded worker queue and monitor pool queue length and throughput.',
      asyncSources,
      visual(
        [{ label: 'Work queued', detail: 'Task.Run or runtime callback places work in a pool queue.' }, { label: 'Worker available', detail: 'A reusable worker takes queued work and executes instructions.' }, { label: 'Worker blocked', detail: 'A synchronous wait ties up capacity that could run other queued work.' }, { label: 'Worker reused', detail: 'Completed workers return to service later work.' }],
        ['Schedule a CPU calculation and await its Task.', 'Start native async network I/O without wrapping it in Task.Run.', 'Observe how blocking pool workers would delay unrelated queue items.'],
        ['Pool threads are shared execution resources.', 'Task.Run uses pool capacity, not a private thread.', 'Async I/O avoids occupying a worker while waiting.'],
        ['Treating the pool as unlimited.', 'Increasing minimum threads as the first fix for blocking.', 'Flooding the pool with unbounded CPU tasks.'],
        ['Bound CPU concurrency.', 'Use async I/O and avoid sync-over-async.', 'Monitor queue length, thread count, and completion rate.'],
        'The thread pool reuses finite workers; blocking or flooding it delays unrelated scheduled work.',
      )),

    topic('thread-safety', 'Thread Safety and Race Conditions', 'Very High',
      'Thread-safe code preserves invariants when multiple execution flows access shared state concurrently.',
      [
        'A race condition occurs when outcome depends on timing or interleaving. An invariant is a rule that must remain true, such as a counter never losing an increment or a cache entry being internally consistent.',
        'Concurrent reads and writes can interleave between a read and write operation, even when each individual machine instruction appears simple. Visibility and ordering also matter across threads.',
        'Protect compound operations with synchronization, use immutable data, or use thread-safe concurrent structures. In async code, multiple continuations can interleave even if each resumes on one thread.',
      ],
      ['Two flows access shared state', 'Operations interleave around invariant', 'Synchronize or eliminate shared mutation'],
      'The expression count++ is a read-modify-write sequence; two threads can read the same old value and overwrite one increment.',
      `int count = 0;
Parallel.For(0, 1000, _ => Interlocked.Increment(ref count));
Console.WriteLine(count); // 1000`,
      [['Correct shared invariants', 'Atomic and immutable designs reduce coordination'], ['Locks can limit throughput', 'Incorrect lock scope can deadlock']],
      ['Identify shared mutable state and protect the entire invariant-preserving operation.', 'Avoid assuming async code is single-threaded or that one statement is automatically atomic.'],
      ['What is a race condition?', 'Why can count++ lose updates?', 'Can async code race without multiple simultaneous instructions?'],
      'A singleton cache has occasional corrupted entries under load. Define the entry invariant, use ConcurrentDictionary atomic APIs or a narrow lock, and add stress tests.',
      asyncSources,
      visual(
        [{ label: 'Shared counter', detail: 'Several flows access one mutable count value.' }, { label: 'Interleaved update', detail: 'Read, add, and write can overlap and lose an increment.' }, { label: 'Atomic operation', detail: 'Interlocked performs the update as one atomic primitive.' }],
        ['Run concurrent increments against shared state.', 'Replace non-atomic read/modify/write with Interlocked.Increment.', 'Verify the final count under repeated concurrent execution.'],
        ['Races depend on interleaving and shared state.', 'Protect invariants, not merely individual lines.', 'Async interleaving can expose races without parallel threads.'],
        ['Using a lock around only part of a compound invariant.', 'Assuming ConcurrentDictionary makes mutable values thread-safe.'],
        ['Prefer immutability or atomic APIs where suitable.', 'Use one consistent synchronization strategy per state.', 'Stress-test and analyze lock contention.'],
        'Thread safety means preserving invariants under concurrent access; identify races and make updates atomic or synchronized.',
      )),

    topic('lock-vs-semaphoreslim', 'lock vs SemaphoreSlim', 'High',
      'lock synchronizes synchronous critical sections; SemaphoreSlim controls concurrent entry and supports asynchronous waiting.',
      [
        'A critical section is code that accesses shared state under exclusive ownership. A lock establishes monitor ownership for the current thread; SemaphoreSlim is a counting semaphore that allows a configured number of entrants.',
        'lock is simple and efficient for short synchronous sections. SemaphoreSlim can be awaited without blocking a thread and can limit concurrency, but its permits require correct release and lifecycle management.',
        'Never await while holding a C# lock. Use SemaphoreSlim.WaitAsync with try/finally and Release; use a semaphore with count one for async mutual exclusion, or a larger count for bounded parallel access.',
      ],
      ['Select synchronous ownership or async permit', 'Acquire before protected operation', 'Release in every completion path'],
      'A method that awaits a remote refresh must not hold lock; a SemaphoreSlim with try/finally protects the async critical section.',
      `private readonly SemaphoreSlim gate = new(1, 1);

async Task RefreshAsync(CancellationToken token)
{
    await gate.WaitAsync(token);
    try { await LoadAndUpdateAsync(token); }
    finally { gate.Release(); }
}`,
      [['lock has clear synchronous ownership', 'SemaphoreSlim supports async gating and bounded concurrency'], ['Semaphore misuse can deadlock or over-release', 'Long critical sections serialize throughput']],
      ['Use lock only around brief synchronous code with no await.', 'Use SemaphoreSlim for asynchronous exclusion or concurrency limits and release in finally.'],
      ['Why can a lock not be held across await?', 'What does SemaphoreSlim count represent?', 'Why is Release placed in finally?'],
      'A token refresh must permit only one asynchronous refresh at a time. Use SemaphoreSlim, add cancellation and timeout policy, and ensure every acquired permit is released.',
      asyncSources,
      visual(
        [{ label: 'lock acquisition', detail: 'Monitor grants exclusive ownership to one thread for a synchronous region.' }, { label: 'Async wait', detail: 'SemaphoreSlim.WaitAsync waits without blocking a worker for a permit.' }, { label: 'Protected operation', detail: 'Only permitted entrants perform the refresh concurrently.' }, { label: 'finally release', detail: 'Permit returns even when the operation faults or is canceled after acquisition.' }],
        ['Wait asynchronously for the semaphore permit.', 'Run the protected asynchronous refresh.', 'Release in finally after successful acquisition.'],
        ['lock is thread-owned and synchronous.', 'SemaphoreSlim supports asynchronous wait and bounded counts.', 'Every acquired semaphore permit must be released.'],
        ['Awaiting inside lock.', 'Calling Release when WaitAsync never acquired a permit.', 'Forgetting finally and permanently reducing capacity.'],
        ['Keep critical regions small.', 'Use cancellation-aware WaitAsync.', 'Document gate ownership and disposal lifetime.'],
        'Use lock for short synchronous mutual exclusion; use SemaphoreSlim when callers must await admission or limit concurrency.',
      )),

    topic('memory-management', '.NET Memory Management', 'High',
      'Managed memory allocation and reclamation are runtime-managed, while resource ownership and object reachability remain application responsibilities.',
      [
        'The managed heap stores objects; roots such as stack references, static fields, and handles make objects reachable. The garbage collector reclaims unreachable managed objects.',
        'Automatic reclamation prevents many manual memory errors but does not guarantee low memory use: reachable objects may be retained unnecessarily, and unmanaged resources such as handles need deterministic release.',
        'Use ownership scopes for disposable resources, remove unintended references, and profile allocation rate, retained heap, and native resource counts as different measurements.',
      ],
      ['Allocate managed objects', 'Roots determine reachability', 'Collect unreachable objects and dispose external resources'],
      'A long-lived cache root keeps old response objects reachable, so GC cannot reclaim them even though application code no longer needs them.',
      `var cache = new Dictionary<string, object>();
cache["latest"] = LoadSnapshot(); // static/cache ownership may retain graph

// Remove values when no longer needed:
cache.Remove("latest");`,
      [['Runtime reclaims unreachable managed objects', 'Ownership scopes make native resource lifetimes explicit'], ['Reachable leaks remain live', 'Managed heap metrics do not show every native resource']],
      ['Track roots and ownership; profile both managed heap and native handles.', 'Avoid assuming garbage collection replaces disposal or cache eviction.'],
      ['What makes an object reachable?', 'Can a managed memory leak exist?', 'Why measure handles separately from heap size?'],
      'A worker’s memory grows between jobs. Compare heap snapshots for retained roots, inspect native handles, and set bounded cache policies before tuning GC.',
      asyncSources,
      visual(
        [{ label: 'Allocation', detail: 'Application creates managed objects on the managed heap.' }, { label: 'Root reference', detail: 'Static, stack, or handle roots keep objects reachable.' }, { label: 'Unreachable graph', detail: 'Objects with no path from a root can be reclaimed.' }, { label: 'External resource', detail: 'Files and native handles need deterministic ownership and disposal.' }],
        ['Create and store an object in a cache.', 'Observe that a cache root keeps it reachable.', 'Remove the reference and separately dispose any external resource it owned.'],
        ['GC traces managed reachability, not business usefulness.', 'Reachable but unwanted objects are application retention bugs.', 'IDisposable concerns resources, not reclaiming managed object memory.'],
        ['Calling GC.Collect to fix a rooted object leak.', 'Assuming a small managed heap means no handle leak.', 'Keeping unbounded caches.'],
        ['Bound caches and clear references deliberately.', 'Dispose owned resources deterministically.', 'Profile heap, allocation, and native handles separately.'],
        'The GC reclaims unreachable managed objects; application code must manage reachability and deterministic cleanup of external resources.',
      )),

    topic('dotnet-garbage-collection', '.NET Garbage Collector', 'Very High',
      'The garbage collector finds unreachable managed objects and reuses their memory, with runtime strategies tuned for common allocation patterns.',
      [
        'Garbage collection (GC) traces references from roots to determine reachability. Finalization, pinning, and large objects have specialized behavior beyond ordinary small-object reclamation.',
        'Automatic collection simplifies memory safety and generational collection exploits the fact that many objects die young. Excess allocation, long-lived retention, pinning, or large allocations can still cause pauses and memory pressure.',
        'The GC may reclaim and compact movable objects; references are updated as needed. Do not force collection in ordinary flow. Use runtime counters, traces, and heap snapshots to diagnose allocation and retention.',
      ],
      ['Allocate managed objects', 'Trace from roots and identify survivors', 'Reclaim unreachable objects and update heap'],
      'A temporary request buffer becomes eligible for collection after references disappear, but an object still stored in a static cache remains reachable.',
      `long allocatedBefore = GC.GetTotalAllocatedBytes();
ProcessBatch();
long allocated = GC.GetTotalAllocatedBytes() - allocatedBefore;
Console.WriteLine($"Allocated: {allocated} bytes");`,
      [['Automatic reclamation reduces manual memory errors', 'Generations optimize common object lifetimes'], ['Collections can pause or consume CPU', 'Finalizers and pins complicate lifetime and compaction']],
      ['Use GC metrics and heap tools to find the cause before optimizing.', 'Avoid routine GC.Collect calls, finalizer-based ownership, and unjustified pooling.'],
      ['What does GC reachability mean?', 'Does GC collect a still-referenced object?', 'Why can forced collections hurt?'],
      'Memory climbs after every batch. Compare allocation rate and heap snapshots, identify retained roots or large objects, then fix ownership rather than forcing collections.',
      asyncSources,
      visual(
        [{ label: 'Roots', detail: 'Runtime begins with active roots and follows references.' }, { label: 'Reachable objects', detail: 'Objects with a reference path remain live for this collection.' }, { label: 'Unreachable objects', detail: 'Objects without root paths become reclaimable.' }, { label: 'Reclaim or compact', detail: 'GC reuses dead space and may move eligible objects while fixing references.' }],
        ['Record allocation around a representative operation.', 'Compare roots and surviving objects in a heap snapshot.', 'Fix retention/allocation causes and remeasure.'],
        ['GC decides liveness by reachability.', 'GC does not reclaim objects merely because they are old or unused by intent.', 'Forced collection rarely fixes root causes.'],
        ['Expecting GC to reclaim referenced cache entries.', 'Using GC.Collect as routine memory management.', 'Pooling allocations without measuring retention and contention costs.'],
        ['Use counters and traces under representative load.', 'Release references and disposable resources appropriately.', 'Avoid unnecessary pinning and finalizers.'],
        'The GC traces roots to reclaim unreachable managed objects; diagnose allocation and retention with runtime evidence.',
      )),

    topic('gc-generations', 'Gen 0, Gen 1, and Gen 2', 'High',
      'Generations group managed objects by survival history so the GC can collect short-lived objects more frequently and cheaply.',
      [
        'Generation is an age/survival classification, not a C# type. New small objects usually begin in Gen 0; survivors may be promoted to Gen 1 and then Gen 2. Gen 2 holds longer-lived objects.',
        'Most temporary objects die quickly, so collecting a young generation can examine less memory than a full collection. Survivors increase long-term scanning and promotion pressure.',
        'Large Object Heap (LOH) allocation and pinned-object handling use specialized areas and rules; they should not be simplistically equated with ordinary Gen 0 allocation. Diagnose with allocation size, survival, and collection metrics.',
      ],
      ['New small object enters young generation', 'Survivor promoted after collection', 'Long-lived survivors increase full-heap work'],
      'Request-scoped temporary objects often die in Gen 0; a global cache may retain objects long enough to promote, increasing Gen 2 footprint.',
      `int gen = GC.GetGeneration(someObject);
int gen0Collections = GC.CollectionCount(0);
ProcessRequests();
Console.WriteLine($"Generation={gen}, Gen0 collections={GC.CollectionCount(0) - gen0Collections}");`,
      [['Young collections reclaim many short-lived objects cheaply', 'Survival history guides collection work'], ['Promoted retention increases long-lived heap', 'Large/pinned objects have specialized costs']],
      ['Use generation counters as clues, not a standalone diagnosis.', 'Avoid forcing promotion or collections to “manage” generations.'],
      ['What causes promotion?', 'Why are Gen 0 collections common?', 'How does long-lived cache retention affect Gen 2?'],
      'A service’s Gen 2 size grows over hours. Compare heap snapshots and cache roots for unintended long-lived objects and check LOH allocation separately.',
      asyncSources,
      visual(
        [{ label: 'Gen 0 allocation', detail: 'Most new small objects begin in the nursery and are cheap to examine.' }, { label: 'Gen 0 survivor', detail: 'Object still reachable at collection and may be promoted to Gen 1.' }, { label: 'Gen 1 survivor', detail: 'Repeated survival can promote the object to Gen 2.' }, { label: 'Gen 2 / specialized heaps', detail: 'Long-lived and large/pinned allocations can impose different collection costs.' }],
        ['Observe an object’s current generation with GC.GetGeneration.', 'Track collection counts around representative work.', 'Use heap snapshots to identify why objects survive and promote.'],
        ['Generation tracks survival, not a programmer-assigned type.', 'Young generations optimize short-lived allocations.', 'Gen 2 growth often points to long-lived retention, but investigate evidence.'],
        ['Assuming every object starts in Gen 0 regardless of allocation category.', 'Treating LOH as simply a regular generation.', 'Calling Collect to force desired promotion behavior.'],
        ['Correlate collection counts with allocation and heap snapshots.', 'Review cache and static roots.', 'Avoid large transient allocations where measurements justify it.'],
        'Generational GC collects young objects frequently and promotes survivors; use generation data alongside retention and allocation profiles.',
      )),

    topic('idisposable-finalizer', 'IDisposable, IAsyncDisposable, and Finalizers', 'Very High',
      'Dispose provides deterministic resource cleanup; finalization is a nondeterministic fallback for directly owned unmanaged resources.',
      [
        'IDisposable.Dispose releases resources synchronously; IAsyncDisposable.DisposeAsync supports cleanup that itself awaits. A finalizer is runtime-invoked cleanup for unmanaged ownership and may run much later than the object becomes unreachable.',
        'Files, sockets, database connections, and native handles are scarce external resources. Releasing them deterministically avoids exhaustion; garbage collection only controls managed memory and does not guarantee prompt resource release.',
        'Use using/await using for owned resources and prefer SafeHandle for native handles. A finalizer should not access arbitrary managed objects; well-designed wrappers suppress finalization after successful deterministic disposal.',
      ],
      ['Acquire resource', 'Use within explicit owner lifetime', 'Dispose deterministically or finalizer fallback'],
      'A stream is disposed even if copying throws; await using is appropriate when cleanup has asynchronous work.',
      `await using var stream = new FileStream(
    path, FileMode.Open, FileAccess.Read, FileShare.Read,
    bufferSize: 4096, useAsync: true);
await stream.CopyToAsync(destination, cancellationToken);`,
      [['Predictable resource release', 'Using cleanup runs on exceptions'], ['Ownership errors cause leaks or double disposal', 'Finalizers are delayed and add runtime cost']],
      ['Use using or await using for deterministic ownership.', 'Avoid finalizers unless directly owning unmanaged resources; prefer SafeHandle.'],
      ['Does GC guarantee prompt file-handle release?', 'When should IAsyncDisposable be used?', 'Why suppress finalization after Dispose?'],
      'A service leaks database connections under exception paths. Make the owner scope explicit, use provider-supported disposal, and validate pool recovery under failures.',
      asyncSources,
      visual(
        [{ label: 'Resource acquired', detail: 'An object owns a file handle or other scarce external resource.' }, { label: 'Scope use', detail: 'using or await using expresses the owner’s deterministic lifetime.' }, { label: 'Dispose', detail: 'Cleanup runs on normal exit and exceptions; async cleanup can be awaited.' }, { label: 'Finalizer fallback', detail: 'Only unmanaged ownership needs nondeterministic backup cleanup; it is not the normal path.' }],
        ['Acquire the stream inside an async method.', 'Use await using so disposal is awaited on exit.', 'Confirm cleanup still occurs if CopyToAsync throws.'],
        ['Dispose controls external resource lifetime.', 'GC handles managed object memory, not prompt handle release.', 'SafeHandle is preferred for native handle ownership.'],
        ['Relying on finalizers to close normal streams promptly.', 'Disposing resources owned by another component.', 'Implementing finalizers that touch arbitrary managed state.'],
        ['Make ownership explicit and singular.', 'Use using/await using and SafeHandle.', 'Test cleanup on success, exceptions, and cancellation.'],
        'Dispose releases owned resources deterministically; finalizers are delayed fallback cleanup for direct unmanaged ownership.',
      )),

    topic('memory-leak-diagnosis', 'Diagnosing Memory Leaks', 'High',
      'A managed memory leak is often unintended retention: objects remain reachable after the application no longer needs them.',
      [
        'Reachability means an object can be followed from a live root such as a static field, active stack, event publisher, or handle. An object can be logically dead but not collectible when a root still references it.',
        'Distinguish rising allocation rate from retained live heap and from native resource leaks. A high allocation rate may be temporary churn; steadily growing retained objects or handles indicates a different issue.',
        'Capture comparable heap snapshots, inspect retained paths/dominators and event subscriptions, correlate counters and traces with workload, then fix the owning reference or disposal path and verify after repeated cycles.',
      ],
      ['Observe sustained growth', 'Compare heap and native resource snapshots', 'Trace retained root and verify fix'],
      'A singleton event publisher holds a delegate to a transient subscriber, keeping the subscriber and its object graph reachable until it unsubscribes.',
      `public sealed class Feed
{
    public event Action? Changed;
    public void Publish() => Changed?.Invoke();
}

public sealed class ViewModel : IDisposable
{
    private readonly Feed feed;
    public ViewModel(Feed feed) => this.feed = feed;
    public void Attach() => feed.Changed += OnChanged;
    private void OnChanged() { }
    public void Dispose() => feed.Changed -= OnChanged;
}`,
      [['Root paths identify retention owners', 'Repeatable snapshots confirm trends'], ['Snapshots can perturb runtime state', 'Native leaks may not appear in managed heap']],
      ['Compare snapshots after equivalent workloads and inspect retaining paths.', 'Avoid concluding “leak” from one heap-size sample or allocation count.'],
      ['What is a root path?', 'How can an event subscription retain an object?', 'How do allocation and retained heap differ?'],
      'A worker process grows after each batch. Compare snapshots and handle counters, locate the retained owner, unsubscribe or bound its cache, then repeat the same workload to verify stabilization.',
      asyncSources,
      visual(
        [{ label: 'Growth signal', detail: 'Runtime counters show heap or native-handle growth across repeated workload cycles.' }, { label: 'Snapshot comparison', detail: 'Equivalent heap captures distinguish short-lived allocation from retained growth.' }, { label: 'Retaining root', detail: 'Paths identify static fields, caches, events, or handles keeping objects alive.' }, { label: 'Fix and verify', detail: 'Release the owning reference and repeat workload to confirm stabilization.' }],
        ['Run the same workload several times and record counters.', 'Compare heap snapshots and inspect retaining paths.', 'Unsubscribe or bound the identified owner, then repeat the workload.'],
        ['A managed leak commonly means unwanted reachability.', 'Allocation rate and live heap measure different problems.', 'Native resources require separate handle and disposal diagnostics.'],
        ['Forcing GC before understanding roots.', 'Treating one memory sample as proof of a leak.', 'Pooling objects before determining whether retention is the issue.'],
        ['Use repeatable workloads and comparable snapshots.', 'Inspect roots and dominators, including event subscriptions.', 'Validate the fix over repeated lifecycle cycles.'],
        'Diagnose leaks by tracing unintended reachability or undisposed native resources, then confirm stabilization under repeatable load.',
      )),

    topic('configureawait', 'ConfigureAwait(false)', 'High',
      'ConfigureAwait(false) tells an await not to require resuming on the captured synchronization context.',
      [
        'A synchronization context is an abstraction that can marshal work to a destination such as a UI thread. A task scheduler may also influence continuation execution.',
        'Avoiding unnecessary context capture helps context-agnostic libraries avoid UI-context dependencies and some deadlock patterns. ASP.NET Core generally has no custom request synchronization context, so blanket use there usually adds little.',
        'false does not mean “run on another thread”; continuation can run inline or on an available scheduler. Use it in library awaits when caller-context affinity is unnecessary, while UI code normally preserves context before updating controls.',
      ],
      ['Await operation', 'Capture or opt out of context requirement', 'Continuation resumes on eligible execution path'],
      'A reusable library can await internal I/O with ConfigureAwait(false); a UI event handler should normally capture context before changing controls.',
      `public static async Task<string> ReadAsync(Stream stream)
{
    using var reader = new StreamReader(stream);
    return await reader.ReadToEndAsync().ConfigureAwait(false);
}`,
      [['Libraries avoid unnecessary caller-context dependency', 'Can reduce context switching in applicable environments'], ['Does not move work to a new thread', 'Incorrect use can break UI affinity assumptions']],
      ['Use ConfigureAwait(false) in context-agnostic library code when resuming on caller context is unnecessary.', 'Avoid mechanical blanket rules in UI code or treating it as a deadlock cure while sync-over-async remains.'],
      ['What does false opt out of?', 'Does ConfigureAwait(false) schedule a worker thread?', 'Why is it typically unnecessary in ASP.NET Core app code?'],
      'A library deadlocks when a UI caller blocks on its Task. Fix the caller to await asynchronously, then use ConfigureAwait(false) for library internals that do not access UI state.',
      asyncSources,
      visual(
        [{ label: 'Captured context', detail: 'Ordinary await may request resumption on an available synchronization context.' }, { label: 'ConfigureAwait(false)', detail: 'Awaiter does not require that captured context for this continuation.' }, { label: 'Operation completes', detail: 'Completion may occur on an I/O callback or other runtime path.' }, { label: 'Continuation resumes', detail: 'Work may run inline or on an eligible thread; no new-thread guarantee exists.' }],
        ['Await a library operation that does not use caller context.', 'Opt out of context capture for that await.', 'Return result without touching UI-bound state.'],
        ['The option affects context requirement, not thread creation.', 'UI code often needs its original context.', 'Async all the way is better than blocking and hoping context configuration fixes it.'],
        ['Assuming false means background thread.', 'Using it before updating UI controls.', 'Applying it blindly as a substitute for removing .Result.'],
        ['Keep context-independent library internals independent.', 'Preserve context around UI state updates.', 'Use asynchronous callers and test relevant environments.'],
        'ConfigureAwait(false) removes a continuation’s requirement to resume on a captured context; it does not select a new thread.',
      )),

    topic('thread-pool-starvation', 'Thread Pool Starvation', 'Very High',
      'Thread-pool starvation occurs when queued work cannot obtain worker threads promptly, often because workers are blocked.',
      [
        'A worker is a reusable thread-pool execution resource; starvation means demand and blocked workers prevent timely processing of queued callbacks and continuations.',
        'Sync-over-async, synchronous waits on I/O, lock contention, and long CPU work can inflate queues and latency even when CPU usage is low. Increasing workers may mask the bottleneck and create more contention.',
        'Correlate thread-pool queue length, thread count, completion rate, CPU, request latency, and blocking stacks. Remove blocking at its source, use async I/O, and bound CPU or background concurrency.',
      ],
      ['Workers block or run too long', 'Queued continuations accumulate', 'Measure counters and remove blocking cause'],
      'Calling Result on an HTTP Task blocks a worker while the asynchronous request needs a continuation to complete, reducing capacity for other work.',
      `// Avoid: blocks a pool worker
var data = client.GetStringAsync(url).Result;

// Prefer: yields while I/O is pending
var asyncData = await client.GetStringAsync(url, cancellationToken);`,
      [['Diagnosable using runtime counters and traces', 'Async I/O returns workers to useful work'], ['Symptoms can resemble slow dependencies', 'Adding workers may increase contention without removing cause']],
      ['Use async end-to-end, bound CPU concurrency, and inspect blocking traces.', 'Avoid increasing minimum threads as a substitute for fixing sync-over-async.'],
      ['What metrics suggest starvation?', 'Why can .Result harm throughput?', 'How can starvation occur with low CPU?'],
      'Latency rises while CPU stays low. Correlate queue length, thread count, completed work, dependency time, and stack traces; remove sync-over-async before tuning pool settings.',
      asyncSources,
      visual(
        [{ label: 'Blocking workers', detail: 'Workers wait synchronously on I/O or locks and cannot process new work.' }, { label: 'Queued continuations', detail: 'Completion callbacks and requests wait behind unavailable workers.' }, { label: 'Latency and queue rise', detail: 'Throughput falls even when CPU is not saturated.' }, { label: 'Evidence-led repair', detail: 'Counters and traces reveal blocking; async I/O and bounded work restore capacity.' }],
        ['Observe queue length and completed work during the incident.', 'Capture stacks to identify blocking waits.', 'Replace sync-over-async and remeasure throughput.'],
        ['Starvation is a capacity/queueing issue.', 'Low CPU does not rule it out.', 'Thread count alone is not a sufficient diagnosis.'],
        ['Blindly raising minimum worker threads.', 'Confusing downstream slowness with proof of starvation.', 'Wrapping blocking I/O in more Task.Run work.'],
        ['Make I/O asynchronous end-to-end.', 'Bound long-running CPU/background work.', 'Correlate counters, traces, and dependency latency.'],
        'Starvation is delayed queued work caused by unavailable workers; diagnose blocking and queue behavior before tuning.',
      )),
  ],
};
