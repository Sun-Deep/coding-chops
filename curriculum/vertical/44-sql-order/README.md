# Vertical 44: the order SQL runs a query in

Status: built, not posted

## What it claims

A query is written SELECT first and run SELECT fifth. On a table of 1,000
orders, Postgres runs the reel's query as FROM (1,000 rows read), WHERE
(626 paid kept), GROUP BY (98 customers), HAVING (29 with 8 or more paid
orders), SELECT (one row each, with its total), ORDER BY, LIMIT (5 rows).
Every count is the plan's own, from EXPLAIN ANALYZE.

That order is why a column alias made in SELECT is not there yet in
WHERE (`ERROR:  column "total" does not exist`) and is there in ORDER BY.

## Why this topic

The second reel of the month plan, a list worth keeping for the audience
SQL joins reached (389K). It is drawn as a mailroom at eye level, parcels,
cubbies and coins, so it does not look like the field of glowing
objects git bisect and PHP2Shell use.

## Scope and honesty

The order is SQL's logical order of evaluation. A database is free to run
a plan in any order that gives the same answer, and for this query
Postgres's plan nests in exactly this order: Limit over Sort over the
aggregate (with HAVING as its filter) over the scan (with WHERE as its
filter). The script checks that shape and fails if it changes.

Postgres goes beyond the standard in one place: GROUP BY may name a
SELECT alias. The reel does not show GROUP BY using one, so the order it
teaches holds as stated.

The rows are generated, seeded, and are the same rows in Postgres and in
the picture. Nothing is timed.

## Files

- `src/vertical/44-sql-order/`: the data, the overlays and the reel
- `scripts/measure-sql-order.mjs`: the committed run
- `scripts/blender/sql/`: the mailroom (`mailroom.py`) and the render
