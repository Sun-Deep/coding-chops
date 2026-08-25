import type { ReactNode } from "react";
import { theme } from "../brand/theme";

type EditorialShotProps = {
  /** 0 to 1. The paper covers over the first half, the contents rise over the second. */
  opacity: number;
  /** 0 to 1 from `settle()`. Drives the shot's move into place. */
  push?: number;
  zIndex?: number;
  children: ReactNode;
};

/**
 * A full-frame teaching shot laid over the stage.
 *
 * The backdrop is its own layer rather than a background on the contents, so
 * that what sits on the paper can never be composited against the stage. It
 * also leads: the paper is solid by the halfway point, and only then do the
 * contents start coming up. Paired with `stageBehind`, which clears the stage
 * over that same first half, the hand-off never shows both at once.
 *
 * `push` carries the shot's own move, so the hand-off has something moving in
 * it rather than being a straight dip between two static frames. The outgoing
 * shot drifts up and through as the incoming one rises, which is what makes the
 * change read as a camera move rather than a blink.
 *
 * Consecutive shots are kept from overlapping by `deck()`, where the opacities
 * are computed: two shots in a hand-off sum to one, so only one of them can be
 * past the halfway point, and only one of them can be drawing contents.
 */
/**
 * The margin box for flow content inside a shot.
 *
 * A shot is a full-bleed `inset: 0` layer, which is what absolutely positioned
 * elements need. Anything laid out in normal flow therefore starts hard against
 * the top left corner and runs off the frame — which is exactly what happened to
 * three separate panels before this existed. Flow content goes through here.
 */
export const EditorialCopy: React.FC<{
  top: number;
  children: ReactNode;
}> = ({ top, children }) => (
  <div style={{ position: "absolute", left: 132, right: 132, top }}>
    {children}
  </div>
);

export const EditorialShot: React.FC<EditorialShotProps> = ({
  opacity,
  push = 1,
  zIndex = 6,
  children,
}) => {
  // `push` is still climbing while the opacity is already up, so it only ever
  // leads on the way in. Once it has landed, any opacity left to lose means the
  // shot is on its way out — which is where the drift comes from.
  const leaving = Math.max(0, Math.min(1, push - opacity));

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: Math.min(1, opacity * 2),
          zIndex: zIndex - 1,
          background: theme.colors.paper,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: Math.max(0, opacity * 2 - 1),
          zIndex,
          transform: `translateY(${(1 - push) * 26 - leaving * 22}px) scale(${0.988 + push * 0.012 + leaving * 0.022})`,
          transformOrigin: "50% 44%",
          overflow: "hidden",
          fontFamily: theme.fontFamily,
          color: theme.colors.ink,
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </>
  );
};
