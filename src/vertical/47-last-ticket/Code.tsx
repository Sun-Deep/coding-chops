import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { CONDITIONS } from "./measurements";

/**
 * Each buyer's transaction, simplified from the session in
 * `scripts/measure-last-ticket.mjs` (which uses psql's \gset and \if to
 * act on the read). In take 2 the read gains FOR UPDATE, in orange, the
 * one thing that changes. The line running lights up.
 */

export const CODE_TOP = 420;
export const CODE_H = 282;
const LEFT = 96;
const WIDTH = 888;
const HEADER = 38;
const LH = 36;
const C = theme.colors;

const LINES = [
  "BEGIN;",
  "SELECT seats_left FROM shows WHERE id = 2",
  "-- 50 ms: take the payment",
  "UPDATE shows SET seats_left = seats_left - 1;",
  "INSERT INTO tickets VALUES (2, 'A');",
  "COMMIT;",
];

const litLine = (f: number) => {
  const t2 = f >= B.TAKE_2;
  const tap = t2 ? B.TAP_2 : B.TAP_1;
  if (f < tap) return -1;
  if (f < tap + 6) return 0;
  if (!t2) {
    if (f < B.READ_1 + 22) return 1;
    if (f < B.TICKET_1 - 4) return 2;
    if (f < B.TICKET_1 + 6) return 3;
    if (f < B.TICKET_1 + 16) return 4;
    if (f < B.TICKET_1 + 30) return 5;
    return -1;
  }
  if (f < B.TICKET_2 - 8) return 1;
  if (f < B.TICKET_2) return 2;
  if (f < B.TICKET_2 + 10) return 3;
  if (f < B.TICKET_2 + 18) return 4;
  if (f < B.RELEASE_2 + 6) return 5;
  return -1;
};

export const Code: React.FC<{ frame: number }> = ({ frame }) => {
  const t2 = frame >= B.TAKE_2;
  const lock = interpolate(frame, [B.TAKE_2 + 2, B.TAKE_2 + 10], [0, 1], clamp);
  const lit = litLine(frame);
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
        <span>each buyer, at the same moment</span>
        <span>{CONDITIONS}</span>
      </div>
      <div
        style={{ position: "absolute", top: HEADER + 14, left: 12, right: 12 }}
      >
        {LINES.map((text, i) => (
          <div
            key={i}
            style={{
              height: LH,
              lineHeight: `${LH}px`,
              padding: "0 12px",
              borderRadius: 7,
              fontSize: 22,
              whiteSpace: "pre",
              color: i === 2 ? C.grayDark : lit === i ? C.chalk : C.grayLight,
              fontWeight: lit === i ? 700 : 500,
              background: lit === i ? "rgba(233,228,216,0.09)" : "transparent",
            }}
          >
            {text}
            {i === 1 && t2 ? (
              <span style={{ color: ACCENT, fontWeight: 800, opacity: lock }}>
                {" FOR UPDATE"}
              </span>
            ) : null}
            {i === 1 ? ";" : ""}
          </div>
        ))}
      </div>
    </div>
  );
};
