/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both gyms on one clock, from the moment the followed lifter walks in, at
 * eighteen times real time throughout. Slow enough that a set lasts about
 * two seconds and a rest about six, so every lift, sit and plate change can
 * be watched; the measured waits arrive as the verdict rather than on a clock
 * run at a speed where people blur.
 */
export const SIM_FROM = 1487.3;
export const SPEED = 18;

export const simAt = (frame: number) => SIM_FROM + (frame / 30) * SPEED;
export const frameAt = (sim: number) => ((sim - SIM_FROM) / SPEED) * 30;

export const VERDICT_FROM = 276;
