# Script

Status: blocked

Blocked on the understanding check, which is the creator's to tick. The
composition, the cover, the measurement run and the mix are finished, and the
full render has been watched end to end.

There is no voiceover and no music. The narration is burned into the frame as a
subtitle track, and the sound effects are the whole audio. So this file is the
copy in the order it appears rather than a recording script. Frames are in
`src/vertical/01-database-index/narration.tsx`; the cue map is in
`storyboard.md`.

## Narration

Nine lines, 55 words, twenty-seven seconds. Payoff lines are marked.

```text
f0    No index on user_id.
f96   So Postgres reads every row in the table.
f232  1 row matched.                                    [payoff]
      9,999,999 did not.

f294  Now add a b-tree index.
f364  Each page read rules out
      almost everything left.
f514  Three page reads.                                 [payoff]
      Then the row.

f578  The data did not change.
f630  The way in did.                                   [payoff]

f690  Reads get faster.                                 [payoff]
      Writes pay for it.
```

The plain lines say what is happening while it happens. The payoff lines are the
point of their shot, and they used to be cards in the middle of the frame.

## Sequential scan, 0:00 to 9:18

```text
WITHOUT AN INDEX · SEQ SCAN

[the table, one tile per ten thousand rows, swept left to right]

ROWS READ
0 -> 10,000,000
63,695 pages · 104 ms

SELECT amount FROM events        [held through the sweep]
WHERE user_id = 8675309;

1 row was the answer.
9,999,999 were not.

explain analyze · rows removed by filter: 9,999,999
```

## The descent, 9:18 to 19:06

```text
WITH AN INDEX · B-TREE

1. ROOT PAGE          97 entries
2. INTERNAL PAGE     285 entries
3. LEAF PAGE         367 entries
4. THE ROW           user_id = 8675309

ROWS STILL POSSIBLE
10,000,000 -> 103,093 -> 362 -> 1

Three page reads.
Then the row.

buffers: shared hit=7 · execution time: 0.03 ms
```

## Verdict, 19:06 to 22:24

```text
SAME QUERY · SAME ROW

              rows read     pages      time
Seq scan     10,000,000    63,695    104 ms
Index scan            1         7    0.03 ms

3,400x
FASTER, ON THE SAME MACHINE

The data did not change.
The way in did.

postgres 15.13 · 10,000,000 rows · 498 mb · warm cache
```

## End card, 22:24 to 27:00

```text
An index is not free.

214 MB added to a 498 MB table
500,000 inserts run 3x slower with three indexes

Reads get faster.
Writes pay for it.

[Coding Chops lockup]

measured, not estimated · full run in the repo
```

## Copy notes

There is no hook card. It was cut: it repeated the cover, and it stood still
while it did. The cut opens on the scan already running, and the claim the hook
was making lands as this shot's payoff instead, where the viewer has just
watched it be true.

The end card is the cost rather than the win. A cut that stops at 3,400x teaches
people to add indexes, which is the wrong lesson and the one they will be
undoing in production later.

No em dashes, per the channel writing rules.

The write cost is a ratio rather than seconds because the seconds moved by half
between two runs on the same machine and the ratio did not. See
`measurements.md`.
