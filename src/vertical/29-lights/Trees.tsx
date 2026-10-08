import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { VERDICT_FROM, frameAt, simAt } from "./beats";
import { CONDITIONS } from "./measurements";
import { BAD_BULB, RUNS } from "./runs";
import { BULBS, BULB_GAP, MOVE, type Method, type Search } from "./simulation";

/**
 * Two Christmas trees in a dark living room, the same string of 100 bulbs on
 * each and the same bad bulb, number 70. A hand holds a voltage tester to the
 * wire. On the left it goes bulb by bulb from the plug; on the right it tests
 * the middle of whatever is still in doubt.
 *
 * The stretch of string that could still hold the bad bulb glows along the
 * wire and the count above says how many bulbs that is, so the search is
 * visible at feed size: on the right the glow and the count halve with every
 * check, on the left they shrink by one. Cleared bulbs go dim. Orange is one bulb, the bad one, once it is found.
 * Then the tree lights.
 */

export const HEADLINE_TOP = 256;
const PROVENANCE_TOP = 430;
const PANEL_W = 370;
const SCENE_H = 740;
const LABEL_TOP = 466;
const COUNT_TOP = 498;
const SCENE_TOP = 540;
const PANELS: { method: Method; label: string; left: number }[] = [
  { method: "linear", label: "One by one", left: 150 },
  { method: "binary", label: "Split in half", left: 560 },
];

const FLOOR_Y = 640;
const CX = PANEL_W / 2;
const TREE_TOP = 70;
const TREE_BOTTOM = 610;
const TREE_HALF = 165;
const WARM = "#FFE6A8";

const halfWidthAt = (y: number) =>
  (TREE_HALF * (y - TREE_TOP)) / (TREE_BOTTOM - TREE_TOP);

/**
 * The string: seven rows zig-zagging up the tree from the bottom, each
 * sagging a little between the branches, with the plug end at the bottom
 * left. Bulbs sit at equal spacing along it.
 */
const ROWS = 7;
const PATH: { x: number; y: number }[] = (() => {
  const pts: { x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    const y = 588 - (r * 460) / (ROWS - 1);
    const w = halfWidthAt(y) * 0.9;
    const a = r % 2 === 0 ? CX - w : CX + w;
    const b = r % 2 === 0 ? CX + w : CX - w;
    for (let i = 0; i <= 30; i++) {
      const u = i / 30;
      pts.push({ x: a + (b - a) * u, y: y + 16 * Math.sin(Math.PI * u) });
    }
  }
  return pts;
})();
const LENGTHS = PATH.reduce<number[]>((acc, p, i) => {
  if (i === 0) return [0];
  const q = PATH[i - 1];
  acc.push(acc[i - 1] + Math.hypot(p.x - q.x, p.y - q.y));
  return acc;
}, []);
const pointAlong = (d: number) => {
  let i = 1;
  while (i < LENGTHS.length - 1 && LENGTHS[i] < d) i++;
  const u = (d - LENGTHS[i - 1]) / (LENGTHS[i] - LENGTHS[i - 1] || 1);
  return {
    x: PATH[i - 1].x + (PATH[i].x - PATH[i - 1].x) * u,
    y: PATH[i - 1].y + (PATH[i].y - PATH[i - 1].y) * u,
  };
};
const TOTAL = LENGTHS[LENGTHS.length - 1];
const BULB_AT = Array.from({ length: BULBS + 1 }, (_, k) =>
  pointAlong((Math.max(0, k - 0.5) / BULBS) * TOTAL),
);
const PLUG = { x: 34, y: 604 };
const WIRE = [
  PLUG,
  { x: PLUG.x, y: 628 },
  { x: PATH[0].x - 10, y: 628 },
  PATH[0],
];

/** Where the hand is at sim time t, and what the tester is reading. */
const handAt = (s: Search, t: number) => {
  let from = { x: PATH[0].x, y: PATH[0].y };
  let prev = 0;
  let last = 0;
  for (const c of s.checks) {
    const move = MOVE * Math.abs(c.at - prev) * BULB_GAP;
    const start = last;
    const settle = start + move;
    const to = BULB_AT[c.at];
    if (t < settle) {
      const u = move > 0 ? (t - start) / move : 1;
      return {
        x: from.x + (to.x - from.x) * u,
        y: from.y + (to.y - from.y) * u,
        reading: null,
      };
    }
    if (t < c.t) return { x: to.x, y: to.y, reading: c.power };
    from = to;
    prev = c.at;
    last = c.t;
  }
  return { x: from.x, y: from.y, reading: null };
};

