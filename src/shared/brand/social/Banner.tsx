import { AbsoluteFill, useVideoConfig } from "remotion";
import { Lockup } from "../Lockup";
import { TAGLINE } from "../copy";
import { theme } from "../theme";

type BannerProps = {
  /**
   * The centred region every platform promises to show. Everything readable
   * sits inside it; the rest of the canvas is ground that some devices crop
   * away and none of them need.
   */
  safeWidth: number;
  safeHeight: number;
  tagline?: boolean;
};

/**
 * A banner for any platform, sized by its safe area rather than its canvas.
 *
 * Every one of these crops differently: YouTube shows 1546 by 423 on a phone
 * and the whole 2560 by 1440 on a television, Facebook trims the sides on
 * mobile, and X hides the lower left behind the avatar. Driving the layout off
 * the safe area rather than the canvas means one component serves all of them
 * and nothing important lands in a crop.
 */
export const BrandBanner: React.FC<BannerProps> = ({
  safeWidth,
  safeHeight,
  tagline = true,
}) => {
  const { width, height } = useVideoConfig();
  const size = safeHeight * 0.3;

  return (
    <AbsoluteFill
      style={{
        background: theme.colors.black,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: Math.min(safeWidth, width),
          height: Math.min(safeHeight, height),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: safeHeight * 0.085,
        }}
      >
        <Lockup size={size} tone="black" />
        {tagline ? (
          <div
            style={{
              fontFamily: theme.fontFamily,
              fontSize: safeHeight * 0.085,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              lineHeight: 1,
              color: theme.colors.grayDark,
              whiteSpace: "nowrap",
            }}
          >
            {TAGLINE}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
