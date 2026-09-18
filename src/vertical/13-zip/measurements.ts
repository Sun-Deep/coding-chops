/**
 * From `scripts/measure-zip.mjs`.
 *
 * The subject is the household operation: a folder of files, right-clicked and
 * compressed, producing a `.zip` beside it. So the archive figures come off the
 * real `zip` binary rather than anything in this repository, and 678 bytes is
 * the size that lands on disk.
 *
 * Three kinds of figure, and they are not the same kind of claim.
 *
 * The archive sizes are exact and not ours. Info-ZIP, `-9 -X`, the same tool
 * behind Finder's Compress. The per-file stored sizes are exact too and come
 * out of the archive's own central directory.
 *
 * The parse is a demonstration, and it runs per file because a zip compresses
 * each member on its own. `lz77.ts` recomputes it here and asserts it agrees
 * with the counts below, so a change to either side fails at module load rather
 * than on screen.
 */

/** The folder the reel compresses. */
export const FOLDER = "logs";

/**
 * Its files, character for character.
 *
 * Literals rather than anything generated, so the figures cannot drift between
 * runs or between machines. VR12's scan counted this repository and every file
 * added to the project moved the number.
 *
 * Two days of the same service. The repetition is visible before any mechanism
 * runs, which is the whole claim, and a stranger can see it without being told.
 */
export const FILES: readonly {
  readonly name: string;
  readonly lines: readonly string[];
}[] = [
  {
    name: "mon.log",
    lines: [
      "2026-09-16 09:14:02 INFO  GET  /api/orders 200 12ms",
      "2026-09-16 09:14:02 INFO  GET  /api/cart   200 40ms",
      "2026-09-16 09:14:03 INFO  GET  /api/orders 200 23ms",
      "2026-09-16 09:14:03 INFO  GET  /api/orders 200 15ms",
      "2026-09-16 09:14:04 INFO  GET  /api/cart   200 11ms",
      "2026-09-16 09:14:04 ERROR GET  /api/orders 500 10ms",
      "2026-09-16 09:14:05 INFO  GET  /api/orders 200 42ms",
      "2026-09-16 09:14:05 INFO  GET  /api/orders 200 19ms",
      "2026-09-16 09:14:06 INFO  GET  /api/orders 200 14ms",
      "2026-09-16 09:14:06 INFO  GET  /api/orders 200 21ms",
      "2026-09-16 09:14:07 INFO  GET  /api/orders 200 37ms",
      "2026-09-16 09:14:07 INFO  GET  /api/orders 200 58ms",
      "2026-09-16 09:14:08 INFO  GET  /api/orders 200 27ms",
      "2026-09-16 09:14:08 INFO  POST /api/orders 201 26ms",
      "2026-09-16 09:14:09 INFO  GET  /api/orders 200 18ms",
      "2026-09-16 09:14:09 INFO  GET  /api/users  200 10ms",
      "2026-09-16 09:14:10 INFO  GET  /api/cart   200 58ms",
      "2026-09-16 09:14:10 INFO  GET  /api/cart   200 46ms",
      "2026-09-16 09:14:11 INFO  GET  /api/orders 200 13ms",
      "2026-09-16 09:14:11 INFO  GET  /api/cart   200 11ms",
    ],
  },
  {
    name: "tue.log",
    lines: [
      "2026-09-17 09:14:02 INFO  GET  /api/users  200 51ms",
      "2026-09-17 09:14:02 INFO  GET  /api/cart   200 50ms",
      "2026-09-17 09:14:03 INFO  POST /api/orders 201 47ms",
      "2026-09-17 09:14:03 INFO  GET  /api/orders 200 16ms",
      "2026-09-17 09:14:04 WARN  GET  /api/users  429 39ms",
      "2026-09-17 09:14:04 INFO  GET  /api/orders 200 16ms",
      "2026-09-17 09:14:05 INFO  POST /api/cart   201 34ms",
      "2026-09-17 09:14:05 INFO  GET  /api/cart   200 22ms",
      "2026-09-17 09:14:06 INFO  GET  /api/orders 200 22ms",
      "2026-09-17 09:14:06 INFO  POST /api/orders 201 26ms",
      "2026-09-17 09:14:07 INFO  GET  /api/orders 200 44ms",
      "2026-09-17 09:14:07 WARN  GET  /api/orders 429 47ms",
      "2026-09-17 09:14:08 INFO  GET  /api/users  200 57ms",
      "2026-09-17 09:14:08 INFO  GET  /api/cart   200 33ms",
      "2026-09-17 09:14:09 INFO  GET  /api/orders 200 11ms",
      "2026-09-17 09:14:09 INFO  POST /api/orders 201 15ms",
      "2026-09-17 09:14:10 INFO  GET  /api/orders 200 17ms",
      "2026-09-17 09:14:10 INFO  POST /api/orders 201 12ms",
      "2026-09-17 09:14:11 INFO  GET  /api/cart   200 24ms",
      "2026-09-17 09:14:11 INFO  GET  /api/cart   200 15ms",
    ],
  },
];

export const bodyOf = (file: (typeof FILES)[number]) =>
  file.lines.join("\n") + "\n";

/** Exact. ASCII throughout, so a character is a byte. */
export const RAW_TOTAL = 2_080;

/** DEFLATE's limits, from RFC 1951 section 4. */
export const MIN_MATCH = 3;
export const MAX_MATCH = 258;

/** What the archive stores for each member, from its central directory. */
export const PER_FILE: readonly {
  readonly name: string;
  readonly raw: number;
  readonly stored: number;
}[] = [
  { name: "mon.log", raw: 1_040, stored: 175 },
  { name: "tue.log", raw: 1_040, stored: 195 },
];

/** `logs.zip` on disk. */
export const ARCHIVE = 678;

