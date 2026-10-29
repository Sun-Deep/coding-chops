# Measurements

`scripts/measure-sql-offset.mjs`, run on 28 Oct 2026, after the query went to one clause a line, on an Apple M5 Pro.
It starts a throwaway PostgreSQL 15.13 cluster, loads 1,000,000 orders
(id bigint primary key), and for each page runs both queries under
EXPLAIN (ANALYZE, BUFFERS): it checks they return the same ids, that
OFFSET read n + 100 rows and keyset 100, and keeps the median execution
time of 51 runs after a warm-up.

The recorded run, the one `src/vertical/52-sql-offset/measurements.ts`
holds:

```text
== versions
PostgreSQL 15.13 (Homebrew) on aarch64-apple-darwin24.4.0, compiled by Apple clang version 17.0.0 (clang-1700.0.13.3), 64-bit

== 1000000 orders, 100 a page, median of 51 runs each

offset   | OFFSET reads | OFFSET ms | keyset reads | keyset ms
0        |          100 |     0.021 |          100 |     0.019
1000     |         1100 |     0.078 |          100 |     0.023
10000    |        10100 |     0.574 |          100 |     0.023
100000   |       100100 |     5.314 |          100 |     0.024
500000   |       500100 |    26.846 |          100 |     0.028
900000   |       900100 |    48.869 |          100 |     0.026

== the reel's page, OFFSET
Limit (actual rows=100 loops=1)
  ->  Index Scan using orders_pkey on orders (actual rows=100100 loops=1)

== the reel's page, keyset
Limit (actual rows=100 loops=1)
  ->  Index Scan using orders_pkey on orders (actual rows=100 loops=1)
        Index Cond: (id > 100000)

[{"offset":0,"offsetRead":100,"offsetMs":0.021,"keysetRead":100,"keysetMs":0.019},{"offset":1000,"offsetRead":1100,"offsetMs":0.078,"keysetRead":100,"keysetMs":0.023},{"offset":10000,"offsetRead":10100,"offsetMs":0.574,"keysetRead":100,"keysetMs":0.023},{"offset":100000,"offsetRead":100100,"offsetMs":5.314,"keysetRead":100,"keysetMs":0.024},{"offset":500000,"offsetRead":500100,"offsetMs":26.846,"keysetRead":100,"keysetMs":0.028},{"offset":900000,"offsetRead":900100,"offsetMs":48.869,"keysetRead":100,"keysetMs":0.026}]

all checks pass
```

Later runs on the same machine land within the band the script allows
(page 1,001: 5.2 to 5.7 ms OFFSET across 27 and 28 Oct, 0.024 to 0.033 ms keyset; slower while Blender was rendering). The read
counts are the same every run.
