import { timeOut, type Gait } from "./simulation";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/**
 * Real time. Both of you are already moving under the awning at frame 0,
 * and your front leaves it on frame LEAVE, which is second 0 of the model.
 */
export const LEAVE = 8;
export const FPS = 30;

export const simAt = (frame: number) => (frame - LEAVE) / FPS;
export const frameAt = (t: number) => LEAVE + t * FPS;

/** The frame your back is under the shelter. */
export const arrive = (gait: Gait) => frameAt(timeOut(gait));

/** The walker is under the shelter on frame 314; the verdict follows. */
export const VERDICT_FROM = Math.round(arrive("walk")) + 6;
