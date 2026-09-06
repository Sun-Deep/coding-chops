# Storyboard

Not approved copy. `script.md` carries the copy. This is the shot plan, the
timing and the reasoning behind each frame.

Geometry and reserves come from `docs/vertical-format-standard.md`. The frames
below hold the shared vertical anchors: label at 300, the thing being taught
from 380 to about 950, the number it produces at 985, the line that number
earns at about 1200, the receipt at 1420.

## Shot map

| Shot            | Frames     | Seconds | Hero                               |
| --------------- | ---------- | ------- | ---------------------------------- |
| Sequential scan | 0 to 288   | 9.6     | The sweep crossing the whole table |
| Descent         | 288 to 576 | 9.6     | The candidate count collapsing     |
| Verdict         | 576 to 684 | 3.6     | 3,400x                             |
| End card        | 684 to 810 | 4.2     | The cost, then the mark            |

Twenty-seven seconds.

## No hook

There was a hook shot in front of the scan: eyebrow, the claim in two lines, the
query. It ran 2.8 seconds and it was cut.

It said what the cover says, so anybody arriving through the cover read the same
sentence twice. Worse, nothing in it moved. The one moment a scroll is actually
decided was spending its whole budget on a static card restating the thumbnail.

The cut now opens on the scan already running. Frame zero has a full table, a
label saying what is being done to it, and a counter about to climb. The claim
the hook was making is the payoff at the end of that same shot instead, where it
has been earned rather than promised.

The query moved into the scan with it. It is the whole statement now rather than
just the predicate, held for as long as the sweep runs, because that shot is now
the only place the viewer is told what is being asked.

## Sequential scan

The table is a thousand tiles, one per ten thousand rows, forty across and
twenty-five down. A thousand rather than a symbolic handful, because the whole
point is that the sweep has to cross all of them and that takes visibly too
long. Six tiles standing in for ten million rows would make a sequential scan
look like a reasonable thing to do.

The sweep runs in reading order. Tiles behind it are read, tiles at the edge are
being read, and the edge stops existing once the sweep does, or the last rows
stay brighter than the rest and the finished field reads as unevenly scanned.

`WHERE user_id = 8675309` stays on screen for as long as the sweep runs. Six
seconds is long enough to forget the predicate and the punch has to land against
something.

The matching tile is at index 867 of 1000. Not a composition choice: `user_id`
is the row number and 8,675,309 out of ten million is 86.75 percent of the way
through the table, which is why the scan feels long before anything is found.

Pages and milliseconds are held back until the sweep finishes. Both describe the
whole scan, and a total beside a counter still climbing invites the viewer to
read them as the same measurement.

## Descent

Hard cut. The table leaves on `dissolve`.

Each page read is a bar cut into that page's real fanout, with one entry lit,
and the next bar is that entry opened to full width. The descent is a repeated
zoom, which is what a b-tree lookup literally is, so the picture and the
mechanism are the same thing.

Below about four pixels a segment stops being a segment and the bar reads as a
solid rule, which is why the internal and leaf bars are a texture with one lit
entry rather than 285 and 367 countable cells. The count is on the label
instead. Drawing 367 two-pixel boxes would claim a precision the frame cannot
deliver.

The counter steps rather than sweeps: 10,000,000, then 103,093, then 362, then

1. A page read is a discrete event and interpolating between the steps would
   say the opposite.

The heap fetch is the only thing in the shot that is a row rather than a page,
so it is the only thing drawn as one.

## Verdict

Three columns, two rows, and the header at 72 percent so it reads as a header.
Then the ratio at 172 pixels, which is the largest type in the cut and the only
thing on screen for a beat.

Rows read and pages are both there because time is the machine-dependent one.
Pages and rows are structural, and they are the numbers that survive somebody
running this on different hardware.

## End card

The cost first, then the line it earns, then the mark.

This is the one shot allowed the brand accent. Everything above it is a teaching
frame, where the only colour on screen is the one carrying the lookup.

The corner watermark hands over to the full lockup as it arrives, so two lockups
are never on screen together.

