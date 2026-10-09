#!/usr/bin/env node --experimental-strip-types --no-warnings

// Two people meet head on in a corridor and both step the same way, again
// and again. React at once every time, or wait a random moment after a bump,
// the way Ethernet and Wi-Fi do after a collision?
//
// The model is imported from the reel's own module,
// src/vertical/30-hallway/simulation.ts. Seeded, so the machine cannot move a
// figure.
//
// Printed: the corridor the reel shows, what the random wait does for the
// same pairs who would dance, then 20,000 encounters at the defaults and at
// each other setting, because the one number the model cannot take from real
// data is how much two people's reaction times differ, and the result has to
// hold across it.
//
// Usage: node --experimental-strip-types scripts/measure-hallway.mjs

import {
  BACKOFF,
  KEEP_RIGHT,
  REACT,
  SEED,
  SPREAD,
  STEP,
  WINDOW,
  corridor,
  encounter,
  firstBump,
  stream,
  tally,
} from "../src/vertical/30-hallway/simulation.ts";

console.log(
  `reaction ${REACT} s, spread ${SPREAD} s, window ${WINDOW} s, backoff up to ${BACKOFF} s, step ${STEP} s, ${KEEP_RIGHT * 100}% step to their own right first\n`,
);

console.log(
  `seed ${SEED}, the corridor the reel shows: the same people in both, from encounter ${firstBump(SEED)}, the first whose first step is a bump`,
);
for (const rule of ["instant", "random"]) {
  const run = corridor(rule, SEED, 16);
  console.log(
    `  ${rule.padEnd(7)} ${run.map((e) => `#${e.index} ${e.dodges} dodges ${e.seconds.toFixed(1)} s`).join(", ")}; people past by 14 s ${tally(run, 14).passed}`,
  );
}

let n = 0;
let atOnce = 0;
let withWait = 0;
let stopped = 0;
for (let i = 0; i < 20000; i++) {
  const a = encounter("instant", i, 1);
  if (a.dodges < 3) continue;
  const b = encounter("random", i, 1);
  n++;
  atOnce += a.dodges;
  withWait += b.dodges;
  if (b.dodges < 3) stopped++;
}
console.log(
  `\nof 20,000 pairs, ${n} dance 3+ times stepping at once (${(atOnce / n).toFixed(2)} dodges on average); the same people waiting a random beat after a bump average ${(withWait / n).toFixed(2)}, and ${((stopped / n) * 100).toFixed(0)}% get past in under 3`,
);

const stats = (rule, opts) => {
  const e = stream(rule, 1, 20000, opts);
  const mean = (f) => e.reduce((a, x) => a + f(x), 0) / e.length;
  return {
    dodges: mean((x) => x.dodges),
    seconds: mean((x) => x.seconds),
    long: e.filter((x) => x.dodges >= 3).length / e.length,
  };
};
const line = (label, opts = {}) => {
  const a = stats("instant", opts);
  const b = stats("random", opts);
  return `${label.padEnd(30)} dodges per pair ${a.dodges.toFixed(2)} -> ${b.dodges.toFixed(2)}; 3+ dodges ${(a.long * 100).toFixed(1)}% -> ${(b.long * 100).toFixed(1)}%; seconds to pass ${a.seconds.toFixed(2)} -> ${b.seconds.toFixed(2)}`;
};

console.log(
  "\n20,000 encounters each, react at once -> random wait after a bump",
);
console.log(line("defaults"));
for (const spread of [0.05, 0.08, 0.12, 0.16])
  console.log(line(`reaction spread ${spread} s`, { spread }));
for (const window of [0.08, 0.16, 0.2])
  console.log(line(`window ${window} s`, { window }));
for (const backoff of [0.4, 1.2])
  console.log(line(`backoff up to ${backoff} s`, { backoff }));
for (const keepRight of [0.8, 1])
  console.log(line(`${keepRight * 100}% keep right`, { keepRight }));
