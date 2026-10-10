#!/usr/bin/env node --experimental-strip-types --no-warnings

// A burger counter in the lunch rush. One cashier, or six self-order kiosks,
// in front of the same kitchen. Do the kiosks get people their food faster?
//
// The model is imported from the reel's own module,
// src/vertical/32-kiosk/simulation.ts. Seeded, so the machine cannot move a
// figure.
//
// Printed: the customer the reel follows, then 20 rushes at the defaults and
// at each other setting. How long people take at a till or a kiosk, and how
// fast the kitchen is, are assumptions the model cannot take from data, so
// the result has to be read across them.
//
// Usage: node --experimental-strip-types scripts/measure-kiosk.mjs

import {
  COLLECT,
  COOK,
  GAP,
  KIOSKS,
  KIOSK_SLOWER,
  ORDER,
  RUSH,
  SEED,
  SEEDS,
  WINDOW,
  averages,
  forFood,
  hero,
  run,
  toFood,
  toOrder,
} from "../src/vertical/32-kiosk/simulation.ts";

const mmss = (s) =>
  `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

console.log(
  `a customer every ${GAP} s on average for ${RUSH / 60} minutes; ${ORDER} s to order at the till, ${KIOSK_SLOWER}x that at a kiosk, ${KIOSKS} kiosks; the kitchen ${COOK} s an order; ${COLLECT} s to notice a tray and take it\n`,
);

const base = { cashier: averages("cashier"), kiosks: averages("kiosks") };
const cashier = run("cashier", SEED);
const kiosks = run("kiosks", SEED);
const you = hero(cashier, base.cashier.line);
console.log(
  `seed ${SEED}, the customer the reel follows: #${you}, whose wait in the till line is closest to the ${SEEDS}-rush average of ${mmss(base.cashier.line)}; arrives at ${mmss(cashier[you].arrive)}`,
);
for (const [rule, people] of [
  ["cashier", cashier],
  ["kiosks", kiosks],
]) {
  const c = people[you];
  console.log(
    `  ${rule.padEnd(7)} in line ${mmss(toOrder(c))}, ordering ${mmss(c.orderEnd - c.orderStart)}, waiting for food ${mmss(forFood(c))}, door to tray ${mmss(toFood(c))}; order number ${c.number}`,
  );
}

const line = (label, opts = {}) => {
  const a = averages("cashier", opts);
  const b = averages("kiosks", opts);
  return `${label.padEnd(24)} in line ${mmss(a.line)} -> ${mmss(b.line)}; waiting for food ${mmss(a.food)} -> ${mmss(b.food)}; door to tray ${mmss(a.total)} -> ${mmss(b.total)} (${((1 - b.total / a.total) * 100).toFixed(0)}% sooner)`;
};
console.log(
  `\n${SEEDS} rushes each, customers arriving from ${mmss(WINDOW[0])} to ${mmss(WINDOW[1])}, cashier -> kiosks`,
);
console.log(line("defaults"));
for (const cook of [30, 36, 48])
  console.log(line(`kitchen ${cook} s an order`, { cook }));
for (const kioskSlower of [1, 2])
  console.log(line(`kiosk ${kioskSlower}x the till`, { kioskSlower }));
for (const n of [3, 10]) console.log(line(`${n} kiosks`, { kiosks: n }));
for (const order of [35, 55])
  console.log(line(`${order} s at the till`, { order }));
for (const gap of [35, 50])
  console.log(line(`a customer every ${gap} s`, { gap }));
