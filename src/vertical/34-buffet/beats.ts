export const DURATION = 420;
export const VERDICT_FROM = 230;
export const NAME_FROM = 316;
/** Start during the salad pause; accelerate the same clock in both rooms. */
export const simAt = (frame: number) => {
  if (frame < 54) return 15 + (frame / 30) * 2;
  if (frame < 90) {
    const f = frame - 54;
    return 18.6 + (2 * f + 0.5 * 1.5 * f * f) / 30;
  }
  return 53.4 + ((frame - 90) / 30) * 56;
};
