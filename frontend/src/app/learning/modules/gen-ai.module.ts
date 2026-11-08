import { LearningModule, topic } from '../learning.models';

export const genAiModule: LearningModule = {
  id: 'gen-ai-dotnet',
  title: 'Gen AI (.NET)',
  description:
    'Build .NET AI applications with governed retrieval, model routing, controlled tools, and safe streaming.',
  topics: [
    topic(
      'rag-architecture',
      'RAG Architecture in .NET',
      'Very High',
      'Retrieval-augmented generation (RAG) retrieves relevant authorized material at request time and supplies it to a language model as context.',
      [
        'WHAT — RAG combines document ingestion, chunking, embeddings, an index, retrieval, and generation. An embedding is a numeric representation used to find semantically similar text; a chunk is a bounded portion of a source document.',
        'WHY — It can ground answers in private or changing content without retraining the model and can expose source references. Retrieval improves evidence access, not factual guarantees.',
        'HOW — Extract and normalize documents; chunk with useful metadata; embed with a compatible model and index; retrieve candidates using query, hybrid/vector search, and tenant/ACL filters; optionally rerank; pass a bounded set to the model; return citations only for retrieved passages actually used. Re-index or remove content when sources, permissions, or embedding models change.',
      ],
      [
        'Ingest and version authorized source documents',
        'Chunk, embed, and index content with ACL metadata',
        'Filter, retrieve, and optionally rerank evidence',
        'Generate a bounded answer with source references',
      ],
      'An internal engineering assistant searches an Azure AI Search index. The API applies the signed-in user’s tenant and document permissions before retrieving chunks, then returns citations linked to the source versions supplied to the model.',
      `// Illustrative .NET flow; apply authorization in the index query.
var vector = await embeddingClient.EmbedAsync(query, cancellationToken);
var chunks = await search.SearchAsync(
    vector, filter: authorizedFilter, top: 8, cancellationToken);
var answer = await chat.CompleteAsync(
    BuildPrompt(query, chunks), cancellationToken);`,
      [
        [
          'Uses current private knowledge without model retraining',
          'Retrieved sources can make answers more inspectable',
        ],
        [
          'Bad extraction, chunking, or ACL filtering can produce unsafe answers',
          'Embedding, indexing, search, reranking, and generation add latency and cost',
        ],
      ],
      [
        'Use RAG when answers depend on changing, private, or source-citable reference data.',
        'Avoid treating vector similarity as proof, trusting prompt instructions from retrieved text, or retrieving before enforcing the caller’s document permissions.',
      ],
      [
        'What is an embedding, and why must the query and index models be compatible?',
        'How do chunk size and overlap affect recall, precision, and token cost?',
        'Where should tenant and document ACL filters be enforced?',
        'How would you measure retrieval quality separately from answer quality?',
      ],
      'A support assistant returns another tenant’s project note. Treat this as an authorization defect, not merely a prompt defect: apply tenant and per-document ACL filters in the retrieval layer, test with adversarial cross-tenant queries, reindex changed permissions, and audit source IDs without logging sensitive content.',
      [
        {
          label: 'Retrieval augmented generation concepts',
          url: 'https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview',
        },
        {
          label: 'Azure AI Search vector search',
          url: 'https://learn.microsoft.com/azure/search/vector-search-overview',
        },
        {
          label: 'Azure AI Search security',
          url: 'https://learn.microsoft.com/azure/search/search-security-overview',
        },
        {
          label: 'Microsoft.Extensions.AI overview',
          url: 'https://learn.microsoft.com/dotnet/ai/microsoft-extensions-ai',
        },
      ],
      {
        diagram: [
          {
            label: 'Source documents',
            detail:
              'Versioned content and permissions; changes and deletions must propagate to the index.',
          },
          {
            label: 'Ingestion pipeline',
            detail: 'Extract, chunk, attach ACL/tenant metadata, embed, and index.',
          },
          {
            label: 'Authorized retrieval',
            detail:
              'Filter by caller permissions before selecting top candidates; rerank if useful.',
          },
          {
            label: 'Grounded generation',
            detail:
              'Send bounded evidence with clear untrusted-source boundaries and instructions.',
          },
          {
            label: 'Answer and citations',
            detail: 'Return references to evidence actually included; measure quality and leakage.',
          },
        ],
        diagramNote:
          'RAG is an evidence pipeline, not a truth guarantee. Authorization must constrain retrieval before private chunks enter model context.',
        exampleSteps: [
          'Establish source ownership, document IDs, ACLs, update/delete events, and data classification.',
          'Evaluate chunking and embedding choices on representative queries; keep model and index dimensions compatible.',
          'Apply tenant and document filters in the search request, then rerank and cap context by token budget.',
          'Measure retrieval recall, citation correctness, groundedness, latency, and cost independently.',
        ],
        keyTakeaways: [
          'Retrieval authorization is a data-security boundary.',
          'A high similarity score means related text, not necessarily a correct answer.',
          'Index updates, permission changes, and deletion require a defined synchronization path.',
        ],
        commonMistakes: [
          'Filtering only after retrieval or trusting the model to ignore unauthorized chunks.',
          'Indexing secrets or prompt-injection content without data classification and source controls.',
          'Citing a document just because it was in the index rather than confirming it was retrieved and used.',
        ],
        bestPractices: [
          'Apply ACL filters in the retrieval operation and test tenant isolation with negative cases.',
          'Version the ingestion pipeline and embedding model; re-embed when dimensions or semantics change.',
          'Set context and token budgets, cite source versions, and monitor retrieval quality, access denials, and spend.',
        ],
        summary:
          'A dependable RAG system controls source permissions, retrieval quality, context size, and citation traceability end to end.',
      },
    ),
    topic(
      'multi-model-ai-gateway',
      'Multi-Model AI Gateway',
      'Very High',
      'A model gateway is an application boundary that applies policy and routes model requests to one or more approved deployments.',
      [
        'WHAT — A gateway validates requests, selects an approved model/deployment, invokes it, and returns a controlled response. Microsoft.Extensions.AI supplies .NET abstractions such as IChatClient, but it does not automatically provide routing, governance, or resilience.',
        'WHY — Central control can enforce budgets, telemetry, quotas, model allowlists, and provider-specific details. It also adds a critical service boundary whose availability, privacy, and latency must be managed.',
        'HOW — Classify data and request capability first; route by policy, not solely by lowest price. Use managed identity and private connectivity where supported, enforce per-user and per-model quotas, and collect token/latency/error metrics. Retry only transient failures within a deadline; do not blindly repeat non-idempotent tool effects or send sensitive prompts to an unapproved fallback. Account for prompt and completion tokens, embeddings, cache/storage, and regional deployment quota.',
      ],
      [
        'Authenticate and classify the request',
        'Enforce model, region, and budget policy',
        'Select a compatible deployment',
        'Invoke with deadline and bounded resilience',
        'Normalize response and record safe telemetry',
      ],
      'Route a low-risk classification request to a lower-cost deployment and a complex synthesis task to a stronger approved model. Keep data residency and quality constraints explicit, and fall back only to a deployment approved for that data class.',
      `public interface IModelRoute
{
    Task<string> CompleteAsync(
        ModelRequest request, CancellationToken cancellationToken);
}

var route = router.Select(policyClass, requestedCapability);
var result = await route.CompleteAsync(request, cancellationToken);`,
      [
        [
          'Central policies and provider changes are easier to manage',
          'Routing can balance capability, quota, latency, and cost',
        ],
        [
          'A gateway adds latency, operating cost, and another failure domain',
          'A lowest-common-denominator API can hide provider-specific features or safety behavior',
        ],
      ],
      [
        'Use a gateway when model choice, policy, quota, or provider abstraction is a real cross-cutting need.',
        'Avoid automatic cross-provider fallback without reviewing data handling, residency, capability parity, quality, and user-visible behavior.',
      ],
      [
        'What should a model-routing policy consider beyond price?',
        'Which concerns does Microsoft.Extensions.AI abstract and which remain application responsibilities?',
        'When is retry safe for a model request that can invoke tools?',
        'How do you prevent a fallback from violating data residency?',
      ],
      'A regional model deployment hits quota during a traffic spike. Apply per-tenant limits and bounded backoff with jitter, shed or queue noncritical work, and route only to a pre-approved deployment in the allowed region. Track token cost, 429s, latency, and quality so retries do not amplify overload.',
      [
        {
          label: 'Microsoft.Extensions.AI overview',
          url: 'https://learn.microsoft.com/dotnet/ai/microsoft-extensions-ai',
        },
        {
          label: 'Azure OpenAI quotas and limits',
          url: 'https://learn.microsoft.com/azure/ai-services/openai/quotas-limits',
        },
        {
          label: 'Azure OpenAI data, privacy, and security',
          url: 'https://learn.microsoft.com/legal/cognitive-services/openai/data-privacy',
        },
        {
          label: 'Azure OpenAI networking',
          url: 'https://learn.microsoft.com/azure/ai-services/openai/how-to/network',
        },
      ],
      {
        diagram: [
          {
            label: 'Caller and policy',
            detail: 'Authenticate, classify data, validate capability, and enforce tenant budget.',
          },
          {
            label: 'Route decision',
            detail:
              'Allowlisted deployment by region, model capability, quota, and privacy policy.',
          },
          {
            label: 'Resilient invocation',
            detail: 'Deadline, concurrency cap, transient-only bounded retry, and cancellation.',
          },
          {
            label: 'Model deployment',
            detail: 'Private or approved network path, identity, quota, and token-metered usage.',
          },
          {
            label: 'Governed response',
            detail:
              'Normalize supported fields; record redacted telemetry, quality, latency, and spend.',
          },
        ],
        diagramNote:
          'The gateway can centralize controls, but it cannot erase differences in model capabilities, provider data handling, or failure semantics.',
        exampleSteps: [
          'Define data classes, allowed regions/deployments, task capabilities, and per-tenant budgets.',
          'Implement routing behind an explicit interface while preserving necessary provider-specific options.',
          'Set request deadlines, concurrency limits, bounded retries for transient errors, and cancellation.',
          'Exercise quota exhaustion, provider outage, and forbidden-fallback cases; measure cost and response quality.',
        ],
        keyTakeaways: [
          'A shared client abstraction is not a complete gateway or policy engine.',
          'Fallback changes data destination, capability, cost, and sometimes safety behavior.',
          'Retries can increase token spend and worsen throttling if they are unbounded.',
        ],
        commonMistakes: [
          'Retrying every 429 or timeout immediately and creating a request storm.',
          'Failing over to a different region/provider without checking residency and retention policy.',
          'Logging full prompts and completions to central telemetry by default.',
        ],
        bestPractices: [
          'Apply explicit data classification, model allowlists, tenant budgets, concurrency limits, and region policy.',
          'Use bounded exponential backoff with jitter only for retryable failures and respect request deadlines.',
          'Track tokens, latency, throttles, errors, and quality while redacting sensitive content.',
        ],
        summary:
          'A model gateway is useful when it enforces explicit routing and budget policy; abstraction alone does not provide safe failover.',
      },
    ),
    topic(
      'llm-function-calling',
      'LLM Function & Tool Calling',
      'High',
      'Tool calling lets a model propose a structured request; trusted application code decides whether and how to execute it.',
      [
        'WHAT — A tool is an application-defined operation described to a model by name, purpose, and argument schema. The model emits a proposed call; the host application—not the model—executes the operation.',
        'WHY — Tools connect language-model interactions to current data and controlled actions, but they expand the authorization, input-validation, side-effect, and prompt-injection attack surface.',
        'HOW — Offer a small allowlist with strict schemas; parse and validate arguments; independently authenticate and authorize the user and resource; enforce business rules, quotas, deadlines, and idempotency; require confirmation for consequential actions; execute least-privileged code; return bounded, sanitized results. Treat tool output and retrieved documents as untrusted input to subsequent model turns.',
      ],
      [
        'Describe narrow, typed tools',
        'Model proposes a name and arguments',
        'Host validates, authorizes, and applies policy',
        'Execute safely and return bounded result',
      ],
      'The model proposes FindOrder with an order ID. The server verifies that the authenticated caller owns that order before querying it; the model’s choice of ID never substitutes for authorization.',
      `if (tool.Name == "FindOrder" &&
    Guid.TryParse(tool.Arguments["id"], out var id) &&
    await authorization.CanReadOrderAsync(user, id, cancellationToken))
{
    return await orders.FindAsync(id, cancellationToken);
}

throw new UnauthorizedAccessException();`,
      [
        [
          'Connects model reasoning to application data and actions',
          'Typed schemas make argument validation more predictable',
        ],
        [
          'Model output is untrusted and may be malformed or manipulated',
          'Tool execution can cause costly or irreversible side effects',
        ],
      ],
      [
        'Use explicit allowlists, strict argument validation, server-side authorization, least privilege, timeouts, audit logs, and confirmation for high-impact actions.',
        'Never execute model-generated code, use model-selected identity/authorization, or expose a broad generic database/shell tool.',
      ],
      [
        'Who actually executes a function call?',
        'Why is validating the JSON schema not sufficient authorization?',
        'When should an action require user confirmation or idempotency?',
        'How can retrieved prompt-injection text influence a tool request?',
      ],
      'A model requests a refund for an order belonging to another user. Recheck ownership, refund window, amount limit, and idempotency in the server-side action; require confirmation for policy-defined high-impact refunds, audit the decision, and return no unrelated customer data.',
      [
        {
          label: 'Function calling with Azure OpenAI',
          url: 'https://learn.microsoft.com/azure/ai-services/openai/how-to/function-calling',
        },
        {
          label: 'Microsoft.Extensions.AI overview',
          url: 'https://learn.microsoft.com/dotnet/ai/microsoft-extensions-ai',
        },
        {
          label: 'Azure OpenAI content filtering',
          url: 'https://learn.microsoft.com/azure/ai-services/openai/concepts/content-filter',
        },
      ],
      {
        diagram: [
          {
            label: 'Trusted tool registry',
            detail: 'Small allowlist of narrow operations with explicit argument schemas.',
          },
          {
            label: 'Model proposal',
            detail: 'Untrusted tool name and arguments; not executable code or authorization.',
          },
          {
            label: 'Host policy checks',
            detail:
              'Schema, identity, resource ownership, business limits, consent, and idempotency.',
          },
          {
            label: 'Least-privilege execution',
            detail: 'Scoped credentials, timeout, bounded result, and side-effect audit.',
          },
          {
            label: 'Model continuation',
            detail: 'Sanitized result is still untrusted context; final output needs validation.',
          },
        ],
        diagramNote:
          'The trust boundary belongs in host code. A tool schema guides generation but does not authenticate the user or grant access.',
        exampleSteps: [
          'Design one narrow operation with typed inputs and a bounded result.',
          'Validate syntax and business constraints, then authorize the signed-in caller against the specific resource.',
          'Use scoped credentials, idempotency, deadlines, rate limits, and explicit confirmation for risky side effects.',
          'Log operation identity and outcome without storing unnecessary prompts, secrets, or sensitive tool results.',
        ],
        keyTakeaways: [
          'The model proposes; application code authenticates, authorizes, and executes.',
          'Every tool call is an untrusted request, including calls with schema-valid arguments.',
          'Prompt injection can originate in user input, retrieved documents, or tool results.',
        ],
        commonMistakes: [
          'Treating a valid tool schema or model instruction as proof that the caller may perform the action.',
          'Providing a powerful catch-all tool that can query arbitrary data or execute arbitrary commands.',
          'Retrying a side-effecting operation without a durable idempotency key.',
        ],
        bestPractices: [
          'Authorize every resource access in the tool handler using the caller’s verified identity.',
          'Require confirmation and idempotency for financial, destructive, or externally visible actions.',
          'Use least privilege, bounded outputs, timeouts, audit events, and adversarial prompt-injection tests.',
        ],
        summary:
          'Tool calling is a proposed interaction protocol; safe execution depends on ordinary server-side security and business controls.',
      },
    ),
    topic(
      'prompt-streaming-guardrails',
      'Prompting, Streaming & Guardrails',
      'High',
      'Prompts define task context, streaming delivers partial output, and guardrails reduce risks through input, output, and resource controls.',
      [
        'WHAT — A prompt is the structured instruction, user input, history, and context sent to a model. Streaming emits generated pieces before completion. Guardrails are layered checks on data, requests, outputs, and tool actions.',
        'WHY — Clear bounded prompts improve consistency; streaming reduces perceived wait time. Both increase operational complexity: partial text may be unsafe or incomplete, while longer context increases token use, latency, and exposure.',
        'HOW — Classify and minimize input, budget prompt/history/retrieval/output tokens, and validate the task. For streaming, propagate cancellation, frame transport correctly, define completion/error events, and decide whether moderation occurs before display, per chunk, or via buffering. SSE is a one-way server-to-client event stream over HTTP; it is not a moderation or delivery guarantee. Apply content filters and application policy checks, but do not claim they eliminate hallucinations or prompt injection.',
      ],
      [
        'Classify and minimize input',
        'Build a bounded prompt and enforce model limits',
        'Stream chunks with cancellation and explicit terminal status',
        'Apply safety, output, and cost controls',
      ],
      'A .NET API streams generated text to an Angular client over server-sent events. It forwards disconnect cancellation to the model, emits explicit completion or error events, and chooses per-chunk moderation or short buffering according to the product’s risk tolerance.',
      `await foreach (var chunk in model.StreamAsync(
    prompt, cancellationToken))
{
    await response.WriteAsync(
        $"data: {SerializeForSse(chunk)}\\n\\n",
        cancellationToken);
    await response.Body.FlushAsync(cancellationToken);
}`,
      [
        [
          'Streaming improves perceived responsiveness',
          'Token and context limits support predictable resource use',
        ],
        [
          'Partial output complicates moderation, retries, and user trust',
          'Guardrails lower risk but cannot guarantee truthful or harmless output',
        ],
      ],
      [
        'Use explicit context and output budgets, input classification, cancellation, safe transport encoding, and completion/error states.',
        'Avoid exposing secrets, assuming chunk boundaries are sentence boundaries, or showing unmoderated output when the use case requires pre-display review.',
      ],
      [
        'Which prompt components count toward the context window and token bill?',
        'How does SSE differ from WebSockets?',
        'What should cancellation do after the client disconnects?',
        'Why can output filtering not guarantee factual correctness?',
      ],
      'A streamed response begins revealing sensitive content before the final moderation result. Classify data before model submission; for high-risk output, buffer or moderate chunks before display, terminate on policy violations, redact telemetry, and explain to clients when a stream ends partially.',
      [
        {
          label: 'Azure OpenAI content filtering',
          url: 'https://learn.microsoft.com/azure/ai-services/openai/concepts/content-filter',
        },
        {
          label: 'Azure OpenAI data, privacy, and security',
          url: 'https://learn.microsoft.com/legal/cognitive-services/openai/data-privacy',
        },
        {
          label: 'Azure OpenAI quotas and limits',
          url: 'https://learn.microsoft.com/azure/ai-services/openai/quotas-limits',
        },
        {
          label: 'Server-sent events specification',
          url: 'https://html.spec.whatwg.org/multipage/server-sent-events.html',
        },
      ],
      {
        diagram: [
          {
            label: 'Classified request',
            detail: 'Minimize data; redact secrets and decide whether the request is allowed.',
          },
          {
            label: 'Bounded prompt',
            detail:
              'Instructions, user input, history, retrieved context, and output share token limits.',
          },
          {
            label: 'Model stream',
            detail:
              'Incremental chunks, deadlines, cancellation, token quota, and transient failure handling.',
          },
          {
            label: 'Safety gate',
            detail:
              'Content policy and application checks before or during display; never a truth guarantee.',
          },
          {
            label: 'Client lifecycle',
            detail:
              'SSE event framing, partial output, terminal status, disconnect, and safe rendering.',
          },
        ],
        diagramNote:
          'Streaming is a transport choice, not a safety feature. Decide explicitly whether each chunk is safe to show before final completion.',
        exampleSteps: [
          'Set input data policy, prompt template, context/output limits, and per-user token budget.',
          'Choose buffering or per-chunk moderation based on the harm and latency tradeoff.',
          'Use correct SSE framing and safe serialization; propagate disconnect cancellation and emit terminal status.',
          'Test long prompts, throttling, client disconnects, partial failures, unsafe output, and cost limits.',
        ],
        keyTakeaways: [
          'Prompt instructions are not an authorization or security boundary.',
          'Token limits include all sent context and generated output; usage drives cost and quota.',
          'A partial stream may be incomplete, unmoderated, or impossible to safely resume.',
        ],
        commonMistakes: [
          'Rendering model output as trusted HTML or logging complete prompts and outputs indiscriminately.',
          'Treating final-response moderation as sufficient when earlier streamed chunks are already visible.',
          'Retrying a partially delivered generation as though the client never received any content.',
        ],
        bestPractices: [
          'Minimize and classify data before sending it; redact telemetry and never include credentials in prompts.',
          'Use bounded context, request deadlines, cancellation, token budgets, and per-user rate limits.',
          'Define moderation timing, safe rendering, SSE terminal/error semantics, and client behavior for partial results.',
        ],
        summary:
          'Build prompts and streams as bounded, untrusted data flows; moderation, transport, privacy, and cost need explicit policies.',
      },
    ),
  ],
};
