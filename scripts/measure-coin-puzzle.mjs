#!/usr/bin/env node --experimental-strip-types
// Exhaust every possible lighter coin, then repeat across integer masses.
import assert from "node:assert/strict";
import { arch, platform, release } from "node:os";
import {
  COINS,
  HERO,
  solve,
} from "../src/vertical/41-coin-puzzle/simulation.ts";

console.log(
  `machine: ${platform()} ${release()} ${arch()}; Node ${process.version}`,
);
const outcomes = new Set();
for (let target = 0; target < COINS; target++) {
  const run = solve(target);
  assert.equal(run.found, target);
  assert.equal(run.steps.length, 2);
  assert.deepEqual(
    run.steps.map((step) => step.remaining.length),
    [3, 1],
  );
  const signature = run.steps.map((step) => step.outcome).join(" / ");
  outcomes.add(signature);
  console.log(
    `coin ${target + 1}: ${signature}; candidates 9 -> 3 -> 1; found ${run.found + 1}`,
  );
}
assert.equal(outcomes.size, COINS);
let swept = 0;
for (const normal of [10, 100, 1000]) {
  for (const light of [1, Math.floor(normal / 2), normal - 1]) {
    for (let target = 0; target < COINS; target++) {
      assert.equal(solve(target, COINS, normal, light).found, target);
      swept++;
    }
  }
}
for (const count of [3, 9, 27, 81]) {
  for (let target = 0; target < count; target++) {
    const run = solve(target, count);
    assert.equal(run.found, target);
    assert.equal(run.steps.length, Math.round(Math.log(count) / Math.log(3)));
  }
}
const hero = solve(HERO);
console.log(`mass sweep: ${swept} cases passed`);
console.log("size sweep: every position at 3, 9, 27 and 81 coins passed");
console.log(`shown coin: ${HERO + 1}, the middle input coin`);
console.log(`shown run: ${JSON.stringify(hero)}`);
console.log(
  `one weighing distinguishes at most 3 positions; two distinguish ${outcomes.size}`,
);
