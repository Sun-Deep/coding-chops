import {
  LENGTH,
  OCCURRENCES,
  PATTERN,
  RUNS,
  SEED,
  type MatcherKey,
  type Run,
} from "./measurements";

/**
 * The page of text and the six matchers, instrumented.
 *
 * A port of `scripts/measure-text-search.mjs`. Nothing in a shot searches
 * anything and nothing in a shot invents a count: a panel reads the order in
 * which characters were touched straight out of here, and the totals are
 * asserted against `measurements.ts` at module load, so a port that drifted
 * from the script cannot reach a render.
 */

const M = PATTERN.length;

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (s * 1_664_525 + 1_013_904_223) >>> 0) / 4_294_967_296;
};

const WORDS = `the of and to in a is that it for on with as was at by an be this
from or which have not are but had they you all were one has more can will
their there we when what your would about time other than into over after
first its also two most such only new some these many then them out could
now work part machine reads every page word line text search pattern letter
character found skip jump window match compare look ahead behind past under
through between before against while where because though until since across`
  .split(/\s+/)
  .filter(Boolean);

const buildText = (seed: number) => {
  const random = rng(seed);
  const out: string[] = [];
  let length = 0;
  let sentence = 0;
  while (length < LENGTH) {
    const word = WORDS[Math.floor(random() * WORDS.length)];
    out.push(word);
    length += word.length + 1;
    sentence++;
    if (sentence > 6 && random() < 0.34) {
      out[out.length - 1] += ".";
      sentence = 0;
    }
  }
  let text = out.join(" ");
  for (const fraction of [0.18, 0.46, 0.79]) {
    let i = Math.floor(text.length * fraction);
    while (i < text.length && text[i] !== " ") i++;
    text = text.slice(0, i + 1) + PATTERN + " " + text.slice(i + 1);
  }
  return text.slice(0, LENGTH);
};

export const TEXT = buildText(SEED);
const N = TEXT.length;

type Reader = {
  at(i: number): string;
  /** Where the pattern is currently lined up. Recorded against every read. */
  align(i: number): void;
  readonly positions: number[];
  readonly windows: number[];
};

const reader = (): Reader => {
  const positions: number[] = [];
  const windows: number[] = [];
  let window = 0;
  return {
    at(i: number) {
      positions.push(i);
      windows.push(window);
      return TEXT[i];
    },
    align(i: number) {
      window = i;
    },
    positions,
    windows,
  };
};

const naive = (r: Reader) => {
  const hits: number[] = [];
  for (let i = 0; i + M <= N; i++) {
    r.align(i);
    let j = 0;
    while (j < M && r.at(i + j) === PATTERN[j]) j++;
    if (j === M) hits.push(i);
  }
  return hits;
};

const kmp = (r: Reader) => {
  const fail = new Int32Array(M);
  for (let i = 1, k = 0; i < M; i++) {
    while (k > 0 && PATTERN[i] !== PATTERN[k]) k = fail[k - 1];
    if (PATTERN[i] === PATTERN[k]) k++;
    fail[i] = k;
  }
  const hits: number[] = [];
  for (let i = 0, k = 0; i < N; i++) {
    r.align(i - k);
    const c = r.at(i);
    while (k > 0 && c !== PATTERN[k]) k = fail[k - 1];
    if (c === PATTERN[k]) k++;
    if (k === M) {
      hits.push(i - M + 1);
      k = fail[k - 1];
    }
  }
  return hits;
};

const horspool = (r: Reader) => {
  const shift = new Map<string, number>();
  for (let i = 0; i < M - 1; i++) shift.set(PATTERN[i], M - 1 - i);
  const hits: number[] = [];
  let i = 0;
  while (i + M <= N) {
    r.align(i);
    let j = M - 1;
    while (j >= 0 && r.at(i + j) === PATTERN[j]) j--;
    if (j < 0) hits.push(i);
    i += shift.get(TEXT[i + M - 1]) ?? M;
  }
  return hits;
};

const goodSuffixTable = () => {
  const shift = new Int32Array(M + 1).fill(M);
  const border = new Int32Array(M + 1);
  let i = M;
  let j = M + 1;
  border[i] = j;
  while (i > 0) {
    while (j <= M && PATTERN[i - 1] !== PATTERN[j - 1]) {
      if (shift[j] === M) shift[j] = j - i;
      j = border[j];
    }
    i--;
    j--;
    border[i] = j;
  }
  j = border[0];
  for (let k = 0; k <= M; k++) {
    if (shift[k] === M) shift[k] = j;
    if (k === j) j = border[j];
  }
  return shift;
};

const boyerMoore = (r: Reader) => {
  const bad = new Map<string, number>();
  for (let i = 0; i < M; i++) bad.set(PATTERN[i], i);
  const good = goodSuffixTable();
  const hits: number[] = [];
  let i = 0;
  while (i + M <= N) {
    r.align(i);
    let j = M - 1;
    while (j >= 0 && r.at(i + j) === PATTERN[j]) j--;
    if (j < 0) {
      hits.push(i);
      i += good[0];
    } else {
      const c = TEXT[i + j];
      i += Math.max(
        j - (bad.has(c) ? (bad.get(c) as number) : -1),
        good[j + 1],
      );
    }
  }
  return hits;
};