/** The bulbs still in doubt at sim time t, inclusive. */
const doubtAt = (s: Search, t: number) => {
  let lo = 1;
  let hi = BULBS;
  for (const c of s.checks) if (c.t <= t) ({ lo, hi } = c);
  return { lo, hi };
};

/**
 * The same range, easing from the old one to the new one over a few frames
 * after each reading, so the glowing stretch visibly shrinks.
 */
const SHRINK = 8;
const doubtEased = (s: Search, frame: number) => {
  const t = simAt(frame);
  let prev = { lo: 1, hi: BULBS };
  let at = -Infinity;
  let now = prev;
  for (const c of s.checks) {
    if (c.t > t) break;
    prev = now;
    now = { lo: c.lo, hi: c.hi };
    at = frameAt(c.t);
  }
  const u = Math.min(1, Math.max(0, (frame - at) / SHRINK));
  const e = 1 - (1 - u) ** 3;
  return {
    lo: prev.lo + (now.lo - prev.lo) * e,
    hi: prev.hi + (now.hi - prev.hi) * e,
  };
};

const SNOW = Array.from({ length: 22 }, (_, i) => ({
  x: 28 + ((i * 37) % 98),
  y: 68 + ((i * 53) % 172),
  r: 1 + (i % 3) * 0.6,
}));

const Room: React.FC<{ lit: number }> = ({ lit }) => (
  <g>
    <rect x={0} y={0} width={PANEL_W} height={FLOOR_Y} fill="#17161A" />
    {/* A window onto a snowy night, behind the tree. */}
    <rect x={22} y={60} width={110} height={190} rx={4} fill="#0D1117" />
    {SNOW.map((f, i) => (
      <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#E9E4D8" opacity={0.55} />
    ))}
    <path
      d="M 22 250 Q 50 238 77 244 Q 105 236 132 246 L 132 250 Z"
      fill="#E9E4D8"
      opacity={0.5}
    />
    <rect
      x={22}
      y={60}
      width={110}
      height={190}
      rx={4}
      fill="none"
      stroke="#2A2830"
      strokeWidth={6}
    />
    <line x1={77} x2={77} y1={60} y2={250} stroke="#2A2830" strokeWidth={4} />
    <line x1={22} x2={132} y1={155} y2={155} stroke="#2A2830" strokeWidth={4} />
    <rect x={0} y={FLOOR_Y - 10} width={PANEL_W} height={10} fill="#221F24" />
    {/* Floorboards and a rug under the tree. */}
    <rect
      x={0}
      y={FLOOR_Y}
      width={PANEL_W}
      height={SCENE_H - FLOOR_Y}
      fill="#1D1915"
    />
    {[668, 700, 732].map((y) => (
      <line
        key={y}
        x1={0}
        x2={PANEL_W}
        y1={y}
        y2={y}
        stroke="#15120F"
        strokeWidth={2}
      />
    ))}
    <ellipse cx={CX} cy={688} rx={165} ry={28} fill="#2A2522" />
    {/* The wall socket and the plug. */}
    <rect
      x={PLUG.x - 12}
      y={PLUG.y - 18}
      width={24}
      height={30}
      rx={3}
      fill="#C9C6BE"
    />
    <rect
      x={PLUG.x - 7}
      y={PLUG.y - 10}
      width={14}
      height={14}
      rx={2}
      fill="#2B2F37"
    />
    {/* Warm light from the tree once it is on. */}
    <ellipse
      cx={CX}
      cy={360}
      rx={210}
      ry={320}
      fill="url(#tree-glow)"
      opacity={lit}
    />
  </g>
);

/**
 * Decorations, kept off orange, which in this reel means the bad bulb:
 * deep red, gold, silver and blue, the colours of a tree in a shop window.
 */
const RED = "#A8263A";
const GOLD = "#D2AE4A";
const SILVER = "#C8CDD3";
const BLUE = "#2F5DA8";
const GREEN = "#1F5534";

/** Baubles hung between the rows of lights, so they never cover a bulb. */
const BAUBLES = (() => {
  const out: { x: number; y: number; r: number; c: string }[] = [];
  const colours = [RED, GOLD, SILVER, BLUE];
  for (let r = 0; r < ROWS - 1; r++) {
    const y = 550 - (r * 460) / (ROWS - 1);
    const w = halfWidthAt(y) * 0.72;
    const n = Math.max(2, Math.round(w / 34));
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      out.push({
        x: CX - w + 2 * w * u + (r % 2 ? 9 : -9),
        y: y + (i % 2 ? 7 : -3),
        r: 6.5 + ((i + r) % 3),
        c: colours[(i + r * 3) % colours.length],
      });
    }
  }
  return out;
})();

