## Prefer Exceptions to Returning Error Codes

To illustrate the guide-line he starts with an example: 

<div class="book-quote">
<pre><code class="language-java">
if (deletePage(page) == E_OK) {
    if (registry.deleteReference(page.name) == E_OK) {
        if (configKeys.deleteKey(page.name.makeKey()) == E_OK){
            logger.log("page deleted");
        } else {
            logger.log("configKey not deleted");
        }
    } else {
        logger.log("deleteReference from registry failed");
    }
} else {
    logger.log("delete failed");
    return E_ERROR;
}
</code></pre>
</div>

Lets do a quick de-tour...

<div class="big-emphasis">
    <p className="text-4xl font-bold text-teal-400 animate-pulse">
        THESE 👏 ARE 👏 TERRIBLE 👏 LOG 👏 MESSAGES!
    </p>
</div>

They lack any context to the degree of being useless. Imagine debugging production issue at 3am and the only thing you see in log is this:

```
2024-01-01T02:45:00 - delete failed
```

Well, thank you dear sir cleancoder. Now I have everything I need!

Never write logging like this. Even as a joke. Good log messages should always provide context, including:
* What operation was being performed
* The input parameters
* The outcome or reason for failure

Error handling must be cosistent! The provided code would return E_ERROR to the client code only in case 1 of 3 deletes fails: errors to `deleteReference` and `deleteKey` are essentialy ignored.

Martin provides improved version:

<div class="book-quote">
<pre><code class="language-java">
try {
    deletePage(page);
    registry.deleteReference(page.name);
    configKeys.deleteKey(page.name.makeKey());
} catch (Exception e) {
    logger.log(e.getMessage());
}
</code></pre>
</div>

<div class="big-emphasis">
    <p className="text-4xl font-bold text-teal-400 animate-pulse">
        ALWAYS 👏 LOG 👏 STACK-TRACES!
    </p>
</div>

The bear minimum is:
```java
logger.log(e.getMessage(), e);
```

or better yet:
```java
logger.log("Got an error while deleting page: " + page, e);
```
This log has description of the operation, it has details of the context, it has stack-traces <span style="font-size:2rem"> = 😍 </span>

Notice the big change in refactored version: now ALL errors are essentially ignored and not communicated to the client code.

```java
public void delete(Page page) {
    try {
        deletePage(page);
        registry.deleteReference(page.name);
        configKeys.deleteKey(page.name.makeKey());
    } catch (Exception e) {
        logger.error("Got an error while deleting page: " + page, e);
    }
}
```

The delete operation will always successfully return. Almost always this is a design mistake.

Best Practices for Exception Handling:
* **Let Exceptions Propagate When Appropriate**: If the code catching the exception doesn’t know how to handle it, it should let it propagate to a higher layer
* **Log-and-Throw When Necessary**: If local context (e.g., the page object) is important for debugging and isn’t available in upper layers, it’s reasonable to log the error before re-throwing:


```java
public void delete(Page page) thows Exception {
    try {
        deletePage(page);
        registry.deleteReference(page.name);
        configKeys.deleteKey(page.name.makeKey());
    } catch (Exception e) {
        logger.error("Got an error while deleting page: " + page, e);
        throw e;
    }
}
```

[todo: talk about types and exceptions]

[todo: talk about errors as values]

### Extract Try/Catch Blocks
 
Martin proposes splitting the delete method into smaller pieces:

<div class="code-comparison">
    <div class="code-column" style="flex:0">
        <div class="code-column-title">Original Code: </div>
        <pre class="ignore"><code class="language-java">public void delete(Page page) {
  try {
    deletePage(page);
    registry.deleteReference(page.name);
    configKeys.deleteKey(page.name.makeKey());
  } catch (Exception e) {
    logger.log(e.getMessage());
  }
}</code></pre>
    </div>
    <div class="code-column">
        <div class="code-column-title">Proposed rewrite:</div>
        <pre class="ignore"><code class="language-java">public void delete(Page page) {
  try {
    deletePageAndAllReferences(page);
  } catch (Exception e) {
    logError(e);
  }
}
&nbsp;
private void deletePageAndAllReferences(Page page) throws Exception {
  deletePage(page);
  registry.deleteReference(page.name);
  configKeys.deleteKey(page.name.makeKey());
}
&nbsp;
private void logError(Exception e) {
  logger.log(e.getMessage());
}</code></pre>
    </div>
</div>

He proposed to rewrite 1 method with 8 lines of code into 3 methods with 16 lines of code (including whitespacing).
This is just a code bloat. 

Looking at original `delete`: you could immidiately grasp that it was executing 3 deletions, that it is silencing the errors and that the logging was done incorrectly. 

All this information is gone now from new `delete` method:

```java
public void delete(Page page) {
  try {
    deletePageAndAllReferences(page);
  } catch (Exception e) {
    logError(e);
  }
}
```

Ok, maybe error silencing is stil noteceable. 

`deletePageAndAllReferences` clearly is not doing 1 thing only, is it?<br/>
I think the name is not descriptive enough, it should be `deletePageAndAllReferencesAndPageKey`. ***/s***

Clumsy names is one of the smells indicating that something is wrong with the model or with an abstraction.<br/>
I think in this case, the code screams: **"Don't butcher me, uncle Bob. I should exist and prosper as a single piece.
Don't create useless methods just satisfy arbitary rule that doesn't have any value"**

> "If it's hard to find a simple name for a variable or method that creates a clear image of the underlying object, that's a hint that the underlying object may not have a clean design."
>
> from [Philosophy Of Software Design](https://www.amazon.com/Philosophy-Software-Design-John-Ousterhout/dp/1732102201)

In addition:

```java
private void logError(Exception e) {
    logger.log(e.getMessage());
}
```

Is an example that bad abstractions can do more harm than good. It fails to capture meaningful context or stack traces.
The more this helper being used in the app, the harder it will be to manage this application.

---

### Error Handling Approaches (TODO: POLISH!)

Ok. Now lets talk about exception vs error codes.

Code needs a channel to communicate errors and that channel needs to be different from channel of communicating normal results. 
Martin have avoided this discussion by using methods that have nothing to communicate in successfull scenario.

Java’s exception handling is powerful and widely supported, offering features like:

* Stack traces for debugging
* Causality chaining for error contexts
* Compile-time enforcement of error handling (checked exceptions)

---

Modern languages like Rust and Scala favor representing errors as values. 
This approach avoids the implicit flow control of exceptions by making errors explicit in function signatures.

For example, in Rust:

```rust
fn delete_page(page: &Page) -> Result<(), Error> {
    // Perform deletion logic
}
```

### Conclusion

Using exceptions instead of error codes is generally a good practice, but it’s not a silver bullet. Effective error handling requires thoughtful design:

- Use exceptions to propagate errors, but don’t swallow them silently.
- Log meaningful context along with stack traces.
- Avoid refactors that bloat the code or obscure key operations.
- Consider whether exceptions or an error-as-value approach best fits your use case.

Error handling isn’t just about avoiding failure—it’s about making failure clear, actionable, and easy to debug.
