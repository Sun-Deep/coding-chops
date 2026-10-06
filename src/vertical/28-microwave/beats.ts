/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both kitchens on one clock, from the moment the line has formed. The first
 * three seconds run at forty times real time, slow enough to watch the quick
 * ones walk past the 3:00 lunch on the bottom; then the clock speeds up to
 * sixty-six times, so both lines finish together just before the end.
 */
const SPEED: readonly (readonly [number, number])[] = [
  [0, 40],
  [90, 40],
  [120, 66],
  [DURATION, 66],
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
  let lo = 0;
  let hi = TABLE.length - 1;
  if (sim <= 0) return 0;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (TABLE[mid] <= sim) lo = mid;
    else hi = mid;
  }
  return lo + (sim - TABLE[lo]) / (TABLE[hi] - TABLE[lo]);
};

/** Frames a walk takes on screen, whatever the clock is doing. */
export const WALK = 10;

export const VERDICT_FROM = 300;
