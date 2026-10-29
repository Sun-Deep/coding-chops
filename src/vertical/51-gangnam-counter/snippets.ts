/**
 * The code the reel shows, line for line. `scripts/measure-gangnam-counter.mjs`
 * compiles these exact lines with javac and runs them, so the output on
 * screen is the output of this code.
 *
 * Java, because its int is defined to wrap: one past the largest int is
 * the smallest. In C the same overflow is undefined behaviour, so C would
 * be a worse example of what a counter does, not a clearer one.
 */

/** A view counter in a 32-bit int, at the largest value it can hold. */
export const INT32 = [
  "int views = 2147483647;",
  "views = views + 1;",
  "System.out.println(views);",
] as const;

/** The same counter in a 64-bit long. */
export const INT64 = [
  "long views = 2147483647;",
  "views = views + 1;",
  "System.out.println(views);",
] as const;

/** 6 billion views in a long, then forced into an int. */
export const SIX = [
  "long views = 6000000000L;",
  "System.out.println((int) views);",
] as const;

/** The line that changes between the two. */
export const TYPE_LINE = 0;
