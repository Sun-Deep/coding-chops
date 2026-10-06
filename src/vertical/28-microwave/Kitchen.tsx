import { Easing, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { VERDICT_FROM, WALK, frameAt, simAt } from "./beats";
import { CONDITIONS } from "./measurements";
import { LONGEST, RUNS, clock } from "./runs";
import { HANDLE, type Rule, type Served } from "./simulation";

/**
 * Two office kitchens, one over the other, the same eight people in the
 * same order in each. On top they use the microwave in the order they
 * arrived; below, whoever has the shortest heating time goes next and walks
 * past everyone ahead of them.
 *
 * Orange is one person: the 3:00 lunch, first in line. On top they go
 * straight in and everyone waits behind them; below they are skipped by
 * everyone and go last. Each tag says how long that person will heat their
 * food, and turns into how long they waited once they reach the microwave.
 */

export const HEADLINE_TOP = 256;
const PROVENANCE_TOP = 430;
const PANEL_X = 150;
const PANEL_W = 780;
const SCENE_H = 372;
const K = 145;
const FLOOR = 326;
const PANELS: { rule: Rule; label: string; top: number }[] = [
  { rule: "fifo", label: "First come, first served", top: 466 },
  { rule: "sjf", label: "Shortest first", top: 886 },
];
const LABEL_H = 38;

const COUNTER_W = 250;
const COUNTER_TOP = FLOOR - 0.92 * K;
const MW = { x: 22, w: 206, h: 124 };
const AT_MW = 300;
const LINE_X0 = 392;
const SPACING = 56;
const OFF = -90;

const SKIN = ["#E3C7A8", "#C9A88A", "#A57E62", "#8D6A52", "#6B4E3A", "#D8B595"];
const HAIR = ["#1E1A17", "#3B2A20", "#5A4632", "#2A2724", "#8C7B6A", "#141210"];
const TOPS = ["#3A3F4A", "#5A5F69", "#7D8089", "#2B2F37", "#9A9CA2", "#4B4339"];
const TROUSERS = ["#1E2230", "#2A2C31", "#3E4C63", "#5C5446", "#17181B"];
const pick = <T,>(xs: readonly T[], n: number) => xs[Math.abs(n) % xs.length];

type Look = {
  readonly height: number;
  readonly build: number;
  readonly top: "shirt" | "sweater" | "blazer" | "hoodie";
  readonly topColor: string;
  readonly trousers: string;
  readonly skin: string;
  readonly hair: string;
  readonly style: "short" | "long" | "bun" | "curly" | "bald";
  readonly lanyard: boolean;
};

/** Eight different people, fixed by id, so they look the same in both kitchens. */
const lookOf = (id: number, orange: boolean): Look => ({
  height: [1.0, 0.95, 1.05, 0.97, 1.03, 0.93, 1.0, 1.06][id % 8],
  build: [1.0, 0.92, 1.1, 0.96, 1.05, 0.9, 1.12, 0.98][id % 8],
  top: (
    [
      "sweater",
      "shirt",
      "blazer",
      "hoodie",
      "shirt",
      "sweater",
      "blazer",
      "hoodie",
    ] as const
  )[id % 8],
  topColor: orange ? ACCENT : pick(TOPS, id * 5 + 2),
  trousers: pick(TROUSERS, id * 3 + 1),
  skin: pick(SKIN, id * 5 + 4),
  hair: pick(HAIR, id * 3 + 2),
  style: (
    ["short", "long", "bun", "curly", "short", "long", "bald", "short"] as const
  )[id % 8],
  lanyard: id % 3 !== 1,
});

/**
 * What someone brings tells you how long it takes: a mug of coffee, a bowl of
 * soup, a box of leftovers, a frozen meal. Drawn in metres, centred.
 */
export const Dish: React.FC<{ cook: number; orange: boolean }> = ({
  cook,
  orange,
}) => {
  if (cook <= 30)
    return (
      <g>
        <path
          d="M 0.07 -0.06 Q 0.13 -0.06 0.13 0 Q 0.13 0.05 0.07 0.05"
          fill="none"
          stroke="#D9D5CB"
          strokeWidth={0.02}
        />
        <rect
          x={-0.07}
          y={-0.09}
          width={0.14}
          height={0.16}
          rx={0.02}
          fill="#D9D5CB"
        />
        <rect x={-0.07} y={-0.09} width={0.14} height={0.025} fill="#4B4339" />
      </g>
    );
  if (cook <= 60)
    return (
      <g>
        <path
          d="M -0.15 -0.04 Q -0.14 0.08 0 0.08 Q 0.14 0.08 0.15 -0.04 Z"
          fill="#D9D5CB"
        />
        <ellipse cx={0} cy={-0.04} rx={0.15} ry={0.03} fill="#B9B6AF" />
      </g>
    );
  if (cook <= 120)
    return (
      <g>
        <rect
          x={-0.17}
          y={-0.05}
          width={0.34}
          height={0.11}
          rx={0.025}
          fill="#C9D0D6"
          opacity={0.9}
        />
        <rect
          x={-0.15}
          y={-0.03}
          width={0.3}
          height={0.07}
          rx={0.015}
          fill="#8C6B4F"
          opacity={0.7}
        />
        <rect
          x={-0.18}
          y={-0.075}
          width={0.36}
          height={0.035}
          rx={0.015}
          fill="#7D8089"
        />
      </g>
    );
  return (
    <g>
      <rect
        x={-0.19}
        y={-0.06}
        width={0.38}
        height={0.12}
        rx={0.01}
        fill="#E9E4D8"
      />
      <rect
        x={-0.19}
        y={-0.06}
        width={0.38}
        height={0.035}
        fill={orange ? ACCENT : "#8E9096"}
      />
      <rect
        x={-0.15}
        y={-0.012}
        width={0.14}
        height={0.05}
        rx={0.006}
        fill="#B9B6AF"
      />
    </g>
  );
};

/** A person front on, feet at (x, floor), holding their lunch. */
const Person: React.FC<{
  x: number;
  floor: number;
  id: number;
  cook: number;
  orange: boolean;
  stride: number | null;
  holding: boolean;
}> = ({ x, floor, id, cook, orange, stride, holding }) => {
  const l = lookOf(id, orange);
  const fwd = stride !== null ? Math.sin(stride) : 0;
  const bob = stride !== null ? 0.025 * Math.abs(Math.cos(stride)) : 0;
  const w = l.build;
  const torso = `M ${-0.21 * w} -0.82 L ${-0.24 * w} -1.38 Q ${-0.24 * w} -1.47 ${-0.15 * w} -1.48 L ${0.15 * w} -1.48 Q ${0.24 * w} -1.47 ${0.24 * w} -1.38 L ${0.21 * w} -0.82 Z`;
  const leg = (hipX: number, f: number) => {
    const lift = Math.max(0, f) * 0.09;
    return (
      <g key={hipX}>
        <path
          d={`M ${hipX - 0.065} -0.86 L ${hipX + 0.065} -0.86 L ${hipX + 0.058} ${-0.06 - lift} L ${hipX - 0.058} ${-0.06 - lift} Z`}
          fill={l.trousers}
        />
        <path
          d={`M ${hipX - 0.07} ${-0.06 - lift} L ${hipX + 0.07} ${-0.06 - lift} Q ${hipX + 0.09} ${-0.01 - lift} ${hipX + 0.06} ${-lift} L ${hipX - 0.07} ${-lift} Z`}
          fill="#0B0C0F"
        />
      </g>
    );
  };
  const sleeve = (side: number) =>
    holding ? (
      <path
        d={`M ${side * 0.27 * w} -1.42 L ${side * 0.2 * w} -1.42 L ${side * 0.14} -1.06 L ${side * 0.23} -1.02 Z`}
        fill={l.topColor}
      />
    ) : (
      <rect
        x={side > 0 ? 0.21 * w : -0.29 * w}
        y={-1.42 - side * 0.05 * fwd}
        width={0.08}
        height={0.56}
        rx={0.04}
        fill={l.topColor}
      />
    );
  const hair = (() => {
    switch (l.style) {
      case "long":
        return (
          <path
            d="M -0.115 -1.62 Q -0.12 -1.79 0 -1.79 Q 0.12 -1.79 0.115 -1.62 L 0.12 -1.47 L 0.07 -1.5 L 0.08 -1.66 Q 0 -1.72 -0.08 -1.66 L -0.07 -1.5 L -0.12 -1.47 Z"
            fill={l.hair}
          />
        );
      case "bun":
        return (
          <g fill={l.hair}>
            <circle cx={0} cy={-1.8} r={0.05} />
            <path d="M -0.105 -1.64 Q -0.11 -1.78 0 -1.78 Q 0.11 -1.78 0.105 -1.64 Q 0.06 -1.71 0 -1.71 Q -0.06 -1.71 -0.105 -1.64 Z" />
          </g>
        );
      case "curly":
        return (
          <g fill={l.hair}>
            {[-0.08, -0.03, 0.03, 0.08].map((cx) => (
              <circle key={cx} cx={cx} cy={-1.75} r={0.045} />
            ))}
            <circle cx={-0.1} cy={-1.68} r={0.035} />
            <circle cx={0.1} cy={-1.68} r={0.035} />
          </g>
        );
      case "bald":
        return null;
      default:
        return (
          <path
            d="M -0.105 -1.64 Q -0.11 -1.78 0 -1.78 Q 0.11 -1.78 0.105 -1.64 Q 0.06 -1.71 0 -1.71 Q -0.06 -1.71 -0.105 -1.64 Z"
            fill={l.hair}
          />
        );
    }
  })();
  return (
    <g
      transform={`translate(${x} ${floor}) scale(${K * l.height} ${K * l.height})`}
    >
      <ellipse cx={0} cy={0} rx={0.28} ry={0.05} fill="#000" opacity={0.45} />
      {leg(-0.075, fwd)}
      {leg(0.075, -fwd)}
      <g transform={`translate(0 ${-bob})`}>
        {l.top === "hoodie" ? (
          <g>
            <path
              d="M -0.13 -1.5 Q 0 -1.58 0.13 -1.5 L 0.1 -1.44 L -0.1 -1.44 Z"
              fill={l.topColor}
            />
            <path
              d="M -0.13 -1.5 Q 0 -1.58 0.13 -1.5 L 0.1 -1.44 L -0.1 -1.44 Z"
              fill="#000"
              opacity={0.3}
            />
          </g>
        ) : null}
        <path d={torso} fill={l.topColor} />
        <path d={torso} fill="url(#torso-shade)" />
        {l.top === "shirt" ? (
          <path
            d="M -0.07 -1.48 L 0 -1.38 L 0.07 -1.48 Z"
            fill="#E9E4D8"
            opacity={0.85}
          />
        ) : null}
        {l.top === "blazer" ? (
          <>
            <path
              d="M -0.06 -1.48 L 0 -1.3 L 0.06 -1.48 Z"
              fill="#E9E4D8"
              opacity={0.85}
            />
            <path
              d="M -0.06 -1.48 L -0.01 -1.25 L -0.1 -1.4 Z"
              fill="#000"
              opacity={0.25}
            />
            <path
              d="M 0.06 -1.48 L 0.01 -1.25 L 0.1 -1.4 Z"
              fill="#000"
              opacity={0.25}
            />
          </>
        ) : null}
        {l.top === "hoodie" ? (
          <>
            <line
              x1={-0.04}
              x2={-0.045}
              y1={-1.46}
              y2={-1.32}
              stroke="#E9E4D8"
              strokeWidth={0.012}
              opacity={0.6}
            />
            <line
              x1={0.04}
              x2={0.045}
              y1={-1.46}
              y2={-1.32}
              stroke="#E9E4D8"
              strokeWidth={0.012}
              opacity={0.6}
            />
          </>
        ) : null}
        {l.lanyard ? (
          <>
            <path
              d="M -0.06 -1.48 L 0 -1.2 L 0.06 -1.48"
              fill="none"
              stroke="#C8C7C2"
              strokeWidth={0.012}
              opacity={0.7}
            />
            <rect
              x={-0.035}
              y={-1.2}
              width={0.07}
              height={0.09}
              rx={0.01}
              fill="#E9E4D8"
              opacity={0.85}
            />
          </>
        ) : null}
        {sleeve(-1)}
        {sleeve(1)}
        {holding ? (
          <>
            <g transform="translate(0 -1.02)">
              <Dish cook={cook} orange={orange} />
            </g>
            <circle cx={-0.19} cy={-1.0} r={0.038} fill={l.skin} />
            <circle cx={0.19} cy={-1.0} r={0.038} fill={l.skin} />
          </>
        ) : null}
        <rect x={-0.045} y={-1.56} width={0.09} height={0.1} fill={l.skin} />
        <rect
          x={-0.045}
          y={-1.56}
          width={0.09}
          height={0.1}
          fill="#000"
          opacity={0.18}
        />
        <ellipse cx={-0.1} cy={-1.64} rx={0.018} ry={0.03} fill={l.skin} />
        <ellipse cx={0.1} cy={-1.64} rx={0.018} ry={0.03} fill={l.skin} />
        <ellipse cx={0} cy={-1.64} rx={0.1} ry={0.12} fill={l.skin} />
        <ellipse cx={0} cy={-1.64} rx={0.1} ry={0.12} fill="url(#face-shade)" />
        {hair}
      </g>
    </g>
  );
};

const ease = Easing.bezier(0.45, 0, 0.55, 1);

/**
 * The average wait so far: everyone's time in line up to now, over the eight
 * of them. It climbs while people wait and stops at the measured average once
 * the last person reaches the microwave.
 */
const averageSoFar = (run: readonly Served[], t: number) =>
  run.reduce((a, p) => a + Math.max(0, Math.min(t, p.start) - p.arrive), 0) /
  run.length;

/** Where a person stands at sim time t: in line, at the microwave, or gone. */
const targetAt = (run: readonly Served[], p: Served, t: number) => {
  if (t >= p.end) return OFF;
  if (t >= p.start) return AT_MW;
  const ahead = run.filter((q) => q.start > t && q.id < p.id).length;
  return LINE_X0 + ahead * SPACING;
};

/**
 * Screen x at a frame, walking between targets over WALK frames after each
 * change, so a walk takes the same time on screen whatever the clock does.
 */
const placeAt = (run: readonly Served[], p: Served, frame: number) => {
  const t = simAt(frame);
  const events = run
    .flatMap((q) => [q.start, q.end])
    .filter((e) => e <= t)
    .sort((a, b) => b - a);
  for (const e of events) {
    const before = targetAt(run, p, e - 0.001);
    const after = targetAt(run, p, e);
    if (before === after) continue;
    const u = Math.min(1, Math.max(0, (frame - frameAt(e)) / WALK));
    return { x: before + (after - before) * ease(u), moving: u < 1, u };
  }
  const x = targetAt(run, p, t);
  return { x, moving: false, u: 1 };
};

const Tag: React.FC<{
  x: number;
  y: number;
  text: string;
  orange: boolean;
  small?: boolean;
  /** Raised this far, on a stem, so neighbours' tags do not overlap. */
  lift?: number;
}> = ({ x, y, text, orange, small = false, lift = 0 }) => {
  const size = small ? 17 : 20;
  const w = text.length * size * 0.62 + 16;
  return (
    <g transform={`translate(${x} ${y - lift})`}>
      {lift > 0 ? (
        <line
          x1={0}
          x2={0}
          y1={12}
          y2={12 + lift}
          stroke={orange ? ACCENT : "#3A3F4A"}
          strokeWidth={1.5}
        />
      ) : null}
      <rect
        x={-w / 2}
        y={-size}
        width={w}
        height={size + 12}
        rx={8}
        fill="#0B0C0F"
        stroke={orange ? ACCENT : "#3A3F4A"}
        strokeWidth={orange ? 2.5 : 1.5}
      />
      <text
        x={0}
        y={-2}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={size}
        fontWeight={700}
        fill={orange ? ACCENT : theme.colors.chalk}
      >
        {text}
      </text>
    </g>
  );
};

const Microwave: React.FC<{ run: readonly Served[]; t: number }> = ({
  run,
  t,
}) => {
  const now = run.find((p) => t >= p.start && t < p.end);
  const cooking =
    now && t >= now.start + HANDLE / 2 && t < now.end - HANDLE / 2;
  const left = now
    ? Math.max(0, Math.min(now.cook, now.end - HANDLE / 2 - t))
    : 0;
  const y = COUNTER_TOP - MW.h;
  const win = { x: MW.x + 14, y: y + 14, w: MW.w * 0.66, h: MW.h - 28 };
  const spin = Math.sin((t / 10) * 2 * Math.PI) * 8;
  return (
    <g>
      {/* The interior lamp spills onto the counter while it runs. */}
      {cooking ? (
        <ellipse
          cx={MW.x + MW.w * 0.4}
          cy={COUNTER_TOP + 2}
          rx={MW.w * 0.55}
          ry={10}
          fill="#F3E3C0"
          opacity={0.12}
        />
      ) : null}
      <rect
        x={MW.x + 6}
        y={y + MW.h - 4}
        width={MW.w - 12}
        height={8}
        rx={3}
        fill="#000"
        opacity={0.5}
      />
      <rect x={MW.x} y={y} width={MW.w} height={MW.h} rx={10} fill="#B9B6AF" />
      <rect
        x={MW.x}
        y={y}
        width={MW.w}
        height={MW.h}
        rx={10}
        fill="url(#mw-shade)"
      />
      <rect
        x={win.x}
        y={win.y}
        width={win.w}
        height={win.h}
        rx={6}
        fill="#0E1014"
      />
      {cooking ? (
        <rect
          x={win.x}
          y={win.y}
          width={win.w}
          height={win.h}
          rx={6}
          fill="#F3E3C0"
          opacity={0.32}
        />
      ) : null}
      <ellipse
        cx={win.x + win.w / 2}
        cy={win.y + win.h - 12}
        rx={win.w * 0.4}
        ry={7}
        fill="#2A2E36"
      />
      {now ? (
        <g
          transform={`translate(${win.x + win.w / 2 + spin} ${win.y + win.h - 24}) scale(140)`}
        >
          <Dish cook={now.cook} orange={now.id === LONGEST} />
        </g>
      ) : null}
      {/* Glass: a soft diagonal reflection, there whether it is on or not. */}
      <path
        d={`M ${win.x + 10} ${win.y + win.h} L ${win.x + 46} ${win.y} L ${win.x + 64} ${win.y} L ${win.x + 28} ${win.y + win.h} Z`}
        fill="#fff"
        opacity={0.05}
      />
      <rect
        x={win.x + win.w + 6}
        y={win.y + 6}
        width={6}
        height={win.h - 12}
        rx={3}
        fill="#8E9096"
      />
      <rect
        x={MW.x + MW.w * 0.72}
        y={y + 18}
        width={MW.w * 0.22}
        height={28}
        rx={4}
        fill="#0B0C0F"
      />
      <text
        x={MW.x + MW.w * 0.83}
        y={y + 39}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={19}
        fontWeight={700}
        fill={theme.colors.chalk}
        opacity={now ? 1 : 0.35}
      >
        {now ? clock(left) : "0:00"}
      </text>
      {[0, 1, 2].map((r) =>
        [0, 1].map((c) => (
          <rect
            key={`${r}${c}`}
            x={MW.x + MW.w * 0.74 + c * 22}
            y={y + 58 + r * 16}
            width={16}
            height={10}
            rx={2}
            fill="#8E9096"
          />
        )),
      )}
    </g>
  );
};

/**
 * The kitchen around the line: wall cabinets and a tiled splashback over the
 * counter, a lamp over the microwave lighting the wall, a rail along the wall
 * at counter height, and a floor that runs back from the camera. Nothing here
 * moves; it is there so the place reads as a place.
 */
const Room: React.FC = () => {
  const tiles: React.ReactNode[] = [];
  const top = 66;
  for (let r = 0; top + r * 22 < COUNTER_TOP - 8; r++) {
    const y = top + r * 22;
    tiles.push(
      <line
        key={`h${r}`}
        x1={0}
        x2={COUNTER_W}
        y1={y}
        y2={y}
        stroke="#2A2E36"
        strokeWidth={1.5}
      />,
    );
    for (let c = 0; c < 7; c++) {
      const x = c * 44 + (r % 2 ? 22 : 0);
      tiles.push(
        <line
          key={`v${r}-${c}`}
          x1={x}
          x2={x}
          y1={y}
          y2={Math.min(y + 22, COUNTER_TOP - 8)}
          stroke="#2A2E36"
          strokeWidth={1.5}
        />,
      );
    }
  }
  const vx = PANEL_W * 0.62;
  return (
    <g>
      <rect x={0} y={0} width={PANEL_W} height={SCENE_H} fill="#15181D" />
      <rect
        x={0}
        y={0}
        width={PANEL_W}
        height={FLOOR}
        fill="url(#wall-light)"
      />
      {/* Splashback, then wall cabinets with their doors and handles. */}
      <rect
        x={0}
        y={top}
        width={COUNTER_W}
        height={COUNTER_TOP - top}
        fill="#1D2027"
      />
      {tiles}
      <rect
        x={0}
        y={0}
        width={COUNTER_W + 10}
        height={top - 6}
        fill="#262A32"
      />
      <rect
        x={0}
        y={top - 8}
        width={COUNTER_W + 10}
        height={4}
        fill="#000"
        opacity={0.35}
      />
      {[0, 1, 2].map((d) => (
        <g key={d}>
          <rect
            x={6 + d * 84}
            y={6}
            width={78}
            height={top - 18}
            rx={3}
            fill="#2C3038"
          />
          <rect
            x={d * 84 + (d % 2 ? 14 : 72)}
            y={top - 30}
            width={4}
            height={14}
            rx={2}
            fill="#8E9096"
          />
        </g>
      ))}
      {/* Wall rail at counter height and a skirting board along the line. */}
      <rect
        x={COUNTER_W}
        y={COUNTER_TOP - 2}
        width={PANEL_W - COUNTER_W}
        height={5}
        fill="#22262E"
      />
      <rect x={0} y={FLOOR - 8} width={PANEL_W} height={8} fill="#1D2027" />
      {/* Floor tiles running back towards a point above the line. */}
      <rect
        x={0}
        y={FLOOR}
        width={PANEL_W}
        height={SCENE_H - FLOOR}
        fill="#101216"
      />
      {Array.from({ length: 15 }, (_, i) => {
        const xb = -PANEL_W * 0.4 + (i * (PANEL_W * 1.8)) / 14;
        const xt = vx + (xb - vx) * 0.55;
        return (
          <line
            key={`f${i}`}
            x1={xt}
            y1={FLOOR}
            x2={xb}
            y2={SCENE_H}
            stroke="#1B1E24"
            strokeWidth={1.5}
          />
        );
      })}
      {[0.35, 0.75].map((u) => (
        <line
          key={`fh${u}`}
          x1={0}
          x2={PANEL_W}
          y1={FLOOR + u * (SCENE_H - FLOOR)}
          y2={FLOOR + u * (SCENE_H - FLOOR)}
          stroke="#1B1E24"
          strokeWidth={1.5}
        />
      ))}
      {/* Counter: cabinet fronts, a lit edge on the worktop, a kick board. */}
      <rect
        x={0}
        y={COUNTER_TOP}
        width={COUNTER_W}
        height={FLOOR - COUNTER_TOP}
        fill="#22262E"
      />
      <rect
        x={0}
        y={COUNTER_TOP}
        width={COUNTER_W}
        height={FLOOR - COUNTER_TOP}
        fill="url(#cabinet-shade)"
      />
      {[0, 1].map((d) => (
        <g key={d}>
          <rect
            x={8 + d * 122}
            y={COUNTER_TOP + 14}
            width={112}
            height={FLOOR - COUNTER_TOP - 32}
            rx={3}
            fill="#272B33"
          />
          <rect
            x={d * 122 + (d ? 18 : 102)}
            y={COUNTER_TOP + 30}
            width={4}
            height={18}
            rx={2}
            fill="#8E9096"
          />
        </g>
      ))}
      <rect x={0} y={FLOOR - 12} width={COUNTER_W} height={12} fill="#14171C" />
      <rect
        x={0}
        y={COUNTER_TOP - 9}
        width={COUNTER_W + 10}
        height={11}
        rx={3}
        fill="#4B505B"
      />
      <rect
        x={0}
        y={COUNTER_TOP - 9}
        width={COUNTER_W + 10}
        height={2.5}
        rx={1}
        fill="#C8C7C2"
        opacity={0.35}
      />
    </g>
  );
};

/** Shading shared by every person, the microwave and the walls. */
const Shading: React.FC = () => (
  <defs>
    <linearGradient id="torso-shade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stopColor="#fff" stopOpacity={0.1} />
      <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.35} />
    </linearGradient>
    <radialGradient id="face-shade" cx="0.35" cy="0.35" r="0.8">
      <stop offset="0.5" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.3} />
    </radialGradient>
    <linearGradient id="mw-shade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity={0.18} />
      <stop offset="1" stopColor="#000" stopOpacity={0.25} />
    </linearGradient>
    <linearGradient id="cabinet-shade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.35} />
    </linearGradient>
    <radialGradient id="wall-light" cx="0.16" cy="0" r="0.9">
      <stop offset="0" stopColor="#F3E3C0" stopOpacity={0.1} />
      <stop offset="0.5" stopColor="#F3E3C0" stopOpacity={0.03} />
      <stop offset="1" stopColor="#000" stopOpacity={0.2} />
    </radialGradient>
  </defs>
);

