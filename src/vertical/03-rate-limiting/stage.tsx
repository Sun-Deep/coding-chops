import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";

/**
 * A toll gate on a road, which is where the whole cut happens.
 *
 * Requests are cars. They drive in from the left, and the limiter is a boom
 * barrier that either lets them through or drops and makes them queue. The
 * counter is a lane sign on a gantry over the road.
 *
 * The scene before this one grew two piles either side of a grey rectangle.
 * Everything it said was true and nothing moved across the frame, which is the
 * structural reason it had no spectacle. A road is the fix: traffic crosses,
 * the barrier drops, and the jam behind it is something a viewer feels rather
 * than reads.
 *
 * Built on the material language in `02-tower-of-hanoi/WeightPlate.tsx`.
 * Gradients across each face, a cast shadow under anything with weight, one
 * specular sweep. A car is a different form from a weight plate because a car
 * is a different thing.
 *
 * One car is ten requests. A hundred at a readable size is four screens wide.
 */

export const STAGE_W = 1080;
export const STAGE_H = 820;

const ROAD_TOP = 320;
const ROAD_BOTTOM = 548;
/** Where the wheels sit. */
const BASE = 520;

/** The post the boom pivots on, and the stop line in front of it. */
const POST_X = 700;
const STOP_X = 630;

export const PER_CAR = 10;
const CAR_W = 150;
const QUEUE_PITCH = 166;

export const StageDefs: React.FC = () => (
  <defs>
    <linearGradient id="rl-road" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#23262B" />
      <stop offset="0.35" stopColor="#191C21" />
      <stop offset="1" stopColor="#0D0F12" />
    </linearGradient>
    <linearGradient id="rl-verge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#12151A" />
      <stop offset="1" stopColor="#080A0D" />
    </linearGradient>
    <linearGradient id="rl-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#FFA870" />
      <stop offset="0.42" stopColor={ACCENT} />
      <stop offset="1" stopColor="#8E3313" />
    </linearGradient>
    <linearGradient id="rl-body-dead" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#6B7077" />
      <stop offset="0.42" stopColor="#454A51" />
      <stop offset="1" stopColor="#22262A" />
    </linearGradient>
    <linearGradient id="rl-glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2C3138" />
      <stop offset="1" stopColor="#12151A" />
    </linearGradient>
    <linearGradient id="rl-steel" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#15181C" />
      <stop offset="0.24" stopColor="#4E535A" />
      <stop offset="0.52" stopColor="#767B82" />
      <stop offset="0.8" stopColor="#3C4147" />
      <stop offset="1" stopColor="#131619" />
    </linearGradient>
    <linearGradient id="rl-boom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#F2EFE7" />
      <stop offset="0.5" stopColor="#CFCBC1" />
      <stop offset="1" stopColor="#8A867E" />
    </linearGradient>
    <linearGradient id="rl-booth" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#2A2E34" />
      <stop offset="0.4" stopColor="#3E434A" />
      <stop offset="1" stopColor="#1A1D21" />
    </linearGradient>
    <radialGradient id="rl-lamp" cx="50%" cy="50%" r="50%">
      <stop offset="0" stopColor={ACCENT} stopOpacity="0.34" />
      <stop offset="1" stopColor={ACCENT} stopOpacity="0" />
    </radialGradient>
  </defs>
);

/** The road, the verge and the lane markings. */
export const Road: React.FC<{ scroll: number }> = ({ scroll }) => (
  <g>
    <rect
      x={0}
      y={ROAD_TOP - 34}
      width={STAGE_W}
      height={34}
      fill="url(#rl-verge)"
    />
    <rect
      x={0}
      y={ROAD_TOP}
      width={STAGE_W}
      height={ROAD_BOTTOM - ROAD_TOP}
      fill="url(#rl-road)"
    />
    <rect
      x={0}
      y={ROAD_TOP}
      width={STAGE_W}
      height={2}
      fill="rgba(233,228,216,0.13)"
    />
    <rect
      x={0}
      y={ROAD_BOTTOM - 2}
      width={STAGE_W}
      height={2}
      fill="rgba(233,228,216,0.09)"
    />

    {/* Centre line. It slides, so the road reads as moving even between cars. */}
    {Array.from({ length: 12 }, (_, i) => (
      <rect
        key={i}
        x={((i * 110 - scroll * 110) % (STAGE_W + 220)) - 110}
        y={ROAD_BOTTOM - 26}
        width={58}
        height={4}
        fill="rgba(233,228,216,0.16)"
      />
    ))}

    {/* The stop line the queue builds behind. */}
    <rect
      x={STOP_X + 30}
      y={ROAD_TOP + 8}
      width={6}
      height={ROAD_BOTTOM - ROAD_TOP - 16}
      fill="rgba(233,228,216,0.2)"
    />
  </g>
);

