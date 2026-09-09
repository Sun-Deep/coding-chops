// Reproduce the measurements behind the rate limiting reel.
//
// Usage: node --expose-gc scripts/measure-rate-limiting.mjs
//
// Two things get measured. What each algorithm lets through when a client
// attacks the window boundary, and what each one costs in memory per user.
//
// The request counts are exact rather than sampled. These are deterministic
// simulations of the algorithms against a fixed timeline, so the numbers are
// properties of the algorithms and repeat to the digit on any machine. The
// memory figures are real heap, measured on this one, and those do move.
//
// Every number in `src/vertical/03-rate-limiting/measurements.ts` comes from
// here. Output is recorded in
// `curriculum/vertical/03-rate-limiting/measurements.md`.

const LIMIT = 100;
const WINDOW = 60_000;

/** Fixed window. One counter, reset on the hour. The cheap wrong one. */
class FixedWindow {
  constructor() {
    this.window = -1;
    this.count = 0;
  }
  allow(t) {
    const w = Math.floor(t / WINDOW);
    if (w !== this.window) {
      this.window = w;
      this.count = 0;
    }
    if (this.count < LIMIT) {
      this.count += 1;
      return true;
    }
    return false;
  }
}

/** Sliding window log. Every timestamp kept. Exact, and the reason it is exact
 *  is the reason it is expensive. */
class SlidingLog {
  constructor() {
    this.log = [];
  }
  allow(t) {
    while (this.log.length > 0 && this.log[0] <= t - WINDOW) this.log.shift();
    if (this.log.length < LIMIT) {
      this.log.push(t);
      return true;
    }
    return false;
  }
}

/** Sliding window counter. The weighted approximation, two counters. */
class SlidingCounter {
  constructor() {
    this.window = -1;
    this.count = 0;
    this.previous = 0;
  }
  allow(t) {
    const w = Math.floor(t / WINDOW);
    if (w !== this.window) {
      this.previous = w === this.window + 1 ? this.count : 0;
      this.window = w;
      this.count = 0;
    }
    const elapsed = t - w * WINDOW;
    const estimate = this.previous * (1 - elapsed / WINDOW) + this.count;
    if (estimate < LIMIT) {
      this.count += 1;
      return true;
    }
    return false;
  }
}

/** Token bucket. Two numbers, and a burst allowance that is on purpose. */
class TokenBucket {
  constructor() {
    this.tokens = LIMIT;
    this.last = 0;
  }
  allow(t) {
    this.tokens = Math.min(
      LIMIT,
      this.tokens + ((t - this.last) * LIMIT) / WINDOW,
    );
    this.last = t;
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}

const ALGORITHMS = [
  ["Fixed window", FixedWindow],
  ["Sliding window log", SlidingLog],
  ["Sliding window counter", SlidingCounter],
  ["Token bucket", TokenBucket],
];

/**
 * The boundary attack.
 *
 * 100 requests in the last second before a window rolls over, then 100 more in
 * the first second after. Two hundred requests inside two seconds, against a
 * limit of a hundred a minute.
 */
const timeline = [];
for (let i = 0; i < LIMIT; i += 1) timeline.push(59_000 + i * 10);
for (let i = 0; i < LIMIT; i += 1) timeline.push(60_000 + i * 10);

console.log(`limit ${LIMIT} requests per ${WINDOW / 1000}s`);
console.log(
  `attack: ${LIMIT} requests at t=59.00s to 59.99s, ${LIMIT} more at t=60.00s to 60.99s`,
);
console.log(
  `${timeline.length} requests across ${(timeline.at(-1) - timeline[0]) / 1000}s\n`,
);

console.log("== what gets through ==");
const allowedAt = new Map();
for (const [name, Limiter] of ALGORITHMS) {
  const limiter = new Limiter();
  const passed = [];
  for (const t of timeline) if (limiter.allow(t)) passed.push(t);
  allowedAt.set(name, passed);
  console.log(
    `  ${name.padEnd(24)} allowed ${String(passed.length).padStart(3)}` +
      `   rejected ${String(timeline.length - passed.length).padStart(3)}`,
  );
}

console.log("\n== worst rolling 60s window each one permits ==");
for (const [name] of ALGORITHMS) {
  const passed = allowedAt.get(name);
  let worst = 0;
  for (const start of passed) {
    const inWindow = passed.filter(
      (t) => t >= start && t < start + WINDOW,
    ).length;
    if (inWindow > worst) worst = inWindow;
  }
  console.log(`  ${name.padEnd(24)} ${worst}`);
}

console.log("\n== heap per user, 100,000 users, real bytes ==");
const USERS = 100_000;
for (const [name, Limiter] of ALGORITHMS) {
  global.gc();
  const before = process.memoryUsage().heapUsed;
  const users = new Array(USERS);
  for (let i = 0; i < USERS; i += 1) {
    const limiter = new Limiter();
    // Put each user at the state the limiter reaches under real traffic, since
    // an empty sliding log costs nothing and a full one is the whole point.
    for (let k = 0; k < LIMIT; k += 1) limiter.allow(k * 10);
    users[i] = limiter;
  }
  global.gc();
  const after = process.memoryUsage().heapUsed;
  const total = after - before;
  console.log(
    `  ${name.padEnd(24)} ${String(Math.round(total / USERS)).padStart(5)} bytes` +
      `   ${(total / 1024 / 1024).toFixed(1)} MB for ${USERS.toLocaleString()} users`,
  );
  users.length = 0;
}
