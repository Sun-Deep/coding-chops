import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { B } from "./clock";
import { RUN } from "./measurements";
import {
  BUGGY,
  FIXED,
  FIXED_LINE,
  REPORT,
  SUGGESTED,
  SUGGESTED_LINE,
} from "./snippets";

/**
 * The round's two panes, as the voice describes it.
 *
 * The editor: a binary search with a bug, the bug report, the AI's
 * suggested fix landing in orange, the tests that show it is still wrong,
 * and the real fix passing every case. The code and every result are the
 * ones `scripts/measure-google-interview.mjs` runs.
 *
 * Under it, from the first frame, the AI assistant: a terminal agent's
 * prompt box, idle until the candidate types the question, then the
 * question and the reply. The assistant is marked in blue, its own lane
 * colour, so it never reads as the candidate's code. The reply is an
 * example written for the reel, labelled as one, not Gemini's output.
 */

export const CODE_TOP = 396;
export const CODE_H = 402;
export const AI_TOP = CODE_TOP + CODE_H + 12;
export const AI_H = 176;
const LEFT = 96;
const WIDTH = 888;
const HEADER = 36;
const LH = 29;
const C = theme.colors;
const AI = C.blueBright;
const n = (x: number) => x.toLocaleString("en-US");
const ASK = `why does search([${REPORT.nums.join(", ")}], ${REPORT.target}) return -1?`;
const REPLY = "Make hi exclusive: hi = nums.length";

const panel = (top: number, height: number, border: string) =>
  ({
    position: "absolute",
    top,
    left: LEFT,
    width: WIDTH,
    height,
    borderRadius: 16,
    background: "#0A0B0D",
    border: `1px solid ${border}`,
    overflow: "hidden",
    fontFamily: theme.monoFamily,
    fontVariantLigatures: "none",
    fontFeatureSettings: '"liga" 0, "calt" 0',
  }) as const;

const Header: React.FC<{ left: React.ReactNode; right: React.ReactNode }> = ({
  left,
  right,
}) => (
  <div
    style={{
      height: HEADER,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      borderBottom: "1px solid rgba(233,228,216,0.08)",
      fontSize: 17,
      letterSpacing: "0.04em",
      color: C.grayDark,
    }}
  >
    <span>{left}</span>
    <span>{right}</span>
  </div>
);

const Out: React.FC<{
  children: React.ReactNode;
  color?: string;
  opacity?: number;
  size?: number;
}> = ({ children, color = C.chalk, opacity = 1, size = 22 }) =>
  opacity > 0 ? (
    <div
      style={{
        fontSize: size,
        lineHeight: 1.36,
        color,
        opacity,
        whiteSpace: "pre",
      }}
    >
      {children}
    </div>
  ) : null;

