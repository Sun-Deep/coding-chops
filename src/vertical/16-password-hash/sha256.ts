/**
 * SHA-256, from the specification, so the frame can hash its own text.
 *
 * A cut about hashing cannot print digests as literals. Every character the
 * password field shows being typed changes the digest completely, and that is
 * the whole claim, so the digest under the field has to be computed from
 * whatever is currently in it. A table of pre-baked strings would animate
 * identically and would be a lie the moment anybody tried a different password.
 *
 * This is the third independent SHA-256 in the measurement chain.
 * `scripts/measure-password-hashing.mjs` already hashes every published digest
 * twice, through `node:crypto` and through the `shasum` binary, and refuses to
 * print one they disagree on. `measurements.ts` then asserts at module load
 * that this implementation reproduces those digests too. If any of the three
 * drifts, the render fails rather than the frame showing a plausible hash.
 *
 * Written against FIPS 180-4 section 6.2. ASCII input only, which is all this
 * cut has and all it should have: a UTF-8 encoder would be a second thing to
 * get wrong for no gain.
 */

/** First 32 bits of the fractional parts of the cube roots of the first 64 primes. */
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

/** First 32 bits of the fractional parts of the square roots of the first 8 primes. */
const H0 = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
]);

const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

export const sha256 = (text: string): string => {
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0x7f) {
      throw new Error(`sha256: ${JSON.stringify(text)} is not ASCII at ${i}`);
    }
    bytes.push(code);
  }

  // Pad to a multiple of 64 bytes: a 1 bit, zeroes, then the length in bits.
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // The length field is 64 bits. Nothing here is anywhere near 2^32 bits long,
  // so the high word is zero and writing it as zero is honest rather than lazy.
  for (let i = 0; i < 4; i++) bytes.push(0);
  for (let i = 3; i >= 0; i--) bytes.push((bitLength >>> (i * 8)) & 0xff);

  const h = H0.slice();
  const w = new Uint32Array(64);

  for (let base = 0; base < bytes.length; base += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] =
        (bytes[base + i * 4] << 24) |
        (bytes[base + i * 4 + 1] << 16) |
        (bytes[base + i * 4 + 2] << 8) |
        bytes[base + i * 4 + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + s1 + ch + K[i] + w[i]) | 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) | 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0;
    h[1] = (h[1] + b) | 0;
    h[2] = (h[2] + c) | 0;
    h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0;
    h[5] = (h[5] + f) | 0;
    h[6] = (h[6] + g) | 0;
    h[7] = (h[7] + hh) | 0;
  }

  return [...h].map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
};

/** The 256 bits of a digest, as a string of "0" and "1". */
export const bitsOf = (hex: string): string =>
  [...hex].map((c) => parseInt(c, 16).toString(2).padStart(4, "0")).join("");

/** How many of the 256 bits are not the same. */
export const bitsDiffering = (a: string, b: string): number => {
  const x = bitsOf(a);
  const y = bitsOf(b);
  let n = 0;
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) n++;
  return n;
};

/** How many of the 64 printed characters survive in place. */
export const charsSurviving = (a: string, b: string): number => {
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] === b[i]) n++;
  return n;
};
