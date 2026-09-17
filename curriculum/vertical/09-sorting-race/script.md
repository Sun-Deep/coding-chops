# Script

Status: published

No voiceover and no music. The narration is burned into the frame. Twenty-five
words across 14 seconds.

| Frames  | Line                             |
| ------- | -------------------------------- |
| 6-92    | Six sorts. One array. One clock. |
| 104-170 | Quicksort is finished already.   |
| 182-262 | Merge and heap drop out next.    |
| 276-330 | Bubble is still swapping pairs.  |
| 342-412 | **2,417 ops against 387.**       |

Every line after the first opens on a panel dropping out of the race. The
finishes are at frames 114, 178, 189, 232, 248 and 320, and they are computed
from the traces rather than typed in, so a change to the pacing curve moves the
lines and the sound with the picture.

## On screen

```text
eyebrow    SORTING ALGORITHMS
headline   Six sorts. One clock.
meta       SAME ARRAY · n = 48 · ONE SHARED CLOCK
meta       BUBBLE 2,417 · QUICK 387 · 6.2× THE WORK     (from frame 328)
panels     Bubble O(n²)      Selection O(n²)
           Insertion O(n²)   Merge O(n log n)
           Heap O(n log n)   Quick O(n log n)
```

## Sound

No voiceover and no music. Every panel fires a click as bars land in their
slots, pitched by the value, and the six panels are audibly doing different
amounts of work: selection sort clicks nine times while bubble sort hammers.
The cue map and the reasoning are in `storyboard.md`.

Every number comes from `measurements.ts` and the committed measurement run.
