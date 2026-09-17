import { EXECUTE, READ, TOP_MODES, TOTAL_MODES, WRITE } from "./measurements";

/**
 * A mode, taken apart.
 *
 * The whole cut is that the number is not a code. Each digit is three switches
 * worth 4, 2 and 1, and the digit is the sum of the ones that are on. This is
 * the only place that is computed, so a frame cannot disagree with the script.
 */

export type Bit = {
  readonly letter: "r" | "w" | "x";
  readonly weight: number;
  readonly on: boolean;
};

export const bitsOf = (digit: number): readonly Bit[] => [
  { letter: "r", weight: READ, on: (digit & READ) !== 0 },
  { letter: "w", weight: WRITE, on: (digit & WRITE) !== 0 },
  { letter: "x", weight: EXECUTE, on: (digit & EXECUTE) !== 0 },
];

export const digitsOf = (mode: string) => mode.split("").map((d) => Number(d));

export const symbolOf = (digit: number) =>
  bitsOf(digit)
    .map((bit) => (bit.on ? bit.letter : "-"))
    .join("");

export const symbolicOf = (mode: string) =>
  digitsOf(mode).map(symbolOf).join("");

// The same check the measurement script runs, kept here so a render cannot
// start against a decomposition that disagrees with the one that was proved.
for (let digit = 0; digit < 8; digit++) {
  const sum = bitsOf(digit).reduce(
    (total, bit) => total + (bit.on ? bit.weight : 0),
    0,
  );
  if (sum !== digit) throw new Error(`${digit} is not the sum of its bits`);
}
if (TOTAL_MODES !== 512) throw new Error("there are 512 modes");
for (const row of TOP_MODES) {
  if (digitsOf(row.mode).some((d) => d < 0 || d > 7)) {
    throw new Error(`${row.mode} is not three octal digits`);
  }
}
