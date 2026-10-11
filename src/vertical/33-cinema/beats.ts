import { YOU } from "./runs";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * No clock: the rooms fill one group at a time. The four friends are on
 * screen from frame 0, standing at the back. The groups before them are
 * already walking in at frame 0 and sit by about frame 100; the free seats
 * light up, and the four go to their seats. Then the rest arrive until the
 * house is full, and the top room splits more groups up.
 */
export const BEFORE_FIRST = -75;
export const BEFORE_GAP = 7;
export const AFTER_FIRST = 150;
export const AFTER_GAP = 22;
export const enterFrame = (id: number) =>
  id < YOU
    ? BEFORE_FIRST + id * BEFORE_GAP
    : AFTER_FIRST + (id - YOU - 1) * AFTER_GAP;

/** The four friends: walk in before the reel starts, stand, then go. */
export const YOU_ENTER = -60;
export const LOOK_AT = -30;
export const DECIDE = 136;

/** On-screen walking speed, pixels a frame, and the lag between members. */
export const WALK = 13;
export const TRAIL = 5;

/** While the four look, the free seats light up; the payoff at the full house. */
export const REVEAL_FROM = 106;
export const REVEAL_TO = 170;
export const VERDICT_FROM = 350;
