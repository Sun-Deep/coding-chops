import { CHECKS, FOUND_AT, VERDICT_FROM } from "./beats";
import { RUN } from "./measurements";
import { CHANGE_AT, DIFF_AT, DIFF_LINES, LINES } from "./transcript";

/**
 * The sound of what is on screen, from recorded CC0 sounds in
 * `public/sfx/kenney/` (see the README there):
 *
 * - a key click for every character as a command types;
 * - a wooden tap as git picks a card up to test it;
 * - a confirmation when the test passes, an error when it fails;
 * - the ruled-out half clattering down, one knock per few cards, timed to
 *   when they land in the Blender wave;
 * - a soft tick as git starts each test and as each diff line prints;
 * - a bell when git names the commit, a drop as the changed line comes up,
 *   and a soft low hit on the verdict with the bell slowed down ringing
 *   out to the end.
 *
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

/** A small seeded generator, so the clatter is the same on every render. */
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
const rng = random(43);
const pick = <T>(xs: readonly T[]) => xs[Math.floor(rng() * xs.length)];

const KEYS = ["click_002", "click_003", "click_004", "click_005"];
const KNOCKS = [
  "impactWood_light_000",
  "impactWood_light_001",
  "impactWood_light_002",
  "impactWood_light_003",
  "impactWood_light_004",
  "impactGeneric_light_000",
  "impactGeneric_light_001",
  "impactGeneric_light_002",
];
const k = (name: string) => `kenney/${name}`;

/** A key per character while each typed command types. */
const typing: Cue[] = LINES.filter((l) => l.typing).flatMap((l) => {
  const chars = l.text.length - 2;
  const out: Cue[] = [];
  for (let i = 0; i < chars; i += 2) {
    out.push({
      id: `key-${l.at}-${i}`,
      name: k(pick(KEYS)),
      frame: l.at + Math.round((i / chars) * l.typing!),
      rate: 0.9 + rng() * 0.3,
      gain: dB(-19 - rng() * 4),
    });
  }
  return out;
});

/**
 * The half git rules out, landing. Blender knocks each card over in a wave
 * from the tested commit, starting `14 * distance / span` frames after the
 * cut and taking about 11 frames to land; the knocks follow the same
 * schedule, one for every few cards, more for a big half than a small one.
 */
const clatter: Cue[] = CHECKS.flatMap((c, i) => {
  const prev =
    i === 0
      ? { good: 1, bad: RUN.commits }
      : { good: CHECKS[i - 1].good, bad: CHECKS[i - 1].bad };
  const span = Math.max(1, prev.bad - prev.good);
  const out: number[] = [];
  for (let n = prev.good; n <= prev.bad; n++)
    if (n < c.good || n > c.bad) out.push((14 * Math.abs(n - c.n)) / span);
  out.sort((a, b) => a - b);
  const hits = Math.min(
    14,
    Math.max(2, Math.round(2.2 * Math.log2(out.length + 1))),
  );
  return Array.from({ length: hits }, (_, h) => {
    const delay = out[Math.floor((h / hits) * out.length)];
    return {
      id: `fall-${c.k}-${h}`,
      name: k(pick(KNOCKS)),
      frame: c.cutAt + Math.round(delay) + 11,
      rate: 1.05 + rng() * 0.35,
      gain: dB(-14 - rng() * 6),
    };
  });
});

const checks: Cue[] = CHECKS.flatMap((c): Cue[] => [
  {
    id: `lift-${c.k}`,
    name: k("impactWood_medium_001"),
    frame: c.pickAt,
    rate: 1.2,
    gain: dB(-15),
  },
  c.result === "good"
    ? {
        id: `ok-${c.k}`,
        name: k("confirmation_001"),
        frame: c.resultAt,
        rate: 1,
        gain: dB(-7),
      }
    : {
        id: `fail-${c.k}`,
        name: k("error_004"),
        frame: c.resultAt,
        rate: 1,
        gain: dB(-6),
      },
]);

/** A soft tick as git starts each test, and as each line of the diff prints. */
const ticks: Cue[] = [
  ...CHECKS.map((c) => c.from),
  ...DIFF_LINES.map((_, i) => DIFF_AT + i * 2),
].map((frame, i) => ({
  id: `tick-${i}`,
  name: k(i % 2 ? "tick_002" : "tick_001"),
  frame,
  rate: 1,
  gain: dB(-17),
}));

export const CUES: readonly Cue[] = [
  ...typing,
  ...ticks,
  ...checks,
  ...clatter,
  {
    id: "found",
    name: k("impactBell_heavy_000"),
    frame: FOUND_AT,
    rate: 1,
    gain: dB(-7),
  },
  {
    id: "change",
    name: k("drop_002"),
    frame: CHANGE_AT,
    rate: 1,
    gain: dB(-10),
  },
  {
    id: "verdict",
    name: k("impactSoft_heavy_000"),
    frame: VERDICT_FROM,
    rate: 0.9,
    gain: dB(-5),
  },
  // The same bell, slowed to well over an octave down, ringing out under
  // the verdict to the end.
  {
    id: "verdict-ring",
    name: k("impactBell_heavy_000"),
    frame: VERDICT_FROM,
    rate: 0.42,
    gain: dB(-7),
  },
];
