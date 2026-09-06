import { theme } from "../brand/theme";

/**
 * The six-day price chart. The canonical representation for PS01, per section 4
 * of the problem-solving visual language.
 *
 * Geometry is fixed for the whole episode. The chart takes its home position at
 * Act 1 and never moves again, so every later act can point at a day without
 * re-establishing where the days are.
 */
export const CHART = {
  left: 400,
  step: 224,
  /** y for price 0. */
  base: 640,
  /**
   * Pixels per unit of the price scale.
   *
   * 52 rather than 60 so a marker and its label above the $7 point still clear
   * the top of the hero region at y=120. The chart is the only thing that gets
   * to decide this, because everything else is positioned off priceY.
   */
  unit: 52,
  dayLabelY: 692,
} as const;

export const dayX = (day: number) => CHART.left + (day - 1) * CHART.step;

/**
 * Which side of its dot a price label sits on.
 *
 * Above by default. Below at a local minimum, because there the line arrives
 * and leaves upward and a label above the dot lands right on it.
 *
 * Exported because markers need the same answer. A marker stacked above a dot
 * whose label went below is reserving room for something that is not there.
 */
export const priceLabelSide = (
  prices: readonly number[],
  index: number,
): "above" | "below" => {
  const here = prices[index];
  const around = [prices[index - 1], prices[index + 1]].filter(
    (n) => n !== undefined,
  );
  return around.every((n) => n > here) ? "below" : "above";
};
export const priceY = (price: number) => CHART.base - price * CHART.unit;

type Point = {
  /** 1-indexed, the way the narration counts. */
  day: number;
  price: number;
  /** 0 to 1. Below 1 the dot has not arrived yet. */
  reveal?: number;
  opacity?: number;
  /** Extra radius while this point is the one being talked about. */
  active?: number;
  /**
   * Multiplier on the price label alone.
   *
   * For handing a value off to something else that carries it. Dropping the
   * whole point would take the dot with it, and the dot is still a price on a
   * chart even once the number has moved somewhere more useful.
   */
  label?: number;
};

export const PriceChart: React.FC<{
  points: readonly Point[];
  /** 0 to 1 along the polyline joining the revealed dots. */
  line?: number;
  /** 0 to 1 on the axes. */
  axes?: number;
  showPrices?: boolean;
  showDays?: boolean;
  opacity?: number;
  tone?: "paper" | "black";
}> = ({
  points,
  line = 1,
  axes = 1,
  showPrices = true,
  showDays = true,
  opacity = 1,
  tone = "paper",
}) => {
  const dark = tone === "black";
  const ink = dark ? theme.colors.chalk : theme.colors.ink;
  const faint = dark ? theme.colors.grayDark : theme.colors.grayLight;
  const label = dark ? theme.colors.grayDark : theme.colors.gray;
  const sides = points.map((_, i) =>
    priceLabelSide(
      points.map((q) => q.price),
      i,
    ),
  );

  const drawn = points.filter((p) => (p.reveal ?? 1) > 0.5);
  const path = drawn
    .map((p, i) => `${i ? "L" : "M"} ${dayX(p.day)} ${priceY(p.price)}`)
    .join(" ");

  const first = dayX(points[0].day);
  const last = dayX(points[points.length - 1].day);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* The day axis. Left to right is forward in time, and the whole
            episode's temporal grammar rests on it staying that way. */}
        <line
          x1={first - 70}
          y1={CHART.base + 26}
          x2={first - 70 + (last - first + 140) * axes}
          y2={CHART.base + 26}
          stroke={faint}
          strokeWidth={2}
        />
        {path.length > 0 && (
          <path
            d={path}
            fill="none"
            stroke={ink}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - line}
          />
        )}
        {points.map((p) => {
          const r = (p.reveal ?? 1) * (9 + (p.active ?? 0) * 4);
          if (r <= 0) return null;
          return (
            <circle
              key={p.day}
              cx={dayX(p.day)}
              cy={priceY(p.price)}
              r={r}
              fill={ink}
              opacity={p.opacity ?? 1}
            />
          );
        })}
      </svg>

      {points.map((p, i) => {
        const show = (p.reveal ?? 1) * (p.opacity ?? 1);
        const below = sides[i] === "below";
        return (
          <div key={p.day}>
            {showPrices && (
              <div
                style={{
                  position: "absolute",
                  left: dayX(p.day) - 60,
                  top: priceY(p.price) + (below ? 26 : -62),
                  width: 120,
                  textAlign: "center",
                  fontFamily: theme.monoFamily,
                  fontSize: 34,
                  fontWeight: 500,
                  color: ink,
                  opacity: show * (p.label ?? 1),
                }}
              >
                ${p.price}
              </div>
            )}
            {showDays && (
              <div
                style={{
                  position: "absolute",
                  left: dayX(p.day) - 60,
                  top: CHART.dayLabelY,
                  width: 120,
                  textAlign: "center",
                  fontFamily: theme.monoFamily,
                  fontSize: 20,
                  color: label,
                  opacity: show * 0.9,
                }}
              >
                day {p.day}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
