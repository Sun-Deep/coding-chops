# Vertical 17: six ways to build a maze

Status: blocked

Built, rendered and reviewed. The creator understanding check is still open.

## What it claims

Six maze generators, one grid of 25 by 12 rooms, one seed. Every one of them
knocks down exactly 299 walls, because that is what a perfect maze on 300 rooms
is. None of them removes more walls than another. They differ only in which
walls they pick, and that decides the route out.

Depth-first's route winds through 114 of the 300 rooms. Binary tree's is 36,
the shortest the grid allows, and it is always the same 36: along the top row
and down the right side. It was that route on all 1,000 seeds in the sweep, and
it can be no other, because at every room binary tree only opens north or east.
The top row has no north, so it is one corridor, and the right column has no
east, so it is another.

## Why this topic

Three misses in a row, QR at 13K, cron at 7.1K and password hashing at 4.3K,
after five cuts between 82K and 138K. Four of those five were the six-panel
race: sorting 101K, Ctrl+F 91K, pathfinding 82K, zip 95K as a field being eaten.
All three misses were explainers of what a thing secretly means, where the
viewer has to read rather than watch.

The rules written after each miss, household, decoding key, open lock, were
each broken by the next cut, VR16 worst of all. So this cut does not rest on a
new rule. It goes back to the exact shape that ran five in a row: a famous
algorithm visualisation, six panels on one clock, a field of thousands of cells
changing from frame zero. Sorting bars and pathfinding grids are the two such
pictures everybody has seen; maze generation is the third.

It reuses VR10's maze grid, panel layout, colour ramp and pentatonic `probe`
voice, so the build risk is low and the test is clean: if this lands near VR10,
the shape is what pays.

## The checkable moment

The binary tree route at the end, at the largest size in the cut, running along
the top edge and down the right edge while the maze underneath it is swapped
for twelve new ones. Nobody has to trust the narration; the line does not move.

## What is out of scope

Dead ends. They separate the six more than routes do, from 32 for depth-first
to 104 for Prim's, and they are in `measurements.md`. They are not on screen,
because two axes in fourteen seconds is VR10's steps against cost again.

Aldous-Broder, Eller's, hunt-and-kill and growing tree. Six is the grid.

Solving. The walk is along the only route there is; no solver is shown choosing
between doors, because in a perfect maze the route is a fact of the maze.

That Wilson's produces every possible maze with equal probability is true and
is in the learning notes. It is not on screen, because it cannot be seen in one
maze.
