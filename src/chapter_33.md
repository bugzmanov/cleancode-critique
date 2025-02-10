## Switch Statements

<div class="book-quote">
It's hard to make a small switch statement. Even a switch statement with only two cases is larger than I'd like a single block or function to be. It's also hard to make a switch statement that does one thing. By their nature, switch statements always do N things.
</div>

By this logic a method can never have if-else statement - they also do N things.

There was a whole movement of [anti-if programming](https://www.defusetheifstrategy.com/).
I'm not quite sure if it's a joke [or not](https://en.algorithmica.org/hpc/pipelining/branchless/)

Ok, back to Martin:

<div class="book-quote">
<pre><code class="language-java">public Money calculatePay(Employee e) throws InvalidEmployeeType {
    switch (e.type) {
        case COMMISSIONED:
            return calculateCommissionedPay(e);
        case HOURLY:
            return calculateHourlyPay(e);
        case SALARIED:
            return calculateSalariedPay(e);
        default:
            throw new InvalidEmployeeType(e.type);
    }
}
</code></pre>
</div>

Whether this violates the "one thing" rule depends entirely on perspective:
- *Low-level view*: Four branches doing four different things 
- *High-level view*: One thing - calculating employee pay

Switch statements have bad rep among Java developers:
* Doesn't look like OOP
* Leads to repetition
* Lead to bugs when copies get out of sync 

Starting from Java 13 switch expressions introduced [exhaustive matching](https://openjdk.org/jeps/354), addressing one of these issues.

```java
public Money calculatePay(Employee e) throws InvalidEmployeeType {
    return switch (e.type) {
        case COMMISSIONED -> yield calculateCommissionedPay(e);
        case HOURLY       -> yield calculateHourlyPay(e);
        case SALARIED     -> yield calculateSalariedPay(e);
    }
}
```
Forgetting to handle a case now causes compile-time errors that's improssible to miss. No extra abstractions needed.

Martin suggests hiding the switch statement behind polymorphism:

<div class="book-quote">
<pre><code class="language-java">public abstract class Employee {
    public abstract boolean isPayday();
    public abstract Money calculatePay();
    public abstract void deliverPay(Money pay);
}
&nbsp;
public interface EmployeeFactory {
    public Employee makeEmployee(EmployeeRecord r) throws InvalidEmployeeType;
}
&nbsp;
public class EmployeeFactoryImpl implements EmployeeFactory {
    public Employee makeEmployee(EmployeeRecord r) throws InvalidEmployeeType {
        switch (r.type) {
            case COMMISSIONED:
                return new CommissionedEmployee(r);
            case HOURLY:
                return new HourlyEmployee(r);
            case SALARIED:
                return new SalariedEmploye(r);
            default:
                throw new InvalidEmployeeType(r.type);
        }
    }
}
</code></pre>
</div>

This common approach has serious problems, as Martin's own example shows.

His Employee interface becomes a god object mixing unrelated concerns:
- `Employee.isPayday()` - couples Employee with payments, agreements, calendars and dates
- `Employee.calculatePay()` - couples Employee with financial calculations 
- `Employee.deliverPay()` - couples Employee with transaction processing and persistence

As more features will be added, the Employee interface will inevitably grow into an unmanageable, bloated entity 

Ironically, [Chapter 10](./chapter_10.html) talks about cohesion and single responsibility principle.
Yet here, to avoid a switch, he violates these core OOP principles.

<div class="subtle-paragraph">
<b> Writing software is a balancing act </b> - it is a search for a solution in a system of contradictory constraints.
</div>

By declaring `switch` fundamentally bad, Martin loses this balance. His solution increases complexity and couples unrelated concerns, trading one set of problems for another.

To properly separate concerns, we'd need to split `Employee` into focused interfaces like `Payable`, `Schedulable`, and `Transactionable`. 
But to maintain polymorphism, we'd then need either three factories (repetition) or a factory of factories (over-engineering).

