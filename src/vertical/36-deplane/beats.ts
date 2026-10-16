import { DOOR } from "./simulation";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Both cabins on one clock, as seconds after the seatbelt sign goes off.
 * The reel opens outside the plane at the gate, a few seconds before the
 * sign, while the camera moves in and the roof lifts away. The sign goes off
 * at frame 50, slowly enough to watch people get up; the wait for the door
 * goes by quickly; the walk-off runs at about twenty times real time and
 * reaches the moment you get off above at frame 300; the clock then slows
 * while you get off below.
 *
 * Fixed points, frame then simulated second, joined by a curve with no
 * sudden change of speed.
 */
export const SIGN = 50;
const POINTS: readonly (readonly [number, number])[] = [
  [0, -7],
  [SIGN, 0],
  [95, 6],
  [150, DOOR],
  [300, 208],
  [400, 262],
  [DURATION, 265],
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
  let lo = -200;
  let hi = DURATION + 200;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (simAt(mid) < sim) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

export const VERDICT_FROM = 306;
