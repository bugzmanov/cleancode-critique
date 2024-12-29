# Chapter 10: Classes

Written with Jeff Langr.

They lay out following constraints:
- classes should have small amount of responsibilities: ideally single responsibility
- defines cohesion as small amount of instance variables

He clearly understands that small amount of parameters for methods lead him to pass parameters via instance variables and in order to keep amount of instance variables small he has to increase amount of classes.

Does he see a problem with this? No, he doesn't.

<div class="book-quote">
So breaking a large function into many smaller functions often gives us the opportunity to split several smaller classes out as well. 
This gives our program a much better organization and a more transparent structure.
</div>

And then he does his favorite trick: shows obfuscated code (he confesses that it's a generated code, not actually a human written) and refactors it using all his favorite hits: classes with global mutable states, passing parameters via instance fields, tiny private methods that being used only once, names that looks like an essay.

```java
public class PrintPrimes {
     public static void main(String[] args) {
       final int M = 1000;
       final int RR = 50;
       final int CC = 4;
       final int WW = 10;
       final int ORDMAX = 30;
       int P[] = new int[M + 1];
       int PAGENUMBER;
       int PAGEOFFSET;
       int ROWOFFSET;
       int C;

       int J;
       int K;
       boolean JPRIME;
       int ORD;
       int SQUARE;
       int N;
       int MULT[] = new int[ORDMAX + 1];

       J = 1;
       K = 1;
       P[1] = 2;
       ORD = 2;
       SQUARE = 9;

       while (K < M) {
         do {
           J = J + 2;
           if (J == SQUARE) {
             ORD = ORD + 1;
             SQUARE = P[ORD] * P[ORD];
             MULT[ORD - 1] = J;
           }
           N = 2;
           JPRIME = true;
           while (N < ORD && JPRIME) {
             while (MULT[N] < J)
               MULT[N] = MULT[N] + P[N] + P[N];
             if (MULT[N] == J)
               JPRIME = false;
             N = N + 1;
          }
        } while (!JPRIME);
        K = K + 1;
        P[K] = J;
     }
     {
        PAGENUMBER = 1;
        PAGEOFFSET = 1;
        while (PAGEOFFSET <= M) {
          System.out.println("The First " + M +
                                     " Prime Numbers --- Page " + PAGENUMBER);
          System.out.println("");
          for (ROWOFFSET = PAGEOFFSET; ROWOFFSET < PAGEOFFSET + RR; ROWOFFSET++){
             for (C = 0; C < CC;C++)
             if (ROWOFFSET + C * RR <= M)
               System.out.format("%10d", P[ROWOFFSET + C * RR]);
             System.out.println("");
          }
          System.out.println("\f");
          PAGENUMBER = PAGENUMBER + 1;
          PAGEOFFSET = PAGEOFFSET + RR * CC;
      }
     }
    }
}
```

is refactored to:

```java
package literatePrimes;

public class PrimePrinter {
    public static void main(String[] args) {
        final int NUMBER_OF_PRIMES = 1000;
        int[] primes = PrimeGenerator.generate(NUMBER_OF_PRIMES);

        final int ROWS_PER_PAGE = 50;
        final int COLUMNS_PER_PAGE = 4;
        RowColumnPagePrinter tablePrinter = 
            new RowColumnPagePrinter(ROWS_PER_PAGE,
                                    COLUMNS_PER_PAGE,
                                    "The First " + NUMBER_OF_PRIMES +
                                            " Prime Numbers");
        tablePrinter.print(primes);
    }
}

package literatePrimes;

import java.io.PrintStream;

public class RowColumnPagePrinter {
    private int rowsPerPage;
    private int columnsPerPage;
    private int numbersPerPage;
    private String pageHeader;
    private PrintStream printStream;

    public RowColumnPagePrinter(int rowsPerPage,
                                int columnsPerPage,
                                String pageHeader) {
        this.rowsPerPage = rowsPerPage;
        this.columnsPerPage = columnsPerPage;
        this.pageHeader = pageHeader;
        numbersPerPage = rowsPerPage * columnsPerPage;
        printStream = System.out;
    }

    public void print(int data[]) {
        int pageNumber = 1;
        for (int firstIndexOnPage = 0;
             firstIndexOnPage < data.length;
             firstIndexOnPage += numbersPerPage) {
            int lastIndexOnPage =
                Math.min(firstIndexOnPage + numbersPerPage - 1,
                         data.length - 1);
            printPageHeader(pageHeader, pageNumber);
            printPage(firstIndexOnPage, lastIndexOnPage, data);
            printStream.println("\f");
            pageNumber++;
        }
    }

    private void printPage(int firstIndexOnPage,
                          int lastIndexOnPage,
                          int[] data) {
        int firstIndexOfLastRowOnPage =
            firstIndexOnPage + rowsPerPage - 1;
        for (int firstIndexInRow = firstIndexOnPage;
             firstIndexInRow <= firstIndexOfLastRowOnPage;
             firstIndexInRow++) {
            printRow(firstIndexInRow, lastIndexOnPage, data);
            printStream.println("");
        }
    }

    private void printRow(int firstIndexInRow,
                          int lastIndexOnPage,
                          int[] data) {
        for (int column = 0; column < columnsPerPage; column++) {
            int index = firstIndexInRow + column * rowsPerPage;
            if (index <= lastIndexOnPage)
                printStream.format("%10d", data[index]);
        }
    }

    private void printPageHeader(String pageHeader,
                                int pageNumber) {
        printStream.println(pageHeader + " --- Page " + pageNumber);
        printStream.println("");
    }

    public void setOutput(PrintStream printStream) {
        this.printStream = printStream;
    }
}

package literatePrimes;

import java.util.ArrayList;

public class PrimeGenerator {
    private static int[] primes;
    private static ArrayList<Integer> multiplesOfPrimeFactors;

    protected static int[] generate(int n) {
        primes = new int[n];
        multiplesOfPrimeFactors = new ArrayList<Integer>();
        set2AsFirstPrime();
        checkOddNumbersForSubsequentPrimes();
        return primes;
    }

    private static void set2AsFirstPrime() {
        primes[0] = 2;
        multiplesOfPrimeFactors.add(2);
    }

    private static void checkOddNumbersForSubsequentPrimes() {
        int primeIndex = 1;
        for (int candidate = 3;
             primeIndex < primes.length;
             candidate += 2) {
            if (isPrime(candidate))
                primes[primeIndex++] = candidate;
        }
    }

    private static boolean isPrime(int candidate) {
        if (isLeastRelevantMultipleOfNextLargerPrimeFactor(candidate)) {
            multiplesOfPrimeFactors.add(candidate);
            return false;
        }
        return isNotMultipleOfAnyPreviousPrimeFactor(candidate);
    }

    private static boolean
    isLeastRelevantMultipleOfNextLargerPrimeFactor(int candidate) {
        int nextLargerPrimeFactor = primes[multiplesOfPrimeFactors.size()];
        int leastRelevantMultiple = nextLargerPrimeFactor * nextLargerPrimeFactor;
        return candidate == leastRelevantMultiple;
    }

    private static boolean
    isNotMultipleOfAnyPreviousPrimeFactor(int candidate) {
        for (int n = 1; n < multiplesOfPrimeFactors.size(); n++) {
            if (isMultipleOfNthPrimeFactor(candidate, n))
                return false;
        }
        return true;
    }

    private static boolean
    isMultipleOfNthPrimeFactor(int candidate, int n) {
        return
            candidate == smallestOddNthMultipleNotLessThanCandidate(candidate, n);
    }

    private static int
    smallestOddNthMultipleNotLessThanCandidate(int candidate, int n) {
        int multiple = multiplesOfPrimeFactors.get(n);
        while (multiple < candidate)
            multiple += 2 * primes[n];
        multiplesOfPrimeFactors.set(n, multiple);
        return multiple;
    }
}
```

<div class="book-quote">
The first thing you might notice is that the program got a lot longer. It went from a little over one page to nearly three pages in length. There are several reasons for this growth. 
First, the refactored program uses longer, more descriptive variable names. 
Second, the refactored program uses function and class declarations as a way to add commentary to the code. 
Third, we used whitespace and formatting techniques to keep the program readable.
</div>

The most contributing reason is number two of course: he introduced a lots of additional methods.

<div class="book-quote">
"Notice how the program has been split into three main responsibilities."
</div>

This is a good thing and I agree with this. But my god this should be just 3 methods: main, prime generator, formatter. It would be so much easier to read and understand.

The original solution, as ugly as it was, was small and contained. Martin's solution is big and spread out. 

# Organizing for Change

<div class="book-quote">
For most systems, change is continual. Every change subjects us to the risk that the remainder of the system no longer works as intended. In a clean system we organize our classes so as to reduce the risk of change.
</div>

I think best antidote for the risk of change is tests. The code structure and design is somewhat ephemeral and can be gradually modified so that it will lose all safety measures without anyone noticing it. Tests on the other hand give immediate signal when some of the safety measures got violated.

I agree with Martin that it's important for code structure to guide and accelerate future development, but it's not about risk.

In this chapter Martin advocates for 3 components of his future SOLID framework:
- Single Responsibility
- Open/Closed
- Dependency Injection

I don't mind SRP but "Responsibility" is an abstract concept.

```java
public class Sql { 
    public Sql(String table, Column[] columns)
    public String create()
    public String insert(Object[] fields)
    public String selectAll()
    public String findByKey(String keyColumn, String keyValue)
    public String select(Column column, String pattern)
    public String select(Criteria criteria)
    public String preparedInsert()
    private String columnList(Column[] columns)
    private String valuesList(Object[] fields, final Column[] columns)
    private String selectWithCriteria(String criteria)
    private String placeholderList(Column[] columns)
}
```

I can argue that Responsibility of this class is to generate SQL statements. And thus it has single responsibility. Martin can select different level of abstraction and claim that class is responsible for generating 7 types of SQL queries and thus has 7 responsibilities.

<div class="book-quote">
We can spot this SRP violation from a simple organizational standpoint. The method outline of Sql shows that there are private methods, such as selectWithCriteria, that appear to relate only to select statements. Private method behavior that applies only to a small subset of a class can be a useful heuristic for spotting potential areas for improvement.
</div>

Ok. but aren't you the one who tend to introduce 100500 small private methods that's being used only once?

Open/Closed principle is the most odd one. There is nothing wrong in modifying code that you own and maintain. Designing proper extension points always depends on the context, and I don't think there is universal rules to it. And as such this a time-consuming exercise, be mindful on how much time budget you should spent of this. In the worlds of java there is a tendency to have everything open (by default, classes can be extended and methods can be overridden), so you are getting "open for extension" part for free.
