/**
 * The Roadster letting go of an upside-down ramp. One module, imported by
 * both the reel and `scripts/measure-roadster-roll.mjs`, so the frames and
 * the committed run are the same code.
 *
 * At its October 2026 reveal, Tesla's Roadster drove up a curved ramp onto
 * its roof, held on by a fan sucking it to the surface, drove off the end and
 * landed on its wheels, rolling over in the air on cold-gas thrusters. Tesla
 * published no height, weight, size or thrust, so every one of those is an
 * assumption here, and the measurement script sweeps each.
 *
 * The car is a solid box LENGTH by WIDTH by HEIGHT, wheels included. It
 * drives along the underside of the ramp, upside down, speeding up to EXIT_V,
 * and lets go with its roof DROP above the ground. Then, the same car under
 * two rules:
 *
 *   off   no thrusters. It falls without turning and lands on its roof.
 *   on    it rolls half a turn about its long axis as it falls, its side
 *         thrusters pushing one side up and the other down, so they add no
 *         lift. Once it is the right way up, the thrusters underneath, which
 *         pointed at the sky while it was upside down, push up at BRAKE times
 *         its weight until the wheels touch at LAND_V. The roll uses all the
 *         time before the braking has to start: the least twist that works.
 *
 * Both landings are modelled so the force on the car can be read off: the
 * roof crushes ROOF_CRUSH as it stops the fall, the suspension gives
 * SUSPENSION as the wheels take the last of it. Each stops evenly over that
 * distance.
 *
 * The force on the car is what an accelerometer in it would read, in g: the
 * push of everything except gravity, divided by its weight. Upside down on
 * the ramp, the fan pulls it on with FAN g and the ramp pushes back with
 * FAN - 1, which is the tyres' grip: it reads 1 g, the same as a car parked
 * on a road. Falling freely, rolling or not, it reads 0 g.
 *
 * Seconds count from the moment it lets go. Heights are of the box's centre.
 */

export type Rule = "off" | "on";

export const G = 9.81;
/** A low two-seat sports car, in metres. Tesla has not published the car's size. */
export const LENGTH = 4.4;
export const WIDTH = 2.0;
export const HEIGHT = 1.15;
/** Metres from the roof to the ground when it lets go. */
export const DROP = 5;
/** Metres a second along the ramp when it lets go. */
export const EXIT_V = 4;
/** Seconds of driving upside down along the ramp before it lets go. */
export const DRIVE_S = 2.4;
/** Metres a second when the reel opens: stopped, upside down, held on by the fan. */
export const START_V = 0;
/** The fan's pull toward the ramp, in g. Tesla: "up to two Gs". */
export const FAN = 2;
/** Thrust underneath while braking, in multiples of the car's weight. */
export const BRAKE = 2;
/** Metres a second downward when the wheels touch. */
export const LAND_V = 1;
/** Metres the roof crushes as it stops the fall. */
export const ROOF_CRUSH = 0.2;
/** Metres the suspension gives as the wheels touch. */
export const SUSPENSION = 0.1;
/** Seconds the suspension takes to come back up. */
export const SETTLE_S = 0.5;
/** Sliding on its roof, metal on concrete. */
export const ROOF_FRICTION = 0.5;
/** Braking on its wheels after the landing, metres a second a second. */
export const TYRE_BRAKE = 3;

export type Options = {
  readonly drop?: number;
  readonly brake?: number;
  readonly landV?: number;
  readonly crush?: number;
  readonly suspension?: number;
  readonly length?: number;
  readonly width?: number;
  readonly height?: number;
};

/**
 * The moments that define both falls, worked out once: when the roof hits
 * with no thrusters and how fast, how hard the crush stops it, when the
 * braking has to start (so when the roll has to be done), when the wheels
 * touch and how hard the suspension stops them.
 */
