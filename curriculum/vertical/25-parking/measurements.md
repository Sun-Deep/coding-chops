# Measurements

`node --experimental-strip-types scripts/measure-parking.mjs`, run twice on
2026-10-04, identical output both times. It imports the reel's own
`parking.ts`. One-second ticks and a seeded generator, so the machine cannot
move a figure: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
settings {"drive":3,"walk":1.4,"park":6,"near":6,"dwell":1800,"gap":15,"fullNear":0.97,"fullFar":0.45}

seed 179 row     to the door 56 s, parked at 26 s, drove 60 m, stall row 7
seed 179 circle  to the door 271 s, parked at 251 s, drove 740 m, stall row 1

400 seeds each
default                        row median 55 s, 90th 86 s | circle median 57 s, 90th 276 s | circling slower in 310 of 400
                               row mean 64 s, circle mean unbounded (some never parked)
circle accepts 10 rows         row median 55 s, 90th 86 s | circle median 60 s, 90th 62 s | circling slower in 264 of 400
circle accepts 3 rows          row median 55 s, 90th 86 s | circle median 209 s, 90th did not park | circling slower in 368 of 400
cars stay 15 min               row median 55 s, 90th 85 s | circle median 57 s, 90th 167 s | circling slower in 304 of 400
cars stay 60 min               row median 56 s, 90th 87 s | circle median 57 s, 90th did not park | circling slower in 311 of 400
quiet: a car every 40 s        row median 54 s, 90th 76 s | circle median 57 s, 90th 74 s | circling slower in 349 of 400
busy: a car every 8 s          row median 79 s, 90th 96 s | circle median 57 s, 90th did not park | circling slower in 288 of 400
emptier near the door          row median 54 s, 90th 80 s | circle median 57 s, 90th 57 s | circling slower in 259 of 400
fuller far from the door       row median 59 s, 90th 93 s | circle median 57 s, 90th 417 s | circling slower in 329 of 400
```

How the trip shown was picked, `RANK=1`:

```text
row median 55 s, circle 90th percentile 276 s
seed 179  row 56  circle 271
seed 176  row 59  circle 263
seed 123  row 58  circle 261
seed 98  row 59  circle 261
seed 321  row 82  circle 285
seed 97  row 93  circle 276
seed 68  row 56  circle 314
seed 330  row 93  circle 279
seed 345  row 82  circle 258
seed 147  row 86  circle 261
```

## What goes on screen

| Figure                | Value      | From             |
| --------------------- | ---------- | ---------------- |
| Picked a row, to door | 0:56       | seed 179, 56 s   |
| Circled, to door      | 4:31       | seed 179, 271 s  |
| Circling lost         | 310 of 400 | default settings |

`runs.ts` re-runs both trips on load and throws if the times, metres driven
or stall rows disagree with `measurements.ts`.
