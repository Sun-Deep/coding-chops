import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { REVEAL_FROM, REVEAL_TO, VERDICT_FROM } from "./beats";
import {
  CX,
  H,
  W,
  WALKERS,
  WALKWAY_Y,
  aisleX,
  pitch,
  roomAt,
  rowY,
  seatX,
  seatY,
  walkerAt,
  type Walker,
} from "./layout";
import { CONDITIONS } from "./measurements";
import { ROOMS, YOU } from "./runs";
import { ROWS, SEATS, type Rule } from "./simulation";

/**
 * Two cinemas, one above the other, seen from the projection booth: a film
 * on the screen between velvet curtains, curved rows of red seats stepping
 * down towards it, panelled walls with lamps, the projector's beam overhead.
 * The same groups walk in, in the same order. In the top room people leave a
 * seat between themselves and strangers; in the bottom room they sit right
 * beside whoever is there. Four friends wait at the back from the first
 * frame, look while every free seat lights up, then sit: split up above,
 * together below. The rooms then fill to a full house.
 *
 * Orange is one thing: you, the four friends.
 */

export const HEADLINE_TOP = 232;
const PROVENANCE_TOP = 424;
const LEFT = 150;
const PANELS: { rule: Rule; label: string; top: number }[] = [
  { rule: "spread", label: "Leave a gap", top: 494 },
  { rule: "pack", label: "No gaps", top: 920 },
];
const LABEL_GAP = 34;

const SEAT_TOP = "#9C3440";
const SEAT_MID = "#6A1C25";
const SEAT_LOW = "#3A0D13";
const CURTAIN_A = "#4A1218";
const CURTAIN_B = "#250709";
const WALL_A = "#1B1820";
const WALL_B = "#15131A";
const WARM = "#FFD9A0";
const SCREEN_LIGHT = "#CFE0F5";
const SKIN = ["#E6C8A6", "#C8A07E", "#A47A5C", "#7E5A42", "#5E4231", "#D9B08D"];
const HAIR = [
  "#1B1714",
  "#3A2A1F",
  "#5B4531",
  "#2B2723",
  "#8B7864",
  "#121010",
  "#6D5A48",
];
/** Everyday clothes, off orange and off the seats' red. */
const TOPS = [
  "#2F3A52",
  "#4B5337",
  "#7E6C55",
  "#3F4D62",
  "#5C6068",
  "#2A2E36",
  "#7A7D86",
  "#33504C",
  "#4A4E57",
  "#665B4D",
];
const pick = <T,>(xs: readonly T[], n: number) => xs[Math.abs(n) % xs.length];

/* ---------------------------------------------------------------- screen */

const SX0 = CX - 300;
const SX1 = CX + 300;
const SY0 = 10;
const SY1 = 86;

/**
 * The film: an original action picture, not anyone's real one. A city at
 * night with searchlights, a caped figure on a rooftop, lightning, and a
 * title card. Lightning flashes light up the audience.
 */
const FLASHES = [38, 44, 150, 236, 242, 330, 336];
const flashAt = (frame: number) => {
  let v = 0;
  for (const f of FLASHES) {
    const d = frame - f;
    if (d >= 0 && d < 10) v = Math.max(v, Math.exp(-d / 2.4));
  }
  return v;
};
/** How bright the film is; the room takes its light from it. */
const filmLight = (frame: number) =>
  0.72 + 0.08 * Math.sin(frame * 0.05) + 0.7 * flashAt(frame);

const TITLE_FROM = 96;
const TITLE_TO = 206;
const TITLE = "NIGHTFALL";

/** Buildings along the skyline: x from the left of the screen, width, height. */
const SKYLINE = Array.from({ length: 28 }, (_, i) => ({
  x: i * 23 - 10,
  w: 16 + ((i * 37) % 11),
  h: 16 + ((i * 53) % 29) + (i === 15 ? 18 : 0),
}));

