import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { WIDTH } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { EASE_IN_OUT } from "../../shared/video/motion";
import { clamp } from "../../shared/video/timing";
import { PASS_FRAMES, YOU_JOIN, simAt } from "./beats";
import {
  SHOPPERS,
  TILLS,
  YOU,
  clock,
  type RuleKey,
  type Shopper,
} from "./measurements";
import { VISITS } from "./simulation";

/**
 * Two shops side by side, the same three tills, the same shoppers walking in
 * at the same seconds with the same checkouts. On the left everyone joins the
 * shortest line and stays in it. On the right there is one line behind a rope
 * and its front goes to whichever till comes free.
 *
 * Seen from above the floor plan, front of the line at the top: a shopper
 * walks in from the bottom, waits, steps up to a till, and leaves through it.
 *
 * The one orange thing is you, in both shops: the figure, the clock counting
 * your wait, and the count of people who joined after you and were served
 * before you.
 */

export const HEADLINE_TOP = 256;
const LABEL_TOP = 440;
const CLOCK_TOP = 470;
const COUNTER_TOP = 1200;

const MID = WIDTH / 2;
const TILL_GAP = 120;
/** Centre of till k on a side; the sides mirror about the middle. */
const tillX = (key: RuleKey, k: number) =>
  key === "shortest" ? MID - 330 + k * TILL_GAP : MID + 90 + k * TILL_GAP;
const laneCentre = (key: RuleKey) => tillX(key, 1);
const SHARED_X = tillX("shared", 1);

const DESK_Y = 610;
const SERVE_Y = 772;
const QUEUE_Y = 900;
const SPACING = 90;
const ENTRY_Y = 1140;

/** Simulated seconds for each walk. */
const ARRIVE = 5;
const STEP_UP = 4;
const LEAVE = 6;
const SHUFFLE = 3;

const LABELS: Record<RuleKey, string> = {
  shortest: "Shortest line",
  shared: "One shared line",
};

const ease = (u: number) => interpolate(u, [0, 1], [0, 1], EASE_IN_OUT);

const Figure: React.FC<{
  x: number;
  y: number;
  color: string;
  opacity: number;
}> = ({ x, y, color, opacity }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity} fill={color}>
    <circle cx={0} cy={-60} r={13} />
    <rect x={-16} y={-43} width={32} height={43} rx={12} />
  </g>
);

const ahead = (key: RuleKey, c: Shopper) =>
  SHOPPERS.filter(
    (a) =>
      (a.at < c.at || (a.at === c.at && a.id < c.id)) &&
      (key === "shared" ||
        VISITS.shortest[a.id].till === VISITS.shortest[c.id].till),
  );

/** How many people stand in front of c at t, easing down as each one steps up. */
const placeInLine = (key: RuleKey, c: Shopper, t: number) =>
  ahead(key, c).reduce((n, a) => {
    const start = VISITS[key][a.id].start;
    if (start <= c.at - SHUFFLE) return n;
    return n + 1 - ease(Math.min(1, Math.max(0, (t - start) / SHUFFLE)));
  }, 0);

const place = (key: RuleKey, c: Shopper, t: number) => {
  const v = VISITS[key][c.id];
  if (t < c.at || t > v.end + LEAVE) return null;
  const queueX = key === "shared" ? SHARED_X : tillX(key, v.till);

  const inLine = (time: number) => {
    const y = QUEUE_Y + placeInLine(key, c, time) * SPACING;
    const u = ease(Math.min(1, (time - c.at) / ARRIVE));
    return { x: queueX, y: ENTRY_Y + (y - ENTRY_Y) * u };
  };

  const appear = interpolate(t, [c.at, c.at + 1.5], [0, 1], clamp);
  if (t < v.start) return { ...inLine(t), opacity: appear };

  const from = inLine(v.start);
  if (t < v.start + STEP_UP) {
    const u = ease((t - v.start) / STEP_UP);
    return {
      x: from.x + (tillX(key, v.till) - from.x) * u,
      y: from.y + (SERVE_Y - from.y) * u,
      opacity: appear,
    };
  }
  if (t < v.end) return { x: tillX(key, v.till), y: SERVE_Y, opacity: 1 };
  const u = ease((t - v.end) / LEAVE);
  return {
    x: tillX(key, v.till),
    y: SERVE_Y + (DESK_Y + 10 - SERVE_Y) * u,
    opacity: interpolate(u, [0.25, 0.85], [1, 0], clamp),
  };
};

