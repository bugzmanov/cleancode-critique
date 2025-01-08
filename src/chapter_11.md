# Chapter 11: Systems

This is a mixed bag of relatively OK-ish approaches, relatively outdated advice, and critique of the APIs that lost its relevance a decade ago.

It's somewhat focusing on organizing cross-cutting concerns in an application using aspect oriented programming.

The book mentions following implementation stategies:
- [Enterprise JavaBeans - ejb](https://en.wikipedia.org/wiki/Jakarta_Enterprise_Beans) _(outdated)_
- proxies: [jdk based](https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/proxy.html) or [asm](https://asm.ow2.io/)-based _(relevant, in 2025 [byte-buddy](https://bytebuddy.net/) is a more popular choice)_
- [aspectj](https://projects.eclipse.org/projects/tools.aspectj) _(outdated)_
- plain code

At the end the book advocates for plain java: better modularity and easier way to separate concerns. 
To cope the disadvantage of this approach (i.e. slow development speed and verbose nature of java language) the book recommends to use DSLs.

The core message is valid but poorly structured and hard to follow. Majority of tech mentioned in this chapter is outdated to irrelevancy, newcomers will not be able to understand what is being advocated.

The argument for DSL is interesting, bu lacks concrete examples and relies on irrelevant references.
The reader is expected to checkout books of Christopher Alexander (WTF? why?!) and jmock is presented as example of good DSL.

What makes it somewhat amusing is that [Mockito](https://site.mockito.org/) (mocking framework overtook 1st place in java ecosystem) has been adopting opposite design principle from the get-go:

> "The less DSL the better. Interactions are just method calls. Method calls are simple, DSL is complex."
>
> from [Mockito announcement](https://szczepiq.wordpress.com/2008/01/14/mockito/)
