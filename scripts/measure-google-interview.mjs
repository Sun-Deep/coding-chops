#!/usr/bin/env node
/* global console, process */

// The code moment in VR50, run.
//
// Three versions of a binary search, from src/vertical/50-google-ai-interview/snippets.ts,
// each compiled from the exact lines the reel shows: the original with a
// bug, an AI-style suggested fix, and the real fix. Each is run on the
// case reported in the reel, on the other case the suggestion breaks, and
// on every target in every sorted array of distinct values 0..9 up to
// length 8, against the right answer. Counted: the cases each gets wrong.
//
// Exits 1 if the reel's claims stop holding: the original must miss the
// reported case, the suggestion must pass it while the other still fails, the fix
// must get every case right, and measurements.ts must match.
//
// Usage: node --experimental-strip-types --no-warnings \
//          --import ./scripts/ts-register.mjs scripts/measure-google-interview.mjs

import * as C from "../src/vertical/50-google-ai-interview/snippets.ts";
import { RUN } from "../src/vertical/50-google-ai-interview/measurements.ts";

const compile = (lines) =>
  new Function(`${lines.join("\n")}\nreturn search;`)();
const versions = {
  original: compile(C.BUGGY),
  suggested: compile(C.SUGGESTED),
  fixed: compile(C.FIXED),
};

// Every sorted array of distinct values from 0..9, length 0 to 8, and every
// target from -1 to 10.
const arrays = [];
for (let mask = 0; mask < 1 << 10; mask++) {
  const a = [];
  for (let v = 0; v < 10; v++) if (mask & (1 << v)) a.push(v);
  if (a.length <= 8) arrays.push(a);
}
const cases = [];
for (const a of arrays) for (let t = -1; t <= 10; t++) cases.push([a, t]);

const say = (s = "") => console.log(s);
const out = {};
for (const [name, fn] of Object.entries(versions)) {
  let wrong = 0;
  for (const [a, t] of cases) {
    const got = fn(a, t);
    const right = a.indexOf(t);
    if (right === -1 ? got !== -1 : got !== right) wrong++;
  }
  const report = fn([...C.REPORT.nums], C.REPORT.target);
  const other = fn([...C.OTHER.nums], C.OTHER.target);
  out[name] = { report, other, wrong };
  say(
    `${name.padEnd(9)} search([1,3,5], 5) -> ${report}   search([1,3,5], 1) -> ${other}   wrong ${wrong} of ${cases.length}`,
  );
}

const problems = [];
if (out.original.report !== -1)
  problems.push("the original finds the reported case");
if (out.suggested.report !== 2 || out.suggested.other !== -1)
  problems.push(
    "the suggestion does not pass the report and fail the other case",
  );
if (out.fixed.wrong !== 0) problems.push("the fix gets cases wrong");
if (JSON.stringify(RUN) !== JSON.stringify({ cases: cases.length, ...out }))
  problems.push("measurements.ts disagrees with this run");
if (problems.length) {
  for (const p of problems) say(`== MISMATCH: ${p}`);
  process.exitCode = 1;
} else say("== measurements.ts matches this run");
