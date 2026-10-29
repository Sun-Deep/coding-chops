/**
 * Every number the reel shows, from `scripts/measure-gangnam-counter.mjs`,
 * which compiles the reel's own lines in `snippets.ts` with javac and runs
 * them. Recorded on 26 Oct 2026 on an Apple M5 Pro: OpenJDK 26.0.2, and
 * Apple clang 21.0.0 with -fwrapv for the C cross-check.
 */
export const RUN = {
  /** The largest int, and what `views + 1` prints from it. */
  max: 2147483647,
  wrapped: -2147483648,
  /** The same line with `long views`. */
  asLong: 2147483648,
  /** The bits before and after, as Integer.toBinaryString prints them. */
  maxBits: "01111111111111111111111111111111",
  wrappedBits: "10000000000000000000000000000000",
  /** Long.MAX_VALUE, as Java prints it. */
  longMax: "9223372036854775807",
  /** Gangnam Style passed 6 billion views on 17 Jul 2026 (sources.md); `(int) 6000000000L`. */
  sixBillion: 6000000000,
  sixBillionAsInt: 1705032704,
  java: "Java 26",
} as const;

/** Where the counter starts: 37 views short of the ceiling. */
export const COUNT_FROM = RUN.max - 37;
