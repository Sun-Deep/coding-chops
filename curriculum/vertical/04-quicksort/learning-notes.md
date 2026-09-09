# Learning notes

## The question

Two hundred numbers. What does each algorithm actually spend, and is spend the
same thing as time?

## Selection sort

Walk the unsorted tail, find the smallest, swap it into place, repeat. Pass i
compares n-1-i elements, so the total is the sum of that over every pass, which
is n(n-1)/2. For two hundred, 19,900.

The number that matters is not 19,900. It is that 19,900 has no input in it.
The count depends only on the length. A shuffled list costs 19,900, a reversed
list costs 19,900, and a list that is already in perfect order costs 19,900,
because the inner loop has no early exit and no way to learn anything from what
it just read.

Measured on a sorted input: 19,900 comparisons, zero swaps. The algorithm reads
the whole array two hundred times and moves nothing.

That is worth being precise about. It is not that selection sort is slow. It is
that selection sort cannot be told it has nothing to do, which is a different
and more interesting failure than being slow.

## Quicksort

Pick a pivot, partition everything around it, recurse into both halves. Each
partition pass is linear in the range and the ranges halve, so the work is
n log n on a reasonable pivot.

On the same two hundred numbers with a last element pivot: 1,554 comparisons.
About 12.8 times fewer than selection sort, which is why the cut can run both at
the same comparisons per frame and let one finish twelve times over.

Unlike selection sort's, this count moves with the input. Three seeds gave
1,616, 1,452 and 1,554. So the array is pinned and committed, and the figure on
screen is the figure for that array rather than an average dressed up as a fact.

## The catch

Comparisons are not the only thing an algorithm spends.

Selection sort writes 384 times. It makes at most one swap per pass, which is
two writes, and on two hundred elements that is at most 400 and in practice 384.

Quicksort writes 1,228 times, because partitioning moves elements around inside
the range on nearly every step. Three point two times as many.

On memory that is free to write this does not matter and quicksort wins outright.
On flash, on EEPROM, on anything with a wear budget, the write count is the cost
that shows up in the datasheet, and there selection sort's stubbornness is the
feature. It is the reason the algorithm is still taught rather than only being a
worked example of a quadratic loop.

## What was cut

Quicksort's worst case. A sorted array with a last element pivot never splits,
so it degrades to n(n-1)/2, which is 19,900, which is exactly selection sort's
number. Two algorithms arriving at the same figure for opposite reasons is a
good frame and it is a second claim. It gets its own cut.

Also cut: merge sort, stability, and what any real standard library does, which
is almost always a hybrid and is a different conversation.

## What would make this wrong

The write figures are for this partition scheme. Hoare partitioning writes less
than Lomuto, so a cut that said "quicksort writes three times as much" as a
general law would be overreaching. The claim is about the two implementations in
`sorting.ts`, both of which are in the repository and can be read.
