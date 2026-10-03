/**
 * The ring road. One module, imported by both the reel and
 * `scripts/measure-phantom-jam.mjs`, so the picture and the committed run are
 * the same code and cannot drift apart.
 *
 * 22 cars, 4.5 m long, on a 230 m single-lane ring: the geometry of Sugiyama
 * et al. 2008. Human drivers follow the Intelligent Driver Model (Treiber,
 * Hennecke and Helbing 2000), plus a little seeded noise in the throttle,
 * because nobody holds a pedal perfectly still. One driver brakes hard for
 * three seconds at t = 10 s and then drives on normally.
 *
 * On the second ring one car runs a smoothing rule instead: hold a steady
 * speed a little under the flow, and never close to a gap shorter than 0.8 s
 * of travel. It does not chase the car ahead, so it does not pass a brake wave
 * on. Stern et al. 2018 showed on a real track that controlling one car's
 * speed can damp these waves; this rule is a simplification of that idea, not
 * their controller.
 *
 * Fixed 0.05 s steps and a seeded generator, so every run is identical.
 */

export const RING_M = 230;
export const CARS = 22;
export const CAR_M = 4.5;
export const DT = 0.05;
export const TAPPER = 0;
export const SMOOTHER = 11;
export const TAP_FROM = 10;
export const TAP_TO = 13;
export const TAP_BRAKE = 3;

export type Driver = {
  /** Speed wanted on an empty road, m/s. */
  readonly v0: number;
  /** Time gap kept to the car ahead, s. */
  readonly T: number;
  /** Comfortable acceleration and braking, m/s^2. */
  readonly a: number;
  readonly b: number;
  /** Bumper gap when stopped, m. */
  readonly s0: number;
};

export const HUMAN_DRIVER: Driver = { v0: 16, T: 0.6, a: 1.2, b: 1.5, s0: 1.5 };
export const NOISE = 0.15;
export const SEED = 7;
export const SMOOTH_GAP_S = 0.8;
export const SMOOTH_SHARE = 0.95;

const idm = (d: Driver, v: number, dv: number, s: number) => {
  const want =
    d.s0 + Math.max(0, v * d.T + (v * dv) / (2 * Math.sqrt(d.a * d.b)));
  return d.a * (1 - (v / d.v0) ** 4 - (want / Math.max(s, 0.1)) ** 2);
};

/** The speed every car settles at when the gaps are all equal. */
export const equilibrium = (d: Driver) => {
  const gap = RING_M / CARS - CAR_M;
  let ve = 0;
  for (let k = 0; k * 0.01 < d.v0; k++) {
    if (idm(d, k * 0.01, 0, gap) >= 0) ve = k * 0.01;
  }
  return ve;
};

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
};

export type Track = {
  readonly steps: number;
  /** Metres along the ring, per step per car. */
  readonly x: Float32Array;
  readonly v: Float32Array;
  readonly a: Float32Array;
};

export type RingOptions = {
  readonly driver?: Driver;
  readonly smoother?: boolean;
  readonly seed?: number;
  readonly noise?: number;
  readonly seconds?: number;
};

export const simulate = ({
  driver = HUMAN_DRIVER,
  smoother = false,
  seed = SEED,
  noise = NOISE,
  seconds = 100,
}: RingOptions = {}): Track => {
  const steps = Math.round(seconds / DT) + 1;
  const X = new Float32Array(steps * CARS);
  const V = new Float32Array(steps * CARS);
  const A = new Float32Array(steps * CARS);
  const random = rng(seed);
  const ve = equilibrium(driver);
  const x: number[] = [];
  const v: number[] = [];
  const acc: number[] = [];
  for (let i = 0; i < CARS; i++) {
    x.push((i * RING_M) / CARS);
    v.push(ve);
    acc.push(0);
  }
  for (let k = 0; k < steps; k++) {
    const t = k * DT;
    for (let i = 0; i < CARS; i++) {
      const j = (i + 1) % CARS;
      const s = ((x[j] - x[i] + RING_M) % RING_M) - CAR_M;
      let a = idm(driver, v[i], v[i] - v[j], s) + (random() - 0.5) * 2 * noise;
      if (i === TAPPER && t > TAP_FROM && t < TAP_TO)
        a = Math.min(a, -TAP_BRAKE);
      if (smoother && i === SMOOTHER) {
        const cmd = Math.min(
          ve * SMOOTH_SHARE,
          Math.max(0, (s - driver.s0) / SMOOTH_GAP_S),
        );
        a = Math.max(-3, Math.min(driver.a, (cmd - v[i]) * 0.5));
      }
      acc[i] = a;
    }
    for (let i = 0; i < CARS; i++) {
      X[k * CARS + i] = x[i];
      V[k * CARS + i] = v[i];
      A[k * CARS + i] = acc[i];
      v[i] = Math.max(0, v[i] + acc[i] * DT);
      x[i] = (x[i] + v[i] * DT) % RING_M;
    }
  }
  return { steps, x: X, v: V, a: A };
};

/** One car at simulated second t, interpolated between steps. */
export const carAt = (track: Track, i: number, t: number) => {
  const f = Math.min(track.steps - 2, Math.max(0, t / DT));
  const k = Math.floor(f);
  const u = f - k;
  const x0 = track.x[k * CARS + i];
  let x1 = track.x[(k + 1) * CARS + i];
  if (x1 < x0 - RING_M / 2) x1 += RING_M;
  return {
    x: (x0 + (x1 - x0) * u) % RING_M,
    v: track.v[k * CARS + i] * (1 - u) + track.v[(k + 1) * CARS + i] * u,
    a: track.a[k * CARS + i] * (1 - u) + track.a[(k + 1) * CARS + i] * u,
  };
};

/** Average speed of the whole ring at t, km/h. */
export const meanKmhAt = (track: Track, t: number) => {
  let sum = 0;
  for (let i = 0; i < CARS; i++) sum += carAt(track, i, t).v;
  return (sum / CARS) * 3.6;
};

/** A braking event: a car's deceleration crossing 1 m/s^2. */
export const BRAKING = -1;

export type Summary = {
  /** Most cars stopped at once, below 0.3 m/s. */
  readonly mostStopped: number;
  /** Mean speed over the window, km/h. */
  readonly meanKmh: number;
  readonly brakings: number;
};

/** Measured from `from` to the end of the run. */
export const summarise = (track: Track, from: number): Summary => {
  let mostStopped = 0;
  let sum = 0;
  let n = 0;
  let brakings = 0;
  const was = new Array<boolean>(CARS).fill(false);
  for (let k = Math.round(from / DT); k < track.steps; k++) {
    let stopped = 0;
    for (let i = 0; i < CARS; i++) {
      const v = track.v[k * CARS + i];
      if (v < 0.3) stopped++;
      sum += v;
      n++;
      const braking = track.a[k * CARS + i] < BRAKING;
      if (braking && !was[i]) brakings++;
      was[i] = braking;
    }
    mostStopped = Math.max(mostStopped, stopped);
  }
  return { mostStopped, meanKmh: (sum / n) * 3.6, brakings };
};
