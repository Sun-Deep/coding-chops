import { interpolate, useCurrentFrame } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Provenance } from "../../shared/vertical/type";
import { clamp } from "../../shared/video/timing";
import { VERDICT_FROM, simAt } from "./beats";
import { CONDITIONS, MEASURED } from "./measurements";
import { DESSERT, DINERS, RUNS, sampleAt } from "./runs";
import type { Rule } from "./simulation";
import { floorPose, poseAt, STRIDE_RATE, SCOOP_RATE } from "./motion";

const LEFT = 150;
const W = 780;
const H = 344;
const PANELS = [
  { rule: "line", top: 494, label: "Stay in line" },
  { rule: "skip", top: 926, label: "Go to what you want" },
] as const;
const FOOD = [
  "Salad",
  "Bread",
  "Rice",
  "Pasta",
  "Roast",
  "Veg",
  "Fruit",
  "Dessert",
];
const SKIN = ["#E6C8A6", "#C8A07E", "#A47A5C", "#7E5A42", "#5E4231", "#D9B08D"];
const HAIR = ["#1B1714", "#3A2A1F", "#5B4531", "#2B2723", "#8B7864", "#121010"];
const CLOTHES = [
  "#3F4B59",
  "#656047",
  "#6A4247",
  "#817364",
  "#4B5651",
  "#696B73",
];
const LAMP = "#FFE3B8";
const px = (x: number) => 102 + x * 72;

const Plate: React.FC<{ portions: number; dessert?: boolean }> = ({
  portions,
  dessert,
}) => (
  <g>
    <ellipse cx={16} cy={-48} rx={15} ry={4} fill="#99958D" />
    <ellipse cx={16} cy={-50} rx={15} ry={4} fill="#EEE8DD" />
    <ellipse cx={16} cy={-50} rx={11} ry={2.5} fill="#CFC7B8" />
    {portions > 0 ? (
      dessert ? (
        <>
          <path d="M 10 -52 L 21 -52 L 21 -60 L 10 -60 Z" fill="#492C25" />
          <path d="M 10 -60 L 21 -60 L 19 -63 L 11 -63 Z" fill="#DDD0B5" />
          <path d="M 10 -56 L 21 -56" stroke="#BFA98C" strokeWidth={1.6} />
        </>
      ) : (
        <>
          <ellipse cx={13} cy={-53} rx={5} ry={2} fill="#A9A073" />
          <ellipse cx={20} cy={-52} rx={4} ry={2.3} fill="#716048" />
        </>
      )
    ) : null}
  </g>
);

