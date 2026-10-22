#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the rain model as a frame-by-frame timeline for Blender: for the
// walker and the runner, where they are along the street, how fast they are
// going, and how wet their top and their front are, from the reel's own
// modules, so the animation and the committed run are the same code.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/rain/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import {
  DURATION,
  FPS,
  simAt,
} from "../../../src/vertical/40-rain-run/beats.ts";
import {
  DEPTH,
  GAP,
  expected,
  speedOf,
  timeOut,
} from "../../../src/vertical/40-rain-run/simulation.ts";
import { DROPS } from "../../../src/vertical/40-rain-run/measurements.ts";

const out = process.argv[2];
const round = (x) => Math.round(x * 10000) / 10000;

// Where each of you comes to a stop under the shelter, centre of the body.
const STOP = { walk: GAP + 1.2, run: GAP + 2.0 };

const track = (gait) => {
  const v = speedOf(gait);
  const ta = timeOut(gait);
  // Your centre when your back crosses into the shelter.
  const xa = -DEPTH / 2 + v * ta;
  const d = STOP[gait] - xa;
  const a = (v * v) / (2 * d);
  const frames = [];
  for (let f = 0; f < DURATION; f++) {
    const t = simAt(f);
    let x;
    let speed;
    if (t <= ta) {
      x = -DEPTH / 2 + v * t;
      speed = v;
    } else {
      const tau = Math.min(t - ta, v / a);
      x = xa + v * tau - (a * tau * tau) / 2;
      speed = Math.max(0, v - a * tau);
    }
    const c = expected(gait, Math.max(0, t));
    frames.push([
      round(x),
      round(speed),
      round(c.top / DROPS.walk.top),
      round(c.front / DROPS.walk.front),
    ]);
  }
  return { arrive: ta * FPS, frames };
};

const data = {
  frames: DURATION,
  fps: FPS,
  gap: GAP,
  walk: track("walk"),
  run: track("run"),
};
writeFileSync(out, JSON.stringify(data));
console.log(
  `wrote ${out}: walker stops at x ${data.walk.frames.at(-1)[0]}, runner at ${data.run.frames.at(-1)[0]}`,
);
