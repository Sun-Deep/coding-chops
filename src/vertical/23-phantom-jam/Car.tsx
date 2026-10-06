import { theme } from "../../shared/brand/theme";

/**
 * A car from straight above, drawn in metres and scaled to the ring, so it is
 * the same 4.5 by 1.85 metres the physics uses. Heading is -y.
 *
 * What makes a shape read as a car at feed size is a short list: a nose and a
 * tail that differ, a windscreen, a roof, tyres showing at the corners, lights
 * at both ends, and a shadow so it sits on the road instead of on the screen.
 * Body colours are neutrals, silver to graphite, so the only hues in the frame
 * stay the accent and the brake red.
 */

const L = 4.5;
const W = 1.85;

export const CAR_SHADES = [
  "#D9D5CB",
  "#B9B6AF",
  "#8E9096",
  "#C9C4B8",
  "#6F7278",
];

export const Car: React.FC<{
  id: string;
  /** Pixels per metre. */
  scale: number;
  body: string;
  /** 0 to 1, how hard it is braking. */
  brake: number;
  brakeColor: string;
  /** Headlights on. Off for a parked car. */
  beam?: boolean;
}> = ({ id, scale, body, brake, brakeColor, beam = true }) => {
  const hl = L / 2;
  const hw = W / 2;
  return (
    <g transform={`scale(${scale})`}>
      <defs>
        <linearGradient id={`body-${id}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0.45} />
          <stop offset="0.22" stopColor="#000" stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.16} />
          <stop offset="0.78" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.45} />
        </linearGradient>
      </defs>

      {/* Headlight beam on the road ahead. */}
      {beam ? (
        <path
          d={`M ${-0.7} ${-hl} L ${-1.6} ${-hl - 4.2} L ${1.6} ${-hl - 4.2} L ${0.7} ${-hl} Z`}
          fill={theme.colors.chalk}
          opacity={0.07}
        />
      ) : null}

      {/* Shadow. */}
      <rect
        x={-hw + 0.12}
        y={-hl + 0.22}
        width={W}
        height={L}
        rx={0.5}
        fill="#000"
        opacity={0.55}
      />

      {/* Tyres, showing past the body at the four corners. */}
      {[-1, 1].flatMap((sx) =>
        [-1.45, 1.4].map((wy) => (
          <rect
            key={`${sx}${wy}`}
            x={sx * (hw - 0.02) - 0.17}
            y={wy - 0.36}
            width={0.34}
            height={0.72}
            rx={0.1}
            fill="#07080A"
          />
        )),
      )}

      {/* Body: a blunter tail than nose. */}
      <path
        d={[
          `M ${-hw + 0.28} ${-hl}`,
          `Q ${-hw} ${-hl} ${-hw} ${-hl + 0.5}`,
          `L ${-hw} ${hl - 0.32}`,
          `Q ${-hw} ${hl} ${-hw + 0.3} ${hl}`,
          `L ${hw - 0.3} ${hl}`,
          `Q ${hw} ${hl} ${hw} ${hl - 0.32}`,
          `L ${hw} ${-hl + 0.5}`,
          `Q ${hw} ${-hl} ${hw - 0.28} ${-hl}`,
          "Z",
        ].join(" ")}
        fill={body}
      />
      <path
        d={`M ${-hw} ${-hl + 0.5} L ${-hw} ${hl - 0.32} L ${hw} ${hl - 0.32} L ${hw} ${-hl + 0.5} Z`}
        fill={`url(#body-${id})`}
      />

      {/* Mirrors. */}
      {[-1, 1].map((sx) => (
        <ellipse
          key={sx}
          cx={sx * (hw + 0.1)}
          cy={-0.55}
          rx={0.14}
          ry={0.1}
          fill={body}
        />
      ))}

      {/* Windscreen, roof, rear window. */}
      <path
        d={`M ${-hw + 0.24} -0.35 L ${-hw + 0.38} -1.05 L ${hw - 0.38} -1.05 L ${hw - 0.24} -0.35 Z`}
        fill="#0C1016"
      />
      <path
        d={`M ${-hw + 0.38} -1.0 L ${hw - 0.38} -1.0`}
        stroke="#fff"
        strokeOpacity={0.18}
        strokeWidth={0.06}
      />
      <rect
        x={-hw + 0.24}
        y={-0.35}
        width={W - 0.48}
        height={1.35}
        rx={0.12}
        fill={body}
      />
      <rect
        x={-hw + 0.24}
        y={-0.35}
        width={W - 0.48}
        height={1.35}
        rx={0.12}
        fill="#000"
        opacity={0.1}
      />
      <path
        d={`M ${-hw + 0.24} 1.0 L ${hw - 0.24} 1.0 L ${hw - 0.36} 1.5 L ${-hw + 0.36} 1.5 Z`}
        fill="#0C1016"
      />

      {/* Headlights. */}
      {[-1, 1].map((sx) => (
        <ellipse
          key={sx}
          cx={sx * 0.6}
          cy={-hl + 0.12}
          rx={0.22}
          ry={0.08}
          fill="#FFF8E8"
        />
      ))}

      {/* Tail lights, dim when cruising, full when braking. */}
      {[-1, 1].map((sx) => (
        <rect
          key={sx}
          x={sx * 0.62 - 0.24}
          y={hl - 0.12}
          width={0.48}
          height={0.1}
          rx={0.04}
          fill={brakeColor}
          opacity={0.4 + 0.6 * brake}
        />
      ))}
    </g>
  );
};
