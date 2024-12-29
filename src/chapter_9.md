# Chapter 9: Unit Tests

<div class="book-quote">
What this team did not realize was that having dirty tests is equivalent to, if not worse than, having no tests.
</div>

This statement lacks nuance: if the dirty tests are actually testing software, then having them is better than not having them. <br/>
Again this is the example of when that is true: [Oracle Database: an unimaginable horror! You can't change a single line of code in the product without breaking 1000s of existing tests](https://news.ycombinator.com/item?id=18442941) <br/>
Oracle Database is a very reliable software (as of 2024), it comes at the cost of thousands of people suffering through the setup, but as a customer I enjoy its robustness.

Having tests that actually test software is good, even if they are dirty. However proliferation of mocking frameworks lead to the situation when developers spent time tweaking mock expectations and then testing the mocks.

This chapter unintentionally shows the value of finding a balance. 

First, it provides an example of a refactoring that I almost agree with:

<div class="code-comparison" >
    <div class="code-column" style="flex:0">
        <div class="code-column-title">Original Code: </div>
        <pre class="ignore"><code class="language-java" style="font-size: 13px !important">public void testGetPageHieratchyAsXml() throws Exception {
  crawler.addPage(root, PathParser.parse("PageOne"));
  crawler.addPage(root, PathParser.parse("PageOne.ChildOne"));
  crawler.addPage(root, PathParser.parse("PageTwo"));
&nbsp;
  request.setResource("root");
  request.addInput("type", "pages");
  Responder responder = new SerializedPageResponder();
  SimpleResponse response =
      (SimpleResponse) responder.makeResponse(
          new FitNesseContext(root), request);
  String xml = response.getContent();
&nbsp;
  assertEquals("text/xml", response.getContentType());
  assertSubString("<name>PageOne</name>", xml);
  assertSubString("<name>PageTwo</name>", xml);
  assertSubString("<name>ChildOne</name>", xml);
}
&nbsp;
public void testGetPage_cLinks() throws Exception {
  WikiPage pageOne = 
    crawler.addPage(root, PathParser.parse("PageOne"));
  crawler.addPage(root, PathParser.parse("PageOne.ChildOne"));
  crawler.addPage(root, PathParser.parse("PageTwo"));
&nbsp;
  PageData data = pageOne.getData();
  WikiPageProperties properties = data.getProperties();
  WikiPageProperty symLinks = 
    properties.set(SymbolicPage.PROPERTY_NAME);
  symLinks.set("SymPage", "PageTwo");
  pageOne.commit(data);
&nbsp;
  request.setResource("root");
  request.addInput("type", "pages");
  Responder responder = new SerializedPageResponder();
  SimpleResponse response =
      (SimpleResponse) responder.makeResponse(
          new FitNesseContext(root), request);
  String xml = response.getContent();
&nbsp;
  assertEquals("text/xml", response.getContentType());
  assertSubString("<name>PageOne</name>", xml);
  assertSubString("<name>PageTwo</name>", xml);
  assertSubString("<name>ChildOne</name>", xml);
  assertNotSubString("SymPage", xml);
}
&nbsp;
public void testGetDataAsHtml() throws Exception {
  crawler.addPage(root, 
    PathParser.parse("TestPageOne"), "test page");
&nbsp;
  request.setResource("TestPageOne"); 
  request.addInput("type", "data");
  Responder responder = new SerializedPageResponder();
  SimpleResponse response =
      (SimpleResponse) responder.makeResponse(
          new FitNesseContext(root), request);
  String xml = response.getContent();
&nbsp;
  assertEquals("text/xml", response.getContentType());
  assertSubString("test page", xml);
  assertSubString("&gt;Test", xml);
}</code></pre>
    </div>
    <div class="code-column">
        <div class="code-column-title">Proposed rewrite:</div>
        <pre><code class="language-java" style="font-size: 13px !important">public void testGetPageHierarchyAsXml() throws Exception {
    makePages("PageOne", "PageOne.ChildOne", "PageTwo");
&nbsp;
    submitRequest("root", "type:pages");
&nbsp;
    assertResponseIsXML();
    assertResponseContains(
        "<name>PageOne</name>", "<name>PageTwo</name>", "<name>ChildOne</name>"
    );
}
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
public void testGetPage_cLinks() throws Exception {
    WikiPage page = makePage("PageOne");
    makePages("PageOne.ChildOne", "PageTwo");
&nbsp;
    addLinkTo(page, "PageTwo", "SymPage");
&nbsp;
    submitRequest("root", "type:pages");
&nbsp;
    assertResponseIsXML();
    assertResponseContains(
        "<name>PageOne</name>", "<name>PageTwo</name>",
        "<name>ChildOne</name>"
    );
    assertResponseDoesNotContain("SymPage");
}
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
&nbsp;
public void testGetDataAsXml() throws Exception {
    makePageWithContent("TestPageOne", "test page");
&nbsp;
    submitRequest("TestPageOne", "type:data");
&nbsp;
    assertResponseIsXML();
    assertResponseContains("test page", "&gt;Test");
}</code></pre>
    </div>
</div>


What makes it good:
- the introduced abstractions are useful and reusable

What is bad: 
- Martin introduces **global mutable state** (global in terms of the test suite)

Big drawback of this global mutable state - now tests can not be run in parallel. Hence the execution of these 3 tests will take 3x more time. 

Clear case of ["'Clean' Code, Horrible Performance"](https://www.computerenhance.com/p/clean-code-horrible-performance)

Again this is self-inflicted pain from a painful idea that no parameters is always better than 1+.

By fixing it: 

```java
public void testGetDataAsXml() throws Exception {
    var page = makePageWithContent("TestPageOne", "test page");

    var response = submitRequest(page, "type:data");

    assertIsXML(response);
    assertContains(response, "test page", "<Test");
}
```

You get advocated `BUILD`-`OPERATE`-`CHECK` shape, without need to have implicit mutable state somewhere hidden.
All tests are isolated and can run in parallel.

----

And while first example in this chapter is a good illustration how tidying your API with domain specific details can improve code readability, 
the next one is an illustration that this approach can be taken too far:

```java
@Test
public void turnOnLoTempAlarmAtThreashold() throws Exception {
    hw.setTemp(WAY_TOO_COLD);
    controller.tic();
    assertTrue(hw.heaterState());
    assertTrue(hw.blowerState());
    assertFalse(hw.coolerState());
    assertFalse(hw.hiTempAlarm());
    assertTrue(hw.loTempAlarm());
}
```

is proposed to be rewritten as:

```java
@Test
public void turnOnLoTempAlarmAtThreshold() throws Exception {
    wayTooCold();
    assertEquals("HBchL", hw.getState());
}

// Upper case means "on," lower case means "off," and the letters are always in the following order: 
// {heater, blower, cooler, hi-temp-alarm, lo-temp-alarm}
```

Domain Specific Language is a programming language still and readability of that is important. 
"HBchL" is not very readable, as it requires noticeable mental effort to translate. This defeats the purpose of making code more readable.

What prevents him from creating format like: ```"heater:on, blower:on, cooler:off, hi-temp-alarm:off, lo-temp-alarm:on"```?

`wayTooCold();` - is also very weird grammar. Is it a verb or verb phrase? Why do we need to hide call to `controller.tic()`? 

In the `BUILD`-`OPERATE`-`CHECK` template: `Controller.tic()` is the `OPERATE`!


```java
wayTooCold();
assertEquals("HBchL", hw.getState());
```

This is not `BUILD`-`OPERATE`-`CHECK`. Thi is `WHY`-`WTF`

From good readability perspective I would change it to:

```java
@Test
public void turnOnLoTempAlarmAtThreashold() throws Exception {
    hw.setTempF(10); // too cold

    controller.tic();

    assertEquals(
        "heater:on, blower:on, cooler:off, hi-temp-alarm:off, lo-temp-alarm:on",
        hw.getState()
    );
}
```

Again in modern language there is no need to create DSL as the language is powerful enough to make code concise and readable:

```scala
@Test
def turnOnLoTempAlarmAtThreashold() {
    hw.setTemp(10.F) // too cold

    controller.tic()

    assertEquals(
        Status(heaterOn = true, blowerOn = false, coolerOn = false, 
               hiTempAlarm = false, loTempAlarm = true)
        hw.getState()
    )
}
```


Final nit-pick:

<div class="book-quote">
<pre><code class="language-java">public String getState() {
    String state = "";
    state += heater ? "H" : "h";
    state += blower ? "B" : "b";
    state += cooler ? "C" : "c";
    state += hiTempAlarm ? "H" : "h";
    state += loTempAlarm ? "L" : "l";
    return state;
}
</code></pre>
StringBuffers are a bit ugly.
</div>

Again the book age shows: StringBuffers are not only ugly they are also slow. StringBuffer are synchronized for multi-threaded access, even without contention it has runtime cost. Good news are his original code will be compiled by javac to use StringBuilders.

<div class="book-quote">
There are things that you might never do in a production environment that are perfectly fine in a test environment. Usually they involve issues of memory or CPU efficiency. But they never involve issues of cleanliness.
</div>

Test performance matters at scale - slow tests can significantly impact development velocity. The most important thing for tests to do is to actually test the software. 
But giving up tests performance in large code base means increase of validation cycle in CI/CD pipelines.  
