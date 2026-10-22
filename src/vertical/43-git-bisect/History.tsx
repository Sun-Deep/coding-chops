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
import { CHECKS, FOUND_AT, RUN_FROM } from "./beats";
import { RUN } from "./measurements";
import { LINES, TESTED } from "./transcript";

/**
 * The 1,000 commits, rendered in Blender by
 * `scripts/blender/bisect/render.sh`: a field of cards, oldest at the back,
 * HEAD at the front left. Chalk cards are untested, a bright chalk card
 * passed, an orange card failed. What git rules out goes over flat.
 *
 * The labels ride on the cards they name, from where Blender says each
 * card is on screen.
 */

export const SCENE_TOP = 716;
export const SCENE_H = 566;
const WIDTH = 1080;
/** Renders are 1620 x 850; at full width they are 566.7 tall. */
const VIDEO_H = (850 / 1620) * WIDTH;
const CROP = (VIDEO_H - SCENE_H) / 2;

type Point = [number, number, number] | null;
type Row = { h: Point; b: Point; s: Point; c: Point };

const useTrack = () => {
  const [track, setTrack] = useState<Row[] | null>(null);
  const [handle] = useState(() => delayRender("vr43 track"));
  useEffect(() => {
    fetch(staticFile("vr43/track.json"))
      .then((r) => r.json())
      .then((t: Row[]) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

type Tone = "accent" | "chalk" | "outline";

const Tag: React.FC<{
  at: Point;
  tone: Tone;
  opacity: number;
  children: string;
}> = ({ at, tone, opacity, children }) => {
  if (!at || at[2] !== 1 || opacity <= 0) return null;
  const x = at[0] * WIDTH;
  const y = at[1] * VIDEO_H - CROP;
  // A label that would be cut by the top of the scene is left off.
  if (y - 52 < 8) return null;
  const w = children.length * 12.6 + 26;
  // Clear of the like and share buttons below y 1000.
  const right = SCENE_TOP + y - 40 > 1000 ? 920 : 1040;
  const left = Math.max(24, Math.min(x - w / 2, right - w));
  const fill =
    tone === "accent" ? ACCENT : tone === "chalk" ? theme.colors.chalk : "none";
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: y - 52,
        width: w,
        opacity,
      }}
    >
      <div
        style={{
          height: 34,
          lineHeight: "28px",
          borderRadius: 7,
          textAlign: "center",
          whiteSpace: "nowrap",
          background: fill === "none" ? "rgba(10,11,13,0.86)" : fill,
          border: `2px solid ${fill === "none" ? theme.colors.chalk : fill}`,
          color: fill === "none" ? theme.colors.chalk : ON_ACCENT,
          fontFamily: theme.monoFamily,
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: "0.02em",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: 34,
          left: Math.max(10, Math.min(w - 24, x - left - 7)),
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: `9px solid ${fill === "none" ? theme.colors.chalk : fill}`,
        }}
      />
    </div>
  );
};

const Chip: React.FC<{ label: string; value: string; right?: boolean }> = ({
  label,
  value,
  right,
}) => (
  <div
    style={{
      position: "absolute",
      top: 14,
      ...(right ? { right: 56 } : { left: 56 }),
      padding: "6px 14px",
      borderRadius: 8,
      background: "rgba(10,11,13,0.84)",
      fontFamily: theme.monoFamily,
      color: theme.colors.chalk,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "baseline",
      gap: 12,
    }}
  >
    <span
      style={{
        fontSize: 18,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: theme.colors.grayDark,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 32,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value}
    </span>
  </div>
);

/** The commit under test on `frame`, from when git checks it out. */
const current = (frame: number) => {
  let c = null;
  for (const x of CHECKS) if (frame >= x.pickAt) c = x;
  return c;
};

export const History: React.FC<{ frame: number; still?: string }> = ({
  frame,
  still,
}) => {
  const track = useTrack();
  const f = Math.max(0, Math.min(419, Math.round(frame)));
  const row = track ? track[f] : null;
  const checks = CHECKS.filter((c) => frame >= c.resultAt).length;
  const lefts = LINES.filter((l) => l.kind === "left" && l.at <= frame);
  const left = lefts[lefts.length - 1];
  const c = current(frame);
  const intro = interpolate(
    frame,
    [RUN_FROM + 4, RUN_FROM + 12],
    [1, 0],
    clamp,
  );
  const testOpacity =
    c && frame < FOUND_AT
      ? interpolate(frame, [c.pickAt, c.pickAt + 4], [0, 1], clamp)
      : 0;
  return (
    <div
      style={{
        position: "absolute",
        top: SCENE_TOP,
        left: 0,
        width: WIDTH,
        height: SCENE_H,
        overflow: "hidden",
        background: theme.colors.black,
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
          src={staticFile("vr43/history.mp4")}
          muted
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      )}
      {row ? (
        <>
          <Tag at={row.h} tone="accent" opacity={intro}>
            HEAD · broken
          </Tag>
          <Tag at={row.b} tone="chalk" opacity={intro}>
            v1.0 · worked
          </Tag>
          {c ? (
            <Tag
              at={row.s}
              tone={
                frame < c.resultAt
                  ? "outline"
                  : c.result === "good"
                    ? "chalk"
                    : "accent"
              }
              opacity={testOpacity}
            >
              {`${TESTED[c.k - 1]}${
                frame < c.resultAt ? "" : c.result === "good" ? " ok" : " FAIL"
              }`}
            </Tag>
          ) : null}
          <Tag
            at={row.c}
            tone="accent"
            opacity={interpolate(
              frame,
              [FOUND_AT + 6, FOUND_AT + 12],
              [0, 1],
              clamp,
            )}
          >
            {`${RUN.hash} · first bad commit`}
          </Tag>
        </>
      ) : null}
      <Chip label="checks" value={String(checks)} />
      {left ? (
        <Chip
          right
          label="left to test"
          value={left.text.match(/(\d+) revision/)![1]}
        />
      ) : null}
    </div>
  );
};
