# Vertical 52: OFFSET 100000 still reads 100,000 rows

Status: published 28 Oct 2026 at 8:42 PM.

## What it claims

To show page 1,001 of a table, 100 rows a page, `LIMIT 100 OFFSET 100000`
makes Postgres read 100,100 rows through the index and throw the first
100,000 away. Remembering the last id of the page before and asking
`WHERE id > 100000 ... LIMIT 100` (keyset pagination) returns the same
100 rows and reads only those 100. On 1,000,000 orders in PostgreSQL
15.13, median of 51 runs: 5.314 ms against 0.024 ms. Every count is the
index scan's actual rows from EXPLAIN ANALYZE.

## Why this topic

The SQL order-of-execution reel did 694,000 views and 2,528 follows in two
days, and its comments were "ASMR", "best visualization" and a DBA who had
never seen it explained. This is the follow-up the plan held for the
month's winner: another thing people use daily and have never seen from
the inside.

## A new look, same building

The SQL reel was a fixed eye-level shot of a sorting table and a cubby
wall, and it was clear because the whole data set was in one frame and
each clause was one act you could watch. This is the stockroom in the
same building, shot the same way: a wall of crates in id order, the page
in it from the first frame. The first cut was one long camera slide down
an aisle ("14 s of sliding"); the second was six shots, which the creator
could not follow, because no frame showed where the page was among the
rows before it. See storyboard.md.

## Scope and honesty

- One crate is 1,000 orders and the page is the first 100 of the 101st,
  so the 100 crates dumped are exactly the 100,000 rows skipped.
- The row signs and crate labels stand for the B-tree's levels. The reel
  shows two looks; it does not claim the real index has two levels.
- The table is generated (ids 1 to 1,000,000, primary key). Keyset only
  works when the app keeps the last key of the page before, and the order
  is on an indexed, unique column; a real app often orders by
  (created_at, id). The reel does not claim OFFSET is always wrong: for the
  first pages it costs almost nothing (0.02 ms at offset 0).
- Times are from one machine and vary run to run (5.2 to 5.7 ms for page
  1,001 across runs); the read counts do not.
