import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { SQUARE_BOTTOM, SQUARE_TOP } from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline, Label } from "../../shared/vertical/type";
import { WeightPlate, WeightPlateDefs } from "./WeightPlate";

const CoverTower: React.FC = () => (
  <svg
    width={760}
    height={270}
    viewBox="0 0 760 270"
    style={{ position: "absolute", top: SQUARE_TOP + 405, left: 160 }}
  >
    <defs>
      <linearGradient id="cover-peg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#52545A" />
        <stop offset="0.5" stopColor="#D0CDC3" />
        <stop offset="1" stopColor="#37393E" />
      </linearGradient>
      <WeightPlateDefs />
    </defs>
    <polygon points="40,218 664,218 720,246 96,246" fill="#34363C" />
    <polygon points="96,246 720,246 720,265 96,265" fill="#17181B" />
    {[150, 380, 610].map((x) => (
      <rect
        key={x}
        x={x - 7}
        y={42}
        width={14}
        height={180}
        rx={7}
        fill="url(#cover-peg)"
      />
    ))}
    {[4, 3, 2, 1].map((disk, index) => (
      <g
        key={disk}
        transform={`translate(610 ${202 - index * 35}) scale(0.82)`}
      >
        <WeightPlate disk={disk} x={0} y={0} active />
      </g>
    ))}
  </svg>
);

export const TowerOfHanoiCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 44%, #161D2A 0%, ${theme.colors.black} 66%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 56}>Tower of Hanoi · code traversal</Eyebrow>
    <Headline top={SQUARE_TOP + 138} size={104}>
      4 plates.
    </Headline>
    <Headline top={SQUARE_TOP + 252} size={104} color={ACCENT}>
      15 moves.
    </Headline>
    <CoverTower />
    <Label top={SQUARE_TOP + 730}>Every line, every move</Label>
    <div
      style={{
        position: "absolute",
        top: SQUARE_BOTTOM - 62,
        left: 0,
        width: 1080,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
