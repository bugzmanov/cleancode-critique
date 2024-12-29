# Chapter 11: Systems

This is a mixed bag of relatively OK-ish approaches, relatively outdated advice, and critique of the APIs that's lost its relevance a decade ago.

It's somewhat focusing on organizing cross-cutting concerns in an application: it talks about aspect oriented programming and mentions the way to implement it:
- ejb
- proxies: jdk based or asm-based
- aspectj
- plain code

At the end it is advocating for plain java as it allows better modularity and easier way to separate concerns. The book advocates to cope the disadvantage of this approach (i.e. slow development speed and verbose nature of java language) with implementation of a proper DSL.

The core message is valid but poorly structured and hard to follow.

Majority of tech mentioned in this chapter is outdated to irrelevancy, newcomers will not be able to understand what is being advocated.

The argument for DSL lacks concrete examples and relies on irrelevant references.
The reader is expected to checkout books of Christopher Alexander (WTF? why?!) and jmock is presented as example of good DSL.

What makes it somewhat amusing is that Mockito (mocking framework overtook 1st place in java ecosystem) has been adopting opposite design principle from the get-go:
> The less DSL the better. Interactions are just method calls. Method calls are simple, DSL is complex.
