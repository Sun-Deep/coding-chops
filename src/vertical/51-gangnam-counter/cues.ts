import * as B from "./beats";
import { views } from "./count";

/**
 * The sound of the counter, from the recorded CC0 set in
 * `public/sfx/kenney/`: a tick as each view lands while the count slows
 * to the ceiling, a switch when it gets there, a rattle of clicks as the
 * carry flips 32 bits, a heavy clunk as the sign sets and the dancer
 * stops, knocks as the second row of bits arrives, a run of ticks for the
 * race and a bell when it lands on 6 billion.
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
const cue = (
  id: string,
  name: string,
  frame: number,
  level: number,
  rate = 1,
): Cue => ({
  id,
  name: `kenney/${name}`,
  frame: Math.round(frame),
  rate,
  gain: dB(level),
});

/** The frames a new view lands on in the count, at least 3 frames apart. */
const landings: number[] = [];
for (let f = 1; f <= B.COUNT_TO; f++)
  if (
    views(f) !== views(f - 1) &&
    (landings.length === 0 || f - landings[landings.length - 1] >= 3)
  )
    landings.push(f);

export const CUES: readonly Cue[] = [
  ...landings.map((f, i) =>
    cue(`view-${i}`, i % 2 ? "tick_002" : "tick_001", f, -16, 1.05),
  ),
  cue("ceiling", "switch_003", B.COUNT_TO, -11),
  ...Array.from({ length: 32 }, (_, i) =>
    cue(
      `carry-${i}`,
      i % 2 ? "click_004" : "click_003",
      B.PLUS_ONE + i * B.RIPPLE_STEP + 3,
      -17,
      0.9 + i * 0.012,
    ),
  ),
  cue("sign", "impactWood_medium_001", B.SIGN_AT + 5, -6, 0.75),
  cue("sign-low", "impactSoft_heavy_000", B.SIGN_AT + 5, -10, 0.8),
  ...Array.from({ length: 8 }, (_, j) =>
    cue(
      `slide-${j}`,
      `impactWood_light_00${j % 5}`,
      B.LONG_FROM + 12 + j * 4,
      -18,
      1.1,
    ),
  ),
  ...Array.from({ length: 12 }, (_, j) =>
    cue(
      `spin-${j}`,
      j % 2 ? "tick_002" : "tick_001",
      B.RACE_FROM + 4 + j * 3.4,
      -18,
      1.2 - j * 0.02,
    ),
  ),
  cue("bit-32", "impactBell_heavy_000", B.RACE_TO - 2, -9),
];
