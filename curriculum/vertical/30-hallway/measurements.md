# Measurements

`node --experimental-strip-types scripts/measure-hallway.mjs`, run twice on
2026-10-08, identical output both times. It imports the reel's own
`simulation.ts`. Seeded: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
reaction 0.25 s, spread 0.1 s, window 0.12 s, backoff up to 0.8 s, step 0.5 s, 50% step to their own right first

seed 1, the corridor the reel shows: the same people in both, from encounter 1, the first whose first step is a bump
  instant #1 4 dodges 4.0 s, #2 0 dodges 0.7 s, #3 0 dodges 0.8 s, #4 2 dodges 2.5 s; people past by 14 s 6
  random  #1 2 dodges 3.0 s, #2 0 dodges 0.7 s, #3 0 dodges 0.8 s, #4 2 dodges 3.1 s; people past by 14 s 6

of 20,000 pairs, 2479 dance 3+ times stepping at once (4.65 dodges on average); the same people waiting a random beat after a bump average 1.35, and 93% get past in under 3

20,000 encounters each, react at once -> random wait after a bump
defaults                       dodges per pair 0.84 -> 0.42; 3+ dodges 12.4% -> 1.9%; seconds to pass 1.48 -> 1.34
reaction spread 0.05 s         dodges per pair 5.03 -> 0.62; 3+ dodges 37.7% -> 3.3%; seconds to pass 4.69 -> 1.57
reaction spread 0.08 s         dodges per pair 1.29 -> 0.48; 3+ dodges 18.7% -> 2.4%; seconds to pass 1.82 -> 1.42
reaction spread 0.12 s         dodges per pair 0.63 -> 0.37; 3+ dodges 8.8% -> 1.8%; seconds to pass 1.33 -> 1.30
reaction spread 0.16 s         dodges per pair 0.44 -> 0.31; 3+ dodges 5.2% -> 1.5%; seconds to pass 1.21 -> 1.25
window 0.08 s                  dodges per pair 0.40 -> 0.27; 3+ dodges 4.5% -> 0.7%; seconds to pass 1.13 -> 1.15
window 0.16 s                  dodges per pair 1.63 -> 0.57; 3+ dodges 22.3% -> 4.2%; seconds to pass 2.12 -> 1.55
window 0.2 s                   dodges per pair 3.19 -> 0.74; 3+ dodges 32.6% -> 7.3%; seconds to pass 3.38 -> 1.76
backoff up to 0.4 s            dodges per pair 0.84 -> 0.53; 3+ dodges 12.4% -> 5.2%; seconds to pass 1.48 -> 1.35
backoff up to 1.2 s            dodges per pair 0.84 -> 0.38; 3+ dodges 12.4% -> 1.0%; seconds to pass 1.48 -> 1.39
80% keep right                 dodges per pair 0.56 -> 0.28; 3+ dodges 8.1% -> 1.4%; seconds to pass 1.26 -> 1.17
100% keep right                dodges per pair 0.00 -> 0.00; 3+ dodges 0.0% -> 0.0%; seconds to pass 0.81 -> 0.81
```

## What goes on screen

| Figure               | Value        | From                        |
| -------------------- | ------------ | --------------------------- |
| Bumps, each corridor | counted live | seed 1, from its first bump |
| People past          | counted live | seed 1                      |

`runs.ts` re-runs both corridors on load and throws if the first pair's
dodges or the people past by 14 s disagree with `measurements.ts`.

## Which run is shown

Seed 1, starting at encounter 1, the first whose first step is a bump. An
encounter that passes cleanly first time is identical in both corridors.
The shown pair dances 4 times against 2, milder than the 4.65 against 1.35
average of pairs who would dance.
