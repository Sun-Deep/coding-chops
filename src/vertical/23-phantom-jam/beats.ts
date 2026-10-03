/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Two runs of the same ring on one clock, back to back. Both open at
 * simulated second 6, four seconds before the tap, and run at 0.4 simulated
 * seconds a frame: twelve times real time, so a jam that took the real
 * experiment a few minutes to settle in builds in about four seconds here.
 */
export const SIM_FROM = 6;
export const SIM_PER_FRAME = 0.4;

/** Human drivers only, then the replay with the smoothing car. */
export const REPLAY_FROM = 190;

export const partOf = (frame: number) =>
  frame < REPLAY_FROM
    ? { replay: false, local: frame }
    : { replay: true, local: frame - REPLAY_FROM };

export const simAt = (frame: number) =>
  SIM_FROM + partOf(frame).local * SIM_PER_FRAME;

/** Local frame of a simulated second, within either run. */
export const localFrameAt = (sim: number) => (sim - SIM_FROM) / SIM_PER_FRAME;

/** Camera: close on the car that brakes, then back to the whole ring. */
export const ZOOM = 2.8;
export const HOLD = 18;
export const PULL = 40;

/** The payoff line. */
export const VERDICT_FROM = 282;
