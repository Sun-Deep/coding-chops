import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { Gym, HEADLINE_TOP } from "./Gym";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const GymReel: React.FC = () => (
  <VerticalShell>
    <Gym />
    <Headline top={HEADLINE_TOP}>
      Share the bench
      <br />
      while you rest?
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
