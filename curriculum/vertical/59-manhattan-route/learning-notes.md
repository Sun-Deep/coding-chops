# Learning notes

## Dijkstra

Dijkstra keeps a queue of intersections ordered by their distance from the
start. It always takes the nearest one next and settles it: that distance
can no longer shrink, because every other way in is already longer. So it
reaches the goal only after it has settled every intersection nearer than
the goal. From Harlem, the goal is 13.2 km away by road, so everything
within 13.2 km by road is settled first, in every direction, including the
Bronx, Queens and New Jersey. That is the blue flood.

## A\*

A\* orders the same queue by distance so far plus a guess of the distance
left. Here the guess is the straight-line distance to Wall Street. Streets
heading away from Wall Street gain distance and gain guess, so they sort
late and most are never taken. Streets heading toward it trade one for the
other and stay near the front. That is the orange thread.

The guess never overestimates, because no road between two points is
shorter than the straight line between them. With such a guess, the first
time A\* takes the goal off the queue its distance is the shortest, so both
searches find the same route. On this ride they return the same
intersections in the same order.

## What the ratio depends on

The saving is largest when the route runs close to the straight line, as
Harlem to Wall Street does down the avenues. When the route has to leave
the line, for example to reach a bridge, the guess is too optimistic for
longer and A\* checks more: Midtown to Williamsburg saved 3x, not 20x.

Time saves less than count: 19.9 ms against 3.4 ms, 5.9x, because A\*
computes a distance for every intersection it queues.

## What the counters count

An intersection is counted when it is settled, taken off the queue for
good. Intersections are OSM nodes shared by two streets or ending one;
points that only bend a street are not counted. One-way streets are kept.
