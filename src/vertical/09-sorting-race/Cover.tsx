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
import { SortPanel } from "./SortPanel";
import { ALGORITHMS } from "./sorting";

/**
 * The frame the cover holds.
 *
 * Chosen because it is the one moment that carries the whole cut in a still:
 * quicksort, merge and heap are already sorted and stamped, and bubble,
 * selection and insertion are still visibly noise. A cover taken at frame zero
 * would be six identical fields of noise, which says nothing, and one taken at
 * the end would be six identical staircases, which says less.
 */
const HELD_FRAME = 200;

/**
 * The grid, shrunk to clear the profile crops.
 *
 * The reel's grid runs from 410 to 1298 and the square crop starts at 420, so
 * the live layout would lose its top row on TikTok and Instagram. Rather than
 * lay the panels out twice, the same six are scaled into the square.
 */
const SCALE = 0.8;
const GRID_LEFT = COLUMN_X[0];
const GRID_TOP = ROW_Y[0];
const GRID_WIDTH = 780;
const PLACED_LEFT = (WIDTH - GRID_WIDTH * SCALE) / 2;
const PLACED_TOP = 680;

export const SortingRaceCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>Sorting algorithms</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      Six sorts.
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={86} color={ACCENT}>
      One clock.
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
        {ALGORITHMS.map((algorithm, index) => (
          <SortPanel
            key={algorithm.key}
            algorithm={algorithm}
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
