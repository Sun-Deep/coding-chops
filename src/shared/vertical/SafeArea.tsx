import { AbsoluteFill } from "remotion";
import { theme } from "../brand/theme";
import {
  BOTTOM,
  HEIGHT,
  LEFT,
  PORTRAIT_BOTTOM,
  PORTRAIT_TOP,
  RAIL_EDGE,
  RAIL_FROM,
  RIGHT,
  SQUARE_BOTTOM,
  SQUARE_TOP,
  TOP,
  WIDTH,
} from "./geometry";

/**
 * The safe-area overlay, for review.
 *
 * Not part of any cut. Render it as a still, put it over a frame grab in any
 * image viewer, and every reserve in `geometry.ts` becomes visible at once.
 * Checking a vertical layout by eye is how a closing line ends up under a
 * caption bar on one platform and not another.
 */
const Band: React.FC<{
  style: React.CSSProperties;
  label: string;
  color: string;
}> = ({ style, label, color }) => (
  <div
    style={{
      position: "absolute",
      background: `${color}22`,
      border: `2px solid ${color}`,
      fontFamily: theme.monoFamily,
      fontSize: 20,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color,
      padding: 10,
      ...style,
    }}
  >
    {label}
  </div>
);

export const SafeArea: React.FC = () => (
  <AbsoluteFill style={{ background: theme.colors.blackSoft }}>
    <Band
      style={{ left: 0, right: 0, top: 0, height: TOP }}
      label={`header ${TOP}`}
      color={theme.colors.loss}
    />
    <Band
      style={{ left: 0, right: 0, top: BOTTOM, height: HEIGHT - BOTTOM }}
      label={`caption and controls ${HEIGHT - BOTTOM}`}
      color={theme.colors.loss}
    />
    <Band
      style={{
        left: RAIL_EDGE,
        width: WIDTH - RAIL_EDGE,
        top: RAIL_FROM,
        height: BOTTOM - RAIL_FROM,
      }}
      label="rail"
      color={theme.colors.sell}
    />
    <Band
      style={{ left: 0, width: LEFT, top: TOP, height: BOTTOM - TOP }}
      label=""
      color={theme.colors.gray}
    />
    <Band
      style={{ left: RIGHT, right: 0, top: TOP, height: BOTTOM - TOP }}
      label=""
      color={theme.colors.gray}
    />
    <Band
      style={{
        left: 0,
        right: 0,
        top: SQUARE_TOP,
        height: SQUARE_BOTTOM - SQUARE_TOP,
        background: "transparent",
      }}
      label={`cover 1:1  ${SQUARE_TOP} to ${SQUARE_BOTTOM}`}
      color={theme.colors.blueBright}
    />
    <Band
      style={{
        left: 0,
        right: 0,
        top: PORTRAIT_TOP,
        height: PORTRAIT_BOTTOM - PORTRAIT_TOP,
        background: "transparent",
      }}
      label={`cover 3:4`}
      color={theme.colors.gain}
    />
  </AbsoluteFill>
);