const Screen: React.FC<{ frame: number }> = ({ frame }) => {
  const outline = `M ${SX0} ${SY0} Q ${CX} ${SY0 - 7} ${SX1} ${SY0} L ${SX1} ${SY1} Q ${CX} ${SY1 - 7} ${SX0} ${SY1} Z`;
  const flash = flashAt(frame);
  const title = interpolate(
    frame,
    [TITLE_FROM, TITLE_FROM + 12, TITLE_TO - 12, TITLE_TO],
    [0, 1, 1, 0],
    clamp,
  );
  // The camera pans slowly along the skyline.
  const pan = (frame * 0.18) % 23;
  const tower = SKYLINE[15];
  const towerX = SX0 + tower.x - pan + tower.w / 2;
  const roof = SY1 - tower.h;
  const cape = Math.sin(frame * 0.25);
  const sweep = ((frame - TITLE_FROM) * 7) % 900;
  return (
    <g>
      <defs>
        <clipPath id="screen-clip">
          <path d={outline} />
        </clipPath>
      </defs>
      {/* Black masking round the screen, then the picture. */}
      <rect
        x={SX0 - 14}
        y={0}
        width={SX1 - SX0 + 28}
        height={SY1 + 10}
        fill="#050506"
      />
      <g clipPath="url(#screen-clip)">
        <rect
          x={SX0}
          y={SY0 - 10}
          width={SX1 - SX0}
          height={SY1 - SY0 + 12}
          fill="url(#film-sky)"
        />
        {/* Searchlights sweeping the clouds. */}
        {[0, 1].map((k) => {
          const a = 0.5 * Math.sin(frame * 0.03 + k * 2.2) + (k ? 0.3 : -0.3);
          const bx = CX + (k ? 160 : -170);
          const tx = bx + Math.sin(a) * 120;
          return (
            <polygon
              key={k}
              points={`${bx - 3},${SY1} ${bx + 3},${SY1} ${tx + 18},${SY0 - 10} ${tx - 18},${SY0 - 10}`}
              fill="url(#searchlight)"
            />
          );
        })}
        {/* Lightning: a bolt and the sky lit. */}
        {flash > 0.05 ? (
          <g opacity={flash}>
            <rect
              x={SX0}
              y={SY0 - 10}
              width={SX1 - SX0}
              height={SY1}
              fill="#DCE8FF"
              opacity={0.45}
            />
            <path
              d={`M ${CX - 120} ${SY0 - 4} L ${CX - 132} ${SY0 + 18} L ${CX - 118} ${SY0 + 20} L ${CX - 136} ${SY0 + 46}`}
              stroke="#FFFFFF"
              strokeWidth={2.2}
              fill="none"
            />
          </g>
        ) : null}
        {/* The skyline, windows lit here and there. */}
        {SKYLINE.map((b, i) => {
          const x = SX0 + b.x - pan;
          return (
            <g key={i}>
              <rect
                x={x}
                y={SY1 - b.h}
                width={b.w}
                height={b.h}
                fill={i % 2 ? "#0D1420" : "#111A28"}
              />
              {Array.from({ length: Math.floor(b.h / 7) }, (_, r) =>
                [0, 1].map((c) =>
                  (i * 7 + r * 3 + c) % 4 === 0 ? (
                    <rect
                      key={`${r}${c}`}
                      x={x + 3 + c * (b.w / 2)}
                      y={SY1 - b.h + 4 + r * 7}
                      width={2.5}
                      height={2.5}
                      fill="#F2D9A6"
                      opacity={0.75}
                    />
                  ) : null,
                ),
              )}
            </g>
          );
        })}
        {/* A caped figure on the tallest roof, rim-lit by the sky. */}
        <g transform={`translate(${towerX} ${roof}) scale(2)`}>
          <path
            d={`M -3 0 L -2 -9 Q 0 -11 2 -9 L 3 0 Z M -1.6 -9 L 6 ${-7 + cape} L ${9 + cape} ${-1} L 1.5 -2 Z`}
            fill="#05070C"
          />
          <circle cx={0} cy={-11.5} r={2} fill="#05070C" />
          <path
            d="M -2.4 -12.6 Q 0 -14.2 2.4 -12.6"
            stroke="#9FB7DA"
            strokeWidth={0.7}
            fill="none"
            opacity={0.8}
          />
        </g>
        {/* The title card. */}
        {title > 0 ? (
          <g opacity={title}>
            <rect
              x={SX0}
              y={SY0 - 10}
              width={SX1 - SX0}
              height={SY1}
              fill="#03050A"
              opacity={0.62}
            />
            <text
              x={CX}
              y={SY0 + 46}
              textAnchor="middle"
              fontFamily={theme.fontFamily}
              fontWeight={900}
              fontSize={42}
              letterSpacing="0.2em"
              fill="url(#title-metal)"
              stroke="#0A0F18"
              strokeWidth={1}
            >
              {TITLE}
            </text>
            <text
              x={CX}
              y={SY0 + 46}
              textAnchor="middle"
              fontFamily={theme.fontFamily}
              fontWeight={900}
              fontSize={42}
              letterSpacing="0.2em"
              fill="url(#title-sweep)"
              style={{ mixBlendMode: "screen" }}
            >
              {TITLE}
            </text>
            <text
              x={CX}
              y={SY0 + 64}
              textAnchor="middle"
              fontFamily={theme.monoFamily}
              fontSize={9}
              letterSpacing="0.5em"
              fill="#9FB7DA"
            >
              NOW SHOWING
            </text>
            <ellipse
              cx={SX0 + 60 + sweep * 0.55}
              cy={SY0 + 32}
              rx={40}
              ry={5}
              fill="url(#flare)"
            />
          </g>
        ) : null}
      </g>
      {/* Velvet curtains either side, folded. */}
      {[-1, 1].map((side) => {
        const x0 = side < 0 ? SX0 - 74 : SX1 + 14;
        return (
          <g key={side}>
            <rect
              x={x0}
              y={0}
              width={60}
              height={SY1 + 24}
              fill="url(#curtain)"
            />
            <rect x={x0} y={SY1 + 18} width={60} height={6} fill={CURTAIN_B} />
          </g>
        );
      })}
      {/* Light thrown from the screen down over the rows. */}
      <ellipse
        cx={CX}
        cy={SY1 + 8}
        rx={440}
        ry={170}
        fill="url(#screen-spill)"
        opacity={filmLight(frame)}
      />
    </g>
  );
};

