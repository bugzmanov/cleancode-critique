## Small!

<span style="font-size:80px; color: red;"> NO! </span> 
This is one of the two most harmful ideas in Clean Code. 
Bazzilion small functions has become a trademark of "clean-coders" and it fundamental misunderstanding why we break down code.<br/>
(the second worst idea of the book is that ["Comments are a failures"](./chapter_4.html)). 

Breaking a system into pieces is an extremely useful technique for:
- Building reusable components
- Keeping unrelated concerns separate
- Reducing cognitive load required to reason about components independently

However clean code advocates for splitting the code in order to just keep functions short. By itself this is a useless metric. 

When components become too small, they:
* Fail to encapsulate meaningful functionality
* Become tightly coupled with other parts
* Can't be analyzed independently

This defeats the original goals of modularity:
* Less reusable: Tight coupling makes it harder to use pieces of the system in different contexts.
* Harder to understand: You can't reason about pieces in isolation—everything is interconnected

You can argue that shorter methods are less complex, but this addresses only **local complexity**.
To understand a system, you have to deal with global complexity - the sum of all the pieces **and how they interact**. A bad split can make global complexity worse.

Most of the time, splitting a function into tiny pieces doesn’t improve much. 
This is like cutting a pizza into smaller slices and claiming you've reduced the calories.

My rule of thumb: splitting code should reduce global complexity or code size (preferrably both). 
If breaking something into smaller pieces makes the overall system harder to understand and/or adds more lines of code, you’ve just made things worse.

There’s also the problem of running out of good names when you create too many small functions. 
This leads to long, over-descriptive names that actually make code harder to read (more on this later):

```java
// an example, not from the book
public static String render(PageData pageData, boolean isSuite) throws Exception 
private static String renderPageWithSetupsAndTeardowns(PageData pageData, boolean isSuite) throws Exception 
private static String failSafeRenderPageWithSetupsAndTeardowns(PageData pageData, boolean isSuite) throws Exception 
```


**PS** Unfortunately, Martin still advocates for this approach: 

<center>
    <blockquote class="twitter-tweet" data-media-max-width="560"><p lang="en" dir="ltr">How Small Should a Function be? By Uncle Bob <a href="https://t.co/hhk61RpXSp">pic.twitter.com/hhk61RpXSp</a></p>&mdash; Mohit Mishra (@chessMan786) <a href="https://twitter.com/chessMan786/status/1867877505933471823?ref_src=twsrc%5Etfw">December 14, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</center>

<br/>
<br/>

