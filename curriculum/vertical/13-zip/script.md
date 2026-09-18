# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Twenty-six
words across 14 seconds.

| Frames  | Line                                 |
| ------- | ------------------------------------ |
| 6-74    | A folder of logs. 2,080 bytes.       |
| 86-154  | Zip reads each file on its own.      |
| 168-250 | Every repeat becomes a pointer back. |
| 262-330 | 1,867 of them are copies.            |
| 342-412 | **2,080 bytes out as 678.**          |

One unit the whole way down. Line one sets the folder in bytes, line four counts
copies in bytes, line five reports the archive in bytes, so nothing on screen
asks the viewer to convert between two things. That is the mistake VR10 shipped
with steps against cost, and the one VR11 nearly shipped with reads against
distinct positions.

Line two is doing more work than it looks. "Each file on its own" is why the
second sheet starts from nothing, and it is the one thing about zip most people
have never been told.

## On screen

```text
eyebrow     FILE COMPRESSION
headline    Zip finds what you / already said.
card        logs/mon.log                      1,040 bytes   (then logs/tue.log)
sheet       20 lines of log, 51 characters wide, 23 point mono
bands       every matched stretch, under its characters
arcs        from a match back to the text it is a copy of, never across a file
callout     GET  /api/users
            19 characters  becomes  [back 208, copy 19]
bar one     [folder] logs        filling as the files are read     2,080 bytes
bar two     [zip] logs.zip       filling as the archive is written   678 bytes
note        3.07x smaller, written inside the empty end of bar two
provenance  zip -9 · 2,080 bytes in, 678 out
```

The folder and the zip are what make this a folder being compressed on somebody's
computer rather than an algorithm being demonstrated, and the first build of it
did not have them. Everything else was already there and nothing said what it
was for.

The callout is the second thing it did not have, and it is the more important
one. VR12 got "the best explanation I've ever seen of Linux permissions" in the
comments, and what earned that was `4 + 2 + 1 = 4` sitting in the frame where
the viewer could check it themselves. VR13 had no equivalent. Its mechanism was
a three pixel arc over eight point text, about one point on a phone, and the
byte counts at the end had to be taken on trust.

So one match at a time is pulled out at readable size: the characters that
matched, and the pointer that replaces them. It is countable, it is the whole
idea, and the numbers at the end now follow from something the viewer watched.

The log dropped from 23 point to 19 to make room. That is the right trade. The
sheet is the "and this happens forty more times" texture; the callout is the
lesson, and before this the lesson was the smallest thing in the frame.

The pointer carries no byte cost, because it does not have a fixed one. A length
and a distance are Huffman coded, so what they weigh depends on the rest of the
block. "One pointer" is exactly true and a number there would not be.

They are drawn to the same scale, so the lower bar stopping a third of the way
along is the claim and the empty end of it is the space that was saved.

The archive's length is anchored on real `zip` output at every file boundary,
with the member being written walking its own measured curve in between. It
therefore steps up about a hundred bytes when the second file begins, before any
of its content has been read. That is not smoothed out: it is the local header
and directory entry the archive pays for the file itself.

Each file keeps its own size in the card header the whole time it is up.
Compressing a folder does not shrink what is in it, it writes an archive beside
it, and an earlier version counted a header down as though the file itself had
got smaller.

## Sound

Two voices, and which one is playing is the claim.

A `tick` fires as the head spells out a character it has never seen. A `probe`
note fires when it finds a stretch it has seen before, pitched by how far back
the match was: a repeat from the line above rings high, one reaching back most
of the file sits at the bottom of the scale.

And it happens twice. When the second file comes up the ticking starts again
from nothing, because a zip compresses each member against its own window. A
listener with their eyes shut can hear the archive start a new file.

A match sounds for as long as it is being copied rather than only on its first
byte. An earlier render went silent for 0.70 seconds because the head was inside
the longest copy in the file, which is the most important moment in the cut and
was also the quietest one.

Then, per file: the collapse as `swap` hits falling in pitch, the drain as a
`return` per line leaving and a `tick` per line landing, rising where the crush
fell, and a `land` as the member is filed. `solved` when the archive closes.

Peak -4.8 dBFS. One silence gap, which is the closing hold.

## Copy

In `publishing.md`, with the runtime, the cover and the crops, so everything the
upload form asks for is in one place. Section 8 of the playbook is explicit
about that and this cut had it the wrong way round at first, with the copy here
and a pointer there.
