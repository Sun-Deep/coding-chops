import { interpolate } from "remotion";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { clamp } from "../../shared/video/timing";
import {
  BLOCK_FROM,
  BLOCK_TO,
  CAMERA_WIDEN_FROM,
  CAMERA_WIDEN_TO,
  simAt,
} from "./beats";
import { MEASURED } from "./measurements";
import { RUN } from "./runs";
import { brakeLightAt, highBeamAt } from "./signals";
import { atTime, blockedAt, stopIndex } from "./simulation";

/** Camera follows the orange bus. Bus shapes are enlarged; road distances are compressed. */
const project = (world: number, camera: number, frame: number) => {
  const distanceScale = interpolate(
    frame,
    [CAMERA_WIDEN_FROM, CAMERA_WIDEN_TO],
    [2.8, 0.6],
    clamp,
  );
  const d = world - camera;
  return (
    720 + (d < 0 ? -270 * (1 - Math.exp(d / 5)) + d * distanceScale : d * 1.25)
  );
};

export const Person: React.FC<{
  x: number;
  y: number;
  fade?: number;
  light?: boolean;
}> = ({ x, y, fade = 1, light = false }) => (
  <g transform={`translate(${x} ${y})`} opacity={fade}>
    <ellipse cy={49} rx={10} ry={3} fill="#000" opacity={0.45} />
    <path
      d="M-5 29 L-6 47 M5 29 L7 47"
      stroke="#C8C7C2"
      strokeWidth={5}
      strokeLinecap="round"
    />
    <path
      d="M-11 10 Q0 4 11 10 L8 31 L-8 31 Z"
      fill={light ? "#D8D5CD" : "#737579"}
    />
    <path
      d="M-11 13 L-13 30 M11 13 L13 30"
      stroke="#A7A49D"
      strokeWidth={4}
      strokeLinecap="round"
    />
    <circle cy={-1} r={7} fill="#C8B7A0" />
    <path d="M-7 -3 Q-7 -12 1 -10 Q8 -8 7 -2" fill="#343330" />
  </g>
);