/* ------------------------------------------------------------------ room */

/** Panelled side walls, wall lamps, exit signs, aisles and step lights. */
const Room: React.FC = () => {
  const backY = H;
  const walls = ([-1, 1] as const).map((side) => {
    const inner = (y: number) => {
      const u = (y - SY1) / (backY - SY1);
      const front = side < 0 ? SX0 - 86 : SX1 + 86;
      const back = aisleX(side, ROWS - 1) + side * 70;
      return front + (back - front) * u;
    };
    const edge = side < 0 ? 0 : W;
    const panels = Array.from({ length: 7 }, (_, i) => {
      const y0 = SY1 + 10 + ((backY - SY1) * i) / 7;
      const y1 = SY1 + 10 + ((backY - SY1) * (i + 1)) / 7;
      return (
        <polygon
          key={i}
          points={`${inner(y0)},${y0} ${edge},${y0 - 40} ${edge},${y1 - 40} ${inner(y1)},${y1}`}
          fill={i % 2 ? WALL_A : WALL_B}
          stroke="#0D0C10"
          strokeWidth={1}
        />
      );
    });
    const lamps = [0.25, 0.62].map((u) => {
      const y = SY1 + (backY - SY1) * u;
      const x = (inner(y) + edge) / 2;
      return (
        <g key={u}>
          <ellipse cx={x} cy={y - 34} rx={26} ry={52} fill="url(#wash)" />
          <rect
            x={x - 5}
            y={y - 30}
            width={10}
            height={14}
            rx={3}
            fill="#2E2822"
          />
          <rect
            x={x - 4}
            y={y - 30}
            width={8}
            height={3}
            fill={WARM}
            opacity={0.9}
          />
        </g>
      );
    });
    const exitY = backY - 46;
    const exitX = (inner(exitY) + edge) / 2;
    return (
      <g key={side}>
        <polygon
          points={`${inner(SY1)},${SY1} ${edge},${SY1 - 40} ${edge},${backY} ${inner(backY)},${backY}`}
          fill={WALL_B}
        />
        {panels}
        {lamps}
        <rect
          x={exitX - 17}
          y={exitY - 8}
          width={34}
          height={14}
          rx={2}
          fill="#101012"
          stroke="#3A3A3E"
        />
        <text
          x={exitX}
          y={exitY + 3}
          textAnchor="middle"
          fontFamily={theme.fontFamily}
          fontWeight={800}
          fontSize={9}
          letterSpacing="0.08em"
          fill={theme.colors.chalk}
        >
          EXIT
        </text>
        <ellipse cx={exitX} cy={exitY} rx={26} ry={14} fill="url(#exit-glow)" />
      </g>
    );
  });
  return (
    <g>
      {walls}
      {/* The stepped floor under each row, and the aisles with their step lights. */}
      {Array.from({ length: ROWS }, (_, r) => {
        const p = pitch(r);
        const yL = seatY(-1.15, r);
        const yR = seatY(SEATS + 0.15, r);
        const y = rowY(r);
        const l = aisleX(-1, r) - p * 0.55;
        const rr = aisleX(1, r) + p * 0.55;
        return (
          <g key={r}>
            <path
              d={`M ${l} ${yL + 0.3 * p} Q ${CX} ${y + 0.3 * p + 8} ${rr} ${yR + 0.3 * p} L ${rr + 6} ${yR + 0.66 * p} Q ${CX} ${y + 0.66 * p + 8} ${l - 6} ${yL + 0.66 * p} Z`}
              fill="#100F14"
            />
            {([-1, 1] as const).map((side) => {
              const ax = aisleX(side, r);
              const ay = side < 0 ? yL : yR;
              return (
                <g key={side}>
                  <rect
                    x={ax - 0.42 * p}
                    y={ay - 0.3 * p}
                    width={0.84 * p}
                    height={0.95 * p}
                    fill="url(#carpet)"
                  />
                  <rect
                    x={ax - 0.42 * p}
                    y={ay + 0.3 * p}
                    width={0.84 * p}
                    height={2.5}
                    fill={WARM}
                    opacity={0.75}
                  />
                  <ellipse
                    cx={ax}
                    cy={ay + 0.31 * p}
                    rx={0.6 * p}
                    ry={7}
                    fill="url(#step-glow)"
                  />
                </g>
              );
            })}
          </g>
        );
      })}
      <rect
        x={0}
        y={WALKWAY_Y - 18}
        width={W}
        height={H - WALKWAY_Y + 18}
        fill="url(#walkway)"
      />
    </g>
  );
};

