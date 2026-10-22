import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { HEADLINE_TOP, Ramp } from "./Ramp";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const RoadsterRollReel: React.FC = () => (
  <VerticalShell>
    <Ramp />
    <Headline top={HEADLINE_TOP}>
      Tesla Roadster: how
      <br />
      did it land upright?
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
