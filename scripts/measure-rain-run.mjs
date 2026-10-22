#!/usr/bin/env node --experimental-strip-types --no-warnings

/* global console */

// Walk or run through the rain to the bus shelter: how many raindrops hit
// you each way, how many on your front and how many on your head and
// shoulders?
//
// The model is imported from the reel's own module,
// src/vertical/40-rain-run/simulation.ts. Two ways to count: the formula,
// and 1,000 seeded showers in which every drop is scattered through the air
// and tested against the moving body. The second checks the first.
//
// Printed: the defaults, then each assumption swept on its own. Rain rate
// and drop size are not known for any particular shower and body shapes
// differ, so the result has to hold across them.
//
// Usage: node --experimental-strip-types scripts/measure-rain-run.mjs

import {
  DEPTH,
  DROP,
  GAP,
  HEIGHT,
  RAIN,
  RUN,
  WALK,
  WIDTH,
  dropsPerCubicMetre,
  fallSpeed,
  showers,
  timeOut,
  trip,
} from "../src/vertical/40-rain-run/simulation.ts";

const n0 = (x) => Math.round(x).toLocaleString("en-US");
const f1 = (x) => x.toFixed(1);
const f2 = (x) => x.toFixed(2);
const pct = (x) => `${Math.round(x * 100)}%`;

console.log(
  `${RAIN} mm/h of ${DROP} mm drops falling at ${f2(fallSpeed(DROP))} m/s, ` +
    `${n0(dropsPerCubicMetre())} drops in each cubic metre of air. ${GAP} m of ` +
    `open sky between the awning and the shelter. You are a ${HEIGHT} x ` +
    `${WIDTH} x ${DEPTH} m box, walking at ${WALK} m/s or running at ${RUN} m/s.`,
);

const line = (label, opts = {}) => {
  const w = trip("walk", opts);
  const r = trip("run", opts);
  console.log(
    `${label.padEnd(22)} walk ${f1(timeOut("walk", opts))} s: ${n0(w.total)} ` +
      `(front ${n0(w.front)}, top ${n0(w.top)}). run ` +
      `${f1(timeOut("run", opts))} s: ${n0(r.total)} (front ${n0(r.front)}, ` +
      `top ${n0(r.top)}). running: ${pct(1 - r.total / w.total)} fewer, ` +
      `top ${f1(w.top / r.top)}x fewer`,
  );
};

console.log("\nDefaults, by the formula");
line("defaults");

console.log("\nDefaults, 1,000 showers counted drop by drop (seeds 1 to 1000)");
for (const gait of ["walk", "run"]) {
  const c = showers(gait, 1000);
  console.log(
    `${gait.padEnd(22)} mean ${f1(c.total)} (front ${f1(c.front)}, top ${f1(c.top)})`,
  );
}

console.log("\nRain, mm/h");
for (const rain of [5, 10, 50]) line(`${rain} mm/h`, { rain });

console.log("\nDrop size, mm");
for (const drop of [1, 1.5, 3, 4]) line(`${drop} mm`, { drop });

console.log("\nDistance to shelter, m");
for (const gap of [5, 30, 100]) line(`${gap} m`, { gap });

console.log("\nWalking speed, m/s");
for (const walk of [1.0, 1.8]) line(`${walk} m/s`, { walk });

console.log("\nRunning speed, m/s");
for (const run of [3, 4, 6, 7]) line(`${run} m/s`, { run });

console.log("\nBody, height x width x depth, m");
line("1.55 x 0.40 x 0.22", { height: 1.55, width: 0.4, depth: 0.22 });
line("1.85 x 0.50 x 0.30", { height: 1.85, width: 0.5, depth: 0.3 });
line("1.70 x 0.45 x 0.40", { depth: 0.4 });

console.log(
  "\nWind along the street, m/s, positive from behind (formula only)",
);
for (const wind of [-3, -1.5, 1.5, 3]) line(`${wind} m/s`, { wind });
