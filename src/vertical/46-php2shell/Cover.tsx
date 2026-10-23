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
import { PANEL_TOP, Panel } from "./Panel";
import { SCENE_TOP, Stage } from "./Stage";

/** The server taken over, over the three things to do. */
export const COVER_FRAME = 280;
const PANEL_PLACED = SQUARE_TOP + 184;
const SCENE_PLACED = PANEL_PLACED + 296;
const SCALE = 0.92;

export const Php2ShellCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: theme.colors.black,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      PHP2Shell: one request,
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      no login, server taken.
    </Headline>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translateY(${PANEL_PLACED - PANEL_TOP}px)`,
      }}
    >
      <Panel frame={449} />
    </div>
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: `${WIDTH / 2}px ${SCENE_TOP}px`,
        transform: `translateY(${SCENE_PLACED - SCENE_TOP}px) scale(${SCALE})`,
      }}
    >
      <Stage
        frame={COVER_FRAME}
        still={`vr46/server-${String(COVER_FRAME).padStart(4, "0")}.png`}
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
