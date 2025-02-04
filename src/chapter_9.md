# Chapter 9: Unit Tests

Martin claims:

<div class="book-quote">
What this team did not realize was that having dirty tests is equivalent to, if not worse than, having no tests.
</div>

This lacks crucial nuance: messy tests that actually test software are better than no tests. <br/>

To repeat the example of when that is true: [Oracle Database: an unimaginable horror! You can't change a single line of code in the product without breaking 1000s of existing tests](https://news.ycombinator.com/item?id=18442941) <br/>
Oracle Database is a very reliable software (as of 2024), it comes at the cost of thousands of people suffering through the setup, but as a customer I enjoy its robustness.

However proliferation of mocking frameworks lead to the situation when developers spent time tweaking mock expectations and then testing the mocks. Those are indeed often messy is useless.

The chapter highlights two competing approaches through refactoring examples.

First, it presents an example of a refactoring that I mostly agree with:

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


The <span style="color: lightgreen">good</span>:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - the introduced abstractions are useful and reusable

The <span style="color: red">bad</span>: 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - Martin introduces **global mutable state** (global in terms of the test suite)

Big drawback of this global mutable state - now tests can not be run in parallel. Hence the execution of these 3 tests will take 3x more time. 

Another case of ["'Clean' Code, Horrible Performance"](https://www.computerenhance.com/p/clean-code-horrible-performance).

This is self-inflicted harm from a painful idea that no parameters is always better than 1+.

By fixing it: 

```java
public void testGetDataAsXml() throws Exception {
    var page = makePageWithContent("TestPageOne", "test page");

    var response = submitRequest(page, "type:data");

    assertIsXML(response);
    assertContains(response, "test page", "<Test");
}
```

We get the `BUILD`-`OPERATE`-`CHECK` pattern without hidden state. Tests are isolated and can run in parallel.

----

The first example in this chapter shows how adding domain-specific details can improve readability.
The second example shows how domain-specific abstractions can go wrong:

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

The mini-DSL makes things harder to read, not easier.
The "HBchL" encoding requires extra mental effort to decode, which defeats the purpose of making the test more readable.

Why not "heater:on, blower:on, cooler:off, hi-temp-alarm:off, lo-temp-alarm:on" ? 

`wayTooCold();` - is also very weird grammar. Is it a verb or verb phrase? Why do we need to hide `controller.tic()`? 

In the `BUILD`-`OPERATE`-`CHECK` pattern: `Controller.tic()` is the `OPERATE`!

```java
wayTooCold();
assertEquals("HBchL", hw.getState());
```

This is not `BUILD`-`OPERATE`-`CHECK`. Thi is `WHY`-`WTF`

A more natural approach:

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

Again in modern languages, like Scala

```scala
@Test
def turnOnLoTempAlarmAtThreashold() {
    hw.setTemp(10.F) // too cold

    controller.tic()

    assertEquals(
        Status(heaterOn = true, blowerOn = false, coolerOn = false, 
            hiTempAlarm = false, loTempAlarm = true
        ),
        hw.getState()
    )
}
```

No need for mini-DSLs, the language itself is expressive enough to keep things clean and clear.

### Final nitpick: Test Performance Matters 

<div class="book-quote">
The getState function is shown in Listing 9-6. Notice that this is not very efficient code. To make it efficient, I probably should have used a StringBuffer.

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

Not only are StringBuffers ugly, but they’re also slow (the book shows it age). StringBuffer is synchronized for multi-threaded access, adding unnecessary overhead. 
Fortunately, modern javac compiler can optimize sligtly modified version of `getState` method to use [the most optimal stategy](https://www.baeldung.com/java-string-concatenation-invoke-dynamic):

<div class="code-comparison">
    <div class="code-column" style="flex:0">
        <div class="code-column-title">Java Code: </div>
        <pre class="ignore"><code class="language-java">public String getState() {
  return (heater ? "H" : "h") + 
          (blower ? "B" : "b") +
          (cooler ? "C" : "c") +
          (hiTempAlarm ? "H" : "h") +
          (loTempAlarm ? "L" : "l");
 }</code></pre>
    </div>
    <div class="code-column">
        <div class="code-column-title">Decompiled with javap (jdk 21):</div>
        <pre class="ignore"><code class="language-java"> public java.lang.String getState();
  descriptor: ()Ljava/lang/String;
  flags: (0x0001) ACC_PUBLIC
  Code:
    stack=5, locals=1, args_size=1
       0: aload_0
       1: getfield      #7                  // Field heater:Z
       4: ifeq          12
       7: ldc           #13                 // String H
       9: goto          14
      12: ldc           #15                 // String h
      14: aload_0
      15: getfield      #17                 // Field blower:Z
      18: ifeq          26
      21: ldc           #20                 // String B
      23: goto          28
      26: ldc           #22                 // String b
      28: aload_0
      29: getfield      #24                 // Field cooler:Z
      32: ifeq          40
      35: ldc           #27                 // String C
      37: goto          42
      40: ldc           #29                 // String c
      42: aload_0
      43: getfield      #31                 // Field hiTempAlarm:Z
      46: ifeq          54
      49: ldc           #13                 // String H
      51: goto          56
      54: ldc           #15                 // String h
      56: aload_0
      57: getfield      #34                 // Field loTempAlarm:Z
      60: ifeq          68
      63: ldc           #37                 // String L
      65: goto          70
      68: ldc           #39                 // String l
      <span class="code-comment-trigger">►</span><span class="reviewable-line">70: invokedynamic #41,  0 <span class="code-comment">Details on <a href="https://www.baeldung.com/java-string-concatenation-invoke-dynamic">how it works</a></span></span>            // InvokeDynamic #0:makeConcatWithConstants: (Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;
      75: areturn
        </code></pre>
    </div>
</div>

<div class="book-quote">
There are things that you might never do in a production environment that are perfectly fine in a test environment. Usually they involve issues of memory or CPU efficiency. But they never involve issues of cleanliness.
</div>

Wrong. Test performance is crucial at scale. Slow tests mean:

Slow tests can and **will** kill development speed. Ignoring tests performance in a large codebase means longer CI/CD cycles, slower iteration, stagnation, suffering and death 💀

