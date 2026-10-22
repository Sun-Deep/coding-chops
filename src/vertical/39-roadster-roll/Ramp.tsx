import { useEffect, useState } from "react";
import {
  Img,
  OffthreadVideo,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { theme } from "../../shared/brand/theme";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { LET_GO, ROOF_DOWN, WHEELS_DOWN, simAt } from "./beats";
import { CONDITIONS, FALL } from "./measurements";
import { GAUGES_W, Gauges } from "./Gauges";
import { READINGS } from "./readouts";
import { DROP, type Rule, type State } from "./simulation";

/**
 * The same car letting go of the same ramp twice, one above the other,
 * rendered in Blender from the model's timeline by
 * `scripts/blender/roadster/render.sh`. Above, the thrusters stay off. Below,
 * they roll the car over and then brake it.
 *
 * Beside each panel, the car's instruments as dials, reading the model on
 * every frame (`Gauges.tsx`). Over each panel, what the car is doing and
 * the fall clock.
 *
 * Orange is one thing: the force on the car, the number the reel is about.
 */

export const HEADLINE_TOP = 232;
const PROVENANCE_TOP = 424;
/** The gauges stand on the left margin, the panel fills the rest. */
const GAUGES_LEFT = 96;
const LEFT = GAUGES_LEFT + GAUGES_W + 14;
const W = 930 - LEFT;
const H = 380;
/** The renders are 2.05 to 1; the panel shows their middle. */
const VIDEO_W = Math.round((H * 1560) / 760);
const CROP = (VIDEO_W - W) / 2;
const PANELS: { rule: Rule; label: string; top: number }[] = [
  { rule: "off", label: "Thrusters off", top: 494 },
  { rule: "on", label: "Thrusters on", top: 920 },
];
const LABEL_GAP = 34;

/** Per frame, on the render from 0 to 1: the ground and the roof's height at the end of the ramp, and the car. */
type Marks = [number, number, number, number, number, number][];

const useMarks = (rule: Rule) => {
  const [marks, setMarks] = useState<Marks | null>(null);
  const [handle] = useState(() => delayRender(`marks ${rule}`));
  useEffect(() => {
    fetch(staticFile(`vr39/marks-${rule}.json`))
      .then((r) => r.json())
      .then((m: Marks) => {
        setMarks(m);
        continueRender(handle);
      });
  }, [handle, rule]);
  return marks;
};

const STATE: Record<State, string> = {
  held: "fan holds it",
  falling: "free fall",
  crushing: "roof crushing",
  sliding: "sliding on its roof",
  "on its roof": "on its roof",
  "starting roll": "jets: roll",
  "stopping roll": "jets: stop roll",
  braking: "jets: brake",
  suspension: "suspension",
  "on its wheels": "on its wheels",
};

const reading = (rule: Rule, frame: number) =>
  READINGS[rule][
    Math.max(0, Math.min(READINGS[rule].length - 1, Math.round(frame)))
  ];

/**
 * What the car is doing, and the clock: counting down to letting go, then
 * the seconds since, held at the moment it is down.
 */
const clockAt = (rule: Rule, frame: number) => {
  const state = STATE[reading(rule, frame).state];
  const down = rule === "off" ? ROOF_DOWN : WHEELS_DOWN;
  if (frame < LET_GO)
    return { word: `${state} · lets go in`, clock: -simAt(frame) };
  if (frame >= down)
    return {
      word: `${state} · down at`,
      clock: rule === "off" ? FALL.hit : FALL.land,
    };
  return { word: state, clock: Math.min(simAt(frame), FALL.land) };
};

/**
 * The drop, drawn where it is: a line from the ground to the roof's height
 * at the end of the ramp, from when the ground is in shot until the car has
 * gone past it.
 */
const Drop: React.FC<{ marks: Marks; frame: number }> = ({ marks, frame }) => {
  const f = Math.max(0, Math.min(marks.length - 1, Math.round(frame)));
  const [gx, gy, rx, ry] = marks[f];
  const o =
    // Once the camera has pulled back far enough to show the ground.
    interpolate(frame, [44, 56], [0, 1], clamp) *
    interpolate(frame, [LET_GO + 30, LET_GO + 46], [1, 0], clamp);
  if (o <= 0) return null;
  const x0 = gx * VIDEO_W - CROP;
  const y0 = gy * H;
  const x1 = rx * VIDEO_W - CROP;
  const y1 = ry * H;
  const tick = 9;
  return (
    <>
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0, opacity: o }}
      >
        <line
          x1={x0}
          y1={y0}
          x2={x1}
          y2={y1}
          stroke={theme.colors.chalk}
          strokeWidth={2.5}
          strokeDasharray="7 6"
        />
        <line
          x1={x0 - tick}
          y1={y0}
          x2={x0 + tick}
          y2={y0}
          stroke={theme.colors.chalk}
          strokeWidth={2.5}
        />
        <line
          x1={x1 - tick}
          y1={y1}
          x2={x1 + tick}
          y2={y1}
          stroke={theme.colors.chalk}
          strokeWidth={2.5}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: (x0 + x1) / 2 - 92,
          top: (y0 + y1) / 2 - 17,
          width: 80,
          textAlign: "right",
          fontFamily: theme.monoFamily,
          fontSize: 26,
          fontWeight: 700,
          color: theme.colors.chalk,
          textShadow: "0 1px 6px rgba(0,0,0,0.7)",
          opacity: o,
        }}
      >
        {DROP} m
      </div>
    </>
  );
};