## Narration

Burned in, no voiceover. Section 7 of `docs/vertical-format-standard.md` has the
argument. The short version is that most people watch a reel muted, and this cut
also ships with no music so a platform track can go over it, which would bury a
spoken explanation anyway.

The track runs on a baseline at `y 1460` and everything else moved up to clear
it. The receipts now sit under the number they describe instead of at the foot
of the frame, which is where they should have been.

Each shot's last line is its payoff, set at 54 rather than 36, with the accent on
the half that carries it. Those four lines were cards in the middle of the frame
before. One voice in one place beats a subtitle and a card competing for the same
corner.

Fifty-five words over twenty-seven seconds is two a second. Three is the ceiling
for a subtitle that is the only thing on screen, and here the picture is asking
for attention too.

Both two line entries break by hand. Left to wrap they orphan their last word,
and a subtitle whose second row is one word reads as a mistake for the beat it
takes to understand.

## Sound

No music. The effects are the whole track, and the silence between them is part
of it. Section 11 of `docs/vertical-format-standard.md` has the argument; the
short version is that a bed fights the audio a platform lays on at upload, and
that is where a reel's reach comes from.

| Frame | Cue        | Event                                   |
| ----: | ---------- | --------------------------------------- |
|     0 | `appear`   | The table, already filling              |
|     8 | `scan`     | The sweep, for the 7.5 seconds it takes |
|   232 | `land`     | The one matching row                    |
|   250 | `tick`     | The count of everything that was not it |
|   280 | `dissolve` | The whole table leaves                  |
|   314 | `process`  | Root page read                          |
|   363 | `process`  | Internal page read                      |
|   412 | `process`  | Leaf page read                          |
|   461 | `land`     | The row                                 |
|   514 | `tick`     | Three page reads, said out loud         |
|   576 | `send`     | Into the comparison                     |
|   598 | `fill`     | The seq scan line                       |
|   610 | `fill`     | The index scan line                     |
|   622 | `name`     | The ratio                               |
|   684 | `dissolve` | The comparison leaves                   |
|   696 | `settle`   | What it costs                           |
|   716 | `land`     | The line that costs it                  |
|   728 | `name`     | The mark                                |

Eighteen cues in twenty-seven seconds, about one every one and a half seconds.
That
is denser than an episode because an episode has a voice and a bed holding the
space and this has neither. It is still one cue per event: something arrives,
something leaves, or something is decided.

The counter climbing through ten million rows has no cue of its own. `scan` is
already saying that, for exactly as long as it is true, and it is the only
sustained sound in the channel's set for that reason.

`name` is used twice, on the ratio and on the mark. It is the heaviest sound
there is and a third use would spend it.

Gains run between 5 and 13, well above one, because the set was levelled to sit
under narration and there is nothing to sit under here. Measured on the finished
file rather than reasoned from the source levels:

```text
appear, land, name        -5.0 to -6.0 dBFS
tick, settle, send        -10.6 to -13.8
process                   -14.5
dissolve, fill            -17.2 to -18.6
scan                      -20.4
between cues              silence
```

## Colour

One accent, `#FF7A33`, the brand orange on a dark ground. It means the row being
looked for, or the path to it: the matching tile, the lit entry in each page,
the heap row, the index scan line, the ratio. Nothing else on screen is
coloured.

This is the vertical exception to the accent rule, recorded in section 6 of
`docs/vertical-format-standard.md`. Horizontal episodes keep cobalt. The reel
runs on the brand colour because it arrives mid-scroll with no title attached
and recognition has to happen before reading does, and because cobalt is what
every other technical feed is already using.

The discarded 9,999,999 is deliberately not red. Two meanings competing for
attention in the same frame is how a teaching palette turns into a status
palette, and the size of the number already carries it.

The corner mark wears the brand colours and means nothing by them. It sits in
the header band above the content area, 30 pixels tall, in the same corner of
every frame, so it is not competing with a full width bar or a number at 172.
It ran in chalk for one pass and read as a failed render rather than as a quiet
watermark.
