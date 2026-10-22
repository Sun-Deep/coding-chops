#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes both junctions as a frame-by-frame timeline for Blender: every car
// within 90 m of the middle on every frame, where it is, which way it faces
// and whether its brake lights are on, and at the lights which arms have
// green. Everything comes from the reel's own modules, so the animation and
// the committed run are the same code.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/roundabout/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import {
  DURATION,
  START,
  simAt,
} from "../../../src/vertical/42-roundabout/beats.ts";
import { HERO } from "../../../src/vertical/42-roundabout/measurements.ts";
import {
  ARM_LENGTH,
  CAR_LENGTH,
  GIVE_WAY,
  LANE,
  POCKET,
  RING,
  STOP_LINE,
  simulate,
} from "../../../src/vertical/42-roundabout/simulation.ts";

const out = process.argv[2];
const r3 = (x) => Math.round(x * 1000) / 1000;
const REACH = 90;

const junction = (rule) => {
  const end = simAt(DURATION) + 1;
  const run = simulate(rule, 1, {}, undefined, undefined, false, {
    from: START - 1,
    to: end,
    every: 0.1,
  });
  const at = (t) => {
    const i = Math.max(
      0,
      Math.min(run.frames.length - 2, Math.floor((t - run.frames[0].t) / 0.1)),
    );
    return [run.frames[i], run.frames[i + 1], (t - run.frames[i].t) / 0.1];
  };
  const frames = [];
  const lamps = [];
  const prevV = new Map();
  for (let f = 0; f < DURATION; f++) {
    const [a, b, u] = at(simAt(f));
    const next = new Map(b.cars.map((c) => [c.id, c]));
    const cars = [];
    for (const c of a.cars) {
      const d = next.get(c.id);
      const x = d ? c.x + (d.x - c.x) * u : c.x;
      const y = d ? c.y + (d.y - c.y) * u : c.y;
      if (Math.hypot(x, y) > REACH) continue;
      let dh = d ? d.h - c.h : 0;
      dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      const v = d ? c.v + (d.v - c.v) * u : c.v;
      const was = prevV.get(c.id) ?? v;
      const braking = v < 0.5 || v < was - 0.02 ? 1 : 0;
      prevV.set(c.id, v);
      cars.push([c.id, r3(x), r3(y), r3(c.h + dh * u), braking]);
    }
    frames.push(cars);
    lamps.push(a.lamps ?? null);
  }
  return { frames, lamps };
};

const data = {
  frames: DURATION,
  you: HERO.id,
  geometry: { LANE, STOP_LINE, RING, GIVE_WAY, POCKET, ARM_LENGTH, CAR_LENGTH },
  lights: junction("lights"),
  roundabout: junction("roundabout"),
};
writeFileSync(out, JSON.stringify(data));
const ids = (j) => new Set(j.frames.flat().map((c) => c[0])).size;
console.log(
  `wrote ${out}: ${ids(data.lights)} cars at the lights, ${ids(data.roundabout)} at the roundabout`,
);
