/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both trees on one clock from the moment the plug goes in. Three times real
 * time for the first four and a half seconds, slow enough to follow every
 * check on the right as it halves the string; then the clock hurries through
 * the bulb swap and settles at thirteen times, so the left, still going bulb
 * by bulb, lights just before the end.
 */
const SPEED: readonly (readonly [number, number])[] = [
  [0, 3],
  [140, 3],
  [170, 10],
  [200, 13],
  [DURATION, 13],
];

const speedAt = (frame: number) => {
  for (let i = 1; i < SPEED.length; i++) {
    const [f1, v1] = SPEED[i];
    const [f0, v0] = SPEED[i - 1];
    if (frame <= f1) return v0 + ((v1 - v0) * (frame - f0)) / (f1 - f0);
  }
  return SPEED[SPEED.length - 1][1];
};

const TABLE: number[] = [0];
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

export const frameAt = (sim: number) => {
  if (sim <= 0) return 0;
  let lo = 0;
  let hi = TABLE.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (TABLE[mid] <= sim) lo = mid;
    else hi = mid;
  }
  return lo + (sim - TABLE[lo]) / (TABLE[hi] - TABLE[lo]);
};

export const VERDICT_FROM = 300;
