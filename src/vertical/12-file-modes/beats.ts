import { OPENING_MODE, TOP_MODES } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Where the lock is dialled, and when.
 *
 * The first entry sits before frame zero on purpose: a lock already settled on
 * the first frame is a still image at the exact moment a scroll is decided, so
 * the drums are still coming to rest when the first frame is drawn.
 *
 * `777` and `700` are not in the measurement's top four and are there anyway.
 * They are the two ends of the thing: everything open, then everything shut but
 * you. Watching the switches throw and the digits follow is the proof that the
 * number is the switches, which is the whole cut, and it cannot be made by
 * jumping between four modes that all look similar.
 */
export const DIALS: readonly { readonly at: number; readonly mode: string }[] =
  [
    { at: -8, mode: OPENING_MODE },
    { at: 132, mode: "777" },
    { at: 168, mode: "700" },
    { at: 204, mode: TOP_MODES[0].mode },
    { at: 240, mode: TOP_MODES[1].mode },
    { at: 276, mode: TOP_MODES[2].mode },
    { at: 312, mode: TOP_MODES[3].mode },
  ];

/**
 * Frames a drum takes to come to rest.
 *
 * Long, because a short roll leaves the lock static between changes and the
 * first cut of this held two and a fifth seconds at a time under the
 * frozen-frame threshold. Twenty frames of spin against sixteen of rest is a
 * lock being worked rather than a diagram being relabelled.
 */
export const ROLL = 20;

/** The modes that go in the list, which is not all the modes the lock visits. */
const LISTED = new Set(TOP_MODES.map((m) => m.mode));

export const dialAt = (frame: number) => {
  let index = 0;
  for (let i = 0; i < DIALS.length; i++) if (frame >= DIALS[i].at) index = i;
  const current = DIALS[index];
  const previous = index === 0 ? { mode: "000" } : DIALS[index - 1];
  return {
    mode: current.mode,
    from: previous.mode,
    rolled: Math.min(1, Math.max(0, (frame - current.at) / ROLL)),
    index,
  };
};

/** Switches, then what they are worth, then the sum. */
export const TUMBLERS_FROM = 16;
export const WEIGHTS_FROM = 64;
export const SUMS_FROM = 112;
export const STAGGER = 5;

/**
 * Where the drum is in its spin, as a fraction of the faces it has to travel.
 *
 * The sound reads this so a click lands on each digit passing rather than on a
 * schedule of its own, which is the rule `beats.ts` exists for.
 */
export const ROLL_EASE = (t: number) => 1 - (1 - t) ** 3;

/** The frame the nth face of a roll goes by, for a roll starting at `at`. */
export const faceAt = (at: number, index: number, travel: number) => {
  const eased = index / travel;
  const t = 1 - (1 - eased) ** (1 / 3);
  return at + t * ROLL;
};

export const cascade = (from: number, n: number) => from + n * STAGGER;

export const cascadedAt = (frame: number, from: number, n: number) =>
  Math.min(1, Math.max(0, (frame - cascade(from, n)) / 10));

/** A mode lands in the list the frame its drums stop, if it is one of the four. */
export const listedBy = (frame: number) => {
  const seen = new Set<string>();
  for (const dial of DIALS) {
    if (dial.at > 0 && frame >= dial.at + ROLL && LISTED.has(dial.mode)) {
      seen.add(dial.mode);
    }
  }
  return seen.size;
};

/** The list is read back one row at a time, so the last seconds are not a hold. */
export const READBACK_FROM = 344;
export const READBACK_STEP = 10;

/** Frame the count under the list arrives. */
export const TOTAL_FROM = 378;
