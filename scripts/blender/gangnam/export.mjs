#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the Gangnam Style reel's timeline for Blender: every beat from
// beats.ts and the measured values the wheels count through, so the render
// and the overlay share one clock.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/gangnam/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import * as beats from "../../../src/vertical/51-gangnam-counter/beats.ts";
import {
  COUNT_FROM,
  RUN,
} from "../../../src/vertical/51-gangnam-counter/measurements.ts";

const out = process.argv[2];
writeFileSync(
  out,
  JSON.stringify({
    duration: beats.DURATION,
    beats,
    countFrom: COUNT_FROM,
    max: RUN.max,
    sixBillion: RUN.sixBillion,
  }),
);
console.log(`wrote ${out}: ${beats.DURATION} frames`);
