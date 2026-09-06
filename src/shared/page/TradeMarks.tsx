import { theme } from "../brand/theme";
import { CHART, dayX, priceLabelSide, priceY } from "./PriceChart";

/**
 * Buy, sell, and the gap between them.
 *
 * Blue is the only accent the channel has and status palettes are out, so none
 * of these can lean on colour. Buy and sell separate by direction: the buy
 * marker points down into the chart, because money is going in, and the sell
 * marker points up out of it. Profit and loss separate the same way. The gap
 * between the two prices is drawn as a real distance on the price axis, rising
 * and solid when the trade wins, hanging and dashed when it loses.
 */

/** Clearing a price label on the same side. */
const MARKER_LIFT = 104;
const LABEL_LIFT = 146;
/** Nothing to clear, so the marker sits closer to its dot. */
const MARKER_NEAR = 58;
const LABEL_NEAR = 98;
/**
 * Half-width of a marker's label box.
 *
 * It was 100, which put "BUY" in a 200px box centred on the day and swallowed
 * anything drawn beside the point. The gap line clears this, so the two numbers
 * have to stay in step.
 */
const LABEL_HALF = 50;

const inkFor = (tone: "paper" | "black") =>
  tone === "black" ? theme.colors.chalk : theme.colors.ink;

/**
 * Where a marker and its word sit for a given day.
 *
 * Exported so a marker can be slid between two days without the caller
 * re-deriving the lift. Interpolating between two of these moves the triangle
 * and the label together, and lands the marker exactly where it would have
 * been if it had simply appeared there.
 */
export const markerAnchor = (
  day: number,
  price: number,
  side: "above" | "below" = "above",
  prices?: readonly number[],
) => {
  const sign = side === "below" ? 1 : -1;
  const shares = prices ? priceLabelSide(prices, day - 1) === side : true;
  return {
    x: dayX(day),
    markerY: priceY(price) + sign * (shares ? MARKER_LIFT : MARKER_NEAR),
    labelY: priceY(price) + sign * (shares ? LABEL_LIFT : LABEL_NEAR),
  };
};

export type MarkerAnchor = ReturnType<typeof markerAnchor>;

export const TradeMarker: React.FC<{
  day: number;
  price: number;
  kind: "buy" | "sell";
  progress: number;
  /**
   * Which side of the point the marker sits on. It goes opposite whichever way
   * the trade gap runs, so the two never occupy the same space.
   */
  side?: "above" | "below";
  /**
   * The chart's prices, so the marker can tell whether a price label is sitting
   * on its side of the dot. Without it the marker always reserves room for a
   * label that may have moved to the other side, and floats.
   */
  prices?: readonly number[];
  /** Overrides the word. Used for the unresolved BUY? and SELL? candidates. */
  label?: string;
  /**
   * Position, when the marker is mid-slide between two days. Interpolate two
   * `markerAnchor` results rather than passing a fractional day: the lift is
   * not a function of the day, so a half-way day does not give a half-way
   * marker.
   */
  anchor?: MarkerAnchor;
  tone?: "paper" | "black";
}> = ({
  day,
  price,
  kind,
  progress,
  side = "above",
  prices,
  label,
  anchor,
  tone = "black",
}) => {
  if (progress <= 0.01) return null;
  const ink = inkFor(tone);
  const hue = kind === "buy" ? theme.colors.buy : theme.colors.sell;
  const place = anchor ?? markerAnchor(day, price, side, prices);
  const x = place.x;
  const y = place.markerY;
  const buy = kind === "buy";

  // Buy points at the price. Sell points away from it.
  const tri = buy
    ? `${x - 11},${y - 9} ${x + 11},${y - 9} ${x},${y + 9}`
    : `${x - 11},${y + 9} ${x + 11},${y + 9} ${x},${y - 9}`;

  return (
    <>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0, opacity: progress }}
      >
        <polygon
          points={tri}
          fill={buy ? ink : "none"}
          stroke={ink}
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: x - LABEL_HALF,
          top: place.labelY,
          width: LABEL_HALF * 2,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: hue,
          opacity: progress,
        }}
      >
        {label ?? (buy ? "BUY" : "SELL")}
      </div>
    </>
  );
};

/**
 * The distance between the buy price and the sell price, drawn on the axis it
 * actually lives on.
 *
 * A profit rises off the buy level and holds a solid line. A loss hangs below
 * it and stays dashed, which reads as provisional without needing red.
 */
