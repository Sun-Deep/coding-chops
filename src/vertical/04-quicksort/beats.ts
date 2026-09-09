import { seconds } from "../../shared/video/timing";
import { QUICK, SELECTION } from "./measurements";

/**
 * The shot map, in frames. Twenty-seven seconds, six shots, no title card.
 *
 * The race is the spine and it is nearly half the cut, which is deliberate. The
 * whole claim is a ratio, and the only way to show a ratio without asserting it
 * is to let both fields run at the same rate until one of them has finished
 * twelve times. Cutting away early would mean putting the number on a card
 * instead, which is the thing the first three vertical cuts did.
 *
 * `RATE` is the one number the race depends on. Both fields compare at it, so
 * nothing on screen is time warped and the gap is not a claim, it is a
 * measurement of how long each algorithm takes at a fixed budget per frame.
 */

/** Comparisons per frame, applied to both fields alike. */
export const RATE = 62;

/** Frames of comparison the clock has already done at frame zero. */
export const PREROLL = 6;

/**
 * The one place the comparison clock stops.
 *
 * Quicksort's first run lands two thirds of a second in, and if it scattered
 * immediately nobody would have read what happened. So the first finished ramp
 * holds. Every run after it is continuous, which is why the tally still reaches
 * twelve inside one selection sort: the hold costs quicksort about eight
 * hundred comparisons of head start and it has them to spare.
 */
export const HOLD = 18;
export const SCATTER = 4;

export const comparisonsAt = (frame: number) => (frame + PREROLL) * RATE;

/** Quicksort's own clock, which loses `HOLD` frames once and never again. */
export const quickComparisonsAt = (frame: number) =>
  frame <= QUICK_FIRST_DONE
    ? comparisonsAt(frame)
    : comparisonsAt(frame) - HOLD * RATE;

export const QUICK_FIRST_DONE = Math.ceil(QUICK.comparisons / RATE) - PREROLL;
export const RESHUFFLE_AT = QUICK_FIRST_DONE + HOLD;

/** Frame selection sort finally completes its single pass. */
export const SELECTION_DONE = Math.ceil(SELECTION.comparisons / RATE) - PREROLL;

export const SHOTS = {
  /** Both fields, same rate, until one has lapped the other twelve times. */
  race: { from: 0, to: 330 },
  /** One quicksort, slowly, so the cut teaches the mechanism it is selling. */
  cleave: { from: 330, to: 445 },
  /** Selection sort on an array that is already sorted. Still 19,900. */
  sorted: { from: 445, to: 555 },
  /** The catch. The cheap one on comparisons is the expensive one on writes. */
  writes: { from: 555, to: 665 },
  verdict: { from: 665, to: 745 },
  endCard: { from: 745, to: 805 },
} as const;

export const DURATION = SHOTS.endCard.to;

export const length = (shot: { from: number; to: number }) =>
  shot.to - shot.from;

/** Sanity: the cut is inside the twenty to thirty second band the format asks for. */
export const RUNTIME_SECONDS = DURATION / seconds(1);
