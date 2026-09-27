# Script

Status: blocked

No voiceover and no music. The narration is burned into the frame. Thirty words
across 14 seconds.

| Frames  | Line                                              |
| ------- | ------------------------------------------------- |
| 6-88    | Six ways to build a maze.                         |
| 100-196 | Each one knocks down 299 walls.                   |
| 206-270 | The walls it picks decide the route.              |
| 286-340 | Depth-first winds through 114 rooms.              |
| 350-414 | **Binary tree: top row, right side. Every time.** |

One unit for the whole claim, and it is rooms walked. The panels count rooms,
the maps count rooms, the narration names rooms. Dead ends are measured and left
off screen, for the reason in the README.

Line two is what makes the six a fair comparison rather than six pictures. Line
three is the claim. Lines four and five are the two ends of it, and the last one
is the thing a viewer can check with their own eyes while it is being said.

The cut never says "hardest". A short route through a maze full of dead ends can
still be slow to find, and the claim is about the route, not the difficulty.

## On screen

```text
eyebrow     MAZE GENERATION
headline    Six ways to build a maze. / One you can solve blind.
meta        SAME 25 × 12 GRID · ONE SHARED CLOCK
panels      six mazes, name and a plain-word note on each:
            walks till stuck, grows outward, joins scraps,
            wanders, up or right, runs, then up
counter     65 of 299 walls down, then 114 rooms to the exit
maps        Depth-first 114 rooms / Binary tree 36 rooms, maze 2 to 13
provenance  25 × 12 rooms · seed 10 · binary tree checked on 1,000 seeds
```

The notes under each name are VR11's lesson: the method is household, the
names are not, so each panel says what the method does in words somebody can
use in the second they have.

"Solve blind" is literal. On a binary tree maze you can reach the exit without
looking at a single wall: go right until you cannot, then down.

## Copy

In `publishing.md`, with the runtime, the cover and the crops.
