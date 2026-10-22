# Learning notes

## The order

FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. Postgres first
needs the rows (FROM), throws away the ones that fail the row test
(WHERE), sorts the rest into groups (GROUP BY), throws away the groups
that fail the group test (HAVING), works out the output columns for each
group (SELECT), sorts those (ORDER BY) and stops after the first few
(LIMIT).

## Why the alias fails in WHERE

`sum(amount) AS total` is worked out at SELECT, step 5. WHERE is step 2,
so when it runs there is no `total` yet: the error is "column does not
exist", which is literally true at that moment. ORDER BY is step 6, after
SELECT, so the name exists and the sort can use it. To filter on the
total, use HAVING with the expression (`HAVING sum(amount) > 500`), or
wrap the query and filter outside it.

## WHERE and HAVING

WHERE tests one row at a time, before grouping, so it cannot use count(\*)
or sum(): there is no group to count yet. HAVING tests a whole group, so
it can.

## In the plan

EXPLAIN ANALYZE shows the same order inside out: the Seq Scan with the
WHERE filter at the bottom, the HashAggregate with the HAVING filter above
it, then Sort, then Limit. "Rows Removed by Filter" gives the counts the
reel shows: 374 rows removed by WHERE, 69 groups by HAVING.

## The exception

Postgres lets GROUP BY name a SELECT alias, a convenience beyond the SQL
standard. It does not change the order; the reel avoids it so the rule
stays simple.
