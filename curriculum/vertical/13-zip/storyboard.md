# Storyboard

One cycle per file, because that is what a zip does.

| Frames  | Beat                    | Hero                                                  |
| ------- | ----------------------- | ----------------------------------------------------- |
| 2-128   | mon.log is read         | the first long match, most of a line lighting at once |
| 130-178 | it collapses and drains | the file losing most of itself, then filing           |
| 188-316 | tue.log is read         | a fresh sheet with nothing behind it, ticking again   |
| 318-372 | it collapses and drains | the archive closing on 678 bytes                      |
| 372-420 | the verdict             | folder and zip side by side, 3.07x                    |

The playbook warns that three shots sharing a layout never works, and allows a
shared one where the comparison is the point. Here the second pass _is_ the
comparison. A zip compresses each member against its own window, so the second
file cannot point at the first however similar they look, and seeing it start
from nothing is what turns the rule into something you believe rather than
something you were told.

## Why a folder

The first build compressed a single file. The mechanism was right, measured and
checked, and it did not look like zipping anything: everything on screen was the
inside of the encoder and nothing was the household operation it belongs to.

So the subject is a folder, with a folder icon, and the output is `logs.zip`
with a zip icon, on the same scale under the card. That is the thing the viewer
already owns, which is the fix VR11 needed when nobody could tell what word was
being searched.

## Why there is a callout

VR12 got "the best explanation I've ever seen of Linux permissions" in the
comments. What earned that was not the lock. It was `4 + 2 + 1 = 4` sitting in
the frame at eleven points, where the viewer could check it themselves, so the
understanding was theirs rather than something they had been told.

VR13 had nothing like that. Measured at feed size, chmod's smallest
load-bearing element was a 56 pixel switch, about twenty points on a phone.
VR13's was a 19 pixel character at under seven, and the mechanism itself was a
three pixel arc at about one. The byte counts at the end had to be taken on
trust, because nothing on screen let anybody derive them.

So one match at a time is pulled out at readable size: the characters that
matched, and the pointer that replaces them.

```text
    GET  /api/users
19 characters  becomes  [back 208, copy 19]
```

Countable, and the whole idea. Only matches that sit on one line are shown, and
each is held long enough to read, which works out at four per file.

The log went from 23 point to 19 to make room, and that is the right way round.
The sheet is the "and this happens forty more times" texture. The callout is the
lesson, and before this the lesson was the smallest thing in the frame.

## Why the clock is position and not work

Copies are not spread evenly through a file. The first is 50 bytes long and
lands in the second line, and a clock counting tokens would crawl through the
top of the sheet and then fire twenty of them in the last second. Running the
head along the bytes makes the sweep even, and what varies is how much lights up
as it goes.

The sweep accelerates gently, `0.45u + 0.55u²`. The opening seconds are where a
stranger decides and they need long enough on the first two lines to see that
line two is line one again.

## Why the first lines stay neutral

Nothing precedes them, so nothing in them can be a copy. It is not a quirk of
this fixture; it is true of every file, and it happens twice here because the
second member starts as empty-handed as the first. It was not designed in. It
fell out of the mechanism and was kept.

## Why the log comes back

Draining a file into the archive with nothing left over reads as the file having
been deleted, and compressing a folder does not delete it. As each line leaves
for the archive the original line fades back in underneath it, plain and
neutral, so the last frame is the true one: the logs exactly as they were, and
an archive a third of the size under them.

## Colour

One accent. Neutral chalk is text the encoder has not reached or had to spell
out; orange is a stretch it matched. A copied stretch stays chalk until the head
reaches it, which matters more than it sounds: colouring the copies on load put
most of the file in accent from frame zero, gave the answer away before the
mechanism ran, and left almost nothing neutral for the accent to mean anything
against.

## Cue map

| Event                      | Sound    | Pitch                        |
| -------------------------- | -------- | ---------------------------- |
| a character spelled out    | `tick`   | fixed                        |
| a stretch matched          | `probe`  | by distance back, near high  |
| a stretch being copied     | `probe`  | same note, quieter, every 5f |
| a stretch collapsing       | `swap`   | falling through the file     |
| a line leaving for the zip | `return` | rising down the page         |
| a line landing in the zip  | `tick`   | rising down the page         |
| a member filed             | `land`   | low                          |
| the archive closed         | `solved` | fixed                        |