export const Bus: React.FC<{
  x: number;
  y: number;
  orange?: boolean;
  moving?: boolean;
  time: number;
  door?: boolean;
  headlightFlash?: number;
  brakeLight?: number;
}> = ({
  x,
  y,
  orange = false,
  moving = false,
  time,
  door = false,
  headlightFlash = 0,
  brakeLight = 0,
}) => (
  <g transform={`translate(${x} ${y}) scale(1.15)`}>
    <ellipse cx={4} cy={76} rx={113} ry={12} fill="#000" opacity={0.6} />
    <rect
      x={-102}
      y={-27}
      width={208}
      height={98}
      rx={14}
      fill={orange ? "url(#bus-orange)" : "url(#bus-silver)"}
      stroke={orange ? "#F1A372" : "#B8BBB9"}
      strokeWidth={1.5}
    />
    <path
      d="M-97 -17 Q-95 -24 -86 -24 L86 -24 Q99 -24 101 -12 L102 16 L-98 16Z"
      fill="#202830"
    />
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i}>
        <rect
          x={-91 + i * 26}
          y={-16}
          width={22}
          height={27}
          rx={3}
          fill="url(#window)"
        />
        <circle
          cx={-80 + i * 26}
          cy={-2}
          r={4}
          fill="#B9B4A9"
          opacity={orange ? 0.85 : 0.35}
        />
        <path
          d={`M${-86 + i * 26} 11q6 -11 12 0`}
          fill="#93938F"
          opacity={orange ? 0.85 : 0.35}
        />
      </g>
    ))}
    <path
      d="M-94 -22 L78 -22"
      stroke="#FFFFFF"
      strokeOpacity={0.3}
      strokeWidth={2}
    />
    <path
      d="M-100 29 L104 29 M-100 55 L104 55"
      stroke="#17191B"
      strokeOpacity={0.25}
      strokeWidth={2}
    />
    <rect
      x={69}
      y={-14}
      width={30}
      height={75}
      rx={3}
      fill="#242A2D"
      stroke="#656A6C"
    />
    <rect
      x={73 + (door ? 7 : 0)}
      y={-10}
      width={door ? 5 : 10}
      height={65}
      fill="url(#window)"
    />
    <rect x={87} y={-10} width={door ? 5 : 8} height={65} fill="url(#window)" />
    <path
      d="M-76 38 H44"
      stroke={orange ? "#4B2719" : "#858D91"}
      strokeWidth={3}
      opacity={0.5}
    />
    {headlightFlash > 0 ? (
      <g opacity={headlightFlash}>
        <rect
          x={96}
          y={23}
          width={15}
          height={26}
          rx={7}
          fill="#FFF"
          opacity={0.65}
          filter="url(#lamp-bloom)"
        />
        <path
          d="M106 35.5H133"
          stroke="url(#headlight-streak)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <ellipse
          cx={123}
          cy={88}
          rx={29}
          ry={4}
          fill="url(#headlight-spill)"
          opacity={0.4}
        />
      </g>
    ) : null}
    <rect
      x={99}
      y={26}
      width={8}
      height={20}
      rx={3}
      fill="#363C3F"
      stroke="#ACB0AF"
      strokeWidth={0.7}
    />
    {[28, 37].map((y) => (
      <rect
        key={y}
        x={100}
        y={y}
        width={6}
        height={7}
        rx={1.5}
        fill="#FFFDF4"
        opacity={0.4 + headlightFlash * 0.6}
      />
    ))}
    {brakeLight > 0 ? (
      <g opacity={brakeLight}>
        <rect
          x={-110}
          y={24}
          width={16}
          height={29}
          rx={7}
          fill="#FF3B30"
          opacity={0.7}
          filter="url(#lamp-bloom)"
        />
        <ellipse
          cx={-103}
          cy={88}
          rx={23}
          ry={4}
          fill="url(#brake-spill)"
          opacity={0.38}
        />
      </g>
    ) : null}
    <rect
      x={-105}
      y={25}
      width={8}
      height={27}
      rx={3}
      fill="#282326"
      stroke="#8E7472"
      strokeWidth={0.7}
    />
    <rect x={-104} y={27} width={6} height={23} rx={2} fill="#702825" />
    <rect
      x={-104}
      y={27}
      width={6}
      height={23}
      rx={2}
      fill="#FF3B30"
      opacity={brakeLight}
    />
    <path
      d="M-102 30V47"
      stroke="#FFD3C7"
      strokeWidth={1.5}
      opacity={brakeLight * 0.85}
    />
    {[-65, 65].map((wheel) => (
      <g
        key={wheel}
        transform={`translate(${wheel} 65) rotate(${moving ? time * 90 : 0})`}
      >
        <circle r={20} fill="#0C0D0F" stroke="#34373B" strokeWidth={3} />
        <circle r={11} fill="#92979A" stroke="#D4D5D2" strokeWidth={2} />
        <circle r={4} fill="#555C60" />
        {[0, 60, 120].map((a) => (
          <path
            key={a}
            d="M-8 0H8"
            stroke="#585E62"
            strokeWidth={2}
            transform={`rotate(${a})`}
          />
        ))}
      </g>
    ))}
  </g>
);