const Tree: React.FC<{ lit: number }> = ({ lit }) => {
  const tiers = [
    { top: 66, bottom: 250, w: 78 },
    { top: 166, bottom: 382, w: 114 },
    { top: 286, bottom: 502, w: 144 },
    { top: 396, bottom: 614, w: 172 },
  ];
  return (
    <g>
      {/* Tree skirt, then the trunk. */}
      <ellipse cx={CX} cy={646} rx={128} ry={20} fill={RED} />
      <ellipse
        cx={CX}
        cy={646}
        rx={128}
        ry={20}
        fill="none"
        stroke="#E9E4D8"
        strokeOpacity={0.55}
        strokeWidth={3}
      />
      <rect x={CX - 11} y={598} width={22} height={48} fill="#3B2A1D" />
      {tiers.map((t) => {
        // Branch tips along the bottom of each tier, not a smooth hem.
        const tips = 11;
        const edge = Array.from({ length: tips }, (_, i) => {
          const x0 = CX - t.w + (i * 2 * t.w) / tips;
          const x1 = x0 + (2 * t.w) / tips;
          return `L ${(x0 + x1) / 2} ${t.bottom + 10} L ${x1} ${t.bottom - 2}`;
        }).join(" ");
        const d = `M ${CX} ${t.top} L ${CX - t.w} ${t.bottom - 2} ${edge} Z`;
        return (
          <g key={t.top}>
            <path d={d} fill={GREEN} />
            {/* Needles: darker sprays fanning out from the centre. */}
            {Array.from({ length: 6 }, (_, i) => {
              const u = (i + 1) / 7;
              const y = t.top + (t.bottom - t.top) * (0.35 + 0.6 * u);
              const w = halfWidthAt(y) * 0.85;
              return (
                <path
                  key={i}
                  d={`M ${CX - w} ${y + 8} Q ${CX} ${y - 10} ${CX + w} ${y + 8}`}
                  fill="none"
                  stroke="#143D25"
                  strokeWidth={3}
                  opacity={0.7}
                />
              );
            })}
            <path d={d} fill="url(#tree-shade)" />
          </g>
        );
      })}
      {BAUBLES.map((b, i) => (
        <g key={i}>
          <line
            x1={b.x}
            x2={b.x}
            y1={b.y - b.r - 5}
            y2={b.y - b.r}
            stroke="#8E9096"
            strokeWidth={1}
          />
          <rect
            x={b.x - 2.5}
            y={b.y - b.r - 2}
            width={5}
            height={3}
            fill="#B9B6AF"
          />
          <circle cx={b.x} cy={b.y} r={b.r} fill={b.c} />
          <circle cx={b.x} cy={b.y} r={b.r} fill="url(#bauble-shade)" />
          <ellipse
            cx={b.x - b.r * 0.35}
            cy={b.y - b.r * 0.35}
            rx={b.r * 0.28}
            ry={b.r * 0.2}
            fill="#fff"
            opacity={0.45 + 0.35 * lit}
          />
        </g>
      ))}
      {/* Wrapped presents, each with a ribbon and a bow. */}
      {[
        { x: 50, w: 66, h: 52, c: RED, ribbon: GOLD },
        { x: 228, w: 86, h: 44, c: BLUE, ribbon: SILVER },
        { x: 126, w: 46, h: 32, c: GREEN, ribbon: RED },
      ].map((g) => (
        <g key={g.x}>
          <rect
            x={g.x}
            y={668 - g.h}
            width={g.w}
            height={g.h}
            rx={3}
            fill={g.c}
          />
          <rect
            x={g.x}
            y={668 - g.h}
            width={g.w}
            height={g.h}
            rx={3}
            fill="url(#tree-shade)"
          />
          <rect
            x={g.x + g.w / 2 - 3}
            y={668 - g.h}
            width={6}
            height={g.h}
            fill={g.ribbon}
          />
          <rect
            x={g.x}
            y={668 - g.h * 0.6}
            width={g.w}
            height={5}
            fill={g.ribbon}
          />
          <ellipse
            cx={g.x + g.w / 2 - 7}
            cy={668 - g.h - 3}
            rx={8}
            ry={5}
            fill={g.ribbon}
          />
          <ellipse
            cx={g.x + g.w / 2 + 7}
            cy={668 - g.h - 3}
            rx={8}
            ry={5}
            fill={g.ribbon}
          />
        </g>
      ))}
    </g>
  );
};

