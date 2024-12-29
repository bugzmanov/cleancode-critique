## Switch Statements

<div class="book-quote">
It's hard to make a small switch statement. Even a switch statement with only two cases is larger than I'd like a single block or function to be. It's also hard to make a switch statement that does one thing. By their nature, switch statements always do N things.
</div>

By this logic a method can never have if-else statement: that would mean do-ing two things.

There was a whole movement of [anti-if programming](https://www.antiifprogramming.com/about-the-anti-if.php).
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

Whether this code violates the "one thing" rule depends on a perspective:
- *Low-level view*: The function has four branches and performs four distinct actions.
- *High-level view*: The function calculates pay for an employee. It is doing one thing.

Switch statements have bad rep among Java developers:
* Doesn't look like OOP
* Leads to repetition
* Repetition leads to mistakes when some of the copies go out of sync with others

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

With exhaustive matching, forgetting to handle a new EmployeeType causes a compile-time error. This solves issue #3 without introducing additional abstractions.
And makes issue #2 benign.

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

While this approach (replace `switch` with polymorphism) is a common one, Martin’s example illustrates why it isn’t as straightforward as it seems.

The proposed Employee interface is stuffed with domains and responsibilities:
- `Employee.isPayday()` - couples Employee with payments, agreements, calendars and dates
- `Employee.calculatePay()` - couples Employee with financial calculations 
- `Employee.deliverPay()` - couples Employee with transaction processing and persistence

This makes Employee a god object that handles everything related to employees. As more features are added, the Employee class will inevitably grow into an unmanageable, bloated entity 

[Chapter 10](./chapter_10.html) talks about cohesion and single responsibility principle, it feels strange that in order to avoid `swtich` Martin forgoes OOP principles he advocates for. 

<div class="subtle-paragraph">
<b> Writing software is a balancing act </b> - it is a search for a solution in a system of contradictory constraints.
</div>

By declaring `switch` fundamentally bad, Martin loses the balance. His solution increases complexity and couples unrelated concerns, trading one set of problems for another.

The final point: to properly separate concerns, the `Employee` interface would need to be broken into multiple, smaller interfaces (something like `Payable`, `Schedulable`, `Transactionable`, etc). 
To maintain polymorphism, we'd either need three abstract factories (repetitions) or factory of factories (over-engineering).