/* ----------------------------------------------------------------- seats */

/** A head and shoulders from behind, rim-lit by the screen. */
const Head: React.FC<{
  x: number;
  y: number;
  p: number;
  id: number;
  you: boolean;
  standing: number;
  light: number;
  frame: number;
}> = ({ x, y, p, id, you, standing, light, frame }) => {
  const top = you ? ACCENT : pick(TOPS, id * 7 + 3);
  const hair = pick(HAIR, id * 3 + 1);
  const skin = pick(SKIN, id * 5 + 2);
  const style = Math.abs(id * 11 + 5) % 4;
  // Seated people shift and turn a little now and then.
  const turn = standing ? 0 : 0.03 * p * Math.sin(frame * 0.04 + id * 1.7);
  const hy = y - 0.27 * p;
  return (
    <g>
      <ellipse
        cx={x}
        cy={y + 0.02 * p}
        rx={0.38 * p}
        ry={0.17 * p}
        fill={top}
      />
      <ellipse
        cx={x}
        cy={y + 0.02 * p}
        rx={0.38 * p}
        ry={0.17 * p}
        fill="url(#shoulder-shade)"
      />
      <rect
        x={x - 0.07 * p}
        y={hy + 0.08 * p}
        width={0.14 * p}
        height={0.14 * p}
        fill={skin}
      />
      <ellipse
        cx={x + turn - 0.19 * p}
        cy={hy + 0.03 * p}
        rx={0.035 * p}
        ry={0.055 * p}
        fill={skin}
      />
      <ellipse
        cx={x + turn + 0.19 * p}
        cy={hy + 0.03 * p}
        rx={0.035 * p}
        ry={0.055 * p}
        fill={skin}
      />
      <circle cx={x + turn} cy={hy} r={0.19 * p} fill={hair} />
      {style === 1 ? (
        <path
          d={`M ${x + turn - 0.19 * p} ${hy} Q ${x + turn} ${hy + 0.42 * p} ${x + turn + 0.19 * p} ${hy} Z`}
          fill={hair}
        />
      ) : null}
      {style === 2 ? (
        <circle cx={x + turn} cy={hy - 0.2 * p} r={0.08 * p} fill={hair} />
      ) : null}
      {style === 3 ? (
        <path
          d={`M ${x + turn - 0.2 * p} ${hy - 0.02 * p} Q ${x + turn} ${hy - 0.3 * p} ${x + turn + 0.2 * p} ${hy - 0.02 * p} Z`}
          fill={pick(TOPS, id * 5 + 7)}
        />
      ) : null}
      <path
        d={`M ${x + turn - 0.15 * p} ${hy - 0.1 * p} Q ${x + turn} ${hy - 0.22 * p} ${x + turn + 0.15 * p} ${hy - 0.1 * p}`}
        stroke={SCREEN_LIGHT}
        strokeOpacity={0.45 * light}
        strokeWidth={0.045 * p}
        fill="none"
      />
    </g>
  );
};

type Sitter = { id: number; you: boolean } | null;

