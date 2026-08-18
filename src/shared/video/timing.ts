export const FPS = 30;

export const seconds = (value: number) => Math.round(value * FPS);

export const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};
