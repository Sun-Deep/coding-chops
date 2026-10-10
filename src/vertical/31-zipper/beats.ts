/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both roads on one clock. The reel opens at simulated second 208, the
 * followed car at full speed in the lane that ends, 380 metres before the
 * cones, at three times real time: on the left it moves over and brakes at
 * the back of a long queue, and the first driver who stays in the ending lane
 * goes past it. Then the clock runs at fourteen times real time through the
 * crawl, slows to five while the right road's car reaches the cones, so the
 * turn about there can be seen, and speeds up to sixteen to bring the left road's
 * car through.
 */
export const SIM_FROM = 208;

/** Simulated seconds per real second, keyed by frame, linear between. */
const SPEED: readonly (readonly [number, number])[] = [
  [0, 3],
  [60, 3],
  [96, 14],
  [214, 14],
  [228, 5],
  [288, 5],
  [298, 16],
  [312, 16],
  [326, 4],
  [DURATION, 4],
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

export const simAt = (frame: number) => {
  const f = Math.max(0, Math.min(TABLE.length - 2, frame));
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

export const VERDICT_FROM = 318;
