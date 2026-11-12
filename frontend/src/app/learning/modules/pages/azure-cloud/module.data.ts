import { LearningModuleSummary } from '../../../learning.models';

export const azureCloudModule: LearningModuleSummary = {
  "id": "azure-cloud",
  "title": "Azure Cloud",
  "description": "Choose Azure compute, messaging, and identity services with explicit scaling, delivery, networking, and security decisions.",
  "topics": [
    {
      "id": "azure-compute-services",
      "title": "App Service vs Functions vs Container Apps",
      "priority": "Very High",
      "summary": "Azure App Service, Azure Functions, and Azure Container Apps are managed compute platforms with different workload and operations boundaries."
    },
    {
      "id": "azure-messaging-services",
      "title": "Service Bus vs Event Hubs vs Event Grid",
      "priority": "Very High",
      "summary": "Azure Service Bus, Event Hubs, and Event Grid support distinct messaging semantics: durable work, retained event streams, and event notification routing."
    },
    {
      "id": "azure-key-vault-managed-identity",
      "title": "Key Vault & Managed Identity",
      "priority": "High",
      "summary": "Managed identity supplies an Azure workload identity; Key Vault controls access to stored secrets, keys, and certificates."
    },
    {
      "id": "azure-logic-apps",
      "title": "Azure Logic Apps & Workflow Automation",
      "priority": "Very High",
      "summary": "Logic Apps orchestrates connector-based workflows across services; it is best for integration and business processes, not as a substitute for every application service."
    },
    {
      "id": "azure-storage-services",
      "title": "Azure Storage: Blob, Queue, and Files",
      "priority": "High",
      "summary": "Azure Storage provides distinct primitives: Blob for object data, Queue Storage for simple messages, and Azure Files for managed file shares."
    },
    {
      "id": "azure-api-management",
      "title": "Azure API Management & Gateway Policies",
      "priority": "High",
      "summary": "API Management provides a managed API gateway and developer-facing API lifecycle capabilities; policies apply controlled cross-cutting behavior at the gateway."
    },
    {
      "id": "azure-monitor-resilience-cost",
      "title": "Azure Monitoring, Availability & Cost",
      "priority": "High",
      "summary": "Production Azure architecture connects service health and application telemetry to measurable reliability, recovery, and cost objectives."
    }
  ]
};
