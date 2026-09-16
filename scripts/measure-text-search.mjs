#!/usr/bin/env node

// Six ways to find a phrase in a page of text, and one unit of work.
//
// The reel puts all six on screen at once and lets every panel read the same
// number of characters per frame, so what separates them is how many they need
// to read at all. That only means anything if "reading a character" is the same
// thing in all six, which is what this script exists to pin down.
//
// A read is one access to a character of the text. Comparing text[i] to a
// character of the pattern is a read. Rolling a hash over text[i] is a read.
// Looking at the character just past the window to decide how far to jump is a
// read. Touching the same position twice counts twice, because the machine did
// the work twice.
//
// Reads rather than comparisons, because comparisons quietly flatter
// Rabin-Karp: it compares hashes, not characters, and would come out looking
// like it barely touched the text when in fact it touches all of it. Reads is
// the unit every one of these six pays in.
//
// The claim the count produces: Boyer-Moore finds every occurrence having read
// fewer characters than the text contains. It skips over stretches it never
// looks at, and it can prove it does not need to.

const SEED = 20260916;

/** Roughly a screenful per panel, which is what the reel draws. */
const TARGET_LENGTH = 2400;

const PATTERN = "the machine";

const rng = (seed) => {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
};

// A closed vocabulary, so the text is the same on every machine and in every
// run. It is a fixture rather than a sample of English: the point of it is that
// it has the letter frequencies and the word lengths of prose, not that it
// means anything.
const WORDS = `the of and to in a is that it for on with as was at by an be this
from or which have not are but had they you all were one has more can will
their there we when what your would about time other than into over after
first its also two most such only new some these many then them out could
now work part machine reads every page word line text search pattern letter
character found skip jump window match compare look ahead behind past under
through between before against while where because though until since across`
  .split(/\s+/)
  .filter(Boolean);

