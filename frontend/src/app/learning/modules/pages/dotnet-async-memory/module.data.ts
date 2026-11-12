import { LearningModuleSummary } from '../../../learning.models';

export const dotnetAsyncMemoryModule: LearningModuleSummary = {
  "id": "dotnet-async-memory",
  "title": "Async Programming, Tasks, Threads & Memory",
  "description": "Design scalable asynchronous code, protect shared state, and diagnose managed-memory and resource-lifetime problems.",
  "topics": [
    {
      "id": "async-vs-sync",
      "title": "Asynchronous vs Synchronous Work",
      "priority": "Very High",
      "summary": "Synchronous calls wait inline; asynchronous operations let the caller make progress while an operation is pending."
    },
    {
      "id": "async-internals",
      "title": "What Happens Inside an Async Method",
      "priority": "Very High",
      "summary": "An async method runs synchronously until it reaches an incomplete awaitable, then returns control and resumes later."
    },
    {
      "id": "task-vs-thread",
      "title": "Task vs Thread",
      "priority": "Very High",
      "summary": "A Task models an operation’s completion and outcome; a Thread is an operating-system execution resource."
    },
    {
      "id": "task-vs-task-run",
      "title": "Task vs Task.Run",
      "priority": "High",
      "summary": "Task represents work or completion; Task.Run schedules a delegate on the thread pool."
    },
    {
      "id": "async-await",
      "title": "Compiler State Machine and Await",
      "priority": "Very High",
      "summary": "The compiler transforms an async method into a state machine that stores progress across suspension points."
    },
    {
      "id": "task-whenall-whenany",
      "title": "Task.WhenAll vs Task.WhenAny",
      "priority": "High",
      "summary": "WhenAll completes after all supplied tasks complete; WhenAny completes when one task completes."
    },
    {
      "id": "async-without-await",
      "title": "Async Methods Without Await",
      "priority": "High",
      "summary": "An async method with no await runs synchronously and may add a redundant state machine or task wrapper."
    },
    {
      "id": "unawaited-async",
      "title": "Consequences of an Unawaited Async Call",
      "priority": "Very High",
      "summary": "An unawaited Task is unobserved by the caller: the operation still runs, but ordering, errors, and completion are no longer coordinated."
    },
    {
      "id": "thread-pool",
      "title": ".NET Thread Pool",
      "priority": "High",
      "summary": "The thread pool reuses worker threads for short-running work and coordinates queued callbacks and continuations."
    },
    {
      "id": "thread-safety",
      "title": "Thread Safety and Race Conditions",
      "priority": "Very High",
      "summary": "Thread-safe code preserves invariants when multiple execution flows access shared state concurrently."
    },
    {
      "id": "lock-vs-semaphoreslim",
      "title": "lock vs SemaphoreSlim",
      "priority": "High",
      "summary": "lock synchronizes synchronous critical sections; SemaphoreSlim controls concurrent entry and supports asynchronous waiting."
    },
    {
      "id": "memory-management",
      "title": ".NET Memory Management",
      "priority": "High",
      "summary": "Managed memory allocation and reclamation are runtime-managed, while resource ownership and object reachability remain application responsibilities."
    },
    {
      "id": "dotnet-garbage-collection",
      "title": ".NET Garbage Collector",
      "priority": "Very High",
      "summary": "The garbage collector finds unreachable managed objects and reuses their memory, with runtime strategies tuned for common allocation patterns."
    },
    {
      "id": "gc-generations",
      "title": "Gen 0, Gen 1, and Gen 2",
      "priority": "High",
      "summary": "Generations group managed objects by survival history so the GC can collect short-lived objects more frequently and cheaply."
    },
    {
      "id": "idisposable-finalizer",
      "title": "IDisposable, IAsyncDisposable, and Finalizers",
      "priority": "Very High",
      "summary": "Dispose provides deterministic resource cleanup; finalization is a nondeterministic fallback for directly owned unmanaged resources."
    },
    {
      "id": "memory-leak-diagnosis",
      "title": "Diagnosing Memory Leaks",
      "priority": "High",
      "summary": "A managed memory leak is often unintended retention: objects remain reachable after the application no longer needs them."
    },
    {
      "id": "configureawait",
      "title": "ConfigureAwait(false)",
      "priority": "High",
      "summary": "ConfigureAwait(false) tells an await not to require resuming on the captured synchronization context."
    },
    {
      "id": "thread-pool-starvation",
      "title": "Thread Pool Starvation",
      "priority": "Very High",
      "summary": "Thread-pool starvation occurs when queued work cannot obtain worker threads promptly, often because workers are blocked."
    }
  ]
};
