# Script

Status: approved

Both gates are passed. The understanding check is complete, and the finished
render was watched from beginning to end.

No voiceover and no music. The narration is burned into the frame and the sound
effects are the whole audio track. Frames are in
`src/vertical/04-quicksort/narration.tsx`; the cue map is in `storyboard.md`.

## Narration

Eleven lines, 26.8 seconds. Payoff lines are marked.

Every line opens at least four frames after its shot starts and closes at least
six before it ends, checked against `beats.ts`. No line states a figure that is
not on screen in the same frame, and every figure comes out of
`measurements.ts`.

| Frames  | Line                                                   |
| ------- | ------------------------------------------------------ |
| 6-36    | The same 200 numbers, compared at the same rate.       |
| 44-88   | **One of them is already finished.**                   |
| 110-190 | Quicksort keeps going. Fresh numbers, every time.      |
| 210-320 | **Twelve sorts, in one pass of the other.**            |
| 336-390 | Every comparison splits the problem in half.           |
| 398-437 | **1,554 comparisons. Then it is done.**                |
| 451-501 | Now give selection sort a list that is already sorted. |
| 509-547 | **19,900 comparisons. Nothing moved.**                 |
| 561-613 | But count writes instead of comparisons.               |
| 621-657 | **384 against 1,228.**                                 |
| 713-737 | Slow on time. Cheap on memory.                         |

## On-screen copy

The counters are the copy for most of the cut. They are read out of the traces
rather than typed, so they cannot drift from the run.

```text
SELECTION SORTED ×0        QUICKSORT SORTED ×12
COMPARISONS · ONE RUN
COMPARISONS                SWAPS
SELECTION WRITES           QUICKSORT WRITES
```

Verdict:

```text
              selection   quicksort
comparisons      19,900       1,554
writes              384       1,228

12.8x  fewer comparisons
3.2x   more writes
```

End card:

```text
Selection sort is not
slow by accident.

IT TRADES TIME FOR WRITES
```
