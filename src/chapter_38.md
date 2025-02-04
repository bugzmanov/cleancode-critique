## How Do You Write Functions Like This?

<div class="book-quote">
"When I write functions, they come out long and complicated. They have lots of indenting and nested loops. They have long argument lists. 
The names are arbitrary, and there is duplicated code."

"So then I massage and refine that code, splitting out functions, changing names, eliminating duplication. I shrink the methods and reorder them. Sometimes I break out whole classes, all the while keeping the tests passing.
In the end, I wind up with functions that follow the rules I've laid down in this chapter. I don't write them that way to start. I don't think anyone could."
</div>

What's Martin is advocating is bottom-up approach to software development: first make it work, then make it beautiful( = "clean", in Matrins worldview).

But this is not the only way to design software! 

In my experience, top-down design often produces more elegant solutions:

1) Start by imagining how you want the code to look like
2) Sketch it in pseudocode 
3) Gradually fill in the implementation details, making adjustments as needed while preserving the original design

### A Concrete Example

One of my biggest pet peeves is that [Decision Tables](https://www.hillelwayne.com/post/decision-tables/) are underused in programming. They make complex logic immediately obvious and provide a perfect overview of the problem.

```
PAYMENT METHOD    |   DISCOUNT CODE   |    TAX STATUS    |    PRICE
--------------------------------------------------------------------
PayPal            |    CLEANCODE      |     NONEXEMPT    |    8.99
CreditCard        |      N/A          |     NONEXEMPT    |    9.99
```

Standard JUnit tests lose this clarity:

```java
assertEquals(
    priceService.calcuate(new Criteria()
        .paymentMethod(Payment.PayPal)
        .discountCode("CLEANCODE")
        .taxStatus(Tax.NonExempt)
   ),
    new BigDecimal("8.99")
);


assertEquals(
    priceService.calcuate(new Criteria()
        .paymentMethod(Payment.CreditCatd)
        .discountCode("")
        .taxStatus(Tax.NonExempt)
    ),
    new BigDecimal("9.99")
);
```

No amount of refactoring will restore the original table-like structure.

But if you start with a top-down approach, you can decide upfront that you want your test to look like a decision table. That might lead you to write code like this:

```java
executeTests(
    "PAYMENT METHOD     |   DISCOUNT CODE   |    TAX STATUS    |    PRICE  \n" +
    "----------------------------------------------------------------------\n" + 
    " PayPal            |    CLEANCODE      |     NONEXEMPT    |    8.99   \n" + 
    " CreditCard        |      N/A          |     NONEXEMPT    |    9.99   \n" 
)

```
Now, the challenge becomes figuring out how to implement a parser and interpreter for executeTests.

Or you might take an approach that doesn't require parsing and design an internal DSL that still looks like a table:

```java
testTable()
    .header (
    //------------------------------------------------------------------------------------
           PAYMENT_METHOD     , DISCOUNT_CODE, TAX_STATUS     ,     PRICE              ) 
    //------------------------------------------------------------------------------------
    .row( Payment.PayPal      , "CLEANCODE"  , Tax.NonExempt  , new BigDecimal("8.99") ),
    .row( Payment.CreditCard  , ""           , Tax.NonExempt  , new BigDecimal("9.99") )
    //------------------------------------------------------------------------------------
    .executeTests()
```

Yes, these approaches require more upfront work. That's not the point.

The key insight: top-down design lets you control code structure from the start. You build supporting infrastructure to achieve your vision.

In contrast, starting with a messy, working solution and then refining it into something cleaner is more of a discovery process. 
When your refactoring toolkit consists mainly of extraction techniques (as Martin suggests), you often end up with suboptimal results.
