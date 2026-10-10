/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both restaurants on one clock. The reel opens at simulated second 1068,
 * seventeen and three quarter minutes into the rush, just after the followed
 * customer has walked in, at four times real time. Then the clock runs at fifty-five times real
 * time, through the till line on top and the wait at the pickup counter
 * below, until both have their trays. The payoff runs at six times, so the
 * room keeps moving while it is named.
 */
export const SIM_FROM = 1068;

/** Simulated seconds per real second, keyed by frame, linear between. */
const SPEED: readonly (readonly [number, number])[] = [
  [0, 4],
  [40, 4],
  [80, 55],
  [296, 55],
  [314, 6],
  [DURATION, 6],
];

const speedAt = (frame: number) => {
  for (let i = 1; i < SPEED.length; i++) {
    const [f1, v1] = SPEED[i];
    const [f0, v0] = SPEED[i - 1];
    if (frame <= f1) return v0 + ((v1 - v0) * (frame - f0)) / (f1 - f0);
  }
  return SPEED[SPEED.length - 1][1];
};

/** Simulated second at each whole frame, integrated in tenths of a frame. */
const TABLE: number[] = [SIM_FROM];
for (let f = 0; f < DURATION + 30; f++) {
  let sim = TABLE[f];
  for (let k = 0; k < 10; k++) sim += speedAt(f + (k + 0.5) / 10) / 300;
  TABLE.push(sim);
}

/** Before frame 0 the clock runs at the opening speed, for the settling pass. */
export const simAt = (frame: number) => {
  if (frame < 0) return SIM_FROM + (frame / 30) * SPEED[0][1];
  const f = Math.min(TABLE.length - 2, frame);
  const k = Math.floor(f);
  return TABLE[k] + (TABLE[k + 1] - TABLE[k]) * (f - k);
};

/** The frame a simulated second is on screen, the inverse of `simAt`. */
export const frameAt = (sim: number) => {
  if (sim <= SIM_FROM) return ((sim - SIM_FROM) / SPEED[0][1]) * 30;
  let lo = 0;
  let hi = TABLE.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (TABLE[mid] <= sim) lo = mid;
    else hi = mid;
  }
  return lo + (sim - TABLE[lo]) / (TABLE[hi] - TABLE[lo]);
};

export const VERDICT_FROM = 312;