const sunday = (r: Reader) => {
  const shift = new Map<string, number>();
  for (let i = 0; i < M; i++) shift.set(PATTERN[i], M - i);
  const hits: number[] = [];
  let i = 0;
  while (i + M <= N) {
    r.align(i);
    let j = 0;
    while (j < M && r.at(i + j) === PATTERN[j]) j++;
    if (j === M) hits.push(i);
    if (i + M >= N) break;
    i += shift.get(r.at(i + M)) ?? M + 1;
  }
  return hits;
};

const rabinKarp = (r: Reader) => {
  const BASE = 256;
  const MOD = 1_000_000_007;
  let power = 1;
  for (let i = 0; i < M - 1; i++) power = (power * BASE) % MOD;
  let target = 0;
  for (let i = 0; i < M; i++)
    target = (target * BASE + PATTERN.charCodeAt(i)) % MOD;

  const hits: number[] = [];
  let rolling = 0;
  for (let i = 0; i < M; i++)
    rolling = (rolling * BASE + r.at(i).charCodeAt(0)) % MOD;

  for (let i = 0; ; i++) {
    r.align(i);
    if (rolling === target) {
      let j = 0;
      while (j < M && r.at(i + j) === PATTERN[j]) j++;
      if (j === M) hits.push(i);
    }
    if (i + M >= N) break;
    const out = r.at(i).charCodeAt(0);
    const into = r.at(i + M).charCodeAt(0);
    rolling = (rolling - ((out * power) % MOD) + MOD) % MOD;
    rolling = (rolling * BASE + into) % MOD;
  }
  return hits;
};

const TRUTH: number[] = [];
for (let i = 0; i + M <= N; i++) {
  if (TEXT.slice(i, i + M) === PATTERN) TRUTH.push(i);
}
if (TRUTH.length !== OCCURRENCES) {
  throw new Error(
    `fixture has ${TRUTH.length} occurrences, expected ${OCCURRENCES}`,
  );
}

export type Playback = {
  readonly key: MatcherKey;
  readonly run: Run;
  /**
   * How far into the page the matcher had got by each read.
   *
   * The furthest character it had touched, which only ever rises. The reel puts
   * every panel on this rather than on a count of reads: Boyer-Moore is done
   * after eight per cent of the total work, so a clock counting reads would
   * stop three panels inside the first two seconds and hold them there. On
   * position, all six sweep the page together and what separates them is how
   * much of it they light up.
   */
  readonly frontier: Int32Array;
  /** The read at which each character was first touched, or -1. */
  readonly touchedAt: Int32Array;
  /** Where the phrase was found. */
  readonly hits: readonly number[];
  /** Where the pattern was lined up at each read, for the verdict's window. */
  readonly windows: Int32Array;
};

const build = (key: MatcherKey, run: (r: Reader) => number[]): Playback => {
  const r = reader();
  const hits = run(r);
  if (hits.join(",") !== TRUTH.join(",")) {
    throw new Error(
      `${key} found ${hits.join(",")} and the text contains ${TRUTH.join(",")}`,
    );
  }

  const touchedAt = new Int32Array(N).fill(-1);
  const frontier = new Int32Array(r.positions.length);
  let furthest = -1;
  r.positions.forEach((position, index) => {
    if (touchedAt[position] < 0) touchedAt[position] = index;
    if (position > furthest) furthest = position;
    frontier[index] = furthest;
  });

  let distinct = 0;
  for (let i = 0; i < N; i++) if (touchedAt[i] >= 0) distinct++;

  const expected = RUNS[key];
  const actual = {
    reads: r.positions.length,
    distinct,
    skipped: N - distinct,
  };
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${key}: ${JSON.stringify(actual)} does not match the measured ` +
        JSON.stringify(expected),
    );
  }

  return {
    key,
    run: expected,
    frontier,
    touchedAt,
    hits,
    windows: Int32Array.from(r.windows),
  };
};

export type Matcher = {
  readonly key: MatcherKey;
  readonly name: string;
  readonly note: string;
  readonly playback: Playback;
};

/**
 * Grid order, and it is the argument.
 *
 * The left column reads every character of the page and the right column does
 * not, so by the end the two columns are two different pictures and the claim
 * is made before a number has been read. The headings over the grid say which
 * column is which, because none of these six names tells a viewer anything.
 *
 * The note beside each name is what the matcher does in plain words rather than
 * what it is called. "Boyer-Moore" is a reference a viewer can look up later;
 * "jumps on two rules" is what they need in the second they have.
 */
export const MATCHERS: readonly Matcher[] = (
  [
    ["naive", "Naive", "checks every spot", naive],
    ["horspool", "Horspool", "jumps on a bad letter", horspool],
    ["kmp", "KMP", "never re-reads", kmp],
    ["boyermoore", "Boyer-Moore", "jumps on two rules", boyerMoore],
    ["rabinkarp", "Rabin-Karp", "hashes every spot", rabinKarp],
    ["sunday", "Sunday", "peeks one past the end", sunday],
  ] as const
).map(([key, name, note, run]) => ({
  key,
  name,
  note,
  playback: build(key, run),
}));

export const byKey = (key: MatcherKey) => {
  const found = MATCHERS.find((m) => m.key === key);
  if (!found) throw new Error(`no matcher ${key}`);
  return found;
};

/**
 * Reads a matcher has made by the time the sweep reaches `position`.
 *
 * `frontier` only rises, so this is a binary search rather than a scan, which
 * matters because it runs six times a frame for four hundred and twenty frames.
 */
export const readsAtPosition = (playback: Playback, position: number) => {
  const { frontier } = playback;
  let low = 0;
  let high = frontier.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (frontier[mid] <= position) low = mid + 1;
    else high = mid;
  }
  return low;
};
