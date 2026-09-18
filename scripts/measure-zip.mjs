#!/usr/bin/env node

// What a zip actually does to a file.
//
// Two kinds of figure here and they are not the same kind of claim.
//
// The output size is exact and it is not mine. It comes off zlib's real
// DEFLATE, the same encoder behind `zip`, `gzip` and every compressed response
// your browser has ever received. Nothing in this script estimates it.
//
// The parse is a demonstration. DEFLATE is two mechanisms stacked: LZ77
// replaces a run of bytes it has seen before with a pointer back to the earlier
// copy, and Huffman then writes what is left in fewer bits. The reel animates
// the first one, so this script performs its own LZ77 parse to know which spans
// of the file are copies and where each one points. That parse is *a* valid
// parse rather than zlib's own -- zlib uses lazy matching and may split a run
// differently -- so the script proves it by expanding its own token stream back
// out and checking the result is the input byte for byte. What it is used for
// is the picture, never the byte count.
//
// To show that the pointers are the part worth animating rather than a detail,
// the script also runs DEFLATE with matching switched off
// (Z_HUFFMAN_ONLY). The gap between that and the real output is what finding
// the repeats is worth on this file.

import { deflateRawSync, gzipSync, constants } from "node:zlib";

// ---------------------------------------------------------------------------
// The fixture.
// ---------------------------------------------------------------------------
//
// A literal rather than something generated, so the figures cannot drift
// between runs or between machines. VR12's scan counted this repository and
// every file added to the project moved the number; a fixture that is written
// down cannot do that.
//
// A log is the fixture because the repetition is visible before any mechanism
// runs. A stranger looking at frame zero can see that most of this file is the
// same few strings over and over, which is the whole claim, and they can see it
// without being told.

const LINES = [
  "2026-09-18 09:14:02 INFO  GET  /api/orders 200 14ms",
  "2026-09-18 09:14:02 INFO  GET  /api/orders 200 11ms",
  "2026-09-18 09:14:03 INFO  GET  /api/orders 200 12ms",
  "2026-09-18 09:14:03 INFO  POST /api/orders 201 38ms",
  "2026-09-18 09:14:04 INFO  GET  /api/orders 200 13ms",
  "2026-09-18 09:14:04 WARN  GET  /api/orders 429 2ms",
  "2026-09-18 09:14:05 INFO  GET  /api/orders 200 15ms",
  "2026-09-18 09:14:05 INFO  GET  /api/users  200 9ms",
  "2026-09-18 09:14:06 INFO  GET  /api/users  200 8ms",
  "2026-09-18 09:14:06 INFO  GET  /api/orders 200 12ms",
  "2026-09-18 09:14:07 ERROR POST /api/orders 500 61ms",
  "2026-09-18 09:14:07 INFO  GET  /api/orders 200 14ms",
  "2026-09-18 09:14:08 INFO  GET  /api/orders 200 13ms",
  "2026-09-18 09:14:08 INFO  GET  /api/users  200 9ms",
  "2026-09-18 09:14:09 INFO  POST /api/orders 201 41ms",
  "2026-09-18 09:14:09 INFO  GET  /api/orders 200 12ms",
  "2026-09-18 09:14:10 INFO  GET  /api/orders 200 14ms",
  "2026-09-18 09:14:10 WARN  GET  /api/users  429 3ms",
  "2026-09-18 09:14:11 INFO  GET  /api/orders 200 11ms",
  "2026-09-18 09:14:11 INFO  GET  /api/orders 200 13ms",
];

const TEXT = LINES.join("\n") + "\n";
const INPUT = Buffer.from(TEXT, "utf8");

// ---------------------------------------------------------------------------
// 1. LZ77, performed rather than described.
// ---------------------------------------------------------------------------

/** DEFLATE's limits, from RFC 1951 section 4. */
const MIN_MATCH = 3;
const MAX_MATCH = 258;
const WINDOW = 32 * 1024;

/**
 * Greedy longest match against everything already emitted.
 *
 * Deliberately the simple parse: at each position take the longest run that
 * appears earlier in the window, otherwise emit one literal byte. Matches are
 * allowed to overlap their own source, which is legal and is how DEFLATE
 * encodes a run of one repeated byte.
 */
const parse = (bytes) => {
  const tokens = [];
  let at = 0;

  while (at < bytes.length) {
    const from = Math.max(0, at - WINDOW);
    let bestLength = 0;
    let bestStart = -1;

    for (let start = from; start < at; start++) {
      let length = 0;
      while (
        length < MAX_MATCH &&
        at + length < bytes.length &&
        bytes[start + length] === bytes[at + length]
      ) {
        length++;
      }
      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
    }

    if (bestLength >= MIN_MATCH) {
      tokens.push({
        kind: "copy",
        at,
        length: bestLength,
        distance: at - bestStart,
        source: bestStart,
      });
      at += bestLength;
    } else {
      tokens.push({ kind: "literal", at, byte: bytes[at] });
      at += 1;
    }
  }

  return tokens;
};

/**
 * Expand a token stream the way a decompressor does.
 *
 * Byte at a time on purpose, because that is what makes an overlapping copy
 * work: the bytes it reads may be ones this same token just wrote.
 */
