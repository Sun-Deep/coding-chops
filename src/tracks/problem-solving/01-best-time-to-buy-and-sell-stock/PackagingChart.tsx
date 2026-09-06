import { theme } from "../../../shared/brand/theme";

type Candle = {
  x: number;
  openY: number;
  closeY: number;
  highY: number;
  lowY: number;
  trade?: "buy" | "sell";
};

const CANDLES: readonly Candle[] = [
  { x: 50, openY: 106, closeY: 72, highY: 42, lowY: 140 },
  {
    x: 150,
    openY: 250,
    closeY: 310,
    highY: 225,
    lowY: 338,
    trade: "buy",
  },
  { x: 250, openY: 220, closeY: 165, highY: 142, lowY: 244 },
  { x: 350, openY: 215, closeY: 267, highY: 190, lowY: 292 },
  {
    x: 450,
    openY: 160,
    closeY: 105,
    highY: 82,
    lowY: 180,
    trade: "sell",
  },
  { x: 550, openY: 165, closeY: 225, highY: 145, lowY: 252 },
] as const;

const candleColor = (trade: Candle["trade"]) => {
  if (trade === "buy") return theme.colors.buy;
  if (trade === "sell") return theme.colors.sell;
  return theme.colors.chalk;
};

/**
 * A compact candlestick chart for the episode packaging. The candles are
 * illustrative, while the selected close prices come from the episode's
 * `[7, 1, 5, 3, 6, 4]` example: buy at $1, sell later at $6, keep $5.
 */
export const PackagingChart: React.FC<{
  width: number;
  height: number;
  strokeWidth?: number;
}> = ({ width, height, strokeWidth = 4 }) => (
  <svg
    viewBox="0 0 600 390"
    width={width}
    height={height}
    role="img"
    aria-label="Candlestick chart with a buy at one dollar and a later sell at six dollars"
    style={{ display: "block", overflow: "visible" }}
  >
    <defs>
      <marker
        id="packaging-profit-arrow"
        markerWidth="11"
        markerHeight="11"
        refX="8.5"
        refY="5.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M 1 1 L 9.5 5.5 L 1 10 z" fill={theme.colors.gain} />
      </marker>
    </defs>

    <line
      x1="20"
      y1="350"
      x2="580"
      y2="350"
      stroke={theme.colors.grayDark}
      strokeWidth={strokeWidth * 0.55}
      opacity={0.66}
    />

    {CANDLES.map((candle, index) => {
      const color = candleColor(candle.trade);
      const top = Math.min(candle.openY, candle.closeY);
      const bodyHeight = Math.abs(candle.closeY - candle.openY);
      const rising = candle.closeY < candle.openY;
      const selected = candle.trade !== undefined;

      return (
        <g key={candle.x}>
          <line
            x1={candle.x}
            y1={candle.highY}
            x2={candle.x}
            y2={candle.lowY}
            stroke={color}
            strokeWidth={selected ? strokeWidth + 0.6 : strokeWidth * 0.72}
            opacity={selected ? 1 : 0.72}
          />
          <rect
            x={candle.x - (selected ? 17 : 14)}
            y={top}
            width={selected ? 34 : 28}
            height={Math.max(7, bodyHeight)}
            fill={rising ? theme.colors.blackSoft : color}
            stroke={color}
            strokeWidth={selected ? strokeWidth + 0.6 : strokeWidth * 0.72}
            opacity={selected ? 1 : 0.72}
          />
          {!selected && (
            <text
              x={candle.x}
              y="374"
              fill={theme.colors.grayDark}
              fontFamily={theme.monoFamily}
              fontSize="15"
              fontWeight="500"
              textAnchor="middle"
            >
              {index + 1}
            </text>
          )}
        </g>
      );
    })}

    <line
      x1="150"
      y1="338"
      x2="150"
      y2="350"
      stroke={theme.colors.buy}
      strokeWidth={strokeWidth * 0.72}
    />
    <text
      x="150"
      y="379"
      fill={theme.colors.buy}
      fontFamily={theme.monoFamily}
      fontSize="23"
      fontWeight="700"
      textAnchor="middle"
    >
      BUY $1
    </text>

    <line
      x1="450"
      y1="82"
      x2="450"
      y2="61"
      stroke={theme.colors.sell}
      strokeWidth={strokeWidth * 0.72}
    />
    <text
      x="450"
      y="48"
      fill={theme.colors.sell}
      fontFamily={theme.monoFamily}
      fontSize="23"
      fontWeight="700"
      textAnchor="middle"
    >
      SELL $6
    </text>

    <path
      d="M 171 305 C 245 273, 345 174, 428 126"
      fill="none"
      stroke={theme.colors.gain}
      strokeWidth={strokeWidth + 0.8}
      strokeLinecap="round"
      markerEnd="url(#packaging-profit-arrow)"
    />
  </svg>
);
