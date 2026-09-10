# Measurement run

Every number the cut may put on screen. Run twice on 2026-09-10 by
`scripts/measure-index-only-scan.sh`. The figures live in
`src/vertical/05-index-only-scan/measurements.ts` and no shot hardcodes one, so
correcting a measurement here corrects the frames.

## Machine

```text
PostgreSQL 15.13 (Homebrew) on aarch64-apple-darwin24.4.0
Apple silicon, local SSD, default homebrew postgresql@15 configuration
shared_buffers = 16384 (128 MB)
work_mem = 4096 (4 MB)
max_parallel_workers_per_gather = 2
```

Nothing was tuned. The same machine and the same configuration as VR01, which
matters because this cut is VR01's third lane and the two sets of numbers are
meant to sit beside each other.

`work_mem` is load bearing here and is called out again below.

## Setup

```sql
CREATE TABLE events (
  id      bigint,
  cust_id int,
  day_id  int,
  amount  int,
  note    text
);

INSERT INTO events
SELECT g,
       1 + abs(hashtext(g::text)) % 100,
       1 + (g - 1) / 100000,
       ((g::bigint * 7919) % 100000)::int,
       'row padding to a realistic width, forty or so bytes'
FROM generate_series(1, 10000000) g;

VACUUM ANALYZE events;
```

```text
rows          10,000,000
heap          965 MB
heap pages    123,457
```

`cust_id` and `day_id` are the controlled pair. Both have exactly 100 distinct
values and about 100,000 rows per value. The only difference between them is
where those rows physically sit.

```text
attname   n_distinct   correlation
cust_id          100   0.0060457787
day_id           100   1
```

`cust_id` is hashed, so one customer's rows are spread across the whole table.
`day_id` is the row number in buckets, so one day's rows are contiguous. That
correlation is the variable this cut is really about, and it is measured rather
than asserted.

```text
rows matching cust_id = 42     100,366
rows matching day_id  = 42     100,000
```

## The query

```sql
SELECT sum(amount) FROM events WHERE cust_id = 42;
```

The aggregate matters. VR01 asked for one row, and an index-only scan saves
exactly one page read on a single row lookup, which is nothing. The payoff only
appears when a query returns many rows, so this cut asks a question that reads
a hundred thousand of them.

## Scattered rows: cust_id, correlation 0.006

### No index

```text
Finalize Aggregate (actual time=143.890..144.906 rows=1 loops=1)
  Buffers: shared hit=16116 read=107341
  ->  Gather (actual time=143.827..144.898 rows=3 loops=1)
        Workers Planned: 2
        Workers Launched: 2
        ->  Parallel Seq Scan on events (actual time=0.041..141.553 rows=33455 loops=3)
              Filter: (cust_id = 42)
              Rows Removed by Filter: 3299878
```

123,457 pages, which is the whole table. About 140 ms.

### Plain index on (cust_id)

```text
Finalize Aggregate (actual time=113.656..116.001 rows=1 loops=1)
  Buffers: shared read=69211
  ->  Parallel Bitmap Heap Scan on events (actual time=6.405..111.005 rows=33455 loops=3)
        Recheck Cond: (cust_id = 42)
        Rows Removed by Index Recheck: 872200
        Heap Blocks: exact=12576 lossy=11730
        ->  Bitmap Index Scan on ev_cust_plain (actual time=4.782..4.782 rows=100366 loops=1)
              Buffers: shared read=88
```

69,211 pages. The index found all 100,366 rows in 88 page reads and the scan
still touched more than half the table to go and get them.

Two things are happening and both belong in the learning notes.

The rows are scattered, so 100,366 of them land on close to 100,000 distinct
pages out of 123,457. Reading a hundred thousand scattered rows out of a table
is not much cheaper than reading the table.

The bitmap also went lossy. An exact bitmap of that many rows does not fit in
4 MB of `work_mem`, so Postgres degrades whole pages to page granularity and
rechecks every row on them. `Rows Removed by Index Recheck: 872,200` is the cost
of that. This is default configuration behaviour, not a contrived setting, but
the cut must not claim the 69,211 is purely a correlation effect. It is
correlation plus a lossy bitmap.

