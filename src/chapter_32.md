## One Level of Abstraction per Function

This is a good rule, but as an author of the code you have always a choice: **what is your abstraction**.

```java
public static String testableHtml(PageData pageData, boolean includeSuiteSetup) {
    WikiPage wikiPage = pageData.getWikiPage();
    StringBuilder buffer = new StringBuilder();
    boolean isTestPage = pageData.hasAttribute("Test");
    if (isTestPage) {
        if (includeSuiteSetup) {
            buffer.append(generateInclude(wikiPage, SuiteResponder.SUITE_SETUP_NAME, "-setup")).append("\n")
        }
        buffer.append(generateInclude(wikiPage, "SetUp", "-setup")).append("\n")
    }

    buffer.append(pageData.getContent());

    if (isTestPage) {
        buffer.append(generateInclude(wikiPage, "TearDown", "-teardown"))
        if (includeSuiteSetup) {
            buffer.append("\n").append(generateInclude(wikiPage, SuiteResponder.SUITE_TEARDOWN_NAME, "-teardown"))
        }
    }
    pageData.setContent(buffer.toString());
    return pageData.getHtml();
}
```

You might say this violates "one level of abstraction":

<div class="book-quote">
There are concepts in there that are at a very high level of abstraction, such as getHtml(); <br/>
others that are at an intermediate level of abstraction, such as: String pagePathName = PathParser.render(pagePath);<br/> 
and still others that are remarkably low level, such as: .append("\n").
</div>

Or.. you could also argue that the domain of this function is to convert PageData into HTML as a raw string. 
In that context, the function consistently operates on the same level of abstraction: processing data of a specific shape and generating formatted HTML text.

<div class="subtle-paragraph">
"Abstractions are mappings between a complex concrete world and a simple idealized one."

James Koppel ["Abstraction is not what you think it is"](https://www.pathsensitive.com/2022/03/abstraction-not-what-you-think-it-is.html )
</div>

The key point is that **abstraction is a choice**. Developers must decide on the idealized world their function is operating in. 
If your abstraction is "a data processor for converting PageData to raw HTML," then the function maintains that level.

[todo: this might need more clarification]

