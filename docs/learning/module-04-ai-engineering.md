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

### Walk-through and self-check

The context budget is shared: instructions, submitted code, prior turns,
retrieved passages, and the generated answer all consume it. If an app adds
history without trimming it, an otherwise valid new request can exceed the
model's limit. Count or estimate with the chosen model's tokenizer rather than
using characters as a substitute.

```text
available input = context limit - reserved output - safety margin
```

**Think about it:** Does a 1,000-character snippet always have the same token
count? **Answer:** no; tokenization depends on text and model.

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

### Walk-through and self-check

Roles make the intended source of instructions explicit. Keep application
instructions stable and put the submitted code in a user message. Delimiters
help the model recognize the code region, but they do not make the region
trusted or prevent prompt injection.

```text
system: Explain code accurately; distinguish facts from assumptions.
user:   Explain this code:
        <code> ... untrusted source text ... </code>
```

**Think about it:** Can user-provided comments override the application's
rules? **Answer:** they should be treated as untrusted data; role separation
helps but is not a security boundary.

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

### Walk-through and self-check

Generation settings affect how an answer is produced, not whether it is true.
A token limit caps output length; a temperature changes sampling behavior for
providers that support it. Keep the cross-provider contract small and map
provider-specific knobs only when their semantics are understood.

```text
same prompt + different model/settings -> answers may differ
```

The app currently sends a maximum output-token setting and does not expose a
temperature knob. **Think about it:** Does temperature `0` guarantee a
repeatable correct answer? **Answer:** no; model versions and provider
execution can still vary, and correctness needs evaluation.

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

### Walk-through and self-check

The application contract should describe the capability the chat feature
needs, not reproduce every provider's request schema. Each adapter translates
the neutral request and translates the provider response back. This keeps
provider-specific JSON out of controllers and application logic.

```text
AICompletionRequest -> IAICompletionProvider -> Ollama/OpenAI wire format
```

**Think about it:** Why not adopt an orchestration framework automatically?
**Answer:** abstractions have a learning and maintenance cost; use one when
its orchestration capabilities solve a real workflow need.

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

### Walk-through and self-check

Selection is a server deployment decision in this app, not a request field.
That prevents a browser from choosing an unapproved endpoint or changing
where code is sent. Fail startup for an invalid provider name instead of
quietly falling back to another provider with different privacy and cost.

```text
validated configuration -> selector -> one provider adapter
```

**Think about it:** Why is silent fallback risky? **Answer:** it can change
data handling, availability, cost, and behavior without an operator's
knowledge.

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

### Walk-through and self-check

When output is consumed by code, deserialize into a typed structure and then
apply ordinary business validation. A model returning syntactically valid JSON
does not establish that an operation is allowed or that a claim is true.

```text
model text -> JSON parse -> schema check -> business rule check -> use
```

Structured output is planned only if a concrete feature needs it. **Think
about it:** Can a schema guarantee that a field's contents are safe?
**Answer:** no; schemas constrain shape, not trustworthiness or authorization.

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

### Walk-through and self-check

Streaming changes the contract from one completed response to a sequence of
events. The API must define event framing, completion, cancellation, and error
behavior; the UI must render partial text safely and indicate that it is not
final until completion.

```text
start -> chunk -> chunk -> completed
                    \----> error/cancel may occur before completion
```

**Think about it:** Can a client safely assume a stream will always end with
a complete answer? **Answer:** no; network failure or cancellation can leave
partial output.

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

### Walk-through and self-check

Compare providers with the same representative prompts and rubric, and record
the model/version, latency, output quality, and cost. Local inference may
reduce external data transfer but still needs secure hosting, updates, and
hardware capacity. Hosted inference shifts some operations to a vendor but
requires a data-processing decision.

**Think about it:** Is the cheapest model always the lowest-cost choice?
**Answer:** not necessarily; retries, poor answers, latency, review work, and
infrastructure all contribute to total cost.

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

### Walk-through and self-check

Use a fixed set of realistic snippets: common languages, short and long code,
malformed input, and examples where the correct response should say "not
enough information." Score observable qualities such as correctness,
coverage, clarity, and unsupported assertions; do not require identical
wording.

```text
prompt set + model/prompt version -> rubric scores -> reviewed comparison
```

**Think about it:** Why is one successful manual prompt not enough?
**Answer:** it does not cover variation or show whether a later change
regressed other inputs.

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

### Walk-through and self-check

The model may propose a tool call, but only application code can grant
authority. Validate the tool name and arguments, check the caller's permission,
bound time and resource use, and record the result. Do not execute arbitrary
source code or commands generated by a model.

