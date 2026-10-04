# Measurements

`node --experimental-strip-types scripts/measure-plane-boarding.mjs`, run twice
on 2026-10-03, identical output both times. It imports the reel's own
`boarding.ts`. One-second ticks and a seeded generator, so the machine cannot
move a figure: Apple M5 Pro, macOS 26.5.1, Node 22.14.0.

```text
12 rows of 6, one aisle, one door. Walk 1 row/s. 75% carry a bag, 4 to 12 s to stow; the rest 1 s. 5 s per seated passenger in the way. Back to front in 3 zones.

seed 1, the cabin the reel shows
  backToFront  6:37 (397 s)   passenger-seconds stuck behind someone 1207
  random       5:16 (316 s)   passenger-seconds stuck behind someone 706
  windowFirst  4:17 (257 s)   passenger-seconds stuck behind someone 318

12 rows, as shown, 1000 seeds
  backToFront  median 6:25  fastest 4:59  slowest 8:22
  random       median 5:41  fastest 4:30  slowest 7:04
  windowFirst  median 4:24  fastest 3:32  slowest 5:23
  random beat back to front in 916; window first beat random in 999; window first fastest of the three in 999

30 rows, 200 seeds
  backToFront  median 12:31  fastest 10:36  slowest 14:24
  random       median 11:04  fastest 9:46  slowest 12:25
  windowFirst  median 8:56  fastest 8:07  slowest 9:57
  random beat back to front in 195; window first beat random in 200; window first fastest of the three in 200

12 rows, passengers take two rows of aisle, 200 seeds
  backToFront  median 7:34  fastest 6:29  slowest 9:12
  random       median 6:56  fastest 5:45  slowest 8:22
  windowFirst  median 5:43  fastest 5:01  slowest 6:43
  random beat back to front in 182; window first beat random in 200; window first fastest of the three in 200

12 rows, back to front in five zones, 200 seeds
  backToFront  median 6:51  fastest 5:08  slowest 8:15
  random       median 5:42  fastest 4:30  slowest 7:00
  windowFirst  median 4:26  fastest 3:46  slowest 5:23
  random beat back to front in 197; window first beat random in 200; window first fastest of the three in 200
```

## What goes on screen

| Figure        | Value | From          |
| ------------- | ----- | ------------- |
| Back to front | 6:37  | seed 1, 397 s |
| Random        | 5:16  | seed 1, 316 s |
| Window first  | 4:17  | seed 1, 257 s |

Seed 1 is the first one generated. Its back-to-front and window-first times
sit near the 1,000-seed medians (6:25 and 4:24); its random time is quicker
than the median of 5:41. `runs.ts` re-runs all three on load and throws if
they disagree with `measurements.ts`.
