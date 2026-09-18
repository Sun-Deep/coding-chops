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

/** Bytes between samples of the growing output. */
export const GROWTH_STRIDE = 15;

/**
 * The size of the zip after the first N bytes of the log.
 *
 * A real `deflateRaw` run at every sample rather than a curve drawn between the
 * two ends, so the bar the reel fills is measured at every point it passes
 * through. It is not a prefix of the finished stream: DEFLATE picks its Huffman
 * tables per block, so the final 177 bytes are not the last sample plus a
 * remainder. The reel uses it to draw the output growing and never subtracts
 * one sample from another.
 *
 * The shape is the argument. The first three samples grow one for one with the
 * file, because nothing has been said yet that can be pointed at. Then the file
 * grows from 60 bytes to 90 and the output does not move at all, because the
 * whole of the second line was already on the first. It never recovers its
 * early slope.
 */
export const GROWTH: readonly (readonly [number, number])[] = [
  [0, 2],
  [15, 17],
  [30, 32],
  [45, 47],
  [60, 57],
  [75, 57],
  [90, 57],
  [105, 60],
  [120, 60],
  [135, 63],
  [150, 64],
  [165, 67],
  [180, 67],
  [195, 73],
  [210, 79],
  [225, 79],
  [240, 82],
  [255, 83],
  [270, 86],
  [285, 91],
  [300, 92],
  [315, 98],
  [330, 100],
  [345, 102],
  [360, 103],
  [375, 105],
  [390, 104],
  [405, 109],
  [420, 114],
  [435, 118],
  [450, 118],
  [465, 120],
  [480, 120],
  [495, 121],
  [510, 123],
  [525, 124],
  [540, 129],
  [555, 133],
  [570, 138],
  [585, 138],
  [600, 140],
  [615, 139],
  [630, 140],
  [645, 142],
  [660, 143],
  [675, 144],
  [690, 144],
  [705, 147],
  [720, 147],
  [735, 147],
  [750, 150],
  [765, 150],
  [780, 154],
  [795, 153],
  [810, 156],
  [825, 155],
  [840, 155],
  [855, 159],
  [870, 157],
  [885, 158],
  [900, 159],
  [915, 162],
  [930, 169],
  [945, 169],
  [960, 173],
  [975, 172],
  [990, 173],
  [1005, 175],
  [1020, 175],
  [1035, 177],
];

/** 1,035 into 177. */
export const RATIO = 5.85;
