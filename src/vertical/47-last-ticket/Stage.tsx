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
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import * as B from "./beats";
import { RUN, highest, lowest } from "./measurements";

/**
 * The cinema, rendered in Blender by `scripts/blender/ticket/render.sh`,
 * with what each buyer's transaction sees floating over their head, the
 * take and its query top left, and seats_left top right: 1, 0, then -1
 * when the seat is sold twice.
 */

export const SCENE_TOP = 706;
export const SCENE_H = 566;
const WIDTH = 1080;
const VIDEO_H = (850 / 1620) * WIDTH;
const CROP = (VIDEO_H - SCENE_H) / 2;
const C = theme.colors;

type Point = [number, number, number];

const useTrack = () => {
  const [track, setTrack] = useState<Point[][] | null>(null);
  const [handle] = useState(() => delayRender("vr47 track"));
  useEffect(() => {
    fetch(staticFile("vr47/track.json"))
      .then((r) => r.json())
      .then((t: Point[][]) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

type Tone = "chalk" | "outline" | "accent";

const Bubble: React.FC<{
  at: Point;
  tone: Tone;
  children: React.ReactNode;
}> = ({ at, tone, children }) => {
  if (at[2] !== 1) return null;
  const x = at[0] * WIDTH;
  const y = at[1] * VIDEO_H - CROP;
  const half = 150;
  const below = SCENE_TOP + y > 1000;
  const left = Math.max(
    20,
    Math.min(x - half, (below ? 920 : 1060) - 2 * half),
  );
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: Math.max(64, y - 54),
        width: 2 * half,
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: 8,
          background:
            tone === "outline"
              ? "rgba(10,11,13,0.88)"
              : tone === "accent"
                ? ACCENT
                : C.chalk,
          border: tone === "outline" ? `2px solid ${C.chalk}` : "none",
          color: tone === "outline" ? C.chalk : ON_ACCENT,
          fontFamily: theme.monoFamily,
          fontSize: 21,
          fontWeight: 700,
          whiteSpace: "nowrap",
          boxShadow: "0 2px 10px rgba(0,0,0,0.55)",
        }}
      >
        {children}
      </span>
    </div>
  );
};

type Say = [number, number, Tone, string];

/** What A's and B's transactions see, and when. */
const A_SAYS: Say[] = [
  [B.TAP_1, B.READ_1, "outline", "taps Buy"],
  [B.READ_1, B.TICKET_1, "outline", "reads: 1 left"],
  [B.TICKET_1, B.WALK_1 + 10, "chalk", "ticket: F12"],
  [B.TAP_2, B.LOCK_2, "outline", "taps Buy"],
  [B.LOCK_2, B.TICKET_2, "accent", "reads 1 · locks the row"],
  [B.TICKET_2, B.WALK_2 + 10, "chalk", "ticket: F12"],
];
const B_SAYS: Say[] = [
  [B.TAP_1, B.READ_1, "outline", "taps Buy"],
  [B.READ_1, B.TICKET_1, "outline", "reads: 1 left"],
  [B.TICKET_1, B.WALK_1 + 10, "chalk", "ticket: F12"],
  [B.SLUMP_1, B.TAKE_2, "outline", "ticket: F12 · seat taken"],
  [B.TAP_2, B.LOCK_2, "outline", "taps Buy"],
  [B.LOCK_2, B.RELEASE_2, "outline", "waiting for the lock…"],
  [B.RELEASE_2, B.SOLDOUT_2 + 8, "outline", "reads: 0 left"],
  [B.SOLDOUT_2 + 8, 420, "chalk", "sold out"],
];
const said = (says: Say[], f: number) => says.find(([a, b]) => f >= a && f < b);

export const seatsLeft = (f: number) => {
  if (f < B.TAKE_2) {
    if (f < B.TICKET_1) return 1;
    if (f < B.TICKET_1 + 4) return 0;
    return -1;
  }
  return f < B.TICKET_2 ? 1 : 0;
};

const Chip: React.FC<{ right?: boolean; children: React.ReactNode }> = ({
  right,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      top: 14,
      ...(right ? { right: 56 } : { left: 56 }),
      padding: "6px 14px",
      borderRadius: 8,
      background: "rgba(10,11,13,0.86)",
      fontFamily: theme.monoFamily,
      color: C.chalk,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "baseline",
      gap: 12,
    }}
  >
    {children}
  </div>
);

export const Stage: React.FC<{ frame: number; still?: string }> = ({
  frame,
  still,
}) => {
  const track = useTrack();
  const f = Math.max(0, Math.min(419, Math.round(frame)));
  const row = track ? track[f] : null;
  const a = said(A_SAYS, frame);
  const b = said(B_SAYS, frame);
  const t2 = frame >= B.TAKE_2;
  const left = seatsLeft(frame);
  const verdict = frame >= B.VERDICT_FROM;
  const cut = interpolate(
    frame,
    [B.TAKE_2 - 3, B.TAKE_2, B.TAKE_2 + 3],
    [0, 1, 0],
    clamp,
  );
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
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      ) : (
        <OffthreadVideo
          src={staticFile("vr47/cinema.mp4")}
          muted
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      )}
      {row && a && !verdict ? (
        <Bubble at={row[0]} tone={a[2]}>
          {a[3]}
        </Bubble>
      ) : null}
      {row && b && !verdict ? (
        <Bubble at={row[1]} tone={b[2]}>
          {b[3]}
        </Bubble>
      ) : null}
      <Chip>
        <span
          style={{ fontSize: 18, letterSpacing: "0.1em", color: C.grayDark }}
        >
          {t2 ? "TAKE 2" : "TAKE 1"}
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: t2 ? ACCENT : C.chalk,
          }}
        >
          {t2 ? "FOR UPDATE" : "plain SELECT"}
        </span>
      </Chip>
      <Chip right>
        {verdict ? (
          <>
            <span
              style={{
                fontSize: 18,
                letterSpacing: "0.1em",
                color: C.grayDark,
              }}
            >
              SOLD TWICE
            </span>
            <span style={{ fontSize: 24, fontWeight: 700 }}>
              {lowest}–{highest} / {RUN.races.toLocaleString("en-US")}
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                fontSize: 18,
                letterSpacing: "0.1em",
                color: C.grayDark,
              }}
            >
              SEATS_LEFT
            </span>
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {left}
            </span>
          </>
        )}
      </Chip>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          opacity: cut,
        }}
      />
    </div>
  );
};
