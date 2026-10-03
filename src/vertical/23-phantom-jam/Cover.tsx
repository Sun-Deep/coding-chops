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
import { RingRoad } from "./RingRoad";
import { HUMAN } from "./tracks";

/**
 * The human ring with the jam fully formed, at simulated second 60: the
 * stopped cluster glowing red and the average at 14 in the middle. A held
 * moment of the jam, not one mid-pull of the camera.
 */
const HELD_SIM_S = 60;
const R = 250;
const CY = SQUARE_TOP + 640;

export const PhantomJamCover: React.FC = () => (
  <AbsoluteFill
    style={{
      fontFamily: theme.fontFamily,
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 50% 54%, #171E2A 0%, ${theme.colors.black} 70%)`,
    }}
  >
    <Headline top={SQUARE_TOP + 24} size={64}>
      22 cars. No accident.
    </Headline>
    <Headline top={SQUARE_TOP + 92} size={64} color={ACCENT}>
      One brake tap did this.
    </Headline>
    <svg width={WIDTH} height={1920} style={{ position: "absolute", inset: 0 }}>
      <RingRoad
        id="cover"
        cx={WIDTH / 2}
        cy={CY}
        r={R}
        track={HUMAN}
        t={HELD_SIM_S}
        smoother={false}
      />
    </svg>
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
