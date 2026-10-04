/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * The reel opens at simulated second 72, with both escalators already full,
 * and runs at twice real time: slow enough to see the walkers climbing past
 * the moving steps, fast enough for the counters to pull apart.
 */
export const SIM_FROM = 72;
export const SPEED = 2;
export const simAt = (frame: number) => SIM_FROM + (frame / 30) * SPEED;

export const VERDICT_FROM = 300;
