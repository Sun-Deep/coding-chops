import { theme } from "./theme";

/**
 * The channel mark: a terminal prompt, chevron and underscore.
 *
 * The geometry is the channel's own — a 34 by 64 chevron on `M9 9 L25 32 L9 55`
 * with a rounded bar to its right — carried over unchanged so this reads as the
 * same mark people already know it by. Only the colour moves: the original is
 * amber on near black, and this episode has one accent, which is cobalt.
 *
 * Everything is expressed as a fraction of `size`, which is the mark's cap
 * height, so it sets against the wordmark at the same size and lines up.
 */
const CHEVRON_RATIO = 34 / 64;
const BAR_WIDTH = 46 / 130;
const BAR_HEIGHT = 11 / 130;
const BAR_GAP = 12 / 130;
/** The prompt sits on the wordmark's baseline, not the full height of the mark. */
const CAP = 0.7;

export const Logo: React.FC<{
  size?: number;
  color?: string;
  opacity?: number;
}> = ({ size = 72, color = theme.colors.blue, opacity = 1 }) => {
  const chevronWidth = size * CHEVRON_RATIO;
  const barWidth = size * BAR_WIDTH;
  const barHeight = size * BAR_HEIGHT;
  const gap = size * BAR_GAP;

  return (
    <div
      style={{
        position: "relative",
        width: chevronWidth + gap + barWidth,
        height: size,
        opacity,
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 34 64"
        fill="none"
        width={chevronWidth}
        height={size}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <path
          d="M9 9 L25 32 L9 55"
          stroke={color}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: chevronWidth + gap,
          top: (size + size * CAP) / 2 - barHeight,
          width: barWidth,
          height: barHeight,
          borderRadius: barHeight * 0.36,
          background: color,
        }}
      />
    </div>
  );
};
