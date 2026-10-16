#!/usr/bin/env node --experimental-strip-types --no-warnings

// Getting off a plane. Everyone stands up when the seatbelt sign goes off,
// or everyone stays seated until the row in front of them moves. Who gets
// off sooner, and at what cost?
//
// The model is imported from the reel's own module,
// src/vertical/36-deplane/simulation.ts. Seeded, so the machine cannot move
// a figure.
//
// Printed: the passenger the reel follows, then 100 flights at the defaults
// and at each other setting. How long the door takes to open, how many
// people have bags and how long a bag takes are assumptions the model cannot
// take from data, so the result has to be read across them.
//
// Usage: node --experimental-strip-types scripts/measure-deplane.mjs

import {
  BAG_MAX,
  BAG_MIN,
  BAG_SHARE,
  DOOR,
  ROWS,
  SEED,
  SEEDS,
  STAND_UP,
  STEP_OUT,
  averages,
  depthOf,
  hero,
  onFeet,
  passengers,
  run,
} from "../src/vertical/36-deplane/simulation.ts";

const mmss = (s) => {
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};
const seat = (p) => `${p.row + 1}${"ABCDEF"[p.col]}`;

console.log(
  `${ROWS} rows of six, one aisle, door ${DOOR} s after the seatbelt sign goes off; ${Math.round(BAG_SHARE * 100)}% have a bag, ${BAG_MIN} to ${BAG_MAX} s to get it down; ${STAND_UP} s to stand up, ${STEP_OUT.join("/")} s to step out from aisle/middle/window; one row a second in the aisle\n`,
);

const base = averages();
const stand = run("stand", SEED);
const sit = run("sit", SEED);
const ps = passengers(SEED);
const you = hero(stand, sit, base.gain);
console.log(
  `seed ${SEED}. The passenger the reel follows: #${you}, seat ${seat(ps[you])}, ${ps[you].bag ? `a bag, ${ps[you].bagTime} s` : "no bag"}; in the row whose time saved by standing is closest to the ${SEEDS}-flight average of ${base.gain.toFixed(1)} s, left aisle seat`,
);
for (const [rule, tr] of [
  ["stand", stand],
  ["sit", sit],
]) {
  const x = tr[you];
  console.log(
    `  ${rule.padEnd(5)} up at ${mmss(x.up)}, into the aisle at ${mmss(x.enter)}, off at ${mmss(x.off)}, on their feet ${mmss(onFeet(x))}`,
  );
}
console.log(
  `  time saved by row: ${Array.from({ length: ROWS }, (_, r) => {
    let g = 0;
    for (let c = 0; c < 6; c++) g += sit[r * 6 + c].off - stand[r * 6 + c].off;
    return `${r + 1}: ${(g / 6).toFixed(0)} s`;
  }).join(", ")}`,
);
console.log(
  `  seed ${SEED} cabin empty: stand ${mmss(Math.max(...stand.map((x) => x.off)))}, sit ${mmss(Math.max(...sit.map((x) => x.off)))}`,
);

const line = (label, opts = {}) => {
  const a = averages(opts);
  return `${label.padEnd(30)} off ${mmss(a.off.stand)} vs ${mmss(a.off.sit)} (stand sooner by ${a.gain.toFixed(1)} s, for ${(a.sooner * 100).toFixed(1)}% of people); on feet ${mmss(a.feet.stand)} vs ${mmss(a.feet.sit)}; cabin empty ${mmss(a.last.stand)} vs ${mmss(a.last.sit)}`;
};
console.log(`\n${SEEDS} flights each, stand vs sit`);
console.log(line("defaults"));
console.log(line("sitters stand on first move", { wake: "moving" }));
for (const door of [30, 60, 150])
  console.log(line(`door at ${door} s`, { door }));
for (const bagShare of [0.4, 1])
  console.log(line(`${bagShare * 100}% with bags`, { bagShare }));
console.log(line("bags up to 30 s", { bagMax: 30 }));
for (const rows of [24, 30]) {
  console.log(line(`${rows} rows`, { rows }));
  console.log(line(`${rows} rows, first move`, { rows, wake: "moving" }));
}
void depthOf;
