import { LearningModuleSummary } from '../../../learning.models';

export const systemDesignModule: LearningModuleSummary = {
  "id": "system-design",
  "title": "System Design",
  "description": "Design for scale, failure, and clear operational guarantees across distributed components.",
  "topics": [
    {
      "id": "ecommerce-order-system",
      "title": "Scalable E-Commerce Order API",
      "priority": "Very High",
      "summary": "Design checkout as a durable, idempotent workflow that preserves inventory and payment invariants while downstream work scales independently."
    },
    {
      "id": "redis-distributed-cache",
      "title": "Redis Distributed Caching",
      "priority": "Very High",
      "summary": "A shared Redis cache can reduce repeated source reads across service instances, provided the system deliberately manages stale values, misses, and cache failure."
    },
    {
      "id": "distributed-rate-limiting",
      "title": "Distributed Rate Limiting",
      "priority": "High",
      "summary": "A distributed rate limiter applies shared request quotas across service replicas while controlling bursts and protecting downstream capacity."
    },
    {
      "id": "system-design-interview-method",
      "title": "System Design: From Requirements to Architecture",
      "priority": "Very High",
      "summary": "A repeatable system-design process turns an ambiguous product request into a testable architecture and explicit trade-offs."
    },
    {
      "id": "capacity-estimation",
      "title": "Capacity Estimation: Traffic, Storage & Latency",
      "priority": "Very High",
      "summary": "Back-of-the-envelope estimates translate product usage into rough traffic, storage, bandwidth, and capacity requirements."
    },
    {
      "id": "hld-url-shortener",
      "title": "HLD Case Study: URL Shortener",
      "priority": "High",
      "summary": "A URL shortener maps a compact key to a destination and redirects reads quickly while protecting key uniqueness and abuse boundaries."
    },
    {
      "id": "lld-inventory-reservation",
      "title": "LLD Case Study: Inventory Reservation",
      "priority": "High",
      "summary": "Low-level design turns a business operation into explicit domain objects, contracts, state transitions, and concurrency invariants."
    }
  ]
};
