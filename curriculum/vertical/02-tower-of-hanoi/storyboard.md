# Storyboard

## Shape

One continuous teaching shot carries the whole cut. Cutting between fifteen
moves would make the code and the disks feel like separate examples. The fixed
split frame makes every code decision visible against its result.

The hero object is the active plate. Orange means current execution. It appears
on the moving plate, the active source line and the trace sentence, all as one
signal.

## Geometry

```text
y 190 to 270    persistent channel mark
y 286           move count
y 330 to 760    2.5D tower visualization
y 810           code label
y 854 to 1184   six source lines
y 1214 to 1278  call depth and line meaning
y 1300 to 1460  narration only
```

The lower code column is 780 pixels wide and ends at `x = 930`, so it clears
the action rail below `y = 1000`.

## Move timing

Each move gets 41 frames. The plate travels for the first 31. The remaining 10
show line 5, line 3 or the base case returning before the next move. The first
travel begins five frames before frame zero, so the opening frame is active.

|  Frames | Move            |
| ------: | --------------- |
|    0-40 | disk 1, A to B  |
|   41-81 | disk 2, A to C  |
|  82-122 | disk 1, B to C  |
| 123-163 | disk 3, A to B  |
| 164-204 | disk 1, C to A  |
| 205-245 | disk 2, C to B  |
| 246-286 | disk 1, A to B  |
| 287-327 | disk 4, A to C  |
| 328-368 | disk 1, B to C  |
| 369-409 | disk 2, B to A  |
| 410-450 | disk 1, C to A  |
| 451-491 | disk 3, B to C  |
| 492-532 | disk 1, A to B  |
| 533-573 | disk 2, A to C  |
| 574-614 | disk 1, B to C  |
| 615-689 | result and cost |
| 690-749 | lockup handover |

## Sound

No music. Each move has four audible events tied to the fixed 41-frame cycle.

| Move frame | Sound         | Screen event                              |
| ---------: | ------------- | ----------------------------------------- |
|          0 | `plate-lift`  | The active plate breaks from the stack    |
|          9 | `plate-swish` | The plate starts crossing between pegs    |
|         27 | `plate-land`  | Rubber and metal meet the destination peg |
| 31, 35, 38 | `code-step`   | The active line advances after the move   |

Playback rate falls with plate size, so disk 4 sounds heavier than disk 1. The
completed tower gets `solved`, the recurrence gets `settle`, and the final
lockup gets `name`.

## Colour

The teaching frames use one accent, `#FF7A33`. It means the instruction being
executed now. Pegs, inactive disks, code and furniture stay neutral.
