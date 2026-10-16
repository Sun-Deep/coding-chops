#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the deplaning model as a frame-by-frame timeline for Blender to
// animate: for each cabin and each passenger, the reel frame they stand up,
// step into the aisle, get their bag down and leave by the door, and where
// in the aisle they are on every frame. Everything comes from the reel's own
// modules, so the animation and the committed run are the same code.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/deplane/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import {
  DURATION,
  SIGN,
  VERDICT_FROM,
  frameAt,
  simAt,
} from "../../../src/vertical/36-deplane/beats.ts";
import { HERO } from "../../../src/vertical/36-deplane/measurements.ts";
import { RUNS } from "../../../src/vertical/36-deplane/runs.ts";
import {
  DOOR,
  ROWS,
  passengers,
} from "../../../src/vertical/36-deplane/simulation.ts";

const out = process.argv[2];
const people = passengers();
const round = (x) => Math.round(x * 1000) / 1000;

/** Aisle position as a continuous row number, eased between seconds. */
const cellAt = (trace, t) => {
  if (t < trace.enter || t >= trace.off) return null;
  const k = Math.floor(t - trace.enter);
  const f = t - trace.enter - k;
  const at = (i) => {
    const c = trace.cells[Math.min(trace.cells.length - 1, trace.enter + i)];
    return c < 0 ? 0 : c;
  };
  const e = f * f * (3 - 2 * f);
  return at(k) + (at(k + 1) - at(k)) * e;
};

const variant = (rule) =>
  RUNS[rule].map((x) => {
    const p = people[x.id];
    const cell = [];
    for (let f = 0; f < DURATION; f++) {
      const c = cellAt(x, simAt(f));
      cell.push(c === null ? null : round(c));
    }
    return {
      id: x.id,
      row: p.row,
      col: p.col,
      bag: p.bag,
      up: round(frameAt(x.up)),
      enter: round(frameAt(x.enter)),
      stepEnd: round(frameAt(x.enter + x.stepping)),
      bagFrom: x.bagFrom >= 0 ? round(frameAt(x.bagFrom)) : null,
      bagTo: x.bagTo >= 0 ? round(frameAt(x.bagTo)) : null,
      off: round(frameAt(x.off)),
      cell,
    };
  });

const data = {
  frames: DURATION,
  sign: SIGN,
  door: round(frameAt(DOOR)),
  verdict: VERDICT_FROM,
  rows: ROWS,
  you: HERO.id,
  stand: variant("stand"),
  sit: variant("sit"),
};
writeFileSync(out, JSON.stringify(data));
console.log(
  `wrote ${out}: door opens at frame ${data.door.toFixed(1)}; you off at ${data.stand[HERO.id].off.toFixed(1)} above, ${data.sit[HERO.id].off.toFixed(1)} below`,
);
