import { useCurrentFrame } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Change } from "./Change";
import { CUES } from "./cues";
import { History } from "./History";
import { narration } from "./narration";
import { Terminal } from "./Terminal";
import "./runs";

export const HEADLINE_TOP = 232;

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Terminal frame={frame} />
      <History frame={frame} />
      <Change frame={frame} />
    </>
  );
};

/** Every cue and its level are in `cues.ts`. */
export const GitBisectReel: React.FC = () => (
  <VerticalShell>
    <Body />
    <Headline top={HEADLINE_TOP}>
      1,000 commits.
      <br />
      Which one broke it?
    </Headline>
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
