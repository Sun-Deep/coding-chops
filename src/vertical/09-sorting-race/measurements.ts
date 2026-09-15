/**
 * The six runs, from `scripts/measure-sorting-race.mjs`.
 *
 * One array, one shuffle, one definition of work. An operation is a comparison
 * between two element values or a write into an array, and merge sort's
 * scratch buffer counts, because it is work a machine does and excluding it
 * would flatter the only algorithm here that is not in place.
 *
 * The reel spends the same number of operations on every panel per frame, so
 * these totals are the finishing order. Change one and the render changes with
 * it; `sorting.ts` asserts its own instrumented traces against them at module
 * load, and the measurement script asserts the same figures independently.
 */

export const N = 48;

/** Pinned so the script and every render sort the identical permutation. */
export const SEED = 20_260_914;

export type AlgorithmKey =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "heap"
  | "quick";

export type Run = {
  readonly compares: number;
  readonly writes: number;
  readonly auxWrites: number;
  readonly ops: number;
};

export const RUNS: Readonly<Record<AlgorithmKey, Run>> = {
  bubble: { compares: 1_113, writes: 1_304, auxWrites: 0, ops: 2_417 },
  selection: { compares: 1_128, writes: 92, auxWrites: 0, ops: 1_220 },
  insertion: { compares: 695, writes: 699, auxWrites: 0, ops: 1_394 },
  merge: { compares: 210, writes: 272, auxWrites: 272, ops: 754 },
  heap: { compares: 384, writes: 448, auxWrites: 0, ops: 832 },
  quick: { compares: 199, writes: 188, auxWrites: 0, ops: 387 },
};

/** Bubble sort's total. The budget the slowest panel needs to finish. */
export const MAX_OPS = RUNS.bubble.ops;

/** Quicksort's total. The budget the fastest panel needed. */
export const MIN_OPS = RUNS.quick.ops;

/** 6.2. The whole claim, and the only derived number the cut states. */
export const RATIO = Math.round((MAX_OPS / MIN_OPS) * 10) / 10;