const Star: React.FC<{ lit: number }> = ({ lit }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 7 : 16;
    return `${CX + r * Math.cos(a)},${TREE_TOP - 8 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <g>
      <circle
        cx={CX}
        cy={TREE_TOP - 8}
        r={26}
        fill={WARM}
        opacity={0.25 * lit}
      />
      <polygon points={pts} fill={GOLD} />
      <polygon points={pts} fill="url(#bauble-shade)" />
      <polygon points={pts} fill={WARM} opacity={lit} />
    </g>
  );
};

const Bulbs: React.FC<{
  s: Search;
  t: number;
  lit: number;
  frame: number;
}> = ({ s, t, lit, frame }) => {
  const { lo, hi } = doubtAt(s, t);
  const found = t >= s.found;
  // The stretch that could still hold the bad bulb, as a wide glow along the
  // wire: big enough to see shrink at feed size, where single bulbs are not.
  const band = doubtEased(s, frame);
  const from = ((band.lo - 1) / BULBS) * TOTAL;
  const to = (band.hi / BULBS) * TOTAL;
  const steps = Math.max(2, Math.ceil((to - from) / 4));
  const bandPoints = Array.from({ length: steps + 1 }, (_, i) =>
    pointAlong(from + ((to - from) * i) / steps),
  )
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  return (
    <g>
      {!found ? (
        <polyline
          points={bandPoints}
          fill="none"
          stroke={theme.colors.chalk}
          strokeOpacity={0.34}
          strokeWidth={22}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      <polyline
        points={[...WIRE, ...PATH].map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="#0A0C0B"
        strokeWidth={2}
      />
      {Array.from({ length: BULBS }, (_, i) => {
        const k = i + 1;
        const p = BULB_AT[k];
        const bad = k === BAD_BULB;
        const doubt = !found && k >= lo && k <= hi;
        const marked = found && bad && lit === 0;
        return (
          <g
            key={k}
            transform={`translate(${p.x} ${p.y})`}
            opacity={doubt || marked || lit > 0 ? 1 : 0.4}
          >
            {lit > 0 ? (
              <circle r={11} fill="url(#bulb-glow)" opacity={lit} />
            ) : null}
            <rect x={-2} y={-4} width={4} height={4} fill="#0A0C0B" />
            <ellipse
              cy={3}
              rx={3.2}
              ry={4.6}
              fill={marked ? ACCENT : "#4A4842"}
            />
            <ellipse cy={3} rx={3.2} ry={4.6} fill={WARM} opacity={lit} />
            <ellipse
              cx={-1}
              cy={1.6}
              rx={0.9}
              ry={1.4}
              fill="#fff"
              opacity={0.35}
            />
            {marked ? (
              <circle
                cy={2}
                r={9}
                fill="none"
                stroke={ACCENT}
                strokeWidth={2.5}
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/** A hand from the lower right, holding the tester to the wire. */
const Hand: React.FC<{
  x: number;
  y: number;
  reading: boolean | null;
  away: number;
  /** 0 to 1 through swapping the bad bulb: the hand pulls out and pushes in. */
  swap: number;
  frame: number;
}> = ({ x, y, reading, away, swap, frame }) => {
  const shoulder = { x: PANEL_W + 40, y: SCENE_H + 60 };
  const tip = { x: x + 4, y: y + 6 };
  const ang = Math.atan2(shoulder.y - tip.y, shoulder.x - tip.x);
  const hand = { x: tip.x + 44 * Math.cos(ang), y: tip.y + 44 * Math.sin(ang) };
  const pull = Math.sin(Math.PI * swap) * 16;
  const dx = away * 260 + pull * Math.cos(ang);
  const dy = away * 260 + pull * Math.sin(ang);
  // A tester's light blinks while it senses power.
  const blink = 0.55 + 0.45 * Math.sin(frame * 1.7);
  return (
    <g transform={`translate(${dx} ${dy})`}>
      <line
        x1={shoulder.x}
        y1={shoulder.y}
        x2={hand.x}
        y2={hand.y}
        stroke="#3A3F4A"
        strokeWidth={26}
        strokeLinecap="round"
      />
      <line
        x1={shoulder.x}
        y1={shoulder.y}
        x2={hand.x}
        y2={hand.y}
        stroke="#000"
        strokeOpacity={0.2}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <line
        x1={hand.x}
        y1={hand.y}
        x2={tip.x}
        y2={tip.y}
        stroke="#C9C6BE"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <line
        x1={tip.x + 10 * Math.cos(ang)}
        y1={tip.y + 10 * Math.sin(ang)}
        x2={tip.x}
        y2={tip.y}
        stroke="#2B2F37"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <circle cx={hand.x} cy={hand.y} r={12} fill="#C9A88A" />
      {reading ? (
        <>
          <circle
            cx={tip.x}
            cy={tip.y}
            r={13}
            fill="#fff"
            opacity={0.3 * blink}
          />
          <circle
            cx={tip.x}
            cy={tip.y}
            r={4}
            fill="#fff"
            opacity={0.4 + 0.6 * blink}
          />
        </>
      ) : null}
    </g>
  );
};

const Panel: React.FC<{ method: Method; left: number; frame: number }> = ({
  method,
  left,
  frame,
}) => {
  const s = RUNS[method];
  const t = simAt(frame);
  const litFrame = frameAt(s.lit);
  const lit = interpolate(frame, [litFrame, litFrame + 8], [0, 1], clamp);
  const away = interpolate(frame, [litFrame, litFrame + 14], [0, 1], clamp);
  const h = handAt(s, t);
  const swap = Math.min(1, Math.max(0, (t - s.found) / (s.lit - s.found)));
  return (
    <g transform={`translate(${left} ${SCENE_TOP})`}>
      <defs>
        <clipPath id={`${method}-clip`}>
          <rect x={0} y={0} width={PANEL_W} height={SCENE_H} rx={12} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${method}-clip)`}>
        <Room lit={lit} />
        <Tree lit={lit} />
        <Bulbs s={s} t={t} lit={lit} frame={frame} />
        <Star lit={lit} />
        {away < 1 ? (
          <Hand
            x={h.x}
            y={h.y}
            reading={h.reading}
            away={away}
            swap={swap}
            frame={frame}
          />
        ) : null}
      </g>
    </g>
  );
};

