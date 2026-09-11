import { interpolate } from "remotion";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { ATTENTION } from "./attention";
import { TEMPLATED } from "./measurements";

/**
 * The network, drawn from measured weights.
 *
 * Twenty-five nodes on a line, one per token, and an arc from every token back
 * to every token before it. That triangle is the causal mask: position i can
 * reach everything up to itself and nothing after, which is why `rows[i]` has
 * `i + 1` entries and why no arc is ever drawn going forwards.
 *
 * An arc's brightness is its attention weight, normalised against the strongest
 * weight in its own row. Raw weights would draw almost nothing: a row of
 * twenty-five sums to one, so the average is 0.04 and the picture would be
 * uniformly dim. Normalising per row shows where each token actually looks,
 * which is the thing worth seeing, and it is a contrast choice rather than a
 * change to the numbers.
 *
 * This is the shot that the first version of this cut did not have. A grid of
 * squares standing in for thirty-six layers carried the same information and
 * gave nobody a reason to stop scrolling.
 */

export const N = TEMPLATED.length;
export const FIELD_X = 96;
export const FIELD_W = 888;
export const PITCH = FIELD_W / N;
export const NODE_Y = 16;
export const SVG_H = 400;

export const nodeX = (i: number) => FIELD_X + PITCH * (i + 0.5);

/**
 * The control point for the deepest arc, not the depth it reaches.
 *
 * A quadratic bezier only travels half way to its control, so a curve with its
 * control at y peaks at about y/2. The first version set this to the depth the
 * band wanted and the arcs came out half as deep as intended, leaving the frame
 * top heavy with two thirds of it empty.
 */
const MAX_DIP = 700;

/**
 * Interpolate between the captured depths.
 *
 * Four layers out of thirty-six, so `depth` runs 0 to 1 across them and the
 * frames between are a crossfade. The alternative was storing all thirty-six,
 * which is 22,500 numbers to animate past in three seconds, too fast to read
 * and too big to keep honest.
 */
const weightAt = (depth: number, i: number, j: number) => {
  const span = ATTENTION.length - 1;
  const pos = clampNum(depth, 0, 1) * span;
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, span);
  const t = pos - lo;
  const a = ATTENTION[lo][i]?.[j] ?? 0;
  const b = ATTENTION[hi][i]?.[j] ?? 0;
  return a + (b - a) * t;
};

const clampNum = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export const AttentionField: React.FC<{
  top: number;
  /** 0 to 1 across the captured layers. */
  depth: number;
  /** 0 to 1, how many token rows have started attending. */
  reveal: number;
  /** 0 to 1, everything fading except the arcs into the last token. */
  converge?: number;
  opacity?: number;
}> = ({ top, depth, reveal, converge = 0, opacity = 1 }) => {
  const front = reveal * N;

  const arcs: React.ReactNode[] = [];
  for (let i = 1; i < N; i++) {
    // A row only exists once the front has reached it.
    const rowIn = interpolate(front - i, [0, 1.2], [0, 1], clamp);
    if (rowIn <= 0) continue;

    let max = 0;
    for (let j = 0; j <= i; j++) max = Math.max(max, weightAt(depth, i, j));
    if (max <= 0) continue;

    for (let j = 0; j < i; j++) {
      const w = weightAt(depth, i, j) / max;
      if (w < 0.04) continue;

      const isLast = i === N - 1;
      // Converging dims every arc that does not end at the token which speaks
      // next, because that is the claim the narration makes over this beat.
      const surviving = isLast ? 1 : 1 - converge;
      const a = Math.pow(w, 0.75) * rowIn * surviving;
      if (a < 0.012) continue;

      const x0 = nodeX(j);
      const x1 = nodeX(i);
      const dip = NODE_Y + (Math.abs(i - j) / N) * MAX_DIP;

      arcs.push(
        <path
          key={`${i}-${j}`}
          d={`M ${x0} ${NODE_Y} Q ${(x0 + x1) / 2} ${dip} ${x1} ${NODE_Y}`}
          fill="none"
          stroke={isLast && converge > 0.25 ? ACCENT : "#E9E4D8"}
          strokeWidth={isLast && converge > 0.25 ? 1.6 : 1}
          strokeOpacity={a * (isLast && converge > 0.25 ? 0.95 : 0.5)}
        />,
      );
    }
  }

  return (
    <svg
      width={1080}
      height={SVG_H}
      viewBox={`0 0 1080 ${SVG_H}`}
      style={{ position: "absolute", top, left: 0, opacity }}
    >
      {arcs}
      {TEMPLATED.map((p, i) => {
        const on = interpolate(front - i, [-1, 0.6], [0, 1], clamp);
        const isLast = i === N - 1;
        const lit = isLast ? Math.max(on, converge) : on;
        return (
          <rect
            key={i}
            x={nodeX(i) - 5}
            y={NODE_Y - 9}
            width={10}
            height={18}
            rx={2}
            fill={p.own || (isLast && converge > 0.25) ? ACCENT : "#E9E4D8"}
            opacity={0.18 + lit * 0.72}
          />
        );
      })}
    </svg>
  );
};
