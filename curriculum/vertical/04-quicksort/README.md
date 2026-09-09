# Vertical 04: what a sort actually costs

Status: approved

Both gates are passed. The understanding check is complete, and the finished
render was watched from beginning to end.

## What it claims

Selection sort spends 19,900 comparisons on two hundred numbers. It spends
19,900 on two hundred numbers that are already in order, because the count is
n(n-1)/2 and nothing in the algorithm can notice there is nothing left to do.
Quicksort finishes the same array in 1,554 and can do it twelve times over in
the span the other takes once.

Then the catch, which is the reason the cut exists rather than being a
scoreboard: quicksort moves 1,228 values to get there and selection sort moves 384. On a medium where a write is the expensive operation, the slow algorithm is
the correct one.

## Why this topic

The page's sorting reel did 596K, which is the only category on the back
catalogue with a proven number that is also impossible to draw as a static
diagram. Quicksort itself is untouched.

It also fixes a format problem rather than only adding an episode. The first
three vertical cuts put a small diagram in the middle of a dark frame and left
the rest empty, and the last of them did 3K. A field of two hundred bars running
the full width is the same information with something to look at.

## Scope

It teaches: that selection sort's comparison count is a property of the length
and not of the input, that quicksort's partition halves the problem and lands in
about 1,554 comparisons on the same array, and that the cheaper algorithm on
comparisons is the expensive one on writes by a factor of three.

It does not teach: merge sort, heap sort, stability, worst case quicksort and
why a bad pivot degrades to n squared, introsort, or what any language's
standard library actually calls.

Worst case quicksort was the strongest thing left out. A sorted input with a
last element pivot is the classic 19,900 comparison collapse, and putting it
beside selection sort's 19,900 is a genuinely good frame. It needs its own cut
because it is a second claim, and this one already ends on a tradeoff.

## Files

- `learning-notes.md`: what had to be understood before drawing anything
- `sources.md`: what the mechanism was checked against
- `understanding-check.md`: the creator comprehension gate
- `measurements.md`: the run and what is exact in it
- `script.md`: the narration and the on-screen copy
- `storyboard.md`: the shot plan
- `publishing.md`: the caption, the hashtags and the title

## Compositions

```text
VR04-Quicksort   1080x1920, 805 frames, 30 fps  (26.8s, no title card)
VR04-Shot-01     1080x1920, 90 frames           (the opening, for review)
```

```bash
npm run render:reel-04
```
