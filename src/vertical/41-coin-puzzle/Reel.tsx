import { Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline, Readout } from "../../shared/vertical/type";
import { ACCENT } from "../../shared/vertical/palette";
import { BEATS } from "./beats";
import { MEASURED } from "./measurements";
import { narration } from "./narration";
import { CUES } from "./cues";
import "./runs";

export const CoinScene: React.FC<{ still?: number }> = ({ still }) => (
  <>
    {still === undefined ? (
      <OffthreadVideo
        src={staticFile("vr41/full.mp4")}
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    ) : (
      <Img
        src={staticFile(`vr41/full-${String(still).padStart(4, "0")}.png`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />
    )}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 560,
        background:
          "linear-gradient(#050505 0%, #050505 70%, transparent 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 1300,
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(transparent, #050505 50%)",
      }}
    />
  </>
);

export const CoinPuzzleReel: React.FC = () => {
  const frame = useCurrentFrame();
  const answer = frame >= BEATS.reveal[0];
  const narrowed = frame >= BEATS.keep[0];
  return (
    <VerticalShell>
      <CoinScene />
      <Headline top={232} size={90}>
        {answer ? (
          <>
            Divide
            <br />
            and conquer.
          </>
        ) : (
          <>
            One coin
            <br />
            is lighter.
          </>
        )}
      </Headline>
      <Readout top={442} size={30} color={narrowed ? ACCENT : undefined}>
        {answer
          ? `${MEASURED.candidates[2]} coin · ${MEASURED.weighings} weighings`
          : narrowed
            ? `${MEASURED.candidates[1]} candidates`
            : `${MEASURED.coins} coins · ${MEASURED.weighings} weighings`}
      </Readout>
      <Narration lines={narration} />
      {CUES.map((cue) => (
        <Sfx
          key={cue.id}
          name={cue.name}
          at={cue.frame}
          gain={cue.gain}
          playbackRate={cue.rate}
          durationInFrames={cue.length}
        />
      ))}
    </VerticalShell>
  );
};
