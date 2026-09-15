import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { clamp } from "../../shared/video/timing";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import {
  countForInput,
  MAX_INPUT_SIZE,
  type ComplexityCounts,
} from "./measurements";

const RACE_END = 419;
const SMALL_WIDTH = 434;
const SMALL_HEIGHT = 260;

type ComplexityKey = Exclude<keyof ComplexityCounts, "n">;

export type Series = {
  key: ComplexityKey;
  label: string;
  code: string;
  shape: (n: number) => number;
};

export const SERIES: readonly Series[] = [
  {
    key: "constant",
    label: "O(1)",
    code: "items[0]",
    shape: () => 0.2,
  },
  {
    key: "logarithmic",
    label: "O(log n)",
    code: "for (s = n; s; s >>= 1)",
    shape: (n) => (Math.log2(n) + 1) / 11,
  },
  {
    key: "linear",
    label: "O(n)",
    code: "for (i = 0; i < n; i++)",
    shape: (n) => n / MAX_INPUT_SIZE,
  },
  {
    key: "linearithmic",
    label: "O(n log n)",
    code: "for (i < n) for (s = n; s; s >>= 1)",
    shape: (n) => (n * (Math.log2(n) + 1)) / (MAX_INPUT_SIZE * 11),
  },
  {
    key: "quadratic",
    label: "O(n²)",
    code: "for (i < n) for (j < n)",
    shape: (n) => (n * n) / (MAX_INPUT_SIZE * MAX_INPUT_SIZE),
  },
];

export const chartPath = (
  series: Series,
  width: number,
  left: number,
  top: number,
  chartHeight: number,
) =>
  Array.from({ length: 65 }, (_, index) => {
    const n = 1 + (index / 64) * (MAX_INPUT_SIZE - 1);
    const x = left + ((n - 1) / (MAX_INPUT_SIZE - 1)) * width;
    const y = top + chartHeight - series.shape(n) * chartHeight;
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

const ComplexityCard: React.FC<{
  series: Series;
  count: number;
  nFloat: number;
  left: number;
  top: number;
  width: number;
  height: number;
  pulse: number;
}> = ({ series, count, nFloat, left, top, width, height, pulse }) => {
  const chartLeft = 24;
  const chartTop = 64;
  const chartWidth = width - 48;
  const chartHeight = height - 138;
  const progress = (nFloat - 1) / (MAX_INPUT_SIZE - 1);
  const markerX = chartLeft + progress * chartWidth;
  const markerY = chartTop + chartHeight - series.shape(nFloat) * chartHeight;
  const glow = 0.32 + pulse * 0.28;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        overflow: "hidden",
        borderRadius: 18,
        border: `1px solid rgba(255, 255, 255, ${0.14 + pulse * 0.06})`,
        background: "linear-gradient(145deg, #12161B 0%, #090B0E 100%)",
        boxShadow: "0 16px 34px #0000004A",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 24,
          top: 17,
          fontFamily: theme.monoFamily,
          fontSize: 24,
          fontWeight: 700,
          color: theme.colors.chalk,
        }}
      >
        {series.label}
      </div>
      <div
        style={{
          position: "absolute",
          right: 24,
          top: 20,
          fontFamily: theme.monoFamily,
          fontSize: 18,
          fontWeight: 600,
          color: ACCENT,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count.toLocaleString()} ops
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
        aria-label={`${series.label} growth chart`}
      >
        <defs>
          <filter
            id={`point-glow-${series.key}`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`line-reveal-${series.key}`}>
            <rect
              x={chartLeft - 4}
              y={chartTop - 8}
              width={Math.max(0, chartWidth * progress + 8)}
              height={chartHeight + 16}
            />
          </clipPath>
        </defs>
        {[0, 0.5, 1].map((fraction) => (
          <line
            key={fraction}
            x1={chartLeft}
            y1={chartTop + chartHeight * fraction}
            x2={markerX}
            y2={chartTop + chartHeight * fraction}
            stroke="#4B5157"
            strokeOpacity={0.18 + progress * 0.18}
            strokeWidth={1}
          />
        ))}
        <line
          x1={chartLeft}
          y1={chartTop}
          x2={chartLeft}
          y2={chartTop + chartHeight}
          stroke="#697078"
          strokeWidth={1.5}
        />
        <line
          x1={chartLeft}
          y1={chartTop + chartHeight}
          x2={markerX}
          y2={chartTop + chartHeight}
          stroke="#697078"
          strokeWidth={1.5}
        />
        <path
          d={chartPath(series, chartWidth, chartLeft, chartTop, chartHeight)}
          fill="none"
          stroke="#E7E1D7"
          strokeWidth={series.key === "constant" ? 4 : 5}
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath={`url(#line-reveal-${series.key})`}
        />
        <line
          x1={markerX}
          y1={chartTop - 3}
          x2={markerX}
          y2={chartTop + chartHeight + 3}
          stroke={ACCENT}
          strokeWidth={2}
          opacity={glow}
        />
        <circle
          cx={markerX}
          cy={markerY}
          r={7 + pulse * 2}
          fill={ACCENT}
          filter={`url(#point-glow-${series.key})`}
        />
        <text
          x={chartLeft + 2}
          y={chartTop + 15}
          fill="#858A8E"
          fontFamily={theme.monoFamily}
          fontSize={13}
          letterSpacing="2"
        >
          WORK
        </text>
        <text
          x={Math.max(chartLeft + 34, markerX)}
          y={chartTop + chartHeight - 9}
          fill="#858A8E"
          fontFamily={theme.monoFamily}
          fontSize={13}
          letterSpacing="2"
          textAnchor="end"
          opacity={interpolate(progress, [0.04, 0.12], [0, 1], clamp)}
        >
          n →
        </text>
      </svg>

      <div
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 14,
          height: 36,
          display: "flex",
          alignItems: "center",
          padding: "0 13px",
          overflow: "hidden",
          whiteSpace: "nowrap",
          borderRadius: 8,
          background: "#050607",
          borderLeft: `3px solid ${ACCENT}`,
          fontFamily: theme.monoFamily,
          fontSize: width > SMALL_WIDTH ? 21 : 17,
          color: "#C9C5BD",
        }}
      >
        {series.code}
      </div>
    </div>
  );
};

