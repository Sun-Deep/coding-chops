export const DURATION = 420;

/** One shared clock. Holds preserve boarding actions; travel is compressed. */
export const CAMERA_WIDEN_FROM = 0;
export const CAMERA_WIDEN_TO = 30;
export const BLOCK_FROM = 240;
export const BLOCK_TO = 325;
/** The following bus repeats a short pair of signals every 1.8 seconds. */
export const PASS_FRAMES = Array.from(
  { length: Math.ceil((DURATION - 23) / 54) },
  (_, cycle) => [23 + cycle * 54, 35 + cycle * 54],
)
  .flat()
  .filter((frame) => frame + 6 <= DURATION);
const POINTS = [
  [0, 35],
  [30, 48],
  [54, 52.25],
  [125, 89.75],
  [165, 122.25],
  [205, 149.5],
  [230, 212],
  [BLOCK_FROM, 226.75],
  [BLOCK_TO, 249.5],
  [367, 256.5],
  [420, 280],
] as const;
export const simAt = (frame: number) => {
  const f = Math.max(0, Math.min(DURATION, frame));
  for (let i = 1; i < POINTS.length; i++) {
    const [f0, t0] = POINTS[i - 1];
    const [f1, t1] = POINTS[i];
    if (f <= f1) return t0 + ((t1 - t0) * (f - f0)) / (f1 - f0);
  }
  return POINTS[POINTS.length - 1][1];
};
export const frameAt = (time: number) => {
  for (let i = 1; i < POINTS.length; i++) {
    const [f0, t0] = POINTS[i - 1];
    const [f1, t1] = POINTS[i];
    if (time <= t1) return f0 + ((f1 - f0) * (time - t0)) / (t1 - t0);
  }
  return DURATION;
};
