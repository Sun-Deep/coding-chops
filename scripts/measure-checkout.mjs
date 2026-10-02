#!/usr/bin/env node

// One shop, three tills, the same shoppers arriving at the same seconds with
// the same checkout times, and two ways of lining up.
//
//   shortest  each shopper joins the till with the fewest people at it, the
//             one being served included, and stays in that line. Ties go to
//             the leftmost till.
//   shared    one line. Whoever is at the front goes to the next till that
//             comes free, leftmost first on a tie.
//
// Checkout times are the only thing a shopper cannot see coming. Most take
// MIN_S to MAX_S seconds. One in SLOW_EVERY hits a price check or a declined
// card and takes SLOW_MIN to SLOW_MAX. Shoppers arrive at random at a rate that
// keeps the tills LOAD busy on average.
//
// Simulated, not timed. Counted per shopper: the wait, from joining a line to
// reaching a till. Nobody switches lines; that is stated with the result.
//
// Usage: node scripts/measure-checkout.mjs
//   SEED=n     the scenario shown
//   YOU=n      the shopper the cut follows
//   RANK=1     list shoppers whose two waits differ most, for picking "you"
//   SWEEP=n    scenarios in the comparison across many (default 1000)

const TILLS = Number(process.env.TILLS ?? 3);
const SHOPPERS = Number(process.env.SHOPPERS ?? 40);
const MIN_S = Number(process.env.MIN_S ?? 20);
const MAX_S = Number(process.env.MAX_S ?? 50);
const SLOW_EVERY = Number(process.env.SLOW_EVERY ?? 8);
const SLOW_MIN = Number(process.env.SLOW_MIN ?? 120);
const SLOW_MAX = Number(process.env.SLOW_MAX ?? 180);
const LOAD = Number(process.env.LOAD ?? 0.85);
const SEED = Number(process.env.SEED ?? 1);
const YOU = Number(process.env.YOU ?? 24);
const SWEEP = Number(process.env.SWEEP ?? 1000);

const rng = (seed) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

const MEAN_S =
  ((SLOW_EVERY - 1) / SLOW_EVERY) * ((MIN_S + MAX_S) / 2) +
  (1 / SLOW_EVERY) * ((SLOW_MIN + SLOW_MAX) / 2);
const GAP = MEAN_S / (LOAD * TILLS);

/** Whole seconds throughout, so every figure is exact and reproducible. */
const scenario = (seed, n = SHOPPERS) => {
  const random = rng(seed);
  const out = [];
  let t = 0;
  for (let id = 0; id < n; id++) {
    t += Math.max(1, Math.round(-Math.log(1 - random()) * GAP));
    const slow = random() < 1 / SLOW_EVERY;
    const s = slow
      ? SLOW_MIN + Math.floor(random() * (SLOW_MAX - SLOW_MIN + 1))
      : MIN_S + Math.floor(random() * (MAX_S - MIN_S + 1));
    out.push({ id, at: t, s, slow });
  }
  return out;
};

/** Each shopper picks the till with the fewest people at it and stays. */
const shortest = (shoppers) => {
  const ends = Array.from({ length: TILLS }, () => []);
  const free = new Array(TILLS).fill(0);
  return shoppers.map((c) => {
    let till = 0;
    let fewest = Infinity;
    for (let k = 0; k < TILLS; k++) {
      const n = ends[k].filter((e) => e > c.at).length;
      if (n < fewest) {
        fewest = n;
        till = k;
      }
    }
    const start = Math.max(c.at, free[till]);
    free[till] = start + c.s;
    ends[till].push(start + c.s);
    return { till, start, end: start + c.s, wait: start - c.at };
  });
};

/** One line, front of it to the next till to come free. */
const shared = (shoppers) => {
  const free = new Array(TILLS).fill(0);
  return shoppers.map((c) => {
    let till = 0;
    for (let k = 1; k < TILLS; k++) if (free[k] < free[till]) till = k;
    const start = Math.max(c.at, free[till]);
    free[till] = start + c.s;
    return { till, start, end: start + c.s, wait: start - c.at };
  });
};

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
};

/** Shoppers who joined after `you` and reached a till before them. */
const overtakers = (shoppers, run, you) =>
  shoppers.filter(
    (c) => c.at > shoppers[you].at && run[c.id].start < run[you].start,
  );

const shoppers = scenario(SEED);
const left = shortest(shoppers);
const right = shared(shoppers);

if (process.env.RANK) {
  const rows = shoppers
    .map((c) => ({
      id: c.id,
      at: c.at,
      l: left[c.id].wait,
      r: right[c.id].wait,
      over: overtakers(shoppers, left, c.id).length,
    }))
    .filter((x) => x.l - x.r > 0)
    .sort((a, b) => b.l - b.r - (a.l - a.r));
  console.log("  id    at  shortest  shared  overtaken");
  for (const x of rows.slice(0, 15)) {
    console.log(
      [x.id, x.at, x.l, x.r, x.over]
        .map((v) => String(v).padStart(6))
        .join(" "),
    );
  }
  process.exit(0);
}

