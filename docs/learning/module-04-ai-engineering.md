# Module 04 — AI and Generative AI Engineering

**Workbook alignment:** Days 21–22 (LLM fundamentals and AI in .NET). Related
tracker topics: T031–T040.

## T031 — Tokens, tokenization, and context windows

- **What:** A token is a unit the model processes; a context window is the
  maximum combined prompt and response budget.
- **Why:** Oversized code/history can be rejected, truncated, or become costly.
- **When:** Estimate prompt size before adding conversation history or retrieved
  documents.
- **Limits:** Character count is not token count, and tokenization differs by
  model.
- **Diagram:** `system + user + history + retrieved text + answer <= model context`
- **Project example (planned — key105/key108):** current request sends one code
  prompt. Conversation history and RAG must apply a documented token budget.
  [ChatApiService.cs](../../Services/ChatApiService.cs)
- **Reference:** [OpenAI tokens guide](https://platform.openai.com/docs/concepts/tokens)

## T032 — System/user messages and prompt construction

- **What:** Chat APIs structure input as messages with roles; instructions and
  user content serve different purposes.
- **Why:** Separating instructions from submitted code makes the task clearer
  and easier to audit.
- **When:** Keep stable application instructions separate from untrusted user
  content; delimit retrieved text as data, not instructions.
- **Limits:** Prompt text is not a security boundary; the model can still
  follow malicious or irrelevant content.
- **Diagram:** `application instructions + user code -> messages -> model`
- **Project example (implemented):** [ChatApiService.cs](../../Services/ChatApiService.cs)
  creates the explanation prompt and a user message.
- **Reference:** [OpenAI prompt engineering](https://platform.openai.com/docs/guides/prompt-engineering)

## T033 — Temperature and generation parameters

- **What:** Generation parameters influence how a model samples or limits its
  response.
- **Why:** They can affect creativity, length, and repeatability.
- **When:** Set only parameters needed by the product and document provider
  differences.
- **Limits:** A low temperature does not guarantee identical or correct output;
  provider semantics can vary.
- **Diagram:** `prompt + model + generation settings -> sampled answer`
- **Project example (implemented, minimal):** the shared request currently
  includes `MaxOutputTokens`; temperature is intentionally not exposed.
  [AICompletionRequest.cs](../../Services/AICompletionRequest.cs)
- **Reference:** [OpenAI API parameters](https://platform.openai.com/docs/api-reference/chat)

## T034 — Model/provider abstraction and adapter boundaries

- **What:** An application-facing contract hides provider-specific HTTP
  formats behind an adapter. Semantic Kernel is an optional orchestration
  library that can add abstractions for prompts, plugins, and AI services.
- **Why:** Orchestration should not change when switching configured providers.
- **When:** Add an abstraction at an external boundary where substitution or
  protocol isolation matters. Adopt Semantic Kernel only when its orchestration
  capabilities solve a concrete workflow need.
- **Limits:** A too-generic contract hides useful capabilities; different
  protocols still need distinct adapter logic.
- **Diagram:** `application request -> provider interface -> provider adapter -> HTTP`
- **Project example (implemented):**
  [IAICompletionProvider.cs](../../Services/IAICompletionProvider.cs) and
  [OllamaChatCompletionProvider.cs](../../Services/OllamaChatCompletionProvider.cs).
- **Project decision:** the current app uses a small direct HTTP adapter; it
  does not need Semantic Kernel for one completion call.
- **Reference:** [Azure architecture: adapter pattern](https://learn.microsoft.com/azure/architecture/patterns/adapter)
  · [Semantic Kernel](https://learn.microsoft.com/semantic-kernel/overview/)

## T035 — Configuration-based provider selection

- **What:** Server configuration chooses a provider without requiring a
  controller or client change.
- **Why:** Provider choice affects deployment, cost, latency, and data privacy.
- **When:** Use controlled server settings; do not trust arbitrary client
  provider selection without authorization and budgets.
- **Limits:** A configured provider can still be unreachable; silent fallback
  changes cost and privacy behavior.
- **Diagram:** `AIProvider:Name -> selector -> exactly one configured adapter`
- **Project example (implemented):** [AICompletionProviderSelector.cs](../../Services/AICompletionProviderSelector.cs)
  and [appsettings.json](../../appsettings.json).
- **Reference:** [Options pattern](https://learn.microsoft.com/dotnet/core/extensions/options)

## T036 — Structured output and schema validation

- **What:** Structured output asks a model for data matching a schema; the
  application must still validate the response.
- **Why:** Machine-consumed results need explicit fields and types rather than
  fragile prose parsing.
- **When:** Use it when a concrete feature needs machine-readable output.
- **Limits:** Schema-constrained output is not automatically truthful,
  authorized, or safe to execute.
- **Diagram:** `model JSON -> deserialize -> schema/business validation -> use`
- **Project example (planned — key106):** the current feature returns text.
  Structured actions must not be added unless there is a validated product use
  and strict allowlisting.
- **Reference:** [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)

## T037 — Streaming completions and partial output

- **What:** Streaming delivers response chunks as they become available.
- **Why:** It can reduce perceived wait for a long answer.
- **When:** Add it when the UI, API transport, and provider all support a
  defined streaming contract.
- **Limits:** Partial output may be incomplete or unsafe to render; retrying a
  stream can duplicate cost or text.
- **Diagram:** `provider token chunks -> API stream -> UI incremental render`
- **Project example (planned, optional — key103):** current API returns a full
  `Result`; streaming is not necessary for this small code-explanation
  feature.
- **Reference:** [Streaming responses](https://platform.openai.com/docs/guides/streaming-responses)

## T038 — Model quality, latency, privacy, and cost

- **What:** Providers and models trade answer quality against latency,
  availability, data handling, and price.
- **Why:** A local model and hosted model have different operational and
  privacy characteristics.
- **When:** Choose using the actual workload, user data policy, budget, and
  measured quality.
- **Limits:** Benchmark results may not generalize to another prompt or model
  version; do not send sensitive code to a hosted provider without approval.
- **Diagram:** `provider decision = quality + latency + privacy + cost + license`
- **Project example (implemented):** Ollama is the no-hosted-key default;
  OpenAI is opt-in. See [ADR 0002](../decisions/0002-ai-provider-selection.md).
- **Reference:** [OpenAI pricing](https://openai.com/api/pricing/) · [Ollama](https://ollama.com/)

## T039 — Evaluation datasets and repeatable quality checks

- **What:** An evaluation set is a stable collection of inputs and criteria
  used to compare model behavior.
- **Why:** A successful HTTP response alone does not prove explanations are
  useful or correct.
- **When:** Create a small representative set before changing prompts, models,
  or retrieval.
- **Limits:** LLM scoring can be inconsistent; human review and clear expected
  criteria are still needed.
- **Diagram:** `fixed prompts -> model version -> rubric -> compare results`
- **Project example (planned — key108/key107):** no evaluation set exists.
  Future checks should score correctness, clarity, and unsupported claims,
  not exact prose.
- **Reference:** [OpenAI evaluation best practices](https://platform.openai.com/docs/guides/evals)

## T040 — Tool/function calling and safe capability design

- **What:** Tool calling lets a model request a structured application
  capability; the application decides whether to execute it.
- **Why:** A model can connect to useful operations, but execution has
  authority and side effects.
- **When:** Only add an allowlisted tool when a user feature requires it, and
  authorize every invocation independently.
- **Limits:** Model output is untrusted. Never execute generated shell, SQL, or
  code directly.
- **Diagram:** `model proposes tool -> validate + authorize -> execute bounded action`
- **Project example (not implemented by design):** the code explainer has no
  tools. Keep it that way unless a reviewed product requirement justifies a
  narrow, independently authorized capability.
- **Reference:** [Function calling](https://platform.openai.com/docs/guides/function-calling)

## Workbook implementation connection

The provider interface, config selector, prompt, and output-token limit are
implemented. Streaming, structured output, tool execution, and evaluations
remain optional or later work; do not add them simply to demonstrate a
technology.
