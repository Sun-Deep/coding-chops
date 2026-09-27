import { sha256 } from "../16-password-hash/sha256";
import { CHANGED_LINE, FILE_BYTES, LINES } from "./measurements";

/**
 * The file, rebuilt exactly as the measurement script builds it.
 *
 * Line i is `setting_iii = <first 43 hex of sha256("value-i")> # iii`, 64
 * bytes with its newline. The script changes line 80's value to 43 zeros. The
 * frame draws these real lines rather than a texture that looks like text, and
 * the totals are checked against `measurements.ts` at load.
 */

const pad = (n: number) => String(n).padStart(3, "0");

export const BEFORE: readonly string[] = Array.from(
  { length: LINES },
  (_, k) => {
    const i = k + 1;
    return `setting_${pad(i)} = ${sha256(`value-${i}`).slice(0, 43)} # ${pad(i)}`;
  },
);

export const AFTER: readonly string[] = BEFORE.map((line, k) =>
  k + 1 === CHANGED_LINE
    ? line.replace(/= [0-9a-f]{43}/, `= ${"0".repeat(43)}`)
    : line,
);

const bytes = (lines: readonly string[]) =>
  lines.reduce((n, l) => n + l.length + 1, 0);

if (bytes(BEFORE) !== FILE_BYTES || bytes(AFTER) !== FILE_BYTES) {
  throw new Error("the rebuilt file is not the size the script measured");
}
if (
  BEFORE[CHANGED_LINE - 1] !==
  "setting_080 = 44a7db096b15d190b7f0b1be1950bfd32203a8d0f5c # 080"
) {
  throw new Error("line 80 does not match the script's output");
}
