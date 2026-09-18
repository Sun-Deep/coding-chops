# Learning notes

What had to be understood before anything was drawn.

## DEFLATE is two mechanisms, and only one of them is the reel

LZ77 replaces a run of bytes with a pointer back to an earlier copy. Huffman
then writes whatever is left in fewer bits than a byte each. Both are running in
every `zip`, and the animated claim is the first one only.

This is the thing that could have gone wrong quietly. The file loses 858 bytes
and 939 of its bytes are copies, and those two numbers are close enough that a
frame putting them side by side would read as an accounting. They do not account
for each other. Running the same encoder with matching switched off
(`Z_HUFFMAN_ONLY`) gets to 636 bytes, and running it with matching on gets to
177, which says matching is doing most of the work without pretending the two
mechanisms split the saving additively. Huffman after LZ77 is coding a different
stream than Huffman alone, so there is no split to report.

So the reel never subtracts one from the other. The picture is the matching, and
the number in the header is the real output size.

## A match may overlap its own source

If the distance back is smaller than the length, the copy reads bytes that the
same copy is still writing. That is legal and it is how DEFLATE encodes a run of
one repeated character: point back one byte and copy two hundred.

It matters here for the check rather than for the picture. The expander has to
work one byte at a time for an overlapping match to come out right; a block copy
would read whatever was in the buffer before. The script expands its own token
stream and compares it to the input, so an expander written the wrong way fails
the round trip instead of drawing spans that do not describe the file.

## The first line is never compressed, and that is the lesson

Nothing precedes it, so nothing in it can be a copy. It is not a quirk of this
fixture; it is true of every file, and it is the clearest statement of what the
encoder does. It is not removing repetition. It is pointing at the first time
something was said, and the first time always has to stay.

The collapse leaves that line standing on its own at the top of a sheet that has
lost most of itself. Nobody designed that. It fell out of the mechanism.

## A demonstration is not a measurement, and the frame has to know which

zlib uses lazy matching: it will sometimes take a shorter match now to get a
longer one at the next byte. The parse in this repository is greedy, so it can
split a run differently from the way zlib did.

That makes the 939 covered bytes a property of this parse, not of zlib's output.
It is fine to draw, because the picture and the number come from the same parse
and therefore describe each other exactly. It would not be fine to add to a byte
count that came from somewhere else. Same discipline as VR12's arithmetic
against its disk scan, and the reason the double entry in `lz77.ts` checks the
parse rather than trusting it.

## What a log is for

The fixture was picked for what frame zero says before any mechanism runs. A
stranger looking at twenty lines of log can see that most of it is the same few
strings over and over, which is the entire claim of the cut, and they can see it
without being told. Prose would have hidden the repetition inside words.

## A mechanism is not a subject

The first build of this was finished and wrong. The head read the file, matches
lit and threw arcs back, the sheet collapsed, the numbers were real and the
checks passed. What it did not do anywhere was show a zip.

The creator's note was that it was not visually representing that it is zipping.
Everything on screen was the _inside_ of the mechanism, and nothing was the
thing the mechanism is for. A viewer who did not already know what LZ77 was saw
a log file being highlighted and then crumpling.

The second note went further: make it the household operation, a folder and a
zip on somebody's computer. That is the fix VR11 needed too. Draw the thing the
viewer already owns. VR11 drew a find bar; this draws a folder icon, a zip icon
and two bars on one scale.

Worth generalising, because it is two cuts in a row. Having built the mechanism
correctly is not evidence that the cut shows what it is about. Those are
separate questions and the second one cannot be answered by the person who built
the first.

## Changing the frame changed the facts, and that was the point

Going from one file to a folder was not a re-skin. A `.zip` compresses each
member on its own, so the moment the subject became a folder, a whole class of
picture became false: an arc from the second log back into the first would be
something no archive can do.

Getting that right turned out to be the best thing in the cut. The second file
comes up with nothing behind it and the encoder spells it out from scratch,
which is visible, audible, and the one thing about zip most people have never
been told. And it is the same idea as the headline rather than a second one: it
can only point at what it has already said, and at a new file it has not said
anything yet.

The lesson is that a framing decision is a correctness decision. "Show it as a
folder" sounds like art direction and is not.

## An archive is not only its contents

370 bytes of `logs.zip` are the two members. The other 308 are local headers, the
central directory and the folder entry, which is why the ratio is 3.07x and not
the 5.6x the payload alone would suggest.

The honest way to draw that was to leave it in. The archive bar steps up about a
hundred bytes when the second file begins, before any of its content has been
read, because that is when its header is written. Smoothing it would have made a
nicer curve and a false one, and the step is the reason a folder of small files
zips worse than one big one.

## Two things the measurement had to get right anyway

The bar could have been drawn between the two ends with a curve. It is measured
instead, a real `deflateRaw` at every sample, and each member's table is
asserted to end exactly on what the archive stores for that file. That last
check is worth more than it looks: it says zlib at level 9 and Info-ZIP at -9
are the same encoder here, which is what licenses drawing a bar out of one and
labelling it with a number from the other.

And an animation that is easy to draw is not always true. A card header counting
down from the file's size to the archive's is the obvious way to show something
getting smaller, and it says something false: compressing a folder does not
shrink what is in it. Each file keeps its size, the falling number lives on the
archive, and the logs have to still be there at the end, which is why they fade
back in as they drain.

## An assertion earned its keep

Asserting that each growth table only ever rises failed. It does not: the output
is a byte or two smaller at some samples than it was fifteen bytes earlier.
Huffman codes are chosen per block from the frequencies of the whole block, so
more input can encode everything before it a byte cheaper. The check now allows
the encoder's own slack. The premise was wrong, not the data, and without the
assertion it would have been wrong in silence.
