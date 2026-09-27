import { PASSAGES, RUNS } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/** The frame all six have knocked down their last wall. */
export const CARVE_END = 210;

/**
 * Frames of carving already done before frame zero, so the cut opens on six
 * mazes being dug rather than six empty grids.
 */
export const PRE_ROLL = 70;

/**
 * The shared clock is walls knocked down.
 *
 * Every generator here opens exactly 299, so on this clock all six finish on
 * the same frame, and that is honest rather than choreographed: none of them is
 * faster at making a maze in the sense that matters on screen. What differs is
 * which walls, and that is a picture rather than a finishing order.
 *
 * Gently accelerating, so single walls can be seen coming down at the open and
 * the close is a wipe.
 */
const curve = (u: number) => 0.6 * u + 0.4 * u * u;

/** Walls every panel has knocked down by `frame`. */
export const carvedAt = (frame: number) => {
  const span = CARVE_END + PRE_ROLL;
  const u = Math.min(1, Math.max(0, (frame + PRE_ROLL) / span));
  return Math.round(PASSAGES * curve(u));
};

/**
 * Rooms a panel's route draws per frame once its maze is done.
 *
 * One pace for all six rather than one duration, so binary tree's 36 rooms are
 * drawn in half a second and depth-first's 114 take a second and a half. The
 * length of each route is then something you watch happen, and the last one
 * still drawing is the one the verdict opens on. It also fills what was a
 * second of held frame and silence between the routes and the verdict.
 */
export const ROUTE_PACE = 2.6;

/** Rooms of a route drawn by `frame`, 0 before the maze is finished. */
export const routeDrawnAt = (frame: number, rooms: number) =>
  frame < CARVE_END
    ? 0
    : Math.min(rooms, 1 + Math.floor((frame - CARVE_END) * ROUTE_PACE));

/** The frame a route of `rooms` finishes drawing. */
export const routeDoneAt = (rooms: number) =>
  CARVE_END + Math.ceil((rooms - 1) / ROUTE_PACE);

/** The panels start giving way to two maps. */
export const VERDICT_FROM = 262;
export const GROW = 22;

/**
 * The two walks, one after the other and at the same pace.
 *
 * Same rooms per frame for both, so the longer route is audibly and visibly the
 * longer walk rather than a longer number. Depth-first's 114 rooms take 48
 * frames and binary tree's 36 take whatever the same pace gives them.
 */
export const LONG_WALK_FROM = 288;
export const LONG_WALK_TO = 336;
const PACE = (RUNS.depthFirst.route - 1) / (LONG_WALK_TO - LONG_WALK_FROM);
export const SHORT_WALK_FROM = 342;
export const SHORT_WALK_TO =
  SHORT_WALK_FROM + Math.round((RUNS.binaryTree.route - 1) / PACE);

/**
 * The last beat: new binary tree mazes under a route that does not move.
 *
 * One every four frames. Faster flickers; slower shows too few to say "every
 * time" with.
 */
export const SHUFFLE_FROM = SHORT_WALK_TO + 6;
export const SHUFFLE_EVERY = 4;
export const SHUFFLE_TO = 412;
export const SHUFFLES = Math.floor((SHUFFLE_TO - SHUFFLE_FROM) / SHUFFLE_EVERY);

/** Which reshuffled maze is showing at `frame`, or -1 for the fixture. */
export const shuffleAt = (frame: number) =>
  frame < SHUFFLE_FROM
    ? -1
    : Math.min(
        SHUFFLES - 1,
        Math.floor((frame - SHUFFLE_FROM) / SHUFFLE_EVERY),
      );

/** Rooms walked by `frame`, 1 at the entrance and `rooms` at the exit. */
export const walkedAt = (
  frame: number,
  rooms: number,
  from: number,
  to: number,
) =>
  frame < from
    ? 0
    : 1 +
      Math.min(
        rooms - 1,
        Math.floor(((frame - from) / (to - from)) * (rooms - 1)),
      );
