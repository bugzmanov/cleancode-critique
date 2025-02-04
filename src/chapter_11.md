# Chapter 11: Systems

This is a mixed bag of relatively OK-ish approaches, relatively outdated advice, and critique of the APIs that lost its relevance a decade ago.

It focuses on managing cross-cutting concerns, but through a 2009 lens that's now clouded.
The book discusses four implementation approaches:

* [Enterprise JavaBeans - ejb](https://en.wikipedia.org/wiki/Jakarta_Enterprise_Beans) - obsolete
* Proxies:
    * [JDK dynamic proxies](https://docs.oracle.com/javase/8/docs/technotes/guides/reflection/proxy.html) - still relevant
    * [ASM-based proxies](https://asm.ow2.io/) - relevant, bbut superseded by [byte-buddy](https://bytebuddy.net/)
* [aspectj](https://projects.eclipse.org/projects/tools.aspectj) - largely obsolete
* Plain Java code

Martin ultimately advocates for plain Java with better modularity and cleaner separation of concerns. To address Java's verbosity, he suggests using Domain-Specific Languages (DSLs).
The core message about separation of concerns remains valid, but the presentation has three major problems:

1) Most referenced technologies are obsolete, making the chapter confusing for modern developers
2) The DSL argument lacks concrete examples, instead bizarrely referencing Christopher Alexander's architectural patterns
3) The chapter holds up JMock as exemplary DSL design, yet the most successful Java mocking framework (Mockito) explicitly rejected DSLs:

> "The less DSL the better. Interactions are just method calls. Method calls are simple, DSL is complex."
>
> from [Mockito announcement](https://szczepiq.wordpress.com/2008/01/14/mockito/)


This illustrates a broader issue with the chapter: its technical recommendations proved less durable than its architectural principles. 
While "separate your concerns" remains good advice, the specific approaches it recommends haven't stood the test of time.
