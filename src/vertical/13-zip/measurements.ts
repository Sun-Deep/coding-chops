/**
 * From `scripts/measure-zip.mjs`.
 *
 * Two kinds of figure here and they are not the same kind of claim.
 *
 * The output size is exact and it is not ours. It comes off zlib's real
 * DEFLATE, the same encoder behind `zip`, `gzip` and every compressed response
 * a browser has ever received. Nothing estimates it.
 *
 * The parse is a demonstration. DEFLATE is two mechanisms stacked: LZ77
 * replaces a run of bytes it has seen before with a pointer back to the earlier
 * copy, and Huffman then writes what is left in fewer bits. The reel animates
 * the first one, so the script performs its own LZ77 parse to know which spans
 * are copies and where each points, and proves it by expanding the token stream
 * back out and checking it is the input byte for byte. `lz77.ts` recomputes
 * that parse here and asserts it agrees with the counts below, so a change to
 * either side fails at module load rather than on screen.
 *
 * The parse is *a* valid parse rather than zlib's own. zlib uses lazy matching
 * and may split a run differently. It is used for the picture, never for the
 * byte count, and the frame never subtracts one from the other.
 */

/**
 * The file, character for character.
 *
 * A literal rather than something generated, so the figures cannot drift
 * between runs or between machines. VR12's scan counted this repository and
 * every file added to the project moved the number.
 *
 * A log because the repetition is visible before any mechanism runs. A stranger
 * looking at frame zero can see that most of this file is the same few strings
 * over and over, which is the whole claim, and they can see it without being
 * told.
 */
export const LINES: readonly string[] = [
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

/** The file as the encoder sees it: lines plus the newline each one ends on. */
export const TEXT = LINES.join("\n") + "\n";

/** Exact. ASCII throughout, so a character is a byte. */
export const BYTES = 1_035;

/** DEFLATE's limits, from RFC 1951 section 4. */
export const MIN_MATCH = 3;
export const MAX_MATCH = 258;

/** The parse. Asserted against the TS port in `lz77.ts`. */
export const PARSE = {
  tokens: 135,
  copies: 39,
  literals: 96,
  /** Bytes that are a copy of something earlier in the file. */
  covered: 939,
  longestCopy: 51,
  longestDistance: 879,
} as const;

/** 90.7% of the file is text the file has already said. */
export const COVERED_SHARE = 90.7;

/**
 * zlib, level 9, exact.
 *
 * `huffmanOnly` is the same encoder with matching switched off
 * (Z_HUFFMAN_ONLY). It is here to show that finding the repeats is the part
 * worth animating rather than a detail: shortening alone gets this file to 636
 * bytes and finding the repeats as well gets it to 177.
 *
 * Reported as two runs rather than as a split of the saving, because the two
 * mechanisms do not decompose additively. Huffman after LZ77 is coding a
 * different stream than Huffman alone.
 */
export const DEFLATE = {
  raw: BYTES,
  huffmanOnly: 636,
  out: 177,
  /** With the gzip header and checksum on top, which a `.gz` on disk carries. */
  gzip: 195,
} as const;

/** 1,035 into 177. */
export const RATIO = 5.85;
