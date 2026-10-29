import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { WRAPS_AT, views } from "./count";

/**
 * How the counter stores the count: the 32 bits, in bytes. While the
 * carry runs, the bits flip right to left a frame or two apart, as an
 * adder does it; the top bit is the sign and turns orange when it is set.
 * Once the counter is 64 bits a second row, bits 63 to 32, appears above,
 * and bit 31 is a number like the rest.
 */

export const BITS_TOP = 1078;
const ROW = 38;
// BigInt(n), not n literals: the project targets below ES2020.
const ZERO = BigInt(0);
const ONE = BigInt(1);
const C = theme.colors;

/** The low 64 bits of the count, as the counter holds it on frame f. */
const bitsAt = (f: number): bigint => {
  if (f >= B.PLUS_ONE && f < WRAPS_AT) {
    // The carry: bits below k are already 0; at k = 31 the sign sets.
    const k = Math.floor((f - B.PLUS_ONE) / B.RIPPLE_STEP) + 1;
    const ones = (ONE << BigInt(31)) - ONE;
    const cleared = (ONE << BigInt(Math.min(k, 31))) - ONE;
    return (ones & ~cleared) | (k >= 32 ? ONE << BigInt(31) : ZERO);
  }
  return BigInt.asUintN(64, BigInt(views(f)));
};

/** One row of 32 bits, high on the left; sign-bit label on its left, row name on its right. */
const Row: React.FC<{
  bits: bigint;
  from: number;
  label: string;
  sign: boolean;
  top: number;
  opacity: number;
}> = ({ bits, from, label, sign, top, opacity }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: 1080,
      display: "flex",
      justifyContent: "center",
      alignItems: "baseline",
      gap: 10,
      opacity,
      fontFamily: theme.monoFamily,
      fontSize: 15,
      color: C.grayDark,
    }}
  >
    <span style={{ width: 96, textAlign: "right" }}>
      {sign ? "sign →" : ""}
    </span>
    <span style={{ fontSize: 26, whiteSpace: "pre" }}>
      {Array.from({ length: 32 }, (_, j) => {
        const i = from + 31 - j;
        const on = (bits >> BigInt(i)) & ONE;
        const isSign = sign && j === 0;
        return (
          <span
            key={j}
            style={{
              color:
                isSign && on ? ACCENT : on ? C.chalk : "rgba(233,228,216,0.38)",
              fontWeight: isSign && on ? 800 : 500,
            }}
          >
            {on ? "1" : "0"}
            {j % 8 === 7 && j < 31 ? " " : ""}
          </span>
        );
      })}
    </span>
    <span style={{ width: 96 }}>{label}</span>
  </div>
);

export const Bits: React.FC<{ frame: number }> = ({ frame: f }) => {
  const bits = bitsAt(f);
  const long = interpolate(
    f,
    [B.LONG_FROM + 8, B.LONG_FROM + 20],
    [0, 1],
    clamp,
  );
  return (
    <>
      <Row
        bits={bits}
        from={32}
        label="bits 63–32"
        sign
        top={BITS_TOP}
        opacity={long}
      />
      <Row
        bits={bits}
        from={0}
        label={long > 0 ? "bits 31–0" : "32 bits"}
        sign={long === 0}
        top={BITS_TOP + ROW}
        opacity={1}
      />
    </>
  );
};
