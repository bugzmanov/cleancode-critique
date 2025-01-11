# Chapter 7: Error Handling

The chapter is written by [Michael Feathers](https://www.amazon.com/dp/0131177052).

I wish chapter has way more emphasis on how important error handling is. 
A significant portion of software bugs and catastrophic failures caused by improper error handling. 
As highlighted in a study by [Ding Yuan et al. (2014 USENIX OSDI)](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-yuan.pdf):

> We found the majority of catastrophic failures could easily have been prevented by performing simple testing on error handling code – the last line of defense – even without an understanding of the software design
>
> from [Simple Testing Can Prevent Most Critical Failures](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-yuan.pdf)

# Use Exceptions Rather Than Return Codes

This reiterates advice from ["Prefer Exceptions to Returning Error Codes"](./chapter_37.html), but provides an improved example with better logging practices: 

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

// proposed to be rewritten to:

public class DeviceController {
//...
    public void sendShutDown() {
        try {
            tryToShutDown();
        } catch (DeviceShutDownError e) {
            logger.log(e);
        }
    }

    private void tryToShutDown() throws DeviceShutDownError {
        DeviceHandle handle = getHandle(DEV1);
        DeviceRecord record = retrieveDeviceRecord(handle);

        pauseDevice(handle);
        clearDeviceWorkQueue(handle);
        closeDevice(handle);
    }

    private DeviceHandle getHandle(DeviceID id) {
        //...
        throw new DeviceShutDownError("Invalid handle for: " + id.toString());
        //...
    }
//...
}
```

Why Logging Matters:

Proper logging is a cornerstone of effective error handling. It's not a minor point — it's what distinguishes maintainable software from unmanageable one. 

The book lists down-sides of error codes:
- they clutter the call side, the client code needs to check for errors immediately
- it's easy to forget to handle error values
- logic is obscured by error handling

All of this is true for typical java business app. But for critical systems, error handling should be built right into the main flow.

In languages like Go,  the "need to check immediately" point is considered to be a benefit - the error handling is somewhat enforced and is always expected to visible in code.

## Use Unchecked Exceptions

Unchecked exceptions had won. 
In Java, checked exceptions have only gotten worse, especially since lambdas make them even more unpleasant source of clutter.

```java
userIds.stream().map(dao::findById).collect(Collectors.toList())
```

vs

```java
userIds.stream().map(id -> {
    try {
        return dao.findById(id);
    } catch(SQLException e) {
        throw new RuntimeException(e);
    }
}).collect(Collectors.toList())
```

The former version was already verbose, but checked exceptions makes it truly eye-sore. (compare with scala version: `userIds.map(dao.findById)`)

However combination of

```"do not use errors as return values" + "use unchecked exceptions"```

means that error handling is pushed out compiler and typesystem control. 
Errors and error handling *won't be* type safe and the compiler *would not* help checking this aspect of the code.

I don't agree with blank statement to always use unchecked exception. 

Ideally we want to be able to tell if a function can fail or not:

```java
public Long sum(List<Long> list);

public BigDecimal sumSalaries(List<Long> employeeIds) throws SQLException;
```

The big problem with checked exceptions is that they leak implementation details:

```java
interface UserDAO {
    Optional<User> findById(String username) throws SQLException;
}
```

UserDAO is an abstraction that should hide persistance details. And switching storage engines should be transparent for the upper layers. 
Plus, only DAO layer can make a decision based on SQLException level, upper layers most likely don't have enough context.

Enterprise grade solution is to have layered exceptions: 

```java
class DAOException extends Exception

interface UserDAO {
    Optional<User> findById(String username) throws DAOException;
}

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

This is logically consistent approach, but requires **a lot** of boilerplate and ceremony. Depending on the application type this might be justified or not.


# Don't pass null / Don't return null

This advice that is hard to disagree with. "null" is one true magic value:

```java
jshell> null instanceof String
$1 ==> false

jshell> (String) null
$2 ==> null

jshell> String str = null;
str ==> null
```

Despite null not being subtype of String, it can be casted to String without errors and even assigned without a cast. **Magic!**

null and unchecked exceptions are almost ignored by type system. That's what makes them easy to use and hard to handle. 

You pretty much always can introduce unsafe  (and logically backward incompartible) changes, without type system making a peep about it:

<div class="code-comparison">
    <div class="code-column" >
        <pre class="ignore"><code class="language-java">public Long sum(List<Long> list) {
   long sum = 0;
   for(Long i: list) {
       sum += i;
   }
   return sum; 
}
</code></pre>
    </div>
    <div class="code-column">
        <pre class="ignore"><code class="language-java">public Long sum(List<Long> list) {
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
}</code></pre>
    </div>
</div>

