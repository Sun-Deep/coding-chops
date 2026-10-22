import { HERO } from "./measurements";

/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;
export const FPS = 30;

/**
 * Both junctions on one clock at twice real time, from 10 s after you
 * appeared 150 m out, already in view, until the lights let you out of
 * the right of the frame at about frame 280.
 */
export const SPEED = 2;
export const START = HERO.at + 10;

export const simAt = (frame: number) => START + (frame / FPS) * SPEED;
export const frameAt = (t: number) => ((t - START) / SPEED) * FPS;

export const VERDICT_FROM = 290;
