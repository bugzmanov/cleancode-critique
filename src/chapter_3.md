# Chapter 3: Functions

The chapter begins by showcasing an example of "bad" code:

<div class="book-quote">
<pre><code class="language-java">public static String testableHtml(PageData pageData, boolean includeSuiteSetup) throws Exception {
    WikiPage wikiPage = pageData.getWikiPage();
    StringBuffer buffer = new StringBuffer();
    if (pageData.hasAttribute("Test")) {
      if (includeSuiteSetup) {
        WikiPage suiteSetup =
         PageCrawlerImpl.getInheritedPage(
                 SuiteResponder.SUITE_SETUP_NAME, wikiPage
         );
        if (suiteSetup != null) {
         WikiPagePath pagePath = suiteSetup.getPageCrawler().getFullPath(suiteSetup);
         String pagePathName = PathParser.render(pagePath);
         buffer.append("!include -setup .")
               .append(pagePathName)
               .append("\n");
        }
      }
      WikiPage setup = 
        PageCrawlerImpl.getInheritedPage("SetUp", wikiPage);
      if (setup != null) {
        WikiPagePath setupPath = wikiPage.getPageCrawler().getFullPath(setup);
        String setupPathName = PathParser.render(setupPath);
        buffer.append("!include -setup .")
              .append(setupPathName)
              .append("\n");
      }
    }
    buffer.append(pageData.getContent());
    if (pageData.hasAttribute("Test")) {
      WikiPage teardown = PageCrawlerImpl.getInheritedPage("TearDown", wikiPage);
      if (teardown != null) {
        WikiPagePath tearDownPath = wikiPage.getPageCrawler().getFullPath(teardown);
        String tearDownPathName = PathParser.render(tearDownPath);
        buffer.append("\n")
              .append("!include -teardown .")
              .append(tearDownPathName)
              .append("\n");
      }
       if (includeSuiteSetup) {
         WikiPage suiteTeardown =
           PageCrawlerImpl.getInheritedPage(
                   SuiteResponder.SUITE_TEARDOWN_NAME,
                   wikiPage
           );
         if (suiteTeardown != null) {
           WikiPagePath pagePath = suiteTeardown.getPageCrawler().getFullPath (suiteTeardown);
           String pagePathName = PathParser.render(pagePath);
           buffer.append("!include -teardown .")
                 .append(pagePathName)
                 .append("\n");
         }
       }
     }
     pageData.setContent(buffer.toString());
     return pageData.getHtml();
  }
</code></pre>
</div>

And the proposes refactoring: 

<div class="book-quote">
<pre><code class="language-java">public static String renderPageWithSetupsAndTeardowns(PageData pageData, boolean isSuite) throws Exception {
    boolean isTestPage = pageData.hasAttribute("Test");
    if (isTestPage) {
        WikiPage testPage = pageData.getWikiPage();
        StringBuffer newPageContent = new StringBuffer();
&nbsp;
        includeSetupPages(testPage, newPageContent, isSuite);
        newPageContent.append(pageData.getContent());
        includeTeardownPages(testPage, newPageContent, isSuite);
&nbsp;
        pageData.setContent(newPageContent.toString());
    }
&nbsp;
    return pageData.getHtml();
}
</code></pre>
</div>

The original version operates on multiple levels of detalization and juggles multiple domains at the same time:
- *API for fitness objects*: working with `WikiPage`, `PageData`, `PageCrawler` etc
- *Java string manipulation*: Using StringBuffer to optimize string concatenation (it should be StringBuilder).
- *Business logic*: Handling suites, tests, setups, and teardowns in a specific order.

When everything presented at the same level  it indeed looks very noisy and hard to follow. (the book touches this in ["One Level of Abstraction per Function"](./chapter_32.html))

Martin's trick here is simple: show that smaller code is easier to understand than larger code. 
This works because he doesn't show the implementation of `includeSetupPages` and `includeTeardownPages`

But... extracting non-reusable methods doesn’t actually reduce complexity or code size, at best it just improves navigation. 

What objectively reduces code size is removing repetitions (the fancy term - [Anti-Unification](https://en.wikipedia.org/wiki/Anti-unification)): the original code as bad as it is can be significantly improved by a small change - extract code duplication into helper method:

```java
public static String testableHtml(PageData pageData, boolean includeSuiteSetup) {
    if (pageData.hasAttribute("Test")) { // not a test data page
        return pageData.getHtml(); 
    } 
    WikiPage wikiPage = pageData.getWikiPage();
    List<String> buffer = new ArrayList<>();
    if (includeSuiteSetup) {
        buffer.add(generateInclude(wikiPage, "Suite SetUp", "-setup"));
    }
    buffer.add(generateInclude(wikiPage, "SetUp", "-setup"));

    buffer.append(pageData.getContent());

    buffer.add(generateInclude(wikiPage, "TearDown", "-teardown"));
    if (includeSuiteSetup) {
        buffer.add(generateInclude(wikiPage, "Suite TearDown", "-teardown"))
    }

    pageData.setContent(buffer.stream().filter(String::nonEmpty).join("\n"));
    return pageData.getHtml();
}

private static String generateInclude(WikiPage wikiPage, String path, String command) {
    WikiPage inheritedPage = PageCrawlerImpl.getInheritedPage(path, wikiPage);
    if (inheritedPage != null) {
        WikiPagePath pagePath = inheritedPage.getPageCrawler().getFullPath(inheritedPage);
        String pagePathName = PathParser.render(pagePath);
        return "!include " + command + " ." + pagePathName;
    } else {
        return "";
    }
}
```

Is it noisier than Martin's version? Yes. But most people would answer "YES" to the posed question "Do you understand the function after three minutes of study?" 
And it's a small change to the original mess.

<div style="text-align:center"><img src="./images/code_compression.png" width="70%"/></div>

<div class="subtle-paragraph">
"Extract a helper" - is one of those tidyings that Kent Beck is advocating - small code changes that definitely improve situation and have small risk.
</div>

## The real problem

Despite these improvements, we're missing the critical issue: both versions modify the PageData object as a side effect. 
Both `testableHtml` and `renderPageWithSetupsAndTeardowns` overwrite PageData's content to generate HTML. 
This hidden behavior, not the code structure, is the real problem.