/**
 * One seat from behind and above, with whoever sits in it: the cushion
 * shows when it is empty; a seated person's head and shoulders show over
 * the headrest. Free seats can be lit for the reveal.
 */
const SeatUnit: React.FC<{
  x: number;
  y: number;
  p: number;
  sitter: Sitter;
  glow: number;
  light: number;
  frame: number;
}> = ({ x, y, p, sitter, glow, light, frame }) => {
  const back = `M ${x - 0.43 * p} ${y + 0.27 * p} L ${x - 0.43 * p} ${y - 0.06 * p} Q ${x - 0.43 * p} ${y - 0.22 * p} ${x - 0.28 * p} ${y - 0.22 * p} L ${x + 0.28 * p} ${y - 0.22 * p} Q ${x + 0.43 * p} ${y - 0.22 * p} ${x + 0.43 * p} ${y - 0.06 * p} L ${x + 0.43 * p} ${y + 0.27 * p} Z`;
  return (
    <g>
      {sitter === null ? (
        <rect
          x={x - 0.37 * p}
          y={y - 0.37 * p}
          width={0.74 * p}
          height={0.18 * p}
          rx={0.06 * p}
          fill={SEAT_LOW}
        />
      ) : (
        <Head
          x={x}
          y={y - 0.2 * p}
          p={p}
          id={sitter.id}
          you={sitter.you}
          standing={0}
          light={light}
          frame={frame}
        />
      )}
      <path d={back} fill="url(#seat-back)" />
      <path d={back} fill="url(#seat-side)" />
      <path
        d={`M ${x - 0.3 * p} ${y - 0.2 * p} L ${x + 0.3 * p} ${y - 0.2 * p}`}
        stroke={SCREEN_LIGHT}
        strokeOpacity={0.22 * light}
        strokeWidth={0.04 * p}
      />
      <line
        x1={x - 0.36 * p}
        x2={x + 0.36 * p}
        y1={y + 0.06 * p}
        y2={y + 0.06 * p}
        stroke="#000"
        strokeOpacity={0.25}
        strokeWidth={1}
      />
      {/* Armrest with a cup holder. */}
      <rect
        x={x + 0.44 * p}
        y={y - 0.2 * p}
        width={0.12 * p}
        height={0.42 * p}
        rx={0.05 * p}
        fill="#17121A"
      />
      <circle cx={x + 0.5 * p} cy={y - 0.16 * p} r={0.045 * p} fill="#2C2530" />
      {glow > 0 ? (
        <path
          d={back}
          fill={theme.colors.chalk}
          fillOpacity={0.16 * glow}
          stroke={theme.colors.chalk}
          strokeWidth={3}
          strokeOpacity={glow}
        />
      ) : null}
    </g>
  );
};

/** Someone walking in: taller, some with a phone torch lighting the way. */
const Walking: React.FC<{ w: Walker; frame: number; light: number }> = ({
  w,
  frame,
  light,
}) => {
  const at = walkerAt(w, frame);
  if (!at || at.sitting) return null;
  // Size from where they stand, so people in the aisle match the rows.
  const p = pitch(Math.max(0, Math.min(ROWS, (at.y - rowY(0)) / 36))) * 1.05;
  const bob = at.moving ? 0.03 * p * Math.abs(Math.sin(at.stride)) : 0;
  const you = w.group === YOU;
  const torch = at.moving && (w.group * 3 + w.member) % 3 === 0;
  const y = at.y - 0.62 * p - bob;
  const step = at.moving ? Math.sin(at.stride) : 0;
  const top = you ? ACCENT : pick(TOPS, (w.group * 4 + w.member) * 7 + 3);
  return (
    <g>
      <ellipse
        cx={at.x}
        cy={at.y + 0.3 * p}
        rx={0.34 * p}
        ry={0.09 * p}
        fill="#000"
        opacity={0.45}
      />
      {torch ? (
        <g>
          <polygon
            points={`${at.x + 0.2 * p},${y + 0.05 * p} ${at.x + 0.1 * p},${y - 1.6 * p} ${at.x + 0.9 * p},${y - 1.6 * p}`}
            fill="url(#torch)"
          />
          <circle
            cx={at.x + 0.2 * p}
            cy={y + 0.05 * p}
            r={0.05 * p}
            fill="#FFFFFF"
          />
        </g>
      ) : null}
      {/* Standing: a body and legs below the head and shoulders. */}
      <rect
        x={at.x - 0.3 * p}
        y={y}
        width={0.6 * p}
        height={0.42 * p}
        rx={0.1 * p}
        fill={top}
      />
      <rect
        x={at.x - 0.3 * p}
        y={y}
        width={0.6 * p}
        height={0.42 * p}
        rx={0.1 * p}
        fill="url(#shoulder-shade)"
      />
      {[-1, 1].map((side) => (
        <rect
          key={side}
          x={at.x + side * 0.1 * p - 0.08 * p}
          y={y + 0.4 * p}
          width={0.16 * p}
          height={0.5 * p - side * step * 0.06 * p}
          rx={0.05 * p}
          fill="#1C1E24"
        />
      ))}
      <Head
        x={at.x}
        y={y}
        p={p}
        id={w.group * 4 + w.member}
        you={you}
        standing={1}
        light={light}
        frame={frame}
      />
    </g>
  );
};

