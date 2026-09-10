# Sources

The mechanism was checked against documentation rather than recalled. Every
number in the cut is measured locally and recorded in `measurements.md`; these
are what the measurements were interpreted with.

- PostgreSQL 15 documentation, index-only scans and covering indexes.
  https://www.postgresql.org/docs/15/indexes-index-only-scans.html
- PostgreSQL 15 documentation, the visibility map.
  https://www.postgresql.org/docs/15/storage-vm.html
- PostgreSQL 15 documentation, `CREATE INDEX` and the `INCLUDE` clause.
  https://www.postgresql.org/docs/15/sql-createindex.html
- PostgreSQL 15 documentation, routine vacuuming, for what sets a page
  all-visible and what clears it.
  https://www.postgresql.org/docs/15/routine-vacuuming.html
- PostgreSQL 15 documentation, `EXPLAIN`, and how to read `Buffers`,
  `Heap Fetches`, `Heap Blocks: exact` and `lossy`.
  https://www.postgresql.org/docs/15/using-explain.html
- PostgreSQL 15 documentation, `pg_stats`, for what `correlation` measures.
  https://www.postgresql.org/docs/15/view-pg-stats.html
- PostgreSQL 15 documentation, `work_mem`, for when a bitmap goes lossy.
  https://www.postgresql.org/docs/15/runtime-config-resource.html

## What the sources settled

That an index-only scan is not a guarantee. The planner may choose it, and at
runtime each entry still checks the visibility map; any page not marked
all-visible costs a heap fetch anyway. `Heap Fetches: 0` is the measurement that
it did not have to, not a property of the index.

That `INCLUDE` columns are stored on leaf pages only, not in the internal pages,
so they cost space without changing the height of the tree. That is why the
covering index is 3.3 times the size and the lookup is not slower.

That `correlation` in `pg_stats` is the statistical correlation between the
column's logical order and the physical order of the rows, which is exactly the
quantity the cut's claim depends on. It is measured rather than asserted.

That a bitmap heap scan degrades whole pages to page granularity when the exact
bitmap will not fit in `work_mem`, and reports this as `lossy` with a
`Rows Removed by Index Recheck` count. This is why the 69,211 is not attributed
to scatter alone anywhere in the cut.
