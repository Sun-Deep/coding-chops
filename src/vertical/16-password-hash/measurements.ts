/**
 * From `scripts/measure-password-hashing.mjs`.
 *
 * Every figure here is exact and holds on any machine. SHA-256 is a
 * specification rather than an implementation, so these digests are the digests
 * anywhere, and the collision count is arithmetic about a set. There are no
 * timings in this cut, so unlike VR01 and VR07 nothing has to go on screen as a
 * ratio to survive a second run.
 *
 * The constants below are not trusted. The block at the bottom recomputes all
 * of them from `sha256.ts` when this module loads, including the full five
 * thousand sample sweep, and throws if a single one disagrees. That makes three
 * independent SHA-256 implementations in the chain: OpenSSL through
 * `node:crypto`, the `shasum` binary, and the one in this folder. A number can
 * only reach the screen if all three produced it.
 */

import { bitsDiffering, charsSurviving, sha256 } from "./sha256";

/** A digest is 64 hex characters, which is 256 bits, whatever went in. */
export const HEX_DIGITS = 64;
export const DIGEST_BITS = 256;

/** The pair the cut is built on. One character apart. */
export const BEFORE = "hunter2";
export const AFTER = "hunter3";

/**
 * What that one character did.
 *
 * `kept` is the figure the viewer can check, because it is the one they can see:
 * three characters of the printed digest are still in the same place. `bits` is
 * the figure that is true about the mechanism. The frame shows both and the
 * narration only claims the one on screen.
 */
export const HERO = {
  before: "f52fbd32b2b3b86ff88ef6c490628285f482af15ddcb29541f94bcf526a3f6c7",
  after: "fb8c2e2b85ca81eb4350199faddd983cb26af3064614e737ea9f479621cfa57a",
  bits: 146,
  kept: 3,
  changed: 61,
} as const;

/**
 * The same one-character edit, five thousand times.
 *
 * One pair is an anecdote. This is the claim: a single changed character moves
 * a mean of exactly half the bits in the digest. The hero pair's 146 is inside
 * the measured range rather than being the reason for it, and the script
 * asserts that too.
 */
export const SWEEP = {
  samples: 5_000,
  meanBits: 128.0,
  lowBits: 96,
  highBits: 156,
  meanKept: 4.0,
  mostKept: 12,
} as const;

/** Whatever goes in, 64 characters come out. */
export const LENGTHS: readonly number[] = [1, 7, 20, 100, 10_000];

/**
 * The catch, and the reason salt exists.
 *
 * A thousand accounts that all chose the worst password there is. Hashed
 * plainly they are one row repeated, so one guess opens all thousand. Given a
 * salt each they are a thousand different rows and every account has to be
 * attacked on its own.
 */
export const ACCOUNTS = 1_000;
export const WORST = "123456";
export const UNSALTED_ROWS = 1;
export const SALTED_ROWS = ACCOUNTS;

/** The alphabet the sweep draws from, and the one the sweep edits with. */
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const WORD_LENGTH = 6;
const SEED = 20260922;

/**
 * mulberry32, seeded once, so the sweep reproduces exactly.
 *
 * Ported from the script character for character rather than reimplemented.
 * A generator that drew from `randomBytes` would give a different mean on every
 * run and the reel would be printing a figure nobody could check.
 */
const seeded = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const runSweep = () => {
  const raw = seeded(SEED);
  const rng = (n: number) => Math.floor(raw() * n);
  let total = 0;
  let keptTotal = 0;
  let lowest = DIGEST_BITS;
  let highest = 0;
  let keptMost = 0;
  for (let i = 0; i < SWEEP.samples; i++) {
    let word = "";
    for (let c = 0; c < WORD_LENGTH; c++) word += ALPHABET[rng(ALPHABET.length)];
    const at = rng(word.length);
    let replacement = ALPHABET[rng(ALPHABET.length)];
    while (replacement === word[at]) replacement = ALPHABET[rng(ALPHABET.length)];
    const edited = word.slice(0, at) + replacement + word.slice(at + 1);
    const a = sha256(word);
    const b = sha256(edited);
    const moved = bitsDiffering(a, b);
    const kept = charsSurviving(a, b);
    total += moved;
    keptTotal += kept;
    lowest = Math.min(lowest, moved);
    highest = Math.max(highest, moved);
    keptMost = Math.max(keptMost, kept);
  }
  return {
    meanBits: Number((total / SWEEP.samples).toFixed(1)),
    lowBits: lowest,
    highBits: highest,
    meanKept: Number((keptTotal / SWEEP.samples).toFixed(1)),
    mostKept: keptMost,
  };
};

const disagree = (what: string, measured: unknown, here: unknown) => {
  throw new Error(
    `VR16 ${what}: the script measured ${String(measured)} and this module says ${String(here)}`,
  );
};

{
  const before = sha256(BEFORE);
  const after = sha256(AFTER);
  if (before !== HERO.before) disagree(`sha256(${BEFORE})`, before, HERO.before);
  if (after !== HERO.after) disagree(`sha256(${AFTER})`, after, HERO.after);

  const bits = bitsDiffering(before, after);
  const kept = charsSurviving(before, after);
  if (bits !== HERO.bits) disagree("hero bits changed", bits, HERO.bits);
  if (kept !== HERO.kept) disagree("hero characters kept", kept, HERO.kept);
  if (HERO.kept + HERO.changed !== HEX_DIGITS) {
    disagree("hero kept plus changed", HEX_DIGITS, HERO.kept + HERO.changed);
  }

  for (const n of LENGTHS) {
    const digest = sha256("a".repeat(n));
    if (digest.length !== HEX_DIGITS) {
      disagree(`digest length for ${n} characters`, HEX_DIGITS, digest.length);
    }
  }

  const swept = runSweep();
  for (const key of ["meanBits", "lowBits", "highBits", "meanKept", "mostKept"] as const) {
    if (swept[key] !== SWEEP[key]) disagree(`sweep ${key}`, SWEEP[key], swept[key]);
  }
  if (HERO.bits < SWEEP.lowBits || HERO.bits > SWEEP.highBits) {
    disagree("hero bits inside the sweep range", `${SWEEP.lowBits}..${SWEEP.highBits}`, HERO.bits);
  }

  // The salted and unsalted row counts are arithmetic about a set rather than
  // something to recompute, but the relationship is worth holding: one row for
  // everybody, or one row each, and nothing in between.
  if (UNSALTED_ROWS !== 1 || SALTED_ROWS !== ACCOUNTS) {
    disagree("row counts", `1 and ${ACCOUNTS}`, `${UNSALTED_ROWS} and ${SALTED_ROWS}`);
  }
}
