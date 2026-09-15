import { MAX_EXPANSIONS, RUNS, type SearchKey } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/** The frame breadth-first search, the last to arrive, expands its last cell. */
export const RACE_END = 276;

/**
 * Expansions already spent before frame zero, so the cut opens with six mazes
 * already filling rather than six empty ones.
 */
export const PRE_ROLL = 30;

const curve = (u: number) => 0.36 * u + 0.64 * u * u * u;

/** Cells every panel has been given by `frame`, capped at its own total. */
export const budgetAt = (frame: number) => {
  const span = RACE_END + PRE_ROLL;
  const u = Math.min(1, Math.max(0, (frame + PRE_ROLL) / span));
  return Math.round(MAX_EXPANSIONS * curve(u));
};

/**
 * The frame a search runs out of work.
 *
 * Computed off the same curve the picture uses rather than typed in beside it,
 * because a cue map written as literals is how VR07 shipped a sound track
 * firing at events that had been deleted.
 */
export const finishFrame = (key: SearchKey) => {
  const total = RUNS[key].expansions;
  for (let frame = 0; frame < DURATION; frame++) {
    if (budgetAt(frame) >= total) return frame;
  }
  return DURATION - 1;
};

/** Frames a panel takes to draw the route it found, once it has one. */
export const ROUTE_DRAW = 26;

/** Frame the six panels start giving way to one map. */
export const VERDICT_FROM = 288;

/**
 * The two walks, one after the other rather than at the same time.
 *
 * Both routes drawn together is what shipped first and it did not read. They
 * share most of the maze, cross each other four times, and at a second's
 * viewing it is two tangled lines rather than two answers. Walked one at a
 * time, with the first left on screen underneath the second, the question the
 * frame is asking is legible: here is the short way and what it cost, now here
 * is the other way.
 */
export const STEPS_WALK_FROM = 304;
export const STEPS_WALK_TO = 346;
export const CHEAP_WALK_FROM = 352;
export const CHEAP_WALK_TO = 398;

/** Frame the cheapest route's walker reaches the exit. */
export const VERDICT_LAND = CHEAP_WALK_TO;

/** How far along a route a walk has got by `frame`, in steps. */
export const walkedAt = (
  frame: number,
  steps: number,
  from: number,
  to: number,
) => Math.max(0, Math.min(steps, ((frame - from) / (to - from)) * steps));
