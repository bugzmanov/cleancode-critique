# Chapter 2: Meaningful names

I agree with the theme of this chapter: names are important. Naming is the main component of building abstractions and abstraction boundaries. 
In smaller languages like C or Go-Lang, naming is *the* primary mechanism for abstraction.

Naming brings the problem domain into the computational domain:

```java
static int TEMPERATURE_LIMIT_F = 1000;
```

Named code constructs — such as functions and variables — are the building blocks of composition in virtually every programming paradigm.
 
> Names are a form of abstraction: they provide a simplified way of thinking about a more complex underlying entity. Like other forms of abstraction, the best names are those that focus attention on what is most important about the underlying entity while omitting details that are less important.
>
> Fom ["Philosophy of software design"](https://www.amazon.com/Philosophy-Software-Design-John-Ousterhout/dp/1732102201)

However, I disagree with Clean Code's specific approach to naming and its examples of "good" names. Quite often the book declares a good rule but then shows horrible application.

[//]: # (TODO: incorporate)

[//]: # (Incorporate somewhere: https://www.linguistic-antipatterns.com)
## Use intention-revealing names

The advocated principle is the title - the name should reveal intent. But the application:

<div class="book-quote">
The name of a variable, function, or class, should answer all the big questions. It should tell you why it exists, what it does, and how it is used. If a name requires a comment, then the name does not reveal its intent.
</div>

This sounds like an impossible task to me. First, the name that reveals all of those details fails to be an abstraction boundary. 
Second, what you notice in many examples in the book this approach leads to using "description as a name".

Martin presents 3 versions of the same code:

<div class="code-comparison">
    <div class="code-column">
    <pre><code class="language-java">
public List&lt;int[]&gt; getThem() {
  List&lt;int[]&gt; list1 
       = new ArrayList&lt;int[]&gt;();
  for (int[] x : theList)
    if (x[0] == 4)
      list1.add(x);
  return list1;
} </pre></code>
       <div class="code-column-title" style="padding-top:10px; text-align: center; margin-bottom: 0px;">(Might be) Obfuscated and unrealistic</div>
    </div>
    <div class="code-column">
        <pre><code class="language-java">
public List&lt;int[]&gt; getFlaggedCells() {
  List&lt;int[]&gt; flaggedCells 
     = new ArrayList&lt;int[]&gt;();
  for (int[] cell : gameBoard)
    if (cell[STATUS_VALUE] == FLAGGED)
      flaggedCells.add(cell);
  return flaggedCells;
}</code></pre>
        <div class="code-column-title" style="padding-top:10px; text-align: center; margin-bottom: 0px;">(Migh be) Good enough</div>
    </div>
    <div class="code-column">
        <pre><code class="language-java">
public List&lt;Cell&gt; getFlaggedCells() {
  List&lt;Cell&ht; flaggedCells 
      = new ArrayList&lt;Cell&gt;();
  for (Cell cell : gameBoard)
    if (cell.isFlagged())
        flaggedCells.add(cell);
  return flaggedCells;
}
</code></pre>
        <div class="code-column-title" style="padding-top:10px; text-align: center; margin-bottom: 0px;">(Might be) Premature abstraction</div>
    </div>
</div>

My main disagreement is this: not all code chunks need a name. In modern languages, this method can be a one-liner:

```scala
gameBoard.filter(cell => cell(STATUS_VALUE) == FLAGGED)
```

That's it. This code can be inlined and used as is.

While `getFlaggedCells` looks like an improvement over obfuscated `getThem`, it's not a name, it's a description.
If the description is as long as the code, it is redundant.

Martin writes about it in passing: "if you can extract another function from it with **a name that is not merely a restatement of its implementation**".<br/>
But he violates this principle quite often.

For readability, the second version is just as clear as the third. Adding a Cell abstraction is overkill.

<div class="collapsible-rant">
    <div class="collapsible-header">
        <span class="collapsible-title">To be fair there are good reasons to introduce Cell abstraction, but also there are reasons not to</span>
        <span class="collapsible-arrow">↓</span>
    </div>
    <div class="collapsible-content">
        <code>List&lt;int[]&gt;</code> is a generic type - devoid of meaning without a context. <br/><code>List&lt;Cell&gt;</code> - has more semantic meaning and is harder to misuse.<br/>
        <pre><code class="language-java">
List&lt;int[]&gt; list = getFlaggedCells();
list.get(0)[0] = list.get(0)[1] - list.get(0)[0];
        </code></pre>
        This compiles and runs, but the transformation is non-sensical and will corrupt data (the first element is a status field). <br/> 
        <code>List&lt;Cell&gt;</code> has a better affordance than <code>List&lt;int[]&gt;</code>, and makes such mistakes less likely. But improved affordance comes from the specialized type, not just the name.<br/><br/>
        But there is a the downside - specialized types needs specialized processing code. 
&nbsp;
        Serialization libraries, for example, would have support for <code>List&lt;int[]&gt;</code> out of the box, 
        but would need custom ser-de for the Cell class.<br/><br/>
        Since Clean Code, Robert Martin has embraced Clojure and functional programming. One of the tenets of Clojure philosophy: <b>use generic types to represent the data</b> and you'll have enormous library of processing functions that can be reused and combined.<br/>
        I'm curious if he would ever finish the second edition and if he had changed his mind about types.
    </div>
</div>

<!--To be fair there are good reasons to introduce Cell abstraction, but also there are reasons not to. `List<int[]>` is a generic type - devoid of meaning without a context. `List<Cell>` - has more semantic meaning and is harder to misuse.-->
<!---->
<!--```java-->
<!--List<int[]> list = getFlaggedCells();-->
<!--list.get(0)[0] = list.get(0)[1] - list.get(0)[0];-->
<!--```-->
<!---->
<!--This compiles and runs, but the transformation is non-sensical and will corrupt data (the first element is a status field). `List<Cell>` has a better affordance than `List<int[]>`, and makes such mistakes less likely. But improved affordance comes from the specialized type, not just the name.-->
<!---->
<!--It comes with the downside - specialized types needs specialized processing code. Serialization libraries, for example, would have support for `List<int[]>` out of the box, -->
<!--but would need custom ser-de for the Cell class.-->
<!---->
<!--Since Clean Code, Robert Martin has embraced Clojure and functional programming. One of the tenets of Clojure philosophy: *use generic types to represent the data* and you'll have enormous library of processing functions that can be reused and combined.-->
<!---->
<!--I'm curious if he would ever finish the second edition and if he had changed his mind about types.-->
<!---->
## Avoid disinformation ... Use Problem Domain Name

Martin pretty much advocates for informative style of writing in code: be clear, avoid quirks and puns.

These are examples of "good" names from his perspective:
- `bunchOfAccounts`
- `XYZControllerForEfficientStorageOfStrings`

<div class="book-quote">
Do not refer to a grouping of accounts as an accountList unless it's actually a List. The word list means something specific to programmers. If the container holding the accounts is not actually a List, it may lead to false conclusions. So accountGroup or bunchOfAccounts or just plain accounts would be better.
</div>

This might be stylistic preferences, but `accountsList` is easier to read and write than `bunchOfAccounts`: it's shorter and has fewer words - it is more concise. If by looking at word List the first thing you're thinking is `java.util.List`, then you might need some time away from Java. Touch some grass, write some Haskell.

<div class="subtle-paragraph">
XYZControllerForEfficientStorageOfStrings - this is not a name - it's an essay. It tells the whole story of (web) application working with strings and storing them efficiently.
</div>

Martin states that acronyms and word shortenings are bad, but doesn't see the problem in a name that has 7 words and 40 characters in it.

There is a simple solution to this - comments that expand acronyms and explain shortenings. But because Martin believes that [comments are a failure](./chapter_4.html), he has to insist on using essays as a name.

By the end of the chapter he finally mentions:

<div class="book-quote">
Shorter names are generally better than longer ones, so long as they are clear.

...The resulting names are more precise, which is the point of all naming.
</div>

These are really good points! But most of the examples in the chapter are not aligned with them. And I don't think "short and concise naming" is a takeaway people are getting from reading this chapter.

If anything, in most examples he proposed to replace short (albeit cryptic) names with 3-4 word long slugs.

<div class="collapsible-rant">
    <div class="collapsible-header">
        <span class="collapsible-title">Opinion: Code Conventions for the Java Programming Language</span>
        <span class="collapsible-arrow">↓</span>
    </div>
    <div class="collapsible-content">
        Pascal and Camel case in Java was proposed in <a href="https://checkstyle.sourceforge.io/styleguides/sun-code-conventions-19990420/CodeConventions.doc8.html">Sun's Java Style</a> as a way to enforce <b>"names should be short yet meaningful"</b>. 
        <br/><br/>
        The idea being that <code>ItIsReallyUncomfortableToReadLongSentencesWrittenInThisStyle</code>. Hence people will be soft forced to limit the size of names.<br/>
        <br/>
        The assumption was wrong.
        <br/><br/>
        <div style="text-align:center"><img src="./images/names.png" width="70%" style="filter: brightness(85%)"/></div>
    </div>
</div>


## Add meaningful context

I believe this was my first big WTF moment in the book:

<div class="code-comparison">
    <div class="code-column" style="flex:0">
        <div class="code-column-title">Original Code: </div>
        <pre class="ignore"><code class="language-java">private void printGuessStatistics(char candidate, 
                                  int count) {   
    String number;
    String verb;
    String pluralModifier;
    if (count == 0) {
        number = "no";
        verb = "are";
        pluralModifier = "s";
    } else if (count == 1) {
        number = "1";
        verb = "is";
        pluralModifier = "";
    } else {
        number = Integer.toString(count);
        verb = "are";
        pluralModifier = "s";
    }
    String guessMessage = String.format(
        "There %s %s %s%s", verb, number, 
        candidate, pluralModifier
    );
    <span class="code-comment-trigger">►</span><span class="reviewable-line">print(guessMessage);<span class="code-comment">Instead of printing, the method should just return guessMessage String result</span></span>
    &nbsp;
    &nbsp;
}</code></pre>
    </div>
    <div class="code-column">
        <div class="code-column-title">Proposed rewrite:</div>
        <pre class="ignore"><code class="language-java">public class GuessStatisticsMessage {
    private String number;
    private String verb;
    private String pluralModifier;
&nbsp; 
    public String make(char candidate, int count) {
        createPluralDependentMessageParts(count);
        return String.format(
                "There %s %s %s%s", 
                verb, number, candidate, pluralModifier );
    }
&nbsp; 
    private void createPluralDependentMessageParts(int count) {
        if (count == 0) {
            thereAreNoLetters();
        } else if (count == 1) {
            thereIsOneLetter();
        } else {
            thereAreManyLetters(count);
        }
    }
&nbsp; 
    private void thereAreManyLetters(int count) {
        number = Integer.toString(count);
        verb = "are";
        pluralModifier = "s";
    }
&nbsp; 
    private void thereIsOneLetter() {
        number = "1";
        verb = "is";
        pluralModifier = "";
    }
&nbsp; 
    private void thereAreNoLetters() {
        number = "no";
        verb = "are";
        pluralModifier = "s";
    }
}</code></pre>
    </div>
</div>


In no way the second option is better than the first one. The original has only one problem: side-effects. Instead of printing to the console it should have just return String. 
 
And that is it: 
* 1 method, 20 lines of code, can be read top to bottom, 
* 3 mutable local variables to capture local mutable state that can not escape. 
* It is thread-safe. I's impossible to misuse this API. 

Second option: 
* 5 methods, 40 lines of code, +1 new class with mutable state. 
* Because it's a class, the state can escape and be observed from the outside. 
* Which makes it not thread safe. 

The second option introduced more code, more concepts and more entities, introduced thread safety concerns.. while getting the exactly same results.

It also violates one of the rules laid out in the chapter about method names: "Methods should have verb or verb phrase names". `thereIsOneLetter()` is not really a verb or a verb phrase. 

If I'll try to be charitable here: Martin is creating internal Domain Specific Language(DSL) for a problem. 

<div class="subtle-paragraph">
A good indicator of an internal DSL: there are parts of API that doesn't make sense outside specific context/grammar. 

For example, `new GuessStatisticsMessage().thereAreNoLetters()` looks weird and doesn't make sense.

On the other hand, language consturcts are presented in a somewhat declarative style: 
```java
private void thereAreNoLetters() {
    number = "no";
    verb = "are";
    pluralModifier = "s";
}

private void thereIsOneLetter() {
    number = "1";
    verb = "is";
    pluralModifier = "";
}
```

I hope you agree that methods like this is not a typical Java. If anything, this looks closer to typical ruby.
</div>

But ultimately, object-oriented programming and domain-specific languages are unnessary for the simple task.
In a powerful-enough language, keeping this code procedural gives the result that is short and easy to understand:

```scala
def formatGuessStatistics(candidate: Char, count: Int): String = {   
   count match {
       case i if i < 0 => throw new IllegalArgumentException(s"count=$count: negative counts are not supported")
       case 0 => s"There are no ${candidate}s"
       case 1 => s"There is 1 ${candidate}"
       case x => s"There are $x ${candidate}s"
   }
}
```

<br/>

----------

