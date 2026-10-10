import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { CUES } from "./cues";
import { narration } from "./narration";
import { HEADLINE_TOP, Road } from "./Road";

/** Every cue and its level are in `cues.ts`. */
export const ZipperReel: React.FC = () => (
  <VerticalShell>
    <Road />
    <Headline top={HEADLINE_TOP}>
      Merge early, or drive
      <br />
      to the cones?
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
