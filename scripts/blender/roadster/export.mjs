#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the Roadster model as a frame-by-frame timeline for Blender: for
// each rule, where the car's centre is, how far it has rolled and which
// thrusters are firing on every frame. Everything comes from the reel's own
// modules, so the animation and the committed run are the same code.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/roadster/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import {
  DURATION,
  LET_GO,
  ROOF_DOWN,
  WHEELS_DOWN,
  VERDICT_FROM,
  simAt,
} from "../../../src/vertical/39-roadster-roll/beats.ts";
import {
  DROP,
  HEIGHT,
  LENGTH,
  WIDTH,
  plan,
  pose,
} from "../../../src/vertical/39-roadster-roll/simulation.ts";

const out = process.argv[2];
const round = (x) => Math.round(x * 10000) / 10000;

// Rolling: 1 while the side thrusters spin the car up, 2 while the opposite
// pair slows the spin so it stops the right way up.
const half = plan().rollBy / 2;
const track = (rule) =>
  Array.from({ length: DURATION + 1 }, (_, f) => {
    const t = simAt(f);
    const p = pose(rule, t);
    return [
      round(p.x),
      round(p.z),
      round(p.roll),
      p.rolling ? (t < half ? 1 : 2) : 0,
      p.braking ? 1 : 0,
      p.phase === "ramp" ? 0 : p.phase === "air" ? 1 : 2,
    ];
  });

const data = {
  frames: DURATION,
  letGo: LET_GO,
  roofDown: ROOF_DOWN,
  wheelsDown: WHEELS_DOWN,
  verdict: VERDICT_FROM,
  car: { length: LENGTH, width: WIDTH, height: HEIGHT },
  drop: DROP,
  sim: Array.from({ length: DURATION + 1 }, (_, f) => round(simAt(f))),
  off: track("off"),
  on: track("on"),
};
writeFileSync(out, JSON.stringify(data));
console.log(
  `wrote ${out}: lets go at frame ${LET_GO}, roof down at ${ROOF_DOWN}, ` +
    `wheels down at ${WHEELS_DOWN}`,
);
