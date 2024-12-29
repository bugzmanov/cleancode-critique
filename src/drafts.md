## Snippets for visual components

-------
<div class="code-block-wrapper">

<pre><code class="language-java"> 
public class GuessStatisticsMessage {
    <span class="code-comment-trigger">►</span><span class="reviewable-line">private String number;<span class="code-comment">These fields introduce mutable state that could be local variables. This makes the class not thread-safe and harder to reason about.</span></span>
    private String verb;
    private String pluralModifier;
&nbsp;
    public String make(char candidate, int count) {
        createPluralDependentMessageParts(count);
        return String.format(
                "There %s %s %s%s", 
                verb, number, candidate, pluralModifier );
    }
}
</code></pre>

</div>
--------



## Text to be killed 

The idea of DSL hasn't been introduced in the book yet. It will come only in chapter 10 ("Systems Need Domain-Specific Languages") and it's a bit of a mess.

"Clean code" is not the best book to learn about DSLs. You might get better understanding by reading:
* [Domain Specific Languages by by Martin Fowler, with Rebecca Parsons](https://martinfowler.com/books/dsl.html) - comprehensive intro to the topic in a Martin Fowler style
* [DSL in Action by Debasish Ghosh](https://www.manning.com/books/dsls-in-action) - more practical and focused on internal DSLs in different host languages

DSLs are powerful. And it is important to know when to use them and when to stay away.

> The rule of least power is a design principle that "suggests choosing the least powerful language suitable for a given purpose"
>
> [Rules of least power](https://en.wikipedia.org/wiki/Rule_of_least_power)
 
Introduction of any DSL has a noticeable cost: 
- higher learning curve
- higher maintenance cost: more code, more entities, more corner cases to support the langugae
- potentially worse performance

And in this example, introduced DSL brings zero value. It has a very limited scope, it's not composable and not extendable. It solves a trivial problem. 
I can understand the desire to show off, but in a large code base isolated DSLs like this one would grow like warts.

