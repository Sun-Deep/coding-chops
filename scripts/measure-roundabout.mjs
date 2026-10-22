#!/usr/bin/env node --experimental-strip-types --no-warnings
/* global console */

// Roundabout or traffic lights: the same cars through the same junction of
// two single-lane roads, built both ways. How long does the junction cost
// a car on average, how many have to stop, and where does it flip?
//
// The model is imported from the reel's own module,
// src/vertical/42-roundabout/simulation.ts. Every run is seeded.
//
// Printed: the calibration against the Highway Capacity Manual, the
// defaults averaged over 20 seeded hours, then each assumption swept.
//
// Usage: node --experimental-strip-types scripts/measure-roundabout.mjs

import {
  FLOWS,
  LEFT,
  LEFT_GAP,
  MARGIN,
  RIGHT,
  SIGNALS,
  TC,
  average,
  entryCapacity,
  hcmCapacity,
  queueHeadway,
  simulate,
} from "../src/vertical/42-roundabout/simulation.ts";

const SEEDS = 20;
const f1 = (x) => x.toFixed(1);
const pct = (x) => `${Math.round(x * 100)}%`;

console.log(
  `One junction of two single-lane roads, ${FLOWS.join("/")} cars an hour on ` +
    `the four arms, ${pct(LEFT)} turning left and ${pct(RIGHT)} right. Lights: ` +
    `two phases, actuated (green ${SIGNALS.minGreen} to ${SIGNALS.maxGreen} s, ` +
    `gives up green when no car is within ${SIGNALS.gapOut} m), amber ` +
    `${SIGNALS.amber} s, all-red ${SIGNALS.allRed} s, a left-turn lane on each ` +
    `arm, lefts wait for a ${LEFT_GAP} s gap in oncoming traffic. Roundabout: ` +
    `single lane, a driver goes when the next car coming round is at least ` +
    `${TC} s from the merge and ${MARGIN} s behind the driver getting there. ` +
    `"Through in" is seconds from appearing 150 m out to ` +
    `leaving 150 m out on the other side; "still" is seconds standing still; ` +
    `delay is time lost against driving the same way through alone. ` +
    `${SEEDS} seeded hours per line, after 5 minutes of warm-up.`,
);

console.log("\nCalibration");
const sat = queueHeadway(
  simulate("lights", 1, { left: 0, right: 0, flows: [700, 700, 700, 700] }),
);
console.log(
  `lights: cars leave a standing queue every ${sat.toFixed(2)} s ` +
    `(${Math.round(3600 / sat)} an hour a lane; HCM base saturation flow 1,900)`,
);
const empty = entryCapacity(0).entered;
console.log(
  `roundabout: with nothing going round, a queue goes in every ` +
    `${(3600 / empty).toFixed(2)} s (HCM 6 follow-up headway: 2.61)`,
);
console.log(
  "roundabout entry capacity, cars an hour, against the flow actually going round:",
);
for (const q of [300, 600, 900]) {
  const { entered, round } = entryCapacity(q);
  console.log(
    `  ${String(round).padStart(4)} going round: model ${entered}, ` +
      `HCM 6 ${Math.round(hcmCapacity(round))}`,
  );
}

const line = (label, opts = {}) => {
  const L = average("lights", SEEDS, opts);
  const R = average("roundabout", SEEDS, opts);
  console.log(
    `${label.padEnd(24)} lights: through in ${f1(L.time)} s, still ${f1(L.still)} s, ` +
      `delay ${f1(L.mean)} s, ${pct(L.stopped)} stop | roundabout: through in ` +
      `${f1(R.time)} s, still ${f1(R.still)} s, delay ${f1(R.mean)} s, ` +
      `${pct(R.stopped)} stop | ${Math.round(L.cars)} cars`,
  );
};

console.log("\nDefaults");
line("defaults");

console.log("\nTraffic, cars an hour on every arm");
for (const f of [30, 60, 150, 300, 525, 600, 650])
  line(`${f} each`, { flows: [f, f, f, f] });

console.log("\nA busy main road and a quiet side road");
line("main 600, side 100", { flows: [600, 100, 600, 100] });
line("main 700, side 150", { flows: [700, 150, 700, 150] });
line("main 800, side 200", { flows: [800, 200, 800, 200] });

console.log("\nTurning");
line("40% left", { left: 0.4 });
line("no turns", { left: 0, right: 0 });

console.log("\nRoundabout: seconds to spare drivers want at the merge");
for (const margin of [1.0, 2.0, 2.5]) line(`${margin} s`, { margin });

console.log("\nLights");
line("fixed time, 25 s greens", { signals: { fixedGreen: 25 } });
line("max green 45 s", { signals: { maxGreen: 45 } });
line("gives up green at 15 m", { signals: { gapOut: 15 } });
