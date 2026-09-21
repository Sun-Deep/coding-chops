import { useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { HEIGHT, WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { COLUMN_LEFT, COLUMN_WIDTH, LIST_ROW, LIST_TOP } from "./layout";
import { STEPS, UNITS } from "./measurements";
import { rowAt, rowsShown, stepAt, unitAt } from "./beats";

/**
 * The four lines, kept.
 *
 * Built by the animation rather than appended to it: each row lands as its step
 * settles, so by the end the viewer has the whole sequence on screen with the
 * counts beside it. That is VR12's mode list, which is the element the best
 * performing cut on this page is remembered for.
 *
 * The unit column arrives last and is the point. Four numbers everybody already
 * knows, in a column that says what they are years of, is what turns a list of
 * fire counts into "the five fields are five units of time".
 */
export const Reference: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = rowsShown(frame);
  const current = stepAt(frame);

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", inset: 0 }}
    >
      {STEPS.map((line, i) => {
        if (i >= shown) return null;
        const on = rowAt(i, frame);
        const eased = on * on * (3 - 2 * on);
        const live = i === current;
        const y = LIST_TOP + i * LIST_ROW;
        // Slid in from the left, because a row that fades moves too few pixels
        // for the frozen-frame check to see it happen.
        const dx = (1 - eased) * -140;

        return (
          <g
            key={line.expression}
            opacity={on}
            transform={`translate(${dx}, 0)`}
          >
            <text
              x={COLUMN_LEFT}
              y={y + 30}
              fontFamily={theme.monoFamily}
              fontSize={28}
              fontWeight={live ? 700 : 500}
              fill={live ? ACCENT : theme.colors.grayDark}
            >
              {line.expression}
            </text>
            <text
              x={COLUMN_LEFT + 330}
              y={y + 30}
              textAnchor="end"
              fontFamily={theme.monoFamily}
              fontSize={28}
              fontWeight={600}
              fill={live ? ACCENT : theme.colors.chalk}
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {line.fires.toLocaleString("en-US")}
            </text>
            <text
              x={COLUMN_LEFT + COLUMN_WIDTH}
              y={y + 30}
              textAnchor="end"
              fontFamily={theme.monoFamily}
              fontSize={26}
              fontWeight={500}
              fill={ACCENT}
              opacity={unitAt(i, frame)}
            >
              {UNITS[i]} in a year
            </text>
          </g>
        );
      })}
    </svg>
  );
};
