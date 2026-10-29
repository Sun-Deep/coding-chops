#!/usr/bin/env node
/* global console, process */

// What OFFSET costs, measured on real Postgres.
//
// Starts a throwaway Postgres cluster in a temp directory and loads
// 1,000,000 orders, ids 1 to 1,000,000, with the id as the primary key.
// A page is 100 orders. For each page the reel shows, two queries that
// return the same 100 rows:
//
//   OFFSET   SELECT ... ORDER BY id LIMIT 100 OFFSET n
//   keyset   SELECT ... WHERE id > n ORDER BY id LIMIT 100
//
// (n is the last id of the page before, which is what an app remembers
// for the keyset version.) EXPLAIN ANALYZE says how many rows the index
// scan under each one read; each query is also run RUNS times after a
// warm-up, and the median execution time is kept.
//
// Checks that both return the same ids, that OFFSET read n + 100 rows and
// keyset read 100, and that src/vertical/52-sql-offset/measurements.ts
// matches the row counts of this run and its times to within the band in
// that file. Exits 1 on any mismatch.
//
// Needs PostgreSQL 15 (PG_BIN, default the Homebrew postgresql@15 path).
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/measure-sql-offset.mjs

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  PAGE,
  RUN,
  TABLE_ROWS,
} from "../src/vertical/52-sql-offset/measurements.ts";
import {
  keysetLines,
  offsetLines,
} from "../src/vertical/52-sql-offset/snippets.ts";

const BIN = process.env.PG_BIN ?? "/opt/homebrew/opt/postgresql@15/bin";
const PORT = "5552";
const RUNS = 51;
const OFFSETS = [0, 1000, 10000, 100000, 500000, 900000];
const work = mkdtempSync(join(tmpdir(), "sqloffset-"));
const data = join(work, "data");
const env = { ...process.env, LC_ALL: "C", PGTZ: "UTC" };

const run = (cmd, args, input) =>
  execFileSync(join(BIN, cmd), args, {
    env,
    input,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
const psqlArgs = ["-h", work, "-p", PORT, "-U", "postgres", "-d", "shop"];
const sql = (text, extra = []) =>
  run("psql", [...psqlArgs, "-X", "-v", "ON_ERROR_STOP=1", ...extra], text);

const offsetQuery = (n) => offsetLines(n).join(" ");
const keysetQuery = (n) => keysetLines(n).join(" ");

/** The plan's index scan: rows it read, and the execution time. */
const explain = (q) => {
  const out = JSON.parse(
    sql(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${q}`, ["-tA"]),
  )[0];
  let n = out.Plan;
  while (n.Plans) n = n.Plans[0];
  return {
    node: n["Node Type"],
    read: n["Actual Rows"],
    ms: out["Execution Time"],
  };
};
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const timed = (q) => {
  explain(q);
  return median(Array.from({ length: RUNS }, () => explain(q).ms));
};
const ids = (q) =>
  sql(`SELECT string_agg(id::text, ',') FROM (${q}) p;`, ["-tA"]).trim();

let ok = true;
const check = (what, a, b) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    console.log(
      `== MISMATCH ${what}: ${JSON.stringify(a)} against ${JSON.stringify(b)}`,
    );
    ok = false;
  }
};

try {
  run("initdb", [
    "-D",
    data,
    "-U",
    "postgres",
    "-A",
    "trust",
    "-E",
    "UTF8",
    "--no-locale",
  ]);
  run("pg_ctl", [
    "-D",
    data,
    "-w",
    "-l",
    join(work, "log"),
    "-o",
    `-k ${work} -p ${PORT} -c listen_addresses=''`,
    "start",
  ]);
  run("createdb", ["-h", work, "-p", PORT, "-U", "postgres", "shop"]);
  sql(`CREATE TABLE orders (
  id       bigint PRIMARY KEY,
  customer text NOT NULL,
  amount   numeric(8,2) NOT NULL
);
INSERT INTO orders
SELECT i, 'customer ' || (i % 5000), ((i::bigint * 7919) % 50000) / 100.0
FROM generate_series(1, ${TABLE_ROWS}) AS i;
VACUUM ANALYZE orders;`);

  console.log("== versions");
  console.log(sql("SELECT version();", ["-tA"]).trim());
  console.log(
    `\n== ${sql("SELECT count(*) FROM orders;", ["-tA"]).trim()} orders, ${PAGE} a page, median of ${RUNS} runs each\n`,
  );
  console.log("offset   | OFFSET reads | OFFSET ms | keyset reads | keyset ms");

  const rows = [];
  for (const n of OFFSETS) {
    const a = explain(offsetQuery(n));
    const b = explain(keysetQuery(n));
    check(`same rows at ${n}`, ids(offsetQuery(n)), ids(keysetQuery(n)));
    check(`OFFSET reads at ${n}`, a.read, n + PAGE);
    check(`keyset reads at ${n}`, b.read, PAGE);
    const row = {
      offset: n,
      offsetRead: a.read,
      offsetMs: Number(timed(offsetQuery(n)).toFixed(3)),
      keysetRead: b.read,
      keysetMs: Number(timed(keysetQuery(n)).toFixed(3)),
    };
    rows.push(row);
    console.log(
      `${String(n).padEnd(8)} | ${String(row.offsetRead).padStart(12)} | ${row.offsetMs.toFixed(3).padStart(9)} | ${String(row.keysetRead).padStart(12)} | ${row.keysetMs.toFixed(3).padStart(9)}`,
    );
  }

  console.log("\n== the reel's page, OFFSET");
  console.log(
    sql(
      `EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF) ${offsetQuery(RUN.hero.offset)}`,
      ["-tA"],
    ).trimEnd(),
  );
  console.log("\n== the reel's page, keyset");
  console.log(
    sql(
      `EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF) ${keysetQuery(RUN.hero.offset)}`,
      ["-tA"],
    ).trimEnd(),
  );

  const hero = rows.find((r) => r.offset === RUN.hero.offset);
  check("hero OFFSET reads", hero.offsetRead, RUN.hero.offsetRead);
  check("hero keyset reads", hero.keysetRead, RUN.hero.keysetRead);
  for (const [what, got, want] of [
    ["hero OFFSET ms", hero.offsetMs, RUN.hero.offsetMs],
    ["hero keyset ms", hero.keysetMs, RUN.hero.keysetMs],
  ]) {
    if (Math.abs(got - want) > want * RUN.band)
      check(`${what} within ${RUN.band * 100}%`, got, want);
  }
  console.log(`\n${JSON.stringify(rows)}`);
} finally {
  try {
    run("pg_ctl", ["-D", data, "-m", "fast", "stop"]);
  } catch {
    // already stopped
  }
  rmSync(work, { recursive: true, force: true });
}
console.log(ok ? "\nall checks pass" : "\nchecks failed");
process.exit(ok ? 0 : 1);
