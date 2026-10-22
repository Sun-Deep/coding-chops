import { DRIVE_S, plan } from "./simulation";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

const P = plan();

/** The frame each car lets go of the ramp. */
export const LET_GO = 72;
/** The frame the roof hits on top, and the wheels touch below. */
export const ROOF_DOWN = 232;
export const WHEELS_DOWN = 282;

/**
 * Both cars on one clock, as seconds since they let go of the ramp. The reel
 * opens in real time with the cars already upside down and driving along
 * the ramp. From the moment they let go, the fall runs about six times
 * slower than real time, so the roll can be seen; once both are down it
 * speeds up again while they come to a stop.
 *
 * Fixed points, frame then second, joined by a curve with no sudden change
 * of speed.
 */
const POINTS: readonly (readonly [number, number])[] = [
  [0, -DRIVE_S],
  [LET_GO, 0],
  [ROOF_DOWN, P.hit],
  [WHEELS_DOWN, P.land],
  [DURATION, P.land + 2.5],
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

/** The frame a second is on screen, the inverse of `simAt`. */
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
