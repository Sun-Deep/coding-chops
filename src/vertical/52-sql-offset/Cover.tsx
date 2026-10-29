import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  WIDTH,
} from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { CODE_H, CODE_TOP, Code } from "./Code";
import { RUN } from "./measurements";
import { SCENE_TOP, Stage } from "./Stage";
import "./runs";

/** Mid-dump: the top rows empty, crates tipping onto the belt, the page waiting. */
export const COVER_FRAME = 120;
const n = (x: number) => x.toLocaleString("en-US");
const CODE_PLACED = SQUARE_TOP + 172;
const SCENE_PLACED = CODE_PLACED + CODE_H + 10;

export const SqlOffsetCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      OFFSET reads {n(RUN.hero.offsetRead)} rows
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      to return {RUN.hero.keysetRead}.
    </Headline>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${CODE_PLACED - CODE_TOP}px)`,
      }}
    >
      <Code frame={COVER_FRAME} />
    </div>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${SCENE_PLACED - SCENE_TOP}px)`,
      }}
    >
      <Stage
        frame={COVER_FRAME}
        still={`vr52/wall-${String(COVER_FRAME).padStart(4, "0")}.png`}
      />
    </div>
    <div
      style={{
        position: "absolute",
        top: SQUARE_BOTTOM - 62,
        left: 0,
        width: WIDTH,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
