# Script

Status: approved

No voiceover and no music. The narration is burned into the frame. Thirty-two
words across 14 seconds.

| Frames  | Line                                 |
| ------- | ------------------------------------ |
| 6-84    | Six searches. One maze. Mud costs 9. |
| 96-168  | Greedy searches least and pays most. |
| 180-250 | The rest flood the whole maze.       |
| 262-344 | The short way goes through mud.      |
| 356-412 | **74 steps cost 234. 98 cost 114.**  |

Greedy runs out of work at frame 76 and the other five finish between 233 and
276, so the lines sit over what the panels are doing. Those frames are computed
from the pacing curve rather than typed in.

Line four arrives before the first walk and is what makes the verdict an
explanation rather than two lines and two numbers.

## On screen

```text
eyebrow    PATHFINDING
headline   Six searches. One maze.
meta       SAME MAZE · MUD COSTS 9 · ONE SHARED CLOCK
meta       THE SHORTEST WAY OUT IS NOT THE CHEAPEST   (from frame 330)
panels     Depth-first   dives          Dijkstra      prices every step
           Breadth-first counts steps   A*            prices, and aims
           Greedy        aims only      Bidirectional both ends at once
verdict    Fewest steps  74 steps   20 in mud   cost 234
           Cheapest      98 steps    2 in mud   cost 114
```

## Sound

Every panel fires a click as its frontier reaches cells, pitched by how far that
cell is from the start, so a flood spreading out is a rising sweep. The cue map
and the reasoning are in `storyboard.md`.

Every number comes from `measurements.ts` and the committed measurement run.
