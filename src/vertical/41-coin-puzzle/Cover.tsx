import { AbsoluteFill } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { Headline, Readout } from "../../shared/vertical/type";
import { MEASURED } from "./measurements";
import { CoinScene } from "./Reel";

export const COVER_FRAME = 318;
/** The whole balance and every coin remain visible before the answer reveal. */
export const CoinPuzzleCover: React.FC = () => (
  <AbsoluteFill
    style={{
      background: theme.colors.black,
      color: theme.colors.chalk,
      fontFamily: theme.fontFamily,
    }}
  >
    <CoinScene still={COVER_FRAME} />
    <Headline top={444} size={80}>
      {MEASURED.coins} coins.
      <br />
      {MEASURED.weighings} weighings.
    </Headline>
    <Readout top={618} size={28}>
      One is lighter.
    </Readout>
    <div
      style={{
        position: "absolute",
        top: 1420,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
