import { Img, OffthreadVideo, staticFile } from "remotion";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline, Readout } from "../../shared/vertical/type";
import { MEASURED } from "./measurements";
import { narration } from "./narration";
import "./runs";

/** A still and the first weighing, before building the rest of the new look. */
export const CoinPuzzlePreview: React.FC<{ still?: boolean }> = ({
  still = false,
}) => (
  <VerticalShell>
    {still ? (
      <Img
        src={staticFile("vr41/preview-0116.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    ) : (
      <OffthreadVideo
        src={staticFile("vr41/preview.mp4")}
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    )}
    <Headline top={232} size={90}>
      One coin
      <br />
      is lighter.
    </Headline>
    <Readout top={442} size={30}>
      {MEASURED.coins} coins · {MEASURED.weighings} weighings
    </Readout>
    {still ? (
      <Headline top={1370} size={50}>
        The higher side is lighter.
      </Headline>
    ) : (
      <Narration lines={narration} />
    )}
  </VerticalShell>
);

export const CoinPuzzleLook: React.FC = () => <CoinPuzzlePreview still />;
