# Chapter 4: Comments

The chapter about comments is not inherently bad - it contains enough caveats and examples of bad vs good comments. However, Martin poisons the well right in the beginning of the chapter:

<div class="book-quote">
Comments are not like Schindler's List. They are not "pure good." Indeed, comments are, at best, a necessary evil. If our programming languages were expressive enough, or if we had the talent to subtly wield those languages to express our intent, we would not need comments very much—perhaps not at all.

The proper use of comments is to compensate for our failure to express ourself in code. Note that I used the word failure. I meant it. Comments are always failures. We must have them because we cannot always figure out how to express ourselves without them, but their use is not a cause for celebration.

So when you find yourself in a position where you need to write a comment, think it through and see whether there isn't some way to turn the tables and express yourself in code. Every time you express yourself in code, you should pat yourself on the back. Every time you write a comment, you should grimace and feel the failure of your ability of expression.
</div>

This is pretty damaging and I believe this is the main takeaway that developers would get out the chapter. 
It's the second worst idea of this book: comments are failure to write good code.
This hyperbolic stance had influenced many developers to avoid creating and using this useful tool of design, abstraction and documentation.
This stance has contributed to a broader culture where comments are undervalued and often ignored (note how comments are grayed out in most modern IDEs).

Martin is low key proposing idea of self-documenting code. This is a nice idea if it could work. 

But the code can never provide all the context, even if you try using "really-relly long essays" as a name.
Even if we assume that executable code can perfectly describe everything that's there, 
quite often things that are excluded are also important part of the design.

The "comments are failures" principle is probably the main driver of "essay as a name" style of naming: 

```java
private static int smallestOddNthMultipleNotLessThanCandidate(int candidate, int n) { }
```

Is `smallestOddNthMultipleNotLessThanCandidate` really a name or just inlined comment ?

Names are part of the code, but they’re just one step removed from comments: the compiler doesn’t check or enforce their semantic meaning, 
so they can easily fall out of sync — just like comments.

```java
private static int smallestOddNthMultipleNotLessThanCandidate(int candidate, int n) { 
    return Integer.MAX_VALUE; // I lied ┌∩┐(◣_◢)┌∩┐
}
```

