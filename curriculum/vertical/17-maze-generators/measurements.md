# Measurements

```bash
node scripts/measure-maze-generators.mjs
RANK=1 node scripts/measure-maze-generators.mjs
```

## The machine

```text
Apple M5 Pro, macOS 26.5.1, node v22.14.0
```

Nothing here is timed, so the machine cannot move a figure. It is recorded so
the run can be repeated, not because the hardware matters.

## The fixture

A grid of 25 by 12 rooms, 300 in all, with 563 walls between neighbouring
rooms. Every generator builds a perfect maze on it, one route between any two
rooms, which on this grid is a spanning tree: exactly 299 walls opened and 264
left standing. The script throws if any maze it builds opens a different number,
joins rooms that do not touch, opens a wall twice or leaves a room unreachable.

The entrance is the top left room and the exit the bottom right one, which is
where a maze on paper puts them. The shortest route the grid allows is 36 rooms:
24 across, 11 down, and the room you start in.

Each generator draws from its own copy of the same pinned random stream, so one
of them using more numbers does not change another's maze.

## Choosing the seed

Not by eye. `RANK=1` scores every seed from 1 to 1,000 by how far its six mazes
sit from the sweep medians, on both dead ends and route length, and lists the
closest. Seed 10 is the top of that list.

```text
seed   10  distance 0.425  routes 114 38 58 58 36 42
seed  367  distance 0.539  routes 152 38 54 52 36 42
seed  722  distance 0.571  routes 112 38 52 48 36 36
```

Its depth-first route is 114 rooms against a median of 128, so the figure on
screen is a little below the ordinary case rather than above it.

## The run

```text
generator      passages  dead ends       junctions  route  choices  up  left  work
Depth-first         299    32 (10.7%)          30    114       13  23    16   599
Prim's              299   104 (34.7%)          89     38       19   1     0   299
Kruskal's           299    91 (30.3%)          79     58       31   8     3   496
Wilson's            299    89 (29.7%)          79     58       27   9     2  3073
Binary tree         299    75 (25.0%)          73     36       19   0     0   300
Sidewinder          299    81 (27.0%)          73     42       21   0     3   300
```

`route` is rooms walked, both ends included. `choices` is rooms on the route
where a solver has a door it should not take. `up` and `left` are moves on the
route away from the exit. `work` is steps the generator took, which is recorded
and not used: Wilson's 3,073 is its random walks, most of which it erases.

## The sweep

```text
sweep over 1000 seeds, 1 to 1000
generator      dead ends mean  median  min  max    route mean  median  min  max
Depth-first              32.1      32   22   43         126.9     128   48  218
Prim's                  104.2     104   86  117          39.4      38   36   50
Kruskal's                90.8      91   79  108          55.2      54   36   88
Wilson's                 87.0      87   70  102          56.9      56   38  108
Binary tree              75.9      76   61   90          36.0      36   36   36
Sidewinder               83.1      83   69   98          40.0      40   36   64

binary tree route checked on all 1000 seeds: top row, then right column, 36 rooms
```

The binary tree line is not a median. Its route was the same 36 rooms, along the
top row and down the right column, on all 1,000 seeds, and the script checks the
route room by room rather than only its length. That is a property of the
method, not of the seeds: the top row can only open east and the right column
can only open north, so both are unbroken corridors on every maze it makes.

## Repeats

Two runs of the same command were byte identical. That is a weaker check than
VR01's runs an hour apart and a stronger design: the fixture is a seed and a
pinned generator, nothing is timed and nothing is read from disk, so there is
nothing that could drift between sessions.

`src/vertical/17-maze-generators/maze.ts` is a port of the generators, and it
checks every maze against `measurements.ts` when the module loads. It also
rebuilds the twelve extra binary tree mazes the last beat shows, seeds 11 to 22,
and checks each route, so a maze that broke the claim would stop the render.
