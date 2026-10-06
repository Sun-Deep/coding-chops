# Measurements

`node --experimental-strip-types scripts/measure-microwave.mjs`, run twice on
2026-10-06, identical output both times. It imports the reel's own
`simulation.ts`. Whole seconds and a seeded generator: Apple M5 Pro, macOS
26.5.1, Node 22.14.0.

```text
menu 0:20 x1, 0:30 x3, 0:45 x2, 1:00 x3, 1:30 x2, 2:00 x3, 3:00 x2, 5:00 x2; 10 s to swap dishes

seed 1, the line the reel shows, in the order they arrived
  heating times 3:00, 2:00, 0:20, 2:00, 2:00, 0:20, 2:00, 0:45
  fifo order 3:00, 2:00, 0:20, 2:00, 2:00, 0:20, 2:00, 0:45
       waits 0:00, 3:10, 5:20, 5:50, 8:00, 10:10, 10:40, 12:50; average 7:00; longest job waited 0:00; last done at 13:45
  sjf  order 0:20, 0:20, 0:45, 2:00, 2:00, 2:00, 2:00, 3:00
       waits 0:00, 0:30, 1:00, 1:55, 4:05, 6:15, 8:25, 10:35; average 4:06; longest job waited 10:35; last done at 13:45
  shortest first cuts the average wait by 42%

1,000 lines already waiting, five to twelve people
   5 people: shortest first lower average in 973 of 1000, median cut 33% (10% to 58%, 10th to 90th); the longest job waited longer in 838
   8 people: shortest first lower average in 1000 of 1000, median cut 36% (18% to 52%, 10th to 90th); the longest job waited longer in 903
  12 people: shortest first lower average in 1000 of 1000, median cut 37% (22% to 50%, 10th to 90th); the longest job waited longer in 963

1,000 runs of 20 people arriving over time
  someone every 30 s on average: shortest first lower average in 1000 of 1000, median cut 41%; median longest single wait 26:22 first come, 26:18 shortest first
  someone every 60 s on average: shortest first lower average in 1000 of 1000, median cut 42%; median longest single wait 17:55 first come, 21:21 shortest first
  someone every 90 s on average: shortest first lower average in 996 of 1000, median cut 37%; median longest single wait 11:39 first come, 15:02 shortest first
```

## What goes on screen

| Figure                    | Value          | From               |
| ------------------------- | -------------- | ------------------ |
| Heating times on the tags | 0:20 to 3:00   | seed 1, the line   |
| Each person's wait        | on their tag   | seed 1             |
| Average wait, live        | climbs to 7:00 | seed 1, first come |
|                           | climbs to 4:06 | seed 1, shortest   |
| 42% less waiting          | cover only     | 1 - 4:06 / 7:00    |

`runs.ts` re-runs both lines on load and throws if the averages, the 3:00
lunch's wait or the finishing second disagree with `measurements.ts`.

## Which line is shown

Seed 1, the default, not picked. Shortest first lowers the average in every
one of 1,000 lines of eight; the shown 42% sits above the median 36%, inside
the 10th to 90th percentile range of 18% to 52%.
