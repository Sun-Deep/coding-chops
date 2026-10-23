import { useCurrentFrame } from "remotion";
import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Code } from "./Code";
import { CUES } from "./cues";
import { narration } from "./narration";
import { Stage } from "./Stage";
import "./runs";

export const HEADLINE_TOP = 232;

const Body: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Code frame={frame} />
      <Stage frame={frame} />
    </>
  );
};

/** Every cue and its level are in `cues.ts`. */
export const MontyHallReel: React.FC = () => (
  <VerticalShell>
    <Body />
    <Headline top={HEADLINE_TOP}>
      Three doors, one car.
      <br />
      Stick or switch?
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
