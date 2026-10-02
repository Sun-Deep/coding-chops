import { SHOPPERS, YOU } from "./measurements";
import { VISITS, passers } from "./simulation";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * One clock for both shops, at 0.9 simulated seconds a frame throughout: a
 * 30 second checkout is a second of screen, long enough to watch somebody step
 * up to a till and leave. It opens 98 seconds before you join, while the two
 * rules are read out, so both shops are already busy at frame zero. The
 * opening and the race run at one rate; the split is kept so the opening can
 * be retimed without touching the race.
 */
const SIM_FROM = 441;
const SLOW = 0.9;
const FAST = 0.9;
const JOIN = SHOPPERS[YOU].at;
const SLOW_UNTIL = (JOIN - SIM_FROM) / SLOW;

export const simAt = (frame: number) =>
  frame <= SLOW_UNTIL
    ? SIM_FROM + frame * SLOW
    : JOIN + (frame - SLOW_UNTIL) * FAST;

export const frameAt = (sim: number) =>
  sim <= JOIN ? (sim - SIM_FROM) / SLOW : SLOW_UNTIL + (sim - JOIN) / FAST;

const f = (sim: number) => Math.round(frameAt(sim));

export const YOU_JOIN = f(JOIN);
export const YOU_SERVED = {
  shortest: f(VISITS.shortest[YOU].start),
  shared: f(VISITS.shared[YOU].start),
};

/** The frame each person who joined after you reaches a till ahead of you. */
export const PASS_FRAMES = passers("shortest").map((c) =>
  f(VISITS.shortest[c.id].start),
);

export const VERDICT_FROM = YOU_SERVED.shortest + 8;

if (VERDICT_FROM > DURATION - 100) {
  throw new Error("beats.ts: too little time left to read the verdict");
}
