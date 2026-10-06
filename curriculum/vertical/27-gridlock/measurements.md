# Measurements

`node --experimental-strip-types scripts/measure-gridlock.mjs`, run twice on
2026-10-05, identical output both times. It imports the reel's own
`simulation.ts`. Fixed 0.1 s steps and seeded arrivals: Apple M5 Pro, macOS
26.5.1, Node 22.14.0.

```text
settings {"perMinute":10,"seconds":300}

seed 1, the run the reel shows
  go on green: loop locked at 107.1 s, last car through a junction at 102.6 s
  go only if there is room: loop locked never, frozen never
  cars through a junction 0 to 60 s: green 47, room 45
  cars through a junction 60 to 120 s: green 33, room 65
  cars through a junction 120 to 180 s: green 0, room 63
  cars through a junction 180 to 240 s: green 0, room 62
  cars through a junction 240 to 300 s: green 0, room 66

200 seeds at the default traffic, five minutes each
default                            green locked 161 of 200, room locked 0 | cars through: green 158, room 290
ten minutes each                   green locked 174 of 200, room locked 0 | cars through: green 209, room 610

100 seeds each, five minutes
4 cars a minute per street         green locked   1 of 100, room locked 0 | cars through: green 147, room 146
6 cars a minute per street         green locked  16 of 100, room locked 0 | cars through: green 197, room 206
8 cars a minute per street         green locked  60 of 100, room locked 0 | cars through: green 185, room 255
12 cars a minute per street        green locked  86 of 100, room locked 0 | cars through: green 142, room 305
14 cars a minute per street        green locked  87 of 100, room locked 0 | cars through: green 132, room 312
25% of green drivers block         green locked   0 of 100, room locked 0 | cars through: green 286, room 289
50% of green drivers block         green locked   4 of 100, room locked 0 | cars through: green 269, room 289
75% of green drivers block         green locked  26 of 100, room locked 0 | cars through: green 228, room 289
lights all in step                 green locked   0 of 100, room locked 0 | cars through: green 338, room 327
lights 7 s apart along rows        green locked  99 of 100, room locked 0 | cars through: green 117, room 291
```

## What goes on screen

| Figure                  | Value        | From                 |
| ----------------------- | ------------ | -------------------- |
| Cars through, each grid | counted live | the run, from 75.3 s |
| The loop locking        | 107.1 s      | seed 1, go on green  |

No other number is on screen. `runs.ts` re-runs both grids on load and
throws if the left one locks at any other second or the right one locks at
all.

## Which run is shown

Seed 1, the default seed, at the default traffic of 10 cars a minute per
street. It was not picked: it is the first seed and it locks. 161 of 200
seeds lock within five minutes at this traffic, so the shown run is the
common case, not the tail.
