# Storyboard

Three beats on one object rather than three layouts.

The playbook asks for three shots and warns that three sharing a layout never
works. The exception it allows is exactly this one: the comparison is between
the file before and the file after, so cutting away from the file would throw
away the only thing being compared.

| Frames  | Beat             | Hero                                                  |
| ------- | ---------------- | ----------------------------------------------------- |
| 0-150   | the head reads   | the first long match, a whole line lighting at once   |
| 150-306 | the repeats fire | arcs throwing back, and the zip bar refusing to grow  |
| 306-352 | the collapse     | the file losing most of itself                        |
| 352-398 | the drain        | what is left flying into the zip, the log coming back |

## Why there are two bars

The first cut of this had none, and it was the thing wrong with it. The
mechanism was all there and nothing on screen said it was a zip: a viewer saw a
log being highlighted and then crumpling, with a byte count in the card header
falling. That count was also a small lie, because zipping a file does not shrink
it.

So the lower half of the frame is now the two files, to the same scale. The
source fills as the head reads it, the zip fills as the encoder writes it, and
the gap between them is the compression. The empty end of the zip's track is the
space that was saved, which is where the ratio is written.

## Why the log comes back

The drain used to end on an empty card, which reads as the log having been
deleted. As each line leaves for the zip the original line now fades back in
underneath it, plain and neutral, so the last frame is the true one: the log
exactly as it was, and a copy of it a sixth of the size sitting under it.

It also keeps the closing seconds moving. Taking the header odometer out had
left two flat seconds on the frozen-frame check; with the drain and the restore
the longest hold in the cut is 0.07 seconds.

## Why the clock is position and not work

Copies are not spread evenly through the file. The first is 48 bytes long and
lands in the second line, and a clock counting tokens would crawl through the
top of the sheet and then fire twenty of them in the last second. Running the
head along the bytes makes the sweep even, and what varies is how much lights up
as it goes. VR11 learned this the other way round, with six panels that would
have finished at wildly different times on a work clock.

The sweep accelerates gently, `0.45u + 0.55u²`. The opening seconds are where a
stranger decides and they need long enough on the first two lines to see that
line two is line one again. After that the file is understood and the sweep can
run.

## Why the first line stays

Nothing precedes it, so nothing in it can be a copy. It survives the collapse
intact while everything under it goes, and that is the clearest statement of the
mechanism in the whole cut: the encoder is not deleting repetition, it is
pointing at the first time something was said, and the first time has to stay.
It was not designed in. It fell out of the mechanism and was kept.

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
| a stretch being copied     | `probe`  | same note, quieter, every 6f |
| a stretch collapsing       | `swap`   | falling through the file     |
| the file at its new size   | `land`   | low                          |
| a line leaving for the zip | `return` | rising down the page         |
| a line landing in the zip  | `tick`   | rising down the page         |
| the zip closed             | `solved` | fixed                        |