/** The projector's beam from behind the camera to the screen, with dust. */
const Beam: React.FC<{ frame: number }> = ({ frame }) => (
  <g style={{ mixBlendMode: "screen" }}>
    <polygon
      filter="url(#beam-soft)"
      points={`${CX - 16},${H + 30} ${CX + 16},${H + 30} ${SX1 - 20},${SY0 + 6} ${SX0 + 20},${SY0 + 6}`}
      fill="url(#beam)"
    />
    {Array.from({ length: 30 }, (_, i) => {
      const u = (((frame * 0.0035 + i * 0.0333) % 1) + 1) % 1;
      const y = H + 20 - u * (H + 6);
      const spread = 16 + (264 * (H + 30 - y)) / (H + 20);
      const x = CX + spread * Math.sin(i * 2.7 + frame * 0.006) * 0.9;
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={0.9 + (i % 3) * 0.4}
          fill="#EAF2FF"
          opacity={0.3 * Math.sin(Math.PI * u)}
        />
      );
    })}
  </g>
);

/* ----------------------------------------------------------------- panel */

const Panel: React.FC<{ rule: Rule; top: number; frame: number }> = ({
  rule,
  top,
  frame,
}) => {
  const room = roomAt(rule, frame);
  const light = filmLight(frame);
  const reveal =
    interpolate(frame, [REVEAL_FROM, REVEAL_FROM + 12], [0, 1], clamp) *
    interpolate(frame, [REVEAL_TO, REVEAL_TO + 16], [1, 0], clamp);
  const pulse = reveal * (0.7 + 0.3 * Math.sin((frame - REVEAL_FROM) * 0.25));

  // Seats, row by row from the front, with walkers slotted in by depth.
  type Item = { y: number; node: React.ReactNode };
  const items: Item[] = [];
  for (let r = 0; r < ROWS; r++) {
    const p = pitch(r);
    for (let s = 0; s < SEATS; s++) {
      const group = room.taken[r][s];
      const w =
        group === null
          ? null
          : WALKERS[rule].find(
              (k) => k.group === group && k.row === r && k.seat === s,
            );
      items.push({
        y: seatY(s, r),
        node: (
          <SeatUnit
            key={`s${r}-${s}`}
            x={seatX(s, r)}
            y={seatY(s, r)}
            p={p}
            sitter={
              w ? { id: w.group * 4 + w.member, you: w.group === YOU } : null
            }
            glow={group === null ? pulse : 0}
            light={light}
            frame={frame}
          />
        ),
      });
    }
  }
  for (const w of WALKERS[rule]) {
    const at = walkerAt(w, frame);
    if (!at || at.sitting) continue;
    items.push({
      y: at.y - 1,
      node: (
        <Walking
          key={`w${w.group}-${w.member}`}
          w={w}
          frame={frame}
          light={light}
        />
      ),
    });
  }
  items.sort((a, b) => a.y - b.y);

  // The longest free run, bracketed while the seats are lit.
  let best = { r: 0, s0: 0, n: 0 };
  room.taken.forEach((row, r) => {
    let run = 0;
    row.forEach((t, s) => {
      run = t === null ? run + 1 : 0;
      if (run > best.n) best = { r, s0: s - run + 1, n: run };
    });
  });

  // Groups that sat apart, joined by a dashed line: orange for you.
  const splits = ROOMS[rule]
    .filter((g) => g.split)
    .map((g) => {
      const members = WALKERS[rule].filter((w) => w.group === g.id);
      const done = Math.max(...members.map((w) => w.seated));
      return {
        id: g.id,
        seated: frame >= done,
        fade: interpolate(frame, [done, done + 10], [0, 1], clamp),
        pts: members
          .map((w) => ({
            x: seatX(w.seat, w.row),
            y: seatY(w.seat, w.row) - 0.5 * pitch(w.row),
          }))
          .sort((a, b) => a.y - b.y || a.x - b.x),
      };
    });
  const together = ROOMS[rule][YOU].split
    ? null
    : WALKERS[rule].filter((w) => w.group === YOU);
  const togetherDone = together
    ? Math.max(...together.map((w) => w.seated))
    : 0;

  return (
    <g transform={`translate(${LEFT} ${top})`}>
      <defs>
        <clipPath id={`${rule}-clip`}>
          <rect x={0} y={0} width={W} height={H} rx={14} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${rule}-clip)`}>
        <rect x={0} y={0} width={W} height={H} fill="url(#hall)" />
        <Room />
        <Screen frame={frame} />
        {items.map((it) => it.node)}
        <Beam frame={frame} />
        {/* Lightning on the screen lights the whole room for a moment. */}
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          fill="url(#flash-fill)"
          opacity={0.5 * flashAt(frame)}
          style={{ mixBlendMode: "screen" }}
        />
        {reveal > 0 && best.n > 0 ? (
          <path
            d={`M ${seatX(best.s0, best.r) - 0.45 * pitch(best.r)} ${rowY(best.r) + 0.4 * pitch(best.r)} l 0 6 L ${seatX(best.s0 + best.n - 1, best.r) + 0.45 * pitch(best.r)} ${rowY(best.r) + 0.4 * pitch(best.r) + 6} l 0 -6`}
            fill="none"
            stroke={theme.colors.chalk}
            strokeWidth={2.5}
            opacity={reveal}
          />
        ) : null}
        {splits.map((g) =>
          g.seated ? (
            <polyline
              key={g.id}
              points={g.pts.map((q) => `${q.x},${q.y}`).join(" ")}
              fill="none"
              stroke={g.id === YOU ? ACCENT : theme.colors.chalk}
              strokeWidth={g.id === YOU ? 3 : 2}
              strokeDasharray="7 7"
              opacity={g.fade * (g.id === YOU ? 1 : 0.75)}
            />
          ) : null,
        )}
        {together && frame >= togetherDone ? (
          <path
            d={`M ${Math.min(...together.map((w) => seatX(w.seat, w.row))) - 22} ${seatY(together[0].seat, together[0].row) + 0.42 * pitch(together[0].row)} l 0 6 L ${Math.max(...together.map((w) => seatX(w.seat, w.row))) + 22} ${seatY(together[0].seat, together[0].row) + 0.42 * pitch(together[0].row) + 6} l 0 -6`}
            fill="none"
            stroke={ACCENT}
            strokeWidth={3}
            opacity={interpolate(
              frame,
              [togetherDone, togetherDone + 10],
              [0, 1],
              clamp,
            )}
          />
        ) : null}
        <rect x={0} y={0} width={W} height={H} fill="url(#vignette)" />
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          filter="url(#grain)"
          opacity={0.05}
        />
      </g>
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={14}
        fill="none"
        stroke="#2A2B30"
      />
    </g>
  );
};

/** Groups split up so far: counted once their last member sits. */
const splitSoFar = (rule: Rule, frame: number) =>
  ROOMS[rule].filter(
    (g) =>
      g.split &&
      WALKERS[rule]
        .filter((w) => w.group === g.id)
        .every((w) => frame >= w.seated),
  ).length;

export const Cinema: React.FC = () => {
  const frame = useCurrentFrame();
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
          <linearGradient id="hall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0B0B10" />
            <stop offset="0.4" stopColor="#13121A" />
            <stop offset="1" stopColor="#09090C" />
          </linearGradient>
          <linearGradient id="film-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#070C18" />
            <stop offset="0.6" stopColor="#1A2C4A" />
            <stop offset="1" stopColor="#3A5578" />
          </linearGradient>
          <linearGradient id="searchlight" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="#CFE0FF" stopOpacity={0.35} />
            <stop offset="1" stopColor="#CFE0FF" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="title-metal" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#F4F7FB" />
            <stop offset="0.48" stopColor="#9DAEC4" />
            <stop offset="0.52" stopColor="#5E6F86" />
            <stop offset="1" stopColor="#C9D5E4" />
          </linearGradient>
          <linearGradient
            id="title-sweep"
            x1={0}
            x2={120}
            y1={0}
            y2={0}
            gradientUnits="userSpaceOnUse"
            gradientTransform={`translate(${SX0 + (((frame - TITLE_FROM) * 7) % 900) - 120} 0) skewX(-20)`}
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0.9} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="flash-fill" cx="0.5" cy="0" r="1">
            <stop offset="0" stopColor="#CFE0FF" stopOpacity={0.5} />
            <stop offset="1" stopColor="#CFE0FF" stopOpacity={0.05} />
          </radialGradient>
          <radialGradient id="flare" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.6} />
            <stop offset="1" stopColor="#BFD3FF" stopOpacity={0} />
          </radialGradient>
          <linearGradient
            id="curtain"
            x1="0"
            x2="12"
            y1="0"
            y2="0"
            gradientUnits="userSpaceOnUse"
            spreadMethod="reflect"
          >
            <stop offset="0" stopColor={CURTAIN_B} />
            <stop offset="1" stopColor={CURTAIN_A} />
          </linearGradient>
          <radialGradient id="screen-spill" cx="0.5" cy="0" r="0.9">
            <stop offset="0" stopColor={SCREEN_LIGHT} stopOpacity={0.3} />
            <stop offset="1" stopColor={SCREEN_LIGHT} stopOpacity={0} />
          </radialGradient>
          <linearGradient id="beam" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="#E9F0FF" stopOpacity={0.1} />
            <stop offset="1" stopColor="#E9F0FF" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="seat-back" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={SEAT_TOP} />
            <stop offset="0.35" stopColor={SEAT_MID} />
            <stop offset="1" stopColor={SEAT_LOW} />
          </linearGradient>
          <linearGradient id="seat-side" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity={0.35} />
            <stop offset="0.2" stopColor="#000" stopOpacity={0} />
            <stop offset="0.8" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.35} />
          </linearGradient>
          <linearGradient id="shoulder-shade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity={0.14} />
            <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.45} />
          </linearGradient>
          <pattern
            id="carpet"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <rect width="10" height="10" fill="#17161E" />
            <circle cx="5" cy="5" r="1.2" fill="#2A2533" />
          </pattern>
          <radialGradient id="step-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={WARM} stopOpacity={0.35} />
            <stop offset="1" stopColor={WARM} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="wash" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={WARM} stopOpacity={0.24} />
            <stop offset="1" stopColor={WARM} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="exit-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#E9E4D8" stopOpacity={0.18} />
            <stop offset="1" stopColor="#E9E4D8" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="walkway" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0E0D12" stopOpacity={0} />
            <stop offset="0.3" stopColor="#0E0D12" stopOpacity={0.9} />
            <stop offset="1" stopColor="#0A090D" />
          </linearGradient>
          <linearGradient id="torch" x1="0" x2="0" y1="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.4} />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.6} />
          </radialGradient>
          <filter id="beam-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={10} />
          </filter>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={0.9}
              numOctaves={2}
              seed={frame % 7}
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        {PANELS.map((p) => (
          <Panel key={p.rule} rule={p.rule} top={p.top} frame={frame} />
        ))}
      </svg>
      <Provenance top={PROVENANCE_TOP}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => {
        const room = roomAt(p.rule, frame);
        const name = p.rule === "spread" ? named : 0;
        const number = {
          fontSize: 30,
          fontWeight: 700,
          color: theme.colors.chalk,
        } as const;
        return (
          <div
            key={p.rule}
            style={{
              position: "absolute",
              top: p.top - LABEL_GAP,
              left: LEFT,
              width: W,
              height: 30,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              color: theme.colors.chalk,
            }}
          >
            <div style={{ position: "relative", width: 330, height: 30 }}>
              <div
                style={{
                  position: "absolute",
                  bottom: 2,
                  fontFamily: theme.monoFamily,
                  fontSize: 23,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  opacity: 1 - name,
                }}
              >
                {p.label}
              </div>
              {p.rule === "spread" ? (
                <div
                  style={{
                    position: "absolute",
                    bottom: -4,
                    fontFamily: theme.fontFamily,
                    fontSize: 38,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    opacity: name,
                    transform: `translateY(${(1 - name) * 10}px)`,
                  }}
                >
                  Fragmentation
                </div>
              ) : null}
            </div>
            <div
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 18,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: theme.colors.grayDark,
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              free <span style={number}>{room.free}</span> · gap{" "}
              <span style={number}>{room.longest}</span> · split{" "}
              <span style={number}>{splitSoFar(p.rule, frame)}</span>
            </div>
          </div>
        );
      })}
    </>
  );
};
