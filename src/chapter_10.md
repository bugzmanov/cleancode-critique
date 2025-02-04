# Chapter 10: Classes

Written with Jeff Langr, this chapter reveals a fundamental contradiction in Clean Code's approach:

* Classes should have minimal responsibilities (ideally one)
* Classes should have few instance variables
* Methods should have few parameters

See the problem? Reducing method parameters forces state into instance variables. Keeping instance variables minimal requires creating more classes.
Martin's solution?
More classes is better:


<div class="book-quote">
So breaking a large function into many smaller functions often gives us the opportunity to split several smaller classes out as well. 
This gives our program a much better organization and a more transparent structure.
</div>

And then he does his favorite trick: shows obfuscated code (admittedly machine-generated) and refactors it using all his favorite hits: 
* Classes with global mutable state
* Parameters moved to instance fields
* Tiny single-use private methods
* Essay-length names

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

Martin celebrates the growth:
<div class="book-quote">
The first thing you might notice is that the program got a lot longer. It went from a little over one page to nearly three pages in length. There are several reasons for this growth. 
First, the refactored program uses longer, more descriptive variable names. 
Second, the refactored program uses function and class declarations as a way to add commentary to the code. 
Third, we used whitespace and formatting techniques to keep the program readable.
</div>

The real reason for the bloat: excessive method and class extraction. What should be three clear methods (main, generate primes, format output) becomes a sprawling hierarchy of tiny classes.

<div class="book-quote">
"Notice how the program has been split into three main responsibilities."
</div>

The original solution, though ugly, was contained. Refactored version is glutted and bloated, scattered across multiple files, and still ugly. ¯\\_(ツ)_/¯ 

# Organizing for Change

<div class="book-quote">
For most systems, change is continual. Every change subjects us to the risk that the remainder of the system no longer works as intended. In a clean system we organize our classes so as to reduce the risk of change.
</div>

I think our best defense against risky changes is tests. Code structure can erode silently - tests fail loudly.

I agree that it's important for code structure to guide and accelerate future development, but it's not about risk.

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

Is this class's single responsibility "generating SQL statements"? Or does it have seven responsibilities, one per query type? The definition depends entirely on your abstraction level.

