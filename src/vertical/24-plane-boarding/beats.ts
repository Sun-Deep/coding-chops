import { SECONDS } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * One clock for all three planes. It opens 12 seconds in, so the first
 * passengers are already walking down each aisle at frame zero, runs at 0.6
 * simulated seconds a frame for two seconds while the eye finds the three
 * cabins, then speeds up so the slowest plane finishes at frame 390.
 */
const SIM_FROM = 12;
const SLOW_UNTIL = 60;
const SLOW = 0.6;
const SIM_AT_SLOW_END = SIM_FROM + SLOW_UNTIL * SLOW;
export const LAST_DONE = 390;
const FAST = (SECONDS.backToFront - SIM_AT_SLOW_END) / (LAST_DONE - SLOW_UNTIL);

export const simAt = (frame: number) =>
  frame <= SLOW_UNTIL
    ? SIM_FROM + frame * SLOW
    : SIM_AT_SLOW_END + (frame - SLOW_UNTIL) * FAST;

export const frameAt = (sim: number) =>
  sim <= SIM_AT_SLOW_END
    ? (sim - SIM_FROM) / SLOW
    : SLOW_UNTIL + (sim - SIM_AT_SLOW_END) / FAST;

export const DONE_AT = {
  backToFront: Math.round(frameAt(SECONDS.backToFront)),
  random: Math.round(frameAt(SECONDS.random)),
  windowFirst: Math.round(frameAt(SECONDS.windowFirst)),
};

/** The payoff, once random has finished and back to front has not. */
export const VERDICT_FROM = DONE_AT.random + 4;