export const TradeGap: React.FC<{
  buyDay: number;
  buyPrice: number;
  sellDay: number;
  sellPrice: number;
  progress: number;
}> = ({ buyDay, buyPrice, sellDay, sellPrice, progress }) => {
  if (progress <= 0.01) return null;
  const profit = sellPrice - buyPrice;
  const won = profit > 0;

  const x0 = dayX(buyDay);
  const x1 = dayX(sellDay);
  const yBuy = priceY(buyPrice);
  const ySell = priceY(sellPrice);
  const yNow = yBuy + (ySell - yBuy) * progress;
  // On the sell day itself. Offsetting it sideways to dodge a label turned the
  // measurement into a line pointing at nothing, which is worse than the
  // collision it was avoiding. The label moves instead.
  const gx = x1;
  const hue = won ? theme.colors.gain : theme.colors.loss;

  return (
    <>
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Where the buy price sits, carried forward to the sell day. */}
        <line
          x1={x0}
          y1={yBuy}
          x2={x0 + (gx - x0) * Math.min(1, progress * 2)}
          y2={yBuy}
          stroke={hue}
          strokeWidth={1.5}
          strokeDasharray="2 7"
          opacity={0.5}
        />
        {/* The gap itself, offset clear of the sell marker above the point. */}
        <line
          x1={gx}
          y1={yBuy}
          x2={gx}
          y2={yNow}
          stroke={hue}
          strokeWidth={won ? 3.5 : 2.5}
          strokeDasharray={won ? undefined : "7 6"}
          strokeLinecap="round"
          opacity={1}
        />
        <line
          x1={gx - 9}
          y1={yBuy}
          x2={gx + 9}
          y2={yBuy}
          stroke={hue}
          strokeWidth={won ? 3.5 : 2.5}
          opacity={1}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: gx + 20,
          top: (yBuy + ySell) / 2 - 22,
          fontFamily: theme.monoFamily,
          fontSize: 34,
          fontWeight: 700,
          color: hue,
          opacity: progress,
          whiteSpace: "nowrap",
        }}
      >
        {profit > 0 ? `+$${profit}` : `-$${Math.abs(profit)}`}
      </div>
    </>
  );
};

/**
 * One candidate trade, drawn as the path from the buy day to the sell day.
 *
 * Left to right, always, which is what separates it from `BackwardsArc`. The
 * bow grows with the span so two paths leaving the same day are told apart by
 * their arc rather than by overlapping on the straight line between the dots.
 *
 * Colour comes from the outcome, because by Act 2 the viewer has spent a
 * minute learning that green rises and red hangs. Fifteen of these end up on
 * screen at once as texture, so the head is optional: an arrowhead on every
 * one turns the set into a diagram of arrows instead of a picture of quantity.
 */
const PATH_BOW_BASE = 46;
const PATH_BOW_PER_DAY = 20;

export const tradePathControl = (
  buyDay: number,
  buyPrice: number,
  sellDay: number,
  sellPrice: number,
) => {
  const x0 = dayX(buyDay);
  const y0 = priceY(buyPrice);
  const x1 = dayX(sellDay);
  const y1 = priceY(sellPrice);
  const span = Math.abs(sellDay - buyDay);
  const bow = PATH_BOW_BASE + PATH_BOW_PER_DAY * (span - 1);
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: Math.min(y0, y1) - bow };
};

