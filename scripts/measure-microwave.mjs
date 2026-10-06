#!/usr/bin/env node --experimental-strip-types --no-warnings

// One office microwave and a lunchtime line. Who should go next: whoever got
// there first, or whoever has the shortest heating time?
//
// The model is imported from the reel's own module,
// src/vertical/28-microwave/simulation.ts. Whole seconds and a seeded
// generator, so the machine cannot move a figure.
//
// Printed: the line the reel shows, then 1,000 lines of eight people already
// waiting, then 1,000 runs each where 20 people arrive over time, so the
// claim holds when people keep turning up and not only for one line.
//
// Usage: node --experimental-strip-types scripts/measure-microwave.mjs

import {
  HANDLE,
  MENU,
  SEED,
  crowd,
  longestJobWait,
  meanWait,
  serve,
} from "../src/vertical/28-microwave/simulation.ts";

const clock = (s) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const pct = (x) => `${(x * 100).toFixed(0)}%`;
const q = (xs, p) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length * p)];

console.log(
  `menu ${MENU.map((m) => `${clock(m.seconds)} x${m.weight}`).join(", ")}; ${HANDLE} s to swap dishes\n`,
);

const line = crowd(SEED);
console.log(`seed ${SEED}, the line the reel shows, in the order they arrived`);
console.log(`  heating times ${line.map((p) => clock(p.cook)).join(", ")}`);
for (const rule of ["fifo", "sjf"]) {
  const s = serve(line, rule);
  console.log(
    `  ${rule.padEnd(4)} order ${s.map((p) => clock(p.cook)).join(", ")}`,
  );
  console.log(
    `       waits ${s.map((p) => clock(p.wait)).join(", ")}; average ${clock(meanWait(s))}; longest job waited ${clock(longestJobWait(s))}; last done at ${clock(s[s.length - 1].end)}`,
  );
}
const a = meanWait(serve(line, "fifo"));
const b = meanWait(serve(line, "sjf"));
console.log(`  shortest first cuts the average wait by ${pct(1 - b / a)}`);

const batch = (people) => {
  let lower = 0;
  let longer = 0;
  const cuts = [];
  for (let seed = 1; seed <= 1000; seed++) {
    const c = crowd(seed, { people });
    const f = serve(c, "fifo");
    const s = serve(c, "sjf");
    if (meanWait(s) < meanWait(f)) lower++;
    if (longestJobWait(s) > longestJobWait(f)) longer++;
    cuts.push(1 - meanWait(s) / meanWait(f));
  }
  return { lower, longer, cuts };
};

console.log("\n1,000 lines already waiting, five to twelve people");
for (const people of [5, 8, 12]) {
  const r = batch(people);
  console.log(
    `  ${String(people).padStart(2)} people: shortest first lower average in ${r.lower} of 1000, median cut ${pct(q(r.cuts, 0.5))} (${pct(q(r.cuts, 0.1))} to ${pct(q(r.cuts, 0.9))}, 10th to 90th); the longest job waited longer in ${r.longer}`,
  );
}

console.log("\n1,000 runs of 20 people arriving over time");
for (const gap of [30, 60, 90]) {
  let lower = 0;
  const cuts = [];
  const worst = { fifo: [], sjf: [] };
  for (let seed = 1; seed <= 1000; seed++) {
    const c = crowd(seed, { people: 20, gap });
    const f = serve(c, "fifo");
    const s = serve(c, "sjf");
    if (meanWait(s) < meanWait(f)) lower++;
    cuts.push(1 - meanWait(s) / meanWait(f));
    worst.fifo.push(Math.max(...f.map((p) => p.wait)));
    worst.sjf.push(Math.max(...s.map((p) => p.wait)));
  }
  console.log(
    `  someone every ${gap} s on average: shortest first lower average in ${lower} of 1000, median cut ${pct(q(cuts, 0.5))}; median longest single wait ${clock(q(worst.fifo, 0.5))} first come, ${clock(q(worst.sjf, 0.5))} shortest first`,
  );
}
