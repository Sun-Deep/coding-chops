# Understanding check

The creator gate. Answer each without looking at the notes, the plan output or
the composition. Tick only what you can actually do.

- [x] Explain, without using the word "faster", what a covering index changes
      about the work Postgres does.
- [x] Say what the two separate costs in an index scan are, and which one the
      `INCLUDE` column removes.
- [x] Explain why the plain index on `cust_id` read 69,211 pages when only
      100,366 rows matched out of 10,000,000.
- [x] Name the two effects that produce that 69,211, and say which receipt on
      shot 1 corresponds to each.
- [x] Say what `correlation` in `pg_stats` measures, and predict what the
      covering index is worth at correlation 1.0 before checking.
- [x] Explain what `Heap Fetches: 0` is actually reporting, and why it is not a
      property of the index.
- [x] Say what `VACUUM` sets that makes an index-only scan possible, and what
      clears it.
- [x] Explain why the covering index is 3.3 times the size but the lookup is not
      3.3 times slower.
- [x] Describe a query where adding `INCLUDE` would change nothing, and say why.
- [x] Say why the sequential scan appears only in the verdict and is not a shot.
