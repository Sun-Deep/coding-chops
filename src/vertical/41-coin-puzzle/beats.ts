export const DURATION = 420;
export const FPS = 30;
export const PREVIEW_DURATION = 120;

/** The same events time Blender, the subtitles and the sound cues. */
export const BEATS = {
  loadFirst: [-14, 90],
  releaseFirst: [96, 122],
  keep: [150, 236],
  loadSecond: [244, 282],
  releaseSecond: [286, 318],
  gripAnswer: [342, 354],
  reveal: [354, 390],
} as const;

export const SHOTS = [
  { name: "first weighing", from: 0, to: 150 },
  { name: "keep three", from: 150, to: 240 },
  { name: "second weighing", from: 240, to: 354 },
  { name: "answer", from: 354, to: DURATION },
] as const;
