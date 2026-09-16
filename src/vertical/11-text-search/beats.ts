import { LENGTH } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/** The frame the sweep reaches the end of the page. */
export const SWEEP_END = 300;

/**
 * Characters already behind the sweep before frame zero, so the cut opens on
 * six pages already being read rather than six blank ones.
 */
export const PRE_ROLL = 60;

/**
 * The shared clock is position on the page, not work done.
 *
 * Boyer-Moore is finished after eight per cent of the total reads, so a clock
 * counting work would stop three of the six panels inside the first two seconds
 * and hold them there for nine. On position, all six sweep the page together
 * and what separates them is how much of it they light up, which is the claim
 * and is also the only thing the picture can show.
 *
 * Slightly accelerating, so the opening is slow enough to see single characters
 * being looked at and the close is a wipe.
 */
const curve = (u: number) => 0.55 * u + 0.45 * u * u;

/** How far along the page the sweep has got by `frame`, in characters. */
export const positionAt = (frame: number) => {
  const span = SWEEP_END + PRE_ROLL;
  const u = Math.min(1, Math.max(0, (frame + PRE_ROLL) / span));
  return Math.round(LENGTH * curve(u));
};

/** Frame the grid starts giving way to one page. */
export const VERDICT_FROM = 308;

/** The frames Boyer-Moore's scan is walked again, big enough to see it jump. */
export const REPLAY_FROM = 322;
export const REPLAY_TO = 402;

/** How far through that replay `frame` is, 0 to 1. */
export const replayAt = (frame: number) =>
  Math.max(0, Math.min(1, (frame - REPLAY_FROM) / (REPLAY_TO - REPLAY_FROM)));

/**
 * The last beat: the same page, flooded with what a straight scan touches.
 *
 * The verdict states 2,390 against 371 and, without this, shows only the 371.
 * A number with nothing to look at is the thing this format is supposed to
 * avoid, so the page fills in behind the marks and the claim is finished by the
 * picture rather than by the readout.
 */
export const FLOOD_FROM = 402;
export const FLOOD_TO = 415;

export const floodAt = (frame: number) =>
  Math.max(0, Math.min(1, (frame - FLOOD_FROM) / (FLOOD_TO - FLOOD_FROM)));
