#!/usr/bin/env node --experimental-strip-types --no-warnings

// One bench at the after-work peak. Whoever has it keeps it through their
// rests, or lifters take turns while the other rests. Who waits less?
//
// The model is imported from the reel's own module,
// src/vertical/35-gym/simulation.ts. Seeded, so the machine cannot move a
// figure.
//
// Printed: the lifter the reel follows, then 100 evenings at the defaults
// and at each other setting. How busy the bench is, how long people rest and
// how long a plate change takes are assumptions the model cannot take from
// data, so the result has to be read across them.
//
// Usage: node --experimental-strip-types scripts/measure-gym.mjs

import {
  GAP,
  LIFT,
  REST,
  RUSH,
  SEED,
  SEEDS,
  SHARE,
  SWAP,
  WALK_IN,
  WINDOW,
  averages,
  hero,
  run,
  toBench,
  toDone,
} from "../src/vertical/35-gym/simulation.ts";

const mmss = (s) => {
  const r = Math.round(s);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};

console.log(
  `a lifter wanting the bench every ${GAP} s on average for ${RUSH / 60} minutes; 3 to 5 sets of ${LIFT} s (25% either way), ${REST} s rest between sets (40% either way), ${SWAP} s to change plates when a different lifter takes the bar (40% either way), ${SHARE} lifters taking turns when sharing; ${WALK_IN} s from the door\n`,
);

const base = averages();
const keep = run("keep", SEED);
const share = run("share", SEED);
const you = hero(keep, base.wait.keep);
console.log(
  `seed ${SEED}, ${keep.length} lifters. The lifter the reel follows: #${you}, whose wait for the bench is closest to the ${SEEDS}-evening average of ${mmss(base.wait.keep)}; walks in at ${mmss(keep[you].arrive)} (${keep[you].arrive.toFixed(1)} s)`,
);
for (const [rule, people] of [
  ["keep", keep],
  ["share", share],
]) {
  const l = people[you];
  console.log(
    `  ${rule.padEnd(5)} wait for the bench ${mmss(toBench(l))}, walk in to last set done ${mmss(toDone(l))}; on the bench at ${l.sets[0].swap.toFixed(1)} s, done at ${l.done.toFixed(1)} s`,
  );
}
console.log(
  "\nseed 1, every lifter: walks in, wait keep -> share, done keep -> share",
);
keep.forEach((k, i) => {
  const s = share[i];
  console.log(
    `  #${i} ${mmss(k.arrive).padStart(6)}  ${k.sets.length} sets  wait ${mmss(toBench(k)).padStart(5)} -> ${mmss(toBench(s)).padStart(5)}  done ${mmss(toDone(k)).padStart(5)} -> ${mmss(toDone(s)).padStart(5)}`,
  );
});

const line = (label, opts = {}) => {
  const a = averages(opts);
  return `${label.padEnd(26)} wait ${mmss(a.wait.keep).padStart(5)} -> ${mmss(a.wait.share).padStart(5)}; done ${mmss(a.total.keep).padStart(5)} -> ${mmss(a.total.share).padStart(5)}; ${(a.later * 100).toFixed(1).padStart(4)}% finish later under sharing, by ${mmss(a.laterBy)} on average (${a.lifters} lifters)`;
};
console.log(
  `\n${SEEDS} evenings each, lifters walking in from ${mmss(WINDOW[0])} to ${mmss(WINDOW[1])}, keep -> share`,
);
console.log(line("defaults"));
for (const gap of [480, 720, 900])
  console.log(line(`a lifter every ${gap} s`, { gap }));
for (const rest of [60, 90, 180])
  console.log(line(`${rest} s rests`, { rest }));
for (const swap of [0, 15, 60, 90, 120])
  console.log(line(`${swap} s plate change`, { swap }));
for (const lift of [30, 60]) console.log(line(`${lift} s sets`, { lift }));
console.log(line("3 lifters taking turns", { share: 3 }));
