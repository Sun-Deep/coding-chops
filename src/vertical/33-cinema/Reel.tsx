import { Sfx } from "../../shared/primitives/Sfx";
import { Narration } from "../../shared/vertical/Narration";
import { VerticalShell } from "../../shared/vertical/VerticalShell";
import { Headline } from "../../shared/vertical/type";
import { Cinema, HEADLINE_TOP } from "./Cinema";
import { CUES } from "./cues";
import { narration } from "./narration";

/** Every cue and its level are in `cues.ts`. */
export const CinemaReel: React.FC = () => (
  <VerticalShell>
    <Cinema />
    <Headline top={HEADLINE_TOP}>
      Should you leave a seat
      <br />
      between strangers?
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
