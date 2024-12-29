# Chapter 7: Error Handling

The chapter is written by Michael Feathers. 

I wish chapter has way more emphasis on how important error handling is. 
A significant portion of software bugs and catastrophic failures caused by improper error handling. 
As highlighted in a study by Ding Yuan et al. (2014 USENIX OSDI), most critical failures in distributed systems are triggered by errors in error handling code.

# Use Exceptions Rather Than Return Codes

This repeats advice from "Prefer Exceptions to Returning Error Codes", but provides an improved example with better logging practices: 

```java
public class DeviceController {
    public void sendShutDown() {
        DeviceHandle handle = getHandle(DEV1);
        // Check the state of the device
        if (handle != DeviceHandle.INVALID) {
            // Save the device status to the record field
            retrieveDeviceRecord(handle);
            // If not suspended, shut down
            if (record.getStatus() != DEVICE_SUSPENDED) {
                pauseDevice(handle);
                clearDeviceWorkQueue(handle);
                closeDevice(handle);
            } else {
                logger.log("Device suspended. Unable to shut down");
            }
        } else {
            logger.log("Invalid handle for: " + DEV1.toString());
        }
    }
}

public void sendShutDown() {
    try {
        tryToShutDown();
    } catch (DeviceShutDownError e) {
        logger.log(e);
    }
}
```

Why Logging Matters:

Proper logging is a cornerstone of effective error handling. It's not a minor point—it’s what distinguishes maintainable software from unmanageable systems. Always include:

* The context of the failure: What operation was attempted? What were the inputs?
* The full stack trace, not just the exception message.

The mentioned down-sides of error codes:
- they clutter the call side: 
    - the client code needs to check for errors immediately after the call
- it's easy to forget to handle error values
- logic is obscured by error handling

The "easy to forget" part is the one that actually affects correctness of the code. 

In languages like Go the first point ("need to check immediately") is considered to be a benefit - the error handling is somewhat enforced and is always expected to visible in code.

At the end, I believe the choice heavily depends on the application domain:
* For user-facing applications, exceptions often simplify error management.
* For safety-critical systems, using errors values and explicit error handling might be preferred for its visibility and enforced handling.

## Use Unchecked Exceptions

This is the industry standard now. Over the years situation with checked exceptions became only worse in Java, with introduction of lambdas checked exceptions became even more annoying source of clutter.

```java
userIds.stream().map(dao::findById).collect(Collectors.toList())
```

vs

```java
userIds.stream().map(id -> {
    try {
        return dao.findById(id);
    } catch(Exception e) {
        throw new RuntimeException(e);
    }
}).collect(Collectors.toList())
```

The former version was already verbose, but with checked exceptions it becomes truly eye-sore. (compare with scala version: `userIds.map(dao.findById)`)

However combination of "do not use errors as return values + use unchecked exceptions" essentially means that error handling is pushed out typesystem control. Errors and error handling will become not type safe and the compiler would not help you to check this aspect of your code.

Ideally we want to be able to tell functions method that can fail from those that can't:

```java
public Long sum(List<Long> list);

public BigDecimal sumSalaries(List<EmployeeId> list) throws SQLException;
```

The problem with checked exceptions that they leak implementation details:

```java
interface UserDAO {
    Optional<User> findById(String username) throws SQLException;
}
```

UserDAO is an abstraction that suppose to hide how persistence is achieved and should allow changing storage engines transparently to the code that uses it. Also DAO code can make a decision based on SQLException level, upper layers of the app most likely not have enough context.

Enterprise grade solution to this problem is to have dedicated exception types for each layer:

```java
class DAOException extends Exception

interface UserDAO {
    Optional<User> findById(String username) throws DAOException;
}
```

This introduces a lot of ceremony and boilerplate:

```java
class ServiceException extends Exception

class UserManager {
    private UserDAO userDAO;
    
    public boolean registerNewUser(String username, String password) throws ServiceException {
        try {
            if (userDAO.findById(username).isDefined()) {
                return false;
            } 
            //....
        } catch(RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException(e);
        }
    }
}
```

# Don't pass null / Don't return null

This advice that is hard to disagree with. When it comes to magic values, "null" is the king of magic.

```java
jshell> null instanceof String
$1 ==> false

jshell> (String) null
$2 ==> null

jshell> String str = null;
str ==> null
```

Despite null not being subtype of String, it can be casted to String without errors and even assigned without a cast. Magic!

null and unchecked exceptions are pretty much ignored by type system. That's what makes them easy to use and hard to handle. They can be introduced in any code without change of signatures:

```java
public Long sum(List<Long> list) {
   long sum = 0;
   for(Long i: list) {
       sum += i;
   }
   return sum; 
}
```

to

```java
public Long sum(List<Long> list) {
   if(random() < 0.5) {
       return null; // lol
   } else {
       throw new RuntimeException("OMEGA LOL");
   }
   long sum = 0;
   for(Long i: list) {
       sum += i;
   }
   return sum; 
}
```

Since they can appear anywhere, some people fallback for some sort of defensive programming:

```java
public Long sum(List<Long> list) {
    if (list == null) {
        throw new IllegalArgumentException("list can not be null");
    }
    ...
}
```

Replacing runtime NullPointerException with runtime IllegalArgumentException doesn't help with anything in majority of cases. Applying this consistently is also very tedious. So in big codebases with many people working on it you would result in only 1/3 of parameters being validated like this and the other part would do regular NPE.
