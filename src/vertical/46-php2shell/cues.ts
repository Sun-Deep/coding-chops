import {
  ARRIVE,
  CLEAN,
  DIVE,
  HOLD,
  LANDS,
  OFF,
  OOM,
  PATCH,
  PULL,
  STEPS,
  TAKEOVER,
  VERDICT_FROM,
} from "./beats";

/**
 * The sound of what is on screen, from the recorded CC0 set in
 * `public/sfx/kenney/`:
 *
 * - the timeline's dates landing, ticks;
 * - the named sites switching off, a power switch each, then the rest;
 * - the dive into one server, soft knocks as it passes the others;
 * - the request's parts rattling in, and each clicking into its slot,
 *   faster and faster;
 * - an error and a dead stop when memory runs out;
 * - ticks as cleanup climbs, a knock as it stops on the half-built part,
 *   two pulses while it reads it, then a slowed bell as orange takes over;
 * - glass pings as the patch passes over the field, a resolve, a tick
 *   for each step, and a low hit and the slowed bell under the fix.
 *
 * The frames follow `scripts/blender/php/server.py`, which reads the same
 * beats.
 */

export type Cue = {
  readonly id: string;
  readonly name: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
  readonly length?: number;
};

const dB = (target: number) =>
  Math.round(10 ** ((target + 1) / 20) * 1000) / 1000;
const random = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const rng = random(46);
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rng() * xs.length)];
const k = (name: string) => `kenney/${name}`;
const CLICKS = ["tick_001", "tick_002", "click_004", "click_002"];
const LIGHT = [0, 1, 2].map((i) => `impactGeneric_light_00${i}`);

const spread = (
  id: string,
  from: number,
  to: number,
  count: number,
  names: readonly string[],
  level: number,
  rate: [number, number],
): Cue[] =>
  Array.from({ length: count }, (_, h) => ({
    id: `${id}-${h}`,
    name: k(pick(names)),
    frame: Math.round(from + ((to - from) * h) / Math.max(1, count - 1)),
    rate: rate[0] + rng() * (rate[1] - rate[0]),
    gain: dB(level - rng() * 4),
  }));

export const CUES: readonly Cue[] = [
  ...[4, 14, 24].map(
    (frame, i): Cue => ({
      id: `date-${i}`,
      name: k(i % 2 ? "tick_002" : "tick_001"),
      frame,
      rate: 1,
      gain: dB(-11),
    }),
  ),
  ...[0, 1, 2, 3].map(
    (i): Cue => ({
      id: `named-off-${i}`,
      name: k(i % 2 ? "switch_004" : "switch_003"),
      frame: OFF + 12 * i + 2,
      rate: 0.95,
      gain: dB(-8),
    }),
  ),
  ...spread(
    "more-off",
    OFF + 50,
    OFF + 62,
    5,
    ["switch_003", "switch_004"],
    -14,
    [1.0, 1.2],
  ),
  ...spread("dive", DIVE + 6, DIVE + 40, 8, LIGHT, -17, [1.1, 1.4]),
  ...spread("approach", ARRIVE + 4, ARRIVE + 30, 6, LIGHT, -18, [1.3, 1.6]),
  {
    id: "land",
    name: k("drop_002"),
    frame: ARRIVE + 34,
    rate: 1,
    gain: dB(-10),
  },
  ...LANDS.filter((_, i) => i % 2 === 0).map(
    (frame, i): Cue => ({
      id: `slot-${i}`,
      name: k(pick(CLICKS)),
      frame: Math.round(frame),
      rate: 1 + i * 0.02,
      gain: dB(-15 - rng() * 3),
    }),
  ),
  { id: "oom", name: k("error_004"), frame: OOM, rate: 0.9, gain: dB(-6) },
  {
    id: "stop",
    name: k("impactSoft_heavy_000"),
    frame: OOM + 2,
    rate: 1.1,
    gain: dB(-9),
  },
  ...spread(
    "climb",
    CLEAN,
    HOLD - 2,
    7,
    ["tick_001", "tick_002"],
    -15,
    [0.9, 1.1],
  ),
  {
    id: "halt",
    name: k("impactWood_medium_001"),
    frame: HOLD,
    rate: 0.9,
    gain: dB(-9),
  },
  {
    id: "read-1",
    name: k("tick_001"),
    frame: HOLD + 5,
    rate: 0.7,
    gain: dB(-11),
  },
  {
    id: "read-2",
    name: k("tick_001"),
    frame: HOLD + 10,
    rate: 0.7,
    gain: dB(-11),
  },
  {
    id: "takeover",
    name: k("impactBell_heavy_000"),
    frame: TAKEOVER,
    rate: 0.6,
    gain: dB(-6),
  },
  {
    id: "takeover-hit",
    name: k("impactSoft_heavy_000"),
    frame: TAKEOVER,
    rate: 0.8,
    gain: dB(-8),
  },
  ...spread("pull", PULL + 4, PULL + 30, 6, LIGHT, -18, [1.1, 1.4]),
  ...[0, 1, 2].map(
    (i): Cue => ({
      id: `step-${i}`,
      name: k("tick_001"),
      frame: STEPS + 4 + i * 14,
      rate: 1,
      gain: dB(-11),
    }),
  ),
  ...spread("patch", PATCH, PATCH + 40, 14, ["glass_003"], -14, [0.9, 1.3]),
  {
    id: "patched",
    name: k("confirmation_001"),
    frame: PATCH + 42,
    rate: 1,
    gain: dB(-8),
  },
  {
    id: "verdict",
    name: k("impactSoft_heavy_000"),
    frame: VERDICT_FROM,
    rate: 0.9,
    gain: dB(-6),
  },
  {
    id: "verdict-ring",
    name: k("impactBell_heavy_000"),
    frame: VERDICT_FROM + 4,
    rate: 0.45,
    gain: dB(-9),
  },
];
