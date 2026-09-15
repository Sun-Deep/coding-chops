# Learning notes

What had to be settled before anything could be drawn.

## One clock needs one unit of work

Six algorithms racing means nothing until "the same amount of work" is defined,
and the obvious unit is wrong. Comparisons alone flatter merge sort, which does
210 of them and then moves 544 values around. Writes alone flatter selection
sort, which does 92 and is nearly the slowest thing here.

Counting comparisons and writes together is the unit that does not pick a
winner in advance. It is still a choice, and it is the reason the cut says
"ops" rather than "steps" and puts the definition on screen.

## Merge sort's scratch buffer is work

This is the only accounting decision with a real argument on both sides. The
copy out to the auxiliary array does not move a bar, so counting it charges
merge sort for work that is invisible in the panel.

It is counted anyway. Merge sort's cost is not only its comparisons, it is that
it needs somewhere else to put things, and a unit of work that quietly forgives
the one algorithm here that is not in place would be measuring the picture
instead of the algorithm. It costs merge sort 272 of its 754 operations, which
is more than a third, and it still finishes second.

## Selection sort is the interesting one

It does the most comparisons of the six, 1,128, and the fewest writes by a long
way, 92. Every other algorithm here writes hundreds of times.

That is not an accident of this array. Selection sort performs at most one swap
per position by construction, so it is the algorithm to reach for when a write
is the expensive operation: flash memory, a network round trip, anything where
moving a record costs more than looking at one. It loses this race and it is
the right answer to a question the race does not ask, which is why it is the
catch in the caption rather than a footnote.

## Bubble sort's optimisation matters

The naive version always runs n passes. The version with the swapped flag stops
as soon as a pass makes no swaps, and the shrinking upper bound skips the tail
that is already settled. That is the version measured here, because measuring
the naive one would be beating up a straw man.

It still loses by 6.2 times.

## One array is one sample

Quicksort's 387 operations are quicksort on this permutation. On sorted input
Lomuto partitioning degrades to quadratic and would lose this race badly, and
insertion sort would win it outright in 47 comparisons.

The cut says n = 48 and one array on screen for that reason. The ordering
between the quadratic three and the other three is structural. The exact
figures are not.