const Diner: React.FC<{ rule: Rule; id: number; frame: number }> = ({
  rule,
  id,
  frame,
}) => {
  const { p, x, y, scale, speed } = poseAt(rule, id, frame);
  if (
    p.state === "away" ||
    p.state === "done" ||
    x < -50 ||
    x > W + 40 ||
    y > H + 40
  )
    return null;
  const person = DINERS[id];
  const slow = person.slow;
  const skin = SKIN[(id * 5 + 1) % SKIN.length];
  const hair = HAIR[(id * 3 + 2) % HAIR.length];
  const shirt = slow ? ACCENT : CLOTHES[(id * 7 + 3) % CLOTHES.length];
  const height = 0.95 + ((id * 37) % 12) / 100;
  const step = Math.sin(frame * STRIDE_RATE + id * 2.3) * speed;
  const bob = Math.abs(Math.cos(frame * STRIDE_RATE + id * 2.3)) * speed * 1.5;
  const serve = p.state === "serve";
  const scoop = serve ? Math.sin(frame * SCOOP_RATE + id) * 0.5 + 0.5 : 0;
  const sway = Math.sin(frame * 0.07 + id) * 0.65 * (1 - speed);
  return (
    <g
      transform={`translate(${x + sway} ${y}) scale(${scale} ${scale * height})`}
    >
      <ellipse cx={0} cy={1} rx={25} ry={5.5} fill="url(#buffet-contact)" />
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 5} ${side * step * 3})`}>
          <path
            d="M -4 -38 L 5 -38 L 5 -3 L -4 -3 Z"
            fill={id % 3 === 0 ? "#3D4552" : "#252A30"}
          />
          <path d="M -5 -5 L 6 -5 L 9 -1 L -5 -1 Z" fill="#101114" />
          <path d="M -2 -35 L -2 -7" stroke="#E9E4D8" strokeOpacity={0.1} />
        </g>
      ))}
      <g transform={`translate(0 ${-bob})`}>
        <path
          d="M -13 -36 L -15 -69 Q -13 -77 -8 -77 L 8 -77 Q 14 -76 15 -69 L 13 -36 Z"
          fill={shirt}
        />
        <path
          d="M -13 -36 L -15 -69 Q -13 -77 -8 -77 L 8 -77 Q 14 -76 15 -69 L 13 -36 Z"
          fill="url(#buffet-cloth)"
        />
        <path
          d="M -14 -69 L -12 -38"
          stroke={LAMP}
          strokeOpacity={0.38}
          strokeWidth={1.5}
        />
        {id % 4 === 1 ? (
          <>
            <path
              d="M -9 -72 L -8 -37 M 9 -72 L 8 -37"
              stroke="#B3ADA2"
              strokeOpacity={0.25}
              strokeWidth={1.2}
            />
            <path
              d="M -3 -70 L 0 -66 L 3 -70"
              stroke="#DED6C8"
              strokeOpacity={0.35}
              fill="none"
            />
          </>
        ) : null}
        {id % 4 === 3 ? (
          <path d="M -10 -74 Q 0 -60 10 -74" fill="#171A1E" opacity={0.45} />
        ) : null}
        <path
          d="M -15 -69 L -19 -53 L -10 -49"
          fill="none"
          stroke={shirt}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <path
          d={`M 15 -69 L ${21 + scoop * 8} ${-58 - scoop * 12} L ${21 + scoop * 13} ${-49 - scoop * 20}`}
          fill="none"
          stroke={shirt}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <circle cx={21 + scoop * 13} cy={-49 - scoop * 20} r={3} fill={skin} />
        {serve ? (
          <path
            d={`M ${22 + scoop * 13} ${-49 - scoop * 20} l 10 -8 l 3 4 l -5 6`}
            fill="none"
            stroke="#C1C1B8"
            strokeWidth={1.8}
          />
        ) : null}
        <Plate portions={p.portions} dessert={id === DESSERT} />
        <rect x={-3} y={-83} width={6} height={8} fill={skin} />
        <ellipse cx={0} cy={-90} rx={8} ry={10} fill={skin} />
        <ellipse cx={0} cy={-90} rx={8} ry={10} fill="url(#buffet-face)" />
        {id % 5 === 0 ? (
          <path d="M -8 -92 Q 0 -107 8 -92 L 8 -87 L -8 -87 Z" fill={hair} />
        ) : id % 5 === 1 ? (
          <path
            d="M -8 -91 Q -9 -102 0 -102 Q 9 -102 8 -91 L 10 -76 L -10 -76 Z"
            fill={hair}
          />
        ) : id % 5 === 2 ? (
          <>
            <ellipse cx={0} cy={-92} rx={8} ry={9} fill={hair} />
            <circle cx={0} cy={-102} r={4} fill={hair} />
          </>
        ) : id % 5 === 3 ? (
          <path
            d="M -8 -90 Q -11 -95 -6 -98 Q -5 -106 0 -101 Q 7 -106 8 -96 L 8 -88 Z"
            fill={hair}
          />
        ) : (
          <path
            d="M -8 -90 Q -8 -98 -4 -98 M 8 -90 Q 8 -98 4 -98"
            stroke={hair}
            strokeWidth={3}
            fill="none"
          />
        )}
        <path
          d="M -7 -92 Q -9 -97 -3 -99"
          stroke={LAMP}
          strokeOpacity={0.4}
          strokeWidth={1.2}
          fill="none"
        />
      </g>
      {p.blocked && rule === "line" ? (
        <path
          d="M -20 7 L 20 7"
          stroke={ACCENT}
          strokeWidth={2}
          opacity={0.7}
        />
      ) : null}
    </g>
  );
};

/** Eight recognisable foods on steel trays under the same warm lamps. */
const Food: React.FC<{ dish: number }> = ({ dish }) => (
  <g transform={`translate(${px(dish + 0.5)} 155)`}>
    <path d="M -31 -14 L 25 -14 L 32 4 L -25 4 Z" fill="url(#buffet-steel)" />
    <path d="M -26 -11 L 21 -11 L 26 1 L -21 1 Z" fill="#302E27" />
    {Array.from({ length: 12 }, (_, i) => {
      const x = -19 + (i % 4) * 11;
      const y = -8 + Math.floor(i / 4) * 3.5;
      if (dish === 7)
        return (
          <g key={i}>
            <path d={`M ${x} ${y} h 8 v -6 h -8 Z`} fill="#52352B" />
            <path d={`M ${x} ${y - 6} h 8 l -2 -2 h -6 Z`} fill="#D6C7AB" />
            <path d={`M ${x} ${y - 3} h 8`} stroke="#BCA186" strokeWidth={1} />
          </g>
        );
      return (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx={dish === 1 ? 5 : 4}
          ry={dish === 1 ? 2.5 : 1.8}
          fill={
            dish === 0
              ? ["#697749", "#82905B", "#ADB57C"][i % 3]
              : dish === 1
                ? ["#B9A173", "#D3BD8C"][i % 2]
                : dish === 2
                  ? "#D4C9A2"
                  : dish === 3
                    ? ["#BAA776", "#CEBE87"][i % 2]
                    : dish === 4
                      ? ["#795542", "#997155"][i % 2]
                      : dish === 5
                        ? ["#737B52", "#A8A46C"][i % 2]
                        : ["#A7A164", "#C4B384"][i % 2]
          }
        />
      );
    })}
    <path
      d="M -26 3 L 31 3"
      stroke="#D9D6C7"
      strokeOpacity={0.6}
      strokeWidth={1.2}
    />
    <path
      d="M 27 -10 l 7 -10 m -7 10 l 10 -6"
      stroke="#BFC0B4"
      strokeWidth={1.5}
    />
  </g>
);

const Room: React.FC<{ rule: Rule; top: number; frame: number }> = ({
  rule,
  top,
  frame,
}) => {
  const t = simAt(frame);
  const sample = sampleAt(rule, t);
  const people = DINERS.filter(
    (p) => sample[p.id].state !== "away" && sample[p.id].state !== "done",
  ).sort(
    (a, b) => floorPose(rule, sample[a.id]).y - floorPose(rule, sample[b.id]).y,
  );
  const dessert = poseAt(rule, DESSERT, frame);
  const live = dessert.p.state !== "away" && dessert.p.state !== "done";
  return (
    <g transform={`translate(${LEFT} ${top})`}>
      <defs>
        <clipPath id={`buffet-${rule}`}>
          <rect width={W} height={H} rx={12} />
        </clipPath>
      </defs>
      <g clipPath={`url(#buffet-${rule})`}>
        <rect width={W} height={H} fill="url(#buffet-wall)" />
        {/* Wall panels, a lit buffet sign, and stacks of clean plates. */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <g key={i}>
            <rect
              x={i * 122 - 10}
              y={0}
              width={114}
              height={150}
              fill="none"
              stroke="#A18B6A"
              strokeOpacity={0.12}
            />
            <path
              d={`M ${i * 122} 6 v 110`}
              stroke="#000"
              strokeOpacity={0.2}
            />
          </g>
        ))}
        <text
          x={W / 2}
          y={38}
          fill="#D8C8AC"
          fontFamily={theme.monoFamily}
          fontSize={15}
          letterSpacing="0.3em"
          textAnchor="middle"
        >
          THE BUFFET
        </text>
        <path
          d="M 90 131 L 738 131 L 761 164 L 73 164 Z"
          fill="url(#buffet-stone)"
        />
        <path
          d="M 73 164 L 761 164 L 757 215 L 76 215 Z"
          fill="url(#buffet-wood)"
        />
        <path
          d="M 76 169 L 758 169"
          stroke="#EBD3A6"
          strokeOpacity={0.38}
          strokeWidth={2}
        />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path
            key={i}
            d={`M ${85 + i * 83} 173 v 35`}
            stroke="#0E0C0B"
            strokeWidth={2}
            opacity={0.6}
          />
        ))}
        <path
          d="M 0 215 L 780 215 L 780 344 L 0 344 Z"
          fill="url(#buffet-floor)"
        />
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <path
            key={i}
            d={`M ${i * 87} 215 L ${i * 110 - 100} 344`}
            stroke="#030303"
            strokeOpacity={0.25}
          />
        ))}
        {[253, 303].map((y) => (
          <path
            key={y}
            d={`M 0 ${y} H 780`}
            stroke="#030303"
            strokeOpacity={0.28}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <ellipse
              cx={150 + i * 170}
              cy={236}
              rx={100}
              ry={18}
              fill="url(#buffet-pool)"
            />
            <path
              d={`M ${150 + i * 170} 0 v 58`}
              stroke="#14120F"
              strokeWidth={2}
            />
            <path
              d={`M ${126 + i * 170} 74 L ${140 + i * 170} 56 L ${160 + i * 170} 56 L ${174 + i * 170} 74 Z`}
              fill="#272521"
            />
            <ellipse cx={150 + i * 170} cy={74} rx={23} ry={4} fill={LAMP} />
            <ellipse
              cx={150 + i * 170}
              cy={80}
              rx={52}
              ry={24}
              fill="url(#buffet-bulb)"
            />
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <g key={i}>
            <text
              x={px(i + 0.5)}
              y={116}
              textAnchor="middle"
              fill="#D9CCB4"
              fontSize={14}
              fontWeight={600}
              fontFamily={theme.fontFamily}
            >
              {FOOD[i]}
            </text>
            <Food dish={i} />
          </g>
        ))}
        {/* The sneeze guard has thin uprights and a single glass reflection. */}
        <path
          d="M 80 131 L 738 131 L 734 90 L 89 90 Z"
          fill="#E9E4D8"
          fillOpacity={0.025}
          stroke="#BBB9AF"
          strokeOpacity={0.27}
        />
        <path d="M 85 95 L 739 95" stroke="#F3E4C5" strokeOpacity={0.25} />
        {[89, 302, 516, 738].map((x) => (
          <path key={x} d={`M ${x} 89 v 57`} stroke="#92958F" strokeWidth={2} />
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${32 + i * 5} ${183 - i * 8})`}>
            <ellipse rx={15} ry={4} fill="#8C8B81" />
            <path
              d="M -15 -9 v 9 M 15 -9 v 9"
              stroke="#D4CEC1"
              strokeWidth={3}
            />
            <ellipse cy={-9} rx={15} ry={4} fill="#DED7C7" />
          </g>
        ))}
        {/* Hot trays release steam under the guard. */}
        {[2, 3, 4, 5].map((d) =>
          [0, 1].map((i) => {
            const u = (frame * 0.009 + i * 0.5 + d * 0.15) % 1;
            return (
              <path
                key={`${d}-${i}`}
                d={`M ${px(d + 0.5) + i * 12 - 6} ${141 - u * 30} q -5 -8 1 -16 q 5 -7 -1 -12`}
                stroke={LAMP}
                strokeWidth={1.6}
                opacity={0.11 * Math.sin(u * Math.PI)}
                fill="none"
              />
            );
          }),
        )}
        {people.map((p) => (
          <Diner key={p.id} rule={rule} id={p.id} frame={frame} />
        ))}
        {live && frame < 144 ? (
          <g
            transform={`translate(${dessert.x} ${dessert.y - dessert.scale * 113})`}
          >
            <rect
              x={-55}
              y={-20}
              width={110}
              height={25}
              rx={4}
              fill="#0F1011"
              fillOpacity={0.92}
            />
            <text
              textAnchor="middle"
              y={-3}
              fill={theme.colors.chalk}
              fontFamily={theme.fontFamily}
              fontSize={17}
              fontWeight={700}
            >
              Dessert only
            </text>
            <path
              d="M 0 9 v 9"
              stroke={theme.colors.chalk}
              strokeOpacity={0.65}
            />
          </g>
        ) : null}
        {DINERS.filter((p) => p.slow && sample[p.id].state === "serve").map(
          (p) => {
            const pos = poseAt(rule, p.id, frame);
            return (
              <g
                key={p.id}
                transform={`translate(${pos.x} ${pos.y - pos.scale * 113})`}
              >
                <rect
                  x={-27}
                  y={-20}
                  width={54}
                  height={23}
                  rx={3}
                  fill="#19130F"
                  stroke={ACCENT}
                  strokeWidth={1}
                />
                <text
                  y={-4}
                  textAnchor="middle"
                  fill={ACCENT}
                  fontFamily={theme.monoFamily}
                  fontSize={14}
                  fontWeight={700}
                >
                  SLOW
                </text>
              </g>
            );
          },
        )}
        {/* Warm material grade and lens falloff, restrained as in VR32. */}
        <rect width={W} height={H} fill="url(#buffet-vignette)" />
      </g>
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={12}
        fill="none"
        stroke="#36312A"
      />
    </g>
  );
};

const mmss = (seconds: number) =>
  `${Math.floor(Math.round(seconds) / 60)}:${String(Math.round(seconds) % 60).padStart(2, "0")}`;
export const Buffet: React.FC = () => {
  const frame = useCurrentFrame();
  const t = simAt(frame);
  const verdict = interpolate(
    frame,
    [VERDICT_FROM, VERDICT_FROM + 12],
    [0, 1],
    clamp,
  );
  const fair = interpolate(frame, [276, 286], [0, 1], clamp);
  return (
    <>
      <svg
        width={1080}
        height={1920}
        style={{ position: "absolute", inset: 0 }}
      >
        <defs>
          <linearGradient id="buffet-wall" x2="0" y2="1">
            <stop stopColor="#181411" />
            <stop offset="0.6" stopColor="#352B21" />
            <stop offset="1" stopColor="#211B16" />
          </linearGradient>
          <linearGradient id="buffet-stone" x2="0" y2="1">
            <stop stopColor="#A19682" />
            <stop offset="0.6" stopColor="#D4C6A9" />
            <stop offset="1" stopColor="#827B6D" />
          </linearGradient>
          <linearGradient id="buffet-steel" x2="0.7" y2="1">
            <stop stopColor="#E1DED0" />
            <stop offset="0.3" stopColor="#777C7A" />
            <stop offset="0.6" stopColor="#C1BCAE" />
            <stop offset="1" stopColor="#666D6B" />
          </linearGradient>
          <linearGradient id="buffet-wood" x2="1" y2="0">
            <stop stopColor="#37271C" />
            <stop offset="0.45" stopColor="#644B33" />
            <stop offset="1" stopColor="#3D2D20" />
          </linearGradient>
          <linearGradient id="buffet-floor" x2="0" y2="1">
            <stop stopColor="#332A22" />
            <stop offset="1" stopColor="#181513" />
          </linearGradient>
          <linearGradient id="buffet-cloth" x2="1" y2="0">
            <stop stopColor="#fff" stopOpacity={0.18} />
            <stop offset="0.4" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.4} />
          </linearGradient>
          <radialGradient id="buffet-face" cx="0.35" cy="0.3">
            <stop stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.24} />
          </radialGradient>
          <radialGradient id="buffet-contact">
            <stop stopColor="#000" stopOpacity={0.65} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="buffet-bulb">
            <stop stopColor={LAMP} stopOpacity={0.22} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="buffet-pool">
            <stop stopColor={LAMP} stopOpacity={0.12} />
            <stop offset="1" stopColor={LAMP} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="buffet-vignette">
            <stop offset="0.5" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.4} />
          </radialGradient>
        </defs>
        {PANELS.map((p) => (
          <Room key={p.rule} rule={p.rule} top={p.top} frame={frame} />
        ))}
      </svg>
      <Provenance top={424}>{CONDITIONS}</Provenance>
      {PANELS.map((p) => {
        const completed = RUNS[p.rule].finished.filter(
          (end) => end <= t,
        ).length;
        return (
          <div
            key={p.rule}
            style={{
              position: "absolute",
              left: LEFT,
              top: p.top - 35,
              width: W,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 22,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {p.label}
            </div>
            <div
              style={{
                fontFamily: theme.monoFamily,
                fontSize: 19,
                color: theme.colors.grayDark,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {verdict > 0.5 ? "AVG PLATE " : "PLATES IN "}
              <span
                style={{
                  fontSize: 30,
                  color: theme.colors.chalk,
                  fontWeight: 700,
                }}
              >
                {verdict > 0.5
                  ? mmss(MEASURED.average[p.rule])
                  : `${completed}/${MEASURED.people}`}
              </span>
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          top: 852,
          left: LEFT,
          width: W,
          textAlign: "center",
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: "-0.025em",
          opacity: verdict,
        }}
      >
        {MEASURED.average.ratio.toFixed(1)}x faster on average{" "}
        <span
          style={{
            fontFamily: theme.monoFamily,
            fontSize: 18,
            fontWeight: 400,
            color: theme.colors.grayDark,
          }}
        >
          · {MEASURED.runs} runs
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1276,
          left: LEFT,
          width: W,
          textAlign: "center",
          fontFamily: theme.monoFamily,
          fontSize: 20,
          color: theme.colors.grayDark,
          opacity: fair,
        }}
      >
        {MEASURED.average.worse.toFixed(0)}% wait longer · +
        {Math.round(MEASURED.average.extra)}s on average for them
      </div>
    </>
  );
};
