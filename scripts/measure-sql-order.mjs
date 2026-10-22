#!/usr/bin/env node
/* global console, process */

// The order Postgres runs a query in, measured on real rows.
//
// Starts a throwaway Postgres cluster in a temp directory, loads the 1,000
// seeded orders from src/vertical/44-sql-order/data.ts, and runs the reel's
// query under EXPLAIN ANALYZE, which reports how many rows come out of
// every step. Then the same query for real, and the two mistakes the order
// explains: a SELECT alias used in WHERE, and the same alias in ORDER BY.
//
// Every count is checked three ways: from the plan, from separate count
// queries, and from data.ts worked through by hand, which is what the
// Blender scene draws. The script exits 1 if any of them disagree, or if
// src/vertical/44-sql-order/measurements.ts does not match this run.
//
// Needs PostgreSQL 15 (PG_BIN, default the Homebrew postgresql@15 path).
// Nothing is timed.
//
// Usage: node --experimental-strip-types scripts/measure-sql-order.mjs

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { QUERY, orders, steps } from "../src/vertical/44-sql-order/data.ts";

const BIN = process.env.PG_BIN ?? "/opt/homebrew/opt/postgresql@15/bin";
const PORT = "5544";
const work = mkdtempSync(join(tmpdir(), "sqlorder-"));
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
/** Runs SQL that should fail and returns what psql printed to stderr. */
const failing = (text) => {
  const r = spawnSync(
    join(BIN, "psql"),
    [...psqlArgs, "-X", "-v", "ON_ERROR_STOP=1"],
    {
      env,
      input: text,
      encoding: "utf8",
    },
  );
  return { status: r.status, stderr: r.stderr.trim() };
};

const lines = [];
const say = (s = "") => {
  lines.push(s);
  console.log(s);
};
let ok = true;
const check = (what, a, b) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    say(
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

  const rows = orders();
  const csv = rows
    .map(
      (o) => `${o.id},${o.customer},${o.status},${(o.amount / 100).toFixed(2)}`,
    )
    .join("\n");
  sql(`CREATE TABLE orders (
  id       int PRIMARY KEY,
  customer text NOT NULL,
  status   text NOT NULL,
  amount   numeric(8,2) NOT NULL
);`);
  run(
    "psql",
    [...psqlArgs, "-X", "-c", "\\copy orders FROM STDIN WITH (FORMAT csv)"],
    csv + "\n",
  );
  sql("ANALYZE orders;");

  say("== versions");
  say(sql("SELECT version();", ["-tA"]).trim());
  say();
  say("== the table");
  say(
    sql(
      "SELECT count(*) AS orders, count(DISTINCT customer) AS customers FROM orders;",
    ).trimEnd(),
  );

  const query = QUERY.join("\n");
  say();
  say("== the query, as written");
  for (const l of QUERY) say(l);

  say();
  say("== EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF)");
  const text = sql(
    `EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF) ${query}`,
    ["-tA"],
  );
  for (const l of text.trimEnd().split("\n")) say(l);
  const plan = JSON.parse(
    sql(
      `EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF, FORMAT JSON) ${query}`,
      ["-tA"],
    ),
  )[0].Plan;

  // Walk the plan from the top: Limit, Sort, Aggregate, Seq Scan. The
  // deepest node runs first, so this is the run order read backwards.
  const chain = [];
  for (let n = plan; n; n = n.Plans?.[0]) chain.push(n);
  const kinds = chain.map((n) => n["Node Type"]);
  say();
  say(`== plan nodes, top to bottom: ${kinds.join(" <- ")}`);
  check("plan shape", kinds, ["Limit", "Sort", "Aggregate", "Seq Scan"]);
  const [limit, , agg, scan] = chain;
  const measured = {
    from: scan["Actual Rows"] + scan["Rows Removed by Filter"],
    where: scan["Actual Rows"],
    groups: agg["Actual Rows"] + agg["Rows Removed by Filter"],
    having: agg["Actual Rows"],
    limit: limit["Actual Rows"],
  };
  say(`scan filter: ${scan.Filter}`);
  say(`aggregate filter: ${agg.Filter}`);
  say(`rows: ${JSON.stringify(measured)}`);

  // The same counts asked for directly.
  const direct = JSON.parse(
    sql(
      `SELECT json_build_object(
  'from', (SELECT count(*) FROM orders),
  'where', (SELECT count(*) FROM orders WHERE status = 'paid'),
  'groups', (SELECT count(DISTINCT customer) FROM orders WHERE status = 'paid'),
  'having', (SELECT count(*) FROM (SELECT 1 FROM orders WHERE status = 'paid'
             GROUP BY customer HAVING count(*) >= 8) g),
  'limit', 5);`,
      ["-tA"],
    ),
  );
  check("plan against direct counts", measured, direct);

  say();
  say("== the query, run");
  const out = sql(query).trimEnd();
  for (const l of out.split("\n")) say(l);
  const result = sql(query, ["-tA", "-F", ","])
    .trim()
    .split("\n")
    .map((l) => {
      const [customer, total] = l.split(",");
      return { customer, total: Math.round(Number(total) * 100) };
    });

  // The same thing by hand, which is what the scene draws.
  const hand = steps(rows);
  check(
    "data.ts against Postgres",
    {
      from: hand.from,
      where: hand.where,
      groups: hand.groups,
      having: hand.having,
      limit: hand.limit.length,
    },
    measured,
  );
  check(
    "top five against data.ts",
    hand.limit.map(({ customer, total }) => ({ customer, total })),
    result,
  );

  // The two lines the order explains.
  const inWhere = `SELECT customer, sum(amount) AS total
FROM orders
WHERE total > 500
GROUP BY customer;`;
  const inOrder = `SELECT customer, sum(amount) AS total
FROM orders
GROUP BY customer
ORDER BY total DESC
LIMIT 1;`;
  say();
  say("== the alias in WHERE");
  for (const l of inWhere.split("\n")) say(l);
  const bad = failing(inWhere);
  say(bad.stderr);
  const error = bad.stderr.split("\n")[0];
  say();
  say("== the alias in ORDER BY");
  for (const l of inOrder.split("\n")) say(l);
  const good = sql(inOrder).trimEnd();
  say(good);

  const runResult = {
    ...measured,
    top: result,
    errorInWhere: error,
    orderByRows: Number(good.match(/\((\d+) rows?\)/)[1]),
  };
  const { RUN } = await import("../src/vertical/44-sql-order/measurements.ts");
  say();
  check("measurements.ts against this run", RUN, runResult);
  if (bad.status === 0) {
    say("== MISMATCH: the alias in WHERE did not fail");
    ok = false;
  }
  say(
    ok
      ? "== measurements.ts matches this run"
      : `== run: ${JSON.stringify(runResult)}`,
  );
  if (!ok) process.exitCode = 1;
} finally {
  spawnSync(join(BIN, "pg_ctl"), ["-D", data, "-m", "fast", "-w", "stop"], {
    env,
    stdio: "ignore",
  });
  rmSync(work, { recursive: true, force: true });
}
