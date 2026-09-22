#!/usr/bin/env node

// What a site stores instead of your password.
//
// Everything here is a count. A bit that flipped and a row that collided are
// properties of the hash function; a millisecond is a property of this laptop,
// and the one place a duration would be the finding it is reported as a ratio.
//
// The hashing is done twice, by two implementations that share nothing.
//
// The first is Node's `node:crypto`, which is OpenSSL underneath. The second is
// the `shasum -a 256` binary that ships with macOS. If the two ever disagree on
// a single digest the script throws, so a digest that reached the screen was
// produced by two independent SHA-256s.
//
// The avalanche figure is the one that carries the cut, so it is not taken from
// the hero pair. One pair is an anecdote. It is measured across thousands of
// one-character edits and reported as a mean with its range, and the hero pair
// is then shown to sit inside that range rather than being the reason for it.

import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import { execFileSync } from "node:child_process";

const HEX_DIGITS = 64;
const DIGEST_BITS = 256;

/** SHA-256, the way the reel means it: text in, 64 hex characters out. */
const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

/**
 * The same digest from a binary that shares no code with Node.
 *
 * `shasum` reads stdin, so a password with a newline or a shell metacharacter
 * in it cannot change what is hashed. Everything in this script is plain ASCII
 * anyway, and that is the point of checking rather than assuming.
 */
const sha256External = (text) =>
  execFileSync("shasum", ["-a", "256"], { input: text }).toString().split(" ")[0];

/** Hash once, prove it twice. */
const digestOf = (text) => {
  const node = sha256(text);
  const binary = sha256External(text);
  if (node !== binary) {
    throw new Error(`${JSON.stringify(text)}: node says ${node}, shasum says ${binary}`);
  }
  if (node.length !== HEX_DIGITS) {
    throw new Error(`${JSON.stringify(text)}: ${node.length} hex digits, expected ${HEX_DIGITS}`);
  }
  return node;
};

const bitsOf = (hex) =>
  [...hex].map((c) => parseInt(c, 16).toString(2).padStart(4, "0")).join("");

/** How many of the 256 bits are not the same. */
const bitsDiffering = (a, b) => {
  const x = bitsOf(a);
  const y = bitsOf(b);
  let n = 0;
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) n++;
  return n;
};

/** How many of the 64 printed characters survive in place. */
const charsSurviving = (a, b) => {
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) n++;
  return n;
};

// ---------------------------------------------------------------------------
// 1. The hero pair.
// ---------------------------------------------------------------------------

const BEFORE = "hunter2";
const AFTER = "hunter3";

const heroBefore = digestOf(BEFORE);
const heroAfter = digestOf(AFTER);
const heroBits = bitsDiffering(heroBefore, heroAfter);
const heroChars = charsSurviving(heroBefore, heroAfter);

console.log("# What one changed character does");
console.log();
console.log(`  ${BEFORE}   ${heroBefore}`);
console.log(`  ${AFTER}   ${heroAfter}`);
console.log();
console.log(`  bits changed        ${heroBits} of ${DIGEST_BITS}`);
console.log(`  characters kept     ${heroChars} of ${HEX_DIGITS}`);
console.log(`  characters changed  ${HEX_DIGITS - heroChars} of ${HEX_DIGITS}`);
console.log();

// ---------------------------------------------------------------------------
// 2. The avalanche, across thousands of edits rather than one.
// ---------------------------------------------------------------------------

/**
 * Change exactly one character of a password and count what moved.
 *
 * The edit is a single character substitution at a random position, which is
 * the edit a human makes when a site rejects their password, and it is the
 * smallest change the reel can honestly call "one letter".
 */
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const oneCharEdit = (word, rng) => {
  const at = rng(word.length);
  let replacement = ALPHABET[rng(ALPHABET.length)];
  while (replacement === word[at]) replacement = ALPHABET[rng(ALPHABET.length)];
  return word.slice(0, at) + replacement + word.slice(at + 1);
};

/**
 * A seeded generator, so the sweep reproduces exactly between runs.
 *
 * `randomBytes` would give a different mean every time and the reel would be
 * printing a number that cannot be checked. mulberry32, seeded once.
 */
const seeded = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const SWEEP = 5_000;
const raw = seeded(20260922);
const rng = (n) => Math.floor(raw() * n);

let total = 0;
let lowest = DIGEST_BITS;
let highest = 0;
let keptTotal = 0;
let keptMost = 0;
// Hashing 10,000 strings through a subprocess each would take minutes, so the
// sweep uses Node alone. Every digest that reaches the screen is still checked
// against the binary; this loop only produces a distribution.
for (let i = 0; i < SWEEP; i++) {
  const word = ALPHABET.slice(0, 6)
    .split("")
    .map(() => ALPHABET[rng(ALPHABET.length)])
    .join("");
  const edited = oneCharEdit(word, rng);
  const moved = bitsDiffering(sha256(word), sha256(edited));
  const kept = charsSurviving(sha256(word), sha256(edited));
  total += moved;
  keptTotal += kept;
  keptMost = Math.max(keptMost, kept);
  lowest = Math.min(lowest, moved);
  highest = Math.max(highest, moved);
}
const mean = total / SWEEP;

