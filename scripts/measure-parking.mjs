#!/usr/bin/env node --experimental-strip-types --no-warnings

// Two drivers reach the same car park at the same moment: one circles for a
// spot near the door, the other picks the row in front of the door and takes
// the open stall nearest the store. Who gets to the door first?
//
// The car park model is imported from the reel's own module,
// src/vertical/25-parking/parking.ts. One-second ticks and a seeded
// generator, so the machine cannot move a figure.
//
// Printed: the trip the reel shows, then 400 seeds at the default settings,
// then 400 seeds at each of eight other settings, so the claim is shown to
// hold across busy, quiet, full and empty car parks rather than in one.
//
// Usage: node --experimental-strip-types scripts/measure-parking.mjs
//   SEED=n   a trip other than the one shown
//   RANK=1   list seeds whose row time sits nearest the row median and whose
//            circle time sits nearest the circle 90th percentile: the trip a
//            one-in-ten circler has, beside an ordinary row parker

import {
  DEFAULTS,
  SEED as SHOWN,
  trip,
} from "../src/vertical/25-parking/parking.ts";

const SEEDS = 400;
const fmt = (s) => (Number.isFinite(s) ? `${s} s` : "did not park");
const q = (xs, p) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length * p)];
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

const compare = (settings) => {
  const row = [];
  const circle = [];
  let circleSlower = 0;
  for (let seed = 1; seed <= SEEDS; seed++) {
    const r = trip("row", seed, settings).seconds;
    const c = trip("circle", seed, settings).seconds;
    row.push(r);
    circle.push(c);
    if (c > r) circleSlower++;
  }
  return { row, circle, circleSlower };
};

const line = (label, r) =>
  `${label.padEnd(30)} row median ${q(r.row, 0.5)} s, 90th ${q(r.row, 0.9)} s | circle median ${q(r.circle, 0.5)} s, 90th ${Number.isFinite(q(r.circle, 0.9)) ? q(r.circle, 0.9) + " s" : "did not park"} | circling slower in ${r.circleSlower} of ${SEEDS}`;

const base = compare(DEFAULTS);

if (process.env.RANK) {
  const mr = q(base.row, 0.5);
  const mc = q(base.circle, 0.9);
  const rows = base.row
    .map((r, i) => ({ seed: i + 1, r, c: base.circle[i] }))
    .filter((x) => Number.isFinite(x.c))
    .map((x) => ({ ...x, d: Math.abs(x.r - mr) + Math.abs(x.c - mc) }))
    .sort((a, b) => a.d - b.d);
  console.log(`row median ${mr} s, circle 90th percentile ${mc} s`);
  for (const x of rows.slice(0, 10))
    console.log(`seed ${x.seed}  row ${x.r}  circle ${x.c}`);
  process.exit(0);
}

const SEED = Number(process.env.SEED ?? SHOWN);
console.log(`settings ${JSON.stringify(DEFAULTS)}\n`);
for (const d of ["row", "circle"]) {
  const tr = trip(d, SEED);
  console.log(
    `seed ${SEED} ${d.padEnd(7)} to the door ${fmt(tr.seconds)}, parked at ${tr.parkedAt} s, drove ${Math.round(tr.drivenMetres)} m, stall row ${tr.stall >= 0 ? tr.stall % 20 : "-"}`,
  );
}

console.log(`\n${SEEDS} seeds each`);
console.log(line("default", base));
console.log(
  `${"".padEnd(30)} row mean ${mean(base.row).toFixed(0)} s, circle mean ${Number.isFinite(mean(base.circle)) ? mean(base.circle).toFixed(0) + " s" : "unbounded (some never parked)"}`,
);
const variants = [
  ["circle accepts 10 rows", { near: 10 }],
  ["circle accepts 3 rows", { near: 3 }],
  ["cars stay 15 min", { dwell: 900 }],
  ["cars stay 60 min", { dwell: 3600 }],
  ["quiet: a car every 40 s", { gap: 40 }],
  ["busy: a car every 8 s", { gap: 8 }],
  ["emptier near the door", { fullNear: 0.85 }],
  ["fuller far from the door", { fullFar: 0.7 }],
];
for (const [label, v] of variants) {
  console.log(line(label, compare({ ...DEFAULTS, ...v })));
}
