import { LearningModuleSummary } from '../../../learning.models';

export const designPatternsModule: LearningModuleSummary = {
  "id": "design-patterns",
  "title": "Design Patterns & SOLID",
  "description": "Apply patterns and design principles when they clarify responsibilities, variation, and testable boundaries.",
  "topics": [
    {
      "id": "why-design-patterns",
      "title": "Patterns: What They Are and Why They Matter",
      "priority": "High",
      "summary": "A design pattern is a named, reusable arrangement of responsibilities and collaborations for a recurring design problem; it is guidance, not a library or a complete implementation."
    },
    {
      "id": "patterns-in-projects",
      "title": "Patterns Used Together in Projects",
      "priority": "High",
      "summary": "Production systems commonly combine a few patterns around a use case: dependency injection assembles collaborators, a strategy selects policy, a repository may encapsulate domain queries, and a decorator adds cross-cutting behavior."
    },
    {
      "id": "repository-pattern",
      "title": "Repository Pattern",
      "priority": "High",
      "summary": "A repository provides a domain-oriented boundary for retrieving and persisting aggregates while hiding persistence-specific details where that abstraction is valuable."
    },
    {
      "id": "unit-of-work-pattern",
      "title": "Unit of Work Pattern",
      "priority": "High",
      "summary": "A unit of work coordinates a set of related changes and commits them as one local persistence transaction where the store supports it."
    },
    {
      "id": "factory-pattern",
      "title": "Factory Pattern",
      "priority": "High",
      "summary": "A factory centralizes object creation when construction depends on input, configuration, or a family of related products."
    },
    {
      "id": "singleton-pattern",
      "title": "Singleton Pattern and DI Lifetime",
      "priority": "High",
      "summary": "Singleton describes one shared instance for a defined application/container lifetime; in .NET, singleton DI registration is often preferable to a globally accessible static instance."
    },
    {
      "id": "strategy-pattern",
      "title": "Strategy Pattern: Shipping Rate Example",
      "priority": "High",
      "summary": "Strategy defines a family of interchangeable algorithms behind a common contract so a caller can select behavior without embedding each algorithm in its own conditional logic."
    },
    {
      "id": "observer-pattern",
      "title": "Observer Pattern",
      "priority": "High",
      "summary": "Observer establishes a one-to-many notification relationship: a subject publishes a change or event and interested observers react without the subject directly owning each observer’s work."
    },
    {
      "id": "decorator-pattern",
      "title": "Decorator Pattern",
      "priority": "High",
      "summary": "Decorator wraps an object behind the same contract and adds behavior before or after delegating to the wrapped object."
    },
    {
      "id": "adapter-pattern",
      "title": "Adapter Pattern",
      "priority": "High",
      "summary": "Adapter translates one interface or data model into another so incompatible components can collaborate without changing either component’s core contract."
    },
    {
      "id": "dependency-injection-pattern",
      "title": "Dependency Injection Pattern",
      "priority": "High",
      "summary": "Dependency injection supplies an object’s required collaborators from outside rather than having the object construct or locate them itself."
    },
    {
      "id": "cqrs-pattern",
      "title": "CQRS",
      "priority": "High",
      "summary": "Command Query Responsibility Segregation separates operations that change state (commands) from operations that read and return data (queries)."
    },
    {
      "id": "solid-srp",
      "title": "SOLID: Single Responsibility Principle",
      "priority": "High",
      "summary": "Single Responsibility Principle (SRP) says a module should have one coherent reason to change, often expressed as one actor or policy that owns its behavior."
    },
    {
      "id": "solid-ocp",
      "title": "SOLID: Open/Closed Principle",
      "priority": "High",
      "summary": "Open/Closed Principle (OCP) says a component should support anticipated extension without requiring changes to stable existing code."
    },
    {
      "id": "solid-lsp",
      "title": "SOLID: Liskov Substitution Principle",
      "priority": "High",
      "summary": "Liskov Substitution Principle (LSP) requires a subtype to remain usable wherever its base contract is expected without breaking promised behavior or strengthening preconditions."
    },
    {
      "id": "solid-isp",
      "title": "SOLID: Interface Segregation Principle",
      "priority": "High",
      "summary": "Interface Segregation Principle (ISP) says clients should not depend on operations they do not use; interfaces should represent cohesive client needs."
    },
    {
      "id": "solid-dip",
      "title": "SOLID: Dependency Inversion Principle",
      "priority": "High",
      "summary": "Dependency Inversion Principle (DIP) says high-level policy should not depend directly on low-level details; both should depend on abstractions owned around the policy."
    },
    {
      "id": "repository-unit-testing",
      "title": "Repository Pattern and Unit Testing",
      "priority": "High",
      "summary": "A unit test verifies a focused unit of behavior with controlled collaborators; a repository can provide a seam for application behavior, but it does not make database behavior correct by itself."
    },
    {
      "id": "singleton-thread-safety",
      "title": "Singleton Thread Safety",
      "priority": "High",
      "summary": "Thread safety means concurrent operations preserve an object’s invariants and return valid results under the object’s shared-state access patterns."
    }
  ]
};
