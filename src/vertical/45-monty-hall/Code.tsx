import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import {
  BOARD_FROM,
  HOST_OPENS,
  PULL,
  REVEAL,
  TALLY_FROM,
  TALLY_TO,
} from "./beats";
import { tallyAt } from "./Stage";
import { CODE, CONDITIONS, RUN } from "./measurements";

/**
 * The loop that played the 10,000 games, exactly as it ran. While the
 * first game plays, the line doing each part of it lights up. When the
 * run starts, the panel turns into what the loop printed: the wins for
 * each choice at full size, counting with the game it is on, over a bar
 * split between them with a mark where 50/50 would sit.
 */

export const CODE_TOP = 420;
export const CODE_H = 282;
const LEFT = 96;
const WIDTH = 888;
const HEADER = 38;
const LH = 31;
const C = theme.colors;

/** Which lines are lit on a frame. */
const lit = (f: number): number[] => {
  if (f < HOST_OPENS) return [2];
  if (f < HOST_OPENS + 36) return [3];
  if (f < REVEAL) return [4];
  if (f < PULL) return [5, 6];
  if (f >= TALLY_FROM && f < TALLY_TO + 6) return [0];
  return [];
};

export const gameAt = (f: number) =>
  Math.round(interpolate(f, [TALLY_FROM, TALLY_TO], [1, RUN.games], clamp));

const paint = (text: string) => {
  const hash = text.indexOf("#");
  const code = hash >= 0 ? text.slice(0, hash) : text;
  const note = hash >= 0 ? text.slice(hash) : "";
  const parts = code.split(/\b(for|in)\b/);
  return (
    <>
      {parts.map((p, i) =>
        p === "for" || p === "in" ? (
          <span key={i} style={{ fontWeight: 700 }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
      <span style={{ color: C.grayDark }}>{note}</span>
    </>
  );
};

const BOARD_IN = 12;

const Score: React.FC<{
  label: string;
  value: number;
  accent?: boolean;
}> = ({ label, value, accent }) => (
  <div style={{ flex: 1, textAlign: "center" }}>
    <div
      style={{
        fontFamily: theme.monoFamily,
        fontSize: 24,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: accent ? ACCENT : C.grayLight,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontFamily: theme.fontFamily,
        fontSize: 104,
        lineHeight: "112px",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        fontVariantNumeric: "tabular-nums",
        color: accent ? ACCENT : C.chalk,
      }}
    >
      {value.toLocaleString("en-US")}
    </div>
  </div>
);

const Board: React.FC<{ frame: number }> = ({ frame }) => {
  const [stick, sw] = tallyAt(frame);
  const share = stick + sw > 0 ? stick / (stick + sw) : 0;
  const BAR = WIDTH - 88;
  return (
    <div
      style={{ position: "absolute", top: HEADER + 16, left: 44, right: 44 }}
    >
      <div style={{ display: "flex" }}>
        <Score label="stick won" value={stick} />
        <Score label="switch won" value={sw} accent />
      </div>
      <div
        style={{
          position: "relative",
          marginTop: 16,
          height: 22,
          width: BAR,
          borderRadius: 6,
          overflow: "hidden",
          background: ACCENT,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: share * BAR,
            background: C.chalk,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: BAR / 2 - 2,
          top: 152,
          width: 4,
          height: 36,
          background: C.black,
          boxShadow: "0 0 0 1px rgba(233,228,216,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: BAR / 2 - 60,
          width: 120,
          top: 190,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          fontSize: 18,
          letterSpacing: "0.06em",
          color: C.grayDark,
        }}
      >
        50/50
      </div>
    </div>
  );
};

export const Code: React.FC<{ frame: number }> = ({ frame }) => {
  const on = lit(frame);
  const counting = frame >= TALLY_FROM;
  // The code goes out first, then the score comes in, so the two never
  // sit on top of each other.
  const code = interpolate(
    frame,
    [BOARD_FROM, BOARD_FROM + BOARD_IN / 2],
    [1, 0],
    clamp,
  );
  const board = interpolate(
    frame,
    [BOARD_FROM + BOARD_IN / 2, BOARD_FROM + BOARD_IN],
    [0, 1],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        top: CODE_TOP,
        left: LEFT,
        width: WIDTH,
        height: CODE_H,
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
        <span>
          monty.py
          {counting ? (
            <span style={{ color: C.chalk, marginLeft: 14 }}>
              game {gameAt(frame).toLocaleString("en-US")} of{" "}
              {RUN.games.toLocaleString("en-US")}
            </span>
          ) : null}
        </span>
        <span>{CONDITIONS}</span>
      </div>
      <div
        style={{
          position: "absolute",
          top: HEADER + 12,
          left: 14,
          right: 14,
          opacity: code,
        }}
      >
        {CODE.map((text, i) => {
          const active = on.includes(i);
          const isSwitch = text.trimStart().startsWith("switch");
          return (
            <div
              key={i}
              style={{
                height: LH,
                lineHeight: `${LH}px`,
                padding: "0 10px",
                borderRadius: 7,
                fontSize: 23,
                whiteSpace: "pre",
                color: active ? (isSwitch ? ACCENT : C.chalk) : C.grayLight,
                opacity: active || on.length === 0 ? 1 : 0.62,
                background: active
                  ? isSwitch
                    ? "rgba(255,122,51,0.14)"
                    : "rgba(233,228,216,0.09)"
                  : "transparent",
              }}
            >
              {paint(text)}
            </div>
          );
        })}
      </div>
      {board > 0 ? (
        <div style={{ opacity: board }}>
          <Board frame={frame} />
        </div>
      ) : null}
    </div>
  );
};
