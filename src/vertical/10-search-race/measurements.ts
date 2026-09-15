/**
 * The six runs, from `scripts/measure-pathfinding-race.mjs`.
 *
 * One maze, one start, one exit, and one definition of work: a cell is
 * expanded when it comes off the frontier and its neighbours are looked at.
 * That is the standard unit for comparing searches and it is the one thing all
 * six do identically. Counts, not milliseconds, because an expansion is a
 * property of the algorithm and a millisecond is a property of the laptop.
 *
 * Ground charges to be entered. Open ground costs 1 and mud costs 9, which is
 * the whole reason Dijkstra is worth drawing next to breadth-first search: on a
 * map where every step costs the same the two expand in the same order and the
 * panels are the same picture twice.
 */

export const WIDTH = 51;
export const HEIGHT = 25;
export const SEED = 21;
export const LOOPS = 0.18;

export const OPEN_COST = 1;
export const MUD_COST = 9;

export type SearchKey =
  | "dfs"
  | "bfs"
  | "dijkstra"
  | "greedy"
  | "astar"
  | "bidirectional";

export type Run = {
  /** Cells taken off the frontier and expanded. */
  readonly expansions: number;
  /** Cells walked, start excluded. */
  readonly steps: number;
  /** What the route charges to walk. */
  readonly cost: number;
  /** How many of those steps go through mud. This is where the cost is. */
  readonly mudSteps: number;
};

export const RUNS: Readonly<Record<SearchKey, Run>> = {
  dfs: { expansions: 586, steps: 364, cost: 1_044, mudSteps: 85 },
  bfs: { expansions: 658, steps: 74, cost: 234, mudSteps: 20 },
  dijkstra: { expansions: 583, steps: 98, cost: 114, mudSteps: 2 },
  greedy: { expansions: 99, steps: 78, cost: 254, mudSteps: 22 },
  astar: { expansions: 469, steps: 98, cost: 114, mudSteps: 2 },
  bidirectional: { expansions: 527, steps: 98, cost: 114, mudSteps: 2 },
};

/** Breadth-first search's total. The budget the slowest panel needs. */
export const MAX_EXPANSIONS = RUNS.bfs.expansions;

/** The cheapest way out, found by the three searches that price the ground. */
export const CHEAPEST = RUNS.dijkstra.cost;

/** What the route with the fewest steps charges instead. */
export const FEWEST_STEPS_COST = RUNS.bfs.cost;

/**
 * The same comparison across two hundred fresh mazes, from `SWEEP=1`.
 *
 * Here so no frame has to rest on one map being dramatic. This one is: its
 * step-shortest route costs 2.05 times the cheapest, against a median of 1.35.
 */
export const SWEEP = {
  maps: 200,
  stepsRouteMedian: 1.35,
  stepsRouteMax: 2.28,
} as const;