### Covering index on (cust_id) INCLUDE (amount)

```text
Aggregate (actual time=4.740..4.741 rows=1 loops=1)
  Buffers: shared hit=281
  ->  Index Only Scan using ev_cust_cover on events (actual time=0.022..2.886 rows=100366 loops=1)
        Index Cond: (cust_id = 42)
        Heap Fetches: 0
        Buffers: shared hit=281
```

281 pages. `Heap Fetches: 0`. The table is never opened.

69,211 over 281 is 246. Same query, same 10 million rows, same indexed column,
one extra column carried in the index.

## Contiguous rows: day_id, correlation 1.0

This is the counterweight and it has to be in the cut, because without it the
finding is not true in general.

```text
plain index      Index Scan using ev_day_plain    Buffers: shared hit=1322    ~6.8 ms
covering index   Index Only Scan using ev_day_cover  Buffers: shared hit=277  ~4.6 ms
                                                     Heap Fetches: 0
```

When the rows are already in order the plain index reads 1,322 pages, because
100,000 contiguous rows occupy about 1,235 pages and it reads them in order.
The covering index still helps, 1,322 to 277, but that is 4.8 times and not 246.

The size of the win is a property of the correlation, not of the covering index.

## What the covering index costs on disk

```text
              size     pages
plain         66 MB    8,468
covering     215 MB   27,460
```

3.3 times the index. The `amount` column is stored a second time, on every leaf
page, for every row. Build time for the covering index was 5.1 s.

## The catch: the visibility map

An index-only scan is not a property of the index. It is a property of how
recently `VACUUM` ran, because Postgres can only skip the heap for pages the
visibility map marks all-visible.

One percent of the table updated, `ANALYZE` run, `VACUUM` deliberately not:

```text
Finalize Aggregate (actual time=185.175..187.579 rows=1 loops=1)
  Buffers: shared read=70103
  ->  Parallel Bitmap Heap Scan on events (actual time=9.928..182.189 rows=33455 loops=3)
        Heap Blocks: exact=12126 lossy=11057
        ->  Bitmap Index Scan on ev_cust_cover (rows=101410 loops=1)
```

The covering index is still there and the plan has fallen all the way back to
the bitmap heap scan. 70,103 pages, 187 ms. The first run after the update was
10,790 ms, because it was also writing out dirtied pages.

Then `VACUUM events;` and nothing else:

```text
Aggregate (actual time=0.490..0.491 rows=1 loops=1)
  Buffers: shared hit=284
  ->  Index Only Scan using ev_cust_cover on events (rows=100366 loops=1)
        Heap Fetches: 0
```

284 pages. One `VACUUM` between 187 ms and 6 ms, with no schema change.

## What is stable and what is not

Both runs were on 2026-09-10, back to back rather than an hour apart. The
playbook asks for an hour between them and that third run is still owed before
any of this goes in a frame, though the page counts below were bit identical
across the two runs that exist, which is the outcome the rule is trying to
protect.

Identical in both runs:

```text
heap pages                       123,457
matching rows, cust_id            100,366
matching rows, day_id             100,000
scattered, no index                123,457 pages
scattered, plain index              69,211 pages
scattered, covering index              281 pages
contiguous, plain index              1,322 pages
contiguous, covering index             277 pages
plain index                     66 MB,  8,468 pages
covering index                 215 MB, 27,460 pages
```

Moved between runs:

```text
scattered, no index          144.9 ms  /  139.1 ms
scattered, plain index       116.0 ms  /  122.3 ms
scattered, covering index      4.76 ms /    4.92 ms
first run after CREATE INDEX 363.6 ms  /  471.1 ms
```

The warm timings move by about 7 percent and the cold first run moves by 30,
because it is writing out dirtied pages rather than measuring the plan. Counts
go on screen as absolutes. Times go on screen rounded, or as a ratio, and the
cold run is not a measurement of anything and does not go on screen at all.
