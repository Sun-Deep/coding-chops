import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import type { Reading } from "./readouts";

/**
 * The car's instruments as dials, beside each panel, reading the model on
 * every frame: a g-meter for the force on the car with a mark left at the
 * most it has felt, a speedometer for how fast it is going, a small car
 * seen from the front that turns over as the real one does, and a height
 * bar for the gap under it.
 *
 * Orange is the force on the car, the number the reel is about.
 */

export const GAUGES_W = 200;

const TRACK = "#34353B";
const TICK = "#8A8B8F";

/** A dial sweeps 240 degrees, from lower left round the top to lower right. */
const START = 150;
const SWEEP = 240;

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};

const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const a = polar(cx, cy, r, from);
  const b = polar(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
};

const Label: React.FC<{ y: number; x?: number; children: string }> = ({
  y,
  x = GAUGES_W / 2,
  children,
}) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    fontFamily={theme.monoFamily}
    fontSize={14}
    letterSpacing="0.1em"
    fill={TICK}
  >
    {children.toUpperCase()}
  </text>
);

/**
 * A dial. `at` maps a value to how far round the sweep it sits, 0 to 1.
 */
const Dial: React.FC<{
  cx: number;
  cy: number;
  r: number;
  value: number;
  peak?: number;
  at: (v: number) => number;
  ticks: readonly number[];
  /** The ticks that carry a number; the rest are marks only. */
  labels: readonly number[];
  color: string;
}> = ({ cx, cy, r, value, peak, at, ticks, labels, color }) => {
  const deg = (v: number) => START + SWEEP * Math.max(0, Math.min(1, at(v)));
  const tip = polar(cx, cy, r - 8, deg(value));
  return (
    <>
      <path
        d={arc(cx, cy, r, START, START + SWEEP)}
        stroke={TRACK}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
      />
      {value > 0 ? (
        <path
          d={arc(cx, cy, r, START, deg(value))}
          stroke={color}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
          opacity={0.9}
        />
      ) : null}
      {ticks.map((t) => {
        const a = polar(cx, cy, r + 6, deg(t));
        const b = polar(cx, cy, r + 11, deg(t));
        const l = polar(cx, cy, r + 21, deg(t));
        return (
          <g key={t}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={TICK}
              strokeWidth={1.5}
            />
            {labels.includes(t) ? (
              <text
                x={l.x}
                y={l.y + 4}
                textAnchor="middle"
                fontFamily={theme.monoFamily}
                fontSize={11}
                fill={TICK}
              >
                {t}
              </text>
            ) : null}
          </g>
        );
      })}
      {peak !== undefined && peak > 0 ? (
        <path
          d={(() => {
            const p = polar(cx, cy, r - 1, deg(peak));
            const a = (deg(peak) * Math.PI) / 180;
            const n = { x: Math.cos(a), y: Math.sin(a) };
            const t = { x: -n.y, y: n.x };
            const o = { x: p.x + n.x * 9, y: p.y + n.y * 9 };
            return `M ${p.x} ${p.y} L ${o.x + t.x * 5} ${o.y + t.y * 5} L ${o.x - t.x * 5} ${o.y - t.y * 5} Z`;
          })()}
          fill={ACCENT}
        />
      ) : null}
      <line
        x1={cx}
        y1={cy}
        x2={tip.x}
        y2={tip.y}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill={color} />
    </>
  );
};

/**
 * The car from the front, upside down at 0 degrees turned and the right way
 * up at 180, so it turns over as the car in the panel does.
 */
