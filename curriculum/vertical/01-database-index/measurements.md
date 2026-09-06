# Measurement run

Every number the cut puts on screen. Run on 2026-09-05. The figures live in
`src/vertical/01-database-index/measurements.ts` and no shot hardcodes one, so
correcting a measurement here and there corrects the frames.

## Machine

```text
PostgreSQL 15.13 (Homebrew) on aarch64-apple-darwin24.4.0
Apple silicon, local SSD, default homebrew postgresql@15 configuration
```

Nothing was tuned. `shared_buffers`, `work_mem` and the parallel worker settings
are whatever the package ships, which is the point: the numbers are what a
developer gets on a laptop, not what a tuned server gets.

## Setup

```sql
CREATE TABLE events (
  id      bigint,
  user_id bigint,
  amount  int,
  note    text
);

INSERT INTO events
SELECT g, g, ((g::bigint * 7919) % 100000)::int, 'row'
FROM generate_series(1, 10000000) g;

ANALYZE events;
```

```text
rows          10,000,000
heap          498 MB
```

`user_id` is the row number, so the key in the query sits at a known fraction of
the way through the table. That is what puts the matching tile at 86.75 percent
of the way through the sweep in the scan shot, which is not a composition
choice.

## The query

```sql
SELECT amount FROM events WHERE user_id = 8675309;
```

## Without an index

```text
Gather (actual time=103.255..104.370 rows=1 loops=1)
  Workers Planned: 2
  Workers Launched: 2
  Buffers: shared hit=16176 read=47519
  ->  Parallel Seq Scan on events (actual time=98.618..102.286 rows=0 loops=3)
        Filter: (user_id = 8675309)
        Rows Removed by Filter: 3333333
        Buffers: shared hit=16176 read=47519
Planning Time: 0.092 ms
Execution Time: 104.391 ms
```

Three runs: 103.297, 104.391, 105.454 ms. The cut uses 104.

`Rows Removed by Filter` is per worker and there are three, so the discarded
total is 9,999,999. `Buffers` is already the whole plan rather than per worker,
so pages read is 16,176 + 47,519 = 63,695.

## With an index

```sql
CREATE INDEX events_user_id_idx ON events (user_id);   -- 1,890 ms
ANALYZE events;
```

```text
heap    498 MB
index   214 MB
```

```text
Index Scan using events_user_id_idx on events (actual time=0.015..0.016 rows=1 loops=1)
  Index Cond: (user_id = 8675309)
  Buffers: shared hit=7
Planning Time: 0.137 ms
Execution Time: 0.030 ms
```

Three runs: 0.280 ms cold, then 0.027 and 0.030 ms warm. The cut uses 0.03 and
says warm cache on the frame that carries it.

## The shape of the tree

This is where the descent in the cut comes from. It is measured, not drawn.

```sql
CREATE EXTENSION pageinspect;

SELECT root, level FROM bt_metap('events_user_id_idx');
--  root | level
--   290 |     2

SELECT type, count(*), round(avg(live_items))
FROM (SELECT (bt_page_stats('events_user_id_idx', g)).* FROM generate_series(1,400) g) s
GROUP BY type;
--  type | pages | avg_entries
--  r    |     1 |          97
--  i    |     2 |         285
--  l    |   397 |         367
```

Root level 2 means three pages take a lookup from the root to a leaf. The
fanout at each of them gives what is still possible after each read:

```text
                       rows still possible
start                          10,000,000
after the root page (97)          103,093
after the internal page (285)         362
after the leaf page (367)               1
```

97 x 285 x 367 is 10,145,715, which is the same ten million rows with the fill
factor left in. The index is 27,422 pages of which 397 in the sampled range are
leaves.

The heap fetch is the fourth read. `Buffers: shared hit=7` covers the metapage,
the three index pages and the heap page, plus repeats.

## What the index costs

500,000 inserts into an empty table carrying 0, 1 and 3 indexes. Two runs on the
same machine, an hour apart:

```text
indexes   run 1     run 2     ratio to no index
0         1.731 s   1.163 s   1.00   1.00
1         2.497 s   1.713 s   1.44   1.47
3         5.135 s   3.577 s   2.96   3.08
```

The absolute seconds move by half between runs. Insert timing depends on the
page cache, the WAL and whatever the background writer happens to be doing, and
none of that is stable on a laptop.

The ratio is stable, so the ratio is what goes on screen: three indexes, three
times slower. A figure that changes when you run it again is not a measurement,
it is a reading.

## What reproduced exactly, and what did not

Second run of `scripts/measure-database-index.sh`, same machine:

```text
                          run 1        run 2
index scan buffers        7            7
index scan time           0.030 ms     0.029 ms
root level                2            2
root entries              97           97
internal entries          285          285
leaf entries              367          367
index pages               27,422       27,422
inserts, 3 indexes        5.135 s      3.577 s
```

Everything structural repeated to the digit. Only the wall clock moved, and only
on the write test. That split is the reason the cut leads on rows and pages and
puts time second.

## Reproducing it

`scripts/measure-database-index.sh` runs the whole thing into a scratch database
and drops it afterwards. It prints the output above.
