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
import { positionAt } from "./beats";
import { COLUMN_X, panelAt, ROW_Y } from "./grid";
import { MATCHERS, readsAtPosition } from "./search";
import { TextPanel } from "./TextPanel";

/**
 * The frame the cover holds: the end of the sweep, where the left column has
 * read the whole page and the right column has not. Frame zero would be six
 * dark pages and says nothing.
 */
const HELD_FRAME = 298;

const SCALE = 0.78;
const GRID_LEFT = COLUMN_X[0];
const GRID_TOP = ROW_Y[0];
const GRID_WIDTH = 780;
const PLACED_LEFT = (WIDTH - GRID_WIDTH * SCALE) / 2;
const PLACED_TOP = 676;

export const TextSearchCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>Text search</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={76}>
      Ctrl+F.
    </Headline>
    <Headline top={SQUARE_TOP + 162} size={86} color={ACCENT}>
      Six ways.
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
        {MATCHERS.map((matcher, index) => (
          <TextPanel
            key={matcher.key}
            matcher={matcher}
            {...panelAt(index)}
            reads={readsAtPosition(matcher.playback, positionAt(HELD_FRAME))}
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
