import { B, T } from "./clock";

/**
 * Effects under the creator's voice, from the recorded CC0 set in
 * `public/sfx/kenney/`. The voice carries the cut, so these sit low, around
 * -18 to -24 dBFS, one per thing arriving:
 *
 * - the six pillars rising, a stone knock each, day two's lower, as it
 *   lands at 1 under the price paid; the line drawn at 7, a click;
 * - each price lighting as the six days are named, a tick;
 * - the backwards trade crossed out, a low buzz;
 * - each of the fifteen pairs, a tick, and a low hit at five billion;
 * - the long row rising, a run of soft knocks;
 * - the winning arc on the sell day, a chime;
 * - the line dropping to 1, a knock; each profit bar, a click; the answer,
 *   the bell;
 * - each complexity readout, a soft hit.
 */

export type Cue = {
  readonly id: string;
  readonly name: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const dB = (target: number) =>
  Math.round(10 ** ((target + 1) / 20) * 1000) / 1000;
const k = (name: string) => `kenney/${name}`;
const cue = (
  id: string,
  name: string,
  frame: number,
  level: number,
  rate = 1,
): Cue => ({
  id,
  name: k(name),
  frame: Math.round(frame),
  rate,
  gain: dB(level),
});
const S = T.stems.map((s) => s.at);
const O = B.open;
/** When each pillar lands, as `scripts/blender/stock/pillars.py` raises them. */
const landed = (i: number) =>
  (i === 0 ? -4 : i === 1 ? O.sell + 6 : O.but + 10 + (i - 2) * 16) + 12;

export const CUES: readonly Cue[] = [
  ...[0, 2, 3, 4, 5].map((i) =>
    cue(
      `rise-${i}`,
      `impactWood_light_00${i % 5}`,
      Math.max(0, landed(i)),
      -20,
      0.8,
    ),
  ),
  cue("paid", "click_003", O.buy + 4, -20),
  cue("fell", "impactWood_medium_001", landed(1), -17, 0.7),
  ...[0, 1, 2, 3, 4, 5].map((i) =>
    cue(
      `lit-${i}`,
      i % 2 ? "tick_002" : "tick_001",
      B.sixDays + i * 6,
      -22,
      1.1,
    ),
  ),
  cue("cross", "error_004", B.cannotSell + 2, -20, 0.8),
  ...Array.from({ length: 15 }, (_, j) =>
    cue(
      `pair-${j}`,
      j % 2 ? "tick_002" : "click_004",
      B.compare + ((B.fifteen - B.compare) * j) / 15,
      -22,
      1 + j * 0.02,
    ),
  ),
  ...Array.from({ length: 8 }, (_, j) =>
    cue(
      `row-${j}`,
      `impactWood_light_00${j % 5}`,
      B.hundredK + 2 + j * 4,
      -24,
      0.7,
    ),
  ),
  cue("billion", "impactSoft_heavy_000", B.fiveB, -16, 0.9),
  cue("winner", "confirmation_001", B.cheapestBefore + 6, -20),
  cue("drop", "impactWood_medium_001", B.day[1] + 6, -18, 0.9),
  ...[2, 3, 4, 5].map((i) =>
    cue(`bar-${i}`, "click_003", B.profit[i] + 2, -20, 1.1),
  ),
  cue("answer", "impactBell_heavy_000", B.answer + 4, -18),
  cue("o-squared", "impactSoft_heavy_000", B.nSquared, -18),
  cue("o-n", "impactSoft_heavy_000", B.n, -18, 1.1),
  cue("o-1", "impactSoft_heavy_000", B.one, -19, 1.2),
  ...Array.from({ length: 8 }, (_, j) =>
    cue(
      `row2-${j}`,
      `impactWood_light_00${j % 5}`,
      B.noMatter - 18 + j * 4,
      -24,
      0.7,
    ),
  ),
  cue("keep", "impactBell_heavy_000", S[5] + 4, -20, 0.5),
];
