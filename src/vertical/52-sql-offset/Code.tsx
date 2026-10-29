import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { PAGE, RUN, TABLE_ROWS } from "./measurements";
import { KEYSET_SQL, OFFSET_SQL } from "./snippets";

/**
 * The query, one clause a line, as `scripts/measure-sql-offset.mjs` runs
 * it, with the line that is running lit while the wall shows it: take 1
 * OFFSET while the crates are dumped, then LIMIT while the page comes
 * out; take 2 WHERE, in orange, while the index finds the page, then LIMIT.
 */

export const CODE_TOP = 404;
export const CODE_H = 190;
const LEFT = 96;
const WIDTH = 888;
const HEADER = 36;
const LH = 34;
const C = theme.colors;
/** Page 1,001: the page after the first 100,000 orders. */
export const PAGE_NO = (RUN.hero.offset / PAGE + 1).toLocaleString("en-US");

/** The line running on frame f, or -1. */
export const runningLine = (f: number) => {
  if (f < B.FIRST) return -1;
  if (f < B.PAGE_OUT) return 2; // OFFSET
  if (f < B.TAKE_2) return 3; // LIMIT
  if (f < B.HOP_1 - 4) return -1; // winding back
  if (f < B.PAGE_OUT_2) return 1; // WHERE
  if (f < B.VERDICT) return 3; // LIMIT
  return -1;
};

export const Code: React.FC<{ frame: number }> = ({ frame: f }) => {
  const take2 = f >= B.TAKE_2;
  const lines = take2 ? KEYSET_SQL : OFFSET_SQL;
  const on = runningLine(f);
  const swap = interpolate(f, [B.TAKE_2, B.TAKE_2 + 8], [0, 1], clamp);
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
          padding: "0 20px",
          borderBottom: "1px solid rgba(233,228,216,0.08)",
          fontSize: 17,
          letterSpacing: "0.04em",
          color: C.grayDark,
        }}
      >
        <span>
          page {PAGE_NO} · {take2 ? "keyset" : "OFFSET"}
        </span>
        <span>
          {RUN.postgres} · {TABLE_ROWS.toLocaleString("en-US")} orders
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: HEADER + 8,
          left: 10,
          right: 10,
          opacity: take2 ? swap : 1,
        }}
      >
        {lines.map((t, i) => {
          const lit = i === on;
          const where = take2 && i === 1;
          return (
            <div
              key={i}
              style={{
                height: LH,
                lineHeight: `${LH}px`,
                padding: "0 12px",
                borderRadius: 6,
                fontSize: 25,
                whiteSpace: "pre",
                color: where ? ACCENT : lit ? C.chalk : C.grayLight,
                fontWeight: lit || where ? 700 : 400,
                background: lit
                  ? where
                    ? "rgba(255,122,51,0.16)"
                    : "rgba(233,228,216,0.1)"
                  : "transparent",
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
    </div>
  );
};
