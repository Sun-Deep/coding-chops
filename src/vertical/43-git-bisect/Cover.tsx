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
import { Change } from "./Change";
import { History, SCENE_TOP } from "./History";
import { RUN } from "./measurements";
import { TERM_TOP, Terminal } from "./Terminal";
import "./runs";

/** The one card left standing, and the line of code it changed. */
export const COVER_FRAME = 360;
const TERM_PLACED = SQUARE_TOP + 184;
const SCENE_PLACED = TERM_PLACED + 296;
const SCALE = 0.92;

export const GitBisectCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      git bisect: {RUN.commits.toLocaleString("en-US")} commits.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      Found in {RUN.steps.length} checks.
    </Headline>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${TERM_PLACED - TERM_TOP}px)`,
      }}
    >
      <Terminal frame={COVER_FRAME + 40} />
    </div>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${WIDTH / 2}px ${SCENE_TOP}px`,
        transform: `translateY(${SCENE_PLACED - SCENE_TOP}px) scale(${SCALE})`,
      }}
    >
      <History
        frame={COVER_FRAME}
        still={`vr43/history-${String(COVER_FRAME).padStart(4, "0")}.png`}
      />
      <Change frame={COVER_FRAME + 40} />
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
