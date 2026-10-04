/**
 * The escalator. One module, imported by both the reel and
 * `scripts/measure-escalator.mjs`, so the frames and the committed run are
 * the same code.
 *
 * A Holborn-sized escalator: a 23 m rise, 46 m along the incline, steps moving
 * at 0.75 m/s. Two lanes. Each lane has a queue at the bottom that never runs
 * out, the busiest part of the rush hour, so what an escalator carries is set
 * by the lanes, not by how many people turn up.
 *
 *   standing  people step on as soon as there is STAND_GAP of free step ahead
 *             and ride at belt speed
 *   walking   people step on once there is WALK_GAP ahead and climb on top of
 *             the belt, single file, unable to pass; each climbs at their own
 *             pace and slows the higher they get, so the lane bunches behind
 *             whoever is slowest
 *
 * STAND_GAP and WALK_GAP are not guessed. They are calibrated so the model
 * carries what Transport for London measured at Holborn: about 115 people a
 * minute with a walking lane and about 146 with both sides standing (two
 * reports give 141 and 151). The reel's claim is the mechanism and the trial
 * result, not the calibration.
 */

export const LENGTH = 46;
export const BELT = 0.75;
export const STEP = 0.4;
export const STAND_GAP = 0.6164;
export const WALK_GAP = 1.4;
export const DT = 0.1;
export const SECONDS = 150;
export const SEED = 1;

export type LaneKind = "stand" | "walk";
export type EscalatorKey = "walkLeft" | "standBoth";
export const LANES: Record<EscalatorKey, readonly [LaneKind, LaneKind]> = {
  walkLeft: ["walk", "stand"],
  standBoth: ["stand", "stand"],
};

export type Rider = {
  readonly id: number;
  /** Second they stepped on. */
  readonly on: number;
  /** Second they stepped off at the top. */
  readonly off: number;
  /** Climbing pace on the flat part of the climb, m/s on top of the belt. */
  readonly pace: number;
  /** Metres along the incline every RECORD seconds from `on`. */
  readonly s: Float32Array;
};

export const RECORD = 0.2;

const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
};

/** A walker's speed on top of the belt, slowing as they tire. */
const climbSpeed = (pace: number, s: number) =>
  pace * Math.max(0.35, 1 - (0.75 * s) / LENGTH);

export const runLane = (
  kind: LaneKind,
  seed: number,
  {
    standGap = STAND_GAP,
    walkGap = WALK_GAP,
    seconds = SECONDS,
  }: { standGap?: number; walkGap?: number; seconds?: number } = {},
): Rider[] => {
  const random = rng(seed);
  const gap = kind === "walk" ? walkGap : standGap;
  type Live = {
    id: number;
    on: number;
    pace: number;
    s: number;
    log: number[];
  };
  const live: Live[] = [];
  const done: Rider[] = [];
  let id = 0;
  const every = Math.round(RECORD / DT);
  for (let k = 0; k * DT < seconds; k++) {
    const t = k * DT;
    const last = live[live.length - 1];
    if (!last || last.s >= gap) {
      // Step on exactly one gap behind the last person, so the lane's flow
      // is set by the gap and not by the length of a tick.
      const s0 = last ? last.s - gap : 0;
      live.push({
        id: id++,
        on: t,
        pace: kind === "walk" ? 0.55 + 0.45 * random() : 0,
        s: s0,
        log: [s0],
      });
    }
    for (let i = 0; i < live.length; i++) {
      const p = live[i];
      const v = BELT + (kind === "walk" ? climbSpeed(p.pace, p.s) : 0);
      let next = p.s + v * DT;
      if (i > 0) next = Math.min(next, Math.max(p.s, live[i - 1].s - gap));
      p.s = next;
      if (Math.round((t - p.on) / DT) % every === 0) p.log.push(p.s);
    }
    while (live.length && live[0].s >= LENGTH) {
      const p = live.shift() as Live;
      done.push({
        id: p.id,
        on: p.on,
        off: t,
        pace: p.pace,
        s: new Float32Array(p.log),
      });
    }
  }
  for (const p of live) {
    done.push({
      id: p.id,
      on: p.on,
      off: Infinity,
      pace: p.pace,
      s: new Float32Array(p.log),
    });
  }
  return done;
};

/** People reaching the top a minute, measured over [from, to) seconds. */
export const perMinute = (riders: readonly Rider[], from: number, to: number) =>
  (riders.filter((r) => r.off >= from && r.off < to).length / (to - from)) * 60;

export type Escalator = { readonly lanes: readonly [Rider[], Rider[]] };

export const runEscalator = (
  key: EscalatorKey,
  seed: number = SEED,
  opts: { standGap?: number; walkGap?: number; seconds?: number } = {},
): Escalator => ({
  lanes: [
    runLane(LANES[key][0], seed * 2 + 1, opts),
    runLane(LANES[key][1], seed * 2 + 2, opts),
  ],
});

/** Measured once the escalator is full and running steadily. */
export const STEADY_FROM = 70;
export const STEADY_TO = 150;
