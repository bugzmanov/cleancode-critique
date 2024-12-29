## Small!

<span style="font-size:80px; color: red;"> NO! </span> 
I genuinely think this book is outdated, and a lot of its advice is more harmful than helpful.
But there are two parts that stand out as the worst ideas in the whole book. This is one of them (the second one is ["Comments are a failures"](./chapter_4.html)).<br/>
Bazzilion small functions to achieve trivial functionality is a hallmark of "clean-coders". And this is the most damaging concept in this book. 

Splitting a system into pieces is an extremely useful technique for:
- Building reusable components
- Keeping unrelated concerns separate
- Reducing cognitive load required to reason about components independently

However clean code advocates for splitting in order just to keep functions short. By itself this is a useless metric. 

When you make a component too small - it fails to encapsulate a required functionality. It can not be analyzed independently as it ends up tightly coupled with other parts of the system, which defeats the purpose of breaking things up:
* Less reusable: Tight coupling makes it harder to use pieces of the system in different contexts.
* Harder to understand: You can’t analyze the pieces independently anymore—they all depend on each other.

You can argue that shorter methods themselves are less complex now, but this addresses only **local complexity**.
To really understand a system, you have to deal with global complexity - the sum of all the pieces **and how they interact**. A bad split can actually make global complexity worse.

Most of the time, splitting a function into a bunch of tiny pieces doesn’t improve much. 
It's like cutting a whole pizza pie into slices, and hoping that you consume fewer calories after eating every slice.

My rule of thumb: splitting code should reduce global complexity or code size (or both). The split that increases both metrics is a bad idea.
If breaking something into smaller pieces makes the overall system harder to understand and adds more lines of code, you’ve just made things worse.

There’s also the problem of running out of good names when you create too many small functions. 
Once that happens, you’re stuck writing long, overly descriptive names that clutter the code and make it harder to read:

```java
public static String renderPageWithSetupsAndTeardowns(PageData pageData, boolean isSuite) throws Exception {
    if (isTestPage(pageData))
        includeSetupAndTeardownPages(pageData, isSuite);
    return pageData.getHtml();
}
```


