# Measurements

Run with `node scripts/measure-delivery-route.mjs` on 3 November 2026,
Node 22.14.0, on the OpenStreetMap snapshot of 2026-11-03T08:28Z. The full
record is `runs/route.json`; `src/vertical/59-manhattan-route/measurements.ts`
copies it, and the Blender export refuses to run if the two disagree.

| Quantity                        | Value                                                      |
| ------------------------------- | ---------------------------------------------------------- |
| Streets (OSM ways)              | 55,216                                                     |
| Intersections in the graph      | 63,050                                                     |
| Start                           | W 125th St and Adam Clayton Powell Jr Blvd, snapped 15.6 m |
| Goal                            | Wall St and Broadway, snapped 54.4 m                       |
| Straight line                   | 12,506 m                                                   |
| Route, both searches            | 13,231.2 m, the same intersections in the same order       |
| Dijkstra, intersections checked | 21,559 (19.9 ms)                                           |
| A\*, intersections checked      | 1,062 (3.4 ms)                                             |
| Ratio                           | 20.3                                                       |
| Nearest box edge from Harlem    | 13,832 m, longer than the route, so nothing was cut off    |

Edges are great-circle metres between OSM points. One-way tags are kept.
The A\* guess is the great-circle distance to Wall Street, which is never
longer than the road distance.

## Other rides tried before choosing this one

Run on the smaller first extract, so the Dijkstra counts on long rides are
capped by that box and are not quoted anywhere:

| Ride                        |   A\* |        Dijkstra | Ratio |
| --------------------------- | ----: | --------------: | ----: |
| Midtown to Williamsburg     | 3,058 |           9,144 |   3.0 |
| Midtown to Long Island City | 1,267 |           4,898 |   3.9 |
| Upper West Side to DUMBO    | 4,824 |          13,418 |   2.8 |
| Harlem to Wall Street       | 1,118 | 14,744 (capped) |  13.2 |

Harlem to Wall Street was chosen because the ride runs straight down the
island, which fits a portrait frame, and it shows the difference most
clearly. That choice is why the caption says this is one ride.
