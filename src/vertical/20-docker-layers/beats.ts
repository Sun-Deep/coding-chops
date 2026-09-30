/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * The first build is already under way at frame zero: the top steps stand and
 * packages are still landing in both installs.
 */
export const SLAB_FROM = -40;
export const SLAB_EVERY = 8;
export const slabAt = (i: number) => SLAB_FROM + i * SLAB_EVERY;
export const FILL_FROM = -10;
export const FILL_EVERY = 0.9;

/** The edit to server.js. */
export const DIFF_FROM = 56;
export const TYPE_FROM = 64;
export const TYPE_EVERY = 0.8;

/**
 * The rebuilds, one tower at a time, so the narration can point at each.
 * A cursor steps down the tower and every step says cached or ran.
 */
export const LEFT_FROM = 98;
export const RIGHT_FROM = 204;
export const STEP_EVERY = 11;
export const stepAt = (from: number, i: number) => from + i * STEP_EVERY;

/** Frames a file takes to fly from the build context into the step that copies it. */
export const FILE_FLY = 12;

/** The code-first install empties, then all 67 packages land again. */
export const DUMP = 8;
export const REFILL_EVERY = 0.85;

/** The verdict: what each rebuild cost, then the line that moved. */
export const VERDICT_FROM = 262;
export const MOVE_FROM = 294;
export const MOVE = 56;
