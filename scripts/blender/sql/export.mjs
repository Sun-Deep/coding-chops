#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the SQL reel's rows and steps for Blender: every order, whether it
// is paid, which customer's pile it goes to and where in it, whether that
// pile survives HAVING, its total and its rank. All from the reel's own
// data module, the same rows the measurement loads into Postgres.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/sql/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import { DURATION, STAGES } from "../../../src/vertical/44-sql-order/beats.ts";
import { orders, steps } from "../../../src/vertical/44-sql-order/data.ts";

const rows = orders();
const s = steps(rows);
const piles = [...s.groupOf.keys()].sort();
const rank = new Map(s.ordered.map((r, i) => [r.customer, i]));
const totals = new Map(s.ordered.map((r) => [r.customer, r.total]));
const slot = new Map();
const cards = rows.map((o) => {
  const paid = o.status === "paid";
  const pile = paid ? piles.indexOf(o.customer) : -1;
  const k = paid ? (slot.get(o.customer) ?? 0) : -1;
  if (paid) slot.set(o.customer, k + 1);
  const r = paid && rank.has(o.customer) ? rank.get(o.customer) : -1;
  return {
    id: o.id,
    paid,
    pile,
    slot: k,
    size: paid ? s.groupOf.get(o.customer).length : 0,
    keeps: r >= 0,
    rep: paid && k === 0 && r >= 0,
    rank: r,
    total: r >= 0 ? totals.get(o.customer) : 0,
  };
});
const out = process.argv[2];
writeFileSync(
  out,
  JSON.stringify({
    duration: DURATION,
    stages: Object.fromEntries(STAGES.map((x) => [x.clause, x.at])),
    piles: piles.length,
    maxTotal: s.ordered[0].total,
    kept: s.limit.length,
    cards,
  }),
);
console.log(`wrote ${out}`);
