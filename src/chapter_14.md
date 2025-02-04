# Chapter 14: Successive Refinement 

This chapter is an example of how he arrives to "clean code" solution for a specific task.

When I first read the book in 2009 I've loved it. 
It felt like the best programming book I'd ever seen.
But even then, this chapter left me with an uneasy feeling about his solution. I spent a lot of time re-reading it, thinking I was too junior to understand why it was good. 
15 years later I still don't like his solution, but now I can explain why.

The task: create a command-line argument parser with this interface:

<div class="book-quote">
<pre><code class="language-java">public static void main(String[] args) {
    try {
        Args arg = new Args("l,p#,d*", args);
        boolean logging = arg.getBoolean('l');
        int port = arg.getInt('p');
        String directory = arg.getString('d');
        executeApplication(logging, port, directory);
    } catch (ArgsException e) {
        System.out.printf("Argument error: %s\n", e.errorMessage());
    }
}
</code></pre>
</div>

This is the solution that Martin is proud of and insists that it needs to be carefully studied:

<div class="book-quote">
<pre><code class="language-java">package com.objectmentor.utilities.args;
&nbsp;
import static com.objectmentor.utilities.args.ArgsException.ErrorCode.*;
import java.util.*;
&nbsp;
public class Args {
    private Map&lt;Character, ArgumentMarshaler&gt; marshalers;
    private Set&lt;Character&gt; argsFound;
    private ListIterator&lt;String&gt; currentArgument;
&nbsp;
    public Args(String schema, String[] args) throws ArgsException {
        marshalers = new HashMap&lt;Character, ArgumentMarshaler&gt;();
        argsFound = new HashSet&lt;Character&gt;();
&nbsp;
        parseSchema(schema);
        parseArgumentStrings(Arrays.asList(args));
    }
&nbsp;
    private void parseSchema(String schema) throws ArgsException {
        for (String element : schema.split(“,”))
            if (element.length() > 0)
                parseSchemaElement(element.trim());
    }
&nbsp;
    private void parseSchemaElement(String element) throws ArgsException {
        char elementId = element.charAt(0);
        String elementTail = element.substring(1);
        validateSchemaElementId(elementId);
        if (elementTail.length() == 0)
            marshalers.put(elementId, new BooleanArgumentMarshaler());
        else if (elementTail.equals(“*”))
            marshalers.put(elementId, new StringArgumentMarshaler());
        else if (elementTail.equals(“#”))
            marshalers.put(elementId, new IntegerArgumentMarshaler());
        else if (elementTail.equals(“##”))
            marshalers.put(elementId, new DoubleArgumentMarshaler());
        else if (elementTail.equals(“[*]”))
            marshalers.put(elementId, new StringArrayArgumentMarshaler());
        else
            throw new ArgsException(INVALID_ARGUMENT_FORMAT, elementId, elementTail);
    }
&nbsp;
    private void validateSchemaElementId(char elementId) throws ArgsException {
        if (!Character.isLetter(elementId))
            throw new ArgsException(INVALID_ARGUMENT_NAME, elementId, null);
    }
&nbsp;
    private void parseArgumentStrings(List&lt;String&gt; argsList) throws ArgsException 
    {
        for (currentArgument = argsList.listIterator(); currentArgument.hasNext();) 
        {
            String argString = currentArgument.next();
            if (argString.startsWith(“-”)) {
                parseArgumentCharacters(argString.substring(1));
            } else {
                currentArgument.previous();
                break;
            }
        }
    }
&nbsp;
    private void parseArgumentCharacters(String argChars) throws ArgsException {
        for (int i = 0; i < argChars.length(); i++)
            parseArgumentCharacter(argChars.charAt(i));
    }
&nbsp;
    private void parseArgumentCharacter(char argChar) throws ArgsException {
        ArgumentMarshaler m = marshalers.get(argChar);
        if (m == null) {
            throw new ArgsException(UNEXPECTED_ARGUMENT, argChar, null);
        } else {
            argsFound.add(argChar);
            try {
                m.set(currentArgument);
            } catch (ArgsException e) {
                e.setErrorArgumentId(argChar);
                throw e;
            }
        }
    }
&nbsp;
    public boolean has(char arg) {
        return argsFound.contains(arg);
    }
&nbsp;
    public int nextArgument() {
        return currentArgument.nextIndex();
    }
&nbsp;
    public boolean getBoolean(char arg) {
        return BooleanArgumentMarshaler.getValue(marshalers.get(arg));
    }
&nbsp;
    public String getString(char arg) {
        return StringArgumentMarshaler.getValue(marshalers.get(arg));
    }
&nbsp;
    public int getInt(char arg) {
        return IntegerArgumentMarshaler.getValue(marshalers.get(arg));
    }
&nbsp;
    public double getDouble(char arg) {
        return DoubleArgumentMarshaler.getValue(marshalers.get(arg));
    }
&nbsp;
    public String[] getStringArray(char arg) {
        return StringArrayArgumentMarshaler.getValue(marshalers.get(arg));
    }
}
&nbsp;
//....
&nbsp;
public class StringArgumentMarshaler implements ArgumentMarshaler {
  private String stringValue = null;
&nbsp;
  public void set(Iterator<String> currentArgument) throws ArgsException {
    try {
      stringValue = currentArgument.next();
    } catch (NoSuchElementException e) {
      throw new ArgsException(MISSING_STRING);
    }
  }
&nbsp;
  public static String getValue(ArgumentMarshaler am) {
    if (am != null && am instanceof StringArgumentMarshaler)
      return ((StringArgumentMarshaler) am).stringValue;
    else
      return ””;
  }
}
</code></pre>
</div>

## The Problems

### 1. Weird Interface Design


Look at StringArgumentMarshaler:

<div class="book-quote">
<pre><code class="language-java">public class StringArgumentMarshaler implements ArgumentMarshaler {
  private String stringValue = null;
&nbsp;
  public void set(Iterator&lt;String&gt; currentArgument) throws ArgsException {
    try {
      stringValue = currentArgument.next();
    } catch (NoSuchElementException e) {
      throw new ArgsException(MISSING_STRING);
    }
  }
&nbsp;
  public static String getValue(ArgumentMarshaler am) {
    if (am != null && am instanceof StringArgumentMarshaler)
      return ((StringArgumentMarshaler) am).stringValue;
    else
      return "";
  }
}</code></pre>
</div>


`set` is an instance method but `getValue` is static. Why not take a simpler approach?

```java
public interface ArgumentMarshaler<T> {
    void set(Iterator<String> currentArgument) throws ArgsException;
    Optional<T> get();
}
```

### 2. Mixed Up Responsibilities 

The StringArgumentMarshaler (and all other marshalers) tries to do two things:
- Parse token streams
- Store and provide parsed values 

From an interface design perspective, this would make more sense:

```java
public interface ArgumentParser<T> {
    T parse(Iterator<String> currentArgument) throws ArgsException;
}
```

### 3. Messy Error Handling

The `set` method does some validation, but `get` just falls back to type-specific default values if something's wrong. 
Silent failures with default values can lead to subtle bugs.

Check out how the IntegerArgumentMarshaler assumes 0 is a safe default:

<div class="book-quote">
<pre><code class="language-java">public static int getValue(ArgumentMarshaler am) {
    if (am != null && am instanceof IntegerArgumentMarshaler)
        return ((IntegerArgumentMarshaler) am).intValue;
    else
        return 0;
}
</code></pre>
</div>

Here's how this can bite you:

```java
Args arg = new Args("l,p#,p*", args); // p is marked as string here
int port = arg.getInt('p');           // but trying to read as int
```

The library quietly gives you 0 as the port value, which is extra bad since [port 0 means something special in Unix](https://www.lifewire.com/port-0-in-tcp-and-udp-818145).

The argument parsing library is expected to be generic - i.e. it's expected to be used in wide range of domains.<br/>
In this context, it is not safe to assume default values based on type information alone. 

### 4. State Management Gone Wrong

The Args class mixes up final results and intermediate processing state in the same scope, while keeping the state it doesn't need:

<div class="book-quote">
<pre><code class="language-java">public class Args {
    private Map&lt;Character, ArgumentMarshaler&gt; marshalers;  // This has the final results
    private Set&lt;Character&gt; argsFound;                      // Don't need this, can get from marshalers
    private ListIterator&lt;String&gt; currentArgument;          // Only needed during parsing
</code></pre>
</div>

### 5. Overcomplicated Errors

Let's talk about that ArgsException class. 

<div class="book-quote">
<pre><code class="language-java">public class ArgsException extends Exception {
  private char errorArgumentId = ’\0’;
  private String errorParameter = null;
  private ErrorCode errorCode = OK;
&nbsp;
  public ArgsException() {}
&nbsp;
  public ArgsException(String message) {super(message);}
&nbsp;
  public ArgsException(ErrorCode errorCode) {
    this.errorCode = errorCode;
  }
&nbsp;
  public ArgsException(ErrorCode errorCode, String errorParameter) {
    this.errorCode = errorCode;
    this.errorParameter = errorParameter;
  }
&nbsp;
  public ArgsException(ErrorCode errorCode, 
                       char errorArgumentId, String errorParameter) {
    this.errorCode = errorCode;
    this.errorParameter = errorParameter;
    this.errorArgumentId = errorArgumentId;
  }
&nbsp;
  public char getErrorArgumentId() {
    return errorArgumentId;
  }
&nbsp;
  public void setErrorArgumentId(char errorArgumentId) {
    this.errorArgumentId = errorArgumentId;
  }
&nbsp;
  public String getErrorParameter() {
    return errorParameter;
  }
&nbsp;
  public void setErrorParameter(String errorParameter) {
    this.errorParameter = errorParameter;
  }
&nbsp;
  public ErrorCode getErrorCode() {
    return errorCode;
  }
&nbsp;
  public void setErrorCode(ErrorCode errorCode) {
    this.errorCode = errorCode;
  }
&nbsp;
  public String errorMessage() {
    switch (errorCode) {
      case OK:
        return “TILT: Should not get here.”;
      case UNEXPECTED_ARGUMENT:
        return String.format(“Argument -%c unexpected.”, errorArgumentId);
      case MISSING_STRING:
        return String.format(“Could not find string parameter for -%c.”, 
                              errorArgumentId);
      case INVALID_INTEGER:
        return String.format(“Argument -%c expects an integer but was ’%s’.”, 
                              errorArgumentId, errorParameter);
      case MISSING_INTEGER:
        return String.format(“Could not find integer parameter for -%c.”,
                              errorArgumentId);
      case INVALID_DOUBLE:
        return String.format(“Argument -%c expects a double but was ’%s’.”, 
                              errorArgumentId, errorParameter);
      case MISSING_DOUBLE:
        return String.format(“Could not find double parameter for -%c.”, 
                              errorArgumentId);
      case INVALID_ARGUMENT_NAME:
        return String.format(“’%c” is not a valid argument name.”, 
                              errorArgumentId);
      case INVALID_ARGUMENT_FORMAT:
        return String.format(“’%s” is not a valid argument format.”, 
                              errorParameter);
    }
    return ””;
  }
&nbsp;
  public enum ErrorCode {
    OK, INVALID_ARGUMENT_FORMAT, UNEXPECTED_ARGUMENT, INVALID_ARGUMENT_NAME,
    MISSING_STRING,
    MISSING_INTEGER, INVALID_INTEGER,
    MISSING_DOUBLE, INVALID_DOUBLE}
}
</code></pre>
</div>


It got issues:

- Reintroduces error codes inside exceptions (contradicting the book's own advice). <br/>
  This book mentions 2 times that it's preferrable to use exceptions instead of error codes. And yet in the example he is introducing error codes inside exceptions. 
  Why? 
  Imagine if there was a tool that would allow to document such design decisions in code.. That would be so convinient. Unfortunately this tool doesn't exist. /s
- Has weirdly specific error types (why MISSING_DOUBLE and MISSING_INTEGER are separate?)
- Has an ErrorCode.OK which makes no sense (what does this mean `throw new ArgsException(ErrorCode.OK)`?)
- The exception is mutable. It lets you change error details after creating the exception (why?)

## The TDD Problem

The chapter shows TDD in action, revealing two problems:

1. Focus on small steps can miss big-picture issues
2. Starting point heavily influences final quality

Martin began with deeply problematic code:
- Lots of tiny methods 
- Huge area of mutable state 
- Everything crammed into one class

<div class="book-quote">
<pre><code class="language-java">public class Args {
  private String schema;
  private String[] args;
  private boolean valid = true;
  private Set&lt;Character&gt; unexpectedArguments = new TreeSet&lt;Character&gt;();
  private Map&lt;Character, Boolean&gt; booleanArgs = new HashMap&lt;Character, Boolean&gt;();
  private Map&lt;Character, String&gt; stringArgs = new HashMap&lt;Character, String&gt;();
  private Map&lt;Character, Integer&gt; intArgs = new HashMap&ltCharacter, Integer&gt;();
  private Set&lt;Character&gt; argsFound = new HashSet&lt;Character&gt;();
  private int currentArgument;
  private char errorArgumentId = ’\0’;
  private String errorParameter = “TILT”;
  private ErrorCode errorCode = ErrorCode.OK;
&nbsp;
  private enum ErrorCode {
    OK, MISSING_STRING, MISSING_INTEGER, INVALID_INTEGER, UNEXPECTED_ARGUMENT}
&nbsp;
  public Args(String schema, String[] args) throws ParseException {
    this.schema = schema;
    this.args = args;
    valid = parse();
  }
&nbsp;
  private boolean parse() throws ParseException {
    if (schema.length() == 0 && args.length == 0)
      return true;
    parseSchema();
    try {
      parseArguments();
    } catch (ArgsException e) {
    }
    return valid;
  }
&nbsp;
  private boolean parseSchema() throws ParseException {
    for (String element : schema.split(“,”)) {
      if (element.length() > 0) {
        String trimmedElement = element.trim();
        parseSchemaElement(trimmedElement);
      }
    }
    return true;
  }
&nbsp;
  private void parseSchemaElement(String element) throws ParseException {
    char elementId = element.charAt(0);
    String elementTail = element.substring(1);
    validateSchemaElementId(elementId);
    if (isBooleanSchemaElement(elementTail))
      parseBooleanSchemaElement(elementId);
    else if (isStringSchemaElement(elementTail))
      parseStringSchemaElement(elementId);
    else if (isIntegerSchemaElement(elementTail)) {
      parseIntegerSchemaElement(elementId);
    } else {
      throw new ParseException(
        String.format(“Argument: %c has invalid format: %s.”, 
                     elementId, elementTail), 0);
    }
  }
&nbsp;
  private void validateSchemaElementId(char elementId) throws ParseException {
    if (!Character.isLetter(elementId)) {
      throw new ParseException(
        “Bad character:” + elementId + “in Args format: ” + schema, 0);
    }
  }
&nbsp;
  private void parseBooleanSchemaElement(char elementId) {
    booleanArgs.put(elementId, false);
  }
&nbsp;
  private void parseIntegerSchemaElement(char elementId) {
    intArgs.put(elementId, 0);
  }
&nbsp;
  private void parseStringSchemaElement(char elementId) {
    stringArgs.put(elementId, ””);
  }
&nbsp;
  private boolean isStringSchemaElement(String elementTail) {
    return elementTail.equals(”*”);
  }
&nbsp;
  private boolean isBooleanSchemaElement(String elementTail) {
    return elementTail.length() == 0;
  }
&nbsp;
  private boolean isIntegerSchemaElement(String elementTail) {
    return elementTail.equals(”#”);
  }
&nbsp;
  private boolean parseArguments() throws ArgsException {
    for (currentArgument = 0; currentArgument < args.length; currentArgument++) {
      String arg = args[currentArgument];
      parseArgument(arg);
    }
    return true;
  }
&nbsp;
  private void parseArgument(String arg) throws ArgsException {
    if (arg.startsWith(”-”))
      parseElements(arg);
  }
&nbsp;
  private void parseElements(String arg) throws ArgsException {
    for (int i = 1; i < arg.length(); i++)
      parseElement(arg.charAt(i));
  }
&nbsp;
  private void parseElement(char argChar) throws ArgsException {
    if (setArgument(argChar))
      argsFound.add(argChar);
    else {
      unexpectedArguments.add(argChar);
      errorCode = ErrorCode.UNEXPECTED_ARGUMENT;
      valid = false;
    }
  }
&nbsp;
  private boolean setArgument(char argChar) throws ArgsException {
    if (isBooleanArg(argChar))
      setBooleanArg(argChar, true);
    else if (isStringArg(argChar))
      setStringArg(argChar);
    else if (isIntArg(argChar))
      setIntArg(argChar);
    else
      return false;
&nbsp;
    return true;
  }
&nbsp;
  private boolean isIntArg(char argChar) {return intArgs.containsKey(argChar);}
&nbsp;
  private void setIntArg(char argChar) throws ArgsException {
    currentArgument++;
    String parameter = null;
    try {
      parameter = args[currentArgument];
      intArgs.put(argChar, new Integer(parameter));
    } catch (ArrayIndexOutOfBoundsException e) {
      valid = false;
      errorArgumentId = argChar;
      errorCode = ErrorCode.MISSING_INTEGER;
&nbsp;
      throw new ArgsException();
    } catch (NumberFormatException e) {
      valid = false;
      errorArgumentId = argChar;
      errorParameter = parameter;
      errorCode = ErrorCode.INVALID_INTEGER;
      throw new ArgsException();
    }
  }
&nbsp;
  private void setStringArg(char argChar) throws ArgsException {
    currentArgument++;
    try {
      stringArgs.put(argChar, args[currentArgument]);
    } catch (ArrayIndexOutOfBoundsException e) {
      valid = false;
      errorArgumentId = argChar;
      errorCode = ErrorCode.MISSING_STRING;
      throw new ArgsException();
    }
  }
&nbsp;
  private boolean isStringArg(char argChar) {
    return stringArgs.containsKey(argChar);
  }
&nbsp;
  private void setBooleanArg(char argChar, boolean value) {
    booleanArgs.put(argChar, value);
  }
&nbsp;
  private boolean isBooleanArg(char argChar) {
    return booleanArgs.containsKey(argChar);
  }
&nbsp;
  public int cardinality() {
    return argsFound.size();
  }
&nbsp;
  public String usage() {
    if (schema.length() > 0)
      return “-[” + schema + “]”;
    else
      return ””;
  }
&nbsp;
  public String errorMessage() throws Exception {
    switch (errorCode) {
      case OK:
        throw new Exception(“TILT: Should not get here.”);
      case UNEXPECTED_ARGUMENT:
        return unexpectedArgumentMessage();
      case MISSING_STRING:
        return String.format(“Could not find string parameter for -%c.”,
                            errorArgumentId);
&nbsp;
      case INVALID_INTEGER:
        return String.format(“Argument -%c expects an integer but was ’%s’.”, 
                            errorArgumentId, errorParameter);
      case MISSING_INTEGER:
        return String.format(“Could not find integer parameter for -%c.”, 
                            errorArgumentId);
    }
    return ””;
  }
&nbsp;
  private String unexpectedArgumentMessage() {
    StringBuffer message = new StringBuffer(“Argument(s) -”);
    for (char c : unexpectedArguments) {
      message.append(c);
    }
    message.append(“ unexpected.”);
&nbsp;
    return message.toString();
  }
&nbsp;
  private boolean falseIfNull(Boolean b) {
    return b != null && b;
  }
&nbsp;
  private int zeroIfNull(Integer i) {
    return i == null ? 0 : i;
  }
&nbsp;
  private String blankIfNull(String s) {
    return s == null ? ”” : s;
  }
&nbsp;
  public String getString(char arg) {
    return blankIfNull(stringArgs.get(arg));
  }
&nbsp;
  public int getInt(char arg) {
    return zeroIfNull(intArgs.get(arg));
  }
&nbsp;
  public boolean getBoolean(char arg) {
    return falseIfNull(booleanArgs.get(arg));
  }
&nbsp;
  public boolean has(char arg) {
    return argsFound.contains(arg);
  }
&nbsp;
  public boolean isValid() {
    return valid;
  }
&nbsp;
  private class ArgsException extends Exception {
  }
}
</code></pre>
</div>
 
:shrug emoji: No wonder it would require him a lot of steps to end up on something more reasonable.

If you ask claude sonnet 3.5:

```
Create a mini library to parse command line arguments. It should support following API:

Args arg = new Args(“l,p#,d*”, args);
boolean logging = arg.getBoolean(’l’);
int port = arg.getInt(’p’);
String directory = arg.getString(’d’);
```

It would come up with pretty reasonable draft:

```java
public class Args {
    private Map<Character, String> schema = new HashMap<>();
    private Map<Character, String> parsedArguments = new HashMap<>();

    public Args(String schema, String[] args) throws IllegalArgumentException {
        parseSchema(schema);
        parseArgs(args);
    }

    private void parseSchema(String schema) throws IllegalArgumentException {
        String[] schemaParts = schema.split(",");
        for (String part : schemaParts) {
            if (part.length() < 1) {
                throw new IllegalArgumentException("Invalid schema format");
            }
            char flag = part.charAt(0);
            String type = part.length() > 1 ? part.substring(1) : "";
            
            if (!type.matches("^[#*]?$")) {
                throw new IllegalArgumentException("Invalid type specifier for flag: " + flag);
            }
            
            schema.put(flag, type);
        }
    }

    private void parseArgs(String[] args) throws IllegalArgumentException {
        for (int i = 0; i < args.length; i++) {
            String arg = args[i];
            if (!arg.startsWith("-") || arg.length() != 2) {
                throw new IllegalArgumentException("Invalid argument format: " + arg);
            }

            char flag = arg.charAt(1);
            if (!schema.containsKey(flag)) {
                throw new IllegalArgumentException("Unknown flag: " + flag);
            }

            String type = schema.get(flag);
            if (type.isEmpty()) {  // boolean flag
                parsedArguments.put(flag, "true");
            } else {  // string or integer flag
                if (i + 1 >= args.length) {
                    throw new IllegalArgumentException("No value provided for flag: " + flag);
                }
                parsedArguments.put(flag, args[++i]);
            }
        }
    }

    public boolean getBoolean(char flag) throws IllegalArgumentException {
        validateFlag(flag, "");
        return parsedArguments.containsKey(flag);
    }

    public int getInt(char flag) throws IllegalArgumentException {
        validateFlag(flag, "#");
        try {
            return Integer.parseInt(parsedArguments.getOrDefault(flag, "0"));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid integer value for flag: " + flag);
        }
    }

    public String getString(char flag) throws IllegalArgumentException {
        validateFlag(flag, "*");
        return parsedArguments.getOrDefault(flag, "");
    }

    private void validateFlag(char flag, String expectedType) throws IllegalArgumentException {
        if (!schema.containsKey(flag)) {
            throw new IllegalArgumentException("Unknown flag: " + flag);
        }
        if (!schema.get(flag).equals(expectedType)) {
            throw new IllegalArgumentException("Invalid type for flag: " + flag);
        }
    }
}
```

Not perfect, but a much better starting point for discussions about:
- How to make it easier to add new types
- How to improve the schema format
- How to make errors more specific

The chapter unintentionally demonstrates how TDD alone doesn't guarantee good design - you need solid architectural vision too.

