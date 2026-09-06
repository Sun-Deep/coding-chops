import { AbsoluteFill, useVideoConfig } from "remotion";
import { Mark } from "../Mark";
import { theme } from "../theme";
import { HEIGHT, WIDTH } from "../geometry";

/**
 * The square avatar, for every platform that asks for one.
 *
 * All of them crop it to a circle, so the mark is set to 60 percent of the
 * width. The corners of its bounding box then sit at 0.38 of the width from
 * the centre, comfortably inside the 0.5 the circle allows, and it still has
 * presence at the 32 pixels a feed actually renders.
 *
 * Near black rather than orange, because the mark has to survive a column of
 * mostly white avatars and the dark ground is what separates it.
 */
export const BrandAvatar: React.FC = () => {
  const { width } = useVideoConfig();
  const markWidth = width * 0.6;

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.black,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Mark
        height={(markWidth * HEIGHT) / WIDTH}
        color={theme.colors.orangeBright}
      />
    </AbsoluteFill>
  );
};
