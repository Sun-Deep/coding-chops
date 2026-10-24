#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the stock lesson's timeline for Blender: the frame every beat is
// spoken on, from the creator's recorded stems, through the same
// buildTimeline the reel uses, plus the prices.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/stock/export.mjs <out.json>

import { readFileSync, writeFileSync } from "node:fs";
import {
  STEM_FILES,
  buildTimeline,
} from "../../../src/vertical/48-stock-lesson/timeline.ts";
import { RUN } from "../../../src/vertical/48-stock-lesson/measurements.ts";

const caps = STEM_FILES.map((f) =>
  JSON.parse(
    readFileSync(
      `curriculum/vertical/48-stock-lesson/audio/captions/${f}.json`,
      "utf8",
    ),
  ),
);
const bounds = JSON.parse(
  readFileSync("curriculum/vertical/48-stock-lesson/audio/stems.json", "utf8"),
);
const { duration, beats, stems } = buildTimeline(caps, bounds);
const out = process.argv[2];
writeFileSync(
  out,
  JSON.stringify({
    duration,
    beats,
    stems: stems.map((s) => s.at),
    prices: RUN.example.prices,
  }),
);
console.log(`wrote ${out}: ${duration} frames`);