### Recommended reading
- ["Philosophy Of Software Design"](https://www.goodreads.com/book/show/39996759-a-philosophy-of-software-design)
    - Chapter 12. Why Write Comments? The Four Excuses
    - Chapter 13. Comments Should Describe Things that Aren’t Obvious from the Code
    - Chapter 15. Write The Comments First
- Hillel Wayne's "Computer Things" blog:
    - [The myth of self-documenting code](https://buttondown.email/hillelwayne/archive/the-myth-of-self-documenting-code/)
    - [Comments the why and the what](https://buttondown.email/hillelwayne/archive/comment-the-why-and-the-what/)
    - [Why Not comments](https://buttondown.email/hillelwayne/archive/why-not-comments/)

## Example: Prime Number Generator

Here's the original code:

```java
/**
 * This class Generates prime numbers up to a user specified
 * maximum.  The algorithm used is the Sieve of Eratosthenes.
 * <p>
 * Eratosthenes of Cyrene, b. c. 276 BC, Cyrene, Libya --
 * d. c. 194, Alexandria.  The first man to calculate the
 * circumference of the Earth.  Also known for working on
 * calendars with leap years and ran the library at Alexandria.
 * <p>
 * The algorithm is quite simple.  Given an array of integers
 * starting at 2.  Cross out all multiples of 2.  Find the next
 * uncrossed integer, and cross out all of its multiples.
 * Repeat until you have passed the square root of the maximum
 * value.
 *
 * @author Alphonse
 * @version 13 Feb 2002 atp
 */
 public class GeneratePrimes     
     /**
     * @param maxValue is the generation limit.
     */
     public static int[] generatePrimes(int maxValue) {
     if (maxValue >= 2) // the only valid case
     {
         // declarations
         int s = maxValue + 1; // size of array
         boolean[] f = new boolean[s];
         int i;
         // initialize array to true.
         for (i = 0; i < s; i++)
             f[i] = true;

         // get rid of known non-primes
         f[0] = f[1] = false;

         // sieve
         int j;
         for (i = 2; i < Math.sqrt(s) + 1; i++) {
             if (f[i]) // if i is uncrossed, cross its multiples.
             {
                 for (j = 2 * i; j < s; j += i)
                     f[j] = false; // multiple is not prime
             }
         }

         // how many primes are there?
         int count = 0;
         for (i = 0; i < s; i++) {
             if (f[i])
                 count++; // bump count.
         }

         int[] primes = new int[count];

         // move the primes into the result
         for (i = 0, j = 0; i < s; i++) {
             if (f[i])  // if prime
                 primes[j++] = i;
         }

         return primes;  // return the primes
     } else // maxValue < 2
         return new int[0]; // return null array if bad input.
     }

```

I can grant that this is pretty convoluted code, but honestly I'm not sure if it was written this way or it was intentionally obfuscated. 

The good parts: the messines of the code is contained in a single place and API is safe and clear. 

Comment about the library of Alexandria is cute, I would also add a link to Wikipedia page.

The Martin refactoring:

```java
/**
 * This class Generates prime numbers up to a user specified
 * maximum.  The algorithm used is the Sieve of Eratosthenes.
 * Given an array of integers starting at 2:
 * Find the first uncrossed integer, and cross out all its
 * multiples.  Repeat until there are no more multiples
 * in the array.
 */
public class PrimeGenerator {
    private static boolean[] crossedOut;
    private static int[] result;

    public static int[] generatePrimes(int maxValue) {
        if (maxValue < 2)
            return new int[0];
        else {
            uncrossIntegersUpTo(maxValue);
            crossOutMultiples();
            putUncrossedIntegersIntoResult();
            return result;
        }
    }

    private static void uncrossIntegersUpTo(int maxValue) {
        crossedOut = new boolean[maxValue + 1];
        for (int i = 2; i < crossedOut.length; i++)
            crossedOut[i] = false;
    }

    private static void crossOutMultiples() {
        int limit = determineIterationLimit();
        for (int i = 2; i <= limit; i++)
            if (notCrossed(i))
                crossOutMultiplesOf(i);
    }

    private static int determineIterationLimit() {
        // Every multiple in the array has a prime factor that
        // is less than or equal to the root of the array size,
        // so we don't have to cross out multiples of numbers
        // larger than that root.
        double iterationLimit = Math.sqrt(crossedOut.length);
        return (int) iterationLimit;
    }

    private static void crossOutMultiplesOf(int i) {
        for (int multiple = 2*i;
             multiple < crossedOut.length;
             multiple += i)
            crossedOut[multiple] = true;
    }

    private static boolean notCrossed(int i) {
        return crossedOut[i] == false;
    }

    private static void putUncrossedIntegersIntoResult() {
        result = new int[numberOfUncrossedIntegers()];
        for (int j = 0, i = 2; i < crossedOut.length; i++)
            if (notCrossed(i))
                result[j++] = i;
    }

    private static int numberOfUncrossedIntegers() {
        int count = 0;
        for (int i = 2; i < crossedOut.length; i++)
            if (notCrossed(i))
                count++;

        return count;
    }
}
```

Right off the bat: The refactoring introduced serious thread-safety issues by using **static global mutable state** (`crossedOut` and `result` - static fields)

The rule of thumb: if you see mutable static variables - **RUN!**

This code can not be used as is in multi-threaded environment. 
You will *have to* remedy this by using **global** lock, so that at most one thread in the application can be computing this.

Is there reason to introduce this scalability limit and take performance hit? No.<br/> This is self-inflicted pain. There is 0 reasons for this design.

Second: are those small methods really necessary?

```java
private static boolean notCrossed(int i) {
    return crossedOut[i] == false;
}
```

Compare: <code class="language-java">if (notCrossed(i))</code> &nbsp; **vs** &nbsp; <code class="language-java">if (crossedOut[i] == false)</code>. Is the former option really more readable? 
If anything, now he have polluted the domain with semi-similar words: 
* not crossed 
* crossed out 
* uncrossed 

Is "notCrossed" same thing as "not crossedOut"? Is it same thing as "uncrossed"? 
By excessive method extraction Martin introduced inconsistencies and confusion in terminlogy, which at the end would only increase cognitive load.
You have to look into implementation of all those small methods to understand if there is a difference or not. 

This is the problem with introducing too many entities: working memory can hold 4–7 objects at a time. Flood it with small pebbles, and you’ll hit saturation, 
leading to inconsistencies and discrepancies.

<todo: RANT about this being common occasion>


<todo: better review>

```java
private static int determineIterationLimit() {
    // Every multiple in the array has a prime factor that
    // is less than or equal to the root of the array size,
    // so we don't have to cross out multiples of numbers
    // larger than that root.
    double iterationLimit = Math.sqrt(crossedOut.length);
    return (int) iterationLimit;
}
```

How many times do you need to repeat "iteration limit" in 3 lines of code to not forget that `determineIterationLimit` indeed returns `iterationLimit`?

Lets remove obfuscation from the original method:

```java
public class GeneratePrimes {
    public static int[] generatePrimes(int maxValue) {
        if (maxValue < 2) {  // first two numbers are not prime
            return new int[0];
        }

        boolean[] crossedOut = new boolean[maxValue + 1];
        Arrays.fill(crossedOut, 2, crossedOut.length, Boolean.TRUE); // first two numbers are not prime

        // the algorithm
        for (int i = 2; i < Math.sqrt(crossedOut.length) + 1; i++) {
            if (crossedOut[i]) {
                for (int j = 2 * i; j < crossedOut.length; j += i)
                    crossedOut[j] = false; // multiple is not prime
            }
        }

        List<Integer> result = new ArrayList<>();
        for (int i = 0; i < crossedOut.length; i++) {
            if (crossedOut[i]) result.add(i);
        }
        return result.toArray(new int[result.size()]);
    }
}
```

Does this look complicated?