export const plan = (opts: Options = {}) => {
  const drop = opts.drop ?? DROP;
  const brake = opts.brake ?? BRAKE;
  const landV = opts.landV ?? LAND_V;
  const crush = opts.crush ?? ROOF_CRUSH;
  const suspension = opts.suspension ?? SUSPENSION;
  // Off: free fall until the roof, at the same height under the centre as
  // when it let go, reaches the ground. Then the roof crushes.
  const hit = Math.sqrt((2 * drop) / G);
  const hitV = G * hit;
  const crushA = hitV ** 2 / (2 * crush);
  const crushT = (2 * crush) / hitV;
  // On: free fall for d1, then braking at net (brake - 1) g for the rest,
  // reaching landV at the ground. The centre falls the same distance either
  // way: a box is as tall upside down as the right way up.
  const decel = (brake - 1) * G;
  const d1 = (landV ** 2 + 2 * decel * drop) / (2 * (G + decel));
  const rollBy = Math.sqrt((2 * d1) / G);
  const brakeV = G * rollBy;
  const land = rollBy + (brakeV - landV) / decel;
  const springA = landV ** 2 / (2 * suspension);
  const springT = (2 * suspension) / landV;
  return {
    drop,
    hit,
    hitV,
    crush,
    crushA,
    crushT,
    roofG: 1 + crushA / G,
    rollBy,
    brakeV,
    decel,
    brakeG: brake,
    land,
    landV,
    suspension,
    springA,
    springT,
    landG: 1 + springA / G,
  };
};

/** Turned so far through half a turn, 0 to 1: even push, then even brake. */
const turned = (u: number) => {
  const v = Math.max(0, Math.min(1, u));
  return v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) ** 2;
};

export type State =
  | "held"
  | "falling"
  | "crushing"
  | "sliding"
  | "on its roof"
  | "starting roll"
  | "stopping roll"
  | "braking"
  | "suspension"
  | "on its wheels";

export type Pose = {
  /** Metres along the ground, 0 under the end of the ramp, falling toward -x. */
  readonly x: number;
  /** Height of the centre. */
  readonly z: number;
  /** About the long axis: PI upside down, 0 the right way up. */
  readonly roll: number;
  /** Metres a second along the ground (toward -x is negative) and up. */
  readonly vx: number;
  readonly vz: number;
  /** Metres a second a second, along the ground and up. */
  readonly ax: number;
  readonly az: number;
  /** Which thrusters are firing. */
  readonly rolling: boolean;
  readonly braking: boolean;
  /** On the ramp, in the air, or down. */
  readonly phase: "ramp" | "air" | "down";
  readonly state: State;
};

/**
 * What an accelerometer in the car reads, in g: everything pushing on it
 * except gravity. Gravity pulls down at G whatever happens, so the rest is
 * the acceleration plus G upward.
 */
export const gForce = (q: Pick<Pose, "ax" | "az">) =>
  Math.hypot(q.ax / G, q.az / G + 1);

/** Gap under the car's lowest point, in metres. */
export const clearance = (q: Pose, opts: Options = {}) => {
  const width = opts.width ?? WIDTH;
  const height = opts.height ?? HEIGHT;
  const reach =
    (width / 2) * Math.abs(Math.sin(q.roll)) +
    (height / 2) * Math.abs(Math.cos(q.roll));
  return Math.max(0, q.z - reach);
};

