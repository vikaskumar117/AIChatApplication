import { LearningModule, topic } from '../learning.models';

export const algorithmsModule: LearningModule = {
  id: 'csharp-coding-algorithms',
  title: 'C# Coding & Algorithms',
  description: 'Practice data structures, complexity analysis, and interview-style implementation problems.',
  topics: [
    topic('linked-list-reversal-cycle', 'Reverse a Linked List & Detect Cycles', 'High',
      'Reverse a singly linked list in place, then use Floyd’s tortoise-and-hare algorithm to determine whether a list loops back on itself.',
      [
        'WHAT — A linked list is a chain of nodes, each holding a value and a reference to the next node. Reversal rewires those references; a cycle is a next-reference path that eventually revisits a node.',
        'WHY — These problems test whether you can reason about references, null boundaries, and invariants without allocating another collection. Reversal is O(n) time and O(1) auxiliary space; cycle detection is also O(n) time and O(1) space.',
        'HOW — While reversing, save the old next node before pointing the current node backward, then advance both pointers. For detection, move slow by one link and fast by two; if fast reaches null there is no cycle, and if they meet there is one.',
      ],
      ['Initialize previous to null and current to the head.', 'Save current.Next, redirect current.Next to previous, then advance both pointers.', 'Return previous as the new head; for cycle detection, compare slow and fast until they meet or fast reaches null.'],
      'A batch importer accepts a serialized chain of dependency records. Before processing, detect a malformed loop so one corrupt record cannot keep a worker traversing forever; reverse a valid chain only when ownership permits mutation.',
      `Node? Reverse(Node? head)
{
    Node? previous = null;
    Node? current = head;
    while (current is not null)
    {
        Node? next = current.Next; // Preserve the rest of the chain.
        current.Next = previous;
        previous = current;
        current = next;
    }
    return previous;
}

bool HasCycle(Node? head)
{
    Node? slow = head;
    Node? fast = head;
    while (fast?.Next is not null)
    {
        slow = slow!.Next;
        fast = fast.Next.Next;
        if (ReferenceEquals(slow, fast)) return true;
    }
    return false;
}`,
      [
        ['One pass; constant extra space', 'No node allocation is required'],
        ['In-place reversal mutates the chain', 'Pointer ordering and null boundaries are easy to get wrong'],
      ],
      ['Use when nodes are exclusively owned and memory efficiency matters.', 'Avoid mutating shared or immutable structures; copy or use an immutable representation instead.'],
      ['Why must `next` be saved before changing `current.Next`?', 'Why can two pointers detect a cycle without storing visited nodes?', 'What are the time and space costs of each algorithm?', 'How would you return the cycle entry rather than only report that a cycle exists?'],
      'A worker stops completing imported dependency jobs because a chain loops. Validate for a cycle at the ingestion boundary, record the source record ID for repair, and cover empty, single-node, acyclic, and cyclic cases without silently mutating shared input.',
      [
        { label: 'Microsoft: LinkedList<T>', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.linkedlist-1' },
        { label: 'Microsoft: Reference types', url: 'https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/reference-types' },
      ],
      {
        diagram: [
          { label: 'Input chain', detail: 'A → B → C → null; each node owns a next reference.' },
          { label: 'Save successor', detail: 'Keep C before redirecting B.Next, or the remaining chain is lost.' },
          { label: 'Reverse one link', detail: 'B.Next now points to A; previous and current advance together.' },
          { label: 'Return new head', detail: 'After the final node, previous is the reversed chain head.' },
          { label: 'Detect a loop', detail: 'Slow advances 1, fast 2; equality means the same node was revisited.' },
        ],
        diagramNote: 'Reversal changes references; Floyd detection only reads them. Treat those operations differently when the list is shared.',
        exampleSteps: ['Trace A → B → C with previous = null.', 'Save B.Next, set B.Next = A, then advance.', 'Repeat until current is null; return C.', 'For a cycle, stop when the two references are identical.'],
        keyTakeaways: ['Save the successor before rewiring.', 'Use ReferenceEquals to compare node identity.', 'Floyd detects existence in constant space; finding the entry needs an additional phase.'],
        commonMistakes: ['Overwriting Next before saving it loses the unprocessed suffix.', 'Checking node values instead of references can report a false cycle when values repeat.', 'Reversing a structure still in use can break concurrent readers.'],
        bestPractices: ['State the loop invariant: previous is reversed and current begins the untouched suffix.', 'Test null, singleton, two-node, cycle-at-head, and self-loop inputs.', 'Make ownership and mutation expectations explicit at the API boundary.'],
        summary: 'Rewire links carefully for reversal; use two-speed identity comparison to detect loops without extra storage.',
      }),
    topic('lru-cache', 'LRU Cache', 'High',
      'An LRU (least recently used) cache keeps a bounded set of entries and evicts the entry that has gone longest without use.',
      [
        'WHAT — LRU is an eviction policy. Pair a dictionary from key to node with a doubly linked list ordered from most recently used to least recently used.',
        'WHY — The dictionary finds an entry quickly, and the two-way links let the cache move or remove any node without searching. Get, Put, recency updates, and eviction are O(1) average time, with O(capacity) memory.',
        'HOW — On a hit, move the node to the front. On insert or update, place it at the front. If capacity is exceeded, remove the tail and its dictionary entry. Define zero-capacity and update semantics explicitly.',
      ],
      ['Look up the key in the dictionary.', 'Move a hit or newly written entry to the most-recent position.', 'When full, unlink the least-recent tail and remove its key from the dictionary.'],
      'An API repeatedly reads product metadata that changes infrequently. A per-instance LRU can bound memory and reuse hot values; invalidation and data freshness still belong to the owning product service.',
      `// Core representation:
Dictionary<TKey, LinkedListNode<Entry>> byKey;
LinkedList<Entry> recency; // First = most recent; Last = least recent.

// Get(key): if found, move node to First and return its value.
// Put(key, value): update/move existing node or AddFirst a new node.
// If Count > capacity: remove Last from both list and dictionary.
// For shared use, guard every map/list mutation with one synchronization policy.`,
      [
        ['Average O(1) lookup, recency update, and eviction', 'A strict entry-count or weighted capacity can bound memory'],
        ['Every operation must keep two structures consistent', 'Thread safety, TTL, invalidation, and multi-instance sharing are separate concerns'],
      ],
      ['Use for bounded, recency-based local data when entries are cheap to rebuild and profiling shows reuse.', 'Avoid treating it as a distributed cache or freshness policy; choose another policy when frequency, TTL, or consistency is more important than recency.'],
      ['Why combine a dictionary with a doubly linked list?', 'What does the list head and tail represent?', 'How do you prevent a map/list inconsistency on update or eviction?', 'What changes if the cache is concurrent or needs TTL?'],
      'A service’s per-process product lookup cache grows without bound and repeats expensive source reads. Add a capacity limit after measuring hit rate, set invalidation behavior on catalog writes, and load-test memory and concurrent access before rollout.',
      [
        { label: 'Microsoft: Dictionary<TKey,TValue>', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2' },
        { label: 'Microsoft: LinkedList<T>', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.linkedlist-1' },
      ],
      {
        diagram: [
          { label: 'Dictionary', detail: 'Key → exact list node; average O(1) lookup.' },
          { label: 'MRU head', detail: 'Recently read or written entries move to the front.' },
          { label: 'LRU tail', detail: 'The oldest access is removed when capacity is exceeded.' },
          { label: 'Atomic update', detail: 'Map and list change together or the cache state diverges.' },
        ],
        diagramNote: 'The list captures ordering; the dictionary makes that ordering directly addressable. Neither structure alone provides both properties.',
        exampleSteps: ['Insert A, B, C: head is C and tail is A.', 'Read A: move its existing node to the head.', 'Insert D over capacity: remove the current tail from both structures.', 'Verify dictionary count equals list count after each operation.'],
        keyTakeaways: ['Use node identity to move entries without a list search.', 'An LRU cache bounds capacity, not necessarily freshness.', 'Concurrency requires synchronization across the map and list as one operation.'],
        commonMistakes: ['Removing a tail node but leaving its key in the dictionary creates stale entries.', 'Using a singly linked list makes arbitrary removal O(n).', 'Assuming process-local LRU provides shared behavior across service replicas.'],
        bestPractices: ['Define capacity, null-value, update, and zero-capacity behavior.', 'Encapsulate map/list operations so invariants cannot be bypassed.', 'Measure hit ratio and memory before choosing LRU over TTL or frequency-based eviction.'],
        summary: 'A dictionary plus a doubly linked recency list gives constant-time LRU operations while requiring strict synchronization of both structures.',
      }),
    topic('reverse-string', 'Reverse a String', 'Very High',
      'Reverse a string by converting it to a mutable character buffer and swapping characters from the two ends.',
      [
        'WHAT — A string is immutable in C#, so reversing it means creating a new sequence rather than changing the original string in place.',
        'WHY — This is a simple way to demonstrate indices, two-pointer reasoning, immutability, and the difference between input size and extra space.',
        'HOW — Copy the UTF-16 characters to an array, swap the left and right characters while the pointers have not crossed, then construct a new string. The operation takes O(n) time and O(n) extra space for the result buffer.',
      ],
      ['Copy the input into a character array.', 'Set pointers at the first and last positions.', 'Swap and move inward until the pointers meet or cross.', 'Create and return a string from the array.'],
      'A log-normalization utility reverses a short ASCII token for a coding exercise. In production, clarify whether “character” means UTF-16 code unit, Unicode scalar value, or user-perceived grapheme cluster.',
      `string Reverse(string value)
{
    char[] characters = value.ToCharArray();
    int left = 0;
    int right = characters.Length - 1;

    while (left < right)
    {
        (characters[left], characters[right]) = (characters[right], characters[left]);
        left++;
        right--;
    }

    return new string(characters);
}`,
      [
        ['Linear time with a straightforward invariant', 'Original string remains unchanged'],
        ['The result requires O(n) additional memory', 'char-based reversal can split a surrogate pair or grapheme cluster'],
      ],
      ['Use the two-pointer version when the input contract is ASCII or UTF-16 code-unit based.', 'Avoid claiming this reverses user-perceived Unicode characters; use text-element-aware processing when that is the actual requirement.'],
      ['Why can’t a C# string be reversed in place?', 'What is the time and space complexity?', 'What can go wrong when reversing Unicode text using char?'],
      'A customer-name feature reverses visible text for a user-facing operation. Confirm Unicode requirements first; a char-array algorithm may corrupt emoji or combining marks, so choose a text-element-aware implementation and test real multilingual samples.',
      [
        { label: 'Microsoft: String class', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.string' },
        { label: 'Microsoft: Char structure', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.char' },
      ],
      {
        diagram: [
          { label: 'Input', detail: 'A B C D are copied into a mutable char array.' },
          { label: 'Swap ends', detail: 'Swap A and D; move left and right inward.' },
          { label: 'Repeat', detail: 'Swap B and C; stop when pointers meet or cross.' },
          { label: 'Return', detail: 'Build a new immutable string: D C B A.' },
        ],
        exampleSteps: ['Start with [c, o, d, e], left = 0, right = 3.', 'Swap c/e; then swap o/d.', 'Pointers cross, so stop and return "edoc".'],
        keyTakeaways: ['The loop invariant is that the outside positions are already reversed.', 'The array is mutable; the string result is a new object.', 'State the Unicode representation your solution supports.'],
        commonMistakes: ['Using `left <= right` is valid but can do an unnecessary self-swap.', 'Repeated string concatenation can make a simple reversal quadratic.', 'Treating UTF-16 char units as full visible characters breaks some Unicode text.'],
        bestPractices: ['Handle empty and one-character input naturally.', 'Describe O(n) time and O(n) additional buffer space.', 'Use Unicode-aware text elements when product requirements are grapheme-based.'],
        summary: 'Two pointers reverse a mutable copy in linear time; clarify whether the input contract is code units or visible Unicode characters.',
      }),
    topic('reverse-words', 'Reverse Words in a Sentence', 'High',
      'Split a sentence into words and emit them in reverse order without reversing the letters inside each word.',
      [
        'WHAT — Word-order reversal changes the sequence of tokens while preserving each token’s spelling.',
        'WHY — It tests whether you can distinguish reversing characters from reversing token order, and whether you can state how whitespace should be handled.',
        'HOW — Split on whitespace, discard empty tokens if normalization is intended, reverse the word sequence, then join with one space. This uses O(n) time and O(n) extra space.',
      ],
      ['Define whitespace and punctuation behavior.', 'Split into words and remove empty entries.', 'Reverse the word sequence.', 'Join with the chosen output separator.'],
      'An import pipeline normalizes a human-entered phrase for a coding exercise. The implementation below intentionally collapses repeated whitespace; preserve original separators instead if formatting is meaningful.',
      `string ReverseWords(string sentence)
{
    string[] words = sentence.Split(
        ' ',
        StringSplitOptions.RemoveEmptyEntries);

    Array.Reverse(words);
    return string.Join(' ', words);
}`,
      [
        ['Short and easy to explain', 'Behavior for repeated spaces is explicit'],
        ['Creates token and output buffers', 'Does not preserve tabs, newlines, or original spacing'],
      ],
      ['Use when normalized single-space output is acceptable.', 'Avoid when exact whitespace, quoted phrases, punctuation rules, or locale-specific tokenization must be preserved.'],
      ['How is this different from reversing every character?', 'What happens to repeated spaces?', 'How would you preserve the original whitespace?'],
      'A data-cleaning requirement says words must be reordered but line breaks and punctuation must remain unchanged. The simple Split implementation is insufficient; capture separators or use a tokenizer that models the actual text format.',
      [
        { label: 'Microsoft: String.Split', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.string.split' },
      ],
      {
        diagram: [
          { label: 'Sentence', detail: '"learn C# every day"' },
          { label: 'Tokens', detail: '["learn", "C#", "every", "day"]' },
          { label: 'Reverse token order', detail: '["day", "every", "C#", "learn"]' },
          { label: 'Join', detail: '"day every C# learn"' },
        ],
        exampleSteps: ['Split "learn C# every day" into four words.', 'Reverse the array, not each word.', 'Join with one space to form "day every C# learn".'],
        keyTakeaways: ['Clarify whether the task reverses words or characters.', 'Whitespace normalization is a behavior choice, not an implementation detail.'],
        commonMistakes: ['Reversing the full string reverses letters too.', 'Using Split without deciding how to handle repeated whitespace changes the output.'],
        bestPractices: ['Write down token and whitespace rules before coding.', 'Test empty input, repeated spaces, and punctuation according to the contract.'],
        summary: 'Tokenize, reverse the token sequence, and join; choose normalization only when the requirements allow it.',
      }),
    topic('palindrome-two-pointers', 'Palindrome Check with Two Pointers', 'Very High',
      'Compare matching characters from both ends, skipping characters the problem defines as irrelevant.',
      [
        'WHAT — A palindrome reads the same forward and backward under a specified normalization rule.',
        'WHY — The two-pointer method avoids building a second reversed string and shows how to reduce unnecessary comparisons.',
        'HOW — Move left and right inward. Optionally skip non-alphanumeric characters and compare case-insensitively. The scan is O(n) time and O(1) extra space.',
      ],
      ['Set left and right at the ends.', 'Skip punctuation or whitespace only if the contract says to ignore them.', 'Compare normalized characters; return false on the first mismatch.', 'If pointers meet or cross, the normalized input is a palindrome.'],
      'A search feature checks whether a user-supplied identifier is symmetric while ignoring spaces and punctuation. This sample compares UTF-16 char values and should be upgraded for grapheme-aware requirements.',
      `bool IsPalindrome(string value)
{
    int left = 0;
    int right = value.Length - 1;

    while (left < right)
    {
        while (left < right && !char.IsLetterOrDigit(value[left])) left++;
        while (left < right && !char.IsLetterOrDigit(value[right])) right--;

        if (char.ToUpperInvariant(value[left]) != char.ToUpperInvariant(value[right]))
            return false;

        left++;
        right--;
    }

    return true;
}`,
      [
        ['One pass and constant auxiliary space', 'Can ignore characters according to a clear normalization rule'],
        ['Normalization rules affect the answer', 'char-based comparison is not full Unicode text-element comparison'],
      ],
      ['Use when the input contract defines how to treat case and punctuation.', 'Avoid silently normalizing identifiers, passwords, or signed data; exact comparison may be required.'],
      ['Why compare from both ends?', 'How do spaces and punctuation affect the result?', 'What is the complexity?', 'What Unicode limitation does char-based comparison have?'],
      'A product identifier is validated as a palindrome, but security-sensitive identifiers must remain exact. Apply normalization only to the intended display/search field, never to credentials or canonical keys without an explicit contract.',
      [
        { label: 'Microsoft: Char.IsLetterOrDigit', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.char.isletterordigit' },
      ],
      {
        diagram: [
          { label: 'Normalized view', detail: '"A man, a plan, a canal: Panama" → "AMANAPLANACANALPANAMA"' },
          { label: 'Compare outer pair', detail: 'A == A; move both pointers inward.' },
          { label: 'Repeat inward', detail: 'M == M, A == A, and continue.' },
          { label: 'Decision', detail: 'No mismatch before pointers meet: palindrome.' },
        ],
        exampleSteps: ['Start at A and a; compare case-insensitively.', 'Skip spaces and punctuation as required.', 'Continue inward; return false immediately on a mismatch.'],
        keyTakeaways: ['The algorithm is linear because each pointer only moves inward.', 'Normalization is part of the specification.', 'Constant space comes from comparing in place rather than allocating a normalized copy.'],
        commonMistakes: ['Comparing the middle character twice is harmless but unnecessary.', 'Forgetting to skip punctuation on both sides leads to inconsistent comparisons.', 'Applying normalization to data that must be compared exactly changes semantics.'],
        bestPractices: ['Test empty, one-character, mixed-case, punctuation, and non-palindrome inputs.', 'Document Unicode and normalization behavior.'],
        summary: 'Two inward-moving pointers give an O(n), O(1)-space palindrome check when comparison rules are explicit.',
      }),
    topic('anagram-frequency-count', 'Anagram Check with Character Counts', 'Very High',
      'Two strings are anagrams when their normalized character frequencies match exactly.',
      [
        'WHAT — An anagram rearranges the same characters with the same multiplicities; order does not matter.',
        'WHY — Frequency counting solves the problem in expected O(n) time without sorting both strings, and demonstrates a useful dictionary pattern.',
        'HOW — Normalize according to the contract, reject unequal lengths, increment counts for the first input, decrement for the second, and ensure every count returns to zero. The dictionary uses O(k) space for k distinct characters.',
      ],
      ['Choose case and whitespace rules.', 'Reject different normalized lengths.', 'Count each character from the first input.', 'Subtract each character from the second; any missing or negative count means not an anagram.'],
      'A deduplication import compares labels independent of character order, ignoring case and spaces. The sample uses UTF-16 chars and should be adapted if grapheme clusters define a character.',
      `bool AreAnagrams(string first, string second)
{
    var counts = new Dictionary<char, int>();

    foreach (char value in first.ToUpperInvariant())
    {
        if (char.IsWhiteSpace(value)) continue;
        counts[value] = counts.GetValueOrDefault(value) + 1;
    }

    foreach (char value in second.ToUpperInvariant())
    {
        if (char.IsWhiteSpace(value)) continue;
        if (!counts.TryGetValue(value, out int count) || count == 0)
            return false;
        counts[value] = count - 1;
    }

    return counts.Values.All(count => count == 0);
}`,
      [
        ['Expected O(n) time without sorting', 'Makes duplicate character counts explicit'],
        ['Dictionary memory grows with distinct characters', 'Correctness depends on matching normalization rules for both inputs'],
      ],
      ['Use for moderate text under a defined character and normalization contract.', 'Avoid assuming char counts are equivalent to human-perceived characters for all Unicode text.'],
      ['Why must duplicate characters be counted?', 'Why is checking only that every character exists insufficient?', 'When would sorting be simpler?', 'What should normalization include?'],
      'A customer-data merge compares names without case or spaces, but the canonical record must preserve the original text. Compare normalized copies only for matching; never overwrite source data with the normalized form.',
      [
        { label: 'Microsoft: Dictionary<TKey,TValue>', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2' },
      ],
      {
        diagram: [
          { label: 'Normalize', detail: '"Dormitory" and "Dirty room" become comparable character sequences.' },
          { label: 'Build counts', detail: 'Count each character in the first string, including repetitions.' },
          { label: 'Consume counts', detail: 'Each character in the second string must decrement an available count.' },
          { label: 'Verify', detail: 'All counts are zero: same multiset, therefore anagram.' },
        ],
        exampleSteps: ['Count "aab": a → 2, b → 1.', 'Consume "aba": a → 1, b → 0, a → 0.', 'All counts are zero, so the strings match as anagrams.'],
        keyTakeaways: ['An anagram compares multisets, not sets.', 'Use the same normalization on both inputs.', 'Frequency counting is expected O(n); sorting is O(n log n) but may be simpler.'],
        commonMistakes: ['Checking membership alone misses different duplicate counts.', 'Normalizing only one side makes results inconsistent.', 'Forgetting whitespace/case requirements changes expected answers.'],
        bestPractices: ['Reject unequal normalized lengths early when normalization is available.', 'Test repeated letters, empty input, casing, and punctuation rules.', 'For strict Unicode behavior, count text elements rather than UTF-16 code units.'],
        summary: 'Count and consume character frequencies to compare anagrams in expected linear time.',
      }),
    topic('first-unique-character', 'First Non-Repeating Character', 'High',
      'Count characters in one pass, then scan in the original order to find the first character with count one.',
      [
        'WHAT — The first non-repeating character is the earliest character whose total frequency in the input equals one.',
        'WHY — This problem teaches why frequency information and original ordering are separate requirements.',
        'HOW — Build a frequency dictionary in O(n), then scan the string again in O(n). Return an index or nullable character according to the API contract; use O(k) memory for distinct characters.',
      ],
      ['Count every character.', 'Scan from the beginning.', 'Return the first character with count one.', 'If none exists, return the specified no-result value.'],
      'A streaming import reports the first unique character in a short identifier. This batch solution is easy to reason about; a true unbounded stream needs a different data structure and expiration policy.',
      `char? FirstUnique(string value)
{
    var counts = new Dictionary<char, int>();
    foreach (char character in value)
        counts[character] = counts.GetValueOrDefault(character) + 1;

    foreach (char character in value)
        if (counts[character] == 1)
            return character;

    return null;
}`,
      [
        ['Two linear passes are easy to verify', 'Preserves the original first-occurrence order'],
        ['Uses O(k) memory', 'A character result may be ambiguous when duplicate symbols look identical in logs'],
      ],
      ['Use for a bounded input string and return a character or index as required.', 'Avoid assuming a two-pass in-memory solution works for an infinite stream or privacy-sensitive identifier.'],
      ['Why is a set not enough?', 'Why do we scan the original string a second time?', 'What should be returned if every character repeats?', 'How would the algorithm change for a stream?'],
      'An ingestion service must flag the first unique symbol in an oversized untrusted field. Enforce a maximum input length before counting, return an index if duplicate visual characters are ambiguous, and avoid logging the complete input.',
      [
        { label: 'Microsoft: Dictionary<TKey,TValue>', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2' },
      ],
      {
        diagram: [
          { label: 'Input', detail: 'swiss' },
          { label: 'Frequency pass', detail: 's → 3, w → 1, i → 1.' },
          { label: 'Order pass', detail: 's repeats; next character w has count 1.' },
          { label: 'Return', detail: 'w is the first non-repeating character.' },
        ],
        exampleSteps: ['Count all characters in "swiss".', 'Scan from index 0: s has count 3.', 'At index 1, w has count 1; return it.'],
        keyTakeaways: ['A set loses occurrence counts.', 'The second pass preserves input order.', 'Define the no-result behavior explicitly.'],
        commonMistakes: ['Returning any character with count one can miss the first one.', 'Using only a HashSet cannot distinguish one occurrence from multiple occurrences.', 'Ignoring input limits can permit avoidable memory and CPU use.'],
        bestPractices: ['Return an index when callers need an unambiguous location.', 'Test empty input and all-repeating input.', 'Bound untrusted input before allocating frequency state.'],
        summary: 'Frequency counts answer how often; a second ordered scan answers which unique character comes first.',
      }),
    topic('two-sum-hash-map', 'Two Sum with a Dictionary', 'Very High',
      'Find two array positions whose values sum to a target by remembering values already seen.',
      [
        'WHAT — Two Sum returns a pair of indices whose corresponding values add to a target.',
        'WHY — A nested-loop solution is easy to derive but O(n²). A dictionary reduces expected lookup time to O(1), making the full scan expected O(n) with O(n) extra space.',
        'HOW — For each value, calculate target minus value. Check whether that complement was seen before; if so, return the saved index. Otherwise save the current value and index. Checking before insertion prevents reusing the same element.',
      ],
      ['Start with an empty value-to-index dictionary.', 'For each index, compute the complement.', 'If the complement is present, return its index and the current index.', 'Otherwise store the current value and continue.'],
      'An order service matches two ledger adjustments to a reconciliation total. The problem contract must define whether values can be reused, whether multiple answers exist, and what to return when no pair is found.',
      `int[] TwoSum(int[] values, int target)
{
    var indexByValue = new Dictionary<int, int>();

    for (int index = 0; index < values.Length; index++)
    {
        int complement = target - values[index];
        if (indexByValue.TryGetValue(complement, out int otherIndex))
            return [otherIndex, index];

        indexByValue[values[index]] = index;
    }

    return [];
}`,
      [
        ['Expected O(n) time with one pass', 'Returns original indices without sorting the input'],
        ['Uses O(n) auxiliary memory', 'Integer overflow and no-solution behavior must match the problem contract'],
      ],
      ['Use when extra memory is acceptable and the input is a one-shot search.', 'Avoid if memory is tightly bounded or sorted input allows a two-pointer approach that fits the required output.'],
      ['Why check the complement before inserting the current value?', 'How do duplicate values work?', 'What are the time and space complexities?', 'What changes if the input is already sorted?'],
      'A reconciliation job processes large, untrusted batches with a 32-bit target. Define overflow behavior (for example, calculate in `long`), cap batch size, and test duplicates and missing matches before production.',
      [
        { label: 'Microsoft: Dictionary<TKey,TValue>', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2' },
      ],
      {
        diagram: [
          { label: 'Read value', detail: 'Current value is 7; target is 10.' },
          { label: 'Find complement', detail: 'Required complement = 10 - 7 = 3.' },
          { label: 'Dictionary lookup', detail: 'If 3 was seen at index 0, the pair is found.' },
          { label: 'Otherwise store', detail: 'Save current value/index and continue scanning.' },
        ],
        exampleSteps: ['Input [3, 7, 4], target 10.', 'At index 0, complement 7 is absent; store 3 → 0.', 'At index 1, complement 3 is present; return [0, 1].'],
        keyTakeaways: ['The dictionary represents only earlier elements.', 'Expected O(n) time trades for O(n) memory.', 'Check before insert to avoid pairing an element with itself.'],
        commonMistakes: ['Storing values but not indices when the answer requires positions.', 'Inserting first can allow the same array element to satisfy its own complement.', 'Ignoring integer overflow when target/value ranges are large.'],
        bestPractices: ['Specify duplicate, no-answer, and multiple-answer behavior.', 'Use wider arithmetic if the input domain can overflow int.', 'Test negative values, duplicate values, and a single-element input.'],
        summary: 'A complement lookup turns the nested search into one expected-linear scan by trading extra memory for speed.',
      }),
    topic('longest-unique-substring', 'Longest Substring Without Repeating Characters', 'High',
      'Use a sliding window to find the longest contiguous substring whose characters are all unique.',
      [
        'WHAT — A substring is contiguous. The task is to maximize the window length while no character appears twice inside the window.',
        'WHY — Sliding windows turn repeated substring checks into a linear scan by reusing the state of the previous window.',
        'HOW — Track the last index of each character. When a repeated character appears inside the current window, move the left boundary past its previous index. Each character is processed once, giving expected O(n) time and O(k) space.',
      ],
      ['Initialize the window start and last-seen map.', 'For each character, move the start past its previous occurrence if that occurrence is inside the window.', 'Update the last-seen index.', 'Record the largest window length.'],
      'A validation tool reports the longest unique segment of a bounded input string. For user-perceived Unicode characters, replace char indexing with text-element tokens while preserving the same sliding-window invariant.',
      `int LongestUniqueLength(string value)
{
    var lastSeen = new Dictionary<char, int>();
    int windowStart = 0;
    int best = 0;

    for (int index = 0; index < value.Length; index++)
    {
        char current = value[index];
        if (lastSeen.TryGetValue(current, out int previous) &&
            previous >= windowStart)
        {
            windowStart = previous + 1;
        }

        lastSeen[current] = index;
        best = Math.Max(best, index - windowStart + 1);
    }

    return best;
}`,
      [
        ['Expected O(n) time without checking every substring', 'Stores only last-seen positions'],
        ['Uses O(k) memory', 'The definition of a character affects indexing and correctness'],
      ],
      ['Use for contiguous-substring uniqueness under a clearly defined character model.', 'Avoid a char-based implementation when the requirement is based on grapheme clusters or when input size is unbounded without limits.'],
      ['Why is this a sliding window?', 'Why must the previous index be inside the current window?', 'What is the time complexity?', 'How does the algorithm differ for a subsequence?'],
      'A request validator scans arbitrarily large submitted text for a longest unique segment. Apply a request-size limit and consider Unicode text elements; otherwise, memory and CPU cost grow with attacker-controlled input.',
      [
        { label: 'Microsoft: Dictionary<TKey,TValue>', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2' },
      ],
      {
        diagram: [
          { label: 'Current window', detail: 'For "abcabcbb", window grows from "a" to "abc".' },
          { label: 'Duplicate found', detail: 'Next "a" was last seen inside the current window.' },
          { label: 'Move left boundary', detail: 'Set start to one position after the previous "a".' },
          { label: 'Continue and measure', detail: 'Keep a valid window; maximum length is 3.' },
        ],
        exampleSteps: ['Read a, b, c: the window is "abc", best = 3.', 'Read the next a; its old index is inside the window.', 'Move start past the old a; window becomes "bca".', 'Continue; no later window exceeds length 3.'],
        keyTakeaways: ['The window invariant is “no duplicates between start and current index.”', 'Never move the start backward.', 'Expected O(n) time is possible because each boundary only advances.'],
        commonMistakes: ['Setting start to previous + 1 even when previous is before the current window moves it backward.', 'Using indexOf on every suffix can make the solution quadratic.', 'Confusing substring (contiguous) with subsequence (can skip characters).'],
        bestPractices: ['Test repeated runs such as "bbbbb", all-unique input, and "abba".', 'Use the exact character model required by the product.', 'Bound input length when processing user-controlled text.'],
        summary: 'A last-seen map and monotonic window boundary find the longest unique contiguous substring in expected linear time.',
      }),
    topic('binary-search', 'Binary Search in a Sorted Array', 'High',
      'Find a target in a sorted array by repeatedly discarding the half that cannot contain it.',
      [
        'WHAT — Binary search is a divide-and-conquer lookup over data ordered by a consistent comparison.',
        'WHY — It reduces comparisons from O(n) linear search to O(log n), but only when the sorted-order precondition is true.',
        'HOW — Keep an inclusive low/high range, inspect the midpoint, and retain only the half that could contain the target. Use `low + (high - low) / 2` to avoid midpoint addition overflow.',
      ],
      ['Set low and high to the array boundaries.', 'Calculate the midpoint and compare its value with the target.', 'Discard the impossible half.', 'Stop on a match or when low exceeds high.'],
      'A catalog service looks up a product ID in an immutable sorted snapshot. If the collection changes frequently or is not sorted, choose a data structure whose update and lookup costs fit the workload.',
      `int BinarySearch(int[] sorted, int target)
{
    int low = 0;
    int high = sorted.Length - 1;

    while (low <= high)
    {
        int middle = low + (high - low) / 2;
        if (sorted[middle] == target) return middle;
        if (sorted[middle] < target) low = middle + 1;
        else high = middle - 1;
    }

    return -1;
}`,
      [
        ['O(log n) comparisons', 'O(1) auxiliary space in the iterative form'],
        ['Requires sorted data and a consistent ordering', 'Frequent inserts may make maintaining sorted arrays expensive'],
      ],
      ['Use for repeated lookup in data that is already sorted and changes infrequently.', 'Avoid on unsorted data or when a hash-based lookup or database index better matches the update and query workload.'],
      ['Why is sorted input required?', 'Why use `low + (high - low) / 2`?', 'What does low > high mean?', 'How do you find the first occurrence of duplicates?'],
      'A service binary-searches a large in-memory configuration snapshot but production data occasionally arrives unsorted. Validate the sort invariant when building the snapshot and test duplicate keys and boundary values before relying on logarithmic lookup.',
      [
        { label: 'Microsoft: Array.BinarySearch', url: 'https://learn.microsoft.com/en-us/dotnet/api/system.array.binarysearch' },
      ],
      {
        diagram: [
          { label: 'Sorted input', detail: '[2, 5, 8, 12, 16, 23, 38], target = 16' },
          { label: 'Inspect middle', detail: 'Middle is 12; target is larger, so discard the left half.' },
          { label: 'Inspect remaining middle', detail: 'Middle is 23; target is smaller, so discard the right half.' },
          { label: 'Match', detail: '16 is found; each comparison removed about half the search range.' },
        ],
        exampleSteps: ['Start low = 0, high = 6.', 'Middle index 3 has value 12; move low to 4.', 'Middle index 5 has value 23; move high to 4.', 'Index 4 has value 16; return 4.'],
        keyTakeaways: ['The input must be sorted under the same comparison used by the search.', 'The search interval shrinks every iteration.', 'Use a loop invariant and test empty and boundary cases.'],
        commonMistakes: ['Using the wrong loop condition can skip a one-element range.', 'Updating low/high without excluding the midpoint can create an infinite loop.', 'Applying binary search to data whose ordering is not guaranteed.'],
        bestPractices: ['Test empty, singleton, first, last, missing, and duplicate values.', 'Use a safe midpoint expression.', 'For duplicate values, define whether any, first, or last match is required.'],
        summary: 'Binary search achieves logarithmic lookup by preserving a sorted-range invariant and discarding half the candidates each step.',
      }),
  ],
};
