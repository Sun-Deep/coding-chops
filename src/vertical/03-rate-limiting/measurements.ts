/**
 * Every number this reel puts on screen, and the algorithms that produce them.
 *
 * The request counts are not copied out of a run. The limiters below are the
 * same three the measurement script uses, and the shots ask them directly which
 * requests got through, so the picture cannot drift from the claim. Change a
 * limiter and the frame changes with it.
 *
 * The memory figures are real heap, measured on 2026-09-08 by
 * `scripts/measure-rate-limiting.mjs` over 100,000 users. The full run is in
 * `curriculum/vertical/03-rate-limiting/measurements.md`.
 */

export const LIMIT = 100;
export const WINDOW_MS = 60_000;

/**
 * The attack. 100 requests in the last second before the clock minute rolls
 * over, then 100 more in the first second after.
 *
 * Two hundred requests inside two seconds, against a limit of a hundred a
 * minute. Nothing about it is unusual traffic. It is what a client with a
 * retry loop and a clock does by accident.
 */
export const REQUESTS: readonly number[] = [
  ...Array.from({ length: LIMIT }, (_, i) => 59_000 + i * 10),
  ...Array.from({ length: LIMIT }, (_, i) => 60_000 + i * 10),
];

/** Index in `REQUESTS` where the clock minute rolls over. */
export const SEAM = LIMIT;

type Limiter = (t: number) => boolean;

/** One counter per clock minute, reset on the boundary. */
const fixedWindow = (): Limiter => {
  let window = -1;
  let count = 0;
  return (t) => {
    const w = Math.floor(t / WINDOW_MS);
    if (w !== window) {
      window = w;
      count = 0;
    }
    if (count < LIMIT) {
      count += 1;
      return true;
    }
    return false;
  };
};

/** Every timestamp kept. The reason it is exact is the reason it is expensive. */
const slidingLog = (): Limiter => {
  const log: number[] = [];
  return (t) => {
    while (log.length > 0 && log[0] <= t - WINDOW_MS) log.shift();
    if (log.length < LIMIT) {
      log.push(t);
      return true;
    }
    return false;
  };
};

/** Two numbers, and a burst allowance that is on purpose rather than by accident. */
const tokenBucket = (): Limiter => {
  let tokens = LIMIT;
  let last = 0;
  return (t) => {
    tokens = Math.min(LIMIT, tokens + ((t - last) * LIMIT) / WINDOW_MS);
    last = t;
    if (tokens >= 1) {
      tokens -= 1;
      TOKENS.push(tokens);
      return true;
    }
    TOKENS.push(tokens);
    return false;
  };
};

/**
 * Tokens left after each of the 200 requests.
 *
 * Filled by the limiter above rather than modelled beside it, so the gauge in
 * the shot is reading the same number the decision was made on. Empty until
 * `BUCKET` runs, which happens at module load.
 */
const TOKENS: number[] = [];

const run = (make: () => Limiter) => {
  const limiter = make();
  return REQUESTS.map((t) => limiter(t));
};

export type Algorithm = {
  /** The name on the label and in the verdict table. */
  name: string;
  /** What it stores, in the fewest words that are still true. */
  state: string;
  /** Which of the 200 requests it let through. */
  allowed: readonly boolean[];
  /** Heap per user at 100,000 users, in bytes. */
  bytes: number;
};

const withCounts = (
  a: Omit<Algorithm, "allowed"> & { allowed: boolean[] },
) => ({
  ...a,
  count: a.allowed.filter(Boolean).length,
});

export const FIXED = withCounts({
  name: "Fixed window",
  state: "1 counter",
  allowed: run(fixedWindow),
  bytes: 48,
});

export const SLIDING = withCounts({
  name: "Sliding window log",
  state: "100 timestamps",
  allowed: run(slidingLog),
  bytes: 1208,
});

export const BUCKET = withCounts({
  name: "Token bucket",
  state: "2 numbers",
  allowed: run(tokenBucket),
  bytes: 64,
});

export const ALGORITHMS = [FIXED, SLIDING, BUCKET] as const;

/** Tokens remaining after each request, 100 down to nearly nothing. */
export const BUCKET_TOKENS: readonly number[] = TOKENS;

/** 1,208 over 48. What an exact limit costs against the cheap wrong one. */
export const MEMORY_RATIO = Math.round(SLIDING.bytes / FIXED.bytes);

/** Heap for 100,000 users, in megabytes, from the measurement run. */
export const AT_100K = { fixed: 4.6, sliding: 115.2, bucket: 6.1 } as const;

export const commas = (value: number) => value.toLocaleString("en-US");