const Car: React.FC<{ cx: number; cy: number; turned: number }> = ({
  cx,
  cy,
  turned,
}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${180 - turned})`}>
    <path
      d="M -15 -9 Q -12 -19 0 -20 Q 12 -19 15 -9 Z"
      fill="#14171C"
      stroke={theme.colors.chalk}
      strokeWidth={1.5}
    />
    <rect
      x={-23}
      y={-10}
      width={46}
      height={14}
      rx={5}
      fill={theme.colors.chalk}
    />
    <rect x={-21} y={3} width={9} height={8} rx={2} fill="#14171C" />
    <rect x={12} y={3} width={9} height={8} rx={2} fill="#14171C" />
  </g>
);

const Value: React.FC<{
  x: number;
  y: number;
  value: string;
  unit: string;
  size: number;
  color?: string;
}> = ({ x, y, value, unit, size, color = theme.colors.chalk }) => (
  <text
    x={x}
    y={y}
    textAnchor="middle"
    fontFamily={theme.monoFamily}
    style={{ fontVariantNumeric: "tabular-nums" }}
  >
    <tspan fontSize={size} fontWeight={700} fill={color}>
      {value}
    </tspan>
    <tspan fontSize={size * 0.55} fill={TICK} dx={4}>
      {unit}
    </tspan>
  </text>
);

/** g-meter: stretched at the low end so 0, 1 and 2 g are as clear as 26. */
const G_MAX = 30;
const gAt = (g: number) => Math.sqrt(g / G_MAX);
const SPEED_MAX = 40;

export const Gauges: React.FC<{ r: Reading; height: number }> = ({
  r,
  height,
}) => {
  const kmh = r.speed * 3.6;
  const barTop = 300;
  const barBottom = height - 26;
  const barY = barBottom - (barBottom - barTop) * Math.min(1, r.height / 5);
  return (
    <svg width={GAUGES_W} height={height} style={{ overflow: "visible" }}>
      <Label y={12}>Force on the car</Label>
      <Dial
        cx={100}
        cy={88}
        r={60}
        value={r.g}
        peak={r.peak}
        at={gAt}
        ticks={[0, 1, 2, 5, 10, 20, 30]}
        labels={[0, 1, 2, 30]}
        color={ACCENT}
      />
      <Value
        x={100}
        y={140}
        value={r.g.toFixed(1)}
        unit="g"
        size={30}
        color={ACCENT}
      />
      <text
        x={100}
        y={160}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={13}
        fill={TICK}
      >
        PEAK {r.peak.toFixed(1)} g
      </text>

      <Label y={186}>Speed</Label>
      <Dial
        cx={100}
        cy={236}
        r={40}
        value={kmh}
        at={(v) => v / SPEED_MAX}
        ticks={[0, 10, 20, 30, 40]}
        labels={[0, 40]}
        color={theme.colors.chalk}
      />
      <Value x={100} y={278} value={kmh.toFixed(0)} unit="km/h" size={22} />

      <Label y={300} x={56}>
        Turned
      </Label>
      <circle cx={56} cy={330} r={26} fill="none" stroke={TRACK} />
      <g transform="translate(56 330) scale(1.15) translate(-56 -330)">
        <Car cx={56} cy={330} turned={r.turned} />
      </g>
      <Value
        x={56}
        y={height - 4}
        value={`${Math.round(r.turned)}°`}
        unit=""
        size={20}
      />

      <Label y={300} x={150}>
        Height
      </Label>
      <line
        x1={128}
        y1={barTop + 6}
        x2={128}
        y2={barBottom}
        stroke={TRACK}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <line
        x1={128}
        y1={barY}
        x2={128}
        y2={barBottom}
        stroke={theme.colors.chalk}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <text
        x={120}
        y={barTop + 10}
        textAnchor="end"
        fontFamily={theme.monoFamily}
        fontSize={11}
        fill={TICK}
      >
        5
      </text>
      <text
        x={120}
        y={barBottom + 4}
        textAnchor="end"
        fontFamily={theme.monoFamily}
        fontSize={11}
        fill={TICK}
      >
        0
      </text>
      <Value
        x={166}
        y={(barTop + barBottom) / 2 + 8}
        value={r.height.toFixed(1)}
        unit="m"
        size={22}
      />
    </svg>
  );
};