const Shop: React.FC<{ rule: RuleKey; t: number }> = ({ rule, t }) => (
  <g>
    {rule === "shared"
      ? // The rope either side of the one line.
        [-1, 1].map((d) => (
          <line
            key={d}
            x1={SHARED_X + d * 34}
            x2={SHARED_X + d * 34}
            y1={QUEUE_Y - 40}
            y2={ENTRY_Y - 30}
            stroke={theme.colors.gray}
            strokeOpacity={0.4}
            strokeWidth={3}
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
        ))
      : Array.from({ length: TILLS }, (_, k) => (
          <line
            key={k}
            x1={tillX(rule, k)}
            x2={tillX(rule, k)}
            y1={QUEUE_Y - 40}
            y2={ENTRY_Y - 30}
            stroke={theme.colors.gray}
            strokeOpacity={0.18}
            strokeWidth={2}
          />
        ))}

    {Array.from({ length: TILLS }, (_, k) => (
      <g key={k}>
        <rect
          x={tillX(rule, k) - 50}
          y={DESK_Y}
          width={100}
          height={40}
          rx={5}
          fill="#1A202B"
          stroke={theme.colors.chalk}
          strokeOpacity={0.8}
          strokeWidth={2.5}
        />
        <line
          x1={tillX(rule, k) - 34}
          x2={tillX(rule, k) + 34}
          y1={DESK_Y + 20}
          y2={DESK_Y + 20}
          stroke={theme.colors.gray}
          strokeWidth={2}
          strokeDasharray="6 6"
        />
      </g>
    ))}

    {SHOPPERS.map((c) => {
      const p = place(rule, c, t);
      if (!p) return null;
      const you = c.id === YOU;
      return (
        <g key={c.id}>
          <Figure
            x={p.x}
            y={p.y}
            color={you ? ACCENT : theme.colors.chalk}
            opacity={p.opacity * (you ? 1 : 0.72)}
          />
          {you && t < VISITS[rule][c.id].start ? (
            <text
              x={p.x}
              y={p.y - 84}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={20}
              letterSpacing="0.12em"
              fill={ACCENT}
              opacity={p.opacity}
            >
              YOU
            </text>
          ) : null}
        </g>
      );
    })}
  </g>
);

const Readout: React.FC<{
  rule: RuleKey;
  top: number;
  label: string;
  value: string;
  opacity?: number;
  weight?: number;
}> = ({ rule, top, label, value, opacity = 1, weight = 500 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: laneCentre(rule) - 190,
      width: 380,
      textAlign: "center",
      fontFamily: theme.monoFamily,
      fontVariantNumeric: "tabular-nums",
      color: ACCENT,
      opacity,
      fontSize: 44,
      fontWeight: weight,
      letterSpacing: "-0.02em",
    }}
  >
    <span style={{ fontSize: 21, letterSpacing: "0.16em", marginRight: 14 }}>
      {label}
    </span>
    {value}
  </div>
);

export const Checkout: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  const joined = frame >= YOU_JOIN;

  return (
    <>
      {(["shortest", "shared"] as const).map((rule) => {
        const wait = VISITS[rule][YOU].start - SHOPPERS[YOU].at;
        const sofar = Math.min(wait, Math.max(0, t - SHOPPERS[YOU].at));
        const passed =
          rule === "shortest"
            ? PASS_FRAMES.filter((p) => p <= frame).length
            : 0;
        return (
          <div key={rule}>
            <div
              style={{
                position: "absolute",
                top: LABEL_TOP,
                left: laneCentre(rule) - 200,
                width: 400,
                textAlign: "center",
                fontFamily: theme.monoFamily,
                fontSize: 23,
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: theme.colors.chalk,
              }}
            >
              {LABELS[rule]}
            </div>
            <Readout
              rule={rule}
              top={CLOCK_TOP}
              label="YOUR WAIT"
              value={clock(sofar)}
              opacity={joined ? 1 : 0.4}
              weight={sofar >= wait ? 700 : 500}
            />
            <Readout
              rule={rule}
              top={COUNTER_TOP}
              label="PASSED YOU"
              value={String(passed)}
              opacity={joined ? 1 : 0.4}
            />
          </div>
        );
      })}

      <svg
        width={WIDTH}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <line
          x1={MID}
          x2={MID}
          y1={DESK_Y - 20}
          y2={ENTRY_Y}
          stroke={theme.colors.gray}
          strokeOpacity={0.3}
          strokeWidth={2}
        />
        <Shop rule="shortest" t={t} />
        <Shop rule="shared" t={t} />
      </svg>
    </>
  );
};
