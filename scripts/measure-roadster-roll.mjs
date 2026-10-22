#!/usr/bin/env node --experimental-strip-types --no-warnings

// The Roadster letting go of an upside-down ramp. With no thrusters it lands
// on its roof: how long does it fall, how fast and how hard does it hit? With
// them, how long does it have to roll over before it has to start braking,
// how hard is it pushed, and would a backflip have been harder?
//
// The model is imported from the reel's own module,
// src/vertical/39-roadster-roll/simulation.ts. There is nothing random in it.
//
// Printed: the defaults, then each assumption swept on its own. Tesla
// published no height, size, weight or thrust, so the result has to be read
// across them. The car's weight drops out of every figure.
//
// Usage: node --experimental-strip-types scripts/measure-roadster-roll.mjs

import {
  BRAKE,
  DROP,
  EXIT_V,
  FAN,
  HEIGHT,
  LAND_V,
  LENGTH,
  ROOF_CRUSH,
  SUSPENSION,
  WIDTH,
  flipTwist,
  plan,
  rollClearance,
} from "../src/vertical/39-roadster-roll/simulation.ts";

const f2 = (x) => x.toFixed(2);
const f1 = (x) => x.toFixed(1);
const kmh = (v) => f1(v * 3.6);

console.log(
  `A ${LENGTH} x ${WIDTH} x ${HEIGHT} m box lets go upside down with its roof ` +
    `${DROP} m up, moving ${EXIT_V} m/s. Off: no thrusters. On: it rolls half ` +
    `a turn while falling freely, then thrust underneath of ${BRAKE} times its ` +
    `weight brakes it to ${LAND_V} m/s at the ground. The roof crushes ` +
    `${ROOF_CRUSH} m as it stops; the suspension gives ${SUSPENSION} m. On the ` +
    `ramp the fan pulls ${FAN} g. Forces are what an accelerometer in the car ` +
    `reads: 1 g parked, 0 g falling.`,
);

const line = (label, opts = {}) => {
  const p = plan(opts);
  const twist = flipTwist(opts);
  console.log(
    `${label.padEnd(22)} off: roof down at ${f2(p.hit)} s, ${f1(p.hitV)} m/s ` +
      `(${kmh(p.hitV)} km/h), ${f1(p.roofG)} g as the roof crushes. on: roll ` +
      `done by ${f2(p.rollBy)} s, braking from ${f1(p.brakeV)} m/s at ` +
      `${f1(p.brakeG)} g, wheels down at ${f2(p.land)} s, ${f1(p.landG)} g in ` +
      `the suspension; lowest corner ` +
      `${f1(rollClearance(opts))} m up mid-roll; a backflip in the same time ` +
      `takes ${f1(twist.box)}x the twist as a box, ${f1(twist.floor)}x with the ` +
      `weight in the floor`,
  );
};

console.log("\nDefaults");
line("defaults");

console.log("\nRoof height when it lets go");
for (const drop of [3, 4, 6, 8]) line(`${drop} m`, { drop });

console.log("\nThrust underneath, times the car's weight");
for (const brake of [1.5, 3, 4]) line(`${brake}x`, { brake });

console.log("\nSpeed at touchdown");
for (const landV of [0.5, 2]) line(`${landV} m/s`, { landV });

console.log("\nRoof crush");
for (const crush of [0.1, 0.3, 0.5]) line(`${crush} m`, { crush });

console.log("\nSuspension travel");
for (const suspension of [0.05, 0.2]) line(`${suspension} m`, { suspension });

console.log("\nCar size");
line("4.0 x 1.9 x 1.25 m", { length: 4.0, width: 1.9, height: 1.25 });
line("4.7 x 2.1 x 1.1 m", { length: 4.7, width: 2.1, height: 1.1 });
line("3.9 x 2.1 x 1.3 m", { length: 3.9, width: 2.1, height: 1.3 });