/** 2,080 into 678. */
export const RATIO = 3.07;

/**
 * What the archive weighs after each file, as a whole archive of a folder
 * holding the first n files.
 *
 * Built the same way the finished one is, so the last entry is the finished one
 * and the script asserts that rather than assuming it. Zipping the members
 * directly would leave out the folder entry and the steps would not be
 * comparable with the archive they end on.
 */
export const AFTER: readonly number[] = [383, 678];

/**
 * Not all of the archive is compressed data.
 *
 * 370 bytes are the two members; the other 308 are local headers, the central
 * directory and the folder entry. That is the honest shape of zipping a folder
 * of small files and it is why the ratio is 3.07x rather than the 5.6x the
 * payload alone would suggest. It is in the caption as the catch, not in the
 * reel, because this cut has one idea.
 */
export const PAYLOAD = 370;
export const STRUCTURE = 308;

/** The parse, per file. Asserted against the TS port in `lz77.ts`. */
export const PARSE: readonly {
  readonly tokens: number;
  readonly copies: number;
  readonly literals: number;
  readonly covered: number;
  readonly longestCopy: number;
  readonly longestDistance: number;
}[] = [
  {
    tokens: 143,
    copies: 40,
    literals: 103,
    covered: 937,
    longestCopy: 50,
    longestDistance: 936,
  },
  {
    tokens: 156,
    copies: 46,
    literals: 110,
    covered: 930,
    longestCopy: 50,
    longestDistance: 780,
  },
];

/** 1,867 of 2,080 bytes are text the file they are in has already said. */
export const COVERED_TOTAL = 1_867;
export const COVERED_SHARE = 89.8;

/**
 * What a zip cannot do, kept for the caption and the notes.
 *
 * The two files are nearly the same shape and the archive gets nothing for it,
 * because every member is compressed against its own window. One DEFLATE over
 * the pair is 287 bytes against the archive's 370 of member data. This is the
 * reason `tar.gz` beats `zip` on a folder of similar files, and it is a second
 * idea, so it stays out of the reel.
 */
export const CROSS_FILE = { oneStream: 287, zipMembers: 370 } as const;

/** Bytes between samples of a growing member. */
export const GROWTH_STRIDE = 15;

/**
 * The size of each member after the first N bytes of its file.
 *
 * A real `deflateRaw` run at every sample rather than a curve drawn between the
 * two ends, so the bar the reel fills is measured at every point it passes
 * through. Each table ends exactly on what the archive stores for that file,
 * which is asserted, and is the check that zlib at level 9 and Info-ZIP at -9
 * are the same encoder here.
 *
 * The shape is the argument. The first samples grow one for one with the file,
 * because nothing has been said yet that can be pointed at. Then the file grows
 * and the output stops moving.
 */
export const GROWTH: readonly (readonly (readonly [number, number])[])[] = [
  // mon.log
  [
    [0, 2],
    [15, 17],
    [30, 32],
    [45, 47],
    [60, 57],
    [75, 57],
    [90, 59],
    [105, 69],
    [120, 69],
    [135, 72],
    [150, 73],
    [165, 77],
    [180, 77],
    [195, 77],
    [210, 81],
    [225, 81],
    [240, 84],
    [255, 85],
    [270, 89],
    [285, 94],
    [300, 96],
    [315, 102],
    [330, 102],
    [345, 105],
    [360, 106],
    [375, 108],
    [390, 108],
    [405, 108],
    [420, 114],
    [435, 115],
    [450, 117],
    [465, 117],
    [480, 119],
    [495, 119],
    [510, 119],
    [525, 123],
    [540, 123],
    [555, 125],
    [570, 126],
    [585, 128],
    [600, 127],
    [615, 127],
    [630, 131],
    [645, 132],
    [660, 132],
    [675, 135],
    [690, 135],
    [705, 137],
    [720, 141],
    [735, 145],
    [750, 146],
    [765, 146],
    [780, 148],
    [795, 148],
    [810, 148],
    [825, 153],
    [840, 158],
    [855, 160],
    [870, 160],
    [885, 163],
    [900, 162],
    [915, 165],
    [930, 163],
    [945, 167],
    [960, 169],
    [975, 169],
    [990, 172],
    [1005, 172],
    [1020, 172],
    [1035, 174],
    [1040, 175],
  ],
  // tue.log
  [
    [0, 2],
    [15, 17],
    [30, 32],
    [45, 47],
    [60, 57],
    [75, 57],
    [90, 59],
    [105, 67],
    [120, 67],
    [135, 75],
    [150, 84],
    [165, 90],
    [180, 90],
    [195, 95],
    [210, 100],
    [225, 100],
    [240, 108],
    [255, 113],
    [270, 117],
    [285, 119],
    [300, 119],
    [315, 119],
    [330, 119],
    [345, 123],
    [360, 128],
    [375, 131],
    [390, 130],
    [405, 133],
    [420, 135],
    [435, 136],
    [450, 137],
    [465, 138],
    [480, 139],
    [495, 140],
    [510, 142],
    [525, 144],
    [540, 145],
    [555, 147],
    [570, 148],
    [585, 149],
    [600, 151],
    [615, 153],
    [630, 159],
    [645, 161],
    [660, 161],
    [675, 165],
    [690, 164],
    [705, 164],
    [720, 167],
    [735, 169],
    [750, 172],
    [765, 172],
    [780, 174],
    [795, 174],
    [810, 176],
    [825, 176],
    [840, 179],
    [855, 181],
    [870, 182],
    [885, 183],
    [900, 183],
    [915, 186],
    [930, 185],
    [945, 188],
    [960, 190],
    [975, 190],
    [990, 193],
    [1005, 193],
    [1020, 192],
    [1035, 193],
    [1040, 195],
  ],
];
