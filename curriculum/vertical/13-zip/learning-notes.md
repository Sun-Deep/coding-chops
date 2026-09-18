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
