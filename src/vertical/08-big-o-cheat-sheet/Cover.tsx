import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  WIDTH,
} from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import { chartPath, SERIES, type Series } from "./ComplexityRace";
import { MAX_INPUT_SIZE } from "./measurements";

const MiniChart: React.FC<{
  series: Series;
  left: number;
  top: number;
  width: number;
  height: number;
}> = ({ series, left, top, width, height }) => {
  const chartLeft = 20;
  const chartTop = 52;
  const chartWidth = width - 40;
  const chartHeight = height - 76;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        borderRadius: 16,
        border: "1px solid #FFFFFF22",
        background: "linear-gradient(145deg, #12161B 0%, #090B0E 100%)",
        boxShadow: "0 14px 30px #00000042",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 20,
          fontFamily: theme.monoFamily,
          fontSize: 23,
          fontWeight: 700,
          color: theme.colors.chalk,
        }}
      >
        {series.label}
      </div>

      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ position: "absolute", inset: 0 }}
        aria-label={`${series.label} growth chart`}
      >
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
          x2={chartLeft + chartWidth}
          y2={chartTop + chartHeight}
          stroke="#697078"
          strokeWidth={1.5}
        />
        <path
          d={chartPath(series, chartWidth, chartLeft, chartTop, chartHeight)}
          fill="none"
          stroke={ACCENT}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={chartLeft + chartWidth}
          cy={
            chartTop + chartHeight - series.shape(MAX_INPUT_SIZE) * chartHeight
          }
          r={7}
          fill={ACCENT}
        />
      </svg>
    </div>
  );
};

export const BigOCheatSheetCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 50%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 38}>Big O cheat sheet</Eyebrow>
    <Headline top={SQUARE_TOP + 98} size={76}>
      Time complexity
    </Headline>
    <Headline top={SQUARE_TOP + 178} size={86} color={ACCENT}>
      visualized.
    </Headline>

    <MiniChart
      series={SERIES[0]}
      left={106}
      top={SQUARE_TOP + 304}
      width={392}
      height={176}
    />
    <MiniChart
      series={SERIES[1]}
      left={582}
      top={SQUARE_TOP + 304}
      width={392}
      height={176}
    />
    <MiniChart
      series={SERIES[2]}
      left={106}
      top={SQUARE_TOP + 504}
      width={392}
      height={176}
    />
    <MiniChart
      series={SERIES[3]}
      left={582}
      top={SQUARE_TOP + 504}
      width={392}
      height={176}
    />
    <MiniChart
      series={SERIES[4]}
      left={106}
      top={SQUARE_TOP + 704}
      width={868}
      height={190}
    />

    <div
      style={{
        position: "absolute",
        top: SQUARE_BOTTOM - 62,
        left: 0,
        width: WIDTH,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
