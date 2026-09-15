export const MAX_INPUT_SIZE = 1_024;

export const INPUT_SIZES = [
  1,
  2,
  4,
  8,
  16,
  32,
  64,
  128,
  256,
  512,
  MAX_INPUT_SIZE,
] as const;

export type ComplexityCounts = {
  readonly n: number;
  readonly constant: number;
  readonly logarithmic: number;
  readonly linear: number;
  readonly linearithmic: number;
  readonly quadratic: number;
};

export const countForInput = (n: number): ComplexityCounts => {
  const input = Math.max(1, Math.min(MAX_INPUT_SIZE, Math.round(n)));
  const logarithmic = Math.floor(Math.log2(input)) + 1;

  return {
    n: input,
    constant: 1,
    logarithmic,
    linear: input,
    linearithmic: input * logarithmic,
    quadratic: input * input,
  };
};

/**
 * Counts from the five loops in `measure-big-o-cheat-sheet.mjs`.
 * They are operation counts, not a promise about wall-clock speed.
 */
export const complexityCounts: readonly ComplexityCounts[] = [
  { n: 1, constant: 1, logarithmic: 1, linear: 1, linearithmic: 1, quadratic: 1 },
  { n: 2, constant: 1, logarithmic: 2, linear: 2, linearithmic: 4, quadratic: 4 },
  { n: 4, constant: 1, logarithmic: 3, linear: 4, linearithmic: 12, quadratic: 16 },
  { n: 8, constant: 1, logarithmic: 4, linear: 8, linearithmic: 32, quadratic: 64 },
  { n: 16, constant: 1, logarithmic: 5, linear: 16, linearithmic: 80, quadratic: 256 },
  { n: 32, constant: 1, logarithmic: 6, linear: 32, linearithmic: 192, quadratic: 1_024 },
  { n: 64, constant: 1, logarithmic: 7, linear: 64, linearithmic: 448, quadratic: 4_096 },
  { n: 128, constant: 1, logarithmic: 8, linear: 128, linearithmic: 1_024, quadratic: 16_384 },
  { n: 256, constant: 1, logarithmic: 9, linear: 256, linearithmic: 2_304, quadratic: 65_536 },
  { n: 512, constant: 1, logarithmic: 10, linear: 512, linearithmic: 5_120, quadratic: 262_144 },
  { n: 1_024, constant: 1, logarithmic: 11, linear: 1_024, linearithmic: 11_264, quadratic: 1_048_576 },
];

export const FINAL_COUNTS = complexityCounts[complexityCounts.length - 1];
