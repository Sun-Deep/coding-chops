import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";

/**
 * The pieces the three algorithm shots are built from.
 *
 * Each shot uses a different one as its hero. Fixed window is a counter that
 * resets, sliding window is a pair of counters that do not, and the token
 * bucket is a tank that drains. Three events rather than one bar filling three
 * times, which is what the first cut of this was.
 */

const COLUMN = 836;
const LEFT = (1080 - COLUMN) / 2;

/** The clock the fixed window resets on. Tenths, because the seam is a tenth wide. */
export const Clock: React.FC<{ ms: number; top: number; opacity?: number }> = ({
  ms,
  top,
  opacity = 1,
}) => {
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60_000);
  const s = Math.floor((total % 60_000) / 1000);
  const tenth = Math.floor((total % 1000) / 100);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 0,
        width: 1080,
        textAlign: "center",
        opacity,
        fontFamily: theme.monoFamily,
        fontSize: 46,
        fontWeight: 500,
        letterSpacing: "0.08em",
        fontVariantNumeric: "tabular-nums",
        color: theme.colors.gray,
      }}
    >
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}.{tenth}
    </div>
  );
};

/**
 * The counter, at the size the whole shot is about.
 *
 * `of` draws the limit beside it, so the moment the number hits the limit is
 * legible without a label saying so.
 */
export const BigCounter: React.FC<{
  value: number;
  of?: number;
  top: number;
  color?: string;
  opacity?: number;
  scale?: number;
}> = ({
  value,
  of,
  top,
  color = theme.colors.chalk,
  opacity = 1,
  scale = 1,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      width: 1080,
      textAlign: "center",
      opacity,
      transform: `scale(${scale})`,
      fontFamily: theme.monoFamily,
      fontSize: 168,
      fontWeight: 700,
      letterSpacing: "-0.04em",
      lineHeight: 1,
      fontVariantNumeric: "tabular-nums",
      color,
    }}
  >
    {value}
    {of === undefined ? null : (
      <span style={{ fontSize: 64, fontWeight: 500, color: theme.colors.gray }}>
        {" "}
        / {of}
      </span>
    )}
  </div>
);

/** How full the counter is, as one bar the width of the column. */
export const FillBar: React.FC<{
  value: number;
  of: number;
  top: number;
  color?: string;
  opacity?: number;
}> = ({ value, of, top, color = ACCENT, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: LEFT,
      width: COLUMN,
      height: 26,
      borderRadius: 2,
      overflow: "hidden",
      background: "rgba(233,228,216,0.09)",
      opacity,
    }}
  >
    <div
      style={{
        width: `${Math.min(1, value / of) * 100}%`,
        height: 26,
        background: color,
      }}
    />
  </div>
);

/** A small labelled number, for the running total and the reject count. */
export const Tally: React.FC<{
  label: string;
  value: number;
  top: number;
  left: number;
  width: number;
  color?: string;
  opacity?: number;
}> = ({
  label,
  value,
  top,
  left,
  width,
  color = theme.colors.chalk,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      width,
      textAlign: "center",
      opacity,
    }}
  >
    <div
      style={{
        fontFamily: theme.monoFamily,
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: theme.colors.gray,
      }}
    >
      {label}
    </div>
    <div
      style={{
        marginTop: 10,
        fontFamily: theme.monoFamily,
        fontSize: 92,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        color,
      }}
    >
      {value}
    </div>
  </div>
);

/** The two halves of the column, for a shot that counts two things at once. */
export const HALVES = {
  left: { left: LEFT, width: COLUMN / 2 - 20 },
  right: { left: LEFT + COLUMN / 2 + 20, width: COLUMN / 2 - 20 },
} as const;

/**
 * The bucket, drawn as a tank rather than a bar.
 *
 * Vertical on purpose. The two shots before it both count along a horizontal
 * axis, and the thing that makes this algorithm different is that it holds a
 * level rather than a count.
 */
export const Tank: React.FC<{
  tokens: number;
  capacity: number;
  top: number;
  /** Rises briefly when a request is turned away. */
  bounce?: number;
  opacity?: number;
}> = ({ tokens, capacity, top, bounce = 0, opacity = 1 }) => {
  const height = 320;
  const width = 300;
  const level = Math.max(0, Math.min(1, tokens / capacity));

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: (1080 - width) / 2,
        width,
        height,
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `2px solid rgba(233,228,216,0.22)`,
          borderRadius: 3,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 2,
          right: 2,
          bottom: 2,
          height: (height - 4) * level,
          background: ACCENT,
        }}
      />
      {/* Requests arriving at an empty tank. Inside the tank's own empty space,
          because above it is where the label lives. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 44,
          textAlign: "center",
          opacity: bounce,
          fontFamily: theme.monoFamily,
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: theme.colors.chalk,
        }}
      >
        429
      </div>
    </div>
  );
};

/**
 * The one moment a number on screen goes backwards, named.
 *
 * This was a flare over the whole frame first. Even at three percent it read as
 * a render fault rather than as an event, and the production standard has no
 * room for a decoration whose meaning cannot be said in a sentence. A word can
 * be said in a sentence.
 */
export const ResetMark: React.FC<{ at: number; frame: number }> = ({
  at,
  frame,
}) => {
  const value = interpolate(
    frame,
    [at, at + 4, at + 34, at + 42],
    [0, 1, 1, 0],
    clamp,
  );
  if (value <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 676,
        left: 0,
        width: 1080,
        textAlign: "center",
        opacity: value,
        fontFamily: theme.monoFamily,
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: ACCENT,
      }}
    >
      Counter reset
    </div>
  );
};

/**
 * The log, drawn as the thing it costs.
 *
 * One cell per stored timestamp. The sliding window is exact because it keeps
 * all hundred of them, and it costs 1,208 bytes a user for the same reason, so
 * the count and the price are one picture rather than two claims.
 *
 * It fills and then stays full. Nothing drains here, which is the difference
 * from the counter in the shot before.
 */
export const LogGrid: React.FC<{
  kept: number;
  of: number;
  top: number;
  opacity?: number;
}> = ({ kept, of, top, opacity = 1 }) => {
  const columns = 25;
  const pitch = COLUMN / columns;
  const cell = pitch - 6;
  const rows = Math.ceil(of / columns);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: LEFT,
        width: COLUMN,
        height: rows * (cell + 6),
        opacity,
      }}
    >
      {Array.from({ length: of }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i % columns) * pitch,
            top: Math.floor(i / columns) * (cell + 6),
            width: cell,
            height: cell,
            borderRadius: 2,
            background: i < kept ? ACCENT : theme.colors.chalk,
            opacity: i < kept ? 1 : 0.08,
          }}
        />
      ))}
    </div>
  );
};
