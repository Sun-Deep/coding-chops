# Sources

The mechanism was checked against documentation rather than recalled. Every
number in the cut is measured locally and recorded in `measurements.md`; these
are what the measurements were interpreted with.

- PostgreSQL 15 documentation, B-Tree indexes.
  https://www.postgresql.org/docs/15/btree.html
- PostgreSQL 15 documentation, index types and when the planner uses them.
  https://www.postgresql.org/docs/15/indexes-types.html
- PostgreSQL 15 documentation, `EXPLAIN`, and how to read `Buffers`,
  `Rows Removed by Filter` and `loops` on a parallel plan.
  https://www.postgresql.org/docs/15/using-explain.html
- PostgreSQL 15 documentation, `pageinspect`, for `bt_metap` and
  `bt_page_stats`.
  https://www.postgresql.org/docs/15/pageinspect.html
- PostgreSQL 15 documentation, index maintenance cost on write.
  https://www.postgresql.org/docs/15/indexes-intro.html

## What the sources settled

That `Rows Removed by Filter` is reported per worker, so a parallel sequential
scan's three workers each report a third of the table. Reading it as the whole
figure would have put 3,333,333 on screen instead of 9,999,999.

That `root_level` from `bt_metap` counts levels above the leaf, so level 2 is a
three-page path rather than a two-page one.
