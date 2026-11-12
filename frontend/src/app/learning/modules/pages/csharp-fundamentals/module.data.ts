import { LearningModuleSummary } from '../../../learning.models';

export const csharpFundamentalsModule: LearningModuleSummary = {
  "id": "csharp-fundamentals",
  "title": "C# Core Concepts & OOP",
  "description": "Architect-level understanding of C# types, polymorphism, reusable abstractions, and object-oriented design.",
  "topics": [
    {
      "id": "structs-classes-records",
      "title": "Struct vs Class vs Record",
      "priority": "Very High",
      "summary": "Classes model identity, structs model copied values, and records add value-oriented equality to either reference or value types."
    },
    {
      "id": "choosing-csharp-type",
      "title": "When to Use a Class, Struct, or Record",
      "priority": "High",
      "summary": "Choose types from domain semantics first, then validate allocation and copying costs with measurement."
    },
    {
      "id": "abstract-class-interface",
      "title": "Abstract Class vs Interface",
      "priority": "Very High",
      "summary": "An interface defines a substitutable capability contract; an abstract class can also own shared state and implementation."
    },
    {
      "id": "generics-variance",
      "title": "Generics & Variance",
      "priority": "Very High",
      "summary": "Generics parameterize reusable code with compile-time type safety; variance allows safe conversions between selected constructed types."
    },
    {
      "id": "generics-vs-object",
      "title": "Generics vs Object-Based APIs",
      "priority": "High",
      "summary": "Generics preserve the element type; object-based APIs erase it and move checking and conversion work to runtime."
    },
    {
      "id": "boxing-unboxing",
      "title": "Boxing and Unboxing",
      "priority": "High",
      "summary": "Boxing wraps a value type as an object/interface value; unboxing extracts a value of the exact value type."
    },
    {
      "id": "value-vs-reference-types",
      "title": "Value Types vs Reference Types",
      "priority": "High",
      "summary": "Value and reference types differ in assignment and identity semantics, not by a universal stack-versus-heap rule."
    },
    {
      "id": "ref-out-in",
      "title": "ref, out, and in Parameters",
      "priority": "High",
      "summary": "These modifiers pass a variable by reference with distinct initialization and mutation rules."
    },
    {
      "id": "overloading-overriding",
      "title": "Overloading vs Overriding",
      "priority": "Very High",
      "summary": "Overloading selects among same-named signatures at compile time; overriding replaces inherited virtual behavior at runtime."
    },
    {
      "id": "virtual-override-new",
      "title": "virtual, override, and new",
      "priority": "High",
      "summary": "virtual opens a polymorphic method slot, override participates in that slot, and new hides a member by name."
    },
    {
      "id": "oop-pillars",
      "title": "Four OOP Pillars in a Working Design",
      "priority": "Very High",
      "summary": "Encapsulation, abstraction, inheritance, and polymorphism are complementary techniques for controlling change."
    },
    {
      "id": "solid-srp",
      "title": "SRP: Single Responsibility Principle",
      "priority": "Very High",
      "summary": "A module should have one cohesive responsibility—one primary reason to change—not merely one method."
    },
    {
      "id": "solid-ocp",
      "title": "OCP: Open/Closed Principle",
      "priority": "High",
      "summary": "Stable code should accept new supported behavior through extension points rather than repeated edits to a central decision block."
    },
    {
      "id": "solid-lsp",
      "title": "LSP: Liskov Substitution Principle",
      "priority": "Very High",
      "summary": "A subtype must honor the behavioral promises clients rely on when using the base contract."
    },
    {
      "id": "solid-isp",
      "title": "ISP: Interface Segregation Principle",
      "priority": "High",
      "summary": "Clients should depend on focused interfaces containing only operations they actually need."
    },
    {
      "id": "solid-dip",
      "title": "DIP: Dependency Inversion Principle",
      "priority": "Very High",
      "summary": "High-level policy and low-level details should depend on stable abstractions, with implementation details kept at the edge."
    },
    {
      "id": "dependency-injection",
      "title": "Dependency Injection and Its Value",
      "priority": "Very High",
      "summary": "Dependency injection supplies an object’s collaborators from outside instead of having the object construct concrete dependencies itself."
    },
    {
      "id": "extension-methods",
      "title": "Extension Methods",
      "priority": "High",
      "summary": "An extension method adds callable syntax to a type without modifying or inheriting from that type."
    },
    {
      "id": "delegates-events-func-action",
      "title": "Delegates, Events, Func, and Action",
      "priority": "Very High",
      "summary": "Delegates are type-safe method references; Func and Action are standard delegate shapes, while events control publisher notifications."
    }
  ]
};
