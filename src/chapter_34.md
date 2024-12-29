## Use Descriptive Names

<div class="book-quote">
In Listing 3-7 I changed the name of our example function from testableHtml to SetupTeardownIncluder.render. This is a far better name because it better describes what the function does
</div>

Nit-picking but `SetupTeardownIncluder.render` doesn't make much sense without reading the code. It's unclear why "Includer" should be rendering, and what does "rendering" mean for the "includer".

Using a descriptive name is a good thing, but using description as a substitute for a name - not so much.

<div class="book-quote">
Don't be afraid to make a name long.
</div>

I think you should. Between using cryptic acronyms and writing "essay as a name" there is a balance to be found.

There's scientific evidence that overly long words or word combinations increase both physical and mental effort when reading:

>"When we read, our eyes incessantly make rapid mechanical (i.e., not controlled by consciousness) movements, saccades. On average, their length is 7-9 letter spaces. At this time we do not receive new information."
> 
> "During fixation, we get information from the perceptual span. The size of this area is relatively small, in the case of alphabetic orthographies (for example, in European languages) it starts from the beginning of the fixed word, but no more than 3-4 letter spaces to the left of the fixation point, and extends to about 14-15 letter spaces to the right of this point (in total 17-19 spaces)."
>
> <center> 
>   Figure 10. The typical pattern of eye movements while reading.
>   <img src="https://optimal-codestyle.github.io/Velichkovskiy_reading.png"/>
> </center> 
>
> From: [Optimal Code Style](https://optimal-codestyle.github.io/)

This means names longer than `~15` characters become harder to process at a glance. For instance, compare these:

*  `PersistentItemRecordConfig`


*  `PersistentItemRec`

If you’re not thinking about the meaning, the second name is visually and mentally easier to skim. The first name requires more effort to read and pronounce internally.

Long names also consume real estate of the screen and make code visually overwhelmiing.

```java
PersistentItemRecordConfig persistentItemRecordConfig = new PersistentItemRecordConfig();
```
&nbsp; &nbsp; &nbsp; vs &nbsp; &nbsp; &nbsp;  

```scala
val item = new PersistentItemRec()
```

Consider Bob Nystrom’s principles of good naming as a guide:

> A name has two goals:
>
> * It needs to be clear: you need to know what the name refers to.
> * It needs to be precise: you need to know what it does not refer to.
>
> After a name has accomplished those goals, any additional characters are dead weight
> 
> 1. Omit words that are obvious given a variable’s or parameter’s type
> 2. Omit words that don’t disambiguate the name
> 3. Omit words that are known from the surrounding context
> 4. Omit words that don’t mean much of anything
>
> From [Long Names Are Long](https://journal.stuffwithstuff.com/2016/06/16/long-names-are-long/)

<br/>

-----

12/29/2024 Update:

I've recently read about ["Stroustrup's Rule"](https://buttondown.com/hillelwayne/archive/stroustrops-rule/).
In short it sounds like: **"Beginners need explicit syntax, experts want terse syntax."**

> I see this as a special case of mental model development: when a feature is new to you, you don't have an internal mental model so need all of the explicit information you can get. Once you're familiar with it, explicit syntax is visual clutter and hinders how quickly you can parse out information.
>
> (One example I like: which is more explicit, user_id or user_identifier? Which do experienced programmers prefer?)
> 
> From  ["Stroustrup's Rule" by  Hillel Wayne](https://buttondown.com/hillelwayne/archive/stroustrops-rule/)

That is a good insight. <br/> And yet I think when it comes to descriptive naming, it is more appropriate to put the information required for begginers into comments. 
This way "experts" (people who are familiar with the code) don't need to suffer from visual clutter and yet "begginers" still have a place to get everything they need. 
