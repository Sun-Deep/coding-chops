import * as B from "./beats";
import { COUNT_FROM, RUN } from "./measurements";

/**
 * What the counter reads on each frame: slowing as it reaches the
 * ceiling, the wrap, the 64-bit value, and the race to 6 billion. The
 * page's count and the bits both read it.
 */

const easeOut = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
const smooth = (t: number) => {
  const u = Math.min(1, Math.max(0, t));
  return u * u * (3 - 2 * u);
};

/** When bit 31 has finished rolling to 1. */
export const WRAPS_AT = B.SIGN_AT + 6;
/** When bit 31 is a number again, as the row becomes 64 bits. */
export const LONG_READS_AT = B.LONG_FROM + 18;

export const views = (f: number): number => {
  if (f <= B.COUNT_TO)
    return Math.floor(
      COUNT_FROM + (RUN.max - COUNT_FROM) * easeOut(f / B.COUNT_TO) + 1e-9,
    );
  if (f < WRAPS_AT) return RUN.max;
  if (f < LONG_READS_AT) return RUN.wrapped;
  if (f < B.RACE_FROM) return RUN.asLong;
  const u = smooth((f - B.RACE_FROM) / (B.RACE_TO - B.RACE_FROM));
  return Math.floor(RUN.asLong + (RUN.sixBillion - RUN.asLong) * u + 1e-6);
};

/** Thousands separators, and a real minus sign. */
export const fmt = (v: number) => v.toLocaleString("en-US").replace("-", "−");
