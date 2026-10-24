#!/usr/bin/env node
/* global console, process */

// Best Time to Buy and Sell Stock (LeetCode 121), the two ways the voiced
// pilot teaches, run on this machine.
//
// The example from the problem, [7, 1, 5, 3, 6, 4], answered both ways. Then
// 100,000 seeded prices from 0 to 10,000, the problem's own limits, answered
// both ways: every pair, and one pass carrying the cheapest price so far.
// Counted: the pairs every-pair checks and the steps the one pass takes.
// Timed: each way, five runs, the median kept.
//
// The two must agree on both inputs, the example must come out at 5, and the
// pair counts must be n(n-1)/2. The times depend on the machine, so they are
// checked against the band recorded in
// src/vertical/48-stock-lesson/measurements.ts rather than to the millisecond;
// the script exits 1 if anything disagrees.
//
// Usage: node --experimental-strip-types scripts/measure-stock.mjs

import { cpus } from "node:os";

const N = 100_000;
const MAX_PRICE = 10_000;
const RUNS = 5;
const EXAMPLE = [7, 1, 5, 3, 6, 4];

/** A small seeded generator (mulberry32). */
const random = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Every buy day against every later sell day. */
const everyPair = (prices) => {
  let best = 0;
  let pairs = 0;
  for (let buy = 0; buy < prices.length; buy++)
    for (let sell = buy + 1; sell < prices.length; sell++) {
      pairs++;
      const profit = prices[sell] - prices[buy];
      if (profit > best) best = profit;
    }
  return { best, pairs };
};

/** One walk, carrying the cheapest price so far and the best profit so far. */
const onePass = (prices) => {
  let minPrice = prices[0];
  let maxProfit = 0;
  let steps = 0;
  for (let i = 1; i < prices.length; i++) {
    steps++;
    maxProfit = Math.max(maxProfit, prices[i] - minPrice);
    minPrice = Math.min(minPrice, prices[i]);
  }
  return { best: maxProfit, steps };
};

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const time = (fn, prices) => {
  const ms = [];
  let out;
  for (let r = 0; r < RUNS; r++) {
    const t0 = process.hrtime.bigint();
    out = fn(prices);
    ms.push(Number(process.hrtime.bigint() - t0) / 1e6);
  }
  return { ...out, ms: median(ms), runs: ms };
};

const rng = random(48);
const big = Array.from({ length: N }, () =>
  Math.floor(rng() * (MAX_PRICE + 1)),
);

const say = (s = "") => console.log(s);
say("== machine");
say(`${cpus()[0].model}, Node ${process.version}`);
say();

const exPair = everyPair(EXAMPLE);
const exPass = onePass(EXAMPLE);
say(`== example [${EXAMPLE.join(", ")}]`);
say(`every pair: answer ${exPair.best}, ${exPair.pairs} pairs`);
say(`one pass:   answer ${exPass.best}, ${exPass.steps} steps`);
say();

const pair = time(everyPair, big);
const pass = time(onePass, big);
say(
  `== ${N.toLocaleString("en-US")} seeded prices, 0 to ${MAX_PRICE.toLocaleString("en-US")}`,
);
say(
  `every pair: answer ${pair.best}, ${pair.pairs.toLocaleString("en-US")} pairs, median ${pair.ms.toFixed(0)} ms (${pair.runs.map((x) => x.toFixed(0)).join(", ")})`,
);
say(
  `one pass:   answer ${pass.best}, ${pass.steps.toLocaleString("en-US")} steps, median ${pass.ms.toFixed(3)} ms (${pass.runs.map((x) => x.toFixed(3)).join(", ")})`,
);
say();

const { RUN } = await import("../src/vertical/48-stock-lesson/measurements.ts");
const problems = [];
const pairsOf = (n) => (n * (n - 1)) / 2;
if (exPair.best !== 5 || exPass.best !== 5)
  problems.push("the example does not come out at 5");
if (exPair.pairs !== pairsOf(EXAMPLE.length))
  problems.push("the example's pair count is not n(n-1)/2");
if (pair.best !== pass.best)
  problems.push("the two ways disagree on the big input");
if (pair.pairs !== pairsOf(N))
  problems.push("the big pair count is not n(n-1)/2");
if (
  RUN.example.answer !== exPass.best ||
  RUN.example.pairs !== exPair.pairs ||
  RUN.big.n !== N ||
  RUN.big.pairs !== pair.pairs ||
  RUN.big.steps !== pass.steps ||
  RUN.big.answer !== pass.best
)
  problems.push("measurements.ts disagrees with this run's counts");
const [lo, hi] = RUN.big.pairMs;
if (pair.ms < lo * 0.7 || pair.ms > hi * 1.3)
  problems.push(
    `every pair took ${pair.ms.toFixed(0)} ms, outside ${lo} to ${hi} ms by more than 30%`,
  );
if (pass.ms > RUN.big.passMsUnder)
  problems.push(
    `one pass took ${pass.ms.toFixed(3)} ms, over ${RUN.big.passMsUnder} ms`,
  );

if (problems.length) {
  for (const p of problems) say(`== MISMATCH: ${p}`);
  process.exitCode = 1;
} else say("== measurements.ts matches this run");
