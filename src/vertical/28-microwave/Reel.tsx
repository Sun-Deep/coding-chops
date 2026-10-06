import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { HEADLINE_TOP, Kitchen } from "./Kitchen";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const MicrowaveReel: React.FC = () => (
  <VerticalShell>
    <Kitchen />
    <Headline top={HEADLINE_TOP}>
      Should quick meals
      <br />
      skip the line?
    </Headline>
    <Narration lines={narration} />
    {CUES.map((cue) => (
      <Sfx
        key={cue.id}
        name={cue.name}
        at={cue.frame}
        gain={cue.gain}
        playbackRate={cue.rate}
        durationInFrames={cue.frames}
      />
    ))}
  </VerticalShell>
);
