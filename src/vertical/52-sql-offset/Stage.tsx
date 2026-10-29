import { useEffect, useState } from "react";
import {
  Img,
  OffthreadVideo,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
} from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { PAGE, RUN, TABLE_ROWS } from "./measurements";
import {
  CRATE_ORDERS,
  PAGE_CRATE,
  firstId,
  rowOf,
  rowsRead1,
  COLS,
} from "./wall";

/**
 * The wall of crates, rendered in Blender by `scripts/blender/offset/render.sh`,
 * with what the reel draws over it: the clause running and the rows read
 * so far, as Postgres reported them; what one crate holds, while the first
 * is opened; the page, named where it waits; in take 2 the index's two
 * looks, the row's sign and then the crate's label; and at the end both
 * runs side by side.
 */

export const SCENE_TOP = 610;
export const SCENE_H = 640;
const WIDTH = 1080;
const C = theme.colors;
const n = (x: number) => x.toLocaleString("en-US");

/**
 * Per frame, as fractions of the frame: the first crate's label (x, y);
 * the page's crate front (x0, y0, x1, y1); its row's sign (x0, y0, x1, y1);
 * the top of the page's folder (x, y). Written by `wall.py`.
 */
type Track = number[][];

const useTrack = () => {
  const [track, setTrack] = useState<Track | null>(null);
  const [handle] = useState(() => delayRender("vr52 track"));
  useEffect(() => {
    fetch(staticFile("vr52/track.json"))
      .then((r) => r.json())
      .then((t: Track) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

const px = (x: number) => x * WIDTH;
const py = (y: number) => y * SCENE_H;

const Chip: React.FC<{
  label: string;
  value: string;
  right?: boolean;
  accent?: boolean;
  opacity?: number;
  under?: string;
}> = ({ label, value, right, accent, opacity = 1, under }) => (
  <div
    style={{
      position: "absolute",
      top: 14,
      ...(right ? { right: 56 } : { left: 56 }),
      padding: "6px 14px",
      borderRadius: 8,
      background: "rgba(10,11,13,0.84)",
      fontFamily: theme.monoFamily,
      color: C.chalk,
      whiteSpace: "nowrap",
      opacity,
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
      <span
        style={{
          fontSize: 20,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.grayLight,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 38,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: accent ? ACCENT : C.chalk,
        }}
      >
        {value}
      </span>
    </div>
    {under ? (
      <div
        style={{
          fontSize: 22,
          textAlign: "right",
          color: C.grayLight,
          marginTop: -2,
        }}
      >
        {under}
      </div>
    ) : null}
  </div>
);

const Tag: React.FC<{
  x: number;
  y: number;
  opacity: number;
  top: string;
  bottom?: string;
  accent?: boolean;
  below?: boolean;
}> = ({ x, y, opacity, top, bottom, accent, below }) =>
  opacity <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: x - 150,
        top: below ? y + 8 : y - 8,
        width: 300,
        transform: below ? undefined : "translateY(-100%)",
        textAlign: "center",
        opacity,
        fontFamily: theme.monoFamily,
        lineHeight: 1.15,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "5px 12px",
          borderRadius: 8,
          background: "rgba(10,11,13,0.9)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: accent ? ACCENT : C.chalk,
          }}
        >
          {top}
        </div>
        {bottom ? (
          <div style={{ fontSize: 18, color: C.grayLight }}>{bottom}</div>
        ) : null}
      </div>
    </div>
  );

/** An orange box drawn round part of the scene: one look in the index. */
const Look: React.FC<{
  rect: number[];
  opacity: number;
  pad: number;
  text?: string;
}> = ({ rect, opacity, pad, text }) =>
  opacity <= 0 ? null : (
    <div
      style={{
        position: "absolute",
        left: px(rect[0]) - pad,
        top: py(rect[1]) - pad,
        width: px(rect[2]) - px(rect[0]) + 2 * pad,
        height: py(rect[3]) - py(rect[1]) + 2 * pad,
        border: `4px solid ${ACCENT}`,
        borderRadius: 8,
        opacity,
        transform: `scale(${1.25 - 0.25 * opacity})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: text ? "rgba(10,11,13,0.88)" : "transparent",
        fontFamily: theme.monoFamily,
        fontSize: 22,
        fontWeight: 700,
        color: C.chalk,
      }}
    >
      {text}
    </div>
  );

/** Rows read on frame f, as the chip shows it. */
export const rowsRead = (f: number) =>
  f < B.TAKE_2 ? rowsRead1(f) : f >= B.PAGE_OPEN_2 ? RUN.hero.keysetRead : 0;

/** The clause running on frame f, for the chip. */
const running = (f: number) => {
  if (f < B.PAGE_OUT) return `OFFSET ${RUN.hero.offset}`;
  if (f < B.TAKE_2) return `LIMIT ${PAGE}`;
  if (f < B.PAGE_OUT_2) return `WHERE id > ${RUN.hero.offset}`;
  return `LIMIT ${PAGE}`;
};

/** Both runs, side by side, over the full wall at the end. */
const Verdict: React.FC<{ frame: number }> = ({ frame }) => {
  const a = interpolate(frame, [B.VERDICT, B.VERDICT + 8], [0, 1], clamp);
  if (a <= 0) return null;
  const row = (label: string, rows: number, ms: number, accent: boolean) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 28,
        color: accent ? ACCENT : C.grayLight,
        fontWeight: accent ? 700 : 500,
      }}
    >
      <span>{label}</span>
      <span>
        {n(rows)} rows · {ms} ms
      </span>
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        width: 760,
        top: 110,
        padding: "14px 22px 12px",
        borderRadius: 14,
        background: "rgba(10,11,13,0.92)",
        border: "1px solid rgba(233,228,216,0.12)",
        fontFamily: theme.monoFamily,
        fontSize: 26,
        lineHeight: 1.5,
        opacity: a,
        transform: `translateY(${(1 - a) * 10}px)`,
      }}
    >
      {row(
        `OFFSET ${RUN.hero.offset}`,
        RUN.hero.offsetRead,
        RUN.hero.offsetMs,
        false,
      )}
      {row(
        `WHERE id > ${RUN.hero.offset}`,
        RUN.hero.keysetRead,
        RUN.hero.keysetMs,
        true,
      )}
      <div style={{ fontSize: 18, color: C.grayDark, marginTop: 4 }}>
        {RUN.postgres} · {n(TABLE_ROWS)} orders · median of 51 runs
      </div>
    </div>
  );
};

export const Stage: React.FC<{ frame: number; still?: string }> = ({
  frame: f,
  still,
}) => {
  const track = useTrack();
  const t = track
    ? track[Math.max(0, Math.min(track.length - 1, Math.round(f)))]
    : null;
  const take2 = f >= B.TAKE_2;
  const rewinding = take2 && f < B.HOP_1 - 4;
  const msFrom = take2 ? B.PAGE_OPEN_2 + 6 : B.PAGE_OPEN + 8;
  const ms =
    f >= msFrom
      ? `${take2 ? RUN.hero.keysetMs : RUN.hero.offsetMs} ms`
      : undefined;
  const read = rowsRead(f);
  const first = interpolate(f, [0, 2, 16, 22], [0, 1, 1, 0], clamp);
  const page = take2
    ? interpolate(
        f,
        [B.REWOUND, B.REWOUND + 6, B.FLY_2, B.FLY_2 + 6],
        [0, 1, 1, 0],
        clamp,
      )
    : interpolate(f, [4, 10, B.FLY, B.FLY + 6], [0, 1, 1, 0], clamp);
  const look1 = interpolate(
    f,
    [B.HOP_1, B.HOP_1 + 5, B.FLY_2, B.FLY_2 + 6],
    [0, 1, 1, 0],
    clamp,
  );
  const look2 = interpolate(
    f,
    [B.HOP_2, B.HOP_2 + 5, B.FLY_2, B.FLY_2 + 6],
    [0, 1, 1, 0],
    clamp,
  );
  const reach = interpolate(f, [B.HOP_1 + 3, B.HOP_2], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: SCENE_TOP,
        left: 0,
        width: WIDTH,
        height: SCENE_H,
        overflow: "hidden",
        background: C.black,
      }}
    >
      {still ? (
        <Img
          src={staticFile(still)}
          style={{ width: WIDTH, height: SCENE_H }}
        />
      ) : (
        <OffthreadVideo
          src={staticFile("vr52/wall.mp4")}
          muted
          style={{ width: WIDTH, height: SCENE_H }}
        />
      )}
      {t ? (
        <>
          <Tag
            x={px(t[0])}
            y={py(t[1]) + 14}
            below
            opacity={first}
            top={`${n(CRATE_ORDERS)} orders`}
            bottom={`ids 1–${n(CRATE_ORDERS)}`}
          />
          <Tag
            x={px(t[10])}
            y={py(t[11])}
            opacity={page}
            accent
            top={`page ${n(RUN.hero.offset / PAGE + 1)}`}
            bottom={`ids ${n(RUN.hero.offset + 1)}–${n(RUN.hero.offset + PAGE)}`}
          />
          {look1 > 0 ? (
            <div
              style={{
                position: "absolute",
                left: px(t[8]) + 10,
                top: py((t[7] + t[9]) / 2) - 2,
                width: Math.max(0, (px(t[2]) - px(t[8]) - 18) * reach),
                height: 4,
                background: ACCENT,
                opacity: look1,
              }}
            />
          ) : null}
          <Look
            rect={t.slice(6, 10)}
            pad={6}
            opacity={look1}
            text={n(firstId(rowOf(PAGE_CRATE) * COLS))}
          />
          <Look rect={t.slice(2, 6)} pad={4} opacity={look2} />
        </>
      ) : null}
      <Chip
        label="running"
        value={running(f)}
        accent={take2 && f < B.PAGE_OUT_2}
        opacity={rewinding || f >= B.VERDICT ? 0 : 1}
      />
      <Chip
        right
        label="rows read"
        value={n(read)}
        accent={take2 && read > 0}
        opacity={rewinding ? 0 : 1}
        under={ms}
      />
      <Verdict frame={f} />
    </div>
  );
};
