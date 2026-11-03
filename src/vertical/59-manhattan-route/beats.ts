import { RUN } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both searches leave Harlem on frame START and run on one shared clock:
 * by any frame, each has checked the same number of intersections, or all
 * it ever needed. A* reaches Wall Street on ASTAR_DONE; Dijkstra, which
 * checks every intersection nearer than Wall Street by road, gets there on
 * DIJKSTRA_DONE. The clock speeds up as it goes, the same for both, so the
 * first second can be followed and the flood still fits the cut.
 */
export const START = 2;
export const ASTAR_DONE = 48;
export const DIJKSTRA_DONE = 270;

/** checked(f) = K (f - START)^P, fitted through both finishing frames. */
export const P =
  Math.log(RUN.dijkstra / RUN.astar) /
  Math.log((DIJKSTRA_DONE - START) / (ASTAR_DONE - START));
export const K = RUN.astar / (ASTAR_DONE - START) ** P;

const clockAt = (f: number) => (f <= START ? 0 : K * (f - START) ** P);

export const checkedAt = (f: number, total: number) =>
  Math.min(total, Math.floor(clockAt(f) + 1e-6));

/** The frame the n-th checked intersection lights, n counting from 1. */
export const litAt = (n: number) => START + (n / K) ** (1 / P);

/** The route is traced back from Wall Street to Harlem, as A* rebuilds it. */
export const TRACE = 14;
/** The verdict: both counts and the one ratio. */
export const VERDICT = DIJKSTRA_DONE + 26;
