#!/usr/bin/env node --experimental-strip-types --no-warnings

// 22 cars on a 230 m ring, one brake tap, and what one smoothing car does to
// the jam that follows.
//
// The physics is not copied here. It is imported from the reel's own module,
// src/vertical/23-phantom-jam/physics.ts, so the frames and this run are the
// same code. Node strips the TypeScript types on import.
//
// Simulated, not timed: fixed 0.05 s steps and a seeded generator, so the
// numbers cannot move between machines or runs.
//
// What is printed:
//   the run the reel shows, both rings, summarised over t = 50 to 100 s, long
//   after the tap, which asks whether a jam is still there rather than whether
//   the first wave stopped anybody (it always does: the cars between the tap
//   and the smoothing car are human); and the ring's average speed every 2 s;
//   the sweep: every driver setting in a grid, 20 noise seeds each, so the
//   result is shown not to rest on one setting or one seed.
//
// Usage: node --experimental-strip-types scripts/measure-phantom-jam.mjs

import {
  CARS,
  CAR_M,
  HUMAN_DRIVER,
  NOISE,
  RING_M,
  SEED,
  SMOOTH_GAP_S,
  SMOOTH_SHARE,
  TAP_BRAKE,
  TAP_FROM,
  TAP_TO,
  equilibrium,
  meanKmhAt,
  simulate,
  summarise,
} from "../src/vertical/23-phantom-jam/physics.ts";

const FROM = 50;
const fmt = (s) =>
  `most stopped at once ${String(s.mostStopped).padStart(2)}  mean ${s.meanKmh.toFixed(1)} km/h  braking events ${s.brakings}`;

console.log(
  `${CARS} cars of ${CAR_M} m on a ${RING_M} m ring. Driver ${JSON.stringify(HUMAN_DRIVER)}, throttle noise ±${NOISE} m/s², seed ${SEED}.`,
);
console.log(
  `Car 0 brakes at ${TAP_BRAKE} m/s² from t = ${TAP_FROM} to ${TAP_TO} s. Smoothing car holds ${SMOOTH_SHARE * 100}% of the settled speed and a ${SMOOTH_GAP_S} s gap.`,
);
console.log(
  `Settled speed with equal gaps: ${equilibrium(HUMAN_DRIVER).toFixed(2)} m/s, ${(equilibrium(HUMAN_DRIVER) * 3.6).toFixed(1)} km/h\n`,
);

const human = simulate();
const smoothed = simulate({ smoother: true });
console.log(`from t = ${FROM} s to 100 s`);
console.log(`  22 human drivers   ${fmt(summarise(human, FROM))}`);
console.log(`  1 smoothing car    ${fmt(summarise(smoothed, FROM))}\n`);

console.log("ring average speed, km/h");
console.log("    t   human  smoothed");
for (let t = 0; t <= 100; t += 2) {
  console.log(
    `${String(t).padStart(5)} ${meanKmhAt(human, t).toFixed(1).padStart(7)} ${meanKmhAt(smoothed, t).toFixed(1).padStart(9)}`,
  );
}

// ---- the sweep -------------------------------------------------------------

const SEEDS = 20;
let settings = 0;
let runs = 0;
let jams = 0;
let fixed = 0;
let faster = 0;
const rows = [];
for (const v0 of [14, 16, 18]) {
  for (const T of [0.6, 0.8, 1.0]) {
    for (const a of [0.5, 0.8, 1.2]) {
      for (const b of [1.5, 2.5]) {
        const driver = { v0, T, a, b, s0: 1.5 };
        settings++;
        let j = 0;
        let f = 0;
        let q = 0;
        let hm = 0;
        let sm = 0;
        for (let seed = 1; seed <= SEEDS; seed++) {
          const h = summarise(simulate({ driver, seed }), FROM);
          const s = summarise(simulate({ driver, seed, smoother: true }), FROM);
          runs++;
          if (h.mostStopped > 0) {
            j++;
            jams++;
            if (s.mostStopped === 0) {
              f++;
              fixed++;
            }
          }
          if (s.meanKmh > h.meanKmh) {
            q++;
            faster++;
          }
          hm += h.meanKmh;
          sm += s.meanKmh;
        }
        rows.push(
          `${String(v0).padStart(3)} ${String(T).padStart(4)} ${String(a).padStart(4)} ${String(b).padStart(4)}  ${(equilibrium(driver) * 3.6).toFixed(1).padStart(5)}  ${String(j).padStart(4)}/${SEEDS}  ${String(f).padStart(4)}/${j}  ${String(q).padStart(4)}/${SEEDS}  ${(hm / SEEDS).toFixed(1).padStart(6)} ${(sm / SEEDS).toFixed(1).padStart(6)}`,
        );
      }
    }
  }
}
console.log(
  `\nsweep: ${settings} driver settings x ${SEEDS} seeds, s0 1.5 m throughout`,
);
console.log(
  " v0    T    a    b  settled  jam formed  no car stopped  smoother faster  mean km/h human, smoothed",
);
for (const r of rows) console.log(r);
console.log(
  `\njam formed in ${jams} of ${runs} runs; with the smoothing car, no car stopped in ${fixed} of those ${jams}; ring average faster with it in ${faster} of ${runs}`,
);