/** One request. */
export const Car: React.FC<{
  x: number;
  dead?: boolean;
  opacity?: number;
}> = ({ x, dead = false, opacity = 1 }) => {
  const body = dead ? "url(#rl-body-dead)" : "url(#rl-body)";

  return (
    <g transform={`translate(${x} ${BASE})`} opacity={opacity}>
      <ellipse
        cx={4}
        cy={12}
        rx={CAR_W * 0.52}
        ry={11}
        fill="rgba(0,0,0,0.5)"
      />

      {/* Cabin, then body, so the roofline sits behind the shoulder. */}
      <path
        d={`M ${-CAR_W * 0.3} -38 L ${-CAR_W * 0.18} -66 L ${CAR_W * 0.2} -66 L ${CAR_W * 0.32} -38 Z`}
        fill={body}
      />
      <path
        d={`M ${-CAR_W * 0.26} -42 L ${-CAR_W * 0.16} -62 L ${-2} -62 L ${-2} -42 Z`}
        fill="url(#rl-glass)"
      />
      <path
        d={`M ${4} -42 L ${4} -62 L ${CAR_W * 0.17} -62 L ${CAR_W * 0.28} -42 Z`}
        fill="url(#rl-glass)"
      />
      <rect
        x={-CAR_W / 2}
        y={-48}
        width={CAR_W}
        height={42}
        rx={10}
        fill={body}
      />
      <rect
        x={-CAR_W / 2 + 8}
        y={-40}
        width={CAR_W - 16}
        height={4}
        rx={2}
        fill="rgba(255,255,255,0.24)"
      />
      {/* Headlight, on the leading edge. */}
      <rect
        x={CAR_W / 2 - 12}
        y={-26}
        width={9}
        height={7}
        rx={2}
        fill={dead ? "#8A8F96" : "#FFE2C6"}
      />

      <circle cx={-CAR_W * 0.28} cy={-4} r={16} fill="#0C0E11" />
      <circle cx={-CAR_W * 0.28} cy={-4} r={6} fill="#3A3F45" />
      <circle cx={CAR_W * 0.28} cy={-4} r={16} fill="#0C0E11" />
      <circle cx={CAR_W * 0.28} cy={-4} r={6} fill="#3A3F45" />
    </g>
  );
};

/**
 * Traffic crossing the frame.
 *
 * `flow` is how far the stream has travelled, in car-lengths. Cars only run
 * while the barrier is up; the moment it drops they stop being drawn here and
 * start being drawn in the queue.
 */
export const Traffic: React.FC<{ flow: number; open: number }> = ({
  flow,
  open,
}) => {
  if (open < 0.6) return null;
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => {
        const x = ((flow + i / 4) % 1) * 1460 - 220;
        return <Car key={i} x={x} opacity={Math.min(1, (x + 200) / 180)} />;
      })}
    </>
  );
};

/** What could not get through, backed up behind the stop line. */
export const Jam: React.FC<{ count: number }> = ({ count }) => (
  <>
    {Array.from({ length: Math.min(count, 6) }, (_, i) => (
      <Car key={i} x={STOP_X - i * QUEUE_PITCH} dead />
    ))}
  </>
);

/** The boom. 1 is up and out of the way, 0 is down across the lane. */
export const Barrier: React.FC<{ open: number }> = ({ open }) => {
  const pivotY = ROAD_TOP - 18;
  const angle = 90 * open;

  return (
    <g>
      <ellipse
        cx={POST_X}
        cy={BASE + 12}
        rx={34}
        ry={10}
        fill="rgba(0,0,0,0.5)"
      />
      <rect
        x={POST_X - 17}
        y={pivotY - 10}
        width={34}
        height={BASE - pivotY + 14}
        fill="url(#rl-steel)"
      />
      <rect
        x={POST_X - 24}
        y={pivotY - 22}
        width={48}
        height={22}
        rx={4}
        fill="url(#rl-steel)"
      />

      <g transform={`translate(${POST_X} ${pivotY}) rotate(${angle})`}>
        <rect
          x={-296}
          y={-7}
          width={296}
          height={14}
          rx={3}
          fill="url(#rl-boom)"
        />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={-296 + 24 + i * 70}
            y={-7}
            width={34}
            height={14}
            fill={ACCENT}
          />
        ))}
        <circle cx={-296} cy={0} r={9} fill="#E9E4D8" />
      </g>

      {/* A lamp on the post, lit while the lane is closed. */}
      <circle
        cx={POST_X}
        cy={pivotY - 34}
        r={9}
        fill={open < 0.5 ? ACCENT : "#3A3F45"}
      />
      {open < 0.5 ? (
        <circle cx={POST_X} cy={pivotY - 34} r={40} fill="url(#rl-lamp)" />
      ) : null}
    </g>
  );
};

/** The booth the barrier belongs to. */
export const Booth: React.FC = () => (
  <g>
    <rect
      x={764}
      y={ROAD_TOP - 158}
      width={196}
      height={158}
      fill="url(#rl-booth)"
    />
    <rect
      x={752}
      y={ROAD_TOP - 176}
      width={220}
      height={20}
      rx={3}
      fill="url(#rl-steel)"
    />
    <rect
      x={790}
      y={ROAD_TOP - 132}
      width={144}
      height={72}
      rx={3}
      fill="url(#rl-glass)"
    />
    <rect
      x={790}
      y={ROAD_TOP - 132}
      width={144}
      height={26}
      rx={3}
      fill="rgba(255,255,255,0.05)"
    />
  </g>
);