export const ComplexityRace: React.FC = () => {
  const frame = useCurrentFrame();
  const timeProgress = interpolate(frame, [0, RACE_END], [0, 1], clamp);
  const growthProgress = timeProgress * (0.72 + 0.28 * timeProgress);
  const nFloat = 1 + (MAX_INPUT_SIZE - 1) * growthProgress;
  const counts = countForInput(nFloat);
  const pulse = (Math.sin(frame * 0.24) + 1) / 2;

  return (
    <>
      <Eyebrow top={244}>Time complexity</Eyebrow>
      <Headline top={286} size={62}>
        Same input. Five outcomes.
      </Headline>
      <div
        style={{
          position: "absolute",
          top: 382,
          left: 94,
          width: 892,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: "0.15em",
          color: theme.colors.grayDark,
        }}
      >
        OWN Y-SCALES · EXACT LOOP OPS · n = {counts.n}
      </div>

      <ComplexityCard
        series={SERIES[0]}
        count={counts.constant}
        nFloat={nFloat}
        left={94}
        top={424}
        width={SMALL_WIDTH}
        height={SMALL_HEIGHT}
        pulse={pulse}
      />
      <ComplexityCard
        series={SERIES[1]}
        count={counts.logarithmic}
        nFloat={nFloat}
        left={552}
        top={424}
        width={SMALL_WIDTH}
        height={SMALL_HEIGHT}
        pulse={pulse}
      />
      <ComplexityCard
        series={SERIES[2]}
        count={counts.linear}
        nFloat={nFloat}
        left={94}
        top={708}
        width={SMALL_WIDTH}
        height={SMALL_HEIGHT}
        pulse={pulse}
      />
      <ComplexityCard
        series={SERIES[3]}
        count={counts.linearithmic}
        nFloat={nFloat}
        left={552}
        top={708}
        width={SMALL_WIDTH}
        height={SMALL_HEIGHT}
        pulse={pulse}
      />
      <ComplexityCard
        series={SERIES[4]}
        count={counts.quadratic}
        nFloat={nFloat}
        left={94}
        top={992}
        width={824}
        height={320}
        pulse={pulse}
      />
    </>
  );
};
