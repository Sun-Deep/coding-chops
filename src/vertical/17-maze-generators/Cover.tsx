import { AbsoluteFill, Sequence } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  WIDTH,
} from "../../shared/vertical/geometry";
import { ACCENT } from "../../shared/vertical/palette";
import { Eyebrow, Headline } from "../../shared/vertical/type";
import { routeDoneAt } from "./beats";
import { COLUMN_X, panelAt, ROW_Y } from "./grid";
import { GENERATORS } from "./maze";
import { MazePanel } from "./MazePanel";
import { RUNS } from "./measurements";

/**
 * The frame the cover holds: every maze dug and every route drawn, so the six
 * shapes and the six routes are both in one still. Taken after the longest
 * route has finished drawing, not during it, because VR14's cover shipped holding a frame
 * mid-animation.
 */
const HELD_FRAME = routeDoneAt(RUNS.depthFirst.route) + 4;

const SCALE = 0.8;
const GRID_LEFT = COLUMN_X[0];
const GRID_TOP = ROW_Y[0];
const GRID_WIDTH = 780;
const PLACED_LEFT = (WIDTH - GRID_WIDTH * SCALE) / 2;
const PLACED_TOP = 680;

export const MazeGeneratorsCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>Maze generation</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      Six ways to build a maze.
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={80} color={ACCENT}>
      One you can solve blind.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${GRID_LEFT}px ${GRID_TOP}px`,
          transform:
            `translate(${PLACED_LEFT - GRID_LEFT}px, ` +
            `${PLACED_TOP - GRID_TOP}px) scale(${SCALE})`,
        }}
      >
        {GENERATORS.map((generator, index) => (
          <MazePanel
            key={generator.key}
            generator={generator}
            {...panelAt(index)}
          />
        ))}
      </div>
    </Sequence>

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
