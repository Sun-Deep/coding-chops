#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
// Export the solver's full frame timeline for Blender and the sound cues.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { ACCENT } from "../../../src/shared/vertical/palette.ts";
import { DURATION, FPS } from "../../../src/vertical/41-coin-puzzle/beats.ts";
import {
  GEOMETRY,
  stateAt,
} from "../../../src/vertical/41-coin-puzzle/motion.ts";
import { RUN } from "../../../src/vertical/41-coin-puzzle/runs.ts";
import { COINS } from "../../../src/vertical/41-coin-puzzle/simulation.ts";
const out = process.argv[2];
if (!out) throw new Error("Pass the output timeline JSON path.");
const data = {
  fps: FPS,
  frames: DURATION,
  coins: COINS,
  ...GEOMETRY,
  accent: ACCENT,
  run: RUN,
  poses: Array.from({ length: DURATION }, (_, frame) => stateAt(frame)),
};
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data));
console.log(
  `Wrote ${out}: ${DURATION} frames, ${COINS} coins, ${RUN.steps.length} weighings.`,
);
