/** Fourteen seconds at 30fps. Section 2 of the vertical format standard. */
export const DURATION = 420;

/** Real time: people walking and stepping at the speed people do. */
export const simAt = (frame: number) => frame / 30;
export const frameAt = (sim: number) => sim * 30;

export const VERDICT_FROM = 300;
