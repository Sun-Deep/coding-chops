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
import {
  BOARD_FROM,
  CAR_WINS,
  PULL,
  REVEAL,
  TALLY_FROM,
  TALLY_TO,
} from "./beats";
import { RUN } from "./measurements";

/**
 * The first game close up, then the studio, rendered in Blender by
 * `scripts/blender/monty/render.sh`. Over it: the door you picked, the
 * first game's score in the corners, the name on each glass case, the
 * 50/50 line between them, and what one car stands for.
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
  const [handle] = useState(() => delayRender("vr45 track"));
  useEffect(() => {
    fetch(staticFile("vr45/track.json"))
      .then((r) => r.json())
      .then((t: Point[][]) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

/**
 * Wins so far for each choice. The first game alone, then the run.
 * `scripts/blender/monty/studio.py` drops its cars by the same rule.
 */
export const tallyAt = (f: number): [number, number] => {
  if (f < REVEAL + 8) return [0, 0];
  if (f < TALLY_FROM) return [0, 1];
  const i = Math.floor(
    interpolate(f, [TALLY_FROM, TALLY_TO], [0, RUN.running.length], clamp),
  );
  if (i === 0) return [0, 1];
  const [stick, sw] = RUN.running[i - 1];
  return [stick, sw];
};

const Chip: React.FC<{
  label: string;
  value: number;
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
        fontSize: 18,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: C.grayDark,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 32,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: accent ? ACCENT : C.chalk,
      }}
    >
      {value.toLocaleString("en-US")}
    </span>
  </div>
);

/** The frames a car lands in each case: when its count passes 200 more. */
export const landings = () => {
  const out: [number[], number[]] = [[], []];
  for (let f = TALLY_FROM; f < 420; f++) {
    const t = tallyAt(f);
    for (const side of [0, 1] as const)
      while (out[side].length < Math.floor(t[side] / CAR_WINS))
        out[side].push(f);
  }
  return out;
};

const Tag: React.FC<{
  at: Point;
  opacity: number;
  fill: string;
  ink: string;
  children: React.ReactNode;
}> = ({ at, opacity, fill, ink, children }) => {
  if (at[2] !== 1 || opacity <= 0) return null;
  const x = at[0] * WIDTH;
  const y = at[1] * VIDEO_H - CROP;
  if (y - 50 < 8) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 150,
        top: y - 50,
        width: 300,
        textAlign: "center",
        opacity,
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: 7,
          background: fill,
          color: ink,
          fontFamily: theme.monoFamily,
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}
      >
        {children}
      </span>
    </div>
  );
};

export const Stage: React.FC<{
  frame: number;
  still?: string;
  /** The cover states the totals itself, so it leaves the tallies off. */
  tallies?: boolean;
}> = ({ frame, still, tallies = true }) => {
  const track = useTrack();
  const f = Math.max(0, Math.min(419, Math.round(frame)));
  const row = track ? track[f] : null;
  const [stick, sw] = tallyAt(frame);
  const you = interpolate(
    frame,
    [4, 10, PULL - 6, PULL + 4],
    [0, 1, 1, 0],
    clamp,
  );
  const names = interpolate(frame, [PULL + 4, PULL + 10], [0, 1], clamp);
  const key = interpolate(frame, [TALLY_FROM, TALLY_FROM + 6], [0, 1], clamp);
  // The first game's score sits in the corners; from the run on, the code
  // panel carries it at full size.
  const chips = interpolate(
    frame,
    [REVEAL + 8, REVEAL + 14, BOARD_FROM, BOARD_FROM + 8],
    [0, 1, 1, 0],
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
          src={staticFile("vr45/scene.mp4")}
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
          <Tag at={row[0]} opacity={you} fill={C.chalk} ink={ON_ACCENT}>
            YOU
          </Tag>
          <Tag at={row[1]} opacity={names} fill={C.chalk} ink={ON_ACCENT}>
            STICK WON
          </Tag>
          <Tag at={row[2]} opacity={names} fill={ACCENT} ink={ON_ACCENT}>
            SWITCH WON
          </Tag>
          <Tag
            at={row[3]}
            opacity={names}
            fill="rgba(10,11,13,0.84)"
            ink={C.grayLight}
          >
            50/50
          </Tag>
        </>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 56,
          bottom: 16,
          opacity: tallies ? key : 0,
          padding: "5px 12px",
          borderRadius: 7,
          background: "rgba(10,11,13,0.84)",
          fontFamily: theme.monoFamily,
          fontSize: 21,
          letterSpacing: "0.04em",
          color: C.grayLight,
          whiteSpace: "nowrap",
        }}
      >
        1 car = {CAR_WINS} wins
      </div>
      <div style={{ opacity: tallies ? chips : 0 }}>
        <Chip label="stick won" value={stick} />
        <Chip right label="switch won" value={sw} accent />
      </div>
    </div>
  );
};