export const Trees: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  const named = interpolate(
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
        <defs>
          <radialGradient id="bulb-glow">
            <stop offset="0" stopColor={WARM} stopOpacity={0.7} />
            <stop offset="1" stopColor={WARM} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="tree-glow">
            <stop offset="0" stopColor={WARM} stopOpacity={0.16} />
            <stop offset="1" stopColor={WARM} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="bauble-shade" cx="0.35" cy="0.35" r="0.75">
            <stop offset="0.4" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.45} />
          </radialGradient>
          <linearGradient id="tree-shade" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity={0.05} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.35} />
          </linearGradient>
        </defs>
        {PANELS.map((p) => (
          <Panel key={p.method} method={p.method} left={p.left} frame={frame} />
        ))}
      </svg>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => {
        const s = RUNS[p.method];
        const done = s.checks.filter((c) => c.t <= t).length;
        const range = doubtAt(s, t);
        const doubt = range.hi - range.lo + 1;
        const name = p.method === "binary" ? named : 0;
        return (
          <div
            key={p.method}
            style={{
              position: "absolute",
              top: LABEL_TOP,
              left: p.left,
              width: PANEL_W,
              textAlign: "center",
              color: theme.colors.chalk,
            }}
          >
            <div style={{ position: "relative", height: 30 }}>
              <div
                style={{
                  fontFamily: theme.monoFamily,
                  fontSize: 23,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  opacity: 1 - name,
                }}
              >
                {p.label}
              </div>
              {p.method === "binary" ? (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: -6,
                    fontFamily: theme.fontFamily,
                    fontSize: 46,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    opacity: name,
                    transform: `translateY(${(1 - name) * 10}px)`,
                  }}
                >
                  Binary search
                </div>
              ) : null}
            </div>
            <div
              style={{
                marginTop: COUNT_TOP - LABEL_TOP - 30,
                fontFamily: theme.monoFamily,
                fontSize: 19,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: theme.colors.grayDark,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              could be{" "}
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: theme.colors.chalk,
                }}
              >
                {doubt}
              </span>
              {"  "}·{"  "}
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: theme.colors.chalk,
                }}
              >
                {done}
              </span>{" "}
              checks
            </div>
          </div>
        );
      })}
    </>
  );
};
