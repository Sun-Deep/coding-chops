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
import { COLUMN_X, panelAt, ROW_Y } from "./grid";
import { SEARCHES } from "./maze";
import { SearchPanel } from "./SearchPanel";

/**
 * The frame the cover holds.
 *
 * Late enough that greedy has its route drawn and the other five are still
 * flooding, which is the whole cut in one still. Frame zero would be six
 * identical dark mazes and the last frame would be six identical full ones.
 */
const HELD_FRAME = 250;

const SCALE = 0.8;
const GRID_LEFT = COLUMN_X[0];
const GRID_TOP = ROW_Y[0];
const GRID_WIDTH = 780;
const PLACED_LEFT = (WIDTH - GRID_WIDTH * SCALE) / 2;
const PLACED_TOP = 680;

export const SearchRaceCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>Pathfinding</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      Six searches.
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={86} color={ACCENT}>
      One maze.
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
        {SEARCHES.map((search, index) => (
          <SearchPanel key={search.key} search={search} {...panelAt(index)} />
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