```text
proposal -> allowlist -> validate args -> authorize user -> bounded execution
```

**Think about it:** Is a tool call safe because it is valid JSON? **Answer:**
no; syntax does not establish permission or safe side effects.

## Workbook implementation connection

The provider interface, config selector, prompt, and output-token limit are
implemented. Streaming, structured output, tool execution, and evaluations
remain optional or later work; do not add them simply to demonstrate a
technology.

## Deeper concepts: prompts, completion, and answer quality

### Prompt templates are structured inputs, not magic instructions

A prompt template is reusable text with named values inserted at execution
time. It keeps stable instructions separate from per-request data, makes
prompt changes reviewable, and reduces hand-built string variation. The
submitted code remains untrusted user content even if it is inserted into a
template.

```text
template: "Explain this {language} code in simple terms:\n{code}"
values:   language = "C#", code = user-submitted source
result:   instruction + labeled data -> provider messages
```

The current project builds the prompt in
[ChatApiService.cs](../../Services/ChatApiService.cs) using a raw string and
adds it as a user message. The prompt says the response should be simple and
under 200 words. It is not currently a separately stored template, and prompt
text does not enforce a hard output-length or safety rule.

### Chat completion is a request/response capability

A chat-completion request typically contains role-tagged messages and
generation settings; the provider returns generated text and sometimes
metadata. The provider adapter handles the vendor's HTTP schema, while the
application calls a provider-neutral interface.

```text
AICompletionRequest(messages, maxOutputTokens)
    -> IAICompletionProvider
    -> provider protocol
    -> AICompletionResponse(text)
```

In this project,
[AIMessage.cs](../../Services/AIMessage.cs) defines the shared role/content
message and the provider contract is in
[IAICompletionProvider.cs](../../Services/IAICompletionProvider.cs). This is a
single completion path, not a multi-step agent or durable conversation
history.

### Hallucinations and calibrated answers

A hallucination is a fluent statement that is unsupported or incorrect. A
language model predicts likely text; it does not automatically verify each
claim against the source code or documentation. Ask for uncertainty to be
named, provide relevant evidence, and test representative inputs. A disclaimer
alone does not make an answer reliable.

```text
submitted code + model knowledge -> proposed explanation
                                 -> compare claims with actual code/docs
                                 -> accept, correct, or reject
```

For the current code explainer, users must review explanations against their
source. A later RAG feature can return citations, but retrieval and citations
also need evaluation. **Interview check:** Does a lower temperature eliminate
hallucinations? **Answer:** no; it changes sampling behavior, not factual
grounding.

### Structured output: parse, then validate meaning

Structured output constrains response shape, often to JSON matching a schema.
The application still validates meaning, authorization, and bounds before
using fields. This project currently returns plain text; the following is a
future design example, not its API contract:

```json
{
  "summary": "The method filters inactive users.",
  "concepts": ["LINQ", "predicate"],
  "uncertainties": []
}
```

```text
model response -> parse JSON -> schema check -> domain checks -> display
```

Malformed JSON should be handled as a provider/protocol failure, and a
schema-valid response can still contain false claims. Do not execute
generated code or SQL just because the response parsed.

### Semantic Kernel: an optional orchestration library

Semantic Kernel provides abstractions for AI services, prompt functions,
plugins, and orchestration. It may help when an application has several
composed skills or tool workflows. It is not required for every app that calls
a model; this project currently uses a small provider-neutral contract and
direct adapters instead.

```text
simple use case: application -> completion interface -> provider adapter
orchestrated flow: kernel -> prompt/functions/plugins -> AI service(s)
```

Adding Semantic Kernel would introduce another abstraction and dependency.
Choose it only after identifying the workflow it simplifies; do not confuse
library adoption with reliability, grounding, or safe tool authorization.

### Evaluation rubric for this project

For each fixed code sample, score whether the answer is correct, covers the
important behavior, distinguishes fact from assumption, uses understandable
language, and avoids unsupported claims. Record provider/model and prompt
version so a comparison has context.

| Criterion | Self-check |
|---|---|
| Correctness | Does each claim match the submitted code? |
| Coverage | Are important branches or side effects explained? |
| Clarity | Can a learner explain the idea back in their own words? |
| Calibration | Does the answer say when context is missing? |
| Safety | Does it avoid instructing the user to run unreviewed output? |

Do not compare generated prose by exact string. Use a rubric and human review
for quality; deterministic tests should focus on the provider contract and
error behavior.
