# Measurements

`node --experimental-strip-types scripts/measure-escalator.mjs`, run twice on
2026-10-04, identical output both times. It imports the reel's own
`escalator.ts`. Fixed 0.1 s steps and a seeded generator: Apple M5 Pro, macOS
26.5.1, Node 22.14.0.

```text
escalator 46 m along the incline (23 m rise), belt 0.75 m/s. Standers board with 0.6164 m free ahead, walkers with 1.4 m. Measured 70 to 150 s.

calibration targets, TfL at Holborn: about 115/min with a walking lane, 141 to 151 standing on both sides
  stand gap 0.6 m: both sides standing 150.0/min
  stand gap 0.6164 m: both sides standing 145.5/min
  stand gap 0.63 m: both sides standing 142.5/min
  walk gap 1.3 m: walking lane plus standing lane 117.0/min
  walk gap 1.4 m: walking lane plus standing lane 114.8/min
  walk gap 1.5 m: walking lane plus standing lane 111.0/min

seed 1, the run the reel shows
  stand right, walk left: walking lane 42.0/min, standing lane 72.8/min, total 114.8/min
  stand on both sides: total 145.5/min
  standing on both sides carries 27% more
  people at the top by 30 s: walk left 0, stand both 0
  people at the top by 60 s: walk left 15, stand both 0
  people at the top by 90 s: walk left 70, stand both 70
  people at the top by 120 s: walk left 128, stand both 144
  people at the top by 150 s: walk left 185, stand both 216

50 seeds: standing on both sides carried more in 50; gain 27% to 28%, median 28%

if walkers keep a different gap than calibrated, seed 1:
  walk gap 1 m: walk left 131/min, stand both 146/min, gain 11%
  walk gap 1.2 m: walk left 121/min, stand both 146/min, gain 20%
  walk gap 1.4 m: walk left 115/min, stand both 146/min, gain 27%
  walk gap 1.6 m: walk left 109/min, stand both 146/min, gain 34%
  walk gap 1.8 m: walk left 105/min, stand both 146/min, gain 39%
```

## What goes on screen

| Figure                    | Value        | From                      |
| ------------------------- | ------------ | ------------------------- |
| People up, each escalator | counted live | the run, from 72 s        |
| About 30% more            | TfL, cited   | Holborn trial, sources.md |

The counters come from the committed run (114.8 and 145.5 a minute, 27%
more). The payoff's 30% is the trial's, cited. `runs.ts` re-runs both
escalators on load and throws if the rates disagree with `measurements.ts`.
