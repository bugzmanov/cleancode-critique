# Chapter 6: Objects and Data Structures

I don’t think this chapter has aged poorly; rather, it seems to have been misaligned from the start with the common understanding of data structures, 
the purpose of abstraction, and the principles of information hiding.

<div class="book-quote">
<pre><code class="language-java">public interface Point {
    double getX();
    double getY();
    void setCartesian(double x, double y);
    double getR();
    double getTheta();
    void setPolar(double r, double theta);
}</code></pre>
The beautiful thing about Listing 6-2 is that there is no way you can tell whether the implementation is in rectangular or polar coordinates. It might be neither! And yet the interface still unmistakably represents a data structure.
</div>

There is nothing beautiful about this interface. An interface of just getters and setters is usually a *design mistake*. 
Interfaces should define *a contract of behavior*, not merely obfuscate the internal data structure. 
They should provide *meaningful abstractions*, not just hide implementation details.

The fact that it's impossible to tell if this is about rectangular or polar coordinates is not true. 
It's both and it forces all implementations to be both.

Here's a cleaner design:

```java
sealed interface Point;
record Rectangular(double length, double width) implements Point { }
record Polar(double r, double theta) implements Point {};

public Rectangular convert(Polar polar) {...}
public Polar convert(Rectangular rectangular) {...}
```

Martin would say that "This exposes implementation"

But the thing is that there is no implementation to be exposed, the Point is put data and its shape is essential to its meaning.
In statically typed languages, explicitly communicating the shape of data through types is the goal.

Not every abstraction needs to hide its data structure - sometimes the data structure itself is the abstraction.

<div class="book-quote">
Hiding implementation is not just a matter of putting a layer of functions between the variables. Hiding implementation is about abstractions!
</div>

Exactly! But introducing unnecessary abstractions is over-engineering. As Edsger Dijkstra noted:

> "The purpose of abstraction is not to be vague, but to create a new semantic level in which one can be absolutely precise." - Dijkstra 1972

Martin's Point interface adds vagueness, not precision. It combines two coordinate systems without clear purpose. 
A good abstraction adds precision and reduces ambiguity—not the other way around.

<div class="book-quote">
Consider Listing 6-3 and Listing 6-4. The first uses concrete terms to communicate the fuel level of a vehicle, whereas the second does so with the abstraction of percentage.

Listing 6-3 Concrete Vehicle
<pre><code class="language-java">public interface Vehicle {
  double getFuelTankCapacityInGallons();
  double getGallonsOfGasoline();
}
</code></pre>

Listing 6-4 Abstract Vehicle
<pre><code class="language-java">public interface Vehicle {
  double getPercentFuelRemaining();
}
</code></pre>

In both of the above cases the second option is preferable. We do not want to expose the details of our data. Rather we want to express our data in abstract terms.
</div>

This is not hiding "details of our data", this is data hiding! 
Depending on the context, this might be good or bad. For example, with the second option, it becomes impossible to calculate the cost of filling the tank. 
Are we designing for scammy car rentals? If so, then sure, hide the data. 

The assumption that hiding data is always good is simply wrong.

**Ineffective abstraction** occurs when essential knowledge is removed, or when non-essential knowledge is unnecessarily exposed - or both.

# Data/Object Anti-Symmetry

This chapter touches expression problem, without mentioning that this is the expression problem. It briefly mentions Visitor pattern as a solution for the problem.

So far so good. 
However, Martin conflates dumb data objects with data structures.
Which is unfortunate cause the name "data structure" is reserved for objects that indeed have specialized structure for the data: lists, trees, stacks, etc.

Let's be precise about three types:
- Data objects (or Data transfer objects) - dumb containers for data
- Stateless objects (or effectively stateless objects with dependencies) - behaviour only services
- Stateful objects: Objects that encapsulate both state and behavior, often used for data structures.

Modern design, even in Java, prefers separating stateless services from data objects. Stateful objects are mainly for true data structures.

In Martins terms: 
- Data Structures = Dumb Objects
- True Objects = Stateless and Stateful objects. 

He correctly criticizes hybrid objects (mixing data and behavior) - except for actual data structures. A Stack interface is legitimately hybrid:

```java
interface Stack<T> {
   Optional<T> peek();
   Optional<T> pop(); 
   void push(T item); 
}
```

But it's a good one.

# Law of Demeter

<div class="book-quote">
There is a well-known heuristic called the Law of Demeter2 that says a module should not know about the innards of the objects it manipulates. As we saw in the last section, objects hide their data and expose operations. This means that an object should not expose its internal structure through accessors because to do so is to expose, rather than to hide, its internal structure
</div>

This law is from 1987. It might be a beneficial rule if the code base consists of mostly Hybrid objects. 
Today's separation of stateless services from data objects makes this law less relevant.

Instead of the somewhat convoluted rules of the Law of Demeter, consider this: 
- *Service objects* should not expose their collaborators or dependencies.
- *Data objects* can—and often should—be open books.
- *Data structures* are more flexible, the exposure of internal details depends on the specific goals and design of the data structure.<br/>
  (For example, an [intrusive linked list](https://www.data-structures-in-practice.com/intrusive-linked-lists/) deliberately exposes internal pointers to optimize performance)

