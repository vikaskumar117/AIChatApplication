import { LearningModuleSummary } from '../../../learning.models';

export const genAiDotnetModule: LearningModuleSummary = {
  "id": "gen-ai-dotnet",
  "title": "Gen AI (.NET)",
  "description": "Build .NET AI applications with governed retrieval, model routing, controlled tools, and safe streaming.",
  "topics": [
    {
      "id": "rag-architecture",
      "title": "RAG Architecture in .NET",
      "priority": "Very High",
      "summary": "Retrieval-augmented generation (RAG) retrieves relevant authorized material at request time and supplies it to a language model as context."
    },
    {
      "id": "multi-model-ai-gateway",
      "title": "Multi-Model AI Gateway",
      "priority": "Very High",
      "summary": "A model gateway is an application boundary that applies policy and routes model requests to one or more approved deployments."
    },
    {
      "id": "llm-function-calling",
      "title": "LLM Function & Tool Calling",
      "priority": "High",
      "summary": "Tool calling lets a model propose a structured request; trusted application code decides whether and how to execute it."
    },
    {
      "id": "prompt-streaming-guardrails",
      "title": "Prompting, Streaming & Guardrails",
      "priority": "High",
      "summary": "Prompts define task context, streaming delivers partial output, and guardrails reduce risks through input, output, and resource controls."
    }
  ]
};
