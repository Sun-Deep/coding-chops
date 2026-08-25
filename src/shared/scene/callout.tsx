import { interpolate } from "remotion";
import { theme } from "../brand/theme";
import { clamp } from "../video/timing";
import { SAFE_BOTTOM } from "./stage";

/**
 * A label with a drawn arrow to the thing it names.
 *
 * Two rules behind this, both learned the hard way:
 *
 * A beginner cannot be asked to remember which shape is which. Once something
 * has been named, its label stays on screen. A label that appears for two
 * seconds and leaves is a label the viewer has to hold in their head while
 * also following the narration.
 *
 * And a label with no line to its target is a guess. When two things sit side
 * by side, text floating above them belongs to neither until an arrow says so.
 *
 * Labels prefer the open space above the subject. Squeezing them into the strip
 * between an object and the caption band, while the top third of the frame sits
 * empty, is the layout mistake this component exists to stop.
 */

type Point = { x: number; y: number };

/**
 * How far the arrowhead stops short of its target point.
 *
 * Targets are given on an object's outer edge, and this holds the head clear of
 * it. An arrow that finishes inside the thing it is naming reads as a mistake.
 */
const ARROW_GAP = 24;

export const Callout: React.FC<{
  children: React.ReactNode;
  /** Screen point the arrow points at. */
  target: Point;
  /** Screen point the text sits at. Default is the open space above. */
  label: Point;
  /** 0 to 1. The arrow draws on, then the text arrives. */
  progress: number;
  size?: number;
  accent?: boolean;
  /** Which way the curve bows. Positive arcs clockwise. */
  bow?: number;
}> = ({
  children,
  target,
  label,
  progress,
  size = 38,
  accent = false,
  bow = 1,
}) => {
  const color = accent ? theme.colors.blue : theme.colors.ink;

  // A label for something the camera has left behind points at nothing. Hide
  // it rather than letting the arrow run into the edge of the frame.
  const onScreen =
    target.x > -60 && target.x < 1980 && target.y > -60 && target.y < 1140;
  if (!onScreen || progress <= 0.001) return null;

  // Start below the label. The leader uses one deliberate elbow and ends in a
  // target dot. Curved arrows looked gestural and often crossed unrelated
  // objects when the camera moved.
  const start = { x: label.x, y: label.y + size * 0.85 };
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const end = {
    x: target.x - (dx / length) * ARROW_GAP,
    y: target.y - (dy / length) * ARROW_GAP,
  };

  const elbowY = start.y + Math.max(24, Math.min(96, Math.abs(dy) * 0.38));
  const elbowX =
    start.x + Math.sign(dx || bow) * Math.min(Math.abs(dx) * 0.28, 72);
  const path = `M ${start.x} ${start.y} L ${elbowX} ${elbowY} L ${end.x} ${elbowY} L ${end.x} ${end.y}`;
  const textIn = interpolate(progress, [0, 0.34], [0, 1], clamp);
  const draw = interpolate(progress, [0.18, 1], [0, 1], clamp);

  return (
    <>
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={draw * progress * 0.42}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <circle
          cx={end.x}
          cy={end.y}
          r={4.5}
          fill={color}
          opacity={interpolate(draw, [0.88, 1], [0, 0.62], clamp) * progress}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          left: label.x,
          top: Math.min(label.y, SAFE_BOTTOM),
          transform: `translate(-50%, -50%) translateY(${interpolate(textIn, [0, 1], [10, 0])}px)`,
          opacity: textIn,
          whiteSpace: "nowrap",
          fontFamily: theme.fontFamily,
          fontSize: size,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          color,
        }}
      >
        {children}
      </div>
    </>
  );
};
