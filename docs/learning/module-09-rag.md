# Module 09 — Retrieval-Augmented Generation and Responsible AI

**Workbook alignment:** Days 23–24 (RAG, embeddings, citations, prompt
injection, privacy, and evaluation). Related tracker topics: T081–T090.

> **Status:** RAG, document upload, vector search, and chat history are not
> implemented. These lessons map to the later RAG feature key and are not
> current runtime behavior.

## T081 — Embeddings and semantic similarity

- **What:** An embedding maps text to a numeric vector whose geometry can
  represent semantic similarity.
- **Why:** Similarity search can find relevant passages even when wording is
  different.
- **When:** Use embeddings for a defined retrieval corpus and evaluate model
  and domain fit.
- **Limits:** Similarity is not truth, authorization, or relevance assurance;
  embedding models and vector dimensions must match.
- **Diagram:** `text -> embedding model -> vector -> nearest candidates`
- **Project example (planned — key108):** embed approved knowledge documents
  only after ingestion, access, retention, and evaluation requirements exist.
- **Reference:** [OpenAI embeddings](https://platform.openai.com/docs/guides/embeddings)

## T082 — Document ingestion, parsing, and validation

- **What:** Ingestion extracts and validates content before it is searchable.
- **Why:** Bad files, hidden payloads, and wrong metadata can poison retrieval.
- **When:** Validate file type/size, parse safely, record source and ownership,
  and report rejected files.
- **Limits:** Parsing is format-specific and may lose structure; antivirus and
  parser hardening may be needed for public uploads.
- **Diagram:** `upload -> validate -> parse -> clean text + metadata -> index`
- **Project example (planned — key108):** no upload endpoint or document store
  exists. Add one only for user-authorized knowledge content.
- **Reference:** [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

## T083 — Chunking strategy and metadata

- **What:** Chunking divides documents into retrieval-sized passages;
  metadata retains source, owner, and context.
- **Why:** A whole document may exceed a model context window and retrieve
  irrelevant sections.
- **When:** Choose chunk size/overlap based on document structure and measured
  retrieval quality.
- **Limits:** Small chunks lose context; large chunks reduce precision and use
  more tokens.
- **Diagram:** `document -> sections/chunks + source ID + owner + version`
- **Project example (planned — key108):** document chunks must keep ownership
  and citation metadata so each match can be authorized and attributed.
- **Reference:** [Azure AI Search chunking](https://learn.microsoft.com/azure/search/vector-search-how-to-chunk-documents)

## T084 — Vector search, hybrid search, and filtering

- **What:** Vector search uses semantic similarity; hybrid search combines
  lexical and vector results; filters restrict candidate records.
- **Why:** Product names, identifiers, and semantic questions may benefit from
  different retrieval signals.
- **When:** Apply tenant/owner filters before or within retrieval, then compare
  retrieval approaches on a dataset.
- **Limits:** Cross-tenant retrieval is a data leak; vector scores are not
  universal relevance thresholds.
- **Diagram:** `authorized corpus -> vector + keyword search -> candidate passages`
- **Project example (planned — key108):** no search engine chosen. Tenant
  filtering is a security invariant, not a post-processing convenience.
- **Reference:** [Azure AI Search hybrid search](https://learn.microsoft.com/azure/search/hybrid-search-overview)

## T085 — Retrieval ranking, reranking, and context budgets

- **What:** Ranking orders candidate passages; reranking applies a second
  relevance pass; context budgets limit what is sent to the model.
- **Why:** The best few passages are more useful than a large noisy prompt.
- **When:** Measure precision/recall and preserve a token budget for the
  answer.
- **Limits:** Rerankers add latency/cost; ranking can still select misleading
  passages.
- **Diagram:** `candidates -> filter -> rank -> top-k -> token budget -> prompt`
- **Project example (planned — key108):** retrieval must fit within the same
  context budget as the user's prompt and conversation history.
- **Reference:** [Azure AI Search relevance](https://learn.microsoft.com/azure/search/search-relevance-overview)

## T086 — Citations, grounded answers, and insufficient evidence

- **What:** Grounding ties an answer to retrieved sources; citations identify
  which passages support claims.
- **Why:** Users need to verify information rather than trust confident prose.
- **When:** Return source references and allow the model/application to say
  evidence is insufficient.
- **Limits:** A citation can be irrelevant or fabricated unless validated
  against retrieved source identifiers.
- **Diagram:** `retrieved source IDs -> answer claims + validated citations`
- **Project example (planned — key108):** RAG response contract includes
  citations only from authorized retrieved documents.
- **Reference:** [Azure AI Search RAG](https://learn.microsoft.com/azure/search/retrieval-augmented-generation-overview)

## T087 — Retrieval evaluation and groundedness measurement

- **What:** Retrieval evaluation measures whether relevant evidence is found;
  groundedness checks whether answers are supported by that evidence.
- **Why:** A fluent answer may be wrong even when retrieval is configured.
- **When:** Build answerable and unanswerable evaluation cases before tuning
  chunking/ranking.
- **Limits:** Automated metrics are proxies; manually inspect representative
  failures and access-control behavior.
- **Diagram:** `query + expected source -> retrieve -> score relevance -> answer support`
- **Project example (planned — key108):** evaluate citations, abstention on
  unsupported questions, and tenant separation before enabling RAG.
- **Reference:** [Azure RAG evaluation](https://learn.microsoft.com/azure/ai-studio/concepts/evaluation-metrics-built-in)

## T088 — Indirect prompt injection in retrieved content

- **What:** Indirect injection is malicious instruction-like text embedded in
  content the application retrieves.
- **Why:** Retrieved text can influence the model even though it is not a
  trusted system instruction.
- **When:** Treat documents as untrusted data, isolate their role, minimize
  tool authority, and validate actions outside the model.
- **Limits:** Prompt delimiters and classifiers are not complete prevention;
  security must rely on application authorization.
- **Diagram:** `retrieved text (untrusted) -> model context -> no privileged action without server check`
- **Project example (planned — key108):** retrieved content will not grant
  permissions or authorize tool calls.
- **Reference:** [OWASP LLM Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)

## T089 — PII, retention, deletion, and data minimization

- **What:** Data governance defines what is collected, who can access it, how
  long it remains, and how it is deleted.
- **Why:** Submitted code, conversations, and uploaded documents can contain
  sensitive data.
- **When:** Decide retention and deletion before persistence or retrieval is
  built.
- **Limits:** Deletion may need to cover logs, backups, indexes, and derived
  embeddings; promises must match actual operations.
- **Diagram:** `collect minimum -> authorize -> retain by policy -> delete from all stores`
- **Project example (planned — key105/key108):** retention, export, and
  deletion policy are prerequisites to storing chat/document content.
- **Reference:** [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

## T090 — Responsible AI, human oversight, and refusal behavior

- **What:** Responsible AI considers reliability, privacy, fairness, user
  expectations, and human control.
- **Why:** Code explanations can be incomplete or unsafe despite fluent
  language.
- **When:** Make uncertainty visible and require a human to review consequential
  changes or generated actions.
- **Limits:** A disclaimer alone does not mitigate risk; review processes and
  evaluation must match impact.
- **Diagram:** `model suggestion -> user review -> human decision`
- **Project example (implemented product intent):** the API returns an
  explanation, not executable changes; future features must not run model
  output automatically.
- **Reference:** [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

## Workbook implementation connection

The current feature sends submitted code to a configured model and does not
claim to ground answers. RAG will be a separate authorized feature key with
ingestion, retrieval, citations, evaluation, and deletion controls; it should
not be added merely to demonstrate embeddings.

## Worked examples and practice

All examples below are design exercises for a future authorized knowledge
feature. They do not imply that the app currently uploads, embeds, or retrieves
documents.

### T081 — Embeddings find candidates, not truth

An embedding turns text into a vector. Similar vectors can indicate related
meaning, but relevance depends on the model and domain. A nearby passage is
only a candidate source; it is not proof that its claims are correct.

```text
"How do I configure provider?" -> embedding -> nearest approved passages
```

**Self-check:** Does a high similarity score prove the passage answers the
question? **Answer:** no; inspect and evaluate retrieval.

### T082 — Validate documents before parsing

An ingestion pipeline should check authorization, supported media type, size,
and safe parsing before indexing content. Preserve source and owner metadata
so search can enforce access later.

```text
upload -> authorize -> size/type check -> safe parse -> inspect -> index
```

**Self-check:** Should an unsupported file be silently skipped? **Answer:**
no; report a clear rejection and record a safe diagnostic.

### T083 — Chunk around meaning

Split on document structure where possible: headings, paragraphs, or code
blocks. Add overlap only when context crosses boundaries; too much overlap
creates duplicate results and wastes the model's context.

```text
document -> section chunks + source ID + owner + version + page/heading
```

**Self-check:** What is lost when a chunk is too small? **Answer:** relevant
context and the relationship between a statement and its surrounding
explanation.

### T084 — Combine search signals and enforce access early

Keyword search works well for exact identifiers; vector search helps with
meaning-based questions. Hybrid search can combine both. Apply tenant or
owner filtering as part of candidate retrieval, not after sending results to
the model.

```text
authorized filter -> keyword + vector candidates -> merged result set
```

**Self-check:** Why is post-retrieval filtering too late? **Answer:** an
unauthorized passage could already have reached logs or the model context.

### T085 — Rank within a token budget

Retrieve more candidates than will fit, remove unauthorized or duplicate
items, rank the remainder, then pack only the best passages under a token
budget that reserves room for the question and answer.

```text
top candidates -> authorize/deduplicate -> rank -> token budget -> prompt
```

**Self-check:** Should the prompt include every retrieved match? **Answer:**
no; irrelevant context can reduce answer quality and consume the model limit.

### T086 — Validate citations against retrieved sources

Have the application attach stable source IDs to the retrieved passages. The
answer may cite only those IDs, and the server should verify them before
returning citations. If relevant evidence is absent, the product should allow
an explicit "not enough evidence" response.

```json
{
  "answer": "The configured provider is selected at startup.",
  "citations": [{"sourceId": "doc-17", "section": "Provider setup"}]
}
```

This is a proposed shape, not an existing API response.
**Self-check:** Does a plausible citation text prove the source exists?
**Answer:** no; validate it against the retrieved source set.

### T087 — Evaluate retrieval and answer support separately

Measure whether the expected passage appears among retrieved results, then
measure whether the generated answer is supported by those passages. Include
questions with no answer in the corpus so the system is tested on abstention,
not only successful retrieval.

```text
query + expected source -> retrieval score
retrieved evidence + answer -> groundedness review
```

**Self-check:** Can a fluent answer hide a retrieval failure? **Answer:**
yes; evaluate evidence selection separately from prose quality.

### T088 — Limit authority when retrieved text is hostile

Retrieved documents are data, not policy. A document that contains
instruction-like text must not grant permissions or cause an action. Any
capability remains behind server-side allowlists and authorization.

```text
retrieved text -> model context (untrusted)
tool proposal -> allowlist + authorization -> bounded operation
```

**Self-check:** Does placing hostile text between delimiters make it safe?
**Answer:** no; delimiters help structure prompts but do not enforce authority.

### T089 — Define deletion across derived stores

Before indexing documents, map every copy: source file, extracted text,
chunks, vectors, caches, logs, and backups. A deletion promise is meaningful
only if the policy explains how each copy expires or is removed.

```text
delete request -> source + parsed text + chunks + vectors + cache
              -> backup expiry policy
```

**Self-check:** Is deleting the original file enough? **Answer:** no; derived
embeddings and indexed chunks may still contain recoverable content.

### T090 — Keep a human accountable for consequential output

Use the assistant to explain and suggest, not to silently alter or execute
code. Show limitations and provide a way to review source evidence. The level
of human oversight should increase with the impact of an action.

```text
AI explanation -> user verifies against code/docs -> user decides
```

**Self-check:** Does a disclaimer make a harmful automatic action acceptable?
**Answer:** no; the system should limit capabilities and keep a human decision
point where consequences warrant it.
