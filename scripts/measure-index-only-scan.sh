#!/usr/bin/env bash
# Reproduce the measurements behind the index-only scan reel.
#
# Usage: scripts/measure-index-only-scan.sh
#        ROWS=1000000 scripts/measure-index-only-scan.sh   # faster pilot run
#
# Builds a ten million row table in a scratch database, then asks the same
# aggregate three ways: with no index, with a plain index on the key, and with a
# covering index that carries the aggregated column. Measures each against two
# physical layouts, one where the matching rows are scattered through the heap
# and one where they are contiguous, because that correlation is what decides
# whether a covering index is worth anything.
#
# Then it breaks the thing on purpose: an update burst leaves the visibility map
# stale, and the index-only scan starts fetching from the heap again.
#
# Every number in `src/vertical/05-index-only-scan/measurements.ts` comes from
# this script. Output is recorded in
# `curriculum/vertical/05-index-only-scan/measurements.md` along with the
# machine it ran on, because timings are hardware dependent and page counts are
# not.
#
# Needs a running PostgreSQL 11 or later (INCLUDE) that the current user can
# create a database in. Nothing is tuned: the point is what a developer gets on
# a laptop.

set -euo pipefail

DB=cc_ios_demo
ROWS="${ROWS:-10000000}"
BUCKETS=100
KEY=42

command -v psql >/dev/null || {
  echo "psql not on PATH. On homebrew: export PATH=\"\$(brew --prefix postgresql@15)/bin:\$PATH\"" >&2
  exit 1
}

trap 'dropdb --if-exists "$DB"' EXIT

dropdb --if-exists "$DB"
createdb "$DB"
q() { psql -d "$DB" -v ON_ERROR_STOP=1 "$@"; }

# Three runs of one EXPLAIN, so a cold first run is visible rather than averaged
# away.
explain3() {
  for _ in 1 2 3; do
    q -c "EXPLAIN (ANALYZE, BUFFERS, COSTS OFF) $1"
  done
}

echo "== machine =="
q -tAc "SELECT version();"
q -tAc "SELECT name || ' = ' || setting FROM pg_settings
        WHERE name IN ('shared_buffers','work_mem','max_parallel_workers_per_gather');"

echo
echo "== building $ROWS rows =="
# cust_id is hashed, so one customer's rows land all over the heap. day_id is
# the row number divided into buckets, so one day's rows are contiguous. Both
# have exactly the same number of distinct values and the same rows per value.
# The only difference between them is physical order, which is the variable.
q -q <<SQL
CREATE TABLE events (
  id      bigint,
  cust_id int,
  day_id  int,
  amount  int,
  note    text
);
INSERT INTO events
SELECT g,
       1 + abs(hashtext(g::text)) % $BUCKETS,
       1 + (g - 1) / ($ROWS / $BUCKETS),
       ((g::bigint * 7919) % 100000)::int,
       'row padding to a realistic width, forty or so bytes'
FROM generate_series(1, $ROWS) g;
VACUUM ANALYZE events;
SQL
q -c "SELECT pg_size_pretty(pg_relation_size('events')) AS heap,
             (SELECT relpages FROM pg_class WHERE relname = 'events') AS heap_pages,
             count(*) AS rows
      FROM events;"

echo
echo "== rows per value, and how scattered each key is =="
# correlation near 1 means the column is stored in order, near 0 means scattered.
q -c "SELECT attname, n_distinct, correlation
      FROM pg_stats WHERE tablename = 'events' AND attname IN ('cust_id','day_id');"
q -c "SELECT (SELECT count(*) FROM events WHERE cust_id = $KEY) AS cust_rows,
             (SELECT count(*) FROM events WHERE day_id  = $KEY) AS day_rows;"

for KIND in cust day; do
  COL="${KIND}_id"
  echo
  echo "############################################################"
  echo "## $COL"
  echo "############################################################"

  echo
  echo "== no index at all =="
  explain3 "SELECT sum(amount) FROM events WHERE $COL = $KEY;"

  echo
  echo "== plain index on ($COL) =="
  q -c "\timing on" -c "CREATE INDEX ev_${KIND}_plain ON events ($COL);"
  q -q -c "VACUUM ANALYZE events;"
  explain3 "SELECT sum(amount) FROM events WHERE $COL = $KEY;"

  echo
  echo "== covering index on ($COL) INCLUDE (amount) =="
  q -q -c "DROP INDEX ev_${KIND}_plain;"
  q -c "\timing on" -c "CREATE INDEX ev_${KIND}_cover ON events ($COL) INCLUDE (amount);"
  q -q -c "VACUUM ANALYZE events;"
  explain3 "SELECT sum(amount) FROM events WHERE $COL = $KEY;"

  echo
  echo "== what the two indexes cost on disk =="
  q -q -c "CREATE INDEX ev_${KIND}_plain ON events ($COL);"
  q -c "SELECT pg_size_pretty(pg_relation_size('ev_${KIND}_plain')) AS plain,
               pg_size_pretty(pg_relation_size('ev_${KIND}_cover')) AS covering,
               (SELECT relpages FROM pg_class WHERE relname='ev_${KIND}_plain') AS plain_pages,
               (SELECT relpages FROM pg_class WHERE relname='ev_${KIND}_cover') AS covering_pages;"
  q -q -c "DROP INDEX ev_${KIND}_plain;"
done

echo
echo "############################################################"
echo "## the catch: the visibility map goes stale"
echo "############################################################"
echo
echo "== update 1 percent of the table, no vacuum =="
q -q -c "UPDATE events SET amount = amount + 1 WHERE id % 100 = 0;"
q -q -c "ANALYZE events;"   # stats only. deliberately no VACUUM.
explain3 "SELECT sum(amount) FROM events WHERE cust_id = $KEY;"

echo
echo "== after VACUUM =="
q -q -c "VACUUM events;"
explain3 "SELECT sum(amount) FROM events WHERE cust_id = $KEY;"

echo
echo "done. dropping $DB"
