# Measurements

Reproduce with:

```bash
node scripts/measure-sorting-race.mjs
```

## The machine

```text
Apple M5 Pro, macOS 26.5.1, node v22.14.0
```

Nothing here is timed, so the machine does not affect the figures. It is
recorded because the run should be repeatable, not because the hardware matters.

## The fixture

A permutation of 1 through 48, shuffled by a pinned linear congruential
generator with seed 20260914. The script and the reel build it the same way, so
every render sorts the identical array.

```text
46 5 24 29 33 47 27 42 3 48 39 7 19 44 11 34 28 13 10 32 18 16 35 40 15 43 36
30 21 14 17 2 26 37 31 38 8 6 23 45 1 25 9 41 4 12 22 20
```

## What an operation is

A comparison between two element values, or a write into an array. Merge sort's
copy out to its scratch buffer is a write and is counted as one, because it is
work the machine does and excluding it would flatter the only algorithm here
that is not in place. The three kinds are reported separately below so the
accounting can be argued with.

Counts, not times. A count is a property of the algorithm. A millisecond is a
property of the laptop.

## The run

| Algorithm | Comparisons | Writes | Auxiliary writes | Operations |
| --------- | ----------- | ------ | ---------------- | ---------- |
| Bubble    | 1,113       | 1,304  | 0                | 2,417      |
| Selection | 1,128       | 92     | 0                | 1,220      |
| Insertion | 695         | 699    | 0                | 1,394      |
| Merge     | 210         | 272    | 272              | 754        |
| Heap      | 384         | 448    | 0                | 832        |
| Quick     | 199         | 188    | 0                | 387        |

Slowest is bubble sort at 2,417 operations, fastest is quicksort at 387, a
ratio of 6.2.

## Implementations

Bubble sort carries the early-exit flag and the shrinking upper bound, so it is
the optimised textbook version rather than the naive one. Insertion sort shifts
rather than swapping. Merge sort is top-down with one reused auxiliary buffer.
Heap sort is in place, building the heap with sift-down. Quicksort uses Lomuto
partitioning on the last element, with no median-of-three and no small-range
cutover.

Every one of them is the plain version. A tuned implementation of any would
move its number.

## How it is kept honest

`scripts/measure-sorting-race.mjs` asserts all six sets of counts and that
every algorithm actually returned a sorted array. `src/vertical/09-sorting-race/sorting.ts`
runs its own instrumented copies and asserts their totals against the same
figures in `measurements.ts` at module load, so a render cannot start against
numbers no run produces.
