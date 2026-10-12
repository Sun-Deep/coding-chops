import { AbsoluteFill, Sequence } from "remotion";
import { Lockup } from "../../shared/brand/Lockup";
import { theme } from "../../shared/brand/theme";
import { ACCENT } from "../../shared/vertical/palette";
import { Headline } from "../../shared/vertical/type";
import { Buffet } from "./Buffet";
import { MEASURED } from "./measurements";

export const BuffetCover: React.FC = () => (
  <AbsoluteFill
    style={{
      background: theme.colors.black,
      color: theme.colors.chalk,
      fontFamily: theme.fontFamily,
    }}
  >
    <Headline top={444} size={68}>
      Skip the buffet line.
    </Headline>
    <Headline top={520} size={68} color={ACCENT}>
      {MEASURED.average.ratio.toFixed(1)}x faster on average.
    </Headline>
    <Sequence from={-36} layout="none">
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "inset(450px 0 650px 0)",
          transformOrigin: "540px 450px",
          transform: "translateY(155px) scale(0.94)",
        }}
      >
        <Buffet />
      </div>
    </Sequence>
    <div
      style={{
        position: "absolute",
        top: 1438,
        width: 1080,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Lockup size={30} tone="black" />
    </div>
  </AbsoluteFill>
);
