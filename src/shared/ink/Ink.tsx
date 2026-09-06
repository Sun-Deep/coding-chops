import { useVideoConfig } from "remotion";
import { theme } from "../brand/theme";
import { inkWidth, problemSolvingMotion } from "../page/motion";
import type { InkMark, InkPoint } from "./types";

const M = problemSolvingMotion;

type Point = { x: number; y: number; p: number; t: number };

type InkProps = {
  /** A mark loaded from `curriculum/<track>/<episode>/ink`. */
  mark: InkMark;
  /**
   * 0 to 1. The scene owns timing and computes this from a caption frame, the
   * same way `Callout` does. `Ink` never reads the current frame itself.
   */
  progress: number;
  /** Frame point the mark's bounding box centres on. */
  at: { x: number; y: number };
  /** Longest bounding-box edge in frame pixels. Overrides `scale`. */
  size?: number;
  scale?: number;
  color?: string;
  opacity?: number;
  /**
   * `recorded` replays the captured timing, which carries the hesitation and
   * the slowing into corners that make a stroke look drawn. `paced` advances at
   * constant speed by path length, for strokes converted from vector paths that
   * never had timing.
   */
  mode?: "recorded" | "paced";
  /** Pen-lift between strokes, in the recorded clock's milliseconds. */
  gap?: number;
  calibration?: { lo: number; hi: number };
  widths?: { min: number; max: number };
  /**
   * Which canvas the mark sits on. Light strokes on dark bloom, so the same
   * width reads heavier there and the dark weights are thinner.
   */
  tone?: "paper" | "black";
};

const toPoints = (
  points: readonly InkPoint[],
  vw: number,
  vh: number,
): Point[] =>
  points.map((p) => ({ x: p[0] * vw, y: p[1] * vh, p: p[2], t: p[3] }));

/**
 * Running cost along a stroke, either its clock or its length.
 *
 * Both reveal modes are the same walk over a cumulative array. Only the
 * quantity being accumulated changes.
 */
const running = (pts: Point[], mode: "recorded" | "paced"): number[] => {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) {
    const step =
      mode === "recorded"
        ? Math.max(0, pts[i].t - pts[i - 1].t)
        : Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    acc.push(acc[i - 1] + step);
  }
  return acc;
};

/**
 * The part of a stroke drawn so far, with the final segment cut proportionally.
 *
 * Stepping point to point instead would be invisible at 12 frames and 35
 * points, but it costs three lines to do properly and it stops the shortest
 * reveals from looking chunky.
 */
const revealed = (pts: Point[], acc: number[], local: number): Point[] => {
  if (local >= 1) return pts;
  if (local <= 0 || pts.length < 2) return [];

  const total = acc[acc.length - 1];
  if (total <= 0) return pts;

  const target = total * local;
  let i = 1;
  while (i < acc.length && acc[i] < target) i++;
  if (i >= acc.length) return pts;

  const span = acc[i] - acc[i - 1];
  const f = span > 0 ? (target - acc[i - 1]) / span : 0;
  const a = pts[i - 1];
  const b = pts[i];
  return [
    ...pts.slice(0, i),
    {
      x: a.x + (b.x - a.x) * f,
      y: a.y + (b.y - a.y) * f,
      p: a.p + (b.p - a.p) * f,
      t: a.t + (b.t - a.t) * f,
    },
  ];
};

/**
 * A captured graphite mark, replayed frame-deterministically.
 *
 * Pure in its props. No randomness, no clock, no state. Every wobble and taper
 * comes from the recorded data, so two renders of the same frame produce the
 * same pixels. A mark that looks different between renders is a bug.
 *
 * Multi-stroke marks draw in order rather than at once, because an X whose two
 * strokes appear together is a shape, not a gesture.
 */
export const Ink: React.FC<InkProps> = ({
  mark,
  progress,
  at,
  size,
  scale = 1,
  color = theme.colors.ink,
  opacity = 1,
  mode = "recorded",
  gap = 60,
  calibration = M.ink,
  widths,
  tone = "paper",
}) => {
  const weightRange =
    widths ??
    (tone === "black"
      ? { min: M.ink.darkMinWidth, max: M.ink.darkMaxWidth }
      : { min: M.ink.minWidth, max: M.ink.maxWidth });
  const { width, height } = useVideoConfig();
  const vw = mark.viewport.width;
  const vh = mark.viewport.height;

  const strokes = mark.strokes.map((s) => toPoints(s.points, vw, vh));
  const all = strokes.flat();
  if (all.length === 0) return null;

  const xs = all.map((p) => p.x);
  const ys = all.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const boxW = Math.max(1, maxX - minX);
  const boxH = Math.max(1, maxY - minY);

  // `size` names the mark's longest edge, which is how a storyboard talks about
  // it. A circle is "about 110px", not "0.86 scale".
  const s = size ? size / Math.max(boxW, boxH) : scale;
  const cx = minX + boxW / 2;
  const cy = minY + boxH / 2;
  const place = (p: Point) => ({
    x: (p.x - cx) * s + at.x,
    y: (p.y - cy) * s + at.y,
  });

  // Widths are authored against a 1080p frame, so they follow the canvas if the
  // canonical resolution ever moves.
  const weight = (s * height) / 1080;

  const accs = strokes.map((pts) => running(pts, mode));
  const costs = accs.map((acc) => Math.max(1, acc[acc.length - 1]));
  const lift = mode === "recorded" ? gap : 0;
  const total =
    costs.reduce((a, b) => a + b, 0) + lift * Math.max(0, strokes.length - 1);

  let budget = Math.max(0, Math.min(1, progress)) * total;
  const segments: {
    key: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    w: number;
  }[] = [];

  strokes.forEach((pts, si) => {
    const local = Math.max(0, Math.min(1, budget / costs[si]));
    budget -= costs[si] + lift;
    const drawn = revealed(pts, accs[si], local);
    for (let i = 1; i < drawn.length; i++) {
      const a = place(drawn[i - 1]);
      const b = place(drawn[i]);
      segments.push({
        key: `${si}-${i}`,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        w: inkWidth(drawn[i].p, calibration, weightRange) * weight,
      });
    }
  });

  if (segments.length === 0) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}
    >
      {segments.map((seg) => (
        <line
          key={seg.key}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke={color}
          strokeWidth={seg.w}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};
