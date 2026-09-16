# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Thirty words
across 14 seconds.

| Frames  | Line                                    |
| ------- | --------------------------------------- |
| 6-84    | Ctrl+F. Six ways to do it.              |
| 96-166  | Three read every character.             |
| 178-248 | Three skip most of the page.            |
| 260-330 | Boyer-Moore skips what it can rule out. |
| 342-412 | **It never looked at 2,029 of 2,400.**  |

Lines two and three name the split the grid is drawing, because at panel size
the two columns are the argument before any number is legible.

## On screen

```text
eyebrow    TEXT SEARCH
headline   Ctrl+F. Six ways.
find bar   [magnifier]  the machine              3 results
headings   READ EVERY CHARACTER      SKIP AHEAD
meta       IT RULES GROUND OUT WITHOUT READING IT      (from frame 308)
panels     Naive       checks every spot    Horspool     jumps on a bad letter
           KMP         never re-reads       Boyer-Moore  jumps on two rules
           Rabin-Karp  hashes every spot    Sunday       peeks one past the end
verdict    A straight scan looks at              2,390
           Boyer-Moore looks at                    371
```

The find bar and the headings are the answer to a plain question the first cut
could not answer: what word is it looking for, and what are these six things.
Neither the phrase nor the split was anywhere in the frame. The phrase is not in
the narration either, because a find bar is where somebody looks for it.

## Sound

Every panel fires a note as it looks at characters, pitched by the column the
sweep is in, so each line of the page is a run up the scale. Density carries the
claim: the left column is a stream and the right column is a scatter. The cue
map is in `storyboard.md`.

Every number comes from `measurements.ts` and the committed measurement run.
