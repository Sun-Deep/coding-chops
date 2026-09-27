/**
 * The six mazes, from `scripts/measure-maze-generators.mjs`.
 *
 * One grid of 25 by 12 rooms, one seed, six generators. Every one of them makes
 * a perfect maze, one route between any two rooms, which on this grid means
 * opening exactly 299 of the 563 walls between rooms. The script asserts that
 * for every maze it builds, and `maze.ts` asserts it again for every maze a
 * frame draws.
 *
 * The seed is not picked by eye. `RANK=1` lists the seeds whose six mazes sit
 * closest to the medians of a thousand-seed sweep, and 10 is the top of that
 * list. Its depth-first route is 114 rooms against a median of 128, so the
 * figure on screen understates the ordinary case rather than flattering it.
 *
 * Counts, never times. A route is a property of the maze and a millisecond is a
 * property of the laptop.
 */

/** Rooms across and down. */
export const MW = 25;
export const MH = 12;
export const SEED = 10;

export const ROOMS = MW * MH;
/** Walls between two rooms, before anything is knocked down. */
export const WALLS = MW * (MH - 1) + MH * (MW - 1);
/** Walls every perfect maze on this grid opens. */
export const PASSAGES = ROOMS - 1;
/** The shortest a route from the top left room to the bottom right can be. */
export const SHORTEST = MW + MH - 1;

export type GeneratorKey =
  | "depthFirst"
  | "prim"
  | "kruskal"
  | "wilson"
  | "binaryTree"
  | "sidewinder";

export type Run = {
  /** Rooms with one way in or out. */
  readonly deadEnds: number;
  /** Rooms walked from the entrance to the exit, both included. */
  readonly route: number;
};

export const RUNS: Readonly<Record<GeneratorKey, Run>> = {
  depthFirst: { deadEnds: 32, route: 114 },
  prim: { deadEnds: 104, route: 38 },
  kruskal: { deadEnds: 91, route: 58 },
  wilson: { deadEnds: 89, route: 58 },
  binaryTree: { deadEnds: 75, route: 36 },
  sidewinder: { deadEnds: 81, route: 42 },
};

/**
 * The same six across seeds 1 to 1,000.
 *
 * Here so no frame rests on one maze being dramatic. The binary tree figure is
 * not a median: its route was 36 rooms, along the top row and down the right
 * column, on every one of the thousand, and `maze.ts` rebuilds the mazes the
 * last beat shows and checks each one.
 */
export const SWEEP = {
  seeds: 1_000,
  depthFirstRouteMedian: 128,
  depthFirstRouteMin: 48,
  depthFirstRouteMax: 218,
  binaryTreeRoute: 36,
} as const;
