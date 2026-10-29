import { COUNT_FROM, RUN } from "./measurements";

/**
 * The run the reel draws, checked against itself on load. Java and C are
 * checked by `scripts/measure-gangnam-counter.mjs`; this catches the file
 * disagreeing with itself or with 32-bit arithmetic.
 */
if (RUN.max !== 2 ** 31 - 1 || RUN.wrapped !== -(2 ** 31))
  throw new Error("runs.ts: the int range is not 32-bit");
if (((RUN.max + 1) | 0) !== RUN.wrapped)
  throw new Error("runs.ts: max + 1 does not wrap to the recorded value");
if ((RUN.sixBillion | 0) !== RUN.sixBillionAsInt)
  throw new Error("runs.ts: 6 billion as an int disagrees with the run");
if (parseInt(RUN.maxBits, 2) !== RUN.max)
  throw new Error("runs.ts: the bits before do not spell the max");
if (COUNT_FROM >= RUN.max)
  throw new Error("runs.ts: the count starts past the max");
