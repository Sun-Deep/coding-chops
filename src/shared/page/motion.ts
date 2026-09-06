import { interpolate } from "remotion";
import { arrive, EASE_IN_OUT, EASE_OUT } from "../video/motion";
import { clamp } from "../video/timing";

/**
 * The Problem Solving semantic motion contract, in code.
 *
 * Section 2 of `docs/problem-solving-visual-language.md` carries the same
 * numbers in prose. They live here so a scene cannot drift from the document
 * by retyping a duration it liked better.
 *
 * This is a semantic layer, not a second motion engine. It says what a movement
 * means and how long it lasts. `src/shared/video/motion.ts` still says how the
 * interpolation is done.
 */
export const problemSolvingMotion = {
  opacity: {
    active: 1,
    resting: 0.55,
    faded: 0.3,
  },
  draw: {
    pixelsPerFrame: 30,
    minFrames: 10,
    maxFrames: 45,
  },
  slide: {
    short: 18,
    medium: 22,
    long: 26,
    shortMaxPx: 280,
    mediumMaxPx: 700,
    backPx: 10,
    pastPx: 13,
    maxBack: 0.035,
    maxPast: 0.045,
  },
  // 12 and 6 are measured, not chosen. Fourteen captured marks average 0.42s
  // for a circle and 0.18s for a strike, which at 30fps is 12.6 and 5.4 frames.
  circle: {
    duration: 12,
  },
  strike: {
    duration: 6,
    fadeStart: 3,
    fadeDuration: 8,
  },
  lift: {
    duration: 8,
    translateY: -6,
  },
  store: {
    duration: 12,
    opacityDuration: 8,
    translateY: -14,
  },
  morph: {
    inPlace: 16,
    fullFrame: 20,
    staggerMin: 12,
    staggerMax: 16,
  },
  fadeBack: {
    duration: 8,
  },
  /**
   * Pressure window and stroke weights for ink. Refit per episode.
   *
   * Two weight sets, because light on dark blooms and the same width reads
   * heavier there. The dark values are about a tenth thinner. Provisional
   * until reviewed at feed size, per section 25.
   */
  ink: {
    lo: 0.016,
    hi: 0.282,
    gamma: 0.6,
    minWidth: 1.6,
    maxWidth: 5,
    darkMinWidth: 1.4,
    darkMaxWidth: 4.4,
  },
} as const;

const M = problemSolvingMotion;

/** How long a slide takes, by how far the object visibly travels. */
export const slideFrames = (distancePx: number): number =>
  distancePx <= M.slide.shortMaxPx
    ? M.slide.short
    : distancePx <= M.slide.mediumMaxPx
      ? M.slide.medium
      : M.slide.long;

/**
 * Overshoot params for `travel()`, held constant in pixels.
 *
 * The helper takes fractions of distance, so its defaults grow the overshoot as
 * the journey gets longer and a 1400px slide bounces by 63px. Capping in pixels
 * makes every slide overshoot by the same visible amount.
 */
export const slideOvershoot = (
  distancePx: number,
): { back: number; past: number } => {
  const d = Math.max(1, distancePx);
  return {
    back: Math.min(M.slide.maxBack, M.slide.backPx / d),
    past: Math.min(M.slide.maxPast, M.slide.pastPx / d),
  };
};

/** How long a typeset path takes to draw, by its length. */
export const drawFrames = (pathLengthPx: number): number =>
  Math.round(
    Math.max(
      M.draw.minFrames,
      Math.min(M.draw.maxFrames, pathLengthPx / M.draw.pixelsPerFrame),
    ),
  );

/**
 * Stroke width for one pressure sample.
 *
 * `hi` is 0.282 rather than 1, because that is the 95th percentile of real
 * annotation pressure. Mapping the device's full range renders every natural
 * mark at close to minimum width. Graphite also does not lighten in proportion
 * to pressure, which is what the 0.6 exponent is for.
 */
export const inkWidth = (
  pressure: number,
  calibration: { lo: number; hi: number } = M.ink,
  widths: { min: number; max: number } = {
    min: M.ink.minWidth,
    max: M.ink.maxWidth,
  },
): number => {
  const span = Math.max(1e-6, calibration.hi - calibration.lo);
  const t = Math.max(0, Math.min(1, (pressure - calibration.lo) / span));
  return widths.min + (widths.max - widths.min) * t ** M.ink.gamma;
};

export { clamp };

// ---------------------------------------------------------------------------
// Semantic presets.
//
// Each answers "what does this movement mean" and returns values a scene
// applies. The interpolation itself still comes from src/shared/video/motion.ts.
// A scene that wants a duration reaches for one of these rather than typing a
// number, which is the only thing keeping section 2 and the code in step.
// ---------------------------------------------------------------------------

/** Existing information becomes active. Position and opacity only. */
export const lift = (
  frame: number,
  start: number,
): { opacity: number; y: number } => ({
  opacity: interpolate(
    frame,
    [start, start + M.lift.duration],
    [M.opacity.resting, M.opacity.active],
    EASE_OUT,
  ),
  y: interpolate(
    frame,
    [start, start + M.lift.duration],
    [0, M.lift.translateY],
    EASE_OUT,
  ),
});

/**
 * New information enters persistent state.
 *
 * `arrive()` rather than a plain ease, because its small overshoot is what
 * stops a stored value from reading as a text swap. Never scales: a value that
 * grows on arrival reads as emphasis, and storing is not emphasis.
 */
export const store = (
  frame: number,
  start: number,
): { opacity: number; y: number } => ({
  opacity: interpolate(
    frame,
    [start, start + M.store.opacityDuration],
    [0, M.opacity.active],
    EASE_OUT,
  ),
  y: arrive(frame, start, M.store.duration, M.store.translateY, 0),
});

/** Information stays present but loses priority. Opacity only. */
export const fadeBack = (
  frame: number,
  start: number,
  from: number = M.opacity.active,
): number =>
  interpolate(
    frame,
    [start, start + M.fadeBack.duration],
    [from, M.opacity.faded],
    EASE_IN_OUT,
  );

/**
 * Two representations of one concept, 0 to 1.
 *
 * A group transformation is not one long morph. Run one of these per element
 * and stagger the starts between `staggerMin` and `staggerMax`.
 */
export const morph = (
  frame: number,
  start: number,
  kind: "inPlace" | "fullFrame" = "inPlace",
): number =>
  interpolate(frame, [start, start + M.morph[kind]], [0, 1], EASE_IN_OUT);

/** Reveal progress for a captured ink mark, 0 to 1. */
export const inkProgress = (
  frame: number,
  start: number,
  frames: number,
): number => interpolate(frame, [start, start + frames], [0, 1], clamp);

/** A selection circle drawing on, then held. */
export const circle = (frame: number, start: number): number =>
  inkProgress(frame, start, M.circle.duration);

/**
 * A strike and its target's follow-through.
 *
 * The strike is not finished when the graphite is. The target has to visibly
 * lose priority, and the fade starts at frame 3 of a 6 frame mark so the drop
 * reads as caused by the strike rather than as a separate event.
 */
export const strike = (
  frame: number,
  start: number,
  from: number = M.opacity.active,
): { progress: number; targetOpacity: number } => ({
  progress: inkProgress(frame, start, M.strike.duration),
  targetOpacity: interpolate(
    frame,
    [
      start + M.strike.fadeStart,
      start + M.strike.fadeStart + M.strike.fadeDuration,
    ],
    [from, M.opacity.faded],
    EASE_IN_OUT,
  ),
});
