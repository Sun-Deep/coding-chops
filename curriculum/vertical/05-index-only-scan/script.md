# Script

Status: blocked

The understanding check is not ticked and no render exists yet. This file is the
narration and the on-screen copy. The shot map goes in `storyboard.md` and the
frame timings go in `src/vertical/05-index-only-scan/narration.tsx`, both of
which come after this.

There is no voiceover and no music. The narration is burned into the frame as a
subtitle track, so this is the copy in the order it appears rather than a
recording script.

Every figure below is in `measurements.ts` and came off the run in
`measurements.md`. Nothing here was rounded to make a line land.

## The shape

Thirty seconds, five shots, no hook card. A mechanism and its cost is thirty
seconds, and this one has two costs.

The visual spine is a single question asked three times: does Postgres open the
table. Shot one says yes, across most of it. Shot two says no, not once. Shot
three says yes again, and the only thing that changed is that `VACUUM` did not
run. Three shots, one question, three answers, and the hero of each is the table
lighting up or staying dark.

This is VR01's third lane. VR01 asked for one row and compared no index against
an index. This asks for a hundred thousand rows and compares an index against an
index that carries the answer. The seq scan is not re-taught; it appears once,
as a row in the verdict.

## Narration

Nine lines, 63 words, thirty seconds. Payoff lines are marked, one per shot.

```text
SHOT 1  the index that still reads the table            0 to 230

f6      An index on cust_id. 100,366 rows match.
f96     Scattered, so it fetches each one.
f160    69,211 pages. Half the table.                   [payoff]

SHOT 2  the covering index                            230 to 430

f236    Put amount in the index as well.
f320    281 pages. The table is never opened.           [payoff]

SHOT 3  the catch                                     430 to 620

f436    Update one percent. Skip VACUUM.
f530    70,103 pages. Back to the table.                [payoff]

SHOT 4  verdict                                       620 to 770

f626    Same query. Same ten million rows.
f700    246 times fewer pages.                          [payoff]

SHOT 5  end card                                      770 to 900

f776    Not free, and not automatic.
f840    Bigger index. Only after VACUUM.                [payoff]
```

2.1 words a second. The plain lines say what is happening while it happens. The
payoff lines are the point of their shot.

## Shot 1. The index that still reads the table, 0:00 to 7:20

```text
WITH AN INDEX · BITMAP HEAP SCAN

SELECT sum(amount) FROM events        [held through the shot]
WHERE cust_id = 42;

CREATE INDEX ON events (cust_id);

[the table, one tile per page, 100,366 matching rows
 lighting up scattered across the whole span]

PAGES READ
0 -> 69,211    of 123,457

An index on cust_id. 100,366 rows match.
Scattered, so it fetches each one.

69,211 pages.
Half the table.

pg_stats correlation: 0.006 · rows removed by index recheck: 872,200
```

The receipt carries the correlation because the scatter is the mechanism, not a
composition choice, and it carries the recheck count because the 69,211 is two
effects at once. See the copy notes.

## Shot 2. The covering index, 7:20 to 14:10

```text
CARRYING THE ANSWER · INDEX ONLY SCAN

CREATE INDEX ON events (cust_id) INCLUDE (amount);

[the same table, still dark. the index alone lights,
 281 tiles of it, and the sum runs inside it]

PAGES READ
281

Put amount in the index as well.

281 pages.
The table is never opened.

heap fetches: 0 · execution time: 4.8 ms
```

`Heap Fetches: 0` is the literal line out of `EXPLAIN` and it belongs on the
index object rather than in the narration, which has already said it in words.

## Shot 3. The catch, 14:10 to 20:20

```text
THE VISIBILITY MAP · SAME INDEX

UPDATE events SET amount = amount + 1
WHERE id % 100 = 0;

[100,000 tiles going stale across the table.
 then the query runs and the table lights up again]

PAGES READ
281 -> 70,103

Update one percent. Skip VACUUM.

70,103 pages.
Back to the table.

the index did not change · vacuum did not run
```

## Shot 4. Verdict, 20:20 to 25:20

```text
SAME QUERY · SAME 10,000,000 ROWS

                    pages     time
No index          123,457    140 ms
Index             69,211     117 ms
Covering index        281    4.8 ms

246x
FEWER PAGES, ON THE SAME MACHINE

Same query. Same ten million rows.
246 times fewer pages.

postgres 15.13 · 965 mb table · 123,457 pages · warm cache
```

The first row is VR01's sequential scan, appearing once so the two cuts join up.

## Shot 5. End card, 25:20 to 30:00

```text
A covering index is a second copy.

66 MB index becomes 215 MB
in-order rows were already 1,322 pages, so this is worth 4.8x there, not 246x

Not free, and not automatic.
Bigger index. Only after VACUUM.

[Coding Chops lockup]

measured, not estimated · full run in the repo
```

## Copy notes

No hook card, per section 10 of the standard. The cut opens on a query already
running against an index that is already there, because the surprise is that
this is not enough, and a card claiming that in advance would spend the surprise
before the viewer has seen it be true.

The end card is the cost, following VR01. A cut that stops at 246x teaches
people to add `INCLUDE` to everything, and the index size and the `VACUUM`
dependency are the two things that would then bite them.

The contiguous lane is a receipt on the end card rather than a shot of its own.
It has to be in the cut, because the 246x is a property of the correlation and
without it the claim is not true in general. It is not a shot because it breaks
the visual spine: every other shot asks whether the table gets opened, and that
lane is about where the rows sit.

The 69,211 is correlation plus a lossy bitmap at the default 4 MB `work_mem`.
Both receipts are on shot 1 for that reason. No narration line claims the figure
is scatter alone, and none should be added later that does.

The times on the verdict are rounded and the cold first run after `CREATE INDEX`
is not on screen anywhere. It moved from 364 ms to 471 ms between two runs and
is measuring dirtied pages being written out, not the plan.

No em dashes, per the channel writing rules.
