# Measurements

`node --experimental-strip-types scripts/measure-stock.mjs`, three runs on an
Apple M5 Pro with Node 22.14.0, 24 October 2026.

```text
example [7, 1, 5, 3, 6, 4]
every pair: answer 5, 15 pairs
one pass:   answer 5, 5 steps

100,000 seeded prices, 0 to 10,000
every pair: answer 10000, 4,999,950,000 pairs, median 2644 / 2650 / 2663 ms
one pass:   answer 10000, 99,999 steps,     median 0.069 / 0.076 / 0.069 ms
```

The counts are exact and checked every run. The times are this machine and
this runtime; the script checks a new run against the recorded band and
fails if every pair moves more than 30 percent or one pass passes 0.1 ms.

The one pass's first timed run is about 0.9 ms while the JIT warms up,
which is why the median of five is kept rather than the first.

The loops on screen in `Code.tsx` are the two in the script without the
lines that count pairs and steps.
