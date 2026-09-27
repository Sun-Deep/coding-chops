# Storyboard

420 frames, 14.06 seconds, three beats on one continuous set of objects.

## The object

VR10's grid: six panels, two columns by three rows, each holding a 51 by 25
drawing grid for a 25 by 12 room maze. A room, a wall between two rooms and the
border each get one square, which is how a maze is drawn on squared paper and
why a wall coming down can be one square changing colour.

Undug rooms are drawn just lighter than rock, so frame zero already shows a grid
of 300 rooms waiting to be joined. Dug ground keeps the colour of when it was
opened, VR10's cold-to-accent ramp, so each panel shows the shape of its own
method for the rest of the cut rather than a progress bar.

## The beats

| Frames  | Beat   | What happens                                                       |
| ------- | ------ | ------------------------------------------------------------------ |
| 0-210   | dig    | all six knock down walls on one clock, 52 already down at frame 0  |
| 210-254 | routes | each draws its route at 2.6 rooms a frame, shortest done first     |
| 262-284 | grow   | depth-first and binary tree grow out of their panels into two maps |
| 288-336 | walk   | depth-first's 114 rooms walked                                     |
| 342-357 | walk   | binary tree's 36 rooms walked at the same pace                     |
| 363-412 | proof  | twelve new binary tree mazes under the same accent route           |

## Why the clock is walls, and why they all finish together

Every perfect maze on this grid opens 299 walls, so a clock on walls down has
no winner. That is the honest version and it is also the right picture: the
claim is not that one generator is faster but that they pick different walls.
The shapes separate in the first second and never converge.

## Why the routes draw at one pace

The first render drew all six in the same 24 frames and then held for 28 more
with nothing happening and nothing sounding, a 0.94 second silence gap. The
missing event was the length of each route. At one pace, binary tree's is done
in half a second and depth-first's still drawing a second later, so the order
they finish in previews the verdict, and the gap is gone.

## Why the maps grow out of the panels

Continuity. The viewer has just watched those two mazes being dug. Fading two
new maps in elsewhere would ask them to trust that it is the same maze. Growing
the panel's field into the map, while the dig colours drain to one neutral,
keeps it the same object.

## Why the last beat swaps the maze

"Every time" is otherwise an assertion. With the maze changing every four
frames under a route that does not move, it is something the viewer sees. The
mazes are seeds 11 to 22, each rebuilt and checked in `maze.ts`.

## Colour

One accent. In the dig it marks the newest walls, the frontier of work. In the
verdict it marks binary tree's route, the thing being looked for. Depth-first's
route is white, the neutral this format uses for everything that is merely
true, as VR10's shortest route was.

## Cue map

| Cue    | Sample   | Fires on                                                         |
| ------ | -------- | ---------------------------------------------------------------- |
| dig    | `probe`  | every 12th wall per panel, pitched by distance from the entrance |
| settle | `settle` | the last wall, all six at once, frame 210                        |
| route  | `probe`  | each route drawing, rising, one note a frame at most             |
| appear | `appear` | the two maps starting to grow, frame 262                         |
| walk   | `probe`  | every other frame of both walks, rising along the route          |
| land   | `land`   | binary tree's walker reaching the exit, frame 357                |
| proof  | `probe`  | each new maze, the same top note every time                      |

124 dig notes, 27 route notes, 33 walk notes, 12 proof notes. Pentatonic over
two octaves, panels out of phase, VR10's settings unchanged. Dig notes are
pitched by the wall knocked down rather than the room opened, because Kruskal's
often joins two rooms that are both open already.

The proof notes are one pitch on purpose. The maze changes and the route does
not, so the sound does not either.

## Review

- Peak -6.0 dBFS.
- One silence over 0.35 seconds at -45 dB: the closing 0.38.
- Longest frozen stretch 0.27 seconds.
- Frame 15 at quarter size: headline readable, six shapes distinct.
- Safe area overlay clean on all five beats; the right column ends on the rail.
- Cover survives the 1:1 and 3:4 crops.
