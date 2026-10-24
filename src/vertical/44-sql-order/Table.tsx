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
import { PROOF_FROM, STAGES, stageAt } from "./beats";
import { RUN } from "./measurements";

/**
 * The 1,000 orders as parcels in a mailroom, rendered in Blender by
 * `scripts/blender/sql/render.sh`, with the step and the row count
 * Postgres reported for it, the end of the table named while the unpaid
 * parcels leave by it, the five rows the query returns named at the foot
 * of their coin stacks, and at the end the two lines the order explains,
 * as psql answered them.
 */

export const SCENE_TOP = 706;
export const SCENE_H = 566;
const WIDTH = 1080;
const VIDEO_H = (850 / 1620) * WIDTH;
const CROP = (VIDEO_H - SCENE_H) / 2;
const C = theme.colors;

/** What comes out of each step, from EXPLAIN ANALYZE. */
const COUNTS: readonly [string, number][] = [
  ["rows", RUN.from],
  ["rows", RUN.where],
  ["groups", RUN.groups],
  ["groups", RUN.having],
  ["rows", RUN.having],
  ["rows", RUN.having],
  ["rows", RUN.limit],
];
/** Frames after a step starts that its count changes: when it has done it. */
const SETTLE = [0, 28, 44, 24, 20, 30, 18];

type Point = [number, number, number];

const useTrack = () => {
  const [track, setTrack] = useState<Point[][] | null>(null);
  const [handle] = useState(() => delayRender("vr44 track"));
  useEffect(() => {
    fetch(staticFile("vr44/track.json"))
      .then((r) => r.json())
      .then((t: Point[][]) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

const Chip: React.FC<{
  label: string;
  value: string;
  right?: boolean;
  accent?: boolean;
}> = ({ label, value, right, accent }) => (
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
      display: "flex",
      alignItems: "baseline",
      gap: 12,
    }}
  >
    <span
      style={{
        fontSize: 22,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: C.grayLight,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 44,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: accent ? ACCENT : C.chalk,
      }}
    >
      {value}
    </span>
  </div>
);

const dollars = (cents: number) =>
  `$${Math.round(cents / 100).toLocaleString("en-US")}`;

const Tag: React.FC<{
  at: Point;
  name: string;
  total: number;
  opacity: number;
}> = ({ at, name, total, opacity }) => {
  if (at[2] !== 1 || opacity <= 0) return null;
  const x = at[0] * WIDTH;
  const y = at[1] * VIDEO_H - CROP;
  if (y + 52 > SCENE_H) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 45,
        top: y + 6,
        width: 90,
        opacity,
        textAlign: "center",
        fontFamily: theme.monoFamily,
        lineHeight: 1.15,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "3px 8px",
          borderRadius: 7,
          background: "rgba(10,11,13,0.9)",
          color: C.chalk,
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: 19, fontWeight: 700 }}>{name}</div>
        <div style={{ fontSize: 17, fontWeight: 600, color: ACCENT }}>
          {dollars(total)}
        </div>
      </div>
    </div>
  );
};

/** The two lines the order explains, as psql answered them. */
const Proof: React.FC<{ frame: number }> = ({ frame }) => {
  const a = interpolate(frame, [PROOF_FROM, PROOF_FROM + 6], [0, 1], clamp);
  const b = interpolate(
    frame,
    [PROOF_FROM + 16, PROOF_FROM + 22],
    [0, 1],
    clamp,
  );
  if (a <= 0) return null;
  const line = (text: string, color: string, weight = 500) => (
    <div style={{ fontSize: 23, lineHeight: 1.28, color, fontWeight: weight }}>
      {text}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        right: WIDTH - 920,
        top: 392,
        padding: "10px 18px 12px",
        borderRadius: 14,
        background: "rgba(10,11,13,0.92)",
        border: "1px solid rgba(233,228,216,0.12)",
        fontFamily: theme.monoFamily,
        fontVariantLigatures: "none",
        whiteSpace: "pre",
        opacity: a,
        transform: `translateY(${(1 - a) * 10}px)`,
      }}
    >
      {line("WHERE total > 500", C.chalk, 700)}
      {line(RUN.errorInWhere, C.grayLight)}
      <div style={{ opacity: b, marginTop: 8 }}>
        {line("ORDER BY total DESC", ACCENT, 700)}
        {line(
          `(${RUN.orderByRows} row${RUN.orderByRows === 1 ? "" : "s"})`,
          C.grayLight,
        )}
      </div>
    </div>
  );
};

export const Table: React.FC<{ frame: number; still?: string }> = ({
  frame,
  still,
}) => {
  const track = useTrack();
  const f = Math.max(0, Math.min(419, Math.round(frame)));
  const i = stageAt(frame);
  const settled = frame >= STAGES[i].at + SETTLE[i] ? i : Math.max(0, i - 1);
  const [unit, n] = COUNTS[settled];
  const LIMIT_AT = STAGES[6].at;
  const WHERE_AT = STAGES[1].at;
  const bin = interpolate(
    frame,
    [WHERE_AT + 4, WHERE_AT + 10, STAGES[2].at + 20, STAGES[2].at + 28],
    [0, 1, 1, 0],
    clamp,
  );
  const tags = interpolate(
    frame,
    [LIMIT_AT + 24, LIMIT_AT + 30],
    [0, 1],
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
          src={staticFile("vr44/table.mp4")}
          muted
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      )}
      {track
        ? track[f]
            .slice(0, RUN.top.length)
            .map((p, k) => (
              <Tag
                key={k}
                at={p}
                name={RUN.top[k].customer}
                total={RUN.top[k].total}
                opacity={tags}
              />
            ))
        : null}
      {track && bin > 0 && track[f][RUN.top.length][2] === 1 ? (
        <div
          style={{
            position: "absolute",
            left: track[f][RUN.top.length][0] * WIDTH - 80,
            top: track[f][RUN.top.length][1] * VIDEO_H - CROP - 44,
            width: 160,
            textAlign: "center",
            opacity: bin,
          }}
        >
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 7,
              background: "rgba(10,11,13,0.84)",
              fontFamily: theme.monoFamily,
              fontSize: 20,
              letterSpacing: "0.06em",
              color: C.grayLight,
            }}
          >
            UNPAID
          </span>
        </div>
      ) : null}
      <Chip
        label={`step ${i + 1}`}
        value={STAGES[i].clause}
        accent={STAGES[i].clause === "SELECT"}
      />
      <Chip right label={unit} value={n.toLocaleString("en-US")} />
      <Proof frame={frame} />
    </div>
  );
};