console.log(`# The same edit ${SWEEP.toLocaleString("en-US")} times`);
console.log();
console.log(`  bits changed, mean  ${mean.toFixed(1)} of ${DIGEST_BITS}`);
console.log(`  bits changed, range ${lowest} to ${highest}`);
console.log(`  characters kept     ${(keptTotal / SWEEP).toFixed(1)} of ${HEX_DIGITS} on average, ${keptMost} at most`);
console.log();
if (heroBits < lowest || heroBits > highest) {
  throw new Error(
    `the hero pair moved ${heroBits} bits, outside the measured range ${lowest} to ${highest}`,
  );
}
console.log(`  the hero pair's ${heroBits} sits inside that range, so it is ordinary`);
console.log();

// Half of 256 is 128, and a hash that did not flip about half its bits on a
// one-character change would be a broken one. Worth asserting rather than
// admiring: a mean that drifted off 128 would mean this script is wrong.
if (Math.abs(mean - DIGEST_BITS / 2) > 2) {
  throw new Error(`mean avalanche ${mean.toFixed(1)} is not about half of ${DIGEST_BITS}`);
}

// ---------------------------------------------------------------------------
// 3. Length in, always 64 out.
// ---------------------------------------------------------------------------

const LENGTHS = [1, 7, 20, 100, 10_000];
console.log("# Any length in, the same length out");
console.log();
for (const n of LENGTHS) {
  const digest = digestOf("a".repeat(n));
  console.log(`  ${String(n).padStart(6)} characters in   ${digest.length} hex out   ${digest.slice(0, 16)}...`);
}
console.log();

// ---------------------------------------------------------------------------
// 4. The catch: the same password gives the same row.
// ---------------------------------------------------------------------------

/**
 * A thousand accounts that all picked the worst password there is.
 *
 * Unsalted, the database stores one distinct value a thousand times, so one
 * guess cracks all thousand at once. Salted, every row is different and each
 * account has to be attacked on its own. This is the only figure in the cut
 * that is about a database rather than about a hash function.
 */
const ACCOUNTS = 1_000;
const WORST = "123456";

const unsalted = new Set();
for (let i = 0; i < ACCOUNTS; i++) unsalted.add(sha256(WORST));

const salted = new Set();
const salts = [];
for (let i = 0; i < ACCOUNTS; i++) {
  const salt = randomBytes(16);
  salts.push(salt.toString("hex"));
  salted.add(pbkdf2Sync(WORST, salt, 100_000, 32, "sha256").toString("hex"));
}

console.log(`# ${ACCOUNTS.toLocaleString("en-US")} accounts, all with the password ${WORST}`);
console.log();
console.log(`  distinct stored values, no salt   ${unsalted.size}`);
console.log(`  distinct stored values, salted    ${salted.size}`);
console.log(`  distinct salts drawn              ${new Set(salts).size}`);
console.log();
if (unsalted.size !== 1) {
  throw new Error(`unsalted hashing produced ${unsalted.size} values, expected 1`);
}
if (salted.size !== ACCOUNTS) {
  throw new Error(`salting produced ${salted.size} values, expected ${ACCOUNTS}`);
}

// ---------------------------------------------------------------------------
// 5. Verifying still works, which is the thing people assume it breaks.
// ---------------------------------------------------------------------------

/**
 * The site can still check you without knowing you.
 *
 * Hash what was typed with the salt on the row and compare. Right password
 * matches, one character off does not. Stated as a check rather than a claim
 * because "then how does it know?" is the first question the mechanism raises.
 */
const salt = randomBytes(16);
const stored = pbkdf2Sync(BEFORE, salt, 100_000, 32, "sha256");
const typedRight = pbkdf2Sync(BEFORE, salt, 100_000, 32, "sha256");
const typedWrong = pbkdf2Sync(AFTER, salt, 100_000, 32, "sha256");

console.log("# Logging in, without the password being stored");
console.log();
console.log(`  typed ${BEFORE}   matches stored   ${timingSafeEqual(stored, typedRight)}`);
console.log(`  typed ${AFTER}   matches stored   ${timingSafeEqual(stored, typedWrong)}`);
console.log();
if (!timingSafeEqual(stored, typedRight) || timingSafeEqual(stored, typedWrong)) {
  throw new Error("verification does not behave as the reel claims");
}
