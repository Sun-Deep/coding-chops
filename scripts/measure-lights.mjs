#!/usr/bin/env node --experimental-strip-types --no-warnings

// A string of 100 Christmas lights with one bad bulb, and one voltage tester.
// Test bulb by bulb from the plug, or test the middle of whatever is still in
// doubt? How many checks, and how long, to find it?
//
// The model is imported from the reel's own module,
// src/vertical/29-lights/simulation.ts. The bad bulb's position is the only
// random thing, seeded, so the machine cannot move a figure.
//
// Printed: the string the reel shows, then every possible position of the
// bad bulb, so the result is not one lucky string, then how it changes with
// longer strings and a slower or faster hand.
//
// Usage: node --experimental-strip-types scripts/measure-lights.mjs

import {
  BULBS,
  BULB_GAP,
  CHECK,
  MOVE,
  SEED,
  SWAP,
  badBulb,
  search,
} from "../src/vertical/29-lights/simulation.ts";

const clock = (s) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

console.log(
  `${BULBS} bulbs ${BULB_GAP} m apart; ${CHECK} s per check plus ${MOVE} s per metre the hand moves; ${SWAP} s to swap the bulb\n`,
);

const bad = badBulb(SEED);
console.log(`seed ${SEED}, the string the reel shows: bulb ${bad} is bad`);
for (const method of ["linear", "binary"]) {
  const s = search(method, bad);
  console.log(
    `  ${method.padEnd(6)} ${String(s.checks.length).padStart(3)} checks, found at ${clock(s.found)}, lit at ${clock(s.lit)}`,
  );
  if (method === "binary")
    console.log(
      `         tested at ${s.checks.map((c) => `${c.at}${c.power ? "+" : "-"}`).join(", ")} (+ power, - none)`,
    );
}

const all = (bulbs, move = MOVE) => {
  const lin = [];
  const bin = [];
  let binaryFaster = 0;
  for (let b = 1; b <= bulbs; b++) {
    const l = search("linear", b, { bulbs, move });
    const r = search("binary", b, { bulbs, move });
    lin.push(l);
    bin.push(r);
    if (r.found < l.found) binaryFaster++;
  }
  const mean = (xs, f) => xs.reduce((a, x) => a + f(x), 0) / xs.length;
  return {
    linChecks: mean(lin, (s) => s.checks.length),
    linMax: Math.max(...lin.map((s) => s.checks.length)),
    binChecks: mean(bin, (s) => s.checks.length),
    binMax: Math.max(...bin.map((s) => s.checks.length)),
    linTime: mean(lin, (s) => s.found),
    binTime: mean(bin, (s) => s.found),
    binaryFaster,
    firstBinaryFaster: lin.findIndex((l, i) => bin[i].found < l.found) + 1,
  };
};

const r = all(BULBS);
console.log(`\nevery position of the bad bulb, 1 to ${BULBS}`);
console.log(
  `  one by one:     ${r.linChecks.toFixed(1)} checks on average, ${r.linMax} at most, ${clock(r.linTime)} on average`,
);
console.log(
  `  split in half:  ${r.binChecks.toFixed(1)} checks on average, ${r.binMax} at most, ${clock(r.binTime)} on average`,
);
console.log(
  `  splitting is faster for ${r.binaryFaster} of ${BULBS} positions; one by one wins only when the bad bulb is one of the first ${r.firstBinaryFaster - 1}`,
);

console.log("\nlonger and shorter strings, every position");
for (const bulbs of [25, 50, 200, 500]) {
  const x = all(bulbs);
  console.log(
    `  ${String(bulbs).padStart(3)} bulbs: one by one ${x.linChecks.toFixed(1)} checks (${clock(x.linTime)}), split ${x.binChecks.toFixed(1)} (${clock(x.binTime)}), splitting faster for ${x.binaryFaster} of ${bulbs}`,
  );
}

console.log("\na slower or faster hand, 100 bulbs");
for (const move of [0.2, 0.8, 1.6]) {
  const x = all(BULBS, move);
  console.log(
    `  ${move} s a metre: one by one ${clock(x.linTime)}, split ${clock(x.binTime)}, splitting faster for ${x.binaryFaster} of ${BULBS}`,
  );
}