const Panel: React.FC<{ rule: Rule; top: number; frame: number }> = ({
  rule,
  top,
  frame,
}) => {
  const run = RUNS[rule];
  const t = simAt(frame);
  const sceneTop = top + LABEL_H;
  const people = run.map((p) => ({ p, ...placeAt(run, p, frame) }));
  // Further back in line first, so the front of the line overlaps it; anyone
  // walking is drawn last and a little nearer, so a skip passes in front.
  people.sort((a, b) => Number(a.moving) - Number(b.moving) || b.x - a.x);
  return (
    <g transform={`translate(${PANEL_X} ${sceneTop})`}>
      <defs>
        <clipPath id={`${rule}-clip`}>
          <rect x={0} y={0} width={PANEL_W} height={SCENE_H} rx={12} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rule}-clip)`}>
        <Room />
        <Microwave run={run} t={t} />
        {people.map(({ p, x, moving, u }) => {
          if (x <= OFF + 1) return null;
          const atMw = t >= p.start && t < p.end && !moving;
          const holding = t < p.start || t >= p.end - HANDLE / 2;
          const floor = FLOOR + (moving ? 8 : 0);
          return (
            <g key={p.id}>
              <Person
                x={x}
                floor={floor}
                id={p.id}
                cook={p.cook}
                orange={p.id === LONGEST}
                stride={moving ? u * Math.PI * 4 : null}
                holding={holding}
              />
              {t < p.start ? (
                <Tag
                  x={x}
                  y={floor - 1.86 * K}
                  text={clock(p.cook)}
                  orange={p.id === LONGEST}
                  lift={(Math.round((x - LINE_X0) / SPACING) % 2) * 34}
                />
              ) : atMw ? (
                <Tag
                  x={x - 22}
                  y={floor - 1.86 * K}
                  text={`waited ${clock(p.wait)}`}
                  orange={p.id === LONGEST}
                  small
                />
              ) : null}
            </g>
          );
        })}
      </g>
    </g>
  );
};

export const Kitchen: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  const verdict = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 12],
    [0, 1],
    clamp,
  );
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <Shading />
        {PANELS.map((p) => (
          <Panel key={p.rule} rule={p.rule} top={p.top} frame={frame} />
        ))}
      </svg>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => {
        const named = p.rule === "sjf" ? verdict : 0;
        return (
          <div
            key={p.rule}
            style={{
              position: "absolute",
              top: p.top,
              left: PANEL_X,
              width: PANEL_W,
              height: LABEL_H - 6,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              color: theme.colors.chalk,
            }}
          >
            <span style={{ position: "relative" }}>
              <span
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 23,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  opacity: 1 - named,
                }}
              >
                {p.label}
              </span>
              {p.rule === "sjf" ? (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: -4,
                    whiteSpace: "nowrap",
                    fontFamily: theme.fontFamily,
                    fontSize: 46,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    opacity: named,
                    transform: `translateY(${(1 - named) * 10}px)`,
                  }}
                >
                  Shortest job first
                </span>
              ) : null}
            </span>
            <span
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 21,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: theme.colors.grayDark,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              avg wait{" "}
              <span
                style={{
                  fontSize: 34,
                  fontWeight: 700,
                  color: theme.colors.chalk,
                }}
              >
                {clock(averageSoFar(RUNS[p.rule], t))}
              </span>
            </span>
          </div>
        );
      })}
    </>
  );
};
