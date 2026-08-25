import { Easing, interpolate } from "remotion";
import { clamp } from "./timing";

export const EASE_OUT = { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) };
export const EASE_IN_OUT = {
  ...clamp,
  easing: Easing.bezier(0.45, 0, 0.55, 1),
};

/**
 * Move with anticipation and settle, the way a real object does.
 *
 * A thing that is about to travel right first shifts slightly left, then
 * overshoots its target and eases back. Linear interpolation between two points
 * is the single clearest tell that motion was written rather than animated.
 *
 * `back` and `past` are fractions of the total distance. Keep them small.
 * Anything over about 0.08 reads as bouncy, which the motion language rejects.
 */
export const travel = (
  frame: number,
  from: number,
  to: number,
  a: number,
  b: number,
  { back = 0.035, past = 0.045 }: { back?: number; past?: number } = {},
): number => {
  const distance = b - a;
  const wind = from + (to - from) * 0.16;
  const peak = from + (to - from) * 0.82;

  return interpolate(
    frame,
    [from, wind, peak, to],
    [a, a - distance * back, b + distance * past, b],
    { ...clamp, easing: Easing.bezier(0.32, 0, 0.2, 1) },
  );
};

/**
 * Arrive and settle without anticipation, for something appearing rather than
 * moving. Overshoots once and comes back.
 */
export const arrive = (
  frame: number,
  start: number,
  duration: number,
  a: number,
  b: number,
  past = 0.06,
): number =>
  interpolate(
    frame,
    [start, start + duration * 0.72, start + duration],
    [a, b + (b - a) * past, b],
    EASE_OUT,
  );

/**
 * Depth parallax. Something further from the camera moves less.
 *
 * `depth` of 0 is the focal plane and moves fully with the camera. Higher
 * values sit further back and lag, which is what separates layers visually.
 */
export const parallax = (cameraX: number, depth: number): number =>
  -cameraX * (1 / (1 + depth));

/**
 * Fade something in at `from` and out at `to`, safely.
 *
 * Beats come from spoken word frames, and two words can land closer together
 * than the fades want. Interpolate throws on a non-monotonic range, so this
 * pushes the ranges apart rather than letting a build fail on a fast sentence.
 */
export const window = (
  frame: number,
  from: number,
  to: number,
  fade = 22,
): number => {
  const inStart = from - fade * 0.6;
  const inEnd = from + fade * 0.4;
  const outEnd = Math.max(to, inEnd + fade * 0.5);
  const outStart = Math.max(inEnd + 1, outEnd - fade * 0.9);
  return interpolate(
    frame,
    [inStart, inEnd, outStart, outEnd],
    [0, 1, 1, 0],
    clamp,
  );
};

/**
 * Cross-dissolve a panel in and out around a pair of beats.
 *
 * Panels written as a four point linear ramp cut on the exact frame the next
 * one starts, which reads as a hard switch rather than a transition. This eases
 * both ends and widens the tails so one panel is still leaving while the next
 * is arriving, and it guarantees the range stays monotonic when two spoken
 * words land close together.
 */
export const crossFade = (
  frame: number,
  [a, b, c, d]: [number, number, number, number],
): number => {
  const inStart = a - 8;
  const inEnd = Math.max(b + 8, inStart + 12);
  const outEnd = Math.max(d + 12, inEnd + 16);
  const outStart = Math.max(inEnd + 1, Math.min(c - 6, outEnd - 18));
  return interpolate(
    frame,
    [inStart, inEnd, outStart, outEnd],
    [0, 1, 1, 0],
    EASE_IN_OUT,
  );
};

/**
 * Opacities for a run of full-frame slides that must never overlap.
 *
 * Every edge is a cross-fade, including where two slides touch: the outgoing
 * slide is at half as the incoming one reaches half. That is what keeps the
 * motion continuous with the rest of the episode — a hard cut between shots
 * reads as a jump when everything around it is on a moving camera.
 *
 * Halves are the whole trick. `EditorialShot` turns the first half of a slide's
 * value into paper and the second half into contents, and `stageBehind` clears
 * the stage over that same first half. Two slides in a cross-fade always sum to
 * one, so at most one of them can be above half, which means at most one can be
 * drawing contents — while their two sheets of paper together always add up to
 * full cover. Continuous motion, and never two machines on screen.
 *
 * Give each slide the frame it starts on and the frame it gives way on; slides
 * that share a frame hand over across it.
 */
export const deck = (
  frame: number,
  slides: { from: number; to: number }[],
  fade = 20,
): number[] =>
  slides.map((slide) => {
    const half = fade / 2;
    const rising = (frame - (slide.from - half)) / fade;
    const falling = (slide.to + half - frame) / fade;
    return Math.max(0, Math.min(1, rising, falling));
  });

/**
 * How much of the stage still shows under a full-frame shot.
 *
 * Pass the strongest opacity among the shots covering the stage. It clears by
 * the halfway point of the fade, which is where the shot's paper has gone
 * solid and its contents start coming up.
 */
export const stageBehind = (cover: number): number =>
  1 - Math.min(1, cover * 2);

/**
 * How far a slide has settled into place, 0 to 1.
 *
 * A cross-fade between two motionless shots reads as a blink, because for a
 * moment there is nothing moving to carry the eye across. Every stage shot in
 * the episode is on a moving camera; the full-frame shots need the same, so
 * each one arrives with a small push that lands well before it is fully up.
 *
 * Takes the same slides array as `deck`.
 */
export const settle = (
  frame: number,
  slides: { from: number; to: number }[],
  over = 74,
): number[] =>
  slides.map((slide) => {
    const t = Math.max(0, Math.min(1, (frame - (slide.from - 10)) / over));
    return 1 - (1 - t) ** 3;
  });
