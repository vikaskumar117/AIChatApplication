import { LearningModuleSummary } from '../../../learning.models';

export const csharpCodingAlgorithmsModule: LearningModuleSummary = {
  "id": "csharp-coding-algorithms",
  "title": "C# Coding & Algorithms",
  "description": "Practice data structures, complexity analysis, and interview-style implementation problems.",
  "topics": [
    {
      "id": "linked-list-reversal-cycle",
      "title": "Reverse a Linked List & Detect Cycles",
      "priority": "High",
      "summary": "Reverse a singly linked list in place, then use Floyd’s tortoise-and-hare algorithm to determine whether a list loops back on itself."
    },
    {
      "id": "lru-cache",
      "title": "LRU Cache",
      "priority": "High",
      "summary": "An LRU (least recently used) cache keeps a bounded set of entries and evicts the entry that has gone longest without use."
    },
    {
      "id": "reverse-string",
      "title": "Reverse a String",
      "priority": "Very High",
      "summary": "Reverse a string by converting it to a mutable character buffer and swapping characters from the two ends."
    },
    {
      "id": "reverse-words",
      "title": "Reverse Words in a Sentence",
      "priority": "High",
      "summary": "Split a sentence into words and emit them in reverse order without reversing the letters inside each word."
    },
    {
      "id": "palindrome-two-pointers",
      "title": "Palindrome Check with Two Pointers",
      "priority": "Very High",
      "summary": "Compare matching characters from both ends, skipping characters the problem defines as irrelevant."
    },
    {
      "id": "anagram-frequency-count",
      "title": "Anagram Check with Character Counts",
      "priority": "Very High",
      "summary": "Two strings are anagrams when their normalized character frequencies match exactly."
    },
    {
      "id": "first-unique-character",
      "title": "First Non-Repeating Character",
      "priority": "High",
      "summary": "Count characters in one pass, then scan in the original order to find the first character with count one."
    },
    {
      "id": "two-sum-hash-map",
      "title": "Two Sum with a Dictionary",
      "priority": "Very High",
      "summary": "Find two array positions whose values sum to a target by remembering values already seen."
    },
    {
      "id": "longest-unique-substring",
      "title": "Longest Substring Without Repeating Characters",
      "priority": "High",
      "summary": "Use a sliding window to find the longest contiguous substring whose characters are all unique."
    },
    {
      "id": "binary-search",
      "title": "Binary Search in a Sorted Array",
      "priority": "High",
      "summary": "Find a target in a sorted array by repeatedly discarding the half that cannot contain it."
    }
  ]
};
