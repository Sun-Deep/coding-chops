import { theme } from "../brand/theme";

/**
 * A line of mono text, centred on a point.
 *
 * Numbers and equations in this track are always centred on something: a day,
 * the frame, a counter slot. Positioning them by their left edge means guessing
 * the width of "-$1" against "5,000,000,000", so the anchor is the centre and
 * the box is drawn around it.
 *
 * Act 1 had this as a local. Act 2 needed the same thing, and a second copy is
 * how two scenes end up with different type in the same slot.
 */
export const Mono: React.FC<{
  children: React.ReactNode;
  /** Horizontal centre. */
  x: number;
  y: number;
  size?: number;
  opacity?: number;
  dy?: number;
  color: string;
  weight?: number;
  /**
   * Box width. Wide by default so long lines never wrap. Narrow it for a slot
   * near the frame edge, where an 800px box would hang off the canvas.
   */
  width?: number;
}> = ({
  children,
  x,
  y,
  size = 46,
  opacity = 1,
  dy = 0,
  color,
  weight = 500,
  width = 800,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - width / 2,
      top: y,
      width,
      textAlign: "center",
      transform: `translateY(${dy}px)`,
      fontFamily: theme.monoFamily,
      fontSize: size,
      fontWeight: weight,
      color,
      opacity,
    }}
  >
    {children}
  </div>
);
