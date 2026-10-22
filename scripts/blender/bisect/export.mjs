#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the bisect reel's beats for Blender: when each check starts, when
// its result lands, when git rules out half, and the camera's keys. All of
// it comes from the reel's own modules, so the cards and the terminal run
// on the same clock.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/bisect/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import {
  CAMERA,
  CHECKS,
  DURATION,
  FOUND_AT,
} from "../../../src/vertical/43-git-bisect/beats.ts";
import { RUN } from "../../../src/vertical/43-git-bisect/measurements.ts";

const out = process.argv[2];
writeFileSync(
  out,
  JSON.stringify({
    duration: DURATION,
    commits: RUN.commits,
    found: RUN.found,
    foundAt: FOUND_AT,
    checks: CHECKS,
    camera: CAMERA,
  }),
);
console.log(`wrote ${out}`);