const expand = (tokens) => {
  const out = [];
  for (const token of tokens) {
    if (token.kind === "literal") {
      out.push(token.byte);
    } else {
      const start = out.length - token.distance;
      for (let i = 0; i < token.length; i++) out.push(out[start + i]);
    }
  }
  return Buffer.from(out);
};

const TOKENS = parse(INPUT);

// The parse is only worth showing if it is actually lossless.
const ROUNDTRIP = expand(TOKENS);
if (!ROUNDTRIP.equals(INPUT)) {
  throw new Error("LZ77 parse does not reconstruct the input");
}

const COPIES = TOKENS.filter((t) => t.kind === "copy");
const LITERALS = TOKENS.filter((t) => t.kind === "literal");
const COVERED = COPIES.reduce((sum, t) => sum + t.length, 0);

if (COVERED + LITERALS.length !== INPUT.length) {
  throw new Error("tokens do not account for every byte");
}

// ---------------------------------------------------------------------------
// 2. The real encoder.
// ---------------------------------------------------------------------------

const DEFLATE = deflateRawSync(INPUT, { level: 9 });
const HUFFMAN_ONLY = deflateRawSync(INPUT, {
  level: 9,
  strategy: constants.Z_HUFFMAN_ONLY,
});
const GZIP = gzipSync(INPUT, { level: 9 });

// ---------------------------------------------------------------------------
// 3. Report.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 2b. The output as it is being written.
// ---------------------------------------------------------------------------
//
// The reel draws the zip filling up while the log is read, so it needs the size
// of the output at each point through the file rather than only at the end.
//
// This is a real run at every sample rather than a curve fitted between the two
// ends: `deflateRaw` of the first N bytes, which is a well defined and
// reproducible measurement of what you would have if you stopped there. It is
// not a prefix of the finished stream -- DEFLATE picks its Huffman tables per
// block, so the final 177 bytes are not the last sample plus a remainder -- and
// the reel uses it for the bar and never subtracts one sample from another.
//
// Sampled every 15 bytes to keep the exported table small. The last sample is
// the whole file, so the bar ends on the real figure.

const SAMPLE_STRIDE = 15;

const GROWTH = [];
for (let at = 0; at <= INPUT.length; at += SAMPLE_STRIDE) {
  GROWTH.push([at, deflateRawSync(INPUT.subarray(0, at), { level: 9 }).length]);
}
if (GROWTH[GROWTH.length - 1][0] !== INPUT.length) {
  GROWTH.push([INPUT.length, DEFLATE.length]);
}

const pct = (part, whole) => ((part / whole) * 100).toFixed(1);

console.log("# The file");
console.log(`lines                 ${LINES.length}`);
console.log(`bytes                 ${INPUT.length}`);
console.log(`distinct bytes        ${new Set(INPUT).size}`);
console.log();

console.log("# LZ77 parse (this script, verified lossless)");
console.log(`tokens                ${TOKENS.length}`);
console.log(`  copies              ${COPIES.length}`);
console.log(`  literals            ${LITERALS.length}`);
console.log(
  `bytes covered by copies ${COVERED}  (${pct(COVERED, INPUT.length)}% of the file)`,
);
console.log(
  `longest copy          ${Math.max(...COPIES.map((t) => t.length))} bytes`,
);
console.log(
  `longest back distance ${Math.max(...COPIES.map((t) => t.distance))} bytes`,
);
console.log();

console.log("# DEFLATE (zlib, exact)");
console.log(`raw                   ${INPUT.length} bytes`);
console.log(
  `huffman only          ${HUFFMAN_ONLY.length} bytes  (${pct(HUFFMAN_ONLY.length, INPUT.length)}%)`,
);
console.log(
  `deflate -9            ${DEFLATE.length} bytes  (${pct(DEFLATE.length, INPUT.length)}%)`,
);
console.log(
  `gzip -9               ${GZIP.length} bytes  (with header and checksum)`,
);
console.log(
  `ratio                 ${(INPUT.length / DEFLATE.length).toFixed(2)}x`,
);
// Reported as two runs rather than as a split of the saving. The two
// mechanisms do not decompose additively -- Huffman after LZ77 is coding a
// different stream than Huffman alone -- so the honest comparison is the same
// encoder with matching off and with matching on.
console.log(`matching off          ${HUFFMAN_ONLY.length} bytes`);
console.log(`matching on           ${DEFLATE.length} bytes`);
console.log();

console.log("# The output as it grows (deflateRaw of the first N bytes)");
for (const [at, size] of GROWTH) {
  console.log(
    `  after ${String(at).padStart(4)} bytes  ->  ${String(size).padStart(3)} bytes`,
  );
}
console.log();

console.log("# Every copy, in order");
for (const t of COPIES) {
  const text = INPUT.slice(t.at, t.at + t.length).toString("utf8");
  console.log(
    `  at ${String(t.at).padStart(4)}  back ${String(t.distance).padStart(4)}  ` +
      `len ${String(t.length).padStart(3)}  ${JSON.stringify(text)}`,
  );
}
