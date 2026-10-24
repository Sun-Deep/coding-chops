import { PROOF_FROM, STAGES, VERDICT_FROM, badgeAt } from "./beats";

/**
 * The sound of what is on screen, from the recorded CC0 set in
 * `public/sfx/kenney/`:
 *
 * - a tick as each step's number lands beside its line;
 * - FROM: cardboard thuds as 1,000 parcels pour onto the table;
 * - WHERE: hollow knocks as the unpaid ones drop into the returns bin;
 * - GROUP BY: wooden taps as parcels land in their cubbies;
 * - HAVING: a low thud and shutters clacking down on the small piles;
 * - SELECT: a confirmation, then coins clinking as each open cubby's
 *   parcels become a stack;
 * - ORDER BY: each stack set down on the table, tallest first;
 * - LIMIT: the rest swept off the back of the table, then the bell for
 *   the five that are left;
 * - the proof: an error for the alias in WHERE, a confirmation for ORDER BY,
 *   and the bell slowed down ringing out under the verdict.
 *
 * The frames follow the motion in `scripts/blender/sql/mailroom.py`.
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

/** `count` cues spread evenly from frame `a` to frame `b`. */
const evenly = (
  id: string,
  a: number,
  b: number,
  count: number,
  names: readonly string[],
  level: number,
  rate: [number, number],
): Cue[] =>
  Array.from({ length: count }, (_, h) => ({
    id: `${id}-${h}`,
    name: k(pick(names)),
    frame: Math.round(a + ((b - a) * h) / Math.max(1, count - 1)),
    rate: rate[0] + rng() * (rate[1] - rate[0]),
    gain: dB(level - rng() * 4),
  }));

const ticks: Cue[] = STAGES.map((_, i) => ({
  id: `badge-${i}`,
  name: k(i % 2 ? "tick_002" : "tick_001"),
  frame: badgeAt(i),
  rate: 1,
  gain: dB(-10),
}));

/** Parcels land on the table over frames 2 to 48, the bottom of the heap first. */
const pour = evenly("pour", 3, 48, 20, [...WOOD, ...LIGHT], -15, [0.8, 1.1]);
/** Unpaid parcels slide off the end and drop into the bin. */
const bin = evenly(
  "bin",
  at("WHERE") + 18,
  at("WHERE") + 46,
  10,
  LIGHT,
  -15,
  [0.7, 0.85],
);
/** Paid parcels land in their cubbies, left columns first. */
const cubby = evenly(
  "cubby",
  at("GROUP BY") + 18,
  at("GROUP BY") + 52,
  22,
  WOOD,
  -15,
  [1.1, 1.4],
);
/** Shutters come down, a wave from the top left. */
const shut = evenly(
  "shut",
  at("HAVING") + 11,
  at("HAVING") + 36,
  12,
  LIGHT,
  -16,
  [0.65, 0.8],
);
/** Coins stacking up in the 29 open cubbies. */
const coins = evenly(
  "coins",
  at("SELECT") + 8,
  at("SELECT") + 32,
  14,
  ["glass_003", ...CLICKS],
  -17,
  [1.3, 1.7],
);
/** Stacks set down on the table, tallest first. */
const set = evenly(
  "set",
  at("ORDER BY") + 16,
  at("ORDER BY") + 42,
  15,
  LIGHT,
  -15,
  [1.2, 1.4],
);
/** All but five swept off the back of the table and dropping. */
const drop = evenly(
  "drop",
  at("LIMIT") + 10,
  at("LIMIT") + 24,
  8,
  WOOD,
  -14,
  [0.9, 1.2],
);

export const CUES: readonly Cue[] = [
  ...ticks,
  ...pour,
  ...bin,
  ...cubby,
  ...shut,
  ...coins,
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
  ...set,
  ...drop,
  {
    id: "kept",
    name: k("impactBell_heavy_000"),
    frame: at("LIMIT") + 24,
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