const buildText = (seed) => {
  const random = rng(seed);
  const out = [];
  let length = 0;
  let sentence = 0;
  while (length < TARGET_LENGTH) {
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

  // Plant the pattern at fixed fractions, so the number of hits is a property
  // of the fixture rather than of the shuffle.
  const at = [0.18, 0.46, 0.79];
  for (const fraction of at) {
    let i = Math.floor(text.length * fraction);
    while (i < text.length && text[i] !== " ") i++;
    text = text.slice(0, i + 1) + PATTERN + " " + text.slice(i + 1);
  }
  return text.slice(0, TARGET_LENGTH);
};

const TEXT = buildText(SEED);
const M = PATTERN.length;

/** Every algorithm reports through this, so nothing can count its own way. */
const reader = (text) => {
  const touched = new Uint8Array(text.length);
  const order = [];
  let reads = 0;
  return {
    at(i) {
      reads++;
      if (!touched[i]) {
        touched[i] = 1;
        order.push(i);
      }
      return text[i];
    },
    get reads() {
      return reads;
    },
    get distinct() {
      return order.length;
    },
    order,
  };
};

const naive = (r, text) => {
  const N = text.length;
  const hits = [];
  for (let i = 0; i + M <= N; i++) {
    let j = 0;
    while (j < M && r.at(i + j) === PATTERN[j]) j++;
    if (j === M) hits.push(i);
  }
  return hits;
};

const kmp = (r, text) => {
  const N = text.length;
  const fail = new Int32Array(M);
  for (let i = 1, k = 0; i < M; i++) {
    while (k > 0 && PATTERN[i] !== PATTERN[k]) k = fail[k - 1];
    if (PATTERN[i] === PATTERN[k]) k++;
    fail[i] = k;
  }
  const hits = [];
  for (let i = 0, k = 0; i < N; i++) {
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

const badCharTable = () => {
  const last = new Map();
  for (let i = 0; i < M; i++) last.set(PATTERN[i], i);
  return last;
};

const horspool = (r, text) => {
  const N = text.length;
  const shift = new Map();
  for (let i = 0; i < M - 1; i++) shift.set(PATTERN[i], M - 1 - i);
  const hits = [];
  let i = 0;
  while (i + M <= N) {
    let j = M - 1;
    while (j >= 0 && r.at(i + j) === PATTERN[j]) j--;
    if (j < 0) hits.push(i);
    const tail = text[i + M - 1];
    i += shift.get(tail) ?? M;
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

const boyerMoore = (r, text) => {
  const N = text.length;
  const bad = badCharTable();
  const good = goodSuffixTable();
  const hits = [];
  let i = 0;
  while (i + M <= N) {
    let j = M - 1;
    while (j >= 0 && r.at(i + j) === PATTERN[j]) j--;
    if (j < 0) {
      hits.push(i);
      i += good[0];
    } else {
      const c = text[i + j];
      const badShift = j - (bad.has(c) ? bad.get(c) : -1);
      i += Math.max(badShift, good[j + 1]);
    }
  }
  return hits;
};

const sunday = (r, text) => {
  const N = text.length;
  const shift = new Map();
  for (let i = 0; i < M; i++) shift.set(PATTERN[i], M - i);
  const hits = [];
  let i = 0;
  while (i + M <= N) {
    let j = 0;
    while (j < M && r.at(i + j) === PATTERN[j]) j++;
    if (j === M) hits.push(i);
    if (i + M >= N) break;
    const next = r.at(i + M);
    i += shift.get(next) ?? M + 1;
  }
  return hits;
};

const rabinKarp = (r, text) => {
  const N = text.length;
  const BASE = 256;
  const MOD = 1_000_000_007;
  let power = 1;
  for (let i = 0; i < M - 1; i++) power = (power * BASE) % MOD;

  let target = 0;
  for (let i = 0; i < M; i++)
    target = (target * BASE + PATTERN.charCodeAt(i)) % MOD;

  const hits = [];
  let rolling = 0;
  for (let i = 0; i < M; i++)
    rolling = (rolling * BASE + r.at(i).charCodeAt(0)) % MOD;

  for (let i = 0; ; i++) {
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

const ALGORITHMS = [
  ["naive", naive],
  ["kmp", kmp],
  ["rabinkarp", rabinKarp],
  ["horspool", horspool],
  ["boyermoore", boyerMoore],
  ["sunday", sunday],
];

/** The truth, found the dullest possible way. */
const occurrences = (text) => {
  const out = [];
  for (let i = 0; i + M <= text.length; i++) {
    if (text.slice(i, i + M) === PATTERN) out.push(i);
  }
  return out;
};

/** Every matcher over one text, each checked against that truth. */
const measure = (text) => {
  const truth = occurrences(text);
  return ALGORITHMS.map(([name, run]) => {
    const r = reader(text);
    const hits = run(r, text);
    if (hits.join(",") !== truth.join(",")) {
      throw new Error(
        `${name} found ${hits.join(",")} and the text contains ${truth.join(",")}`,
      );
    }
    return {
      name,
      reads: r.reads,
      distinct: r.distinct,
      skipped: text.length - r.distinct,
    };
  });
};

const N = TEXT.length;
const expectedHits = occurrences(TEXT);
const results = measure(TEXT);

const EXPECTED_HIT_COUNT = 3;
if (expectedHits.length !== EXPECTED_HIT_COUNT) {
  throw new Error(
    `fixture has ${expectedHits.length} occurrences, expected ${EXPECTED_HIT_COUNT}`,
  );
}

/**
 * The figures `src/vertical/11-text-search/measurements.ts` is built from.
 *
 * A change to the fixture, the pattern or any implementation moves these, and
 * moving them silently would leave the reel stating numbers no run produces.
 */
const EXPECTED = {
  naive: { reads: 2_705, distinct: 2_390, skipped: 10 },
  kmp: { reads: 2_400, distinct: 2_400, skipped: 0 },
  rabinkarp: { reads: 4_822, distinct: 2_400, skipped: 0 },
  horspool: { reads: 397, distinct: 389, skipped: 2_011 },
  boyermoore: { reads: 376, distinct: 371, skipped: 2_029 },
  sunday: { reads: 702, distinct: 649, skipped: 1_751 },
};

for (const r of results) {
  const { name, ...actual } = r;
  if (JSON.stringify(actual) !== JSON.stringify(EXPECTED[name])) {
    throw new Error(
      `${name} changed: ${JSON.stringify(actual)} is not ` +
        JSON.stringify(EXPECTED[name]),
    );
  }
}

const width = Math.max(...results.map((r) => r.name.length));
console.log(
  `text ${N} characters, pattern "${PATTERN}" (${M}), ${expectedHits.length} occurrences`,
);
console.log(`seed ${SEED}\n`);
for (const r of results) {
  console.log(
    `${r.name.padEnd(width)}  reads=${String(r.reads).padStart(5)}` +
      `  touched=${String(r.distinct).padStart(4)}/${N}` +
      `  never read=${String(r.skipped).padStart(4)}`,
  );
}

const slowest = results.reduce((a, b) => (b.reads > a.reads ? b : a));
const fastest = results.reduce((a, b) => (b.reads < a.reads ? b : a));
console.log(
  `\nmost ${slowest.name} ${slowest.reads} reads, fewest ${fastest.name} ` +
    `${fastest.reads}, ratio ${(slowest.reads / fastest.reads).toFixed(1)}x`,
);

/**
 * The same comparison across a hundred fresh texts, so the chosen one is
 * illustrative rather than load-bearing.
 *
 * Every text is a new fixture from a new seed with the pattern planted at the
 * same three fractions, and every matcher is checked against that text's own
 * occurrences, so this doubles as a correctness sweep for all six.
 */
if (process.env.SWEEP === "1") {
  const coverage = [];
  const ratios = [];
  for (let seed = 1; seed <= 100; seed++) {
    const text = buildText(seed);
    const rows = Object.fromEntries(measure(text).map((r) => [r.name, r]));
    coverage.push(rows.boyermoore.distinct / text.length);
    ratios.push(rows.naive.reads / rows.boyermoore.reads);
  }
  const stat = (a) => {
    const v = [...a].sort((x, y) => x - y);
    return [v[0], v[Math.floor(v.length / 2)], v[v.length - 1]];
  };
  const [cl, cm, ch] = stat(coverage);
  const [rl, rm, rh] = stat(ratios);
  console.log(`\nsweep over 100 texts`);
  console.log(
    `  share of the text Boyer-Moore reads: min ${(cl * 100).toFixed(1)}%, median ${(cm * 100).toFixed(1)}%, max ${(ch * 100).toFixed(1)}%`,
  );
  console.log(
    `  naive reads against Boyer-Moore:     min ${rl.toFixed(1)}x, median ${rm.toFixed(1)}x, max ${rh.toFixed(1)}x`,
  );
}