console.log(
  `${TILLS} tills, ${SHOPPERS} shoppers, checkout ${MIN_S} to ${MAX_S}s, 1 in ${SLOW_EVERY} slow at ${SLOW_MIN} to ${SLOW_MAX}s, tills ${LOAD * 100}% busy (a shopper every ${GAP.toFixed(1)}s on average)`,
);
console.log(`seed ${SEED}\n`);
console.log(
  "  id  joins  checkout   shortest: till start wait   shared: till start wait",
);
for (const c of shoppers) {
  const l = left[c.id];
  const r = right[c.id];
  console.log(
    [
      String(c.id).padStart(4),
      String(c.at).padStart(6),
      String(c.s).padStart(6) + (c.slow ? " slow" : "     "),
      String(l.till + 1).padStart(14),
      String(l.start).padStart(6),
      String(l.wait).padStart(5),
      String(r.till + 1).padStart(12),
      String(r.start).padStart(6),
      String(r.wait).padStart(5),
    ].join(" ") + (c.id === YOU ? "   <- you" : ""),
  );
}

const lw = left.map((x) => x.wait);
const rw = right.map((x) => x.wait);
console.log(
  `\nshortest  mean wait ${mean(lw).toFixed(1)}s  95th ${pct(lw, 0.95)}s  longest ${Math.max(...lw)}s`,
);
console.log(
  `shared    mean wait ${mean(rw).toFixed(1)}s  95th ${pct(rw, 0.95)}s  longest ${Math.max(...rw)}s`,
);
const worse = shoppers.filter((c) => left[c.id].wait > right[c.id].wait).length;
const better = shoppers.filter(
  (c) => left[c.id].wait < right[c.id].wait,
).length;
console.log(
  `shoppers who waited longer in the shortest line ${worse}, shorter ${better}, same ${SHOPPERS - worse - better}`,
);
const overtakenShared = shoppers.filter(
  (c) => overtakers(shoppers, right, c.id).length > 0,
).length;
console.log(
  `shoppers overtaken by someone who joined after them: shortest ${shoppers.filter((c) => overtakers(shoppers, left, c.id).length > 0).length}, shared ${overtakenShared}`,
);

if (YOU >= 0) {
  const o = overtakers(shoppers, left, YOU);
  console.log(
    `\nyou (shopper ${YOU}): shortest ${left[YOU].wait}s, shared ${right[YOU].wait}s; overtaken in the shortest line by ${o.map((c) => c.id).join(", ") || "nobody"}`,
  );
}

// ---- across many scenarios -------------------------------------------------

const across = (overrides = {}) => {
  let all = 0;
  let sumL = 0;
  let sumR = 0;
  let worseN = 0;
  let betterN = 0;
  let overtakenL = 0;
  let overtakenR = 0;
  const wl = [];
  const wr = [];
  for (let seed = 1; seed <= SWEEP; seed++) {
    const cs = scenario(seed + 100000, 200);
    const l = shortest(cs);
    const r = shared(cs);
    for (const c of cs) {
      all++;
      sumL += l[c.id].wait;
      sumR += r[c.id].wait;
      wl.push(l[c.id].wait);
      wr.push(r[c.id].wait);
      if (l[c.id].wait > r[c.id].wait) worseN++;
      if (l[c.id].wait < r[c.id].wait) betterN++;
    }
    // Overtaking counted on a sample, it is quadratic.
    if (seed <= 100) {
      for (const c of cs) {
        if (overtakers(cs, l, c.id).length) overtakenL++;
        if (overtakers(cs, r, c.id).length) overtakenR++;
      }
    }
  }
  return {
    shoppers: all,
    meanL: sumL / all,
    meanR: sumR / all,
    p95L: pct(wl, 0.95),
    p95R: pct(wr, 0.95),
    p99L: pct(wl, 0.99),
    p99R: pct(wr, 0.99),
    worse: worseN / all,
    better: betterN / all,
    overtakenL: overtakenL / (Math.min(100, SWEEP) * 200),
    overtakenR: overtakenR / (Math.min(100, SWEEP) * 200),
    ...overrides,
  };
};

const r = across();
console.log(
  `\nacross ${SWEEP} scenarios of 200 shoppers (seeds 100001 to ${100000 + SWEEP}), ${r.shoppers} shoppers`,
);
console.log(
  `mean wait       shortest ${r.meanL.toFixed(1)}s  shared ${r.meanR.toFixed(1)}s  (${((1 - r.meanR / r.meanL) * 100).toFixed(0)}% less)`,
);
console.log(`95th percentile shortest ${r.p95L}s  shared ${r.p95R}s`);
console.log(`99th percentile shortest ${r.p99L}s  shared ${r.p99R}s`);
console.log(
  `waited longer in the shortest line ${(r.worse * 100).toFixed(1)}%, shorter ${(r.better * 100).toFixed(1)}%`,
);
console.log(
  `overtaken by a later shopper (first 100 scenarios) shortest ${(r.overtakenL * 100).toFixed(1)}%, shared ${(r.overtakenR * 100).toFixed(1)}%`,
);
