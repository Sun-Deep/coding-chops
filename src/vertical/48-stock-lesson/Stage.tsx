import { useEffect, useState } from "react";
import {
  Img,
  OffthreadVideo,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
} from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT, ON_ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import { B, T } from "./clock";
import { carried } from "./Code";
import { RUN } from "./measurements";

/**
 * The pillars and the walker, rendered in Blender by
 * `scripts/blender/stock/render.sh`, and what is drawn over them from the
 * track it writes: the lowest and highest days and the trade that would
 * need a time machine; every pair as fifteen arcs, counted; for one sell
 * day, the four arcs that end there and the one that wins; each day's
 * profit as a bar from the carried line up to the price; and the two
 * carried numbers.
 */

export const SCENE_TOP = 706;
export const SCENE_H = 566;
const WIDTH = 1080;
const VIDEO_H = (850 / 1620) * WIDTH;
const CROP = (VIDEO_H - SCENE_H) / 2;
const C = theme.colors;
const S = T.stems.map((s) => s.at);
const P = RUN.example.prices;

type Point = [number, number, number];

const useTrack = () => {
  const [track, setTrack] = useState<Point[][] | null>(null);
  const [handle] = useState(() => delayRender("vr48 track"));
  useEffect(() => {
    fetch(staticFile("vr48/track.json"))
      .then((r) => r.json())
      .then((t: Point[][]) => {
        setTrack(t);
        continueRender(handle);
      });
  }, [handle]);
  return track;
};

const xy = (p: Point) => [p[0] * WIDTH, p[1] * VIDEO_H - CROP] as const;
const fade = (f: number, a: number, b: number, c?: number, d?: number) =>
  c === undefined
    ? interpolate(f, [a, b], [0, 1], clamp)
    : interpolate(f, [a, b, c, d!], [0, 1, 1, 0], clamp);

/** A curve over the row from one pillar top to another, drawn on as `t` runs. */
const Arc: React.FC<{
  from: Point;
  to: Point;
  t: number;
  color: string;
  opacity: number;
  width?: number;
  head?: boolean;
}> = ({ from, to, t, color, opacity, width = 3, head }) => {
  if (t <= 0 || opacity <= 0) return null;
  const [x0, y0] = xy(from);
  const [x1, y1] = xy(to);
  const lift = 40 + Math.abs(x1 - x0) * 0.22;
  const cx = (x0 + x1) / 2;
  const cy = Math.min(y0, y1) - lift;
  const d = `M ${x0} ${y0 - 6} Q ${cx} ${cy} ${x1} ${y1 - 6}`;
  const len = Math.abs(x1 - x0) * 1.4 + lift * 2;
  return (
    <g opacity={opacity}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - t)}
      />
      {head && t >= 1 ? (
        <circle cx={x1} cy={y1 - 6} r={6} fill={color} />
      ) : null}
    </g>
  );
};

const Tag: React.FC<{
  at: Point;
  opacity: number;
  fill: string;
  ink: string;
  dy?: number;
  children: React.ReactNode;
}> = ({ at, opacity, fill, ink, dy = -44, children }) => {
  if (opacity <= 0 || at[2] !== 1) return null;
  const [x, y] = xy(at);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 110,
        top: y + dy,
        width: 220,
        textAlign: "center",
        opacity,
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: 7,
          background: fill,
          color: ink,
          fontFamily: theme.monoFamily,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
    </div>
  );
};

const Chip: React.FC<{
  label: string;
  value: string;
  right?: boolean;
  accent?: boolean;
  opacity: number;
  glow?: number;
}> = ({ label, value, right, accent, opacity, glow = 0 }) => (
  <div
    style={{
      position: "absolute",
      top: 16,
      ...(right ? { right: 40 } : { left: 40 }),
      opacity,
      padding: "8px 16px",
      borderRadius: 10,
      background: "rgba(10,11,13,0.86)",
      border: `2px solid rgba(255,122,51,${glow})`,
      fontFamily: theme.monoFamily,
      display: "flex",
      alignItems: "baseline",
      gap: 12,
      whiteSpace: "nowrap",
    }}
  >
    <span
      style={{
        fontSize: 20,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: C.grayLight,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontSize: 44,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: accent ? ACCENT : C.chalk,
      }}
    >
      {value}
    </span>
  </div>
);

