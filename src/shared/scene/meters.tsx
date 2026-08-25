import { interpolate } from "remotion";
import { theme } from "../brand/theme";
import { clamp } from "../video/timing";
import { INK, Layer } from "./stage";

/**
 * A resource the machine spends.
 *
 * Four of these, one per resource the narration names. Bars rather than dials
 * or gauges, because a bar reads as "how much of a limit is used" without a
 * legend, and the lesson is about limits.
 *
 * The active one takes cobalt. The rest stay ink, so at any moment it is
 * obvious which resource the narrator is on.
 */
export const Meter: React.FC<{
  label: string;
  x: number;
  y: number;
  width: number;
  /** 0 to 1 of the bar's limit. */
  level: number;
  /** 1 while this is the resource being explained. */
  active: number;
  /** Whole-meter reveal. */
  reveal: number;
  /** Draws the ceiling this resource runs into. 0 hides it. */
  limit?: number;
}> = ({ label, x, y, width, level, active, reveal, limit = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: x - width / 2,
      top: y,
      width,
      opacity: reveal * (0.62 + active * 0.38),
      transform: `translateY(${interpolate(reveal, [0, 1], [16, 0], clamp)}px)`,
    }}
  >
    <div
      style={{
        fontFamily: theme.fontFamily,
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        color: active > 0.5 ? theme.colors.blue : theme.colors.ink,
        marginBottom: 12,
      }}
    >
      {label}
    </div>
    <div
      style={{
        height: 14,
        borderRadius: 7,
        background: `rgba(${INK},0.08)`,
        boxShadow: `inset 0 1px 2px rgba(${INK},0.07)`,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {limit > 0 ? (
        <div
          style={{
            position: "absolute",
            left: `${limit * 100}%`,
            top: 0,
            width: 3,
            height: "100%",
            background: `rgba(${INK},0.42)`,
          }}
        />
      ) : null}
      <div
        style={{
          width: `${Math.min(1, level) * 100}%`,
          height: "100%",
          borderRadius: 7,
          background:
            active > 0.5
              ? `linear-gradient(90deg, ${theme.colors.blue} 0%, ${theme.colors.blueBright} 100%)`
              : `rgba(${INK},0.34)`,
        }}
      />
    </div>
  </div>
);

/**
 * Requests waiting to be served.
 *
 * The line only exists because work arrives faster than it leaves, so the
 * cards stack toward the machine and the one at the front is the one being
 * worked on. A card past its limit dims out rather than vanishing, because a
 * timeout is a request that was abandoned, not one that never existed.
 */
export const Queue: React.FC<{
  x: number;
  y: number;
  /** How many cards are waiting, fractional so the line grows smoothly. */
  depth: number;
  /** How many at the back have given up. */
  expired: number;
  opacity: number;
  defocus: number;
}> = ({ x, y, depth, expired, opacity, defocus }) => (
  <Layer depth={20} defocus={defocus}>
    {Array.from({ length: 9 }, (_, i) => {
      const present = interpolate(depth - i, [0, 1], [0, 1], clamp);
      const gone = interpolate(expired - (8 - i), [0, 1], [0, 1], clamp);
      if (present <= 0.01) return null;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - i * 72 - 34,
            top: y - 22,
            width: 64,
            height: 44,
            opacity: opacity * present * (1 - gone * 0.82),
            transform: `scale(${0.82 + present * 0.18})`,
            borderRadius: 10,
            background:
              gone > 0.5
                ? `rgba(${INK},0.14)`
                : `linear-gradient(140deg, ${theme.colors.blue} 0%, #1155BE 100%)`,
            boxShadow: gone > 0.5 ? "none" : `0 8px 20px rgba(23,105,224,0.26)`,
            padding: "10px 11px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {[1, 0.66, 0.4].map((w) => (
            <div
              key={w}
              style={{
                width: `${w * 100}%`,
                height: 4,
                borderRadius: 2,
                background:
                  gone > 0.5 ? `rgba(${INK},0.2)` : "rgba(255,255,255,0.72)",
              }}
            />
          ))}
        </div>
      );
    })}
  </Layer>
);

/**
 * One kind of request, with what it costs.
 *
 * The narration compares three requests that look alike and cost nothing like
 * each other. Side by side with their own bars, the comparison is something the
 * viewer makes rather than something they are told.
 */
export const CostCard: React.FC<{
  title: string;
  x: number;
  y: number;
  /** cpu, memory, storage, network, each 0 to 1. */
  cost: [number, number, number, number];
  reveal: number;
  highlight: number;
}> = ({ title, x, y, cost, reveal, highlight }) => (
  <div
    style={{
      position: "absolute",
      left: x - 210,
      top: y,
      width: 420,
      opacity: reveal * (0.5 + highlight * 0.5),
      transform: `translateY(${interpolate(reveal, [0, 1], [22, 0], clamp)}px) scale(${0.96 + highlight * 0.04})`,
    }}
  >
    <div
      style={{
        fontFamily: theme.fontFamily,
        fontSize: 30,
        fontWeight: 700,
        letterSpacing: "-0.035em",
        color: highlight > 0.5 ? theme.colors.blue : theme.colors.ink,
        marginBottom: 20,
        minHeight: 76,
      }}
    >
      {title}
    </div>
    {["CPU", "memory", "storage", "network"].map((name, i) => (
      <div
        key={name}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 11,
        }}
      >
        <div
          style={{
            width: 96,
            fontFamily: theme.fontFamily,
            fontSize: 19,
            fontWeight: 600,
            color: theme.colors.gray,
          }}
        >
          {name}
        </div>
        <div
          style={{
            flex: 1,
            height: 11,
            borderRadius: 6,
            background: `rgba(${INK},0.08)`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${interpolate(reveal, [0.3, 1], [0, cost[i]], clamp) * 100}%`,
              height: "100%",
              borderRadius: 6,
              background:
                highlight > 0.5 && cost[i] > 0.6
                  ? `linear-gradient(90deg, ${theme.colors.blue} 0%, ${theme.colors.blueBright} 100%)`
                  : `rgba(${INK},0.32)`,
            }}
          />
        </div>
      </div>
    ))}
  </div>
);

/**
 * People, as dots.
 *
 * The narration's point is that a headline user count says nothing, so the
 * dots have two states: signed up, and actually asking for something right now.
 * Only the second kind costs the machine anything.
 */
export const Dots: React.FC<{
  x: number;
  y: number;
  columns: number;
  rows: number;
  /** Fraction that are currently making requests. */
  activeFraction: number;
  reveal: number;
  /** Bigger dots for a smaller, heavier crowd. */
  size?: number;
}> = ({ x, y, columns, rows, activeFraction, reveal, size = 13 }) => {
  const gap = size * 0.72;
  const width = columns * (size + gap);

  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y,
        width,
        display: "flex",
        flexWrap: "wrap",
        gap,
        opacity: reveal,
      }}
    >
      {Array.from({ length: columns * rows }, (_, i) => {
        // Deterministic scatter, so the active ones are not a neat block.
        const scattered = ((i * 7919) % (columns * rows)) / (columns * rows);
        const on = scattered < activeFraction;
        const arrive = interpolate(
          reveal * (columns * rows) - i * 0.35,
          [0, 1],
          [0, 1],
          clamp,
        );
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              opacity: arrive,
              transform: `scale(${0.6 + arrive * 0.4})`,
              background: on ? theme.colors.blue : `rgba(${INK},0.14)`,
              boxShadow: on
                ? `0 0 ${size * 0.7}px rgba(23,105,224,0.4)`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
};
