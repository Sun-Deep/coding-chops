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
import { MOVE, MOVE_FROM } from "./beats";
import { DockerLayers } from "./DockerLayers";
import { PACKAGES } from "./measurements";

/**
 * The frame the cover holds: both rebuilds finished, the verdict under each
 * tower and the arrow drawn to the line that moved. Taken after the arrow has
 * landed rather than while it draws, the mid-animation mistake VR14 and VR19's
 * first covers made.
 */
const HELD_FRAME = MOVE_FROM + MOVE + 4;
const SCALE = 0.72;
const SOURCE_TOP = 392;
const PLACED_TOP = 676;

export const DockerLayersCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 46%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Eyebrow top={SQUARE_TOP + 30}>Docker build cache</Eyebrow>
    <Headline top={SQUARE_TOP + 84} size={60}>
      Same app. One line changed.
    </Headline>
    <Headline top={SQUARE_TOP + 148} size={60} color={ACCENT}>
      One reinstalls {PACKAGES} packages.
    </Headline>

    <Sequence from={-HELD_FRAME} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(${SOURCE_TOP}px 0 ${1920 - 1200}px 0)`,
          transformOrigin: `${WIDTH / 2}px ${SOURCE_TOP}px`,
          transform: `translateY(${PLACED_TOP - SOURCE_TOP}px) scale(${SCALE})`,
        }}
      >
        <DockerLayers />
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
