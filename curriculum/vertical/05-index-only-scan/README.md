# Vertical 05: The index that still reads the table

Status: published

The understanding check is not ticked and no render exists.

## What it claims

An index on the filtered column is not enough to keep Postgres out of the table.
Asking for a hundred thousand scattered rows through a plain index on `cust_id`
reads 69,211 of the table's 123,457 pages. Carrying `amount` in the index reads
281 and never opens the table. The win is a property of how the rows are
physically ordered, and it disappears until `VACUUM` runs.

## Why this topic

It is the follow-up VR01 named in its own scope note, and VR01 is the best
performing vertical cut on the page. It is also both shapes this feed rewards at
once: a search space collapsing, and a thing somebody wants to keep.

It is a sequel that re-teaches nothing. VR01 compared no index against an index
on a single row lookup. This compares an index against an index that carries the
answer, on a query that returns a hundred thousand rows, which is the case where
an index-only scan is worth anything at all. The sequential scan appears once,
as a row in the verdict, so the two cuts join up without repeating.

## Scope

It teaches: that an index lookup and a heap fetch are two different costs, that
scattered rows make the second one nearly as expensive as reading the table,
what `INCLUDE` puts on a leaf page, what `Heap Fetches: 0` means, that the
covering index is a second copy of the column, and that an index-only scan
depends on the visibility map being current.

It does not teach: composite index column order, partial indexes, `CLUSTER` and
physical reordering, other index types, autovacuum tuning, or why the planner
chooses a bitmap heap scan over an index scan.

Left out and scoped as the follow-up: `work_mem` and the lossy bitmap. The
69,211 figure is partly a lossy bitmap at the default 4 MB, and the mechanism of
a bitmap degrading from row granularity to page granularity is a cut of its own.
It is named in this cut's receipts and not explained.

## Files

- `learning-notes.md`: what had to be understood before the shots could be drawn
- `sources.md`: the documentation the mechanism was checked against
- `understanding-check.md`: the creator comprehension gate
- `measurements.md`: the full run, with the SQL and the raw `EXPLAIN` output
- `script.md`: the narration and the on-screen copy, in order
- `storyboard.md`: the shot plan
