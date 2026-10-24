#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the last-ticket reel's beats for Blender, from the reel's own
// module, so the render and the overlays run on one clock.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/ticket/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import * as B from "../../../src/vertical/47-last-ticket/beats.ts";

const out = process.argv[2];
const beats = Object.fromEntries(
  Object.entries(B).filter(([, v]) => typeof v === "number"),
);
writeFileSync(out, JSON.stringify(beats));
console.log(`wrote ${out}`);
