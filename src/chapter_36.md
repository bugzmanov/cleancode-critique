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

