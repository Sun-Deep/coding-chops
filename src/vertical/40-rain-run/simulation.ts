/**
 * Walking or running through the rain to shelter, counted drop by drop.
 *
 * The rain falls straight down at the drops' terminal speed. Between the
 * shop's awning and the bus shelter there is GAP metres of open sky; under
 * either roof no rain reaches the ground. You are a box HEIGHT tall, WIDTH
 * across and DEPTH front to back, moving along the street at a steady speed
 * from the moment your front leaves the awning until your back is under the
 * shelter.
 *
 * A drop hits you one of two ways. Either your front walks into it while it
 * is between your feet and the top of your head, or it falls onto your head
 * and shoulders. Every drop between the roofs at your height gets walked into
 * exactly once, however fast you go, so the front count depends only on how
 * far you go. The drops landing on top arrive at a fixed rate for as long as
 * you are out in it, so that count depends only on how long.
 *
 * `expected` is that argument as a formula. `shower` drops real points into
 * the street and tests each one against the moving box, the way a game tests
 * a bullet against a body, so the formula is checked by counting rather than
 * trusted. Nothing in either depends on a value the reel does not print.
 */

/** Heavy rain, millimetres an hour. */
export const RAIN = 20;
/** Raindrop diameter, millimetres. */
export const DROP = 2;
/** Open sky between the awning and the shelter, metres. */
export const GAP = 14;
export const HEIGHT = 1.7;
export const WIDTH = 0.45;
export const DEPTH = 0.25;
/** Steady speeds, metres a second: a normal walk, and a run for it. */
export const WALK = 1.4;
export const RUN = 5;

export type Gait = "walk" | "run";

export type Options = {
  rain?: number;
  drop?: number;
  gap?: number;
  height?: number;
  width?: number;
  depth?: number;
  walk?: number;
  run?: number;
  /** Wind along the street, metres a second, positive from behind you. */
  wind?: number;
};

const settings = (o: Options = {}) => ({
  rain: o.rain ?? RAIN,
  drop: o.drop ?? DROP,
  gap: o.gap ?? GAP,
  height: o.height ?? HEIGHT,
  width: o.width ?? WIDTH,
  depth: o.depth ?? DEPTH,
  walk: o.walk ?? WALK,
  run: o.run ?? RUN,
  wind: o.wind ?? 0,
});

/**
 * Terminal fall speed of a raindrop, metres a second, from its diameter in
 * millimetres: the polynomial fit to Gunn and Kinzer's measurements used by
 * Atlas, Srivastava and Sekhon (1973). 3.9 m/s at 1 mm, 6.5 at 2 mm.
 */
export const fallSpeed = (mm: number) =>
  -0.1021 +
  4.932 * mm -
  0.9551 * mm ** 2 +
  0.07934 * mm ** 3 -
  0.002362 * mm ** 4;

/**
 * Drops in a cubic metre of air. Rain of R mm/h is that much water crossing
 * each square metre of ground an hour, falling at the drops' speed, so the
 * water hanging in the air is R / speed and the count is that over one
 * drop's volume.
 */
export const dropsPerCubicMetre = (o: Options = {}) => {
  const s = settings(o);
  const flux = s.rain / 1000 / 3600;
  const volume = (Math.PI / 6) * (s.drop / 1000) ** 3;
  return flux / fallSpeed(s.drop) / volume;
};

export const speedOf = (gait: Gait, o: Options = {}) =>
  gait === "walk" ? settings(o).walk : settings(o).run;

/** Seconds from your front leaving the awning to your back under the shelter. */
export const timeOut = (gait: Gait, o: Options = {}) => {
  const s = settings(o);
  return (s.gap + s.depth) / speedOf(gait, o);
};

/**
 * How much of your top is under open sky with your front `x` metres past
 * the awning.
 */
const openTop = (x: number, gap: number, depth: number) =>
  Math.max(0, Math.min(x, gap) - Math.max(x - depth, 0));

export type Count = { front: number; top: number; total: number };

/**
 * The expected drops on you by `t` seconds after your front left the
 * awning, walking or running. With wind along the street the rain also
 * moves sideways, so the front meets it at your speed less the wind's (and
 * your back takes it if the wind is faster than you).
 */
export const expected = (gait: Gait, t: number, o: Options = {}): Count => {
  const s = settings(o);
  const n = dropsPerCubicMetre(o);
  const v = speedOf(gait, o);
  const u = fallSpeed(s.drop);
  const x = Math.max(0, Math.min(v * t, s.gap + s.depth));
  const swept = Math.min(x, s.gap);
  const front = (n * s.width * s.height * swept * Math.abs(v - s.wind)) / v;
  // The open area on top, integrated over the distance covered so far:
  // each metre of street is under your top for `depth` metres of travel.
  const steps = 400;
  let area = 0;
  for (let k = 0; k < steps; k++)
    area += openTop(((k + 0.5) / steps) * x, s.gap, s.depth) * (x / steps);
  const top = (n * u * s.width * area) / v;
  return { front, top, total: front + top };
};

/** The whole trip's expected drops. */
export const trip = (gait: Gait, o: Options = {}) =>
  expected(gait, timeOut(gait, o), o);

/** A small seeded generator (mulberry32), so a shower can be replayed. */
export const random = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * One shower, counted. Drops are scattered at random through the air over
 * the open street, in still air, each falling at the terminal speed, and
 * every one is tested against the moving box: does your front reach its
 * column while it is between your feet and your head, or does it come down
 * on your top while you are under it? The same seed is the same rain, so
 * the walker and the runner can go through exactly the same drops.
 */
export const shower = (gait: Gait, seed: number, o: Options = {}): Count => {
  const s = settings(o);
  const n = dropsPerCubicMetre(o);
  const v = speedOf(gait, o);
  const u = fallSpeed(s.drop);
  // Every drop that is ever going to come within reach: over the open
  // street, across your width, from the ground up to as high as rain can
  // fall from while the slowest of you is out.
  const slowest = timeOut("walk", o);
  const ceiling = s.height + u * slowest + 1;
  const volume = s.gap * s.width * ceiling;
  const rng = random(seed);
  // Poisson count of drops in that volume.
  const mean = n * volume;
  const count = Math.round(mean + Math.sqrt(mean) * gauss(rng));
  let front = 0;
  let roof = 0;
  for (let k = 0; k < count; k++) {
    const x = rng() * s.gap;
    const z0 = rng() * ceiling;
    rng(); // across your width: every drop there is in line with you
    // Your front reaches this column at x / v; the drop is then at:
    const zFront = z0 - (u * x) / v;
    if (zFront >= 0 && zFront <= s.height) {
      front++;
      continue;
    }
    // Otherwise it can land on top, if it reaches your head height while
    // that part of the street is under you: from x / v to (x + depth) / v.
    const tHead = (z0 - s.height) / u;
    if (tHead >= x / v && tHead <= (x + s.depth) / v) roof++;
  }
  return { front, top: roof, total: front + roof };
};

/** A standard normal draw (Box-Muller). */
const gauss = (rng: () => number) => {
  const a = Math.max(1e-12, rng());
  return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * rng());
};

/** The mean of `n` showers, each with its own seed. */
export const showers = (gait: Gait, n: number, o: Options = {}): Count => {
  const sum = { front: 0, top: 0, total: 0 };
  for (let seed = 1; seed <= n; seed++) {
    const c = shower(gait, seed, o);
    sum.front += c.front;
    sum.top += c.top;
    sum.total += c.total;
  }
  return { front: sum.front / n, top: sum.top / n, total: sum.total / n };
};
