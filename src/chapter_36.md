## Have No Side Effects

Clean Code introduces side effects in a somewhat casual terms:

<div class="book-quote">
"Side effects are lies. Your function promises to do one thing, but it also does other hidden things. 
Sometimes it will make unexpected changes to the variables of its own class. 
Sometimes it will make them to the parameters passed into the function or to system globals. 
In either case they are devious and damaging mistruths that often result in strange temporal couplings and order dependencies."
</div>

To make it more formal: a side effect is any operation that:

- Modifies state outside the function's scope
- Interacts with the external world (I/O, network, database)
- Relies on non-deterministic behavior (e.g., random number generation, system clock)
- Throws exception (which can alter the program's control flow in unexpected ways)

Pure functions—those without side effects—are easier to reason about, test, and reuse. They work like black boxes: given the same inputs, they always produce the same outputs, with no hidden dependencies or interactions.

However, the example provided in Clean Code is somewhat incomplete and misses critical aspects. 

<div class="book-quote">
"Consider, for example, the seemingly innocuous function in Listing 3-6. This function uses a standard algorithm to match a userName to a password. 
It returns true if they match and false if anything goes wrong. But it also has a side effect. Can you spot it?"

<pre><code class="language-java">
public class UserValidator {
    private Cryptographer cryptographer;

    public boolean checkPassword(String userName, String password) {
        User user = UserGateway.findByName(userName);
        if (user != User.NULL) {
            String codedPhrase = user.getPhraseEncodedByPassword();
            String phrase = cryptographer.decrypt(codedPhrase, password);
            if ("Valid Password".equals(phrase)) {
                Session.initialize();
                return true;
            }
        }
        return false;
    }
}
</code></pre>

"The side effect is the call to Session.initialize(), of course. The checkPassword function, by its name, says that it checks the password."
</div>

He implies that renaming function would get rid of side-effects: "we might rename the function checkPasswordAndInitializeSession, though that certainly violates 'Do one thing'"

This analysis misses several critical issues:

1. `UserGateway.findByName(userName)` - From the name this looks like a remote call to some-kind of storage, which is also a side-effect. And it also creates temporal coupling: the checkPassword would fail if there is no connection to the UserGateway.
2. `UserGateway` is a singleton - i.e. it is a global implicit dependency. 

A more formal understanding of side effects helps spot issues more easily.

This also makes it obvious that moving [input arguments](./chapter_35.html) to object fields, especially when function has to mutate them to keep intermediate state, is incompatible
with idea of side-effect free. 

In rewrite suggestion from [chapter 2](./chapter_2.html), all new methods have a side effect - they mutate fields - Modify "state outside the function's scope": 

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
    <span class="code-comment-trigger">►</span><span class="reviewable-line">print(guessMessage);<span class="code-comment">Interracts with the outside world - prints to STD-IO</span></span>
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
        <span class="code-comment-trigger">►</span><span class="reviewable-line">createPluralDependentMessageParts(count);<span class="code-comment">Calling a function with side effects spreads those effects to the caller</span></span>
        return String.format(
                "There %s %s %s%s", 
                verb, number, candidate, pluralModifier );
    }
&nbsp; 
    private void createPluralDependentMessageParts(int count) {
        if (count == 0) {
            <span class="code-comment-trigger">►</span><span class="reviewable-line">thereAreNoLetters();<span class="code-comment">Calling a function with side effects spreads those effects to the caller</span></span>
        } else if (count == 1) {
            <span class="code-comment-trigger">►</span><span class="reviewable-line">thereIsOneLetter();<span class="code-comment">Calling a function with side effects spreads those effects to the caller</span></span>
        } else {
            <span class="code-comment-trigger">►</span><span class="reviewable-line">thereAreManyLetters();<span class="code-comment">Calling a function with side effects spreads those effects to the caller</span></span>
        }
    }
&nbsp; 
    private void thereAreManyLetters(int count) {
        <span class="code-comment-trigger">►</span><span class="reviewable-line">number = Integer.toString(count);<span class="code-comment">Modifies state outside function scope</span></span>
        <span class="code-comment-trigger">►</span><span class="reviewable-line">verb = "are";<span class="code-comment">Modifies state outside function scope</span></span>
        <span class="code-comment-trigger">►</span><span class="reviewable-line">pluralModifier = "s";<span class="code-comment">Modifies state outside function scope</span></span>
    }
&nbsp; 
    private void thereIsOneLetter() {
        <span class="code-comment-trigger">►</span><span class="reviewable-line">number = "1";<span class="code-comment">Modifies state outside function scope</span></span>
        <span class="code-comment-trigger">►</span><span class="reviewable-line">verb = "is";<span class="code-comment">Modifies state outside function scope</span></span>
        <span class="code-comment-trigger">►</span><span class="reviewable-line">pluralModifier = "";<span class="code-comment">Modifies state outside function scope</span></span>
    }
&nbsp; 
    private void thereAreNoLetters() {
        <span class="code-comment-trigger">►</span><span class="reviewable-line">number = "no";<span class="code-comment">Modifies state outside function scope</span></span>
        <span class="code-comment-trigger">►</span><span class="reviewable-line">verb = "are";<span class="code-comment">Modifies state outside function scope</span></span>
        <span class="code-comment-trigger">►</span><span class="reviewable-line">pluralModifier = "s";<span class="code-comment">Modifies state outside function scope</span></span>
    }
}</code></pre>
    </div>
</div>

