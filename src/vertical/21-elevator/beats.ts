import { DAYS } from "./simulation";
import { RIDERS, YOU } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * One clock for both buildings, so the race is fair: a simulated second is the
 * same number of frames on the left and the right.
 *
 * It opens ten seconds in, with the first caller already waiting and the car on
 * its way to them, so frame zero has something moving. It runs slower for the
 * first second and a third, while the other six calls arrive, then settles at
 * 0.45 simulated seconds a frame: a floor is four and a half frames and an
 * eight second stop is eighteen, long enough to see somebody step in.
 */
const SIM_FROM = 10;
const SLOW_UNTIL = 40;
const SLOW = 0.3;
const FAST = 0.45;
const SIM_AT_SLOW_END = SIM_FROM + SLOW_UNTIL * SLOW;

export const simAt = (frame: number) =>
  frame <= SLOW_UNTIL
    ? SIM_FROM + frame * SLOW
    : SIM_AT_SLOW_END + (frame - SLOW_UNTIL) * FAST;

export const frameAt = (sim: number) =>
  sim <= SIM_AT_SLOW_END
    ? (sim - SIM_FROM) / SLOW
    : SLOW_UNTIL + (sim - SIM_AT_SLOW_END) / FAST;

const f = (sim: number) => Math.round(frameAt(sim));

/** You press the button. */
export const YOU_PRESS = f(RIDERS[YOU].at);

/** Each car's doors reach the middle of the stop where you get in, and out. */
export const YOU_IN = {
  order: f(DAYS.order.picked[YOU]),
  sweep: f(DAYS.sweep.picked[YOU]),
};
export const YOU_OUT = {
  order: f(DAYS.order.out[YOU]),
  sweep: f(DAYS.sweep.out[YOU]),
};

/** Frames a rider takes to step between the landing and the car. */
export const STEP = 6;

/** The verdict: both clocks stopped, the line that says what it cost. */
export const VERDICT_FROM = YOU_OUT.order + 6;

if (YOU_OUT.order >= DURATION - 120) {
  throw new Error(
    "beats.ts: you get out on the left too late to read the verdict",
  );
}
