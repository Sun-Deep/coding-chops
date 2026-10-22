import type { ReactNode } from "react";
import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { CONDITIONS } from "./measurements";
import { DIFF_AT, DIFF_LINES, LINES, type Line } from "./transcript";

/**
 * The real run, scrolling as git prints it. Every line here is one the
 * committed run printed, in order; the reel only chooses when it shows.
 *
 * Orange is the bug and only the bug: the FAIL lines, the commit git
 * names, and the line of code that changed.
 */

export const TERM_TOP = 420;
export const TERM_H = 282;
const LEFT = 96;
const WIDTH = 888;
const HEADER = 38;
const LH = 27;
const ROWS = 8;
const SIZE = 20;

const C = theme.colors;

type Shown = Line & { sign?: string };

const all: readonly Shown[] = [
  ...LINES,
  ...DIFF_LINES.map(
    (text, i): Shown => ({
      at: DIFF_AT + i * 2,
      text,
      kind: "out",
      sign:
        text.startsWith("-") && !text.startsWith("---")
          ? "-"
          : text.startsWith("+") && !text.startsWith("+++")
            ? "+"
            : "",
    }),
  ),
];

const paint = (l: Shown, frame: number): ReactNode => {
  if (l.kind === "cmd") {
    const n = l.typing
      ? Math.floor(
          (l.text.length - 2) *
            interpolate(frame, [l.at, l.at + l.typing], [0, 1], clamp),
        ) + 2
      : l.text.length;
    return (
      <>
        <span style={{ color: C.grayDark }}>$ </span>
        <span style={{ color: C.chalk, fontWeight: 600 }}>
          {l.text.slice(2, n)}
        </span>
      </>
    );
  }
  if (l.sign === "+")
    return <span style={{ color: ACCENT, fontWeight: 700 }}>{l.text}</span>;
  if (l.sign === "-")
    return <span style={{ color: C.chalk, fontWeight: 600 }}>{l.text}</span>;
  if (l.kind === "ok")
    return (
      <>
        <span style={{ color: C.chalk, fontWeight: 700 }}>ok</span>
        <span style={{ color: C.grayLight }}>{l.text.slice(2)}</span>
      </>
    );
  if (l.kind === "fail")
    return <span style={{ color: ACCENT, fontWeight: 700 }}>{l.text}</span>;
  if (l.kind === "left") {
    const m = l.text.match(/^(Bisecting: )(\d+)( .*)$/)!;
    return (
      <>
        <span style={{ color: C.grayDark }}>{m[1]}</span>
        <span style={{ color: C.chalk, fontWeight: 700 }}>{m[2]}</span>
        <span style={{ color: C.grayDark }}>{m[3]}</span>
      </>
    );
  }
  if (l.kind === "commit")
    return (
      <>
        <span style={{ color: C.grayDark }}>{l.text.slice(0, 42)}</span>
        <span style={{ color: C.chalk }}>{l.text.slice(42)}</span>
      </>
    );
  if (l.kind === "found")
    return (
      <>
        <span style={{ color: ACCENT, fontWeight: 700 }}>
          {l.text.slice(0, 40)}
        </span>
        <span style={{ color: C.chalk, fontWeight: 700 }}>
          {l.text.slice(40)}
        </span>
      </>
    );
  return <span style={{ color: C.grayDark }}>{l.text}</span>;
};

export const Terminal: React.FC<{ frame: number }> = ({ frame }) => {
  const shown = all.filter((l) => l.at <= frame);
  const latest = shown[shown.length - 1];
  // Scroll one row as each new line arrives, over four frames.
  const step = interpolate(frame, [latest.at, latest.at + 4], [0, 1], clamp);
  const over = Math.max(0, shown.length - ROWS);
  const scroll = shown.length > ROWS ? over - 1 + step : 0;
  return (
    <div
      style={{
        position: "absolute",
        top: TERM_TOP,
        left: LEFT,
        width: WIDTH,
        height: TERM_H,
        borderRadius: 16,
        background: "#0A0B0D",
        border: "1px solid rgba(233,228,216,0.12)",
        overflow: "hidden",
        fontFamily: theme.monoFamily,
        // Code, not typography: `>=` has to stay two characters.
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
        <span>~/shop</span>
        <span>{CONDITIONS}</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: HEADER + 10,
          left: 22,
          right: 22,
          height: ROWS * LH,
          overflow: "hidden",
        }}
      >
        {shown.map((l, i) => {
          const y = (i - scroll) * LH;
          if (y < -LH || y > ROWS * LH) return null;
          // What is already on screen at frame 0 does not fade in.
          const fade =
            l.at === 0
              ? 1
              : interpolate(frame, [l.at, l.at + 3], [0, 1], clamp);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: y,
                left: 0,
                right: 0,
                height: LH,
                lineHeight: `${LH}px`,
                fontSize: SIZE,
                whiteSpace: "pre",
                overflow: "hidden",
                opacity: fade,
              }}
            >
              {paint(l, frame)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
