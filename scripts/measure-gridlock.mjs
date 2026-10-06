#!/usr/bin/env node --experimental-strip-types --no-warnings

// One city block and the four junctions round it, in a rush hour, twice:
// once with drivers who go whenever the light is green, once with drivers who
// only go when there is room past the junction. Does the block lock?
//
// The model is imported from the reel's own module,
// src/vertical/27-gridlock/simulation.ts. Fixed 0.1 s steps and seeded arrivals,
// so the machine cannot move a figure.
//
// Printed: the run the reel shows, then 200 seeds at the default traffic,
// then 100 seeds at each of several traffic levels, signal timings and shares
// of drivers who block, so the claim is shown across settings rather than
// in one.
//
// Usage: node --experimental-strip-types scripts/measure-gridlock.mjs

import {
  DEFAULTS,
  SEED,
  crossedBetween,
  simulate,
} from "../src/vertical/27-gridlock/simulation.ts";

const fmt = (t) => (Number.isFinite(t) ? `${t.toFixed(1)} s` : "never");

console.log(`settings ${JSON.stringify(DEFAULTS)}\n`);

const g = simulate("green", SEED);
const r = simulate("room", SEED);
console.log(`seed ${SEED}, the run the reel shows`);
console.log(
  `  go on green: loop locked at ${fmt(g.lockedAt)}, last car through a junction at ${fmt(g.frozenAt)}`,
);
console.log(
  `  go only if there is room: loop locked ${fmt(r.lockedAt)}, frozen ${fmt(r.frozenAt)}`,
);
for (const [from, to] of [
  [0, 60],
  [60, 120],
  [120, 180],
  [180, 240],
  [240, 300],
]) {
  console.log(
    `  cars through a junction ${from} to ${to} s: green ${crossedBetween(g, from, to)}, room ${crossedBetween(r, from, to)}`,
  );
}

const sweep = (seeds, opts, greenOpts = {}) => {
  let locked = 0;
  let roomLocked = 0;
  let greenThrough = 0;
  let roomThrough = 0;
  const seconds = opts.seconds ?? DEFAULTS.seconds;
  for (let seed = 1; seed <= seeds; seed++) {
    const a = simulate("green", seed, { ...opts, ...greenOpts });
    const b = simulate("room", seed, opts);
    if (a.lockedAt < Infinity) locked++;
    if (b.lockedAt < Infinity || b.frozenAt < Infinity) roomLocked++;
    greenThrough += crossedBetween(a, 0, seconds);
    roomThrough += crossedBetween(b, 0, seconds);
  }
  return {
    locked,
    roomLocked,
    greenThrough: greenThrough / seeds,
    roomThrough: roomThrough / seeds,
  };
};

const line = (label, seeds, s) =>
  `${label.padEnd(34)} green locked ${String(s.locked).padStart(3)} of ${seeds}, room locked ${s.roomLocked} | cars through: green ${s.greenThrough.toFixed(0)}, room ${s.roomThrough.toFixed(0)}`;

console.log("\n200 seeds at the default traffic, five minutes each");
console.log(line("default", 200, sweep(200, {})));
console.log(line("ten minutes each", 200, sweep(200, { seconds: 600 })));

console.log("\n100 seeds each, five minutes");
for (const pm of [4, 6, 8, 12, 14]) {
  console.log(
    line(`${pm} cars a minute per street`, 100, sweep(100, { perMinute: pm })),
  );
}
for (const share of [0.25, 0.5, 0.75]) {
  console.log(
    line(
      `${share * 100}% of green drivers block`,
      100,
      sweep(100, {}, { blockShare: share }),
    ),
  );
}
console.log(
  line("lights all in step", 100, sweep(100, { offsets: [0, 0, 0, 0] })),
);
console.log(
  line(
    "lights 7 s apart along rows",
    100,
    sweep(100, { offsets: [0, 7, 0, 7] }),
  ),
);
