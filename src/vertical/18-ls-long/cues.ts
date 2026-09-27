import {
  CLIMB_TO,
  COUNT_FROM,
  COUNT_TO,
  DIGIT_EVERY,
  DIGITS_FROM,
  HAND_EVERY,
  HAND_FROM,
  landedAt,
  NUMBERS_FROM,
  POINT_EVERY,
  POINT_FROM,
  SWAP,
  SWAP_FROM,
  TRIPLETS_FROM,
  TYPE_EVERY,
  TYPE_FROM,
} from "./beats";
import { column, FILE, FOLDER, KEYS } from "./columns";
import { INSIDE_COMMAND, USR_FOLDERS, USR_FOLDERS_4096 } from "./measurements";

/**
 * Every cue is a thing arriving, read off `beats.ts` so a retime moves the
 * picture and the sound together.
 *
 * chmod's voice for the key: a `tick` as each column lands, climbing across
 * the line, and a harder one for each chmod digit. The count is VR10's plucked
 * `probe` on the pentatonic scale, one note per eleven folders, with the two
 * that do not say 4096 dropped an octave and a fourth, the register the
 * format uses for the exception. The climb of the inside size ticks once per
 * tenth, rising into the payoff.
 */

export type Cue = {
  readonly id: string;
  readonly name: "tick" | "probe" | "code-step" | "settle" | "appear" | "name";
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return 0.65 * 2 ** (DEGREES[i] / 12);
};

const landings: Cue[] = KEYS.map((key, i) => ({
  id: `land-${key}`,
  name: "tick",
  frame: Math.max(0, landedAt(i)),
  rate: 0.95 + i * 0.1,
  gain: 3.0,
}));

const digits: Cue[] = [0, 1, 2].map((k) => ({
  id: `digit-${k}`,
  name: "tick",
  frame: DIGITS_FROM + k * DIGIT_EVERY,
  rate: 1.5 + k * 0.22,
  gain: 4.2,
}));

/** The triplets leaving the mode, then landing in the band. */
const lifting: Cue = {
  id: "lift",
  name: "tick",
  frame: TRIPLETS_FROM + 2,
  rate: 1.3,
  gain: 2.6,
};

const dropping: Cue[] = [0, 1, 2].map((k) => ({
  id: `drop-${k}`,
  name: "tick",
  frame: TRIPLETS_FROM + 12 + k * 2,
  rate: 0.8 + k * 0.1,
  gain: 3.2,
}));

/** Each digit handed to its owner. */
const handing: Cue[] = [0, 1, 2].map((k) => ({
  id: `hand-${k}`,
  name: "probe",
  frame: HAND_FROM + k * HAND_EVERY,
  rate: 0.65 * 2 ** ([12, 16, 19][k] / 12),
  gain: 9,
}));

const pointing: Cue[] = [1, 2, 3, 4, 5, 6].map((row, k) => ({
  id: `point-${row}`,
  name: "tick",
  frame: POINT_FROM + k * POINT_EVERY,
  rate: 1.1 + k * 0.08,
  gain: 2.2,
}));

/** One click per column that changes when the file becomes the folder. */
const swapping: Cue[] = KEYS.filter(
  (k) => column(FILE, k) !== column(FOLDER, k),
).map((key, k) => ({
  id: `swap-${key}`,
  name: "tick",
  frame: SWAP_FROM + 4 + k * 3,
  rate: 1.0 + k * 0.12,
  gain: 3.0,
}));

const counting: Cue[] = (() => {
  const out: Cue[] = [];
  const span = COUNT_TO - COUNT_FROM;
  for (let n = 0; n < USR_FOLDERS; n += 11) {
    out.push({
      id: `count-${n}`,
      name: "probe",
      frame: COUNT_FROM + Math.floor((n / USR_FOLDERS) * span),
      rate: note(n / USR_FOLDERS_4096),
      gain: 8,
    });
  }
  out.push({
    id: "count-others",
    name: "probe",
    frame: COUNT_TO,
    rate: 0.65 * 2 ** (-17 / 12),
    gain: 12,
  });
  return out;
})();

const typing: Cue[] = Array.from({ length: INSIDE_COMMAND.length }, (_, k) => ({
  id: `key-${k}`,
  name: "code-step" as const,
  frame: TYPE_FROM + Math.floor(k * TYPE_EVERY),
  rate: 1.24,
  gain: 5.2,
})).filter((c, i, all) => i === 0 || c.frame !== all[i - 1].frame);

const climbing: Cue[] = Array.from({ length: 10 }, (_, k) => ({
  id: `climb-${k}`,
  name: "tick",
  frame: NUMBERS_FROM + Math.round(((k + 1) / 10) * (CLIMB_TO - NUMBERS_FROM)),
  rate: 1.0 + k * 0.09,
  gain: 2.0 + k * 0.22,
}));

export const CUES: readonly Cue[] = [
  ...landings,
  lifting,
  ...dropping,
  ...digits,
  ...handing,
  ...pointing,
  {
    id: "swap-settle",
    name: "settle",
    frame: SWAP_FROM + SWAP - 4,
    rate: 0.92,
    gain: 3.2,
  },
  ...swapping,
  ...counting,
  ...typing,
  ...climbing,
];
