import * as B from "./beats";
import { READS, SKIPPED, landAt, readAt } from "./wall";

/**
 * The stockroom, from the recorded CC0 set in `public/sfx/kenney/`, one
 * sound per thing that happens: each crate's lid flipping open and the
 * thud as it lands on the belt, the first ones each heard, the rest thinned
 * to one every few frames as they speed up; the page's crate, its lid, the
 * page flying to him and caught; the wall winding back; the two looks in
 * the index; the page again; the verdict.
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

/** Frames from `xs`, sorted, at least `gap` apart. */
const thin = (xs: number[], gap: number) => {
  const out: number[] = [];
  for (const x of [...xs].map(Math.round).sort((a, b) => a - b))
    if (out.length === 0 || x - out[out.length - 1] >= gap) out.push(x);
  return out;
};

const slides = thin(
  Array.from({ length: SKIPPED }, (_, i) => readAt(i)),
  3,
);
const lids = thin(
  READS.map((r) => r - 2),
  3,
);
const lands = thin(
  Array.from({ length: SKIPPED }, (_, i) => landAt(i)),
  2,
);

export const CUES: readonly Cue[] = [
  ...slides.map((f, i) =>
    cue(`out-${i}`, "click_002", f, i < 3 ? -13 : -19, 1.05),
  ),
  ...lids.map((f, i) =>
    cue(`lid-${i}`, i % 2 ? "click_004" : "click_005", f, i < 3 ? -11 : -17),
  ),
  ...lands.map((f, i) =>
    cue(
      `belt-${i}`,
      i < 3 ? "impactWood_medium_001" : `impactWood_light_00${i % 5}`,
      f,
      i < 3 ? -7 : -13,
      0.9 + (i % 3) * 0.08,
    ),
  ),
  cue("page-out", "click_002", B.PAGE_OUT, -11),
  cue("page-lid", "click_005", B.PAGE_OPEN - 2, -10),
  cue("page-fly", "impactGeneric_light_001", B.FLY, -14, 0.8),
  cue("page-catch", "impactWood_medium_001", B.CAUGHT, -6, 1.1),
  cue("rewind", "switch_004", B.TAKE_2, -12),
  cue("rush", "impactGeneric_light_002", B.TAKE_2 + 4, -12, 0.6),
  cue("look-1", "tick_001", B.HOP_1, -9, 1.1),
  cue("look-2", "tick_002", B.HOP_2, -8, 1.3),
  cue("page-out-2", "click_002", B.PAGE_OUT_2, -11),
  cue("page-lid-2", "click_005", B.PAGE_OPEN_2 - 2, -10),
  cue("page-fly-2", "impactGeneric_light_001", B.FLY_2, -14, 0.8),
  cue("land", "impactWood_medium_001", B.CAUGHT_2, -2, 0.85),
  cue("done", "confirmation_001", B.CAUGHT_2 + 4, -10),
  cue("verdict", "impactSoft_heavy_000", B.VERDICT, -8),
];
