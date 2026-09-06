#!/usr/bin/env bash
# Reproduce the measurements behind the database index reel.
#
# Usage: scripts/measure-database-index.sh
#
# Builds a ten million row table in a scratch database, measures the same query
# with and without an index, reads the shape of the b-tree out of pageinspect,
# times inserts against zero, one and three indexes, and drops the database.
#
# Every number in `src/vertical/01-database-index/measurements.ts` comes from
# this script. Output is recorded in
# `curriculum/vertical/01-database-index/measurements.md` along with the machine
# it was run on, because the timings are hardware dependent and the page counts
# are not.
#
# Needs a running PostgreSQL 15 or later that the current user can create a
# database in. Nothing is tuned: the point is what a developer gets on a laptop.

set -euo pipefail

DB=cc_index_demo
KEY=8675309

command -v psql >/dev/null || {
  echo "psql not on PATH. On homebrew: export PATH=\"\$(brew --prefix postgresql@15)/bin:\$PATH\"" >&2
  exit 1
}

trap 'dropdb --if-exists "$DB"' EXIT

dropdb --if-exists "$DB"
createdb "$DB"
q() { psql -d "$DB" -v ON_ERROR_STOP=1 "$@"; }

echo "== machine =="
q -tAc "SELECT version();"

echo
echo "== building 10,000,000 rows =="
q -q <<'SQL'
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
SQL
q -c "SELECT pg_size_pretty(pg_total_relation_size('events')) AS heap, count(*) FROM events;"

echo
echo "== without an index, three runs =="
for _ in 1 2 3; do
  q -c "EXPLAIN (ANALYZE, BUFFERS, COSTS OFF) SELECT amount FROM events WHERE user_id = $KEY;"
done

echo
echo "== creating the index =="
q -c "\timing on" -c "CREATE INDEX events_user_id_idx ON events (user_id);"
q -q -c "ANALYZE events;"
q -c "SELECT pg_size_pretty(pg_relation_size('events')) AS heap,
             pg_size_pretty(pg_relation_size('events_user_id_idx')) AS index;"

echo
echo "== with an index, three runs =="
for _ in 1 2 3; do
  q -c "EXPLAIN (ANALYZE, BUFFERS, COSTS OFF) SELECT amount FROM events WHERE user_id = $KEY;"
done

echo
echo "== the shape of the tree =="
q -q -c "CREATE EXTENSION IF NOT EXISTS pageinspect;"
q -c "SELECT root, level AS root_level, level + 1 AS pages_to_a_leaf
      FROM bt_metap('events_user_id_idx');"
q -c "SELECT relpages AS index_pages FROM pg_class WHERE relname = 'events_user_id_idx';"
q -c "SELECT type, count(*) AS pages, round(avg(live_items)) AS avg_entries
      FROM (SELECT (bt_page_stats('events_user_id_idx', g)).*
            FROM generate_series(1, 400) g) s
      GROUP BY type ORDER BY type;"

echo
echo "== 500,000 inserts against 0, 1 and 3 indexes =="
for n in 0 1 3; do
  q -q -c "DROP TABLE IF EXISTS w;" \
       -c "CREATE TABLE w (id bigint, a bigint, b bigint, c bigint);"
  [ "$n" -ge 1 ] && q -q -c "CREATE INDEX w_a ON w(a);"
  [ "$n" -ge 3 ] && q -q -c "CREATE INDEX w_b ON w(b);" -c "CREATE INDEX w_c ON w(c);"
  printf "  indexes=%d  " "$n"
  q -t -c "\timing on" \
       -c "INSERT INTO w SELECT g, random()*1e9, random()*1e9, random()*1e9
           FROM generate_series(1, 500000) g;" | tail -2 | tr -d '\n'
  echo
done

echo
echo "done. dropping $DB"
