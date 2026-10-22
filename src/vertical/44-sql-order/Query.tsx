import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { STAGES, badgeAt, stageAt } from "./beats";
import { QUERY, STEP_OF_LINE } from "./data";
import { CONDITIONS } from "./measurements";

/**
 * The query as it is written, top to bottom, with the step Postgres runs
 * each line at appearing beside it as that step runs. By the end the
 * badges read 5, 1, 2, 3, 4, 6, 7.
 *
 * Orange is what SELECT makes: its line and its badge, and in the scene the
 * rows it produces.
 */

export const QUERY_TOP = 420;
export const QUERY_H = 282;
const LEFT = 96;
const WIDTH = 888;
const HEADER = 38;
const LH = 33;
const C = theme.colors;

const KEYWORDS = /^(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT)\b/;

if (
  JSON.stringify(STAGES.map((s) => STEP_OF_LINE[s.line])) !== "[1,2,3,4,5,6,7]"
)
  throw new Error("Query.tsx: STAGES and STEP_OF_LINE disagree");

export const Query: React.FC<{ frame: number }> = ({ frame }) => {
  const now = stageAt(frame);
  return (
    <div
      style={{
        position: "absolute",
        top: QUERY_TOP,
        left: LEFT,
        width: WIDTH,
        height: QUERY_H,
        borderRadius: 16,
        background: "#0A0B0D",
        border: "1px solid rgba(233,228,216,0.12)",
        overflow: "hidden",
        fontFamily: theme.monoFamily,
        fontVariantLigatures: "none",
        fontFeatureSettings: '"liga" 0, "calt" 0',
      }}
    >
      <div
        style={{
          height: HEADER,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
          borderBottom: "1px solid rgba(233,228,216,0.08)",
          fontSize: 17,
          letterSpacing: "0.04em",
          color: C.grayDark,
        }}
      >
        <span>shop=# </span>
        <span>{CONDITIONS}</span>
      </div>
      <div
        style={{ position: "absolute", top: HEADER + 12, left: 16, right: 16 }}
      >
        {QUERY.map((text, line) => {
          const step = STEP_OF_LINE[line];
          const i = step - 1;
          const shown = interpolate(
            frame,
            [badgeAt(i), badgeAt(i) + 5],
            [0, 1],
            clamp,
          );
          const active = now === i;
          const select = step === 5;
          const m = text.match(KEYWORDS);
          const kw = m ? m[0] : "";
          const ink = select && shown > 0 ? ACCENT : C.chalk;
          return (
            <div
              key={line}
              style={{
                position: "relative",
                height: LH,
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderRadius: 7,
                padding: "0 8px",
                background: active
                  ? select
                    ? "rgba(255,122,51,0.14)"
                    : "rgba(233,228,216,0.08)"
                  : "transparent",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 26,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 19,
                  fontWeight: 700,
                  opacity: shown,
                  transform: `scale(${0.6 + 0.4 * shown})`,
                  background: select ? ACCENT : C.chalk,
                  color: ON_ACCENT,
                }}
              >
                {step}
              </div>
              <div
                style={{
                  fontSize: 27,
                  whiteSpace: "pre",
                  color: shown > 0 ? ink : C.grayDark,
                  opacity: shown > 0 ? 1 : 0.75,
                }}
              >
                <span style={{ fontWeight: 700 }}>{kw}</span>
                {text.slice(kw.length)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
