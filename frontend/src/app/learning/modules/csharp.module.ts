import { LearningModule, topic } from '../learning.models';

const visual = (
  diagram: { label: string; detail: string }[],
  exampleSteps: string[],
  keyTakeaways: string[],
  commonMistakes: string[],
  bestPractices: string[],
  summary: string,
) => ({ diagram, diagramNote: 'Follow the labeled stages; each node names a concrete decision or runtime effect.', exampleSteps, keyTakeaways, commonMistakes, bestPractices, summary });

const csharpSources = [
  { label: 'Microsoft Learn: C# fundamentals', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/' },
  { label: 'Microsoft Learn: C# language reference', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/' },
];

export const csharpModule: LearningModule = {
  id: 'csharp-fundamentals',
  title: 'C# Core Concepts & OOP',
  description: 'Architect-level understanding of C# types, polymorphism, reusable abstractions, and object-oriented design.',
  topics: [
    topic('structs-classes-records', 'Struct vs Class vs Record', 'Very High',
      'Classes model identity, structs model copied values, and records add value-oriented equality to either reference or value types.',
      [
        'A class is a reference type: a variable holds a reference to an object. A struct is a value type: assignment copies its fields. A record is a class or struct with compiler-generated value equality and data-oriented members.',
        'These choices affect identity, equality, copying, inheritance, mutation, and allocation. “Structs live on the stack” is not a valid general rule: storage depends on context, and a struct can be a field inside a heap object or boxed.',
        'Class assignment copies a reference, not the object; struct assignment copies the value; a record with-expression creates a shallow copy. Equality for records compares their components, while classes default to reference identity unless equality is implemented.',
      ],
      ['Declare a Person class, struct, or record', 'Assign or copy the value', 'Observe identity, equality, and mutation semantics'],
      'Use PersonClass for an identity-bearing person, PersonStruct for a small value snapshot, and PersonRecord for concise value equality. The same Person data reveals different assignment behavior.',
      `using System;

public sealed class PersonClass
{
    public string Name { get; set; }
    public int Age { get; set; }
    public PersonClass(string name, int age) { Name = name; Age = age; }
}

public struct PersonStruct
{
    public string Name { get; set; }
    public int Age { get; set; }
    public PersonStruct(string name, int age) { Name = name; Age = age; }
}

public sealed record PersonRecord(string Name, int Age);

public static class Program
{
    public static void Main()
    {
        var classA = new PersonClass("Mira", 30);
        var classB = classA;
        classB.Age = 31;
        Console.WriteLine(classA.Age); // 31: both references point to one object

        var structA = new PersonStruct("Mira", 30);
        var structB = structA;
        structB.Age = 31;
        Console.WriteLine(structA.Age); // 30: assignment copied the fields

        var recordA = new PersonRecord("Mira", 30);
        var recordB = recordA with { Age = 31 };
        Console.WriteLine(recordA == new PersonRecord("Mira", 30)); // True
        Console.WriteLine(recordB.Age); // 31; recordA is unchanged
    }
}`,
      [['Explicit identity and object sharing', 'Value equality for record data'], ['Aliasing can make mutation surprising', 'Large or mutable structs can copy expensively and behave unexpectedly']],
      ['Choose class for identity/lifecycle, record for value-shaped data, and struct for a small value with clear copy semantics.', 'Do not choose struct to force stack allocation or assume record immutability is deep.'],
      ['What is copied when assigning a class variable?', 'Are structs always stored on the stack?', 'Is a record with-copy deep or shallow?'],
      'A service sees allocation pressure in order processing. Keep Order as an identity-bearing class; profile first, then benchmark a small immutable Money struct if value semantics fit.',
      csharpSources,
      visual(
        [{ label: 'Class assignment', detail: 'Copies a reference; two variables can observe mutation of one Person object.' }, { label: 'Struct assignment', detail: 'Copies fields; changing the copied PersonStruct leaves the original unchanged.' }, { label: 'Record equality', detail: 'Compares declared data; with creates a distinct shallow copy.' }],
        ['Construct classA and alias it as classB; mutate through classB.', 'Copy structA into structB; mutate only the copy.', 'Compare two records with the same Name and Age, then create a modified with-copy.'],
        ['Semantics are more important than assumed memory location.', 'Records provide value-oriented equality, not automatic deep immutability.', 'Mutable structs and identity-bearing records need deliberate justification.'],
        ['Assuming every struct is stack allocated.', 'Treating record with as a deep clone.', 'Using records for entities whose identity is independent of their fields.'],
        ['Document equality and identity expectations in domain types.', 'Keep structs small, preferably immutable, and benchmark performance claims.', 'Use class for shared mutable entity identity.'],
        'Class variables share object identity; struct assignment copies a value; records compare data and support shallow non-destructive copies.',
      )),

    topic('choosing-csharp-type', 'When to Use a Class, Struct, or Record', 'High',
      'Choose types from domain semantics first, then validate allocation and copying costs with measurement.',
      [
        'A domain entity has identity over time; a value object is defined by its contents; a struct is a value type with copy semantics. A record can model either record class or record struct data.',
        'Matching the type to the concept makes equality, collection behavior, change tracking, and API expectations predictable. A wrong type can produce accidental shared mutation or expensive copies.',
        'Ask whether two equal-looking instances represent the same entity, whether callers should share mutation, whether values are small and immutable, and whether inheritance is needed. Measure allocation and throughput only after semantics are sound.',
      ],
      ['Identify domain identity', 'Choose equality and mutation policy', 'Measure only the remaining performance question'],
      'A customer has stable identity and lifecycle, so use a class; an address/value snapshot can be a record; a tiny immutable coordinate can be a struct.',
      `public sealed class Customer
{
    public Guid Id { get; }
    public string Name { get; private set; }
    public Customer(Guid id, string name) { Id = id; Name = name; }
    public void Rename(string name) => Name = name;
}

public sealed record Address(string City, string PostalCode);
public readonly record struct Point(int X, int Y);`,
      [['Types communicate domain semantics', 'Small immutable values can be efficient'], ['Copying and equality rules affect API behavior', 'Micro-optimizing without profiling can add complexity']],
      ['Use classes for entities with identity and lifecycle, records for value-shaped data, and small immutable structs for lightweight values.', 'Avoid mutable structs and changing domain types solely from stack/heap myths.'],
      ['Why is Customer usually an entity class?', 'When is a record struct suitable?', 'What should be measured before optimizing allocations?'],
      'In an order platform, keep Customer and Order as entities, represent Money with a carefully validated value type, and treat addresses as values only if field equality reflects business rules.',
      csharpSources,
      visual(
        [{ label: 'Entity test', detail: 'Does identity persist when fields change? If yes, model lifecycle and identity explicitly.' }, { label: 'Value test', detail: 'Are two instances interchangeable when their contents match? Consider record equality.' }, { label: 'Copy-cost test', detail: 'Is the value small and immutable enough that copying is simple and cheap?' }],
        ['Check whether the domain distinguishes two instances with equal fields.', 'Specify whether mutation should be shared or isolated.', 'Select class, record, or struct, then profile realistic workloads.'],
        ['Domain meaning chooses the semantics.', 'Records are not only classes; record structs also exist.', 'Performance claims require representative measurement.'],
        ['Making all DTOs structs to avoid heap allocations.', 'Assuming every data record should be a C# record.', 'Ignoring equality implications in dictionaries and sets.'],
        ['Write equality tests for value objects.', 'Keep entity identity explicit and stable.', 'Profile allocations and copies under production-like load.'],
        'Model entities as identity, value objects as content, and use structs only when their small-value copy semantics are a good fit.',
      )),

    topic('abstract-class-interface', 'Abstract Class vs Interface', 'Very High',
      'An interface defines a substitutable capability contract; an abstract class can also own shared state and implementation.',
      [
        'A contract is the behavior callers can rely on. An interface declares that contract and can be implemented alongside other interfaces; an abstract base class may store protected state, constructors, and shared virtual behavior.',
        'Interfaces create replaceable boundaries between policy and implementations. Base classes can centralize genuine invariants, but inheritance couples derived types to the base lifecycle and design.',
        'Callers dispatch through the declared abstraction to the concrete implementation. Default interface members exist, but are not a substitute for thoughtful versioning or shared state.',
      ],
      ['Express behavior as a contract', 'Implement or inherit the contract', 'Call through abstraction and dispatch to implementation'],
      'A checkout depends on IPaymentGateway so card and bank-transfer adapters can be substituted; a shared base class is appropriate only if they truly share stateful invariants.',
      `public interface IPaymentGateway
{
    Task PayAsync(decimal amount, CancellationToken cancellationToken);
}

public sealed class CardGateway : IPaymentGateway
{
    public Task PayAsync(decimal amount, CancellationToken cancellationToken)
        => Task.CompletedTask;
}`,
      [['Multiple contracts and unrelated implementations', 'Abstract base can centralize invariant behavior'], ['Interface proliferation adds indirection', 'Base-class changes can break all derived classes']],
      ['Use interfaces at replacement/testing boundaries and abstract classes for coherent shared state or invariants.', 'Avoid deep inheritance and interfaces that simply mirror every class without a real boundary.'],
      ['Can one class implement multiple interfaces?', 'When is an abstract class preferable?', 'What does polymorphic dispatch mean here?'],
      'Support two payment providers without leaking provider details into checkout. Define a narrow interface, inject an adapter, and preserve provider-specific idempotency and retry policies inside each implementation.',
      csharpSources,
      visual(
        [{ label: 'Caller contract', detail: 'Checkout asks for PayAsync without knowing provider implementation.' }, { label: 'Interface boundary', detail: 'IPaymentGateway states the capability and keeps providers independently replaceable.' }, { label: 'Concrete dispatch', detail: 'CardGateway executes its implementation; another adapter can satisfy the same contract.' }],
        ['Declare only the payment capability callers need.', 'Implement it in a provider adapter.', 'Pass the adapter to business logic through the interface.'],
        ['Interfaces model capabilities; abstract classes model a shared family.', 'A type may implement several interfaces but only inherit one class.', 'Dependency injection can compose either abstraction.'],
        ['Creating interfaces with no independent client or replacement need.', 'Using a base class only to share a few unrelated helper methods.'],
        ['Keep contracts small and stable.', 'Put provider-specific behavior behind adapters.', 'Test business rules against the contract and adapter integration separately.'],
        'Interfaces enable independent substitution; abstract classes share state and implementation when a true inheritance relationship exists.',
      )),

    topic('generics-variance', 'Generics & Variance', 'Very High',
      'Generics parameterize reusable code with compile-time type safety; variance allows safe conversions between selected constructed types.',
      [
        'A type parameter such as T stands for a type selected by a caller; a generic definition can constrain which types are legal. A closed type such as List<string> fixes T to string. Variance is a declared safe conversion for generic interfaces and delegates.',
        'Generics let APIs express their real input/output types, catch mismatches at compile time, and avoid repeated casts. They also support reusable collections, algorithms, and service contracts.',
        'The compiler and runtime retain generic type information. Constraints such as where T : IEntity state required capabilities; covariance and contravariance are available only in safe interface/delegate positions.',
      ],
      ['Declare a type parameter', 'Constrain required capabilities', 'Use the same typed abstraction without casts'],
      'A repository can return Customer objects directly rather than returning object values that every caller must cast.',
      `public interface IEntity { Guid Id { get; } }
public interface IRepository<T> where T : IEntity
{
    Task<T?> FindAsync(Guid id, CancellationToken cancellationToken);
}
public interface IProducer<out T> { T Get(); }
public interface IConsumer<in T> { void Accept(T value); }

public sealed record Customer(Guid Id, string Name) : IEntity;
public sealed class CustomerRepository : IRepository<Customer>
{
    public Task<Customer?> FindAsync(Guid id, CancellationToken cancellationToken)
        => Task.FromResult<Customer?>(new Customer(id, "Mira"));
}

public static class Program
{
    public static void Main()
    {
        IEnumerable<string> names = new List<string>();
        IEnumerable<object> objects = names; // covariance
        Action<object> logObject = value => Console.WriteLine(value);
        Action<string> logString = logObject; // contravariance
    }
}`,
      [['Reusable compile-time type safety', 'Constraints document required capabilities'], ['Complex constraints can obscure APIs', 'Over-generalized frameworks are harder to evolve']],
      ['Use generics when behavior is genuinely reusable across types and preserve precise type information.', 'Avoid generic abstractions whose type parameters do not affect meaningful behavior.'],
      ['What does a generic constraint guarantee?', 'Why is IRepository<Customer> safer than an object repository?', 'Where can variance be declared?'],
      'A persistence library supports several entity types. Keep generic CRUD operations constrained by actual requirements and keep domain-specific queries explicit.',
      csharpSources,
      visual(
        [{ label: 'Open generic contract', detail: 'IRepository<T> states the shape before a concrete entity is selected.' }, { label: 'Constraint check', detail: 'where T : IEntity requires an Id capability at compile time.' }, { label: 'Closed implementation', detail: 'IRepository<Customer> carries Customer types end-to-end without casts.' }],
        ['Declare the type parameter T.', 'Add only constraints the implementation actually needs.', 'Implement and call the closed IRepository<Customer> type.'],
        ['Type parameters preserve the caller’s useful type.', 'Constraints are compile-time guarantees.', 'Generic reuse should represent real common behavior.'],
        ['Using object inside a generic class and losing type safety.', 'Adding constraints that are unrelated to the algorithm.', 'Creating a universal repository that hides domain queries.'],
        ['Prefer type-safe inputs and outputs.', 'Constrain to required capabilities, not a particular implementation.', 'Test generic behavior with representative types.'],
        'Generics provide reusable APIs that retain concrete type information and enable compiler-checked constraints.',
      )),

    topic('generics-vs-object', 'Generics vs Object-Based APIs', 'High',
      'Generics preserve the element type; object-based APIs erase it and move checking and conversion work to runtime.',
      [
        'object is the common base reference type for values, while T is a generic placeholder resolved for a typed use. An object collection can contain unrelated values; a List<T> expresses one element type.',
        'A typed API catches invalid additions and return-value mismatches during compilation. An object-based API often requires casts, can fail at runtime, and may box value types.',
        'Use object only for genuinely heterogeneous values or interoperability. For heterogeneous domain data, a discriminated design such as a base type or tagged union is often safer.',
      ],
      ['Compare storage contracts', 'Compile-time type check versus runtime cast', 'Choose heterogeneous or typed representation'],
      'A List<int> prevents inserting a string and returns an int without casting; ArrayList accepts both and fails when the caller assumes the wrong type.',
      `var typed = new List<int> { 1, 2 };
int total = typed[0] + typed[1];

var untyped = new System.Collections.ArrayList { 1, "two" };
int first = (int)untyped[0]; // runtime cast required
// int second = (int)untyped[1]; // InvalidCastException`,
      [['Compile-time guarantees', 'No casts at typed call sites'], ['Object collections can represent mixed data', 'Casts and value boxing add risk and possible overhead']],
      ['Prefer generic collections and APIs when a collection has a known element type.', 'Avoid object as a shortcut for missing domain modeling.'],
      ['What error is detected earlier by List<T>?', 'Why can object store an int but require a cast?', 'When is heterogeneity a real requirement?'],
      'An event pipeline handles several message types. Prefer a shared message contract or explicit tagged variants rather than object payloads that consumers blindly cast.',
      csharpSources,
      visual(
        [{ label: 'Generic list', detail: 'List<int> rejects strings and returns values as int.' }, { label: 'Object list', detail: 'ArrayList accepts mixed types and exposes object references.' }, { label: 'Conversion boundary', detail: 'Caller must cast; a mistaken assumption throws at runtime.' }],
        ['Add integers to List<int> and consume them without conversion.', 'Add mixed values to ArrayList.', 'Cast each value and observe the runtime risk.'],
        ['Prefer static types to runtime guesses.', 'Object is useful for actual heterogeneity, not as a default.', 'Value types placed in object are boxed.'],
        ['Casting every object without validating its runtime type.', 'Using object to avoid designing a stable message contract.'],
        ['Choose generic collections for homogeneous data.', 'Represent variants explicitly and validate at boundaries.', 'Keep object-based interop isolated.'],
        'Generic APIs preserve element type and catch errors early; object APIs defer correctness to runtime casts.',
      )),

    topic('boxing-unboxing', 'Boxing and Unboxing', 'High',
      'Boxing wraps a value type as an object/interface value; unboxing extracts a value of the exact value type.',
      [
        'A value type stores its value directly in its variable context. Boxing creates an object representation that contains a copy; unboxing checks and copies that value back out.',
        'Conversions to object or a non-generic interface can allocate and copy, affecting hot paths and identity expectations. Modern generic collections avoid common boxing cases.',
        'Boxing is implicit; unboxing requires an explicit cast and exact compatible type. Nullable values and interface dispatch have specific runtime rules, so inspect allocations rather than assuming every conversion boxes.',
      ],
      ['Convert value to object or interface', 'Runtime creates boxed copy', 'Unbox with exact type and copy value out'],
      'A value type passed to a method taking object is boxed. Prefer a generic method when the type can remain T.',
      `static object Box(int value) => value;
object boxed = Box(42);       // boxing: object contains a copy
int number = (int)boxed;      // unboxing: exact type required

static T Echo<T>(T value) => value;
int noObjectConversion = Echo(42);`,
      [['Required for object/interface compatibility', 'Generic APIs avoid many boxing conversions'], ['Boxing may allocate and copy', 'Wrong unbox type throws InvalidCastException']],
      ['Use generics for type-preserving hot paths and collections.', 'Avoid repeatedly boxing values in high-frequency loops without profiling.'],
      ['What is copied during boxing?', 'Why must unboxing name the exact value type?', 'How do generics reduce boxing?'],
      'A telemetry loop shows allocation spikes from formatting numeric values through object-based APIs. Use typed overloads or generic APIs, then verify allocation reduction with a profiler.',
      csharpSources,
      visual(
        [{ label: 'Value input', detail: 'The int variable contains the value 42.' }, { label: 'Box conversion', detail: 'Converting to object wraps a copy in a managed object representation.' }, { label: 'Exact unbox', detail: 'Casting to int validates the boxed type and copies the value back.' }],
        ['Pass an int to an object-returning method.', 'Treat the result as object, then cast it to int.', 'Compare with Echo<T>, which keeps the type parameter.'],
        ['Boxing is a value-to-object conversion, not reference aliasing.', 'Unboxing requires a compatible exact value type.', 'Generics often preserve values without object conversion.'],
        ['Assuming unboxing accepts numeric conversion between different types.', 'Assuming every interface call boxes every struct in every context.'],
        ['Use generic APIs for typed collections and algorithms.', 'Profile allocation hot spots before changing readable code.', 'Keep casts at explicit, validated interop boundaries.'],
        'Boxing stores a value copy in an object representation; unboxing validates and extracts the matching value type.',
      )),

    topic('value-vs-reference-types', 'Value Types vs Reference Types', 'High',
      'Value and reference types differ in assignment and identity semantics, not by a universal stack-versus-heap rule.',
      [
        'A value-type variable holds its data; a reference-type variable holds a reference to an object. A reference can be null when nullable annotations/runtime state permit it.',
        'Value assignment creates an independent copy of the value; reference assignment copies the reference, so both variables can reach one object. This distinction governs aliasing and mutation.',
        'Struct fields are copied as part of the value, but any reference-valued field still points to a referenced object. Storage location depends on the containing context: locals may be optimized, fields may be inline in an object, and boxing creates an object.',
      ],
      ['Assign value or reference variable', 'Follow the resulting copy or shared alias', 'Observe mutation and nested-reference behavior'],
      'Copying a struct with a List field copies the list reference, not the list contents; value copying does not make an object graph deeply independent.',
      `public struct CartView
{
    public List<string> Items;
}

var original = new CartView { Items = new() { "book" } };
var copy = original;       // struct fields are copied
copy.Items.Add("pen");     // both fields reference the same List
Console.WriteLine(original.Items.Count); // 2`,
      [['Value copies avoid shared top-level state', 'References allow shared object identity'], ['Aliasing can cause unintended shared mutation', 'Large value copies can be expensive']],
      ['Explain assignment semantics at API boundaries and prefer immutable values when copy behavior should be simple.', 'Avoid teaching or optimizing with an absolute “value=stack, reference=heap” rule.'],
      ['What does assigning a reference type copy?', 'Can a value type contain a reference?', 'Why does a struct copy not imply deep copy?'],
      'A cache returns a mutable DTO shared between requests. Decide whether callers need an independent snapshot; copy or expose immutable values rather than relying on class/struct labels.',
      csharpSources,
      visual(
        [{ label: 'Value variable', detail: 'Assignment copies the struct fields into another value.' }, { label: 'Reference field', detail: 'A copied List reference still points to one shared list object.' }, { label: 'Mutation effect', detail: 'Changing the shared list is visible through either struct copy.' }],
        ['Create a struct containing a List reference.', 'Copy the struct value.', 'Mutate the list and observe shared referenced state.'],
        ['Value copying is shallow for reference-valued fields.', 'Reference assignment creates aliases, not object clones.', 'Stack/heap location is not the semantic distinction.'],
        ['Assuming a struct copy recursively duplicates all objects.', 'Assuming every local reference necessarily allocates or stays on the heap.'],
        ['Use immutable value types for predictable copying.', 'Make mutable shared ownership explicit.', 'Use memory profiling for layout and allocation questions.'],
        'Value types copy their fields; reference variables copy object references, and either type can participate in more complex memory layouts.',
      )),

    topic('ref-out-in', 'ref, out, and in Parameters', 'High',
      'These modifiers pass a variable by reference with distinct initialization and mutation rules.',
      [
        'ref requires a caller-initialized variable and allows the method to read or replace it. out requires the method to assign before returning. in passes a readonly reference to an existing value.',
        'They support Try-pattern APIs, explicit mutation, and avoiding copies of large structs. They also expose aliasing and constrain lifetimes, making APIs harder to compose.',
        'Callers must use the matching modifier. in prevents assignment through that parameter but does not make referenced objects immutable. Ref-like values such as Span<T> have escape restrictions and cannot cross unsupported async/yield boundaries.',
      ],
      ['Caller supplies variable', 'Method applies modifier-specific access', 'Caller observes output or permitted mutation'],
      'TryParse uses out because there may be no parsed result on entry; ref would misleadingly imply a meaningful initialized value.',
      `static bool TryPercent(string text, out int value)
    => int.TryParse(text, out value);

static void Increment(ref int value) => value++;
static int Sum(in int left, in int right) => left + right;

int count = 3;
Increment(ref count);
if (TryPercent("42", out var parsed))
    Console.WriteLine(Sum(in count, in parsed));`,
      [['Efficient large readonly values', 'Clear Try-pattern output'], ['Call-site coupling and aliasing', 'Ref-like types impose escape and async restrictions']],
      ['Use out for a Try-style output and ref only when caller-visible mutation is essential.', 'Avoid ref/out/in for ordinary small values or using ref as an unmeasured optimization.'],
      ['Why does out not require initialization?', 'Does in make an object graph immutable?', 'What is the difference between ref and out?'],
      'A numeric API handles large immutable structs. Keep scalar results as returns, use out for parse success, and benchmark in only where avoiding a copy matters.',
      csharpSources,
      visual(
        [{ label: 'ref', detail: 'Caller initializes; method may read and replace the same variable.' }, { label: 'out', detail: 'Caller provides a destination; method must assign it before returning.' }, { label: 'in', detail: 'Method receives a readonly reference and may not reassign the parameter.' }],
        ['Call Increment with ref to update the existing count.', 'Call TryPercent with out to receive its result.', 'Pass values with in to the readonly Sum method.'],
        ['Modifiers define caller-visible variable behavior.', 'Readonly reference does not imply deep immutability.', 'Use clear value returns unless reference semantics solve a real need.'],
        ['Using out when input value is meaningful.', 'Assuming in prohibits mutation of an object reached through the reference.'],
        ['Use the Try pattern for conditional results.', 'Keep mutation explicit and narrow.', 'Respect ref-like lifetime and async restrictions.'],
        'ref reads and writes an initialized variable, out must assign a result, and in provides readonly by-reference input.',
      )),

    topic('overloading-overriding', 'Overloading vs Overriding', 'Very High',
      'Overloading selects among same-named signatures at compile time; overriding replaces inherited virtual behavior at runtime.',
      [
        'A signature identifies a method by name and parameter list; overloads differ in parameters. An override has a matching virtual/abstract base signature and supplies derived behavior.',
        'Overloads provide convenient operations for different input shapes. Overrides provide polymorphism: callers can use a base contract and receive behavior from the actual derived type.',
        'The compiler resolves overloads from compile-time argument types and conversions. Virtual dispatch resolves an override from the runtime type of the receiver.',
      ],
      ['Overload resolution uses arguments', 'Override declares inherited virtual slot', 'Call dispatch follows compile-time or runtime rule'],
      'Format(string) and Format(DateTime) overloads are chosen by argument type; a derived formatter override is selected when called through a base reference.',
      `class Formatter
{
    public string Format(string value) => value.Trim();
    public virtual string Format(DateTime value) => value.ToString("O");
}
sealed class LocalFormatter : Formatter
{
    public override string Format(DateTime value) => value.ToLocalTime().ToString("O");
}

Formatter formatter = new LocalFormatter();
string text = formatter.Format(DateTime.UtcNow); // override dispatches at runtime
string trimmed = formatter.Format("  hi ");      // overload selected at compile time`,
      [['Overloads offer ergonomic signatures', 'Overrides enable substitutable runtime behavior'], ['Ambiguous overloads can surprise', 'Overriding changes behavior for all base-typed callers']],
      ['Use overloads for the same operation on meaningfully different inputs; use virtual dispatch for intentional extension points.', 'Avoid overload sets whose implicit conversions make calls ambiguous.'],
      ['When is an overload chosen?', 'What makes an override possible?', 'How does the receiver runtime type affect an override?'],
      'A serialization framework has format-specific inputs and customer-specific output policy. Keep input overloads clear and make only stable extension points virtual.',
      csharpSources,
      visual(
        [{ label: 'Overload candidates', detail: 'Compiler examines method name, argument count, and conversion compatibility.' }, { label: 'Compile-time choice', detail: 'The best matching parameter signature is selected before execution.' }, { label: 'Virtual slot', detail: 'An override provides derived behavior for a base virtual member.' }, { label: 'Runtime dispatch', detail: 'Actual receiver type selects the override implementation.' }],
        ['Call Format with a string and inspect the chosen overload.', 'Call Format with DateTime through a base-typed variable.', 'Observe that the variable type does not suppress virtual override dispatch.'],
        ['Overload resolution is compile-time.', 'Override dispatch is runtime polymorphism.', 'They solve different design problems.'],
        ['Expecting overload selection to depend on runtime argument type.', 'Calling an override “overloading” because it shares a method name.'],
        ['Keep overloads semantically consistent.', 'Use virtual members only for supported extension behavior.', 'Test through base contracts.'],
        'Overloads vary parameter signatures and resolve statically; overrides replace inherited virtual behavior and dispatch dynamically.',
      )),

    topic('virtual-override-new', 'virtual, override, and new', 'High',
      'virtual opens a polymorphic method slot, override participates in that slot, and new hides a member by name.',
      [
        'A virtual member permits derived replacement; override explicitly replaces that inherited virtual implementation. The new modifier hides a same-named base member rather than overriding its virtual slot.',
        'Intentional virtual dispatch enables extensibility. Hiding can create different behavior depending on whether a caller uses a base or derived static type, which is often surprising.',
        'A call to a virtual member follows the runtime object type. A hidden non-virtual member is selected from the compile-time reference type; the compiler can warn when hiding is accidental.',
      ],
      ['Base declares virtual member', 'Derived overrides or hides member', 'Compare runtime dispatch with static name lookup'],
      'With override, a Base variable referencing a Derived object calls Derived.Run; with new, the same base variable calls Base.Run.',
      `class Base
{
    public virtual string Run() => "base";
    public string Name() => "base name";
}
class Derived : Base
{
    public override string Run() => "derived";
    public new string Name() => "derived name";
}

Base value = new Derived();
Console.WriteLine(value.Run());  // derived: virtual override
Console.WriteLine(value.Name()); // base name: member hidden with new`,
      [['Override preserves polymorphic contract', 'new can intentionally separate APIs'], ['Hiding makes behavior depend on static type', 'Broad virtual surfaces constrain future changes']],
      ['Use override when substituting a base behavior; use new only for deliberate hiding with clear reason.', 'Avoid virtualizing members indiscriminately or suppressing hiding warnings blindly.'],
      ['What does override require?', 'Does new replace virtual dispatch?', 'Why can a base reference call a different hidden member?'],
      'A framework base class gains a member with the same name as a derived API. Resolve compiler warnings consciously and test calls through both declared types before release.',
      csharpSources,
      visual(
        [{ label: 'Base virtual member', detail: 'Run declares an overridable dispatch slot.' }, { label: 'Derived override', detail: 'Derived.Run replaces behavior in that slot.' }, { label: 'Base nonvirtual name', detail: 'Name is not dynamically dispatched.' }, { label: 'new hidden member', detail: 'Derived.Name is selected only when the expression is typed Derived.' }],
        ['Create a Derived instance and store it in a Base variable.', 'Call virtual Run and observe derived implementation.', 'Call hidden Name and observe base member due to static type.'],
        ['override means runtime substitution.', 'new means name hiding, not polymorphic replacement.', 'Call-site declared type matters for hidden members.'],
        ['Adding new to silence a warning without checking behavior.', 'Assuming new overrides all base-typed calls.'],
        ['Prefer override for genuine substitutability.', 'Keep base classes and virtual surface small.', 'Test behavior through public abstractions.'],
        'virtual opens a runtime dispatch slot, override replaces it, and new hides a name according to compile-time type.',
      )),

    topic('oop-pillars', 'Four OOP Pillars in a Working Design', 'Very High',
      'Encapsulation, abstraction, inheritance, and polymorphism are complementary techniques for controlling change.',
      [
        'Encapsulation protects state behind operations; abstraction exposes essential behavior while hiding detail; inheritance derives a specialized type; polymorphism lets callers invoke behavior through a shared contract.',
        'Together they make invariants enforceable and implementations replaceable, but inheritance is not required for every form of reuse and can create tight coupling.',
        'A payment example encapsulates balance rules, abstracts payment behind an interface, derives provider adapters only when a real “is-a” relation exists, and dispatches to implementations through the contract.',
      ],
      ['Protect invariants', 'Expose a small abstraction', 'Substitute implementations through polymorphism'],
      'A checkout calls IPaymentMethod.PayAsync without depending on card internals; the adapter encapsulates provider details, and a derived provider may specialize implementation only where appropriate.',
      `public interface IPaymentMethod
{
    Task PayAsync(decimal amount, CancellationToken cancellationToken);
}
public sealed class Checkout
{
    private readonly IPaymentMethod payment;
    public Checkout(IPaymentMethod payment) => this.payment = payment;
    public Task CompleteAsync(decimal total, CancellationToken token)
    {
        if (total <= 0) throw new ArgumentOutOfRangeException(nameof(total));
        return payment.PayAsync(total, token);
    }
}`,
      [['Protects business invariants', 'Enables implementation substitution'], ['Inheritance can over-couple designs', 'Excessive abstraction hides simple flows']],
      ['Use encapsulation to protect invariants, abstraction for meaningful boundaries, and polymorphism for interchangeable behavior.', 'Avoid inheritance solely to share code; prefer composition when behavior is assembled.'],
      ['Name the four OOP pillars.', 'How is abstraction different from encapsulation?', 'Does polymorphism require inheritance from a class?'],
      'A checkout system supports multiple payment methods and must enforce positive totals. Keep validation in the domain-facing service and provider protocol inside replaceable adapters.',
      csharpSources,
      visual(
        [{ label: 'Encapsulation', detail: 'Checkout validates total and hides its internal workflow behind CompleteAsync.' }, { label: 'Abstraction', detail: 'IPaymentMethod publishes only the pay capability needed by checkout.' }, { label: 'Polymorphism', detail: 'A call through the interface dispatches to the supplied implementation.' }, { label: 'Inheritance', detail: 'Use only for a genuine specialization that preserves the base contract.' }],
        ['Validate the checkout invariant before calling collaborators.', 'Depend on the payment capability rather than a concrete provider.', 'Substitute an implementation without changing checkout policy.'],
        ['Encapsulation protects invariants.', 'Abstraction is about essential contract, not simply hiding code.', 'Inheritance is one tool; composition often provides safer reuse.'],
        ['Exposing mutable state and relying on callers to preserve invariants.', 'Creating deep class hierarchies for code reuse alone.'],
        ['Keep invariants near the state or operation they protect.', 'Design contracts around client needs.', 'Favor composition where behavior varies independently.'],
        'OOP principles help protect rules and substitute behavior; they are tools, not reasons to build inheritance-heavy frameworks.',
      )),

    topic('solid-srp', 'SRP: Single Responsibility Principle', 'Very High',
      'A module should have one cohesive responsibility—one primary reason to change—not merely one method.',
      [
        'Responsibility means a coherent policy owned by a stakeholder or change axis. SRP is not a rule that every class contain exactly one method.',
        'Separating policies prevents a formatting change from destabilizing persistence or business rules, and lets each concern be tested with appropriate collaborators.',
        'Move behavior when its data, invariants, or change cadence form a separate responsibility. Avoid splitting every line into a service; cohesive ownership matters more than class count.',
      ],
      ['Identify independent change reasons', 'Group cohesive policy', 'Separate collaborators at stable boundaries'],
      'Invoice calculation and email delivery change for different reasons, so keep calculation in InvoiceService and notification in an injected notifier.',
      `public sealed record Invoice(decimal Subtotal, decimal Tax);
public sealed class InvoiceCalculator
{
    public decimal Total(Invoice invoice) => invoice.Subtotal + invoice.Tax;
}
public interface IInvoiceNotifier
{
    Task SendAsync(decimal total, CancellationToken token);
}`,
      [['Localized changes and tests', 'Clear ownership of behavior'], ['Too many tiny classes obscure flow', 'Artificial boundaries add indirection']],
      ['Separate policies with genuinely independent change reasons.', 'Avoid equating SRP with one method per class or extracting trivial wrappers.'],
      ['What is a “reason to change”?', 'How can SRP improve tests?', 'Why does SRP not mean one method per class?'],
      'Tax policy changes frequently while notification channels are stable. Keep calculation and delivery separate and let an application service coordinate them.',
      csharpSources,
      visual(
        [{ label: 'Business calculation', detail: 'InvoiceCalculator owns total policy and changes with pricing/tax rules.' }, { label: 'Notification contract', detail: 'IInvoiceNotifier owns delivery capability and isolates channel details.' }, { label: 'Independent evolution', detail: 'Changing email delivery does not require rewriting calculation policy.' }],
        ['Identify calculation and delivery as separate change axes.', 'Place calculation in its cohesive owner.', 'Expose notification through a narrow collaborator contract.'],
        ['SRP concerns reasons to change, not method count.', 'Cohesion is more important than maximizing class count.', 'A coordinator may compose responsibilities without owning their policies.'],
        ['A “God class” that calculates, stores, renders, and sends.', 'Splitting each trivial operation into a separate class by rote.'],
        ['Use change history and stakeholder ownership to find boundaries.', 'Keep classes cohesive and testable.', 'Refactor when separation reduces actual change coupling.'],
        'SRP reduces unrelated change coupling by grouping behavior around one coherent responsibility.',
      )),

    topic('solid-ocp', 'OCP: Open/Closed Principle', 'High',
      'Stable code should accept new supported behavior through extension points rather than repeated edits to a central decision block.',
      [
        '“Open for extension, closed for modification” means an established policy can gain variants without constantly rewriting stable client logic; it does not mean code is never edited.',
        'An appropriate abstraction localizes variation, reducing regression risk when new cases arrive. Premature extension points can make a simple design harder to understand.',
        'Replace repeated type switches with polymorphism, strategies, or explicit registrations when variation is expected. Keep validation and invariant checks centralized where appropriate.',
      ],
      ['Locate recurring variation', 'Define a stable extension contract', 'Add a new implementation without changing policy client'],
      'Discount calculation varies by campaign. A strategy contract lets a new campaign implement its rule without expanding a checkout switch.',
      `public interface IDiscountPolicy { decimal Apply(decimal subtotal); }
public sealed class NoDiscount : IDiscountPolicy
{
    public decimal Apply(decimal subtotal) => subtotal;
}
public sealed class PercentageDiscount : IDiscountPolicy
{
    private readonly decimal rate;
    public PercentageDiscount(decimal rate) => this.rate = rate;
    public decimal Apply(decimal subtotal) => subtotal * (1 - rate);
}
public sealed class Checkout
{
    private readonly IDiscountPolicy discount;
    public Checkout(IDiscountPolicy discount) => this.discount = discount;
    public decimal Total(decimal subtotal) => discount.Apply(subtotal);
}`,
      [['New variants have localized implementation', 'Stable client code changes less'], ['Abstraction has upfront cost', 'Configuration/plugin systems can become opaque']],
      ['Apply OCP where variation is real and recurring.', 'Avoid building speculative plugin architectures for a single stable branch.'],
      ['Does OCP forbid modifying code?', 'When should a switch become a strategy?', 'How can extension points become over-engineering?'],
      'A promotion platform adds campaign rules monthly. Register validated discount strategies and keep checkout stable; do not make payment invariants pluggable without a requirement.',
      csharpSources,
      visual(
        [{ label: 'Stable checkout policy', detail: 'Checkout delegates the variable pricing rule rather than branching on campaign names.' }, { label: 'Extension contract', detail: 'IDiscountPolicy fixes the expected Apply behavior.' }, { label: 'New campaign strategy', detail: 'A new implementation adds a variant without editing Checkout.' }],
        ['Define policy behavior required by checkout.', 'Implement one discount strategy.', 'Add another strategy via composition rather than another checkout branch.'],
        ['OCP targets stable client logic under expected variation.', 'Extension points have a maintenance cost.', 'Changing code is still appropriate when requirements alter invariants.'],
        ['A large type switch that grows with every variant.', 'An abstract framework for variants that do not exist.'],
        ['Use observed change pressure to select extension points.', 'Keep invariants and validation explicit.', 'Test each strategy and the composition boundary.'],
        'OCP localizes expected variation behind stable contracts without pretending existing code must never change.',
      )),

    topic('solid-lsp', 'LSP: Liskov Substitution Principle', 'Very High',
      'A subtype must honor the behavioral promises clients rely on when using the base contract.',
      [
        'A precondition is what callers must provide; a postcondition is what a method promises afterward. A subtype should not demand stronger preconditions, weaken guarantees, or violate invariants.',
        'Behavioral substitutability prevents polymorphic calls from failing in surprising subtype-specific ways. Matching signatures alone does not establish a sound subtype relationship.',
        'If a subtype cannot support a base operation honestly, split the contract, use composition, or model distinct capabilities instead of throwing “not supported” from an inherited member.',
      ],
      ['Define base behavioral promise', 'Implement subtype with compatible rules', 'Substitute subtype and verify client assumptions'],
      'A read-only storage implementation should not implement a writable repository interface and then throw on Save; separate read and write capabilities.',
      `public interface IReadStore<T>
{
    Task<T?> FindAsync(Guid id, CancellationToken token);
}
public interface IWriteStore<T>
{
    Task SaveAsync(T value, CancellationToken token);
}
public sealed class ReadOnlyStore<T> : IReadStore<T>
{
    public Task<T?> FindAsync(Guid id, CancellationToken token)
        => Task.FromResult<T?>(default);
}`,
      [['Reliable polymorphic behavior', 'Contracts remain honest'], ['Bad inheritance can violate assumptions', 'Overly strict contracts make legitimate subtypes impossible']],
      ['Specify observable behavior, errors, and invariants in contracts.', 'Avoid subtypes that reject operations promised by their base abstraction.'],
      ['Why is throwing NotSupportedException from an override a warning?', 'How do preconditions and postconditions relate to LSP?', 'What design alternative helps a read-only subtype?'],
      'A storage abstraction has remote, cached, and read-only implementations. Split capabilities and test each implementation against the same behavioral contract.',
      csharpSources,
      visual(
        [{ label: 'Client promise', detail: 'IReadStore promises lookup; IWriteStore promises persistence.' }, { label: 'Subtype capability', detail: 'ReadOnlyStore implements only the operation it can honor.' }, { label: 'Safe substitution', detail: 'Clients using IReadStore work without subtype-specific exceptions.' }],
        ['Write down operations a client is promised.', 'Give read-only implementation only the read capability.', 'Run shared contract tests against every implementation.'],
        ['LSP concerns behavior, not just inheritance syntax.', 'Subtypes should preserve preconditions and guarantees.', 'Small capability contracts allow honest implementations.'],
        ['Throwing for a normal base operation in a subtype.', 'Assuming identical method signatures guarantee substitutability.'],
        ['Test contracts against all implementations.', 'Separate optional capabilities.', 'Prefer composition or explicit variants for incompatible behaviors.'],
        'A valid subtype preserves the base contract’s behavior; split incompatible capabilities rather than relying on signature compatibility.',
      )),

    topic('solid-isp', 'ISP: Interface Segregation Principle', 'High',
      'Clients should depend on focused interfaces containing only operations they actually need.',
      [
        'A fat interface groups many unrelated operations; clients may be forced to implement or reference methods irrelevant to their role. Segregation means contracts align with client needs.',
        'Small capability contracts reduce accidental coupling: changing an unrelated operation does not force every consumer to change or every implementation to add meaningless behavior.',
        'Split interfaces by cohesive capabilities, then compose them for clients that need several. Do not create a separate interface for every method if clients and change axes remain the same.',
      ],
      ['Identify distinct client needs', 'Split unrelated capabilities', 'Compose only required capabilities'],
      'A reporting job needs read access, not repository writes. Depend on IReadStore rather than implementing a broad store interface with dummy methods.',
      `public interface IReader<T>
{
    Task<T?> FindAsync(Guid id, CancellationToken token);
}
public interface IWriter<T>
{
    Task SaveAsync(T value, CancellationToken token);
}
public sealed class ReportJob
{
    private readonly IReader<Report> reader;
    public ReportJob(IReader<Report> reader) => this.reader = reader;
    public Task<Report?> LoadAsync(Guid id, CancellationToken token)
        => reader.FindAsync(id, token);
}`,
      [['Clients depend on fewer unrelated operations', 'Implementations avoid dummy members'], ['Too many interfaces fragment the model', 'Composition can obscure genuinely cohesive APIs']],
      ['Split contracts when clients or implementations have distinct capability needs.', 'Avoid tiny interfaces that only mirror implementation methods with no independent client value.'],
      ['How does ISP protect clients?', 'Why is a no-op implementation a design smell?', 'When should related interfaces remain combined?'],
      'An export worker only reads reports, while administration also writes. Give each service the minimal contract it needs and compose capabilities for administration.',
      csharpSources,
      visual(
        [{ label: 'Reporting client', detail: 'Needs only FindAsync to load its report.' }, { label: 'Read capability', detail: 'IReader exposes the precise dependency.' }, { label: 'Writer capability', detail: 'IWriter remains separate for clients with persistence authority.' }],
        ['List the operations a report job actually calls.', 'Inject IReader rather than the full read/write contract.', 'Combine IReader and IWriter only in a client needing both.'],
        ['ISP is about client-specific dependencies.', 'Focused contracts reduce fake/no-op implementations.', 'Avoid splitting without a distinct client or change reason.'],
        ['Making all consumers implement unsupported methods.', 'Creating dozens of one-method interfaces without useful separation.'],
        ['Derive interfaces from client usage.', 'Name contracts by capability.', 'Compose capabilities at application boundaries.'],
        'Focused capability interfaces prevent clients from depending on operations they do not use.',
      )),

    topic('solid-dip', 'DIP: Dependency Inversion Principle', 'Very High',
      'High-level policy and low-level details should depend on stable abstractions, with implementation details kept at the edge.',
      [
        'High-level modules express business policy; low-level modules perform details such as database and network access. An abstraction is a contract both sides can use without the policy depending on a concrete detail.',
        'DIP limits change ripple and makes policy testable without a live infrastructure dependency. It is not the same as dependency injection: DIP is a design principle; DI is one composition technique.',
        'Define an abstraction at the boundary owned by the policy, implement it with infrastructure adapters, and wire both together at startup. Keep abstractions specific to actual policy needs.',
      ],
      ['Business policy declares required capability', 'Infrastructure implements capability', 'Composition root supplies concrete dependency'],
      'OrderService depends on IOrderStore, not SqlOrderStore; the application composition root provides the SQL adapter.',
      `public interface IOrderStore
{
    Task SaveAsync(Order order, CancellationToken token);
}
public sealed class OrderService
{
    private readonly IOrderStore store;
    public OrderService(IOrderStore store) => this.store = store;
    public Task PlaceAsync(Order order, CancellationToken token)
        => store.SaveAsync(order, token);
}
// Startup composition: services.AddScoped<IOrderStore, SqlOrderStore>();`,
      [['Policy isolated from infrastructure changes', 'Simpler focused tests'], ['Abstractions add indirection', 'Poorly owned generic abstractions become leaky']],
      ['Invert dependencies across boundaries where infrastructure churn or test isolation matters.', 'Avoid abstractions that expose provider-specific concepts or exist only to mock trivial code.'],
      ['How is DIP different from dependency injection?', 'Where should the interface live?', 'What is a composition root?'],
      'A domain service must switch database providers and remain testable. Keep its dependency on a domain-facing store contract and bind the chosen adapter at application startup.',
      csharpSources,
      visual(
        [{ label: 'High-level policy', detail: 'OrderService calls the persistence capability it requires.' }, { label: 'Owned abstraction', detail: 'IOrderStore expresses a policy-facing contract independent of SQL APIs.' }, { label: 'Low-level adapter', detail: 'SqlOrderStore implements the contract using database details.' }, { label: 'Composition root', detail: 'Startup selects and injects the adapter.' }],
        ['Declare the capability the policy needs.', 'Implement it with an infrastructure adapter.', 'Wire the adapter at the application boundary.'],
        ['DIP concerns direction of source dependencies.', 'DI supplies object instances and is a common implementation technique.', 'Abstractions should be owned by useful policy boundaries.'],
        ['Let business logic depend directly on provider-specific APIs.', 'Calling every interface DIP even if it is merely a mock seam.'],
        ['Keep persistence and transport details at system edges.', 'Test policy with focused fakes and adapters with integration tests.', 'Use constructor injection for required dependencies.'],
        'DIP keeps policy independent of infrastructure contracts; dependency injection composes concrete implementations at runtime.',
      )),

    topic('dependency-injection', 'Dependency Injection and Its Value', 'Very High',
      'Dependency injection supplies an object’s collaborators from outside instead of having the object construct concrete dependencies itself.',
      [
        'A dependency is a collaborator required for a class to work. A composition root is the application boundary where implementations and lifetimes are configured.',
        'DI separates construction from policy, supports substitution, makes dependencies visible, and enables scoped lifetimes. It does not automatically make code modular or correct.',
        'Prefer constructor injection for required collaborators, choose singleton/scoped/transient lifetimes by state and request ownership, and avoid injecting the service provider as a general-purpose locator.',
      ],
      ['Declare required collaborators', 'Compose implementation and lifetime', 'Use service without controlling construction'],
      'OrderService receives IOrderStore through its constructor so tests can supply a fake and production can supply a database-backed store.',
      `      public sealed class OrderService
{
          private readonly IOrderStore store;
          public OrderService(IOrderStore store) => this.store = store;
          public Task PlaceAsync(Order order, CancellationToken token)
        => store.SaveAsync(order, token);
}

// ASP.NET Core composition:
services.AddScoped<IOrderStore, SqlOrderStore>();
services.AddScoped<OrderService>();`,
      [['Dependencies are explicit and replaceable', 'Composition policy stays at startup'], ['Lifetime mistakes can retain state or dispose too early', 'Container overuse can hide dependency graphs']],
      ['Inject required services through constructors and align lifetime with ownership.', 'Avoid service locator patterns, captive scoped dependencies, and needless interfaces.'],
      ['How does DI improve testing?', 'What does scoped mean in a web request?', 'Why avoid injecting IServiceProvider broadly?'],
      'A request service uses a scoped database context. Register both with compatible scoped lifetimes and do not capture the context inside a singleton background service.',
      csharpSources,
      visual(
        [{ label: 'Consumer constructor', detail: 'OrderService states IOrderStore as a required collaborator.' }, { label: 'Composition root', detail: 'Startup maps the interface to SqlOrderStore and selects lifetime.' }, { label: 'Runtime resolution', detail: 'Container constructs and supplies a compatible instance.' }, { label: 'Test substitution', detail: 'A test can supply an in-memory fake without changing business logic.' }],
        ['Declare required collaborators in the constructor.', 'Register implementations and lifetimes in startup.', 'Use a fake in a test and the SQL adapter in production.'],
        ['DI is a construction technique, not the design principle itself.', 'Constructor injection makes required dependencies visible.', 'Lifetimes encode ownership and must be compatible.'],
        ['Resolving arbitrary services from IServiceProvider inside business logic.', 'Capturing scoped services in singletons.', 'Registering every class behind an interface without reason.'],
        ['Keep composition at the application boundary.', 'Prefer immutable singleton services and scoped request data as appropriate.', 'Validate service registration and disposal behavior.'],
        'Dependency injection externalizes construction so collaborators and lifetimes can be composed and substituted explicitly.',
      )),

    topic('extension-methods', 'Extension Methods', 'High',
      'An extension method adds callable syntax to a type without modifying or inheriting from that type.',
      [
        'An extension method is a static method in a non-generic static class whose first parameter uses this. The receiver’s compile-time type determines whether it is available.',
        'Extensions improve fluent APIs and add helpers to types you do not own. They remain static calls, not virtual members; overload resolution and namespace imports affect discoverability.',
        'Use extensions for stateless, broadly useful operations. Use instance methods when behavior owns state, must be overridden, or is central to the type contract.',
      ],
      ['Declare static helper with this receiver', 'Import extension namespace', 'Invoke with instance-like syntax'],
      'A StringExtensions method can add a domain-specific normalization helper while remaining an ordinary static method under the hood.',
      `public static class TextExtensions
{
    public static bool HasContent(this string? value)
        => !string.IsNullOrWhiteSpace(value);
}

string? name = "Mira";
if (name.HasContent())
    Console.WriteLine(name.Trim());`,
      [['Convenient APIs for types you do not own', 'No inheritance or source modification required'], ['Namespace collisions and hidden static dispatch', 'Overuse fragments behavior across helpers']],
      ['Use extensions for cohesive stateless helpers and clear call-site readability.', 'Avoid extension methods that pretend to override behavior or hide important dependencies.'],
      ['What syntax identifies an extension receiver?', 'Can an extension override an instance method?', 'How does namespace scope affect visibility?'],
      'A shared validation library offers string checks without changing framework types. Place related extensions in a discoverable namespace and avoid ambiguous names.',
      csharpSources,
      visual(
        [{ label: 'Static declaration', detail: 'A static class holds the extension method.' }, { label: 'Receiver parameter', detail: 'this string? marks which compile-time receiver type the helper extends.' }, { label: 'Namespace import', detail: 'The caller must bring the extension’s namespace into scope.' }, { label: 'Static invocation', detail: 'name.HasContent() compiles to a static helper call, not virtual dispatch.' }],
        ['Declare a static class and method.', 'Mark the first parameter with this and a receiver type.', 'Import the namespace and call using receiver syntax.'],
        ['Extension syntax is convenience over a static method.', 'Instance members take precedence over extensions.', 'Extensions cannot add state or polymorphic override behavior.'],
        ['Creating ambiguous extensions with common names.', 'Putting unrelated helpers into one giant extension namespace.'],
        ['Use specific names and cohesive namespaces.', 'Keep helpers stateless and predictable.', 'Choose instance APIs for owned or overridable behavior.'],
        'Extension methods provide static helper behavior with receiver-style syntax, scoped by namespace and compile-time type.',
      )),

    topic('delegates-events-func-action', 'Delegates, Events, Func, and Action', 'Very High',
      'Delegates are type-safe method references; Func and Action are standard delegate shapes, while events control publisher notifications.',
      [
        'A delegate is a type whose value can reference one or more compatible methods. Func<T..., TResult> returns a value; Action<T...> returns void. An event restricts subscription changes and invocation to its declaring publisher.',
        'Callbacks decouple a producer from the work performed; events support one-to-many in-process notification. Multicast handlers run synchronously in invocation order, so slow or throwing handlers affect the publisher.',
        'Use events for notifications and delegates for supplied behavior. Unsubscribe long-lived publishers to release subscriber references; use queues/message brokers when delivery must be durable, asynchronous, or cross-process.',
      ],
      ['Define callback signature', 'Subscribe or pass method', 'Invoke callback/event with defined lifetime'],
      'An order feed raises an event after publication; consumers subscribe for in-process notification and unsubscribe when their lifetime ends.',
      `public sealed class OrderFeed
{
    public event Action<int>? Changed;
    public void Publish(int id) => Changed?.Invoke(id);
}

var feed = new OrderFeed();
Action<int> log = id => Console.WriteLine($"Order {id}");
feed.Changed += log;
feed.Publish(17);
feed.Changed -= log; // release subscription`,
      [['Flexible callbacks and fan-out', 'Events prevent arbitrary external invocation'], ['Synchronous handlers can delay publisher', 'Forgotten subscriptions retain subscribers']],
      ['Use Func/Action for simple callback shapes and named delegates for domain-specific contracts.', 'Avoid events for durable distributed messaging or subscriptions with unclear ownership.'],
      ['How does an event differ from a public delegate field?', 'What does Func return and Action return?', 'Why unsubscribe from a singleton event publisher?'],
      'A singleton order feed notifies transient UI or request consumers. Give subscription lifetime explicit disposal or use a scoped messaging mechanism to prevent retention.',
      csharpSources,
      visual(
        [{ label: 'Delegate signature', detail: 'Action<int> describes a callback accepting an order ID and returning void.' }, { label: 'Subscription', detail: 'Changed += records a handler in the publisher’s invocation list.' }, { label: 'Publisher invocation', detail: 'Publish synchronously invokes registered handlers.' }, { label: 'Unsubscription', detail: 'Removing the handler releases the publisher’s reference to the subscriber.' }],
        ['Create a callback matching Action<int>.', 'Subscribe before publishing an order ID.', 'Unsubscribe when the consumer no longer needs notifications.'],
        ['Func returns a result; Action returns void.', 'Events provide controlled publisher-owned invocation.', 'Subscriptions are references with lifetime and exception consequences.'],
        ['Assuming event delivery is asynchronous or durable.', 'Leaving a short-lived subscriber attached to a long-lived publisher.', 'Letting one handler’s exception unintentionally break critical publication.'],
        ['Make ownership and unsubscribe behavior explicit.', 'Keep event handlers fast or queue work deliberately.', 'Use a broker for cross-process guarantees.'],
        'Delegates represent callable behavior; events provide controlled in-process notification and require deliberate subscriber lifetimes.',
      )),
  ],
};
