# Vertical 10: six searches, one maze

Status: published

Built, rendered and past the creator understanding check.

## What it claims

Six searches run on the same 51 by 25 maze, from the same corner to the same
exit, each given the same number of cells to expand per frame. Ground charges to
be entered: open corridor costs 1 and mud costs 9.

They all find the exit and they do not agree on the way out. Breadth-first
search returns the route with the fewest steps, 74, and that route charges 234.
Dijkstra returns a route of 98 steps that charges 114. Twenty-four steps longer
and half the price.

## Why this topic

Sorting bars and pathfinding grids are the two algorithm visualisations the
internet has made famous. VR09 did the first. This is the second, on the same
mechanic: N panels, one clock, and a finishing order nobody choreographed.

The lesson is one people already own without knowing they own it. Everybody has
had a route app send them the long way round and everybody accepts the answer,
because the shortest road and the fastest road are different questions. This is
that, with the arithmetic visible.

## Scope

It teaches that a search returns the answer to the question it was built to ask,
and that "shortest" is not one question.

It does not claim wall-clock speed, does not cover the heuristics real route
planners use at continental scale, and does not say A\* is generally a fifth
cheaper than Dijkstra. On this maze it is, and on open ground it would be far
better than that: walls are what stop a heuristic from helping.

One maze is one sample. The direction of the result is not: across 200 mazes
the three searches that price the ground always agreed on the cheapest route,
and the step-shortest route was never cheaper.

## Compositions

```text
VR10-Search-Race   1080x1920, 420 frames, 30 fps, 14 seconds
VR10-Cover         1080x1920
```