export const Editor: React.FC<{ frame: number }> = ({ frame: f }) => {
  const fade = (a: number) => interpolate(f, [a, a + 6], [0, 1], clamp);
  const lines = f >= B.understand ? FIXED : f >= B.grade ? SUGGESTED : BUGGY;
  const changed =
    f >= B.understand ? FIXED_LINE : f >= B.grade ? SUGGESTED_LINE : -1;
  const round = f >= B.testing;
  return (
    <div style={panel(CODE_TOP, CODE_H, "rgba(233,228,216,0.12)")}>
      <Header
        left={
          <span style={{ color: round ? C.chalk : C.grayDark }}>
            {round
              ? "Code comprehension round · fix this code"
              : "LeetCode 704 · Binary Search"}
          </span>
        }
        right="search.js"
      />
      <div
        style={{ position: "absolute", top: HEADER + 8, left: 12, right: 12 }}
      >
        {lines.map((t, i) => (
          <div
            key={i}
            style={{
              height: LH,
              lineHeight: `${LH}px`,
              padding: "0 10px",
              borderRadius: 6,
              fontSize: 22,
              whiteSpace: "pre",
              color: i === changed && f < B.understand ? ACCENT : C.chalk,
              background:
                i === changed
                  ? f < B.understand
                    ? "rgba(255,122,51,0.14)"
                    : "rgba(233,228,216,0.1)"
                  : "transparent",
            }}
          >
            {t}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 22,
          right: 22,
          bottom: 10,
          paddingTop: 8,
          borderTop: "1px solid rgba(233,228,216,0.08)",
        }}
      >
        {f < B.testing ? (
          <Out color={C.grayDark}>
            {"// the kind of problem people call dead"}
          </Out>
        ) : f < B.grade ? (
          <Out opacity={fade(B.testing)}>
            bug report: search([1, 3, 5], 5) returns -1
          </Out>
        ) : f < B.understand ? (
          <>
            <Out opacity={fade(B.catchIt)}>
              test search([1, 3, 5], 5) → {RUN.suggested.report} ✓
            </Out>
            <Out color={ACCENT} opacity={fade(B.wrong)}>
              test search([1, 3, 5], 1) → {RUN.suggested.other} ✗ still wrong
            </Out>
          </>
        ) : f < B.pilot ? (
          <>
            <Out>test search([1, 3, 5], 1) → {RUN.fixed.other} ✓</Out>
            <Out opacity={fade(B.understand + 10)}>
              {n(RUN.cases - RUN.fixed.wrong)} of {n(RUN.cases)} cases pass ✓
            </Out>
          </>
        ) : (
          <>
            <Out size={18} color={C.grayLight}>
              Pilot: junior and mid-level roles, select US teams.
            </Out>
            <Out size={18} color={C.grayDark}>
              Source: internal Google document, via Business Insider, 2026.
            </Out>
          </>
        )}
      </div>
    </div>
  );
};

/** The AI assistant's pane: a prompt box, then the exchange. */
export const Assistant: React.FC<{ frame: number }> = ({ frame: f }) => {
  const typeFrom = B.gemini - 8;
  const sent = B.gemini + 16;
  const typed = ASK.slice(
    0,
    Math.round(interpolate(f, [typeFrom, sent - 2], [0, ASK.length], clamp)),
  );
  const caret = Math.floor(f / 15) % 2 === 0;
  const reply = interpolate(f, [sent + 6, sent + 12], [0, 1], clamp);
  const wrong = interpolate(f, [B.wrong, B.wrong + 6], [0, 1], clamp);
  const active = f >= typeFrom && f < B.pilot;
  return (
    <div
      style={panel(
        AI_TOP,
        AI_H,
        active ? "rgba(77,155,255,0.55)" : "rgba(77,155,255,0.25)",
      )}
    >
      <Header
        left={<span style={{ color: AI }}>✦ AI assistant</span>}
        right="Gemini, in Google's round"
      />
      <div style={{ padding: "10px 20px 0" }}>
        {f >= sent ? (
          <>
            <Out color={C.grayLight}>{`> ${ASK}`}</Out>
            <div
              style={{ display: "flex", gap: 10, opacity: reply, marginTop: 4 }}
            >
              <span style={{ color: AI, fontSize: 22, lineHeight: 1.36 }}>
                ✦
              </span>
              <div>
                <Out>{REPLY}</Out>
                <Out size={16} color={C.grayDark}>
                  example reply, written for this video
                </Out>
              </div>
              {wrong > 0 ? (
                <span
                  style={{
                    marginLeft: "auto",
                    alignSelf: "flex-start",
                    opacity: wrong,
                    padding: "2px 10px",
                    borderRadius: 6,
                    background: ACCENT,
                    color: "#0A0B0D",
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                  }}
                >
                  WRONG
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div
            style={{
              marginTop: 18,
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${f >= typeFrom ? AI : "rgba(233,228,216,0.18)"}`,
              fontSize: 22,
              whiteSpace: "pre",
              color: typed ? C.chalk : C.grayDark,
            }}
          >
            {"> "}
            {typed || "Ask about this code"}
            {caret ? <span style={{ color: AI }}>▌</span> : " "}
          </div>
        )}
      </div>
    </div>
  );
};

/** Both panes, for the reel and the cover. */
export const Code: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <Editor frame={frame} />
    <Assistant frame={frame} />
  </>
);
