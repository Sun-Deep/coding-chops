# Measurement run

## What is exact and what is not

Every figure in this cut is a count, and a count is a property of the algorithm
and the input rather than of the machine. Run `sorting.ts` anywhere on the same
array and the same numbers come out. There are no timings on screen, which is
deliberate: a millisecond is a property of the laptop and a comparison is not.

The instrumentation is in `src/vertical/04-quicksort/sorting.ts` and the shots
read the results directly, so nothing on screen can disagree with the run.

## The input

```text
n       200
seed    2026
```

The seed is pinned and committed. Quicksort's comparison count moves with the
input, so the input is part of the claim. Three seeds were checked:

```text
seed 7      selection 19,900    quicksort 1,616    ratio 12.3
seed 99     selection 19,900    quicksort 1,452    ratio 13.7
seed 2026   selection 19,900    quicksort 1,554    ratio 12.8
```

Selection sort does not move. That is the finding, not an artefact.

## Comparisons

```text
Selection sort, shuffled        19,900
Selection sort, already sorted  19,900
Quicksort, shuffled              1,554

ratio                            12.81
```

`19,900` is `n(n-1)/2` for `n = 200`. It is stated in the cut because it is the
claim, not because it was observed once.

## Writes

Two per swap, counted at the swap.

```text
Selection sort    384
Quicksort       1,228

ratio            3.20
```

## Writes per position

```text
                 untouched   mean   max
Selection sort           2   1.92    12
Quicksort                0   6.14    12
```

The maximum is the same for both and the mean is not, which is why the writes
shot lights a bar by how many times it was written rather than by whether it was
written at all. An earlier version coloured anything with a write in it and both
fields came out the same colour.

## Already sorted

```text
Selection sort on [1..200]    19,900 comparisons    0 swaps
```

The array is read two hundred times and nothing moves.