const Panel: React.FC<{
  rule: Rule;
  label: string;
  top: number;
  frame: number;
  /** Set for a still: the video frame to hold. */
  still?: number;
}> = ({ rule, label, top, frame, still }) => {
  const marks = useMarks(rule);
  const now = clockAt(rule, frame);
  return (
    <>
      <div
        style={{
          position: "absolute",
          top,
          left: LEFT,
          width: W,
          height: H,
          borderRadius: 14,
          overflow: "hidden",
          background: theme.colors.black,
          boxShadow: "0 0 0 1px #2A2B30",
        }}
      >
        {still === undefined ? (
          <OffthreadVideo
            src={staticFile(`vr39/${rule}.mp4`)}
            muted
            style={{
              position: "absolute",
              left: -CROP,
              width: VIDEO_W,
              height: H,
            }}
          />
        ) : (
          <Img
            src={staticFile(
              `vr39/${rule}-${String(still).padStart(4, "0")}.png`,
            )}
            style={{
              position: "absolute",
              left: -CROP,
              width: VIDEO_W,
              height: H,
            }}
          />
        )}
        {marks && still === undefined ? (
          <Drop marks={marks} frame={frame} />
        ) : null}
      </div>
      <div style={{ position: "absolute", top, left: GAUGES_LEFT }}>
        <Gauges r={reading(rule, frame)} height={H} />
      </div>
      <div
        style={{
          position: "absolute",
          top: top - LABEL_GAP,
          left: GAUGES_LEFT,
          width: 930 - GAUGES_LEFT,
          height: 30,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          color: theme.colors.chalk,
        }}
      >
        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 23,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            paddingBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 19,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: theme.colors.grayDark,
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}
        >
          {now.word}{" "}
          {now.clock !== null ? (
            <span
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: theme.colors.chalk,
                textTransform: "none",
              }}
            >
              {now.clock.toFixed(2)} s
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
};

/** `still` holds every part of the scene at one frame, for the cover. */
export const Ramp: React.FC<{ still?: number }> = ({ still }) => {
  const current = useCurrentFrame();
  const frame = still ?? current;
  return (
    <>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => (
        <Panel key={p.rule} {...p} frame={frame} still={still} />
      ))}
    </>
  );
};
