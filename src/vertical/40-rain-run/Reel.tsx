import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { Footsteps } from "./Footsteps";
import { narration } from "./narration";
import "./runs";
import { HEADLINE_TOP, Street } from "./Street";

/** Every cue and its level are in `cues.ts`. */
export const RainRunReel: React.FC = () => (
  <VerticalShell>
    <Street />
    <Headline top={HEADLINE_TOP}>
      Caught in the rain:
      <br />
      walk or run?
    </Headline>
    <Narration lines={narration} />
    <Footsteps gait="walk" />
    <Footsteps gait="run" />
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
