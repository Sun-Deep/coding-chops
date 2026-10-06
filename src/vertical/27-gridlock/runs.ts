import { SEED, simulate } from "./simulation";
import { LOCKED_AT } from "./measurements";

/**
 * The two grids the reel draws, checked on load against `measurements.ts`.
 * Editing a constant in `simulation.ts` without re-running the script throws here
 * instead of shipping a frame that disagrees with the committed numbers.
 */
export const RUNS = {
  green: simulate("green", SEED),
  room: simulate("room", SEED),
};

const locked = Math.round(RUNS.green.lockedAt * 10) / 10;
if (locked !== LOCKED_AT) {
  throw new Error(
    `runs.ts: the green grid locked at ${locked} s, measurements.ts says ${LOCKED_AT}`,
  );
}
if (RUNS.room.lockedAt !== Infinity) {
  throw new Error(
    "runs.ts: the room grid locked, measurements.ts says it never does",
  );
}

/** Cars that cleared a junction between simulated seconds `from` and `t`. */
export const throughBy = (key: "green" | "room", from: number, t: number) =>
  RUNS[key].crossings.filter((c) => c >= from && c < t).length;
