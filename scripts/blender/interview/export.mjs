#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the Google interview reel's timeline for Blender, from the
// creator's recorded take, through the same buildTimeline the reel uses.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/interview/export.mjs <out.json>

import { readFileSync, writeFileSync } from "node:fs";
import { buildTimeline } from "../../../src/vertical/50-google-ai-interview/timeline.ts";

const dir = "curriculum/vertical/50-google-ai-interview/audio";
const take = JSON.parse(readFileSync(`${dir}/captions/stem-01.json`, "utf8"));
const bounds = JSON.parse(readFileSync(`${dir}/stems.json`, "utf8"))["stem-01"];
const { duration, beats } = buildTimeline(take, bounds);
writeFileSync(process.argv[2], JSON.stringify({ duration, beats }));
console.log(`wrote ${process.argv[2]}: ${duration} frames`);
