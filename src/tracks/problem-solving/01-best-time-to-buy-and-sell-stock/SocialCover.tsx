import { AbsoluteFill } from "remotion";
import { Mark } from "../../../shared/brand/Mark";
import { theme } from "../../../shared/brand/theme";
import {
  SQUARE_BOTTOM,
  SQUARE_TOP,
  columnLeft,
  columnWidth,
} from "../../../shared/vertical/geometry";
import { ACCENT } from "../../../shared/vertical/palette";
import { PackagingChart } from "./PackagingChart";

export type BuyAndSellCoverPart = 1 | 2 | 3 | 4;

type BuyAndSellSocialCoverProps = {
  part?: BuyAndSellCoverPart;
};

const PART_TITLES: Record<
  BuyAndSellCoverPart,
  {
    lines: readonly string[];
    accentLine: number;
    monoLines?: readonly number[];
    size?: number;
  }
> = {
  1: {
    lines: ["Six prices.", "Five billion", "checks."],
    accentLine: 1,
    monoLines: [1],
    size: 92,
  },
  2: { lines: ["Keep one", "price."], accentLine: 1 },
  3: { lines: ["Two numbers,", "one pass."], accentLine: 1 },
  4: { lines: ["Wrong answer,", "no error."], accentLine: 1, size: 96 },
};

const PartTitle: React.FC<{ part: BuyAndSellCoverPart }> = ({ part }) => {
  const title = PART_TITLES[part];

  return (
    <div
      style={{
        position: "absolute",
        top: SQUARE_TOP + 254,
        left: 96,
        width: 888,
        textAlign: "center",
        color: theme.colors.chalk,
        fontFamily: theme.fontFamily,
        fontSize: title.size ?? 102,
        fontWeight: 800,
        letterSpacing: "-0.055em",
        lineHeight: 0.94,
      }}
    >
      {title.lines.map((line, index) => (
        <div
          key={line}
          style={{
            color: index === title.accentLine ? ACCENT : theme.colors.chalk,
            fontFamily: title.monoLines?.includes(index)
              ? theme.monoFamily
              : theme.fontFamily,
            fontWeight: title.monoLines?.includes(index) ? 700 : 800,
            letterSpacing: title.monoLines?.includes(index)
              ? "-0.07em"
              : "-0.055em",
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

const EpisodeTitle: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: SQUARE_TOP + 234,
      left: 96,
      width: 888,
      textAlign: "center",
      color: theme.colors.chalk,
      fontFamily: theme.fontFamily,
      fontSize: 96,
      fontWeight: 800,
      letterSpacing: "-0.055em",
      lineHeight: 0.94,
    }}
  >
    <span
      style={{
        fontFamily: theme.monoFamily,
        fontWeight: 700,
        letterSpacing: "-0.07em",
      }}
    >
      5 billion
    </span>
    <br />
    checks, or
    <br />
    <span
      style={{
        color: ACCENT,
        fontFamily: theme.monoFamily,
        fontWeight: 700,
        letterSpacing: "-0.075em",
      }}
    >
      100,000
    </span>
  </div>
);

/**
 * One vertical cover for Facebook Reels, Instagram Reels, TikTok and Shorts.
 * Every meaningful element stays inside the centered square because TikTok's
 * profile grid crops harder than the 9:16 feed.
 */
export const BuyAndSellSocialCover: React.FC<BuyAndSellSocialCoverProps> = ({
  part,
}) => {
  const chartTop = SQUARE_TOP + 570;
  const chartWidth = columnWidth(chartTop);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        color: theme.colors.chalk,
        backgroundColor: theme.colors.black,
        fontFamily: theme.fontFamily,
        isolation: "isolate",
      }}
    >
      <AbsoluteFill
        style={{
          zIndex: 0,
          background: `radial-gradient(circle at 50% 50%, #141820 0%, ${theme.colors.black} 68%)`,
        }}
      />
      <AbsoluteFill style={{ zIndex: 1 }}>
        {part ? (
          <>
            <div
              style={{
                position: "absolute",
                top: SQUARE_TOP + 86,
                left: 96,
                width: 888,
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 18,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  color: theme.colors.grayDark,
                  fontSize: 30,
                  fontWeight: 600,
                  letterSpacing: "0.26em",
                }}
              >
                Part
              </span>
              <span
                style={{
                  color: ACCENT,
                  fontFamily: theme.monoFamily,
                  fontSize: 118,
                  fontWeight: 700,
                  letterSpacing: "-0.075em",
                  lineHeight: 1,
                }}
              >
                {String(part).padStart(2, "0")}
              </span>
            </div>
            <PartTitle part={part} />
          </>
        ) : (
          <EpisodeTitle />
        )}

        <div
          style={{
            position: "absolute",
            top: chartTop,
            left: columnLeft(chartTop),
          }}
        >
          <PackagingChart width={chartWidth} height={390} strokeWidth={4} />
        </div>

        <div
          style={{
            position: "absolute",
            top: SQUARE_BOTTOM - 96,
            left: 0,
            width: 1080,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Mark height={76} color={theme.colors.chalk} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const BuyAndSellSocialCoverPart01: React.FC = () => (
  <BuyAndSellSocialCover part={1} />
);

export const BuyAndSellSocialCoverPart02: React.FC = () => (
  <BuyAndSellSocialCover part={2} />
);

export const BuyAndSellSocialCoverPart03: React.FC = () => (
  <BuyAndSellSocialCover part={3} />
);

export const BuyAndSellSocialCoverPart04: React.FC = () => (
  <BuyAndSellSocialCover part={4} />
);
