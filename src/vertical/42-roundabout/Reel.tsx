import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { HEADLINE_TOP, Junctions } from "./Junctions";
import { narration } from "./narration";
import "./runs";

/** Every cue and its level are in `cues.ts`. */
export const RoundaboutReel: React.FC = () => (
  <VerticalShell>
    <Junctions />
    <Headline top={HEADLINE_TOP}>
      Roundabout or lights:
      <br />
      which is faster?
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
