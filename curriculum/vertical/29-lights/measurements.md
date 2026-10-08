# Measurements

`node --experimental-strip-types scripts/measure-lights.mjs`, run twice on
2026-10-07, identical output both times. It imports the reel's own
`simulation.ts`. The bad bulb is the only random thing, seeded: Apple M5
Pro, macOS 26.5.1, Node 22.14.0.

```text
100 bulbs 0.1 m apart; 1.5 s per check plus 0.4 s per metre the hand moves; 5 s to swap the bulb

seed 1, the string the reel shows: bulb 70 is bad
  linear  70 checks, found at 1:48, lit at 1:53
  binary   7 checks, found at 0:14, lit at 0:19
         tested at 50+, 75-, 63+, 69+, 72-, 71-, 70- (+ power, - none)

every position of the bad bulb, 1 to 100
  one by one:     50.5 checks on average, 99 at most, 1:18 on average
  split in half:  6.7 checks on average, 7 at most, 0:14 on average
  splitting is faster for 91 of 100 positions; one by one wins only when the bad bulb is one of the first 9

longer and shorter strings, every position
   25 bulbs: one by one 13.0 checks (0:20), split 4.7 (0:08), splitting faster for 20 of 25
   50 bulbs: one by one 25.5 checks (0:39), split 5.7 (0:11), splitting faster for 44 of 50
  200 bulbs: one by one 100.5 checks (2:35), split 7.7 (0:20), splitting faster for 188 of 200
  500 bulbs: one by one 250.5 checks (6:26), split 9.0 (0:33), splitting faster for 479 of 500

a slower or faster hand, 100 bulbs
  0.2 s a metre: one by one 1:17, split 0:12, splitting faster for 92 of 100
  0.8 s a metre: one by one 1:20, split 0:18, splitting faster for 89 of 100
  1.6 s a metre: one by one 1:24, split 0:26, splitting faster for 85 of 100
```

## What goes on screen

| Figure              | Value        | From                   |
| ------------------- | ------------ | ---------------------- |
| Checks, each tree   | counted live | seed 1, bulb 70 is bad |
| 7 checks, 70 checks | final counts | seed 1                 |
| Found in 7 checks   | cover        | seed 1                 |

`runs.ts` re-runs both searches on load and throws if the bad bulb, the
checks or the second each tree lights disagree with `measurements.ts`.

## Which string is shown

Seed 1, the default, not picked. Bulb 70 is above the average position of
50; binary search takes 7 checks wherever it is (6.7 on average).
