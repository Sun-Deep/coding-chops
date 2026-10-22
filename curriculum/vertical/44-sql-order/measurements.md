# Measurements

Output of `node --experimental-strip-types scripts/measure-sql-order.mjs`,
run twice on 2026-10-22 with identical output. Apple M5 Pro, macOS 26.5.1,
PostgreSQL 15.13 in a throwaway cluster the script starts and removes.

Nothing is timed. The 1,000 rows come from the seeded generator in
`src/vertical/44-sql-order/data.ts`, so they are the same on every run.

```text
== versions
PostgreSQL 15.13 (Homebrew) on aarch64-apple-darwin24.4.0, compiled by Apple clang version 17.0.0 (clang-1700.0.13.3), 64-bit

== the table
 orders | customers
--------+-----------
   1000 |       100
(1 row)

== the query, as written
SELECT customer, sum(amount) AS total
FROM orders
WHERE status = 'paid'
GROUP BY customer
HAVING count(*) >= 8
ORDER BY total DESC
LIMIT 5;

== EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF)
Limit (actual rows=5 loops=1)
  ->  Sort (actual rows=5 loops=1)
        Sort Key: (sum(amount)) DESC
        Sort Method: top-N heapsort  Memory: 25kB
        ->  HashAggregate (actual rows=29 loops=1)
              Group Key: customer
              Filter: (count(*) >= 8)
              Batches: 1  Memory Usage: 80kB
              Rows Removed by Filter: 69
              ->  Seq Scan on orders (actual rows=626 loops=1)
                    Filter: (status = 'paid'::text)
                    Rows Removed by Filter: 374

== plan nodes, top to bottom: Limit <- Sort <- Aggregate <- Seq Scan
scan filter: (status = 'paid'::text)
aggregate filter: (count(*) >= 8)
rows: {"from":1000,"where":626,"groups":98,"having":29,"limit":5}

== the query, run
 customer |  total
----------+---------
 Uma      | 1928.24
 Kiran    | 1323.88
 Mina     | 1294.02
 Jade     | 1171.72
 Dara     | 1147.35
(5 rows)

== the alias in WHERE
SELECT customer, sum(amount) AS total
FROM orders
WHERE total > 500
GROUP BY customer;
ERROR:  column "total" does not exist
LINE 3: WHERE total > 500
              ^

== the alias in ORDER BY
SELECT customer, sum(amount) AS total
FROM orders
GROUP BY customer
ORDER BY total DESC
LIMIT 1;
 customer |  total
----------+---------
 Uma      | 2516.36
(1 row)

== measurements.ts matches this run
```
