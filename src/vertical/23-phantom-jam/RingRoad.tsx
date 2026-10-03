import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { Car, CAR_SHADES } from "./Car";
import { CAR_M, CARS, RING_M, SMOOTHER, carAt, type Track } from "./physics";

/**
 * One ring road seen from straight above, at night.
 *
 * Everything a viewer needs is something they already read while driving: a
 * car glowing red at the back is braking, cars packed nose to tail are stuck,
 * and a car trailing a long streak is moving fast. No label has to explain any
 * of it. The red is the one colour besides the accent, and it means braking
 * and nothing else.
 */

export const BRAKE = theme.colors.loss;
/** Lane plus shoulders, in metres. */
const ROAD_M = 4.8;
const ASPHALT = "#181C24";

export const RingRoad: React.FC<{
  id: string;
  cx: number;
  cy: number;
  r: number;
  track: Track;
  t: number;
  smoother: boolean;
  /** Opacity of the speed readout in the middle, so a camera move can hide it. */
  readout?: number;
  /** A figure pinned under the live one for comparison, km/h. */
  compare?: { label: string; kmh: number; opacity: number };
}> = ({ id, cx, cy, r, track, t, smoother, readout = 1, compare }) => {
  const pxPerM = (2 * Math.PI * r) / RING_M;
  const carL = CAR_M * pxPerM;
  const carW = 1.85 * pxPerM;
  const ROAD = ROAD_M * pxPerM;

  const cars = Array.from({ length: CARS }, (_, i) => {
    const c = carAt(track, i, t);
    const theta = (c.x / RING_M) * 2 * Math.PI - Math.PI / 2;
    return { i, ...c, theta };
  });
  const meanKmh = (cars.reduce((n, c) => n + c.v, 0) / CARS) * 3.6;

  return (
    <g>
      <defs>
        <filter
          id={`glow-${id}`}
          x="-200%"
          y="-200%"
          width="500%"
          height="500%"
        >
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter
          id={`soft-${id}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* The road: asphalt, two faint kerb lines, a broken centre line. */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={ASPHALT}
        strokeWidth={ROAD}
      />
      {[-1, 1].map((d) => (
        <circle
          key={d}
          cx={cx}
          cy={cy}
          r={r + (d * ROAD) / 2}
          fill="none"
          stroke={theme.colors.gray}
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
      ))}

      {/* Speed streaks: a fading tail behind each car, longer the faster it goes. */}
      {cars.map((c) => {
        const tail = Math.min(0.9, (c.v * 0.55 * pxPerM) / r);
        if (tail < 0.01) return null;
        const segs = 6;
        return Array.from({ length: segs }, (_, s) => {
          const a0 = c.theta - (tail * s) / segs - carL / 2 / r;
          const a1 = c.theta - (tail * (s + 1)) / segs - carL / 2 / r;
          return (
            <path
              key={`${c.i}-${s}`}
              d={`M ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 0 0 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)}`}
              fill="none"
              stroke={
                c.i === SMOOTHER && smoother ? ACCENT : theme.colors.chalk
              }
              strokeOpacity={0.22 * (1 - s / segs)}
              strokeWidth={carW * 0.8}
              strokeLinecap="round"
            />
          );
        });
      })}

      {cars.map((c) => {
        const x = cx + r * Math.cos(c.theta);
        const y = cy + r * Math.sin(c.theta);
        const deg = (c.theta * 180) / Math.PI + 180;
        const brake = interpolate(-c.a, [0.3, 2.5], [0, 1], clamp);
        const mine = smoother && c.i === SMOOTHER;
        return (
          <g key={c.i} transform={`translate(${x} ${y}) rotate(${deg})`}>
            {mine ? (
              <ellipse
                cx={0}
                cy={0}
                rx={carW * 1.6}
                ry={carL * 0.95}
                fill={ACCENT}
                opacity={0.28}
                filter={`url(#glow-${id})`}
              />
            ) : null}
            {/* Brake glow, behind the car. Heading is -y. */}
            {brake > 0 ? (
              <circle
                cx={0}
                cy={carL * 0.6}
                r={carW * 1.1}
                fill={BRAKE}
                opacity={0.85 * brake}
                filter={`url(#glow-${id})`}
              />
            ) : null}
            <Car
              id={`${id}-${c.i}`}
              scale={pxPerM}
              body={mine ? ACCENT : CAR_SHADES[c.i % CAR_SHADES.length]}
              brake={brake}
              brakeColor={BRAKE}
            />
          </g>
        );
      })}

      {/* Average speed of the whole ring, in the middle of it. */}
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={104}
        fontWeight={600}
        fill={theme.colors.chalk}
        opacity={readout}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {Math.round(meanKmh)}
      </text>
      <text
        x={cx}
        y={cy + 50}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={22}
        letterSpacing="0.16em"
        fill={theme.colors.grayDark}
        opacity={readout}
      >
        KM/H AVERAGE
      </text>
      {compare ? (
        <text
          x={cx}
          y={cy + 112}
          textAnchor="middle"
          fontFamily={theme.monoFamily}
          fontSize={26}
          letterSpacing="0.08em"
          fill={theme.colors.chalk}
          opacity={compare.opacity * 0.75}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {compare.label} {compare.kmh}
        </text>
      ) : null}
    </g>
  );
};
