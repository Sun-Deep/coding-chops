#!/usr/bin/env node --experimental-strip-types --no-warnings

// Stand on the right and walk on the left, or stand on both sides? A
// Holborn-sized escalator in the busiest part of the rush hour.
//
// The model is imported from the reel's own module,
// src/vertical/26-escalator/escalator.ts. Fixed 0.1 s steps and a seeded
// generator, so the machine cannot move a figure.
//
// Printed: the calibration (how STAND_GAP and WALK_GAP were chosen so the
// model carries what TfL measured at Holborn), the run the reel shows, the
// same over 50 seeds, and how the result moves if the walkers keep more or
// less room than calibrated.
//
// Usage: node --experimental-strip-types scripts/measure-escalator.mjs

import {
  BELT,
  LENGTH,
  STAND_GAP,
  STEADY_FROM,
  STEADY_TO,
  WALK_GAP,
  perMinute,
  runEscalator,
} from "../src/vertical/26-escalator/escalator.ts";

const rate = (esc) =>
  perMinute(esc.lanes[0], STEADY_FROM, STEADY_TO) +
  perMinute(esc.lanes[1], STEADY_FROM, STEADY_TO);

console.log(
  `escalator ${LENGTH} m along the incline (23 m rise), belt ${BELT} m/s. Standers board with ${STAND_GAP} m free ahead, walkers with ${WALK_GAP} m. Measured ${STEADY_FROM} to ${STEADY_TO} s.\n`,
);

console.log(
  "calibration targets, TfL at Holborn: about 115/min with a walking lane, 141 to 151 standing on both sides",
);
for (const sg of [0.6, 0.6164, 0.63]) {
  console.log(
    `  stand gap ${sg} m: both sides standing ${rate(runEscalator("standBoth", 1, { standGap: sg })).toFixed(1)}/min`,
  );
}
for (const wg of [1.3, 1.4, 1.5]) {
  console.log(
    `  walk gap ${wg} m: walking lane plus standing lane ${rate(runEscalator("walkLeft", 1, { walkGap: wg })).toFixed(1)}/min`,
  );
}

const left = runEscalator("walkLeft");
const both = runEscalator("standBoth");
console.log("\nseed 1, the run the reel shows");
console.log(
  `  stand right, walk left: walking lane ${perMinute(left.lanes[0], STEADY_FROM, STEADY_TO).toFixed(1)}/min, standing lane ${perMinute(left.lanes[1], STEADY_FROM, STEADY_TO).toFixed(1)}/min, total ${rate(left).toFixed(1)}/min`,
);
console.log(`  stand on both sides: total ${rate(both).toFixed(1)}/min`);
console.log(
  `  standing on both sides carries ${((rate(both) / rate(left) - 1) * 100).toFixed(0)}% more`,
);
for (const t of [30, 60, 90, 120, 150]) {
  const up = (esc) =>
    esc.lanes[0].filter((r) => r.off < t).length +
    esc.lanes[1].filter((r) => r.off < t).length;
  console.log(
    `  people at the top by ${t} s: walk left ${up(left)}, stand both ${up(both)}`,
  );
}

let more = 0;
const gains = [];
for (let seed = 1; seed <= 50; seed++) {
  const a = rate(runEscalator("walkLeft", seed));
  const b = rate(runEscalator("standBoth", seed));
  if (b > a) more++;
  gains.push(b / a - 1);
}
gains.sort((x, y) => x - y);
console.log(
  `\n50 seeds: standing on both sides carried more in ${more}; gain ${(gains[0] * 100).toFixed(0)}% to ${(gains[49] * 100).toFixed(0)}%, median ${(gains[25] * 100).toFixed(0)}%`,
);

console.log("\nif walkers keep a different gap than calibrated, seed 1:");
for (const wg of [1.0, 1.2, 1.4, 1.6, 1.8]) {
  const a = rate(runEscalator("walkLeft", 1, { walkGap: wg }));
  const b = rate(runEscalator("standBoth", 1, { walkGap: wg }));
  console.log(
    `  walk gap ${wg} m: walk left ${a.toFixed(0)}/min, stand both ${b.toFixed(0)}/min, gain ${((b / a - 1) * 100).toFixed(0)}%`,
  );
}
