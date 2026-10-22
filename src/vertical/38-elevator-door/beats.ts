import { HERO } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both lobbies on one clock, as seconds since the morning began. The reel
 * opens fifteen seconds before you reach the lift: on top the doors have
 * been held for a minute and are about to shut for good, below the car is
 * just leaving. The wait for the cars to come back goes by quickly; the
 * holds on top run at about twelve times real time; you step out below at
 * frame 300 and on top at frame 400.
 *
 * Fixed points, frame then simulated second, joined by a curve with no
 * sudden change of speed.
 */
const POINTS: readonly (readonly [number, number])[] = [
  [0, HERO.at - 14.5],
  [45, HERO.at + 0.5],
  [110, 3093],
  [260, 3156],
  [300, HERO.close.out],
  [400, HERO.hold.out],
  [DURATION, HERO.hold.out + 2.5],
];

/** Monotone cubic interpolation (Fritsch and Carlson) through POINTS. */
const slopes = (() => {
  const n = POINTS.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++)
    d.push(
      (POINTS[i + 1][1] - POINTS[i][1]) / (POINTS[i + 1][0] - POINTS[i][0]),
    );
  const m: number[] = [d[0]];
  for (let i = 1; i < n - 1; i++)
    m.push(
      d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i]),
    );
  m.push(d[n - 2]);
  return m;
})();

export const simAt = (frame: number) => {
  const n = POINTS.length;
  if (frame <= POINTS[0][0])
    return POINTS[0][1] + (frame - POINTS[0][0]) * slopes[0];
  if (frame >= POINTS[n - 1][0])
    return POINTS[n - 1][1] + (frame - POINTS[n - 1][0]) * slopes[n - 1];
  let i = 0;
  while (frame > POINTS[i + 1][0]) i++;
  const [x0, y0] = POINTS[i];
  const [x1, y1] = POINTS[i + 1];
  const h = x1 - x0;
  const u = (frame - x0) / h;
  const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
  const h10 = u ** 3 - 2 * u ** 2 + u;
  const h01 = -2 * u ** 3 + 3 * u ** 2;
  const h11 = u ** 3 - u ** 2;
  return h00 * y0 + h10 * h * slopes[i] + h01 * y1 + h11 * h * slopes[i + 1];
};

/** The frame a simulated second is on screen, the inverse of `simAt`. */
export const frameAt = (sim: number) => {
  let lo = -400;
  let hi = DURATION + 400;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (simAt(mid) < sim) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

export const VERDICT_FROM = 306;
