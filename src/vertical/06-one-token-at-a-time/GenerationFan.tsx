import { ACCENT } from "../../shared/vertical/palette";
import { GENERATION_ATTENTION } from "./attention";
import { FIELD_W, FIELD_X, NODE_Y, SVG_H } from "./AttentionField";
import { PROMPT } from "./measurements";

/**
 * Generation, as the context growing and being read.
 *
 * The row of nodes is the cache. It starts at the twenty-five prompt tokens and
 * gains one per generated token, and the pitch compresses to keep it in frame,
 * so the context visibly densifies as the answer gets longer.
 *
 * Each pass draws an arc from the newest token back across every position
 * before it. That pairing is the claim the whole cut turns on: the compute is
 * one token wide and the reading is the entire context. The first version drew
 * a separate cache strip beside a single column, which said the same thing
 * twice and got both of them wrong.
 *
 * Every arc is a measured weight from `GENERATION_ATTENTION`, captured at each
 * generation step. Without them the fan would be decoration, and a decorative
 * network in a cut about a network is the one thing this format cannot ship.
 *
 * Earlier fans persist at a decaying alpha for a few steps, so the picture
 * accumulates instead of blinking. It is a pure function of the frame: nothing
 * is remembered between renders, the decay is computed from how many steps ago
 * each fan fired.
 */

const TRAIL = 7;

export const GenerationFan: React.FC<{
  top: number;
  /** How many tokens have been generated, fractional between steps. */
  step: number;
  opacity?: number;
}> = ({ top, step, opacity = 1 }) => {
  const last = GENERATION_ATTENTION.length - 1;
  const g = Math.max(0, Math.min(Math.floor(step), last));
  const total = PROMPT.templatedTokens + g + 1;
  const pitch = FIELD_W / total;
  const x = (i: number) => FIELD_X + pitch * (i + 0.5);

  const arcs: React.ReactNode[] = [];
  for (let k = 0; k < TRAIL; k++) {
    const gi = g - k;
    if (gi < 0) break;
    const row = GENERATION_ATTENTION[gi];
    const from = PROMPT.templatedTokens + gi;
    const fade = Math.pow(1 - k / TRAIL, 2.2);

    let max = 0;
    for (const w of row) max = Math.max(max, w);
    if (max <= 0) continue;

    for (let j = 0; j < row.length - 1; j++) {
      const w = row[j] / max;
      if (w < 0.05) continue;
      const a = Math.pow(w, 0.72) * fade;
      if (a < 0.015) continue;

      const x0 = x(j);
      const x1 = x(from);
      const dip = NODE_Y + (Math.abs(from - j) / total) * 580;
      arcs.push(
        <path
          key={`${gi}-${j}`}
          d={`M ${x0} ${NODE_Y} Q ${(x0 + x1) / 2} ${dip} ${x1} ${NODE_Y}`}
          fill="none"
          stroke={k === 0 ? ACCENT : "#E9E4D8"}
          strokeWidth={k === 0 ? 1.5 : 1}
          strokeOpacity={a * (k === 0 ? 0.9 : 0.34)}
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
      {Array.from({ length: total }, (_, i) => {
        const generated = i >= PROMPT.templatedTokens;
        const isNewest = i === total - 1;
        // A node arriving gets one frame of emphasis, which is what makes the
        // row read as appending rather than as a bar that got wider.
        const fresh = isNewest ? 1 - (step - Math.floor(step)) : 0;
        return (
          <rect
            key={i}
            x={x(i) - Math.max(2, pitch * 0.28)}
            y={NODE_Y - 9}
            width={Math.max(4, pitch * 0.56)}
            height={18}
            rx={1.5}
            fill={generated ? ACCENT : "#E9E4D8"}
            opacity={generated ? 0.5 + fresh * 0.5 : 0.34}
          />
        );
      })}
    </svg>
  );
};
