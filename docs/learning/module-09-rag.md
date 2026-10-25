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
