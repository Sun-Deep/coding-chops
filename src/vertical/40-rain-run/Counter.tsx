import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { DROPS } from "./measurements";
import type { Count } from "./simulation";

/**
 * The raindrops that have hit you so far, beside each street: the total,
 * and two bars that split it. The chalk bar is the drops in your path,
 * walked or run into. The orange bar is the drops falling on your head and
 * shoulders. Both columns share one scale, so the two front bars finish
 * level and the top bars do not.
 *
 * Orange is one thing: rain from above, the only part speed changes.
 */

export const COUNTER_W = 176;

const TICK = "#8A8B8F";
const TRACK = "#25262B";
const BAR_W = 52;
const BAR_TOP = 132;
const FRONT_X = 30;
const TOP_X = 98;

const n = (x: number) => Math.round(x).toLocaleString("en-US");

const Bar: React.FC<{
  x: number;
  value: number;
  bottom: number;
  scale: number;
  color: string;
  label: string;
}> = ({ x, value, bottom, scale, color, label }) => {
  const h = Math.max(0, value * scale);
  return (
    <>
      <rect
        x={x}
        y={BAR_TOP}
        width={BAR_W}
        height={bottom - BAR_TOP}
        rx={6}
        fill={TRACK}
      />
      {h > 0.5 ? (
        <rect
          x={x}
          y={bottom - h}
          width={BAR_W}
          height={h}
          rx={6}
          fill={color}
        />
      ) : null}
      <text
        x={x + BAR_W / 2}
        y={bottom - h - 9}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={19}
        fontWeight={700}
        fill={color}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {n(value)}
      </text>
      <text
        x={x + BAR_W / 2}
        y={bottom + 22}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={15}
        letterSpacing="0.1em"
        fill={TICK}
      >
        {label}
      </text>
    </>
  );
};

export const Counter: React.FC<{ count: Count; height: number }> = ({
  count,
  height,
}) => {
  const bottom = height - 30;
  // The tallest bar there will ever be, the front, fills the track less
  // room for its number above it.
  const scale = (bottom - BAR_TOP - 30) / DROPS.walk.front;
  return (
    <svg width={COUNTER_W} height={height} style={{ overflow: "visible" }}>
      <text
        x={COUNTER_W / 2}
        y={14}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={15}
        letterSpacing="0.1em"
        fill={TICK}
      >
        DROPS ON YOU
      </text>
      <text
        x={COUNTER_W / 2}
        y={66}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={46}
        fontWeight={700}
        fill={theme.colors.chalk}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {n(count.total)}
      </text>
      <Bar
        x={FRONT_X}
        value={count.front}
        bottom={bottom}
        scale={scale}
        color={theme.colors.chalk}
        label="FRONT"
      />
      <Bar
        x={TOP_X}
        value={count.top}
        bottom={bottom}
        scale={scale}
        color={ACCENT}
        label="TOP"
      />
    </svg>
  );
};
