#!/usr/bin/env node --experimental-strip-types --no-warnings --import ./scripts/ts-register.mjs
/* global process, console */

// Writes the Monty Hall reel's games and beats for Blender: for each of the
// first 300 games, the car's door and the door the host opened, from the
// committed run, and the frames each part of the reel starts on.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/blender/monty/export.mjs <out.json>

import { writeFileSync } from "node:fs";
import * as B from "../../../src/vertical/45-monty-hall/beats.ts";
import { RUN } from "../../../src/vertical/45-monty-hall/measurements.ts";

const out = process.argv[2];
writeFileSync(
  out,
  JSON.stringify({
    duration: B.DURATION,
    hostOpens: B.HOST_OPENS,
    reveal: B.REVEAL,
    pull: B.PULL,
    wave: B.WAVE,
    sort: B.SORT,
    games: [...RUN.cars].map((c, i) => [
      Number(c) - 1,
      Number(RUN.opened[i]) - 1,
    ]),
  }),
);
console.log(`wrote ${out}`);