export const Street: React.FC<{ frame: number }> = ({ frame }) => {
  const time = simAt(frame);
  const snapshot = atTime(RUN, time);
  const previous = atTime(RUN, time - 0.25);
  const camera = snapshot.buses[0].position;
  const buses = snapshot.buses.map((bus) => ({
    ...bus,
    x: project(bus.position, camera, frame),
  }));
  const stops = Array.from(
    { length: 7 },
    (_, i) => Math.floor(camera / 300) * 300 + (i - 4) * 300,
  );
  const blocked = blockedAt(snapshot);
  const headlightFlash = highBeamAt(frame);
  const verdict = interpolate(
    frame,
    [BLOCK_FROM, BLOCK_FROM + 10],
    [0, 1],
    clamp,
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="lamp-bloom" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={3} />
        </filter>
        <linearGradient id="headlight-streak" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#FFF" stopOpacity={0.7} />
          <stop offset="1" stopColor="#FFF" stopOpacity={0} />
        </linearGradient>
        <radialGradient id="headlight-spill">
          <stop stopColor="#FFFDF4" stopOpacity={0.8} />
          <stop offset="1" stopColor="#FFFDF4" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="brake-spill">
          <stop stopColor="#FF3B30" stopOpacity={0.8} />
          <stop offset="1" stopColor="#FF3B30" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="bus-orange" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFC09B" />
          <stop offset="0.25" stopColor={ACCENT} />
          <stop offset="1" stopColor="#A94F27" />
        </linearGradient>
        <linearGradient id="bus-silver" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#E4E4DE" />
          <stop offset="0.4" stopColor="#ACB1B3" />
          <stop offset="1" stopColor="#646C72" />
        </linearGradient>
        <linearGradient id="window" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#63707A" />
          <stop offset="0.4" stopColor="#303C45" />
          <stop offset="1" stopColor="#141D25" />
        </linearGradient>
        <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#242628" />
          <stop offset="1" stopColor="#111315" />
        </linearGradient>
        <linearGradient id="pavement" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#181C20" />
          <stop offset="1" stopColor="#323539" />
        </linearGradient>
        <clipPath id="street-crop">
          <rect x={96} y={515} width={828} height={700} />
        </clipPath>
      </defs>
      <g clipPath="url(#street-crop)">
        <rect x={96} y={748} width={828} height={179} fill="url(#pavement)" />
        <path d="M96 912H924" stroke="#74767B" strokeWidth={5} />
        <path d="M96 920H924" stroke="#111214" strokeWidth={10} />
        <rect x={96} y={925} width={828} height={235} fill="url(#asphalt)" />
        <path d="M96 1121H924" stroke="#3B3D40" strokeWidth={2} />
        {Array.from({ length: 29 }, (_, i) => {
          const world = (Math.floor(camera / 50) + i - 20) * 50;
          const x = project(world, camera, frame);
          return (
            <path
              key={world}
              d={`M${x} 1096h${world < camera ? 17 : 28}`}
              stroke="#C8C7C2"
              strokeOpacity={0.3}
              strokeWidth={5}
            />
          );
        })}
        {stops.map((world) => {
          const x = project(world, camera, frame);
          if (x < 40 || x > 1000) return null;
          const stop = stopIndex(world);
          const queue = snapshot.queues[stop];
          const serving = snapshot.buses.find(
            (b) => b.state === "board" && b.nextStop === world,
          );
          const walking = serving
            ? Math.max(0, Math.min(1, 1 - (serving.until - time) / 2.5))
            : 0;
          return (
            <g key={world}>
              <path d={`M${x + 84} 745V889`} stroke="#73787D" strokeWidth={5} />
              <rect
                x={x + 58}
                y={706}
                width={52}
                height={54}
                rx={7}
                fill="#E3E1D9"
              />
              <rect
                x={x + 67}
                y={719}
                width={34}
                height={22}
                rx={4}
                fill="#343C42"
              />
              <circle cx={x + 74} cy={744} r={3} fill="#343C42" />
              <circle cx={x + 94} cy={744} r={3} fill="#343C42" />
              <path
                d={`M${x + 24} 895h96`}
                stroke="#91918A"
                strokeWidth={3}
                opacity={0.55}
              />
              {queue.slice(0, 20).map((arrived, index) => (
                <Person
                  key={arrived}
                  x={x + 46 - (index % 5) * 25}
                  y={838 - Math.floor(index / 5) * 57}
                  light={index % 3 === 0}
                />
              ))}
              {serving &&
              serving.boarding > 0 &&
              serving.until - time <= 2.5 ? (
                <Person
                  x={x + 46 + walking * 54}
                  y={838 + walking * 96}
                  fade={1 - Math.max(0, (walking - 0.7) / 0.3)}
                  light
                />
              ) : null}
            </g>
          );
        })}
        {buses.map((bus, id) => (
          <g key={id}>
            <Bus
              x={bus.x}
              y={945}
              orange={id === 0}
              moving={bus.position > previous.buses[id].position + 0.01}
              time={time}
              door={bus.state === "board"}
              headlightFlash={id === 1 ? headlightFlash : 0}
              brakeLight={brakeLightAt(frame, id)}
            />
            <text
              x={bus.x}
              y={1175}
              textAnchor="middle"
              opacity={
                id === 1 ? interpolate(bus.x, [200, 230], [0, 1], clamp) : 1
              }
              fill={id === 0 ? ACCENT : theme.colors.chalk}
              fontSize={28}
              fontFamily={theme.fontFamily}
              fontWeight={700}
            >
              {id === 0
                ? blocked
                  ? "Still boarding"
                  : "Delayed bus"
                : blocked
                  ? "Blocked"
                  : bus.state === "board" && bus.boarding > 0
                    ? "Picking up"
                    : "Following bus"}
            </text>
          </g>
        ))}
      </g>
      <g opacity={verdict}>
        <text
          x={540}
          y={1245}
          textAnchor="middle"
          fill={theme.colors.chalk}
          fontFamily={theme.fontFamily}
          fontSize={36}
          fontWeight={700}
        >
          {frame < BLOCK_TO
            ? "One lane. No overtaking."
            : `Blocked for about ${MEASURED.blocked.roundedSeconds} seconds.`}
        </text>
      </g>
    </svg>
  );
};
