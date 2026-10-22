import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { MEASURED } from "./measurements";
import { Bus, Person } from "./Street";

export const BusBunchingCover: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 50% 52%, #242A30 0%, #101317 37%, #050505 70%)",
      fontFamily: theme.fontFamily,
    }}
  >
    <Headline top={480} size={88}>
      One late bus.
      <br />
      Then both together.
    </Headline>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
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
        <linearGradient id="cover-pavement" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#262B30" stopOpacity={0} />
          <stop offset="1" stopColor="#303438" />
        </linearGradient>
        <linearGradient id="cover-road" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#222628" />
          <stop offset="1" stopColor="#111417" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="cover-curb">
          <stop stopColor="#8A8D8F" stopOpacity={0} />
          <stop offset="0.2" stopColor="#8A8D8F" stopOpacity={0.7} />
          <stop offset="0.8" stopColor="#8A8D8F" stopOpacity={0.7} />
          <stop offset="1" stopColor="#8A8D8F" stopOpacity={0} />
        </linearGradient>
        <clipPath id="cover-hero">
          <rect x={108} y={730} width={822} height={550} />
        </clipPath>
      </defs>
      <rect y={860} width={1080} height={158} fill="url(#cover-pavement)" />
      <rect y={1018} width={1080} height={290} fill="url(#cover-road)" />
      <path d="M0 1008H1080" stroke="url(#cover-curb)" strokeWidth={5} />
      <path d="M0 1016H1080" stroke="#0C0E10" strokeWidth={9} />
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d={`M${118 + i * 120} 1228h54`}
          stroke="#C8C7C2"
          strokeWidth={5}
          opacity={0.18}
        />
      ))}
      <g clipPath="url(#cover-hero)">
        <path d="M895 804V997" stroke="#81868B" strokeWidth={6} />
        <rect x={862} y={751} width={66} height={70} rx={9} fill="#E3E1D9" />
        <rect x={874} y={768} width={42} height={29} rx={5} fill="#343C42" />
        <path d="M881 776H909" stroke="#D7D8D3" strokeWidth={3} />
        <circle cx={882} cy={801} r={4} fill="#343C42" />
        <circle cx={908} cy={801} r={4} fill="#343C42" />
        {Array.from({ length: MEASURED.nextQueue }, (_, index) => {
          const row = 2 - Math.floor(index / 5);
          const column = index % 5;
          return (
            <g
              key={index}
              transform={`translate(${829 - column * 35 + row * 5} ${944 - row * 62}) scale(1.25)`}
            >
              <Person x={0} y={0} light={index % 3 === 0} />
            </g>
          );
        })}
        <g transform="translate(875 964) scale(1.25)">
          <Person x={0} y={0} light />
        </g>
        <g transform="translate(335 1040) scale(1.55)">
          <Bus x={0} y={0} time={0} brakeLight={1} headlightFlash={1} />
        </g>
        <g transform="translate(725 1040) scale(1.55)">
          <Bus x={0} y={0} time={0} orange door brakeLight={1} />
        </g>
      </g>
    </svg>
    <div
      style={{
        position: "absolute",
        top: 1370,
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={34} tone="black" />
    </div>
  </AbsoluteFill>
);