/** The fifteen pairs, in the order the nested loop tries them. */
const PAIRS: [number, number][] = [];
for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) PAIRS.push([i, j]);
const pairAt = (k: number) =>
  B.compare + ((B.fifteen - B.compare) * k) / PAIRS.length;

export const Stage: React.FC<{ frame: number; still?: string }> = ({
  frame: f,
  still,
}) => {
  const track = useTrack();
  const row = track
    ? track[Math.max(0, Math.min(track.length - 1, Math.round(f)))]
    : null;
  const top = (i: number) => row![i];
  const base = (i: number) => row![6 + i];

  // 2. Lowest, highest, and the trade that runs backwards in time.
  const lowHigh = fade(f, B.lowest, B.lowest + 6, B.compare, B.compare + 8);
  const backwards = interpolate(
    f,
    [B.comesBefore, B.comesBefore + 12],
    [0, 1],
    clamp,
  );
  const crossed = fade(f, B.cannotSell, B.cannotSell + 6);
  // Every pair, counted.
  const pairsOn = fade(
    f,
    B.compare,
    B.compare + 4,
    B.hundredK,
    B.hundredK + 10,
  );
  const started = PAIRS.filter((_, k) => f >= pairAt(k)).length;
  const checks = f >= B.fiveB ? RUN.big.pairs : started;
  const counter = fade(f, B.compare, B.compare + 6, S[2] - 10, S[2] - 2);
  // 3. One sell day: four arcs end there, one wins.
  const trick = fade(f, B.sellDay, B.sellDay + 6, S[3] - 10, S[3]);
  const narrowed = fade(f, B.cheapestBefore, B.cheapestBefore + 10);
  // 4. The walk: profit bars and the two carried numbers.
  const { minPrice, maxProfit } = carried(f);
  const chips = fade(f, B.day[0], B.day[0] + 8);
  const glow = fade(f, B.twoNumbers, B.twoNumbers + 8);
  const answer = fade(f, B.answer, B.answer + 8, B.nSquared - 10, B.nSquared);
  // 5. Time and space: the headline carries them; best profit steps aside
  // while every pair is on screen.
  const oSquared = fade(f, B.nSquared, B.nSquared + 6, B.n - 6, B.n);

  return (
    <div
      style={{
        position: "absolute",
        top: SCENE_TOP,
        left: 0,
        width: WIDTH,
        height: SCENE_H,
        overflow: "hidden",
        background: C.black,
      }}
    >
      {still ? (
        <Img
          src={staticFile(still)}
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      ) : (
        <OffthreadVideo
          src={staticFile("vr48/scene.mp4")}
          muted
          style={{
            position: "absolute",
            top: -CROP,
            width: WIDTH,
            height: VIDEO_H,
          }}
        />
      )}
      {row ? (
        <>
          <svg
            width={WIDTH}
            height={SCENE_H}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            {/* Buy at the lowest, sell at the highest: the arrow runs back in time. */}
            <Arc
              from={top(1)}
              to={top(0)}
              t={backwards}
              color={crossed > 0 ? C.grayDark : C.chalk}
              opacity={lowHigh}
              width={4}
              head
            />
            {PAIRS.map(([i, j], k) => (
              <Arc
                key={k}
                from={top(i)}
                to={top(j)}
                t={interpolate(f, [pairAt(k), pairAt(k) + 6], [0, 1], clamp)}
                color={C.chalk}
                opacity={pairsOn * 0.7}
              />
            ))}
            {[0, 1, 2, 3].map((i) => (
              <Arc
                key={`t${i}`}
                from={top(i)}
                to={top(4)}
                t={interpolate(
                  f,
                  [B.sellDay + 8 + i * 6, B.sellDay + 14 + i * 6],
                  [0, 1],
                  clamp,
                )}
                color={i === 1 && narrowed > 0 ? ACCENT : C.chalk}
                opacity={trick * (i === 1 ? 1 : 1 - 0.85 * narrowed)}
                width={i === 1 ? 4 : 3}
              />
            ))}
            {/* Each day's profit: from the carried price up to today's. */}
            {[2, 3, 4, 5].map((i) => {
              const on = fade(
                f,
                B.profit[i],
                B.profit[i] + 6,
                B.nSquared - 10,
                B.nSquared,
              );
              const later =
                i < 5 ? fade(f, B.profit[i + 1], B.profit[i + 1] + 8) : 0;
              if (on <= 0) return null;
              const [x0, y0] = xy(base(i));
              const [x1, y1] = xy(top(i));
              const grow = interpolate(
                f,
                [B.profit[i], B.profit[i] + 8],
                [0, 1],
                clamp,
              );
              return (
                <line
                  key={`p${i}`}
                  x1={x0}
                  y1={y0}
                  x2={x0 + (x1 - x0) * grow}
                  y2={y0 + (y1 - y0) * grow}
                  stroke={C.chalk}
                  strokeWidth={5}
                  strokeLinecap="round"
                  opacity={on * (1 - 0.65 * later)}
                />
              );
            })}
            <Arc
              from={top(1)}
              to={top(4)}
              t={answer}
              color={ACCENT}
              opacity={answer}
              width={5}
              head
            />
          </svg>
          <Tag
            at={top(1)}
            opacity={lowHigh}
            fill={C.chalk}
            ink={ON_ACCENT}
            dy={-52}
          >
            lowest
          </Tag>
          <Tag
            at={top(0)}
            opacity={fade(
              f,
              B.highest,
              B.highest + 6,
              B.compare,
              B.compare + 8,
            )}
            fill={C.chalk}
            ink={ON_ACCENT}
            dy={-52}
          >
            highest
          </Tag>
          <Tag
            at={top(0)}
            opacity={lowHigh * crossed}
            fill={ACCENT}
            ink={ON_ACCENT}
            dy={-96}
          >
            sell before you buy?
          </Tag>
          <Tag
            at={top(4)}
            opacity={trick}
            fill={C.chalk}
            ink={ON_ACCENT}
            dy={-52}
          >
            sell
          </Tag>
          <Tag
            at={top(1)}
            opacity={trick * narrowed}
            fill={ACCENT}
            ink={ON_ACCENT}
            dy={-52}
          >
            buy
          </Tag>
          {[2, 3, 4, 5].map((i) => {
            const on = fade(
              f,
              B.profit[i] + 4,
              B.profit[i] + 10,
              B.nSquared - 10,
              B.nSquared,
            );
            const later =
              i < 5 ? fade(f, B.profit[i + 1], B.profit[i + 1] + 8) : 0;
            return (
              <Tag
                key={i}
                at={top(i)}
                opacity={on * (1 - 0.65 * later)}
                fill="rgba(10,11,13,0.86)"
                ink={C.chalk}
                dy={-52}
              >
                +{P[i] - Math.min(...P.slice(0, i))}
              </Tag>
            );
          })}
          <Tag
            at={top(4)}
            opacity={answer}
            fill={ACCENT}
            ink={ON_ACCENT}
            dy={-96}
          >
            ${P[4] - P[1]}
          </Tag>
        </>
      ) : null}
      {/* Every pair, counted. */}
      <Chip
        right
        label="checks"
        value={checks.toLocaleString("en-US")}
        opacity={counter}
      />
      {/* The two numbers the one pass carries. */}
      <Chip
        label="cheapest"
        value={String(minPrice)}
        accent
        opacity={chips}
        glow={glow}
      />
      <Chip
        right
        label="best profit"
        value={String(maxProfit)}
        opacity={chips * (1 - oSquared)}
        glow={glow}
      />
    </div>
  );
};