/** Where the car is at second t, under each rule. */
export const pose = (rule: Rule, t: number, opts: Options = {}): Pose => {
  const p = plan(opts);
  const height = opts.height ?? HEIGHT;
  const z0 = p.drop + height / 2;
  const still = { rolling: false, braking: false };
  if (t < 0) {
    // Speeding up evenly along the underside of the ramp.
    const a = (EXIT_V - START_V) / DRIVE_S;
    return {
      ...still,
      x: -(EXIT_V * t + 0.5 * a * t * t),
      z: z0,
      roll: Math.PI,
      vx: -(EXIT_V + a * t),
      vz: 0,
      ax: -a,
      az: 0,
      phase: "ramp",
      state: "held",
    };
  }
  if (rule === "off") {
    if (t < p.hit)
      return {
        ...still,
        x: -EXIT_V * t,
        z: z0 - 0.5 * G * t * t,
        roll: Math.PI,
        vx: -EXIT_V,
        vz: -G * t,
        ax: 0,
        az: -G,
        phase: "air",
        state: "falling",
      };
    if (t < p.hit + p.crushT) {
      const s = t - p.hit;
      return {
        ...still,
        x: -EXIT_V * t,
        z: height / 2 - (p.hitV * s - 0.5 * p.crushA * s * s),
        roll: Math.PI,
        vx: -EXIT_V,
        vz: -(p.hitV - p.crushA * s),
        ax: 0,
        az: p.crushA,
        phase: "down",
        state: "crushing",
      };
    }
    const decel = ROOF_FRICTION * G;
    const s = t - p.hit - p.crushT;
    const stop = EXIT_V / decel;
    const u = Math.min(s, stop);
    return {
      ...still,
      x: -EXIT_V * (p.hit + p.crushT) - (EXIT_V * u - 0.5 * decel * u * u),
      z: height / 2 - p.crush,
      roll: Math.PI,
      vx: s < stop ? -(EXIT_V - decel * u) : 0,
      vz: 0,
      ax: s < stop ? decel : 0,
      az: 0,
      phase: "down",
      state: s < stop ? "sliding" : "on its roof",
    };
  }
  if (t < p.rollBy)
    return {
      x: -EXIT_V * t,
      z: z0 - 0.5 * G * t * t,
      roll: Math.PI * (1 - turned(t / p.rollBy)),
      vx: -EXIT_V,
      vz: -G * t,
      ax: 0,
      az: -G,
      rolling: true,
      braking: false,
      phase: "air",
      state: t < p.rollBy / 2 ? "starting roll" : "stopping roll",
    };
  if (t < p.land) {
    const s = t - p.rollBy;
    const zb = z0 - 0.5 * G * p.rollBy ** 2;
    return {
      x: -EXIT_V * t,
      z: zb - p.brakeV * s + 0.5 * p.decel * s * s,
      roll: 0,
      vx: -EXIT_V,
      vz: -(p.brakeV - p.decel * s),
      ax: 0,
      az: p.decel,
      rolling: false,
      braking: true,
      phase: "air",
      state: "braking",
    };
  }
  const s = t - p.land;
  const stop = EXIT_V / TYRE_BRAKE;
  const u = Math.min(s, stop);
  const x = -EXIT_V * p.land - (EXIT_V * u - 0.5 * TYRE_BRAKE * u * u);
  const ax = s < stop ? TYRE_BRAKE : 0;
  if (s < p.springT)
    return {
      ...still,
      x,
      z: height / 2 - (p.landV * s - 0.5 * p.springA * s * s),
      roll: 0,
      vx: s < stop ? -(EXIT_V - TYRE_BRAKE * u) : 0,
      vz: -(p.landV - p.springA * s),
      ax,
      az: p.springA,
      phase: "down",
      state: "suspension",
    };
  // The springs push the car back up to its ride height, smoothly.
  const k = Math.min(1, (s - p.springT) / SETTLE_S);
  const zs = p.suspension * (3 * k * k - 2 * k ** 3);
  const vs = (p.suspension * (6 * k - 6 * k * k)) / SETTLE_S;
  const as = k < 1 ? (p.suspension * (6 - 12 * k)) / SETTLE_S ** 2 : 0;
  return {
    ...still,
    x,
    z: height / 2 - p.suspension + zs,
    roll: 0,
    vx: s < stop ? -(EXIT_V - TYRE_BRAKE * u) : 0,
    vz: k < 1 ? vs : 0,
    ax,
    az: as,
    phase: "down",
    state: "on its wheels",
  };
};

/**
 * How close the car's lowest corner comes to the ground while it is still
 * turning, in metres. A box turned partway sticks down further than it does
 * flat, so this is the check that the roll has room.
 */
export const rollClearance = (opts: Options = {}) => {
  const p = plan(opts);
  const width = opts.width ?? WIDTH;
  const height = opts.height ?? HEIGHT;
  let least = Infinity;
  for (let i = 0; i <= 400; i++) {
    const t = (p.rollBy * i) / 400;
    const q = pose("on", t, opts);
    const reach =
      (width / 2) * Math.abs(Math.sin(q.roll)) +
      (height / 2) * Math.abs(Math.cos(q.roll));
    least = Math.min(least, q.z - reach);
  }
  return least;
};

/**
 * How many times the twist a backflip would need, turning end over end in
 * the same time as the roll: the ratio of the two moments of inertia, so it
 * does not depend on the car's weight. As a solid box, and with all of the
 * weight in a thin floor, which is nearer a car carrying its battery under
 * the seats. A real car is somewhere between.
 */
export const flipTwist = (opts: Options = {}) => {
  const l = opts.length ?? LENGTH;
  const w = opts.width ?? WIDTH;
  const h = opts.height ?? HEIGHT;
  return { box: (l * l + h * h) / (w * w + h * h), floor: (l * l) / (w * w) };
};
