import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { RUN } from "./measurements";
import { INT32, INT64, SIX } from "./snippets";

/**
 * The counter as code, under its bits: the int at its ceiling and the
 * line that adds a view, printing -2147483648; then the same lines with
 * long, printing 2147483648; then 6 billion forced into an int. The lines
 * and what they print are the ones `scripts/measure-gangnam-counter.mjs`
 * compiles and runs.
 */

export const CODE_TOP = 1170;
const LEFT = 150;
const WIDTH = 780;
const LH = 32;
const C = theme.colors;

type Take = {
  lines: readonly string[];
  printed: number;
  wrong: boolean;
  from: number;
};
const TAKES: Take[] = [
  { lines: INT32, printed: RUN.wrapped, wrong: true, from: B.SIGN_AT + 2 },
  { lines: INT64, printed: RUN.asLong, wrong: false, from: B.LONG_FROM },
  {
    lines: SIX,
    printed: RUN.sixBillionAsInt,
    wrong: true,
    from: B.RACE_TO - 4,
  },
];

export const Code: React.FC<{ frame: number }> = ({ frame: f }) => {
  const k = f >= TAKES[2].from ? 2 : f >= TAKES[1].from ? 1 : 0;
  const take = TAKES[k];
  const shown = k > 0 || f >= take.from;
  const out = interpolate(f, [take.from, take.from + 6], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: CODE_TOP,
        left: LEFT,
        width: WIDTH,
        padding: "10px 18px",
        boxSizing: "border-box",
        borderRadius: 12,
        background: "#0A0B0D",
        border: "1px solid rgba(233,228,216,0.12)",
        fontFamily: theme.monoFamily,
        fontVariantLigatures: "none",
        fontFeatureSettings: '"liga" 0, "calt" 0',
        fontSize: 23,
        color: C.grayLight,
      }}
    >
      {take.lines.map((t, i) => {
        const last = i === take.lines.length - 1;
        return (
          <div
            key={i}
            style={{ height: LH, lineHeight: `${LH}px`, whiteSpace: "pre" }}
          >
            {i === 0 ? (
              <>
                <span style={{ color: C.chalk, fontWeight: 700 }}>
                  {t.split(" ")[0]}
                </span>{" "}
                {t.split(" ").slice(1).join(" ")}
              </>
            ) : (
              t
            )}
            {last && shown ? (
              <span
                style={{
                  opacity: out,
                  color: take.wrong ? ACCENT : C.chalk,
                  fontWeight: 700,
                }}
              >
                {"  // "}
                {take.printed}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
