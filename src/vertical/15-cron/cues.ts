import { DURATION, SWEEP, headAt, stepAt } from "./beats";
import { HOURS, STEPS } from "./measurements";
import { PINNED, STEP_GRIDS } from "./fields";

/**
 * The schedule, made audible.
 *
 * Every sound here is the marker crossing an hour that fires. Nothing marks an
 * animated property, and nothing is laid down to fill time: the density of the
 * track is the density of the schedule, so the collapse is something a listener
 * hears before they have read a number.
 *
 * At `* * * * *` the marker sets off all 24 columns a sweep. By `0 9 * * 1` it
 * sets off one.
 *
 * Under the accents is a clock. The marker ticks on every hour it crosses
 * whether anything fires or not, quietly, because that is what a schedule sits
 * on: time passes regardless. It is also what stops the last four seconds being
 * silent, which is where the first version left a 2.8 second hole once the
 * schedule had thinned to a single cell.
 */

export type Pulse = {
  readonly id: string;
  readonly frame: number;
  readonly rate: number;
  readonly gain: number;
};

/** Major pentatonic across two octaves, the scale VR10 onwards settled on. */
const DEGREES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const BASE_RATE = 0.62;

const note = (t: number) => {
  const i = Math.max(
    0,
    Math.min(DEGREES.length - 1, Math.round(t * (DEGREES.length - 1))),
  );
  return BASE_RATE * 2 ** (DEGREES[i] / 12);
};

/**
 * One accent per hour the marker crosses that has anything in it.
 *
 * Walked frame by frame rather than derived, because which cells are live
 * depends on which step is current and the steps land mid-sweep. Pitched by the
 * hour of the day, so a sweep across the week is a run up the scale and the
 * nine o'clock column always sounds like nine o'clock.
 */
export const TICKS: readonly Pulse[] = (() => {
  const out: Pulse[] = [];
  let previous = -1;
  for (let frame = 0; frame < DURATION; frame++) {
    const hour = headAt(frame, HOURS);
    if (hour === previous) continue;
    previous = hour;
    out.push({ id: `tick-${frame}`, frame, rate: 1.46, gain: 1.4 });
  }
  return out;
})();

export const FIRES: readonly Pulse[] = (() => {
  const out: Pulse[] = [];
  let previous = -1;
  for (let frame = 0; frame < DURATION; frame++) {
    const hour = headAt(frame, HOURS);
    if (hour === previous) continue;
    previous = hour;

    const step = stepAt(frame);
    const column = STEP_GRIDS[step].map((row) => row[hour]);
    const live = column.filter((v) => v > 0).length;
    if (live === 0) continue;

    const density = column.reduce((a, b) => a + b, 0) / (7 * 60);
    out.push({
      id: `fire-${frame}`,
      frame,
      rate: note(hour / (HOURS - 1)),
      // A column where every day fires is heavier than one where a single day does.
      gain: 2.9 + Math.min(1, live / 7) * 3.1 + density * 2.2,
    });
  }
  return out;
})();

/** A field being pinned: the moment the expression changes. */
export const PINS: readonly Pulse[] = STEPS.flatMap((step, i) =>
  PINNED[i] < 0
    ? []
    : [
        {
          id: `pin-${i}`,
          frame: [16, 110, 200, 290][i],
          rate: 1.16 - i * 0.14,
          gain: 7.4,
        },
      ],
);

/** A row of the reference landing, and its unit arriving after it. */
export const ROWS: readonly Pulse[] = STEPS.map((_, i) => ({
  id: `row-${i}`,
  frame: [16, 110, 200, 290][i] + 16,
  rate: 0.94 + i * 0.14,
  gain: 4.3,
}));

export const UNIT_CUES: readonly Pulse[] = STEPS.map((_, i) => ({
  id: `unit-${i}`,
  frame: 332 + i * 15,
  rate: 1.0 + i * 0.18,
  gain: 3.6,
}));

/** The opening, so the first sweep does not start in silence. */
export const OPENING_AT = 3;

/** The last sweep is nearly empty, which is the point. */
export const CLOSER_AT = 396;

/** Sanity: the track has to thin out, not just change. */
const perStep = [0, 1, 2, 3].map(
  (i) =>
    FIRES.filter((f) => stepAt(f.frame) === i).length /
    Math.max(1, SWEEP / SWEEP),
);
if (!(perStep[0] > perStep[3])) {
  throw new Error("VR15: the cue track does not thin out as the schedule does");
}
