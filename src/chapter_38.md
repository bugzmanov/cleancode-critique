## How Do You Write Functions Like This?

<div class="book-quote">
"When I write functions, they come out long and complicated. They have lots of indenting and nested loops. They have long argument lists. 
The names are arbitrary, and there is duplicated code."

"So then I massage and refine that code, splitting out functions, changing names, eliminating duplication. I shrink the methods and reorder them. Sometimes I break out whole classes, all the while keeping the tests passing.
In the end, I wind up with functions that follow the rules I've laid down in this chapter. I don't write them that way to start. I don't think anyone could."
</div>

What's Martin is advocating is bottom to top approach to software development: first make it work, then make it beautiful( = "clean", in Matrins worldview).

Martin advocates for a bottom-to-top approach to software development:

1) First, to make it work
2) Then, refine it to make it "beautiful" (or "clean" as Martin describes it).


But this is not the only way to design software! In my experience my best designs often come from doing top-to-bottom thinking: 
1) Start by imagining how you want the code to look and behave.
2) Sketch out non-compilable pseudocode that satisfies your constraints and communicates the desired design.
3) Gradually implement the details, adjusting the code to make it functional and recognizable by the compiler.

[todo: example of top to bottom]

[todo: jigsaw puzzles vs lego bricks]

