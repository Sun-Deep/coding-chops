import { AbsoluteFill } from "remotion";
import { Mark } from "../../../shared/brand/Mark";
import { theme } from "../../../shared/brand/theme";
import { PackagingChart } from "./PackagingChart";

/**
 * One numeric choice and one chart. The title names the problem, so the still
 * spends its limited feed-size space on the cost difference the lesson proves.
 */
export const BuyAndSellThumbnail: React.FC = () => (
  <AbsoluteFill
    style={{
      overflow: "hidden",
      color: theme.colors.chalk,
      background: `radial-gradient(circle at 58% 46%, #141820 0%, ${theme.colors.black} 68%)`,
      fontFamily: theme.fontFamily,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 80,
        width: 670,
        fontWeight: 800,
        letterSpacing: "-0.055em",
        lineHeight: 0.9,
      }}
    >
      <div
        style={{
          fontFamily: theme.monoFamily,
          fontSize: 112,
          fontWeight: 700,
          letterSpacing: "-0.07em",
          whiteSpace: "nowrap",
        }}
      >
        5 billion
      </div>
      <div style={{ marginTop: 12, fontSize: 88 }}>checks, or</div>
      <div
        style={{
          marginTop: 18,
          color: theme.colors.orangeBright,
          fontFamily: theme.monoFamily,
          fontSize: 126,
          fontWeight: 700,
          letterSpacing: "-0.08em",
          whiteSpace: "nowrap",
        }}
      >
        100,000
      </div>
    </div>

    <div style={{ position: "absolute", left: 728, top: 145 }}>
      <PackagingChart width={492} height={360} strokeWidth={3.5} />
    </div>

    <div style={{ position: "absolute", left: 70, bottom: 54 }}>
      <Mark height={64} color={theme.colors.chalk} />
    </div>
  </AbsoluteFill>
);