export const TradePath: React.FC<{
  buyDay: number;
  buyPrice: number;
  sellDay: number;
  sellPrice: number;
  /** 0 to 1 along the path. */
  progress: number;
  opacity?: number;
  /** Direction marker. Off by default, so the faded set stays texture. */
  head?: boolean;
  width?: number;
}> = ({
  buyDay,
  buyPrice,
  sellDay,
  sellPrice,
  progress,
  opacity = 1,
  head = false,
  width = 2.5,
}) => {
  if (progress <= 0.01 || opacity <= 0.01) return null;
  const { x0, y0, x1, y1, cx, cy } = tradePathControl(
    buyDay,
    buyPrice,
    sellDay,
    sellPrice,
  );
  const won = sellPrice - buyPrice > 0;
  const hue = won ? theme.colors.gain : theme.colors.loss;
  const reach = Math.min(1, progress);

  const pointAt = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * x0 + 2 * u * t * cx + t * t * x1,
      y: u * u * y0 + 2 * u * t * cy + t * t * y1,
    };
  };
  const tip = pointAt(reach);
  const just = pointAt(Math.max(0.02, reach - 0.06));
  const angle = Math.atan2(tip.y - just.y, tip.x - just.x);
  const wing = (spread: number) => ({
    x: tip.x - 15 * Math.cos(angle + spread),
    y: tip.y - 15 * Math.sin(angle + spread),
  });
  const a = wing(0.42);
  const b = wing(-0.42);

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, opacity }}
    >
      <path
        d={`M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`}
        fill="none"
        stroke={hue}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${reach} 1`}
      />
      {head && reach > 0.08 && (
        <polyline
          points={`${a.x},${a.y} ${tip.x},${tip.y} ${b.x},${b.y}`}
          fill="none"
          stroke={hue}
          strokeWidth={width + 0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

/**
 * The trade that runs backwards through time.
 *
 * Every valid path in this episode moves left to right, and Act 1 spends twenty
 * seconds establishing that. This is the one that does not. It leaves the buy
 * day and travels left to the sell day, arrowhead landing on the sell marker,
 * so the viewer can see exactly which trade is being proposed.
 *
 * An earlier version stopped halfway, on the idea that a failed journey should
 * visibly fail. It read as a line pointing at nothing. The narration says the
 * trade needs a time machine, not that it gives up on the way, so the arc
 * completes and the strike is what invalidates it.
 */
/**
 * The arc's control point. Bows away from the line, not along it.
 *
 * 240 is measured, not chosen. At 96 the arc clipped the nearest price label by
 * 2px on its way over. At 240 it clears the worst one by 62px, and its apex
 * still rises only 42px above the point it is reaching for, so it stays
 * attached rather than flying off on its own.
 */
const arcControl = (x0: number, y0: number, x1: number, y1: number) => ({
  cx: (x0 + x1) / 2,
  cy: Math.min(y0, y1) - 240,
});

/**
 * Where the arc gives up, in frame coordinates.
 *
 * The strike has to land on the stall rather than near it, so the point is
 * computed once here and read by whoever needs it. A quadratic at t.
 */
export const arcPointAt = (
  fromDay: number,
  fromPrice: number,
  toDay: number,
  toPrice: number,
  t: number,
) => {
  const x0 = dayX(fromDay);
  const y0 = priceY(fromPrice);
  const x1 = dayX(toDay);
  const y1 = priceY(toPrice);
  const { cx, cy } = arcControl(x0, y0, x1, y1);
  const u = 1 - t;
  return {
    x: u * u * x0 + 2 * u * t * cx + t * t * x1,
    y: u * u * y0 + 2 * u * t * cy + t * t * y1,
  };
};

export const BackwardsArc: React.FC<{
  fromDay: number;
  fromPrice: number;
  toDay: number;
  toPrice: number;
  progress: number;
  /** Drops after the strike, without un-drawing the path. */
  opacity?: number;
  tone?: "paper" | "black";
}> = ({
  fromDay,
  fromPrice,
  toDay,
  toPrice,
  progress,
  opacity = 1,
  tone = "black",
}) => {
  if (progress <= 0.01) return null;
  const ink = inkFor(tone);
  const x0 = dayX(fromDay);
  const y0 = priceY(fromPrice);
  const x1 = dayX(toDay);
  const y1 = priceY(toPrice);

  // Bows upward, away from the line, so it reads as an attempt rather than a
  // measurement.
  const { cx, cy } = arcControl(x0, y0, x1, y1);
  // Stops short of the target rather than on it. Landing the head exactly on
  // the dot buries it under the dot, and then nothing on screen says which way
  // the path was travelling.
  const reach = Math.min(1, progress) * 0.93;
  const head = arcPointAt(fromDay, fromPrice, toDay, toPrice, reach);
  const just = arcPointAt(
    fromDay,
    fromPrice,
    toDay,
    toPrice,
    Math.max(0.02, reach - 0.05),
  );
  // The direction of travel is the whole point. Without a head this is just a
  // line, and a line does not look like it is going anywhere.
  const angle = Math.atan2(head.y - just.y, head.x - just.x);
  const wing = (spread: number) => ({
    x: head.x - 18 * Math.cos(angle + spread),
    y: head.y - 18 * Math.sin(angle + spread),
  });
  const a = wing(0.42);
  const b = wing(-0.42);

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, opacity }}
    >
      <path
        d={`M ${x0} ${y0} Q ${cx} ${cy} ${x1} ${y1}`}
        fill="none"
        stroke={ink}
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${reach} 1`}
        opacity={0.9}
      />
      {reach > 0.06 && (
        <polyline
          points={`${a.x},${a.y} ${head.x},${head.y} ${b.x},${b.y}`}
          fill="none"
          stroke={ink}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
        />
      )}
    </svg>
  );
};

export { CHART };
