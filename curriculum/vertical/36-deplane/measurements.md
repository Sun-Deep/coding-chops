# Measurements

`node --experimental-strip-types scripts/measure-deplane.mjs`, run twice on
2026-10-14, identical output both times. It imports the reel's own
`simulation.ts`. Seeded: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
12 rows of six, one aisle, door 90 s after the seatbelt sign goes off; 75% have a bag, 5 to 15 s to get it down; 2 s to stand up, 1/2/3 s to step out from aisle/middle/window; one row a second in the aisle

seed 1. The passenger the reel follows: #32, seat 6C, a bag, 9 s; in the row whose time saved by standing is closest to the 100-flight average of 54.9 s, left aisle seat
  stand up at 0:00, into the aisle at 0:02, off at 3:28, on their feet 3:28
  sit   up at 4:05, into the aisle at 4:07, off at 4:22, on their feet 0:17
  time saved by row: 1: 16 s, 2: 28 s, 3: 36 s, 4: 38 s, 5: 46 s, 6: 54 s, 7: 64 s, 8: 73 s, 9: 88 s, 10: 98 s, 11: 107 s, 12: 114 s
  seed 1 cabin empty: stand 6:13, sit 8:06

100 flights each, stand vs sit
defaults                       off 3:51 vs 4:46 (stand sooner by 54.9 s, for 100.0% of people); on feet 3:51 vs 0:28; cabin empty 6:14 vs 7:51
sitters stand on first move    off 3:51 vs 4:04 (stand sooner by 12.9 s, for 100.0% of people); on feet 3:51 vs 2:17; cabin empty 6:14 vs 6:27
door at 30 s                   off 2:51 vs 3:46 (stand sooner by 54.9 s, for 100.0% of people); on feet 2:51 vs 0:28; cabin empty 5:14 vs 6:51
door at 60 s                   off 3:21 vs 4:16 (stand sooner by 54.9 s, for 100.0% of people); on feet 3:21 vs 0:28; cabin empty 5:44 vs 7:21
door at 150 s                  off 4:51 vs 5:46 (stand sooner by 54.9 s, for 100.0% of people); on feet 4:51 vs 0:28; cabin empty 7:14 vs 8:51
40% with bags                  off 3:40 vs 4:21 (stand sooner by 40.9 s, for 100.0% of people); on feet 3:40 vs 0:24; cabin empty 5:53 vs 7:06
100% with bags                 off 3:56 vs 5:00 (stand sooner by 63.9 s, for 100.0% of people); on feet 3:56 vs 0:29; cabin empty 6:24 vs 8:18
bags up to 30 s                off 4:50 vs 6:31 (stand sooner by 101.0 s, for 100.0% of people); on feet 4:50 vs 0:40; cabin empty 8:14 vs 11:15
24 rows                        off 6:14 vs 7:55 (stand sooner by 101.6 s, for 100.0% of people); on feet 6:14 vs 0:34; cabin empty 11:02 vs 14:15
24 rows, first move            off 6:14 vs 6:27 (stand sooner by 13.0 s, for 100.0% of people); on feet 6:14 vs 4:22; cabin empty 11:02 vs 11:15
30 rows                        off 7:26 vs 9:31 (stand sooner by 125.2 s, for 100.0% of people); on feet 7:26 vs 0:37; cabin empty 13:24 vs 17:25
30 rows, first move            off 7:26 vs 7:38 (stand sooner by 13.0 s, for 100.0% of people); on feet 7:26 vs 5:25; cabin empty 13:24 vs 13:37
```

## What the reel uses

- The followed passenger, #32 in seed 1: off the plane at 3:28 standing and
  4:22 seated. These are the "off the plane at" readouts at the payoff, and
  `runs.ts` throws on load if the model disagrees with `measurements.ts`.
- The payoff line and the cover: 55 s sooner (54.9) and 3 more minutes
  standing (3:51 on feet against 0:28, 3:23 more), the 100-flight averages.
- The animation: `scripts/blender/deplane/export.mjs` writes the model's
  timeline for every passenger, and Blender animates from it.
