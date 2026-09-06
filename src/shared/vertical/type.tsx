import type { CSSProperties, ReactNode } from "react";
import { theme } from "../brand/theme";
import { LEFT, RIGHT, columnLeft, columnWidth } from "./geometry";

/**
 * The vertical type scale.
 *
 * Two hierarchies per frame, the same as the horizontal standard asks for: one
 * large statement and one quiet editorial line. The sizes are bigger than the
 * horizontal equivalents relative to the frame, because a 1080 wide frame is
 * about 380 points on a phone and anything set for a laptop disappears.
 *
 * Everything positions from `top` and centres in a column that clears the
 * platform's action rail, so no shot has to remember where the buttons are.
 */

const block = (top: number, extra?: CSSProperties): CSSProperties => ({
  position: "absolute",
  top,
  left: columnLeft(top),
  width: columnWidth(top),
  textAlign: "center",
  ...extra,
});

/** The category line above a headline. Uppercase mono, wide, quiet. */
export const Eyebrow: React.FC<{
  children: ReactNode;
  top: number;
  opacity?: number;
}> = ({ children, top, opacity = 1 }) => (
  <div
    style={block(top, {
      opacity,
      fontFamily: theme.monoFamily,
      fontSize: 21,
      fontWeight: 500,
      letterSpacing: "0.26em",
      textTransform: "uppercase",
      color: theme.colors.grayDark,
    })}
  >
    {children}
  </div>
);

/** The statement. One or two short lines, never three. */
export const Headline: React.FC<{
  children: ReactNode;
  top: number;
  size?: number;
  opacity?: number;
  dy?: number;
  color?: string;
}> = ({
  children,
  top,
  size = 84,
  opacity = 1,
  dy = 0,
  color = theme.colors.chalk,
}) => (
  <div
    style={block(top, {
      opacity,
      transform: `translateY(${dy}px)`,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: "-0.05em",
      lineHeight: 0.98,
      color,
    })}
  >
    {children}
  </div>
);

/** A label over a lane or a diagram. Uppercase mono, tighter than the eyebrow. */
export const Label: React.FC<{
  children: ReactNode;
  top: number;
  opacity?: number;
  color?: string;
}> = ({ children, top, opacity = 1, color = theme.colors.gray }) => (
  <div
    style={block(top, {
      opacity,
      fontFamily: theme.monoFamily,
      fontSize: 23,
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color,
    })}
  >
    {children}
  </div>
);

/** A measured value, in the same material as the code it came out of. */
export const Readout: React.FC<{
  children: ReactNode;
  top: number;
  size?: number;
  opacity?: number;
  dy?: number;
  color?: string;
  weight?: number;
}> = ({
  children,
  top,
  size = 56,
  opacity = 1,
  dy = 0,
  color = theme.colors.chalk,
  weight = 500,
}) => (
  <div
    style={block(top, {
      opacity,
      transform: `translateY(${dy}px)`,
      fontFamily: theme.monoFamily,
      fontSize: size,
      fontWeight: weight,
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
      fontVariantNumeric: "tabular-nums",
      color,
    })}
  >
    {children}
  </div>
);

/** The line where the measurement becomes a point. Two lines at most. */
export const Punch: React.FC<{
  children: ReactNode;
  top: number;
  opacity?: number;
  dy?: number;
  size?: number;
}> = ({ children, top, opacity = 1, dy = 0, size = 60 }) => (
  <div
    style={block(top, {
      opacity,
      transform: `translateY(${dy}px)`,
      fontSize: size,
      fontWeight: 800,
      letterSpacing: "-0.045em",
      lineHeight: 1.08,
      color: theme.colors.chalk,
    })}
  >
    {children}
  </div>
);

/**
 * The conditions a number was measured under.
 *
 * The production standard requires illustrative numbers to be labelled. Every
 * number in a vertical cut is measured rather than illustrative, so this says
 * where it came from instead, which is the stronger claim and the one a
 * comment thread will ask for.
 */
export const Provenance: React.FC<{
  children: ReactNode;
  top: number;
  opacity?: number;
}> = ({ children, top, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: LEFT,
      width: RIGHT - LEFT,
      textAlign: "center",
      opacity,
      fontFamily: theme.monoFamily,
      fontSize: 19,
      fontWeight: 400,
      letterSpacing: "0.06em",
      color: theme.colors.grayDark,
    }}
  >
    {children}
  </div>
);