/**
 * The lane sign, on a gantry over the road.
 *
 * The only thing in the cut that can run backwards, which is the entire reason
 * the fixed window shot exists.
 */
export const LaneSign: React.FC<{ value: number; limit: number }> = ({
  value,
  limit,
}) => {
  const digits = String(Math.max(0, Math.min(999, Math.round(value))))
    .padStart(3, "0")
    .split("");
  const w = 72;
  const h = 100;
  const cx = 400;
  const x0 = cx - (w * 3 + 20) / 2;
  const atLimit = value >= limit;

  return (
    <g>
      {/* Two legs down to the verge, so the sign stands on something.
          It hung off a gantry beam first: a thin unlit bar reaching out to a
          leg that stopped on the booth roof. Structurally that made sense and
          it read as a line somebody forgot to delete. */}
      {[300, 520].map((legX) => (
        <g key={legX}>
          <ellipse
            cx={legX + 9}
            cy={ROAD_TOP - 2}
            rx={26}
            ry={7}
            fill="rgba(0,0,0,0.5)"
          />
          <rect
            x={legX}
            y={140}
            width={18}
            height={ROAD_TOP - 140}
            fill="url(#rl-steel)"
          />
        </g>
      ))}

      <rect
        x={x0 - 22}
        y={16}
        width={w * 3 + 20 + 44}
        height={h + 34}
        rx={7}
        fill="url(#rl-steel)"
        stroke="rgba(0,0,0,0.65)"
        strokeWidth={2}
      />
      {digits.map((d, i) => (
        <g key={i}>
          <rect
            x={x0 + i * (w + 10)}
            y={32}
            width={w}
            height={h}
            rx={4}
            fill="#08090C"
          />
          <text
            x={x0 + i * (w + 10) + w / 2}
            y={34 + h * 0.74}
            textAnchor="middle"
            fontFamily={theme.monoFamily}
            fontSize={76}
            fontWeight={700}
            fill={atLimit ? ACCENT : "#E9E4D8"}
          >
            {d}
          </text>
          <rect
            x={x0 + i * (w + 10)}
            y={32}
            width={w}
            height={h * 0.4}
            rx={4}
            fill="rgba(255,255,255,0.05)"
          />
        </g>
      ))}
      <text
        x={x0 + w * 3 + 32}
        y={34 + h * 0.68}
        fontFamily={theme.monoFamily}
        fontSize={30}
        fontWeight={500}
        fill={theme.colors.gray}
      >
        /{limit}
      </text>
    </g>
  );
};

/** The bucket's permits, as a rack of discs on the booth roof. */
export const TokenRack: React.FC<{ tokens: number; capacity: number }> = ({
  tokens,
  capacity,
}) => {
  const level = Math.max(0, Math.min(1, tokens / capacity));
  const slots = 10;
  const lit = Math.round(level * slots);
  const x = 764;
  const y = ROAD_TOP - 268;

  return (
    <g>
      <rect
        x={x - 12}
        y={y - 10}
        width={220}
        height={92}
        rx={5}
        fill="url(#rl-steel)"
      />
      <rect x={x} y={y} width={196} height={72} fill="#08090C" />
      {Array.from({ length: slots }, (_, i) => (
        <circle
          key={i}
          cx={x + 22 + (i % 5) * 38}
          cy={y + 24 + Math.floor(i / 5) * 30}
          r={13}
          fill={i < lit ? ACCENT : "#23262B"}
        />
      ))}
    </g>
  );
};

/** What each side of the barrier has come to, under the road. */
export const Counts: React.FC<{
  through: number;
  rejected: number;
  throughNote?: string;
  rejectedNote?: string;
  noteOpacity?: number;
}> = ({ through, rejected, throughNote, rejectedNote, noteOpacity = 1 }) => {
  const cell = (
    x: number,
    label: string,
    value: number,
    accent: boolean,
    note?: string,
  ) => (
    <g>
      <text
        x={x}
        y={ROAD_BOTTOM + 104}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={24}
        fontWeight={500}
        letterSpacing="4"
        fill={theme.colors.gray}
      >
        {label}
      </text>
      <text
        x={x}
        y={ROAD_BOTTOM + 194}
        textAnchor="middle"
        fontFamily={theme.monoFamily}
        fontSize={92}
        fontWeight={700}
        fill={accent ? ACCENT : value > 0 ? "#E9E4D8" : "#5A5F66"}
      >
        {value}
      </text>
      {note ? (
        <text
          x={x}
          y={ROAD_BOTTOM + 246}
          textAnchor="middle"
          fontFamily={theme.monoFamily}
          fontSize={22}
          opacity={noteOpacity}
          fill={theme.colors.grayDark}
        >
          {note}
        </text>
      ) : null}
    </g>
  );

  return (
    <>
      {cell(304, "TURNED AWAY", rejected, false, rejectedNote)}
      {cell(776, "LET THROUGH", through, true, throughNote)}
    </>
  );
};
