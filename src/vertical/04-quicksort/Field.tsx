import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { WIDTH } from "../../shared/vertical/geometry";
import { N } from "./measurements";

/**
 * A field of bars, standing on a baseline.
 *
 * Full width and nothing else. Horizontal bleed is free, because nothing the
 * platform draws lives on the left or right edge, and a field that runs the
 * whole 1080 is the difference between a spectacle and a diagram in a box.
 *
 * Vertical bleed is not free and this shot learned it the hard way. An earlier
 * version anchored the bars to the top and bottom edges of the frame on the
 * theory that artwork may cross a reserve as long as text does not. What that
 * actually did was fill the header band with bar roots and push the short half
 * of the sorted ramp underneath the caption and the progress bar, so on a phone
 * the data was behind the interface. Both reserves are real interface. The
 * bars stand between them.
 *
 * Contrast is carried by value rather than hue: bone on near black survives a
 * phone in daylight, and it leaves the accent to mean what it means everywhere
 * else in the format, which is the thing currently being looked at.
 */

const PITCH = WIDTH / N;
const BAR = PITCH - 1.2;

/** Shortest and longest a bar may be. The ratio sets how much sky a sorted
 *  ramp leaves above it, so it is a composition decision, not a data one. */
/**
 * How much sky a sorted ramp leaves above it.
 *
 * The shortest bar is a fixed fraction of the longest, so a sorted field reads
 * as a wedge rather than as a triangle with a third of the frame empty above
 * its thin end. A composition decision, not a data one: bar length is still
 * linear in the value, the axis just does not start at zero.
 */
const FLOOR = 0.3;

export const barLength = (value: number, span: number) =>
  span * FLOOR + (value / N) * span * (1 - FLOOR);

export type FieldProps = {
  values: readonly number[];
  /** True where the bar is in its final position. */
  settled: readonly boolean[];
  /** The index under the cursor, drawn as the sweep. */
  probe: number | null;
  /** The index being compared against: a running minimum, or a pivot. */
  anchor: number | null;
  /**
   * Which way the bars grow off their baseline. The top field hangs, the bottom
   * field stands, so the two fields face each other across the counters.
   */
  side: "top" | "bottom";
  /** Absolute y of the baseline the bars are rooted on. */
  baseline: number;
  /** Longest a bar may be. The field is this tall. */
  span?: number;
  /**
   * The stretch the algorithm is working inside. Everything outside it drops
   * back, which is how the recursion halving the problem becomes visible.
   */
  range?: { lo: number; hi: number } | null;
  /**
   * Writes per position. When present it replaces the settled styling: the
   * field stops being about order and starts being about how much memory the
   * algorithm touched.
   */
  heat?: Int16Array | null;
};

export const Field: React.FC<FieldProps> = ({
  values,
  settled,
  probe,
  anchor,
  side,
  baseline,
  span = 400,
  range = null,
  heat = null,
}) => {
  const hangs = side === "top";
  const gradientId = `bar-${side}`;
  const top = hangs ? baseline : baseline - span;

  return (
    <svg
      width={WIDTH}
      height={span}
      viewBox={`0 0 ${WIDTH} ${span}`}
      style={{ position: "absolute", top, left: 0 }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1={hangs ? "0" : "1"}
          x2="0"
          y2={hangs ? "1" : "0"}
        >
          <stop offset="0%" stopColor={theme.colors.chalk} stopOpacity="0.55" />
          <stop offset="70%" stopColor={theme.colors.chalk} stopOpacity="1" />
        </linearGradient>
      </defs>

      {values.map((v, i) => {
        const len = barLength(v, span);
        const x = i * PITCH;
        const y = hangs ? 0 : span - len;
        const lit = i === probe || i === anchor;
        const inRange = !range || (i >= range.lo && i <= range.hi);

        // Three ways a bar can be styled, and only one of them is ever in play
        // at a time: how much it has been written to, whether it is one of the
        // two the algorithm is holding, or whether it has settled.
        let fill = `url(#${gradientId})`;
        let opacity = settled[i] ? 0.96 : 0.4;

        if (heat) {
          // Both algorithms touch nearly every position at least once, so
          // presence cannot be the signal: colouring anything with a write in
          // it turned selection sort's field the same orange as quicksort's and
          // threw away the comparison. Selection averages under two writes a
          // position and quicksort averages over six, so the threshold sits
          // between them and the field reads as two materials rather than one.
          const h = heat[i];
          if (h >= 3) {
            fill = ACCENT;
            opacity = 0.4 + (Math.min(h - 3, 9) / 9) * 0.6;
          } else {
            opacity = h > 0 ? 0.34 : 0.14;
          }
        } else if (lit) {
          fill = ACCENT;
          opacity = 1;
        } else if (!inRange) {
          opacity = 0.15;
        }

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={BAR}
            height={len}
            fill={fill}
            opacity={opacity}
          />
        );
      })}

      {/*
        The sweep. Selection sort's cursor crosses the whole remaining field two
        hundred times over and that traversal is the shot's hero, so it gets a
        column rather than only a coloured bar: one bar in two hundred is five
        pixels wide and does not read as travel.
      */}
      {probe === null ? null : (
        <rect
          x={probe * PITCH - 1}
          y={0}
          width={BAR + 2}
          height={span}
          fill={ACCENT}
          opacity={0.15}
        />
      )}
    </svg>
  );
};
