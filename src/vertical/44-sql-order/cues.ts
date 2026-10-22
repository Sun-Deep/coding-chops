import { PROOF_FROM, STAGES, VERDICT_FROM, badgeAt } from "./beats";
import { ORDERS, orders, steps } from "./data";

/**
 * The sound of what is on screen, from the recorded CC0 set in
 * `public/sfx/kenney/`:
 *
 * - a tick as each step's number lands beside its line;
 * - FROM: a soft run of clicks as the scan reads the table;
 * - WHERE: soft knocks as the scan sinks the unpaid rows;
 * - GROUP BY: rows landing on their stacks, a wooden tap each few;
 * - HAVING: a low thud as the small stacks go dark;
 * - SELECT: a confirmation as the result rows stand up;
 * - ORDER BY: a quick run of clicks as the bars slide into line;
 * - LIMIT: the rest falling, then the bell for the five that are left;
 * - the proof: an error for the alias in WHERE, a confirmation for ORDER BY,
 *   and the bell slowed down ringing out under the verdict.
 *
 * The landing frames follow the motion in `scripts/blender/sql/rows.py`.
 * Every file peaks near -1 dBFS, so a gain is the level it should sit at.
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
const rng = random(44);
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rng() * xs.length)];
const k = (name: string) => `kenney/${name}`;
const WOOD = [0, 1, 2, 3, 4].map((i) => `impactWood_light_00${i}`);
const LIGHT = [0, 1, 2].map((i) => `impactGeneric_light_00${i}`);
const CLICKS = ["tick_001", "tick_002", "click_004", "click_002"];
const at = (clause: string) => STAGES.find((s) => s.clause === clause)!.at;

const rows = orders();
const s = steps(rows);
const unpaid = rows.flatMap((o, i) => (o.status === "paid" ? [] : [i]));
const bars = s.ordered.length;

/** `count` frames spread evenly through a sorted list of frames. */
const spread = (frames: number[], count: number) =>
  Array.from(
    { length: count },
    (_, h) => frames[Math.floor((h / count) * frames.length)],
  );

/** The band sweeping the table, frames 10 to 58 in rows.py. */
const read: Cue[] = Array.from({ length: 16 }, (_, h) => ({
  id: `read-${h}`,
  name: k(h % 3 === 0 ? "tick_001" : h % 3 === 1 ? "click_004" : "tick_002"),
  frame: Math.round(10 + (h * 48) / 15),
  rate: 1.1 + rng() * 0.3,
  gain: dB(-17 - rng() * 3),
}));

/** Rows leaving the table for their stacks. */
const lift: Cue[] = Array.from({ length: 6 }, (_, h) => ({
  id: `lift-${h}`,
  name: k(pick(LIGHT)),
  frame: at("GROUP BY") + h * 4,
  rate: 1.3 + rng() * 0.3,
  gain: dB(-20 - rng() * 4),
}));

/** Small stacks going dark, one knock each few, through HAVING's wave. */
const dark: Cue[] = Array.from({ length: 7 }, (_, h) => ({
  id: `dark-${h}`,
  name: k(pick(LIGHT)),
  frame: at("HAVING") + 2 + h * 2,
  rate: 0.7 + rng() * 0.1,
  gain: dB(-17 - rng() * 4),
}));

/** The result rows standing up, then setting off for the line. */
const stand: Cue[] = Array.from({ length: 10 }, (_, h) => ({
  id: `stand-${h}`,
  name: k(pick(WOOD)),
  frame: at("SELECT") + 6 + h * 2,
  rate: 1.25 + rng() * 0.25,
  gain: dB(-16 - rng() * 4),
}));
const leave: Cue[] = Array.from({ length: 8 }, (_, h) => ({
  id: `leave-${h}`,
  name: k(pick(CLICKS)),
  frame: at("ORDER BY") + h * 2,
  rate: 0.8 + rng() * 0.2,
  gain: dB(-18 - rng() * 4),
}));

const ticks: Cue[] = STAGES.map((_, i) => ({
  id: `badge-${i}`,
  name: k(i % 2 ? "tick_002" : "tick_001"),
  frame: badgeAt(i),
  rate: 1,
  gain: dB(-10),
}));

const sink: Cue[] = spread(
  unpaid.map((i) => Math.round(at("WHERE") + (18 * i) / ORDERS + 10)),
  9,
).map((frame, h) => ({
  id: `sink-${h}`,
  name: k(pick(LIGHT)),
  frame,
  rate: 0.8 + rng() * 0.15,
  gain: dB(-19 - rng() * 5),
}));

const stack: Cue[] = spread(
  Array.from({ length: s.where }, (_, q) =>
    Math.round(at("GROUP BY") + (30 * q) / s.where + 18),
  ),
  24,
).map((frame, h) => ({
  id: `stack-${h}`,
  name: k(pick(WOOD)),
  frame,
  rate: 1.1 + rng() * 0.3,
  gain: dB(-15 - rng() * 6),
}));

const slide: Cue[] = Array.from({ length: bars }, (_, r) =>
  Math.round(at("ORDER BY") + r * 0.7 + 20),
)
  .filter((_, r) => r % 2 === 0)
  .map((frame, h) => ({
    id: `slide-${h}`,
    name: k(pick(CLICKS)),
    frame,
    rate: 0.9 + rng() * 0.3,
    gain: dB(-15 - rng() * 4),
  }));

const fall: Cue[] = spread(
  Array.from({ length: bars - 5 }, (_, r) =>
    Math.round(at("LIMIT") + r * 0.5 + 12),
  ),
  10,
).map((frame, h) => ({
  id: `fall-${h}`,
  name: k(pick(WOOD)),
  frame,
  rate: 0.95 + rng() * 0.3,
  gain: dB(-14 - rng() * 5),
}));

export const CUES: readonly Cue[] = [
  ...ticks,
  ...read,
  ...sink,
  ...lift,
  ...stack,
  ...dark,
  ...stand,
  ...leave,
  {
    id: "having",
    name: k("impactSoft_heavy_000"),
    frame: at("HAVING") + 6,
    rate: 1.1,
    gain: dB(-12),
  },
  {
    id: "select",
    name: k("confirmation_001"),
    frame: at("SELECT") + 4,
    rate: 1,
    gain: dB(-7),
  },
  ...slide,
  ...fall,
  {
    id: "kept",
    name: k("impactBell_heavy_000"),
    frame: at("LIMIT") + 12,
    rate: 1,
    gain: dB(-8),
  },
  {
    id: "error",
    name: k("error_004"),
    frame: PROOF_FROM,
    rate: 1,
    gain: dB(-7),
  },
  {
    id: "works",
    name: k("confirmation_001"),
    frame: PROOF_FROM + 16,
    rate: 1.1,
    gain: dB(-8),
  },
  {
    id: "verdict",
    name: k("impactSoft_heavy_000"),
    frame: VERDICT_FROM,
    rate: 0.9,
    gain: dB(-5),
  },
  {
    id: "verdict-ring",
    name: k("impactBell_heavy_000"),
    frame: VERDICT_FROM + 4,
    rate: 0.42,
    gain: dB(-8),
  },
];
